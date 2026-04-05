import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useTaskStore from '../stores/useTaskStore';
import useStatsStore, { selectLevel, selectLevelProgress } from '../stores/useStatsStore';
import { addTask, toggleTaskComplete, deleteTask } from '../lib/taskService';
import { updateStatsOnComplete } from '../lib/statsService';
import { getNewlyUnlocked, getBadgeById } from '../lib/badges';
import { playCompleteSound, playBadgeSound } from '../lib/sounds';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import TaskFilter from '../components/TaskFilter';
import EmptyState from '../components/EmptyState';
import StreakBanner from '../components/StreakBanner';
import CompletionEffect from '../components/CompletionEffect';
import BadgeToast from '../components/BadgeToast';
import TaskSkeleton from '../components/TaskSkeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading, subscribe: subscribeTasks, unsubscribe: unsubTasks } = useTaskStore();
  const { currentStreak, longestStreak, unlockedBadges } = useStatsStore();
  const level = useStatsStore(selectLevel);
  const levelProgress = useStatsStore(selectLevelProgress);

  const [filter, setFilter] = useState('active');
  const [showEffect, setShowEffect] = useState(false);
  const [pendingBadge, setPendingBadge] = useState(null);
  const prevBadgesRef = useRef([]);

  // Subscribe to tasks and stats on mount
  useEffect(() => {
    if (!user) return;
    subscribeTasks(user.uid);
    return () => unsubTasks();
  }, [user, subscribeTasks, unsubTasks]);

  // Check for newly unlocked badges
  useEffect(() => {
    if (unlockedBadges.length > 0) {
      const newlyUnlocked = getNewlyUnlocked(prevBadgesRef.current, unlockedBadges);
      if (newlyUnlocked.length > 0) {
        const badge = getBadgeById(newlyUnlocked[0]);
        if (badge) {
          setPendingBadge(badge);
          playBadgeSound();
        }
      }
      prevBadgesRef.current = unlockedBadges;
    }
  }, [unlockedBadges]);

  // Derived state for tasks
  const counts = useMemo(() => {
    const active = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    return { all: tasks.length, active, completed };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let result = filter === 'active' 
      ? tasks.filter(t => !t.completed) 
      : filter === 'completed' 
        ? tasks.filter(t => t.completed) 
        : [...tasks];
    
    const todayStr = new Date().toISOString().split('T')[0];
    const getPriority = (t) => {
      if (!t.deadline) return 3;
      const dStr = new Date(t.deadline).toISOString().split('T')[0];
      if (dStr < todayStr) return 1;
      if (dStr === todayStr) return 2;
      return 3;
    };

    // Ordina non-abitudini
    return result.sort((a, b) => {
      if (a.type === 'habit' && b.type === 'habit') return 0;
      
      const pA = getPriority(a);
      const pB = getPriority(b);
      
      if (pA !== pB) return pA - pB;
      
      if (a.deadline && b.deadline) {
        return new Date(a.deadline) - new Date(b.deadline);
      }
      return 0;
    });
  }, [tasks, filter]);

  const handleAddTask = async (title, difficulty, deadline, type) => {
    if (!user) return;
    try {
      await addTask(user.uid, title, difficulty, deadline, type);
    } catch (e) {
      console.error("Error adding task:", e);
    }
  };

  const handleToggleTask = useCallback(async (taskId, currentlyCompleted) => {
    try {
      await toggleTaskComplete(taskId, currentlyCompleted);
      // If completing (not un-completing), trigger gamification
      if (!currentlyCompleted && user) {
        playCompleteSound();
        setShowEffect(true);
        const taskObj = tasks.find(t => t.id === taskId);
        await updateStatsOnComplete(user.uid, taskObj);
      }
    } catch (e) {
      console.error("Error toggling task:", e);
    }
  }, [user, tasks]);

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  };

  const handleEffectComplete = useCallback(() => {
    setShowEffect(false);
  }, []);

  const handleBadgeDismiss = useCallback(() => {
    setPendingBadge(null);
  }, []);

  return (
    <div className="p-4 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {/* ── Header: "Ciao, Marco 👋" + LVL & Coins ── */}
        <div className="mb-4 flex justify-between items-start pt-1">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#DEE1F7' }}>
              Ciao{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#958DA1' }}>
              Pronto per una nuova missione?
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-2">
              <motion.span
                key={`coins-${useStatsStore.getState().coins}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="chip-xp flex items-center gap-1"
                style={{
                  background: 'rgba(238,152,0,0.15)',
                  color: '#FFB95F',
                  borderColor: 'rgba(238,152,0,0.25)',
                  fontSize: '0.75rem',
                  padding: '4px 8px',
                }}
              >
                <span>🪙</span>
                <span className="font-bold">{useStatsStore(state => state.coins)}</span>
              </motion.span>

              <motion.span
                key={level}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                className="level-pill"
              >
                LVL {level}
              </motion.span>
            </div>
            
            {/* XP progress bar under pills */}
            <div className="progress-track w-full flex-shrink-0" style={{ maxWidth: '80px', alignSelf: 'flex-end' }}>
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Streak Banner */}
        <StreakBanner
          currentStreak={currentStreak}
          longestStreak={longestStreak}
        />

        {/* Input */}
        <TaskInput onAdd={handleAddTask} />

        {/* Filter */}
        {tasks.length > 0 && (
          <TaskFilter filter={filter} onChange={setFilter} counts={counts} />
        )}

        {/* ── Task List ── */}
        <div className="space-y-8 mt-4">
          {loading && tasks.length === 0 ? (
            <TaskSkeleton />
          ) : filteredTasks.length > 0 ? (
            <>
              {/* Abitudini */}
              <div>
                <h2 className="text-sm font-bold text-[#958DA1] uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                  <span>🔄</span> Le Tue Abitudini
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.filter(t => t.type === 'habit').length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-6 text-[#958DA1] border border-dashed border-white/10 rounded-2xl bg-[#191725]/30"
                      >
                        <p className="text-sm">Nessuna abitudine qua.</p>
                      </motion.div>
                    ) : (
                      filteredTasks.filter(t => t.type === 'habit').map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Progetti Master */}
              <div>
                <h2 className="text-sm font-bold text-[#958DA1] uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                  <span>👑</span> Progetti Master
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.filter(t => t.type === 'project').length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-4 text-[#958DA1] border border-dashed border-white/10 rounded-2xl bg-[#191725]/30"
                      >
                        <p className="text-sm">Nessun progetto in corso.</p>
                      </motion.div>
                    ) : (
                      filteredTasks.filter(t => t.type === 'project').map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Missioni */}
              <div>
                <h2 className="text-sm font-bold text-[#958DA1] uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                  <span>🎯</span> Missioni Singole
                </h2>
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.filter(t => t.type !== 'habit' && t.type !== 'project').length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-8 text-[#958DA1] border border-dashed border-white/10 rounded-2xl bg-[#191725]/30"
                      >
                        <p>Nessuna missione da completare.</p>
                        <p className="text-sm mt-1 opacity-75">Ottimo lavoro!</p>
                      </motion.div>
                    ) : (
                      filteredTasks.filter(t => t.type !== 'habit' && t.type !== 'project').map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={handleToggleTask}
                          onDelete={handleDeleteTask}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </>
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </motion.div>

      {/* Completion Effect Overlay */}
      <CompletionEffect show={showEffect} onComplete={handleEffectComplete} />

      {/* Badge Toast */}
      <BadgeToast badge={pendingBadge} onDismiss={handleBadgeDismiss} />
    </div>
  );
}
