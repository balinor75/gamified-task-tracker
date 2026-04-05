import { useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useStatsStore from '../stores/useStatsStore';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.14 } },
};

// Nav items definition
const NAV_ITEMS = [
  { to: '/',        icon: '🏠', label: 'Home'    },
  { to: '/stats',   icon: '📊', label: 'Stats'   },
  { to: '/shop',    icon: '🏪', label: 'Shop'    },
  { to: '/settings',icon: '⚙️', label: 'Impost.' },
];

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
    <div className="min-h-screen" style={{ backgroundColor: '#0E1322', color: '#DEE1F7' }}>

      {/* Main content — padded for bottom nav */}
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

      {/* ── Bottom Navigation Bar ── */}
      <nav
        className="nav-bar fixed bottom-0 left-0 right-0 safe-bottom z-50"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)' }}
      >
        <div className="max-w-lg mx-auto flex items-center justify-around h-[60px] px-2">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-0.5 w-[72px] h-[52px] rounded-2xl
         transition-all duration-200 select-none
         ${isActive ? 'nav-item-active' : 'nav-item-inactive hover:text-text/70'}`
      }
    >
      {({ isActive }) => (
        <>
          <motion.span
            className="text-[22px] leading-none"
            animate={isActive ? { scale: 1.08 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
          >
            {icon}
          </motion.span>
          <span
            className="text-[10px] font-semibold leading-none"
            style={{ color: isActive ? '#D2BBFF' : '#958DA1' }}
          >
            {label}
          </span>
          {/* Active dot indicator */}
          {isActive && (
            <motion.div
              layoutId="nav-dot"
              className="nav-dot absolute bottom-1.5"
              transition={{ type: 'spring', stiffness: 380, damping: 26 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
