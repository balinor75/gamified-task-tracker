import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TaskInput({ onAdd }) {
  const [title, setTitle] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim());
      setTitle('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Aggiungi un nuovo task..."
          className={`w-full glass-card rounded-2xl py-4 pl-4 pr-14 text-text placeholder:text-text-secondary/50 focus:outline-none transition-all duration-300 ${
            isFocused
              ? 'border-primary/50 ring-1 ring-primary/30 shadow-lg shadow-primary/10'
              : 'border-white/10 shadow-sm'
          }`}
          style={{
            borderWidth: '1px',
            borderStyle: 'solid',
          }}
        />
        <motion.button
          type="submit"
          disabled={!title.trim()}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-background p-2 w-10 h-10 rounded-xl font-bold disabled:opacity-30 disabled:bg-surface-card disabled:text-text-secondary disabled:border disabled:border-white/10 flex items-center justify-center transition-all duration-200 shadow-md shadow-primary/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
    </form>
  );
}
