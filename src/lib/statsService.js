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
  return d.toISOString().slice(0, 10);
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
  };

  await setDoc(ref, defaults);
  return { id: uid, ...defaults };
}

/**
 * Called when a user completes a task.
 * Updates streak logic and increments total_completed.
 * Returns the new stats object and a list of newly unlocked badge IDs.
 */
export async function updateStatsOnComplete(uid) {
  const ref = doc(db, STATS_COL, uid);
  const snap = await getDoc(ref);

  let stats;
  if (!snap.exists()) {
    // First ever completion — create the doc
    stats = {
      user_id: uid,
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      last_activity_date: null,
    };
  } else {
    stats = snap.data();
  }

  const today = todayKey();
  const yesterday = yesterdayKey();
  const lastKey = stats.last_activity_date
    ? toDateKey(stats.last_activity_date)
    : null;

  let newStreak = stats.current_streak;

  if (lastKey === today) {
    // Already completed a task today — streak unchanged
    // Just increment total
  } else if (lastKey === yesterday) {
    // Consecutive day — increment streak
    newStreak += 1;
  } else {
    // Gap or first activity — start new streak
    newStreak = 1;
  }

  const newTotal = stats.total_completed + 1;
  const newLongest = Math.max(stats.longest_streak, newStreak);

  const updates = {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
    last_activity_date: serverTimestamp(),
  };

  if (!snap.exists()) {
    updates.user_id = uid;
    await setDoc(ref, updates);
  } else {
    await updateDoc(ref, updates);
  }

  return {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
  };
}

/**
 * Subscribe to real-time updates on user stats.
 * Returns an unsubscribe function.
 */
export function subscribeStats(uid, callback) {
  const ref = doc(db, STATS_COL, uid);
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() });
      } else {
        // No stats yet — return defaults
        callback({
          id: uid,
          user_id: uid,
          current_streak: 0,
          longest_streak: 0,
          total_completed: 0,
          last_activity_date: null,
        });
      }
    },
    (error) => {
      // On permission or network errors, return defaults so the UI doesn't hang
      console.error('Stats subscription error:', error);
      callback({
        id: uid,
        user_id: uid,
        current_streak: 0,
        longest_streak: 0,
        total_completed: 0,
        last_activity_date: null,
      });
    }
  );
}
