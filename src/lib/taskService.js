import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  orderBy,
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
    orderBy('created_at', 'desc'),
  );
  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
    callback(tasks);
  });
}
