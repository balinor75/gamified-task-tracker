import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useRef } from 'react';

const SWIPE_THRESHOLD = -70; // px to drag before allowing delete

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
      controls.start({ x: 0 }); // snap back
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className="relative mb-3 rounded-2xl overflow-hidden"
      ref={dragContainerRef}
    >
      {/* Background Delete Button (revealed on swipe) */}
      <motion.div
        style={{ opacity: backgroundOpacity }}
        className="absolute inset-0 bg-red-500/20 flex items-center justify-end pr-6 z-0"
      >
        <span className="text-red-400 font-medium text-sm">Elimina</span>
      </motion.div>

      {/* Foreground Draggable Card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className="relative z-10 glass-card glow-hover rounded-2xl p-4 flex items-start gap-4 shadow-sm"
      >
        <button
          onClick={() => onToggle(task.id, task.completed)}
          className={`shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-primary border-primary text-background shadow-md shadow-primary/30'
              : 'border-white/20 hover:border-primary/50 hover:shadow-sm hover:shadow-primary/20'
          }`}
        >
          {task.completed && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </motion.svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p
            className={`text-base transition-all duration-300 ${
              task.completed ? 'text-text-secondary/60 line-through' : 'text-text'
            }`}
          >
            {task.title}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
