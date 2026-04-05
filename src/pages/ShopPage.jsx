import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStatsStore from '../stores/useStatsStore';
import { useAuth } from '../contexts/AuthContext';
import { buyItem } from '../lib/shopService';

const SHOP_ITEMS = [
  { id: 'health_potion', name: 'Pozione Curativa', desc: 'Ripristina uno Streak perso.', price: 50, icon: '🍷', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', textColor: '#FCA5A5' },
  { id: 'resurrect_scroll', name: 'Pergamena del Tempo', desc: 'Estende la scadenza di un task.', price: 150, icon: '📜', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', textColor: '#FCD34D' },
  { id: 'focus_elixir', name: 'Elisir del Focus', desc: 'Raddoppia XP per 1 Giorno.', price: 300, icon: '🧪', color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', textColor: '#C4B5FD' }
];

export default function ShopPage() {
  const { user } = useAuth();
  const coins = useStatsStore(state => state.coins);
  const inventory = useStatsStore(state => state.inventory);
  
  const [buyingId, setBuyingId] = useState(null);
  const [errorId, setErrorId] = useState(null);

  const handleBuy = async (item) => {
    if (!user) return;
    
    if (coins < item.price) {
      setErrorId(item.id);
      setTimeout(() => setErrorId(null), 500); // Reset shake after 500ms
      return;
    }

    setBuyingId(item.id);
    try {
      await buyItem(user.uid, item.id, item.price);
    } catch (e) {
      console.error(e);
      setErrorId(item.id);
      setTimeout(() => setErrorId(null), 500);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div className="p-4 pb-28">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between mb-8 pt-1">
          <h1 className="text-2xl font-bold" style={{ color: '#DEE1F7' }}>
            🏪 Bottega
          </h1>
          <motion.span 
            key={coins}
            initial={{ scale: 1.2, color: '#fff' }}
            animate={{ scale: 1, color: '#FFB95F' }}
            className="chip-xp flex items-center gap-1.5" 
            style={{
              background: 'rgba(238,152,0,0.15)',
              borderColor: 'rgba(238,152,0,0.25)',
              fontSize: '0.875rem',
              padding: '6px 14px',
            }}
          >
            <span>🪙</span>
            <span className="font-bold">{coins}</span>
          </motion.span>
        </div>

        {/* ── Grid Items ── */}
        <div className="flex flex-col gap-4">
          {SHOP_ITEMS.map((item, index) => {
            const qty = inventory[item.id]?.quantity || 0;
            const canAfford = coins >= item.price;
            const isError = errorId === item.id;
            const isBuying = buyingId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between"
                style={{
                  background: 'rgba(25,23,37,0.7)',
                  border: `1px solid rgba(255,255,255,0.05)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl shrink-0"
                    style={{ background: item.color, border: `1px solid ${item.border}` }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: item.textColor }}>{item.name}</h3>
                    <p className="text-xs mt-1" style={{ color: '#958DA1' }}>{item.desc}</p>
                    {qty > 0 && (
                      <div className="text-[10px] font-bold mt-1.5 uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                        Possiedi: {qty}
                      </div>
                    )}
                  </div>
                </div>

                <motion.button
                  animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleBuy(item)}
                  disabled={isBuying}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all relative overflow-hidden group"
                  style={{
                    background: canAfford ? 'rgba(238,152,0,0.15)' : 'rgba(255,255,255,0.05)',
                    color: canAfford ? '#FFB95F' : 'rgba(255,255,255,0.3)',
                    border: `1px solid ${canAfford ? 'rgba(238,152,0,0.25)' : 'transparent'}`,
                  }}
                >
                  {/* Effetto hover per button acquistabile */}
                  {canAfford && !isBuying && (
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
                  )}

                  {isBuying ? (
                    <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FFB95F', borderTopColor: 'transparent' }}></span>
                  ) : (
                    <>
                      <span>🪙</span>
                      <span>{item.price}</span>
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
