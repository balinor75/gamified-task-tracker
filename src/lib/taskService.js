import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';
import { db } from './firebase';
import { todayKey, toDateKey } from './dateUtils';
import { calculateStatsUpdate } from './statsService';

const TASKS = 'tasks';

/**
 * Add a new task for the authenticated user.
 */
export async function addTask(uid, title, difficulty = 'easy', deadline = null, type = 'task') {
  return addDoc(collection(db, TASKS), {
    title: title.trim(),
    user_id: uid,
    completed: false,
    created_at: serverTimestamp(),
    completed_at: null,
    difficulty, // Phase 2
    deadline,   // Phase 2
    subtasks: [], // Phase 1
    type,       // Phase 4: 'task' | 'habit'
  });
}

/**
 * Toggle the completed status of a task.
 * Also syncs subtasks completion status if provided.
 */
export async function toggleTaskComplete(taskId, currentlyCompleted, currentSubtasks = []) {
  const ref = doc(db, TASKS, taskId);
  const isNowCompleted = !currentlyCompleted;
  
  const updates = {
    completed: isNowCompleted,
    completed_at: isNowCompleted ? serverTimestamp() : null,
  };

  // If a task is fully completed or reopened, auto-sync its subtasks
  if (currentSubtasks && currentSubtasks.length > 0) {
    updates.subtasks = currentSubtasks.map(st => ({
      ...st,
      completed: isNowCompleted
    }));
  }

  return updateDoc(ref, updates);
}

/**
 * ATOMIC COMPLETION: Completes a task and updates user stats in a single transaction.
 * Prevents race conditions and ensures rewards are always granted.
 */
export async function completeTaskWithRewards(uid, taskId) {
  const taskRef = doc(db, TASKS, taskId);
  const statsRef = doc(db, 'user_stats', uid);

  return await runTransaction(db, async (transaction) => {
    // 1. Get Task
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const taskData = taskSnap.data();

    // Safety: don't reward twice.
    // Exception: habits reset daily (lazy-reset is client-side only).
    // Firestore still holds completed:true from a previous day, so we must
    // check the actual completion date before blocking the re-completion.
    if (taskData.completed) {
      if (taskData.type !== 'habit') return { alreadyCompleted: true };
      // For habits: only block if already completed TODAY
      const completedDate = toDateKey(taskData.completed_at);
      if (completedDate === todayKey()) return { alreadyCompleted: true };
      // Otherwise it's a new day — proceed with re-completion
    }

    // 2. Get Stats
    const statsSnap = await transaction.get(statsRef);
    const statsData = statsSnap.exists() ? statsSnap.data() : {
      user_id: uid,
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      last_activity_date: null,
      coins: 0,
      xp: 0,
      inventory: {},
    };

    // 3. Calculate updates
    const statsUpdates = calculateStatsUpdate(statsData, taskData);
    
    // 4. Perform Updates
    transaction.update(taskRef, {
      completed: true,
      completed_at: serverTimestamp()
    });

    if (!statsSnap.exists()) {
      statsUpdates.user_id = uid;
      statsUpdates.inventory = {};
      transaction.set(statsRef, statsUpdates);
    } else {
      transaction.update(statsRef, statsUpdates);
    }

    return statsUpdates;
  });
}

/**
 * Generic update for any task fields (e.g. updating the subtasks array).
 */
export async function updateTask(taskId, updates) {
  const ref = doc(db, TASKS, taskId);
  return updateDoc(ref, updates);
}

/**
 * Delete a task.
 */
export async function deleteTask(taskId) {
  return deleteDoc(doc(db, TASKS, taskId));
}

/**
 * ATOMIC SUBTASK TOGGLE: Toggles a subtask and updates stats (2 XP, 5 Coins).
 */
export async function toggleSubtaskWithRewards(uid, taskId, subtaskId) {
  const taskRef = doc(db, TASKS, taskId);
  const statsRef = doc(db, 'user_stats', uid);

  return await runTransaction(db, async (transaction) => {
    // 1. Get Task
    const taskSnap = await transaction.get(taskRef);
    if (!taskSnap.exists()) throw new Error("Task not found");
    const taskData = taskSnap.data();

    // 2. Get Stats
    const statsSnap = await transaction.get(statsRef);
    const statsData = statsSnap.exists() ? statsSnap.data() : {
      user_id: uid,
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      last_activity_date: null,
      coins: 0,
      xp: 0,
      inventory: {},
    };

    // 3. Update Subtasks
    let isCompleting = false;
    const updatedSubtasks = taskData.subtasks.map(st => {
      if (st.id === subtaskId) {
        isCompleting = !st.completed;
        return { ...st, completed: isCompleting };
      }
      return st;
    });

    // 4. Calculate Stats Change
    const xpDiff = isCompleting ? 2 : -2;
    const coinDiff = isCompleting ? 5 : -5;

    const newXp = Math.max(0, (Number(statsData.xp) || 0) + xpDiff);
    const newCoins = Math.max(0, (Number(statsData.coins) || 0) + coinDiff);

    // 5. Apply Updates
    transaction.update(taskRef, { subtasks: updatedSubtasks });
    
    if (!statsSnap.exists()) {
      transaction.set(statsRef, { ...statsData, xp: newXp, coins: newCoins });
    } else {
      transaction.update(statsRef, { xp: newXp, coins: newCoins });
    }

    return { xp: newXp, coins: newCoins };
  });
}

/**
 * Subscribe to real-time updates for a user's tasks.
 * Applies "Lazy Reset" to habits completed on previous days.
 * Returns an unsubscribe function.
 */
export function subscribeTasks(uid, callback) {
  const q = query(
    collection(db, TASKS),
    where('user_id', '==', uid),
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const today = todayKey();
      
      const tasks = snapshot.docs.map((d) => {
        let data = d.data();
        let isCompleted = data.completed;
        
        // Lazy-Reset for habits
        // Guard: skip reset if completed_at is still a pending serverTimestamp
        // (FieldValue objects have no toMillis/toDate and toDateKey returns null).
        if (data.type === 'habit' && isCompleted && data.completed_at) {
          const completedDate = toDateKey(data.completed_at);
          // completedDate is null when the Firestore Timestamp hasn't resolved
          // yet (local pending write). In that case we treat it as "today" and
          // do NOT reset, avoiding the immediate-un-complete flicker.
          if (completedDate !== null && completedDate !== today) {
            isCompleted = false; // Override client-side
          }
        }

        return {
          id: d.id,
          ...data,
          completed: isCompleted // Injected mutated completed status
        };
      });
      
      // Sort client-side: newest first (avoids composite index requirement)
      tasks.sort((a, b) => {
        const ta = a.created_at?.toMillis?.() ?? 0;
        const tb = b.created_at?.toMillis?.() ?? 0;
        return tb - ta;
      });
      
      callback(tasks);
    },
    (error) => {
      console.error('Tasks subscription error:', error);
      callback([]);
    }
  );
}
