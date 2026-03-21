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
    if (filter === 'active') return tasks.filter(t => !t.completed);
    if (filter === 'completed') return tasks.filter(t => t.completed);
    return tasks;
  }, [tasks, filter]);

  const handleAddTask = async (title) => {
    if (!user) return;
    try {
      await addTask(user.uid, title);
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
        await updateStatsOnComplete(user.uid);
      }
    } catch (e) {
      console.error("Error toggling task:", e);
    }
  }, [user]);

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
    <div className="p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-text">
              Ciao{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Pronto per una giornata produttiva?
            </p>
          </div>
          <div className="text-right">
            <motion.div
              key={level}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <span className="text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                Lvl {level}
              </span>
              {/* Level progress ring (simplified as a bottom bar) */}
              <div className="mt-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="h-full bg-primary/50 rounded-full"
                />
              </div>
            </motion.div>
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

        {/* Task List */}
        <div className="mt-4">
          {loading && tasks.length === 0 ? (
            <TaskSkeleton />
          ) : filteredTasks.length > 0 ? (
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </AnimatePresence>
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
