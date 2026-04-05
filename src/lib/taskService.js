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
} from 'firebase/firestore';
import { db } from './firebase';
import { todayKey, toDateKey } from './dateUtils';

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
        if (data.type === 'habit' && isCompleted && data.completed_at) {
          const completedDate = toDateKey(data.completed_at);
          if (completedDate !== today) {
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
