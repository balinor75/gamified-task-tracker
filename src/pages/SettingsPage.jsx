import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PREFS_KEY = 'gtt_preferences';

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : { sounds: true, animations: true };
  } catch {
    return { sounds: true, animations: true };
  }
}

function savePrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState(loadPrefs);

  useEffect(() => {
    savePrefs(prefs);
  }, [prefs]);

  const togglePref = (key) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold text-text mb-6">Impostazioni</h1>

      {/* Profile Section */}
      <div className="glass-card glow-hover rounded-2xl p-6 mb-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Profilo</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            {user?.displayName ? user.displayName[0].toUpperCase() : user?.email[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-text">{user?.displayName || 'Utente'}</p>
            <p className="text-sm text-text-secondary">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-medium rounded-xl transition-all duration-200 active:scale-[0.98]"
        >
          Esci dall'account
        </button>
      </div>

      {/* Preferences Section */}
      <div className="glass-card glow-hover rounded-2xl p-6 mb-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Preferenze</h2>

        <ToggleRow
          label="Suoni"
          description="Effetti sonori al completamento"
          icon="🔊"
          checked={prefs.sounds}
          onChange={() => togglePref('sounds')}
        />
        <div className="h-px bg-white/5 my-3" />
        <ToggleRow
          label="Animazioni"
          description="Confetti e animazioni di completamento"
          icon="✨"
          checked={prefs.animations}
          onChange={() => togglePref('animations')}
        />
      </div>

      {/* Risorse Section */}
      <div className="glass-card glow-hover rounded-2xl p-6 mb-4">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Risorse</h2>
        <button
          onClick={() => navigate('/guide')}
          className="w-full flex items-center justify-between py-3 px-1 text-left group"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">📖</span>
            <div>
              <p className="text-sm font-medium text-text">Manuale d'uso</p>
              <p className="text-xs text-text-secondary">Scopri come funzionano XP, Streak e Shop</p>
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#958DA1] group-hover:text-[#D2BBFF] transition-colors shrink-0">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* App Info Section */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-4">Info App</h2>
        <div className="space-y-3">
          <InfoRow label="Versione" value="1.2.0" />
          <InfoRow label="Stack" value="React + Firebase" />
          <InfoRow label="Autore" value="@balinor75" />
        </div>
        <p className="text-[10px] text-text-secondary/40 mt-4 text-center">
          Gamified Task Tracker — Trasforma ogni task in una vittoria 🎮
        </p>
      </div>
    </div>
  );
}

function ToggleRow({ label, description, icon, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <p className="text-sm font-medium text-text">{label}</p>
          <p className="text-xs text-text-secondary">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-primary' : 'bg-white/10'
        }`}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
        />
      </button>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text">{value}</span>
    </div>
  );
}
