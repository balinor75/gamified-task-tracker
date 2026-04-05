import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

const PARTICLE_COUNT = 24;
const COLORS = ['#ef4444', '#ec4899', '#f43f5e', '#rose-500', '#f87171', '#fb7185', '#10b981', '#34d399'];
const PREFS_KEY = 'gtt_preferences';

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

function areAnimationsEnabled() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return true;
    return JSON.parse(raw).animations !== false;
  } catch {
    return true;
  }
}

export default function HealingEffect({ show, onComplete }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      if (!areAnimationsEnabled()) {
        onComplete?.();
        return;
      }
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
      rotation: randomBetween(-45, 45), // Cuoricini non ruotati troppo
      scale: randomBetween(0.6, 1.2),
      size: randomBetween(12, 20),
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
          {/* Healing cross burst */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="absolute"
          >
            <div className="w-20 h-20 rounded-full bg-green-500/20 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-green-500/20 text-green-400 text-4xl">
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1, type: 'spring' }}
              >
                ✚
              </motion.span>
            </div>
          </motion.div>

          {/* Heart particles */}
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
                duration: 1.2,
                delay: p.delay,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute"
              style={{
                fontSize: p.size,
                color: p.color,
              }}
            >
              ❤️
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
