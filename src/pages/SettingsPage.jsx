import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <div className="p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text mb-6">Impostazioni</h1>
        
        <div className="bg-surface-card rounded-2xl p-6 border border-white/5 mb-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">Profilo</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-xl">
              {user?.displayName ? user.displayName[0].toUpperCase() : user?.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-text">{user?.displayName || 'Utente'}</p>
              <p className="text-sm text-text-secondary">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-500 font-medium rounded-xl transition-all duration-200"
          >
            Esci dall'account
          </button>
        </div>
      </motion.div>
    </div>
  );
}
