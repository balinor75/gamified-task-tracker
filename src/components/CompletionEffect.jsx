import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

const PARTICLE_COUNT = 24;
const COLORS = ['#6366f1', '#818cf8', '#f59e0b', '#fbbf24', '#10b981', '#ef4444', '#ec4899', '#8b5cf6'];

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

/**
 * Full-screen confetti + checkmark burst animation.
 * Renders for ~1.5s then auto-removes via onComplete.
 */
export default function CompletionEffect({ show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  // Generate particle configs once per show
  const particles = useMemo(() => {
    if (!show) return [];
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      x: randomBetween(-120, 120),
      y: randomBetween(-180, -40),
      rotation: randomBetween(-360, 360),
      scale: randomBetween(0.4, 1),
      size: randomBetween(6, 12),
      delay: randomBetween(0, 0.15),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center"
        >
          {/* Checkmark burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="absolute"
          >
            <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center">
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                />
              </motion.svg>
            </div>
          </motion.div>

          {/* Confetti particles */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: p.x,
                y: p.y,
                scale: p.scale,
                rotate: p.rotation,
                opacity: 0,
              }}
              transition={{
                duration: 1,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute rounded-sm"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
