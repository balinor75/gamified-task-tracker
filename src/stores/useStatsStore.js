import { create } from 'zustand';
import { subscribeStats } from '../lib/statsService';
import { checkUnlockedBadges } from '../lib/badges';

const useStatsStore = create((set, get) => ({
  currentStreak: 0,
  longestStreak: 0,
  totalCompleted: 0,
  lastActivityDate: null,
  coins: 0,
  inventory: {},
  loading: true,
  unlockedBadges: [],
  _unsub: null,

  /** Activate Firestore real-time listener for user stats. */
  subscribe(uid) {
    const prev = get()._unsub;
    if (prev) prev();

    set({ loading: true });

    const unsub = subscribeStats(uid, (stats) => {
      const newBadges = checkUnlockedBadges({
        current_streak: stats.current_streak,
        longest_streak: stats.longest_streak,
        total_completed: stats.total_completed,
      });

      set({
        currentStreak: stats.current_streak,
        longestStreak: stats.longest_streak,
        totalCompleted: stats.total_completed,
        lastActivityDate: stats.last_activity_date,
        coins: stats.coins,
        inventory: stats.inventory,
        unlockedBadges: newBadges,
        loading: false,
      });
    });

    set({ _unsub: unsub });
  },

  /** Stop listening and clear data. */
  unsubscribe() {
    const unsub = get()._unsub;
    if (unsub) unsub();
    set({
      currentStreak: 0,
      longestStreak: 0,
      totalCompleted: 0,
      lastActivityDate: null,
      coins: 0,
      inventory: {},
      unlockedBadges: [],
      _unsub: null,
      loading: true,
    });
  },
}));

/** Selector: calculate user level from total completed tasks */
export function selectLevel(state) {
  return Math.floor(state.totalCompleted / 10) + 1;
}

/** Selector: progress towards next level (0-100%) */
export function selectLevelProgress(state) {
  return (state.totalCompleted % 10) * 10;
}

export default useStatsStore;
