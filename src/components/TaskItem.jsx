import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import { updateTask, toggleSubtaskWithRewards } from '../lib/taskService';

const SWIPE_THRESHOLD = -70;

const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : Date.now().toString();
};

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
  
  // Phase 6: Deadline Colors
  const todayStr = new Date().toISOString().split('T')[0];
  const deadlineStr = date.toISOString().split('T')[0];
  
  let chipClass = "chip-deadline";
  if (deadlineStr < todayStr) {
    chipClass += " expired"; // Rosso
  } else if (deadlineStr === todayStr) {
    chipClass += " due-today"; // Arancione
  }

  return (
    <span className={chipClass}>
      ⏰ {label}
    </span>
  );
}

export default function TaskItem({ task, user, onToggle, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskDeadline, setNewSubtaskDeadline] = useState('');

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

  // Logic B: Check for deadline anomalies (solo per progetti)
  const maxSubtaskDeadline = subtasks.reduce((max, st) => (!max || (st.deadline && st.deadline > max) ? st.deadline : max), null);
  const hasDeadlineAnomaly = task.type === 'project' && task.deadline && maxSubtaskDeadline && maxSubtaskDeadline > task.deadline;

  const handleAlignDeadline = async () => {
    if (maxSubtaskDeadline) {
      await updateTask(task.id, { deadline: maxSubtaskDeadline });
    }
  };

  const handleToggleSubtask = async (subId, currentlyCompleted) => {
    if (!user) return;
    
    try {
      // Usiamo la transazione atomica per premi/sostrazioni
      await toggleSubtaskWithRewards(user.uid, task.id, subId);
      
      // La lista subtasks nello store verrà aggiornata tramite la subscription in DashboardPage,
      // quindi non serve aggiornamento ottimistico manuale qui (anche se si potrebbe fare).
      
      // Controllo per auto-completamento (basato sui dati attuali for ora)
      const isCompleting = !currentlyCompleted;
      const willBeAllCompleted = subtasks.length > 0 && 
        subtasks.every(st => st.id === subId ? isCompleting : st.completed);

      if (willBeAllCompleted && !isCompleted) {
        setTimeout(() => {
          onToggle(task.id, false, subtasks.map(st => 
            st.id === subId ? { ...st, completed: true } : st
          ));
        }, 500);
      }
    } catch (e) {
      console.error("Error toggling subtask:", e);
    }
  };

  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    const newSt = {
      id: generateId(),
      title: newSubtaskTitle.trim(),
      completed: false
    };

    if (task.type === 'project' && newSubtaskDeadline) {
      newSt.deadline = newSubtaskDeadline;
    }

    const newSubtasks = [...subtasks, newSt];
    setNewSubtaskTitle('');
    setNewSubtaskDeadline('');
    
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
              {task.type === 'habit' && (
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}>
                  🔄 Abitudine
                </span>
              )}
              {task.type === 'project' && (
                <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-md flex items-center gap-1" style={{ background: 'rgba(234,179,8,0.15)', color: '#FBBF24', border: '1px solid rgba(234,179,8,0.25)' }}>
                  👑 Progetto
                </span>
              )}
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

                {/* Logic B: Avvertimento Top-Down Anomalia Scadenze */}
                {hasDeadlineAnomaly && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-3 px-3 py-2 rounded-lg flex flex-col sm:flex-row items-center gap-2 justify-between"
                    style={{ background: 'rgba(255, 180, 171, 0.1)', border: '1px solid rgba(255, 180, 171, 0.2)' }}
                  >
                    <span className="text-xs font-semibold text-[#FFB4AB]">⚠️ Una tappa supera la scadenza del progetto.</span>
                    <button 
                      onClick={handleAlignDeadline}
                      className="shrink-0 text-[0.65rem] uppercase tracking-wider font-bold px-2 py-1 bg-[#FFB4AB] text-[#090E1C] rounded shadow hover:scale-105 transition-transform"
                    >
                      Allinea al {new Date(maxSubtaskDeadline).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                    </button>
                  </motion.div>
                )}

                {/* Subtasks List */}
                <div className="space-y-2.5 px-1 mb-4">
                  {subtasks.map((st) => (
                    <div key={st.id} className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleSubtask(st.id, st.completed)}
                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors shrink-0 ${
                          st.completed ? 'bg-[#7C3AED] border-[#7C3AED]' : 'border-[rgba(210,187,255,0.2)] bg-transparent'
                        }`}
                      >
                        {st.completed && (
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                           </svg>
                        )}
                      </button>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span 
                          className={`text-sm transition-all truncate leading-tight ${st.completed ? 'line-through opacity-50' : ''}`}
                          style={{ color: st.completed ? '#958DA1' : '#CCC3D8' }}
                        >
                          {st.title}
                        </span>
                        {task.type === 'project' && st.deadline && (
                          <span className={`text-[0.65rem] flex items-center gap-0.5 mt-0.5 ${st.deadline > task.deadline ? 'text-[#FFB4AB]' : 'text-[#958DA1]'}`}>
                            📅 {new Date(st.deadline).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Subtask Input */}
                <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pl-1 pr-1 flex-wrap">
                  <span className="text-[#958DA1] text-lg font-light leading-none shrink-0">+</span>
                  <input
                    type="text"
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    placeholder="Aggiungi tappa..."
                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-0 placeholder-[#958DA1]/60"
                    style={{ color: '#DEE1F7' }}
                  />
                  {task.type === 'project' && (
                    <input
                      type="date"
                      value={newSubtaskDeadline}
                      onChange={(e) => setNewSubtaskDeadline(e.target.value)}
                      className="bg-[rgba(255,255,255,0.04)] border border-[rgba(210,187,255,0.12)] rounded-lg px-2 text-xs h-7 text-[#DEE1F7] focus:outline-none focus:border-[#7C3AED]/50 transition-colors shrink-0"
                      style={{ colorScheme: 'dark' }}
                    />
                  )}
                  {newSubtaskTitle.trim() && (
                    <button type="submit" className="text-xs font-bold shrink-0 px-2 py-1" style={{ color: '#D2BBFF' }}>
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
