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
            className="relative px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap"
            style={{ color: isActive ? '#EDE0FF' : '#958DA1' }}
          >
            {isActive && (
              <motion.div
                layoutId="active-filter"
                className="absolute inset-0 rounded-full z-0"
                style={{ background: 'rgba(124,58,237,0.75)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.label}
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={isActive
                  ? { background: 'rgba(255,255,255,0.15)', color: '#EDE0FF' }
                  : { background: 'rgba(37,41,58,0.8)', color: '#958DA1', border: '1px solid rgba(74,68,85,0.3)' }
                }
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
