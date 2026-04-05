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
import { todayKey, yesterdayKey, toDateKey } from './dateUtils';

const STATS_COL = 'user_stats';

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
      previous_streak: 0,
    };
  } else {
    stats = snap.data();
    // Migrazione al volo per vecchi documenti
    stats.current_streak = Number(stats.current_streak) || 0;
    stats.longest_streak = Number(stats.longest_streak) || 0;
    stats.total_completed = Number(stats.total_completed) || 0;
    stats.coins = Number(stats.coins) || 0;
    stats.inventory = stats.inventory || {};
    stats.previous_streak = Number(stats.previous_streak) || 0;
  }

  const today = todayKey();
  const yesterday = yesterdayKey();
  const lastKey = stats.last_activity_date
    ? toDateKey(stats.last_activity_date)
    : null;

  let newStreak = stats.current_streak;
  let newPreviousStreak = stats.previous_streak || 0;

  if (lastKey === today) {
    // Already completed a task today — streak unchanged
  } else if (lastKey === yesterday) {
    // Consecutive day — increment streak
    newStreak += 1;
  } else {
    // Gap or first activity — start new streak
    if (stats.current_streak > 0) {
      newPreviousStreak = stats.current_streak;
    }
    newStreak = 1;
  }

  const newTotal = stats.total_completed + 1;
  const newLongest = Math.max(stats.longest_streak, newStreak);

  // Calcolo Ricompensa (Phase 3)
  let baseReward = 10;
  if (task?.difficulty === 'medium') baseReward = 25;
  if (task?.difficulty === 'hard') baseReward = 50;

  // Moltiplicatore Progetti (Phase 5)
  if (task?.type === 'project') {
    if (task?.difficulty === 'easy') baseReward *= 2;      // 20
    else if (task?.difficulty === 'medium') baseReward *= 3; // 75
    else if (task?.difficulty === 'hard') baseReward *= 4;   // 200
  }

  let subtaskReward = 0;
  if (task?.subtasks && Array.isArray(task.subtasks)) {
    // Premiamo solo i sottotask completati
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    subtaskReward = completedSubtasks * 5;
  }

  const earnedCoins = baseReward + subtaskReward;
  let finalCoins = earnedCoins;

  // Moltiplicatore Elisir del Focus
  if (stats.active_buffs && stats.active_buffs.double_xp_until) {
    const doubleUntil = stats.active_buffs.double_xp_until.toMillis 
      ? stats.active_buffs.double_xp_until.toMillis() 
      : 0;
    if (doubleUntil > Date.now()) {
      finalCoins *= 2;
    }
  }

  const newCoins = stats.coins + finalCoins;

  const updates = {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
    last_activity_date: serverTimestamp(),
    coins: newCoins,
    previous_streak: newPreviousStreak,
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
          ...data,
          current_streak: Number(data.current_streak) || 0,
          longest_streak: Number(data.longest_streak) || 0,
          total_completed: Number(data.total_completed) || 0,
          coins: Number(data.coins) || 0,
          inventory: data.inventory || {},
          previous_streak: Number(data.previous_streak) || 0,
          active_buffs: data.active_buffs || null,
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
