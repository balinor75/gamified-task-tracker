import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';

const SWIPE_THRESHOLD = -70;

/**
 * Returns difficulty badge markup based on task.difficulty field.
 * 'easy' → green FACILE, 'hard' → red DIFFICILE, none → nothing
 */
function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  if (difficulty === 'hard') {
    return <span className="badge-hard">Difficile</span>;
  }
  return <span className="badge-easy">Facile</span>;
}

/**
 * Simple deadline chip using task.deadline (ISO string or null).
 */
function DeadlineChip({ deadline }) {
  if (!deadline) return null;
  const date = new Date(deadline);
  const label = date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
  return (
    <span className="chip-deadline">
      ⏰ {label}
    </span>
  );
}

export default function TaskItem({ task, onToggle, onDelete }) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [0, -50], [0, 1]);
  const dragContainerRef = useRef(null);

  const handleDragEnd = (_, info) => {
    const isPastThreshold = info.offset.x < SWIPE_THRESHOLD;
    if (isPastThreshold) {
      controls.start({ x: -window.innerWidth, opacity: 0 }).then(() => onDelete(task.id));
    } else {
      controls.start({ x: 0 });
    }
  };

  const isCompleted = task.completed;
  const hasMeta = task.difficulty || task.deadline;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      className="relative mb-3 rounded-2xl overflow-hidden"
      ref={dragContainerRef}
    >
      {/* ── Background Delete Zone (revealed on swipe) ── */}
      <motion.div
        style={{
          opacity: backgroundOpacity,
          background: 'rgba(255, 180, 171, 0.10)',
        }}
        className="absolute inset-0 flex items-center justify-end pr-5 z-0 rounded-2xl"
      >
        <span style={{ color: '#FFB4AB', fontSize: '0.8rem', fontWeight: 600 }}>Elimina</span>
      </motion.div>

      {/* ── Foreground Draggable Card ── */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.08}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={`relative z-10 glass-card glow-hover rounded-2xl p-4 shadow-sm transition-all duration-200 ${
          isCompleted ? 'opacity-60' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          {/* ── Runic Checkbox ── */}
          <button
            onClick={() => onToggle(task.id, isCompleted)}
            className={`runic-node mt-0.5 flex items-center justify-center transition-all duration-200 ${
              isCompleted ? 'checked' : ''
            }`}
            aria-label={isCompleted ? 'Segna come non completato' : 'Segna come completato'}
          >
            {isCompleted && (
              <motion.svg
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                className="w-3.5 h-3.5"
                fill="none"
                stroke="#EDE0FF"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </motion.svg>
            )}
          </button>

          {/* ── Task Content ── */}
          <div className="flex-1 min-w-0">
            {/* Title row */}
            <p
              className={`text-[0.9375rem] font-medium leading-snug transition-all duration-300 ${
                isCompleted
                  ? 'line-through'
                  : ''
              }`}
              style={{
                color: isCompleted ? '#958DA1' : '#DEE1F7',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </p>

            {/* Meta row — difficulty badge + deadline chip */}
            {hasMeta && !isCompleted && (
              <div className="flex items-center flex-wrap gap-1.5 mt-2">
                <DifficultyBadge difficulty={task.difficulty} />
                <DeadlineChip deadline={task.deadline} />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
