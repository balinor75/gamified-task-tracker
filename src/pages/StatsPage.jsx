import { motion } from 'framer-motion';
import useStatsStore, { selectLevel, selectLevelProgress } from '../stores/useStatsStore';
import { BADGES } from '../lib/badges';

export default function StatsPage() {
  const { currentStreak, longestStreak, totalCompleted, unlockedBadges, loading } = useStatsStore();
  const level = useStatsStore(selectLevel);
  const levelProgress = useStatsStore(selectLevelProgress);

  const unlockedSet = new Set(unlockedBadges);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text mb-6">Statistiche</h1>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {/* Stats Cards Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
              {/* Level Card */}
              <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl mb-2 block">⭐</span>
                <p className="text-3xl font-black text-text tabular-nums">{level}</p>
                <p className="text-xs text-text-secondary mt-1">Livello</p>
                <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  />
                </div>
                <p className="text-[10px] text-text-secondary/60 mt-1">
                  {totalCompleted % 10}/10 al prossimo
                </p>
              </div>

              {/* Total Completed Card */}
              <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl mb-2 block">✅</span>
                <p className="text-3xl font-black text-text tabular-nums">{totalCompleted}</p>
                <p className="text-xs text-text-secondary mt-1">Task completati</p>
              </div>

              {/* Current Streak Card */}
              <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl mb-2 block">🔥</span>
                <p className="text-3xl font-black text-text tabular-nums">{currentStreak}</p>
                <p className="text-xs text-text-secondary mt-1">Streak attuale</p>
              </div>

              {/* Longest Streak Card */}
              <div className="bg-surface-card border border-white/5 rounded-2xl p-4 text-center">
                <span className="text-3xl mb-2 block">🏅</span>
                <p className="text-3xl font-black text-text tabular-nums">{longestStreak}</p>
                <p className="text-xs text-text-secondary mt-1">Record streak</p>
              </div>
            </motion.div>

            {/* Badges Section */}
            <motion.div variants={itemVariants}>
              <h2 className="text-lg font-bold text-text mb-3 flex items-center gap-2">
                <span>🏆</span> Badge
                <span className="text-xs text-text-secondary font-normal ml-auto">
                  {unlockedBadges.length}/{BADGES.length}
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {BADGES.map((badge) => {
                  const isUnlocked = unlockedSet.has(badge.id);
                  return (
                    <motion.div
                      key={badge.id}
                      whileHover={isUnlocked ? { scale: 1.02 } : {}}
                      className={`bg-surface-card border rounded-2xl p-4 transition-all ${
                        isUnlocked
                          ? 'border-primary/20 shadow-sm shadow-primary/5'
                          : 'border-white/5 opacity-40 grayscale'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold truncate ${
                            isUnlocked ? 'text-text' : 'text-text-secondary'
                          }`}>
                            {badge.title}
                          </p>
                          <p className="text-xs text-text-secondary/80 mt-0.5 line-clamp-2">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                      {isUnlocked && (
                        <div className="mt-2 text-[10px] text-success font-semibold flex items-center gap-1">
                          <span>✓</span> Sbloccato
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
