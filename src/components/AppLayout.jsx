import { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import useStatsStore from '../stores/useStatsStore';

export default function AppLayout() {
  const { user } = useAuth();

  // Subscribe to stats at layout level so it persists across pages
  useEffect(() => {
    if (!user) return;
    useStatsStore.getState().subscribe(user.uid);
    return () => useStatsStore.getState().unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-surface text-text">
      {/* Main content area */}
      <main className="max-w-lg mx-auto">
        <Outlet />
      </main>

      {/* Bottom navigation bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-card/80 backdrop-blur-xl border-t border-white/5 safe-bottom pb-2 pt-1 z-50">
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
            ? 'text-primary bg-primary/10 scale-105' 
            : 'text-text-secondary hover:text-text hover:bg-white/5'
        }`
      }
    >
      <span className="text-xl mb-0.5">{icon}</span>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </NavLink>
  );
}
