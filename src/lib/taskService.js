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

const TASKS = 'tasks';

/**
 * Add a new task for the authenticated user.
 */
export async function addTask(uid, title) {
  return addDoc(collection(db, TASKS), {
    title: title.trim(),
    user_id: uid,
    completed: false,
    created_at: serverTimestamp(),
    completed_at: null,
  });
}

/**
 * Toggle the completed status of a task.
 */
export async function toggleTaskComplete(taskId, currentlyCompleted) {
  const ref = doc(db, TASKS, taskId);
  return updateDoc(ref, {
    completed: !currentlyCompleted,
    completed_at: !currentlyCompleted ? serverTimestamp() : null,
  });
}

/**
 * Delete a task.
 */
export async function deleteTask(taskId) {
  return deleteDoc(doc(db, TASKS, taskId));
}

/**
 * Subscribe to real-time updates for a user's tasks.
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
      const tasks = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
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
      // Return empty list so the UI doesn't hang on spinner
      callback([]);
    }
  );
}
