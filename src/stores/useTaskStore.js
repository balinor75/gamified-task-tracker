import { create } from 'zustand';
import { subscribeTasks } from '../lib/taskService';

const useTaskStore = create((set, get) => ({
  tasks: [],
  filter: 'all', // 'all' | 'active' | 'completed'
  loading: true,
  _unsub: null,

  /** Activate Firestore real-time listener for a user. */
  subscribe(uid) {
    // Prevent double subscription
    const prev = get()._unsub;
    if (prev) prev();

    set({ loading: true });

    const unsub = subscribeTasks(uid, (tasks) => {
      set({ tasks, loading: false });
    });

    set({ _unsub: unsub });
  },

  /** Stop listening and clear data. */
  unsubscribe() {
    const unsub = get()._unsub;
    if (unsub) unsub();
    set({ tasks: [], _unsub: null, loading: true });
  },

  /** Set the active filter. */
  setFilter(filter) {
    set({ filter });
  },

  /** Get tasks filtered by current filter. */
  get filteredTasks() {
    // Not a real getter — use the selector below instead
    return [];
  },
}));

/** Selector: get tasks filtered by the active filter */
export function selectFilteredTasks(state) {
  const { tasks, filter } = state;
  if (filter === 'active') return tasks.filter((t) => !t.completed);
  if (filter === 'completed') return tasks.filter((t) => t.completed);
  return tasks;
}

/** Selector: count tasks by status */
export function selectCounts(state) {
  const all = state.tasks.length;
  const completed = state.tasks.filter((t) => t.completed).length;
  return { all, active: all - completed, completed };
}

export default useTaskStore;
