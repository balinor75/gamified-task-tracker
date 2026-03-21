import { motion } from 'framer-motion';
import { getNextStreakThreshold } from '../lib/badges';

/**
 * Streak banner displayed at the top of the dashboard.
 * Shows current streak, fire animation, and progress to next badge.
 */
export default function StreakBanner({ currentStreak, longestStreak }) {
  const nextThreshold = getNextStreakThreshold(longestStreak);
  const progress = nextThreshold
    ? Math.min((currentStreak / nextThreshold) * 100, 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="mb-6 rounded-2xl overflow-hidden"
    >
      <div className="bg-surface-card/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          {/* Fire icon with pulse */}
          <div className="relative shrink-0">
            <motion.span
              animate={currentStreak > 0 ? {
                scale: [1, 1.15, 1],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="text-4xl block"
            >
              {currentStreak > 0 ? '🔥' : '💤'}
            </motion.span>
            {currentStreak > 0 && (
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -inset-2 bg-accent/10 rounded-full blur-md -z-10"
              />
            )}
          </div>

          {/* Streak info */}
          <div className="flex-1 min-w-0">
            {currentStreak > 0 ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-text tabular-nums">
                    {currentStreak}
                  </span>
                  <span className="text-sm text-text-secondary">
                    {currentStreak === 1 ? 'giorno' : 'giorni'} consecutivi
                  </span>
                </div>
                {longestStreak > currentStreak && (
                  <p className="text-xs text-text-secondary/70 mt-0.5">
                    Record: {longestStreak} giorni
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="text-base font-semibold text-text">
                  Nessuna streak attiva
                </p>
                <p className="text-xs text-text-secondary">
                  Completa un task per iniziare! 💪
                </p>
              </>
            )}
          </div>
        </div>

        {/* Progress bar to next badge */}
        {nextThreshold && currentStreak > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-text-secondary mb-1.5">
              <span>Prossimo badge</span>
              <span>{currentStreak}/{nextThreshold} giorni</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
