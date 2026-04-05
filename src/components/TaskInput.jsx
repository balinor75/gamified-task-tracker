import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TaskInput({ onAdd }) {
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [difficulty, setDifficulty] = useState('easy');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), difficulty, deadline || null);
      setTitle('');
      setDifficulty('easy');
      setDeadline('');
      setIsFocused(false);
    }
  };

  const handleBlur = (e) => {
    // ignoriamo onBlur se il focus va ad un figlio o ad un control interno del form stesso
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsFocused(false);
    }
  };

  // Expanded per: campo focus oppure se c'è testo digitato, o se l'utente sta interagendo coi figli
  const isExpanded = isFocused || title.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      className="mb-6 relative transition-colors duration-300"
      tabIndex="-1"
    >
      <motion.div
        layout
        className={`relative glass-card rounded-2xl overflow-hidden transition-all duration-300 ${
          isExpanded
            ? 'border-[#7C3AED]/50 ring-1 ring-[#7C3AED]/30 shadow-lg shadow-[#7C3AED]/10'
            : 'border-white/10 shadow-sm'
        }`}
        style={{ borderWidth: '1px', borderStyle: 'solid' }}
      >
        {/* riga input */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Aggiungi un nuovo task..."
            className="w-full bg-transparent py-4 pl-4 pr-14 text-[#DEE1F7] placeholder-[#CCC3D8]/50 focus:outline-none transition-all duration-300"
          />
          <motion.button
            type="submit"
            disabled={!title.trim()}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#D2BBFF] text-[#090E1C] p-2 w-10 h-10 rounded-xl font-bold disabled:opacity-30 disabled:bg-[#1A1F2F] disabled:text-[#958DA1] disabled:border disabled:border-white/10 flex items-center justify-center transition-all duration-200 shadow-md shadow-[#7C3AED]/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>

        {/* espansione */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-[rgba(25,23,37,0.7)] border-t border-[rgba(210,187,255,0.06)]"
            >
              <div className="p-3 pl-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between flex-wrap">
                
                {/* Difficoltà */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-[#958DA1] uppercase tracking-wider shrink-0">Difficoltà:</span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => setDifficulty('easy')}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        difficulty === 'easy'
                          ? 'bg-[rgba(110,231,183,0.12)] text-[#6EE7B7] border border-[rgba(110,231,183,0.2)]'
                          : 'text-[#CCC3D8] hover:bg-white/5 opacity-60'
                      }`}
                    >
                      Facile
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('medium')}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        difficulty === 'medium'
                          ? 'bg-[rgba(255,185,95,0.12)] text-[#FFB95F] border border-[rgba(255,185,95,0.2)]'
                          : 'text-[#CCC3D8] hover:bg-white/5 opacity-60'
                      }`}
                    >
                      Media
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('hard')}
                      className={`px-2 py-0.5 rounded-full text-xs font-bold transition-colors ${
                        difficulty === 'hard'
                          ? 'bg-[rgba(255,180,171,0.12)] text-[#FFB4AB] border border-[rgba(255,180,171,0.2)]'
                          : 'text-[#CCC3D8] hover:bg-white/5 opacity-60'
                      }`}
                    >
                      Difficile
                    </button>
                  </div>
                </div>

                {/* Scadenza */}
                <div className="flex flex-wrap items-center gap-2 max-w-full">
                  <span className="text-xs font-semibold text-[#958DA1] uppercase tracking-wider shrink-0">Scadenza:</span>
                  <div className="flex items-center gap-1 min-w-0">
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-[rgba(255,255,255,0.04)] border border-[rgba(210,187,255,0.12)] rounded-lg px-2 py-1 text-xs text-[#DEE1F7] focus:outline-none focus:border-[#7C3AED]/50 transition-colors max-w-[130px] sm:max-w-none"
                    />
                    {deadline && (
                       <button type="button" onClick={() => setDeadline('')} className="text-[#FFB4AB] opacity-80 hover:opacity-100 transition-opacity">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                       </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </form>
  );
}
