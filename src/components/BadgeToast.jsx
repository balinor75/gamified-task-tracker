import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Animated toast that slides up from the bottom when a badge is unlocked.
 * Auto-dismisses after 4 seconds.
 */
export default function BadgeToast({ badge, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (badge) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onDismiss?.(), 400); // wait for exit animation
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [badge, onDismiss]);

  return (
    <AnimatePresence>
      {visible && badge && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 15, stiffness: 180 }}
          className="fixed bottom-20 left-4 right-4 z-[90] max-w-lg mx-auto"
        >
          <div className="bg-surface-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl p-4 shadow-lg shadow-primary/10">
            <div className="flex items-center gap-4">
              {/* Badge icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 10, delay: 0.2 }}
                className="w-14 h-14 rounded-xl bg-primary/15 flex items-center justify-center shrink-0"
              >
                <span className="text-3xl">{badge.icon}</span>
              </motion.div>

              {/* Badge info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-0.5">
                  🏅 Nuovo Badge!
                </p>
                <h3 className="text-base font-bold text-text truncate">
                  {badge.title}
                </h3>
                <p className="text-xs text-text-secondary truncate">
                  {badge.description}
                </p>
              </div>
            </div>

            {/* Progress shimmer */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4, ease: 'linear' }}
              className="mt-3 h-0.5 bg-primary/30 rounded-full origin-left"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
