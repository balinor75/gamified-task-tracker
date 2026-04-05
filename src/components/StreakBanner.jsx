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
      transition={{ duration: 0.45, delay: 0.1 }}
      className={`mb-5 rounded-2xl overflow-hidden ${
        currentStreak > 0
          ? 'p-px'
          : ''
      }`}
      style={currentStreak > 0 ? {
        background: 'linear-gradient(90deg, rgba(124,58,237,0.35), rgba(238,152,0,0.25), rgba(124,58,237,0.35))'
      } : {}}
    >
      <div className="glass-card rounded-2xl p-4">
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
                  <span className="text-3xl font-black gold-text tabular-nums">
                    {currentStreak}
                  </span>
                  <span className="text-sm" style={{ color: '#958DA1' }}>
                    {currentStreak === 1 ? 'giorno' : 'giorni'} di fila
                  </span>
                </div>
                {longestStreak > currentStreak && (
                  <p className="text-xs mt-0.5" style={{ color: '#958DA1' }}>
                    ⚡ Record: {longestStreak} giorni
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
            <div className="flex justify-between mb-1.5" style={{ fontSize: '0.7rem', color: '#958DA1' }}>
              <span>Prossimo badge streak</span>
              <span style={{ color: '#FFB95F' }}>{currentStreak}/{nextThreshold} 🏅</span>
            </div>
            <div className="progress-track">
              <motion.div
                className="progress-fill"
                style={{ background: 'linear-gradient(90deg, #FFB95F, #EE9800)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
