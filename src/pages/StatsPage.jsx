import { motion } from 'framer-motion';
import useStatsStore, { selectLevel, selectLevelProgress } from '../stores/useStatsStore';
import { BADGES } from '../lib/badges';

export default function StatsPage() {
  const { currentStreak, longestStreak, totalCompleted, unlockedBadges, loading } = useStatsStore();
  const level = useStatsStore(selectLevel);
  const levelProgress = useStatsStore(selectLevelProgress);

  const unlockedSet = new Set(unlockedBadges);
  const xpForNextLevel = 10 - (totalCompleted % 10);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.09 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 18 },
    show:  { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  // Stats grid data
  const STAT_CARDS = [
    {
      icon: '✅',
      value: totalCompleted,
      label: 'Task completate',
      gradient: 'linear-gradient(135deg, rgba(110,231,183,0.08) 0%, rgba(52,211,153,0.06) 100%)',
      border: 'rgba(110,231,183,0.14)',
    },
    {
      icon: '🔥',
      value: currentStreak,
      label: 'Streak attuale',
      gradient: 'linear-gradient(135deg, rgba(255,185,95,0.10) 0%, rgba(238,152,0,0.06) 100%)',
      border: 'rgba(255,185,95,0.16)',
      isGold: true,
    },
    {
      icon: '🏅',
      value: longestStreak,
      label: 'Record streak',
      gradient: 'linear-gradient(135deg, rgba(215,186,255,0.08) 0%, rgba(122,82,179,0.06) 100%)',
      border: 'rgba(215,186,255,0.14)',
    },
    {
      icon: '🏆',
      value: `${unlockedBadges.length}/${BADGES.length}`,
      label: 'Badge sbloccati',
      gradient: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(65,20,120,0.08) 100%)',
      border: 'rgba(124,58,237,0.18)',
    },
  ];

  return (
    <div className="p-4 pb-28">
      {/* ── Character Card (Hero) ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="hero-card rounded-3xl p-5 mb-5"
      >
        {/* Top row: Avatar + Name + Level */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl pulse-glow"
            style={{
              background: 'rgba(124,58,237,0.25)',
              border: '1px solid rgba(210,187,255,0.2)',
            }}
          >
            ⚔️
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold" style={{ color: '#DEE1F7' }}>
              Le tue statistiche
            </h1>
            <span className="level-pill" style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
              LVL {level} · Avventuriero
            </span>
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontSize: '0.7rem', color: '#CCC3D8', fontWeight: 500 }}>
              Esperienza
            </span>
            <span className="chip-xp">
              ⚡ {xpForNextLevel} XP al prossimo livello
            </span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span style={{ fontSize: '0.625rem', color: '#958DA1' }}>
              {(totalCompleted % 10) * 10} / 100 XP
            </span>
            <span style={{ fontSize: '0.625rem', color: '#D2BBFF' }}>
              LVL {level + 1}
            </span>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shimmer rounded-2xl h-28" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-5"
        >
          {/* ── Stats Grid 2×2 ── */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            {STAT_CARDS.map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                className="glass-card glow-hover rounded-2xl p-4 text-center"
                style={{
                  background: card.gradient,
                  borderColor: card.border,
                }}
              >
                <span className="text-3xl mb-2 block">{card.icon}</span>
                <p
                  className={`text-3xl font-black tabular-nums ${card.isGold ? 'gold-text' : 'gradient-text'}`}
                >
                  {card.value}
                </p>
                <p className="text-[0.7rem] mt-1" style={{ color: '#958DA1' }}>
                  {card.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Badge Gallery ── */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold" style={{ color: '#DEE1F7' }}>
                🏆 Badge
              </h2>
              <span
                className="chip-xp"
                style={{ background: 'rgba(124,58,237,0.12)', color: '#D2BBFF', borderColor: 'rgba(124,58,237,0.2)' }}
              >
                {unlockedBadges.length}/{BADGES.length} sbloccati
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {BADGES.map((badge) => {
                const isUnlocked = unlockedSet.has(badge.id);
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={isUnlocked ? { scale: 1.025 } : {}}
                    className="glass-card rounded-2xl p-4 transition-all"
                    style={{
                      opacity: isUnlocked ? 1 : 0.38,
                      filter: isUnlocked ? 'none' : 'grayscale(1)',
                      borderColor: isUnlocked ? 'rgba(124,58,237,0.22)' : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{badge.icon}</span>
                      <div className="min-w-0">
                        <p
                          className="text-sm font-bold truncate"
                          style={{ color: isUnlocked ? '#DEE1F7' : '#958DA1' }}
                        >
                          {badge.title}
                        </p>
                        <p className="text-[0.7rem] mt-0.5 line-clamp-2" style={{ color: '#958DA1' }}>
                          {badge.description}
                        </p>
                        {isUnlocked && (
                          <div className="mt-1.5 flex items-center gap-1" style={{ color: '#6EE7B7', fontSize: '0.65rem', fontWeight: 700 }}>
                            <span>✓</span> Sbloccato
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
