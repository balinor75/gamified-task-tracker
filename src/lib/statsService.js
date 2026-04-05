import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const STATS_COL = 'user_stats';

/**
 * Normalize a JS Date or Firestore Timestamp to a YYYY-MM-DD string
 * in the user's local timezone.
 */
function toDateKey(dateOrTimestamp) {
  let d;
  if (dateOrTimestamp instanceof Timestamp) {
    d = dateOrTimestamp.toDate();
  } else if (dateOrTimestamp instanceof Date) {
    d = dateOrTimestamp;
  } else {
    return null;
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Get today's date key in the user's local timezone.
 */
function todayKey() {
  const now = new Date();
  // Use local date parts to avoid timezone drift
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get yesterday's date key in the user's local timezone.
 */
function yesterdayKey() {
  const now = new Date();
  now.setDate(now.getDate() - 1);
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get or create the stats document for a user.
 * The document ID is the user's UID.
 */
export async function getOrCreateStats(uid) {
  const ref = doc(db, STATS_COL, uid);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  // Create default stats
  const defaults = {
    user_id: uid,
    current_streak: 0,
    longest_streak: 0,
    total_completed: 0,
    last_activity_date: null,
    coins: 0,
    inventory: {},
  };

  await setDoc(ref, defaults);
  return { id: uid, ...defaults };
}

/**
 * Called when a user completes a task.
 * Updates streak logic, increments total_completed, and awards coins.
 */
export async function updateStatsOnComplete(uid, task) {
  const ref = doc(db, STATS_COL, uid);
  const snap = await getDoc(ref);

  let stats;
  if (!snap.exists()) {
    stats = {
      user_id: uid,
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      last_activity_date: null,
      coins: 0,
      inventory: {},
    };
  } else {
    stats = snap.data();
    // Migrazione al volo per vecchi documenti
    if (stats.coins === undefined) stats.coins = 0;
    if (stats.inventory === undefined) stats.inventory = {};
  }

  const today = todayKey();
  const yesterday = yesterdayKey();
  const lastKey = stats.last_activity_date
    ? toDateKey(stats.last_activity_date)
    : null;

  let newStreak = stats.current_streak;

  if (lastKey === today) {
    // Already completed a task today — streak unchanged
  } else if (lastKey === yesterday) {
    // Consecutive day — increment streak
    newStreak += 1;
  } else {
    // Gap or first activity — start new streak
    newStreak = 1;
  }

  const newTotal = stats.total_completed + 1;
  const newLongest = Math.max(stats.longest_streak, newStreak);

  // Calcolo Ricompensa (Phase 3)
  let baseReward = 10;
  if (task?.difficulty === 'medium') baseReward = 25;
  if (task?.difficulty === 'hard') baseReward = 50;

  let subtaskReward = 0;
  if (task?.subtasks && Array.isArray(task.subtasks)) {
    // Premiamo solo i sottotask completati
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    subtaskReward = completedSubtasks * 5;
  }

  const earnedCoins = baseReward + subtaskReward;
  const newCoins = stats.coins + earnedCoins;

  const updates = {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
    last_activity_date: serverTimestamp(),
    coins: newCoins,
  };

  if (!snap.exists()) {
    updates.user_id = uid;
    updates.inventory = {};
    await setDoc(ref, updates);
  } else {
    await updateDoc(ref, updates);
  }

  return {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
    coins: newCoins,
  };
}

/**
 * Subscribe to real-time updates on user stats.
 */
export function subscribeStats(uid, callback) {
  const ref = doc(db, STATS_COL, uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback({
          id: snap.id,
          coins: data.coins || 0,
          inventory: data.inventory || {},
          ...data
        });
      } else {
        callback({
          id: uid,
          user_id: uid,
          current_streak: 0,
          longest_streak: 0,
          total_completed: 0,
          last_activity_date: null,
          coins: 0,
          inventory: {},
        });
      }
    },
    (error) => {
      console.error('Stats subscription error:', error);
      callback({
        id: uid,
        user_id: uid,
        current_streak: 0,
        longest_streak: 0,
        total_completed: 0,
        last_activity_date: null,
        coins: 0,
        inventory: {},
      });
    }
  );
}
