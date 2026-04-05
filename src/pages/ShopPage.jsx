import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useStatsStore from '../stores/useStatsStore';
import { useAuth } from '../contexts/AuthContext';
import { buyItem, consumeItem, getCustomRewards, createCustomReward, deleteCustomReward } from '../lib/shopService';
import useTaskStore from '../stores/useTaskStore';
import { updateTask } from '../lib/taskService';
import HealingEffect from '../components/HealingEffect';

const SHOP_ITEMS = [
  { id: 'health_potion', name: 'Pozione Curativa', desc: 'Ripristina uno Streak perso.', price: 50, icon: '🍷', color: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', textColor: '#FCA5A5' },
  { id: 'resurrect_scroll', name: 'Pergamena del Tempo', desc: 'Estende la scadenza di un task.', price: 150, icon: '📜', color: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', textColor: '#FCD34D' },
  { id: 'focus_elixir', name: 'Elisir del Focus', desc: 'Raddoppia XP per 1 Giorno.', price: 300, icon: '🧪', color: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.3)', textColor: '#C4B5FD' }
];

export default function ShopPage() {
  const { user } = useAuth();
  const coins = useStatsStore(state => state.coins);
  const inventory = useStatsStore(state => state.inventory);
  
  const { tasks, subscribe: subscribeTasks, unsubscribe: unsubTasks } = useTaskStore();
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const [selectedTaskForScroll, setSelectedTaskForScroll] = useState(null);
  const [newScrollDate, setNewScrollDate] = useState('');
  const [showHealing, setShowHealing] = useState(false);
  
  const [tab, setTab] = useState('negozio'); // 'negozio' | 'desideri' | 'zaino'
  const [buyingId, setBuyingId] = useState(null);
  const [errorId, setErrorId] = useState(null);
  
  const [customRewards, setCustomRewards] = useState([]);
  const [loadingCustom, setLoadingCustom] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('100');

  const loadCustomRewards = useCallback(async () => {
    if (!user) return;
    setLoadingCustom(true);
    try {
      const data = await getCustomRewards(user.uid);
      setCustomRewards(data);
    } catch (e) {
      console.error(e);
    }
    setLoadingCustom(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    subscribeTasks(user.uid);
    return () => unsubTasks();
  }, [user, subscribeTasks, unsubTasks]);

  useEffect(() => {
    if (tab === 'desideri') {
      loadCustomRewards();
    }
  }, [tab, loadCustomRewards]);

  const handleBuy = async (item, isCustom = false) => {
    if (!user) return;
    if (coins < item.price) {
      setErrorId(item.id);
      setTimeout(() => setErrorId(null), 500);
      return;
    }
    setBuyingId(item.id);
    try {
      if (isCustom) {
        await buyItem(user.uid, item.id, item.price);
      } else {
        await buyItem(user.uid, item.id, item.price);
      }
    } catch (e) {
      console.error(e);
      setErrorId(item.id);
      setTimeout(() => setErrorId(null), 500);
    } finally {
      setBuyingId(null);
    }
  };

  const handleConsume = async (itemId) => {
    if (!user) return;
    
    // Mostra selettore per pergamena (non consumare item subito)
    if (itemId === 'resurrect_scroll') {
      setSelectedTaskForScroll(null);
      setNewScrollDate('');
      setShowTaskSelector(true);
      return;
    }
    
    try {
      if (itemId === 'health_potion') {
        setShowHealing(true); // Animazione curativa
      }
      
      await consumeItem(user.uid, itemId, false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCustom = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) return;
    try {
      await createCustomReward(user.uid, newTitle.trim(), newPrice, '🎁');
      setNewTitle('');
      setNewPrice('100');
      setShowAddCustom(false);
      loadCustomRewards();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 pb-28">
      {/* ── Header ── */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center justify-between mb-4 pt-1">
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

        {/* ── Tabs ── */}
        <div className="flex bg-[rgba(26,31,47,0.7)] rounded-xl p-1 mb-6 border border-[rgba(210,187,255,0.08)] backdrop-blur-md">
          {['negozio', 'desideri', 'zaino'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 text-xs sm:text-sm font-bold uppercase tracking-wider py-2 rounded-lg transition-colors ${
                tab === t ? 'bg-[#7C3AED] text-white shadow-md' : 'text-[#958DA1] hover:bg-white/5'
              }`}
            >
              {t === 'negozio' ? 'Sistema' : t === 'desideri' ? 'Desideri' : 'Zaino'}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          {tab === 'negozio' && (
            <motion.div key="negozio" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
              {SHOP_ITEMS.map((item) => {
                const canAfford = coins >= item.price;
                const isError = errorId === item.id;
                const isBuying = buyingId === item.id;

                return (
                  <div key={item.id} className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(25,23,37,0.7)', border: `1px solid rgba(255,255,255,0.05)`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl shrink-0" style={{ background: item.color, border: `1px solid ${item.border}` }}>
                        {item.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm" style={{ color: item.textColor }}>{item.name}</h3>
                        <p className="text-xs mt-1" style={{ color: '#958DA1' }}>{item.desc}</p>
                      </div>
                    </div>
                    <motion.button animate={isError ? { x: [-5, 5, -5, 5, 0] } : {}} onClick={() => handleBuy(item)} disabled={isBuying} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs transition-all relative overflow-hidden group" style={{ background: canAfford ? 'rgba(238,152,0,0.15)' : 'rgba(255,255,255,0.05)', color: canAfford ? '#FFB95F' : 'rgba(255,255,255,0.3)', border: `1px solid ${canAfford ? 'rgba(238,152,0,0.25)' : 'transparent'}` }}>
                      {isBuying ? <span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FFB95F', borderTopColor: 'transparent' }}></span> : <><span>🪙</span><span>{item.price}</span></>}
                    </motion.button>
                  </div>
                );
              })}
            </motion.div>
          )}

          {tab === 'desideri' && (
            <motion.div key="desideri" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
              <button onClick={() => setShowAddCustom(!showAddCustom)} className="w-full py-3 rounded-xl border border-dashed border-[#7C3AED]/40 text-[#D2BBFF] text-sm font-bold bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 transition-colors uppercase tracking-wider flex items-center justify-center gap-2">
                {showAddCustom ? 'Annulla' : '+ Crea Nuovo Desiderio'}
              </button>

              <AnimatePresence>
                {showAddCustom && (
                  <motion.form initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} onSubmit={handleCreateCustom} className="overflow-hidden mb-2 bg-[#1A1F2F] p-4 rounded-2xl border border-[rgba(210,187,255,0.1)]">
                    <div className="flex flex-col gap-3">
                      <input type="text" placeholder="Nome Desiderio (es. Pizza, Film)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] text-white" />
                      <div className="flex items-center gap-3">
                        <span className="text-[#FFB95F] shrink-0 font-bold">🪙 Costo:</span>
                        <input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} min="10" className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#7C3AED] text-[#FFB95F] font-bold" />
                      </div>
                      <button type="submit" className="mt-2 bg-[#7C3AED] text-white font-bold py-2 rounded-lg text-sm shadow-lg hover:bg-[#6D28D9] transition-colors">
                        Salva Desiderio
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {loadingCustom ? (
                <div className="text-center text-sm text-[#958DA1] py-8">Caricamento...</div>
              ) : customRewards.length === 0 ? (
                <div className="text-center text-sm text-[#958DA1] py-8 border border-dashed border-white/5 rounded-xl">
                  Nessun desiderio creato.
                </div>
              ) : (
                customRewards.map((reward) => (
                  <div key={reward.id} className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(25,23,37,0.7)', border: `1px solid rgba(255,255,255,0.05)` }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl shrink-0" style={{ background: 'rgba(210,187,255,0.1)', border: '1px solid rgba(210,187,255,0.2)' }}>{reward.icon || '🎁'}</div>
                      <div>
                        <h3 className="font-bold text-sm text-[#DEE1F7]">{reward.name}</h3>
                        <p className="text-xs mt-1" style={{ color: '#958DA1' }}>Ricompensa personale</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => deleteCustomReward(reward.id).then(loadCustomRewards)} className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20">
                         ×
                       </button>
                       <button onClick={() => handleBuy(reward, true)} disabled={buyingId === reward.id} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold text-xs" style={{ background: coins >= reward.price ? 'rgba(238,152,0,0.15)' : 'rgba(255,255,255,0.05)', color: coins >= reward.price ? '#FFB95F' : 'rgba(255,255,255,0.3)' }}>
                         <span>🪙</span><span>{reward.price}</span>
                       </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'zaino' && (
            <motion.div key="zaino" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex flex-col gap-4">
              {Object.keys(inventory).length === 0 ? (
                <div className="text-center text-sm text-[#958DA1] py-12 border border-dashed border-white/5 rounded-xl">
                  Il tuo zaino è vuoto.
                </div>
              ) : (
                Object.entries(inventory).map(([id, invItem]) => {
                  if (!invItem || invItem.quantity <= 0) return null;
                  const shopData = SHOP_ITEMS.find(s => s.id === id);
                  const icon = shopData?.icon || '🎁';
                  const name = shopData?.name || `Custom Reward (${id.substring(0,4)})`;
                  const color = shopData?.color || 'rgba(210,187,255,0.1)';
                  const border = shopData?.border || 'rgba(210,187,255,0.2)';
                  
                  return (
                    <div key={id} className="relative overflow-hidden rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(25,23,37,0.7)', border: `1px solid rgba(255,255,255,0.05)`, boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 flex items-center justify-center rounded-xl text-2xl shrink-0" style={{ background: color, border: `1px solid ${border}` }}>
                          {icon}
                          <span className="absolute -top-2 -right-2 bg-[#7C3AED] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1A1F2F]">
                            {invItem.quantity}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#DEE1F7]">{name}</h3>
                        </div>
                      </div>
                      <button onClick={() => handleConsume(id)} className="px-4 py-2 bg-[#7C3AED] text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:bg-[#6D28D9] transition-transform hover:scale-105 uppercase tracking-wider">
                        Usa
                      </button>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Healing Effect */}
      <HealingEffect show={showHealing} onComplete={() => setShowHealing(false)} />

      {/* Task Selector Modal per Pergamena del Tempo */}
      <AnimatePresence>
        {showTaskSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              className="glass-card w-full max-w-sm p-6 rounded-3xl border border-[rgba(245,158,11,0.3)] shadow-[0_4px_32px_rgba(245,158,11,0.2)] relative"
            >
               <div className="flex items-center gap-3 mb-4">
                 <span className="text-3xl">📜</span>
                 <div>
                   <h3 className="font-bold text-lg text-[#FCD34D]">Pergamena del Tempo</h3>
                   <p className="text-xs text-[#958DA1]">
                     {!selectedTaskForScroll 
                       ? "Seleziona il task da modificare." 
                       : `Modifica scadenza per: ${selectedTaskForScroll.title}`}
                   </p>
                 </div>
               </div>
               
               <div className="max-h-60 overflow-y-auto space-y-2 mb-4 custom-scrollbar">
                 {!selectedTaskForScroll ? (
                   tasks.filter(t => !t.completed && t.type !== 'habit').length === 0 ? (
                      <p className="text-sm text-[#958DA1] text-center py-4">Nessun task disponibile.</p>
                   ) : (
                     tasks.filter(t => !t.completed && t.type !== 'habit').map(task => (
                       <button
                         key={task.id}
                         onClick={() => {
                           setSelectedTaskForScroll(task);
                           setNewScrollDate(task.deadline || new Date().toISOString().split('T')[0]);
                         }}
                         className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex justify-between items-center"
                       >
                         <span className="text-sm font-medium text-white truncate pr-2">{task.title}</span>
                         {task.deadline && <span className="text-[10px] text-[#958DA1] shrink-0">{task.deadline}</span>}
                       </button>
                     ))
                   )
                 ) : (
                   <div className="space-y-4 py-2">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs text-[#958DA1] font-bold uppercase tracking-wider">Nuova Data</label>
                        <input 
                          type="date" 
                          value={newScrollDate} 
                          onChange={(e) => setNewScrollDate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#FCD34D]"
                        />
                      </div>
                      <button
                        onClick={async () => {
                          if (!newScrollDate) return;
                          await updateTask(selectedTaskForScroll.id, { deadline: newScrollDate });
                          await consumeItem(user.uid, 'resurrect_scroll', false);
                          setShowTaskSelector(false);
                          setSelectedTaskForScroll(null);
                        }}
                        className="w-full py-3 bg-[#F59E0B] text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.02] transition-transform"
                      >
                        Conferma Modifica
                      </button>
                   </div>
                 )}
               </div>
               
               <button
                 onClick={() => setShowTaskSelector(false)}
                 className="w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold text-sm transition-colors"
               >
                 Annulla
               </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}