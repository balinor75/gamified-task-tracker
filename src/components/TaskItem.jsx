import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { updateTask } from '../lib/taskService';

const SWIPE_THRESHOLD = -70;

function DifficultyBadge({ difficulty }) {
  if (!difficulty) return null;
  if (difficulty === 'hard') {
    return <span className="badge-hard">Difficile</span>;
  }
  if (difficulty === 'medium') {
    return <span className="badge-medium">Media</span>;
  }
  return <span className="badge-easy">Facile</span>;
}

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
  const subtasks = task.subtasks || [];
  const hasSubtasks = subtasks.length > 0;
  const completedSubtasksCount = subtasks.filter((st) => st.completed).length;
  const subtasksPercent = hasSubtasks ? Math.round((completedSubtasksCount / subtasks.length) * 100) : 0;

  // Toggle singola voce sub-task
  const handleToggleSubtask = async (subId, currentlyCompleted) => {
    const newSubtasks = subtasks.map((st) =>
      st.id === subId ? { ...st, completed: !currentlyCompleted } : st
    );

    // Controlla se tutti i subtasks ora sono completati
    const allCompleted = newSubtasks.length > 0 && newSubtasks.every(st => st.completed);

    // Aggiornamento ottimistico o base
    await updateTask(task.id, { subtasks: newSubtasks });

    // Se completati tutti, auto-completa la task genitore dopo un piccolo delay visivo
    if (allCompleted && !isCompleted) {
      setTimeout(() => {
        onToggle(task.id, false, newSubtasks);
      }, 500); // Diamo mezzo secondo all'utente per vedere la barretta arrivare al 100%
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSt = {
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    const newSubtasks = [...subtasks, newSt];
    setNewSubtaskTitle('');
    
    // Se c'erano tutti completati e ne aggiungo uno nuovo, la task NON deve riaprirsi in automatico a meno
    // che non implementiamo quella logica. Essendo Fase 1, se la task è completata la lascio completata ma 
    // potrei permettere di riaprirla. Per ora aggiorno solo l'array.
    await updateTask(task.id, { subtasks: newSubtasks, completed: false });
  };

  const handleShare = async () => {
    const dlStr = task.deadline ? ` entro il ${new Date(task.deadline).toLocaleDateString('it-IT')}` : '';
    const text = `Aetheric Quest: Ricorda di completare "${task.title}"${dlStr}. 💪`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Promemoria',
          text: text,
        });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      alert("La condivisione nativa non è supportata su questo dispositivo.\n\n" + text);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.18 } }}
      className="relative mb-3 rounded-2xl overflow-hidden"
      ref={dragContainerRef}
    >
      {/* ── Background Delete Zone ── */}
      <motion.div
        style={{
          opacity: backgroundOpacity,
          background: 'rgba(255, 180, 171, 0.10)',
        }}
        className="absolute inset-0 flex items-center justify-end pr-5 z-0 rounded-2xl"
      >
        <span style={{ color: '#FFB4AB', fontSize: '0.8rem', fontWeight: 600 }}>Elimina</span>
      </motion.div>

      {/* ── Foreground Card ── */}
      <motion.div
        layout
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.08}
        dragDirectionLock
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x }}
        className={`relative z-10 glass-card glow-hover rounded-2xl p-4 shadow-sm transition-colors duration-300 ${
          isCompleted ? 'opacity-60' : ''
        } ${isExpanded ? 'border-[rgba(124,58,237,0.3)] bg-[rgba(25,23,37,0.7)]' : ''}`}
      >
        {/* Header Principale: Cliccabile per espandere */}
        <div 
          className="flex items-start gap-3 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* ── Runic Checkbox ── */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Evita l'espansione al click sul check
              onToggle(task.id, isCompleted, subtasks);
            }}
            className={`runic-node mt-0.5 shrink-0 flex items-center justify-center transition-all duration-200 ${
              isCompleted ? 'checked' : ''
            }`}
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

          {/* ── Task Info ── */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p
                className={`text-[0.9375rem] font-medium leading-snug transition-all duration-300 flex-1 truncate pr-2 ${
                  isCompleted ? 'line-through' : ''
                }`}
                style={{
                  color: isCompleted ? '#958DA1' : '#DEE1F7',
                }}
              >
                {task.title}
              </p>

              {/* Chevron icon */}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-[#958DA1] opacity-50 shrink-0"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </motion.div>
            </div>

            {/* Meta row + subtasks summary se non espanso */}
            <div className="flex items-center flex-wrap gap-1.5 mt-2">
              {hasMeta && !isCompleted && (
                <>
                  <DifficultyBadge difficulty={task.difficulty} />
                  <DeadlineChip deadline={task.deadline} />
                </>
              )}
              {hasSubtasks && !isExpanded && !isCompleted && (
                <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: '#CCC3D8'}}>
                  {completedSubtasksCount}/{subtasks.length} sub-tasks
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Expanded Area: Subtasks ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-2">
                
                {/* Progress bar interna */}
                {hasSubtasks && (
                  <div className="mb-4 px-1">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-[0.6rem] font-bold tracking-wider" style={{ color: '#CCC3D8' }}>
                        {completedSubtasksCount} / {subtasks.length} COMPLETATI
                      </span>
                      <span className="text-[0.65rem] font-bold gold-text">
                        {subtasksPercent}% XP
                      </span>
                    </div>
                    <div className="progress-track" style={{ height: '4px' }}>
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${subtasksPercent}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                )}

                {/* Subtasks List */}
                <div className="space-y-2.5 px-1 mb-4">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSubtask(st.id, st.completed)}
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                          st.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[rgba(210,187,255,0.2)] bg-transparent'
                        }`}
                      >
                        {st.completed && (
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                           </svg>
                        )}
                      </button>
                      <span 
                        className={`text-sm flex-1 transition-all ${st.completed ? 'line-through opacity-50' : ''}`}
                        style={{ color: st.completed ? '#958DA1' : '#CCC3D8' }}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pl-1">
                  <span className="text-[#958DA1] text-lg font-light leading-none">+</span>
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Aggiungi voce..."
                    className="bg-transparent border-none outline-none text-sm w-full placeholder-[#958DA1]/60"
                    style={{ color: '#DEE1F7' }}
                  />
                  {newSubtaskTitle.trim() && (
                    <button type="submit" className="text-xs font-bold shrink-0" style={{ color: '#D2BBFF' }}>
                      Aggiungi
                    </button>
                  )}
                </form>

                {/* Azioni Estese: Web Share API */}
                <div className="mt-4 pt-3 border-t border-[rgba(210,187,255,0.06)] flex justify-end">
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-[rgba(124,58,237,0.2)]"
                    style={{ background: 'rgba(124,58,237,0.1)', color: '#D2BBFF' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    Condividi
                  </button>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </motion.div>
  );
}
