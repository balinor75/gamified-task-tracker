import { motion } from 'framer-motion';

export default function EmptyState({ filter }) {
  const getMessage = () => {
    switch (filter) {
      case 'completed':
        return {
          emoji: '🌱',
          title: 'Nessun task completato',
          subtitle: "Completa i tuoi task per vederli qui e guadagnare EXP.",
        };
      case 'active':
        return {
          emoji: '🎉',
          title: 'Tutto fatto!',
          subtitle: "Hai completato tutti i tuoi task attivi. Ottimo lavoro!",
        };
      default:
        return {
          emoji: '📝',
          title: 'Nessun task',
          subtitle: "Aggiungi il tuo primo task qui sopra per iniziare.",
        };
    }
  };

  const content = getMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-20 h-20 bg-surface-card rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-sm border border-white/5">
        {content.emoji}
      </div>
      <h3 className="text-xl font-bold text-text mb-2">
        {content.title}
      </h3>
      <p className="text-text-secondary max-w-[250px] mx-auto text-sm leading-relaxed">
        {content.subtitle}
      </p>
    </motion.div>
  );
}
