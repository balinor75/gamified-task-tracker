import {
  doc,
  getDoc,
  setDoc,
  runTransaction,
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
/**
 * Helper to calculate the new stats state.
 * Encapsulates the core gamification logic for reuse in transactions.
 */
export function calculateStatsUpdate(stats, task) {
  const today = todayKey();
  const yesterday = yesterdayKey();
  const lastKey = stats.last_activity_date
    ? toDateKey(stats.last_activity_date)
    : null;

  let newStreak = Number(stats.current_streak) || 0;
  let newPreviousStreak = Number(stats.previous_streak) || 0;

  if (lastKey === today) {
    // Already completed a task today
  } else if (lastKey === yesterday) {
    newStreak += 1;
  } else {
    if (newStreak > 0) {
      newPreviousStreak = newStreak;
    }
    newStreak = 1;
  }

  const newTotal = (Number(stats.total_completed) || 0) + 1;
  const newLongest = Math.max(Number(stats.longest_streak) || 0, newStreak);

  // ── Calcolo Ricompense Finale Task ──
  let baseCoins = 10;
  let baseXP = 10; // Default Easy

  if (task?.difficulty === 'medium') {
    baseCoins = 25;
    baseXP = 20;
  } else if (task?.difficulty === 'hard') {
    baseCoins = 50;
    baseXP = 30;
  }

  if (task?.type === 'project') {
    // Moltiplicatore monete rimosso in favore di un premio fisso generoso? 
    // No, manteniamo la logica ma aggiungiamo l'XP bonus.
    if (task?.difficulty === 'easy') baseCoins *= 2;
    else if (task?.difficulty === 'medium') baseCoins *= 3;
    else if (task?.difficulty === 'hard') baseCoins *= 4;
    
    baseXP += 50; // Bonus finale progetto
  }

  // Rimosso subtaskReward qui perché ora vengono assegnati immediatamente al toggle
  let finalCoins = baseCoins;
  let finalXP = baseXP;

  // Buff Focus Elixir (raddoppia tutto)
  if (stats.active_buffs && stats.active_buffs.double_xp_until) {
    const doubleUntil = stats.active_buffs.double_xp_until.toMillis 
      ? stats.active_buffs.double_xp_until.toMillis() 
      : 0;
    if (doubleUntil > Date.now()) {
      finalCoins *= 2;
      finalXP *= 2;
    }
  }

  const newCoins = (Number(stats.coins) || 0) + finalCoins;
  const newXP = (Number(stats.xp) || 0) + finalXP;

  return {
    current_streak: newStreak,
    longest_streak: newLongest,
    total_completed: newTotal,
    last_activity_date: serverTimestamp(),
    coins: newCoins,
    xp: newXP,
    previous_streak: newPreviousStreak,
  };
}

export async function updateStatsOnComplete(uid, task) {
  const ref = doc(db, STATS_COL, uid);

  return await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);

    const stats = snap.exists() ? snap.data() : {
      user_id: uid,
      current_streak: 0,
      longest_streak: 0,
      total_completed: 0,
      last_activity_date: null,
      coins: 0,
      xp: 0,
      inventory: {},
      previous_streak: 0,
    };

    const updates = calculateStatsUpdate(stats, task);

    if (!snap.exists()) {
      updates.user_id = uid;
      updates.inventory = {};
      transaction.set(ref, updates);
    } else {
      transaction.update(ref, updates);
    }

    return updates;
  });
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
          xp: Number(data.xp) || 0,
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
          xp: 0,
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
