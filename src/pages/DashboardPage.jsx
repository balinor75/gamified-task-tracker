import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useTaskStore from '../stores/useTaskStore';
import { addTask, toggleTaskComplete, deleteTask } from '../lib/taskService';
import TaskInput from '../components/TaskInput';
import TaskItem from '../components/TaskItem';
import TaskFilter from '../components/TaskFilter';
import EmptyState from '../components/EmptyState';

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, loading, subscribe, unsubscribe } = useTaskStore();
  const [filter, setFilter] = useState('active');

  // Subscribe to tasks on mount
  useEffect(() => {
    if (!user) return;
    subscribe(user.uid);
    return () => unsubscribe();
  }, [user, subscribe, unsubscribe]);

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

  const handleToggleTask = async (taskId, currentlyCompleted) => {
    try {
      await toggleTaskComplete(taskId, currentlyCompleted);
    } catch (e) {
      console.error("Error toggling task:", e);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask(taskId);
    } catch (e) {
      console.error("Error deleting task:", e);
    }
  };

  return (
    <div className="p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-text">
              Ciao{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Pronto per una giornata produttiva?
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
              Lvl 1
            </span>
          </div>
        </div>

        {/* Input */}
        <TaskInput onAdd={handleAddTask} />

        {/* Filter */}
        {tasks.length > 0 && (
          <TaskFilter filter={filter} onChange={setFilter} counts={counts} />
        )}

        {/* Task List */}
        <div className="mt-4">
          {loading && tasks.length === 0 ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
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
    </div>
  );
}
