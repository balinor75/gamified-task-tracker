import { motion } from 'framer-motion';

/**
 * ShopPage — Bottega delle Ricompense
 * Placeholder for V2 Pillar 3: Reward Shop with Gold currency.
 * Full implementation tracked in feature/pillar-reward-shop.
 */
export default function ShopPage() {
  return (
    <div className="p-4 pb-28">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between mb-6 pt-1">
          <h1 className="text-2xl font-bold" style={{ color: '#DEE1F7' }}>
            🏪 Bottega delle Ricompense
          </h1>
          <span className="chip-xp" style={{
            background: 'rgba(238,152,0,0.15)',
            color: '#FFB95F',
            borderColor: 'rgba(238,152,0,0.25)',
            fontSize: '0.75rem',
            padding: '4px 12px',
          }}>
            💰 0 Monete
          </span>
        </div>

        {/* Coming Soon Card */}
        <div
          className="hero-card rounded-3xl p-8 text-center"
          style={{ marginTop: '2rem' }}
        >
          <div className="text-5xl mb-4">⚗️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#D2BBFF' }}>
            In Lavorazione
          </h2>
          <p className="text-sm" style={{ color: '#CCC3D8', lineHeight: 1.6 }}>
            La Bottega sta raccogliendo le sue merci più preziose.
            Completa missioni per guadagnare <span style={{ color: '#FFB95F', fontWeight: 700 }}>Monete d'Oro</span> e
            sblocca ricompense reali!
          </p>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {['🎬 Netflix', '🌿 Passeggiata', '🎮 Videogiochi', '💆 Massaggio'].map(r => (
              <span
                key={r}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(124,58,237,0.12)',
                  color: '#D2BBFF',
                  border: '1px solid rgba(124,58,237,0.2)',
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
