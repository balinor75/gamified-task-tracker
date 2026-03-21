import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useStatsStore from '../stores/useStatsStore';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Subscribe to stats at layout level so it persists across pages
  useEffect(() => {
    if (!user) return;
    useStatsStore.getState().subscribe(user.uid);
    return () => useStatsStore.getState().unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-surface text-text">
      {/* Main content area with page transitions */}
      <main className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 glass-card bg-surface-card/70 backdrop-blur-2xl border-t border-white/5 safe-bottom pb-2 pt-1 z-50">
        <div className="max-w-lg mx-auto flex items-center justify-around h-14">
          <NavItem to="/" icon="🏠" label="Home" />
          <NavItem to="/stats" icon="📊" label="Stats" />
          <NavItem to="/settings" icon="⚙️" label="Impost." />
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center justify-center gap-1 w-16 h-full rounded-2xl transition-all duration-200 ${
          isActive 
            ? 'text-primary scale-105' 
            : 'text-text-secondary hover:text-text hover:bg-white/5'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="text-xl mb-0.5">{icon}</span>
          <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-primary' : ''}`}>
            {label}
          </span>
          {isActive && (
            <motion.div
              layoutId="nav-indicator"
              className="absolute -bottom-1 w-5 h-0.5 bg-primary rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
