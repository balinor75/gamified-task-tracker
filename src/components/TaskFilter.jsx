import { motion } from 'framer-motion';

export default function TaskFilter({ filter, onChange, counts }) {
  const tabs = [
    { id: 'all', label: 'Tutti', count: counts.all },
    { id: 'active', label: 'Attivi', count: counts.active },
    { id: 'completed', label: 'Completati', count: counts.completed },
  ];

  return (
    <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
      {tabs.map((tab) => {
        const isActive = filter === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? 'text-background' : 'text-text-secondary hover:text-text'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="active-filter"
                className="absolute inset-0 bg-primary rounded-full z-0"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.label}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-background/20 text-background'
                    : 'bg-surface-card text-text-secondary border border-white/5'
                }`}
              >
                {tab.count}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
