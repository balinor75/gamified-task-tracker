/**
 * Badge definitions for the Gamified Task Tracker.
 * Each badge has a condition function that receives { current_streak, longest_streak, total_completed }.
 */

export const BADGES = [
  // Streak badges
  {
    id: 'streak_3',
    title: 'Prima Fiamma',
    icon: '🔥',
    description: 'Streak di 3 giorni consecutivi',
    category: 'streak',
    condition: (s) => s.longest_streak >= 3,
  },
  {
    id: 'streak_7',
    title: 'Settimana di Fuoco',
    icon: '⚡',
    description: 'Streak di 7 giorni consecutivi',
    category: 'streak',
    condition: (s) => s.longest_streak >= 7,
  },
  {
    id: 'streak_30',
    title: 'Instancabile',
    icon: '🌟',
    description: 'Streak di 30 giorni consecutivi',
    category: 'streak',
    condition: (s) => s.longest_streak >= 30,
  },
  // Task count badges
  {
    id: 'tasks_10',
    title: 'Primi Passi',
    icon: '✅',
    description: '10 task completati',
    category: 'tasks',
    condition: (s) => s.total_completed >= 10,
  },
  {
    id: 'tasks_50',
    title: 'Cinquanta & Oltre',
    icon: '🚀',
    description: '50 task completati',
    category: 'tasks',
    condition: (s) => s.total_completed >= 50,
  },
  {
    id: 'tasks_100',
    title: 'Centurione',
    icon: '💯',
    description: '100 task completati',
    category: 'tasks',
    condition: (s) => s.total_completed >= 100,
  },
  {
    id: 'tasks_500',
    title: 'Cinquecento',
    icon: '🏆',
    description: '500 task completati',
    category: 'tasks',
    condition: (s) => s.total_completed >= 500,
  },
];

/**
 * Given a stats object, return the list of badge IDs that are unlocked.
 */
export function checkUnlockedBadges(stats) {
  return BADGES.filter((b) => b.condition(stats)).map((b) => b.id);
}

/**
 * Given old and new badge lists, return newly unlocked badges.
 */
export function getNewlyUnlocked(oldBadgeIds, newBadgeIds) {
  const oldSet = new Set(oldBadgeIds);
  return newBadgeIds.filter((id) => !oldSet.has(id));
}

/**
 * Get badge definition by ID.
 */
export function getBadgeById(id) {
  return BADGES.find((b) => b.id === id) ?? null;
}

/**
 * Get the next streak badge threshold that hasn't been reached yet.
 */
export function getNextStreakThreshold(currentLongest) {
  const thresholds = [3, 7, 30];
  return thresholds.find((t) => currentLongest < t) ?? null;
}
