import { motion } from 'framer-motion';

export default function StatsPage() {
  return (
    <div className="p-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-text mb-6">Statistiche</h1>
        <div className="bg-surface-card rounded-2xl p-8 text-center border border-white/5">
          <span className="text-4xl mb-4 block">📊</span>
          <h2 className="text-xl font-bold text-text mb-2">Work in Progress</h2>
          <p className="text-text-secondary text-sm">
            Qui vedrai i tuoi progressi, le serie e le statistiche dei task. Arriverà nella Fase 4.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
