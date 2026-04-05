import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuidePage() {
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
  };

  const sections = [
    {
      id: 'xp_coins',
      title: '🗡️ Livelli, XP e Monete',
      content: (
        <div className="space-y-2 text-sm text-[rgba(255,255,255,0.85)]">
          <p>
            Completando le tue task guadagnerai <strong>XP (Punti Esperienza)</strong> e <strong>Monete d'Oro</strong>.
            Ogni task ti dà un quantitativo base dipendente dalla sua difficoltà:
          </p>
          <ul className="list-disc pl-5 opacity-90 space-y-1">
            <li><strong>Facile:</strong> 10 Monete / XP</li>
            <li><strong>Media:</strong> 25 Monete / XP</li>
            <li><strong>Difficile:</strong> 50 Monete / XP</li>
          </ul>
          <p className="mt-2">
            <strong>🚀 Progetti Speciali:</strong> I "Progetti" richiedono l'uso di sotto-tappe. Essendo più lunghi da completare, moltiplicano la ricompensa finale:
            <br/>Facile (x2), Media (x3), Difficile (x4). Inoltre ogni singola tappa segnata ti fornisce un piccolo bonus di 5 Monete.
          </p>
        </div>
      )
    },
    {
      id: 'streak',
      title: '🔥 Lo Streak e le Fiamme',
      content: (
        <div className="space-y-2 text-sm text-[rgba(255,255,255,0.85)]">
          <p>
            Lo <strong>Streak (Serie)</strong> rappresenta quanti giorni consecutivi sei riuscito a completare almeno una task.
          </p>
          <p>
            Mantenere uno Streak alto sblocca <strong className="text-purple-300">Badge esclusivi</strong> e ti incoraggia a non spezzare la catena.
            Se salti un giorno, la tua fiamma si spegnerà e tornerai a zero!
          </p>
        </div>
      )
    },
    {
      id: 'shop_items',
      title: '🏪 Bottega e Oggetti',
      content: (
        <div className="space-y-2 text-sm text-[rgba(255,255,255,0.85)]">
          <p>Usa le <strong>Monete d'Oro</strong> raccolte per acquistare oggetti nella Bottega o per scambiarle con ricompense che tu stesso definisci!</p>
          <ul className="list-disc pl-5 opacity-90 space-y-2 mt-2">
            <li><strong>🍷 Pozione Curativa:</strong> Ti permette di recuperare lo streak precedente nel caso in cui tu lo abbia perso ieri. Molto utile per riprendere da dove eri rimasto!</li>
            <li><strong>📜 Pergamena del Tempo (WIP):</strong> A breve ti permetterà di estendere una scadenza.</li>
            <li><strong>🧪 Elisir del Focus:</strong> Ti garantisce XP e Monete RADDOPPIATE per le successive 24 ore. Ottimo quando sai di avere una giornata produttiva!</li>
          </ul>
          <p className="mt-4 border-t border-[rgba(255,255,255,0.1)] pt-2 text-[#D2BBFF]">
            <strong>🎁 I Tuoi Desideri:</strong> Puoi creare ricompense personalizzate (es. "Guardare un film", "Pausa snack") e comprarle scalandoti le monete in-game, trasformando i tuoi successi in premi reali.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="p-4 pb-28">
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 className="text-2xl font-bold mb-6 pt-1 text-[#DEE1F7]">
          📖 Manuale
        </h1>

        <div className="space-y-3">
          {sections.map(section => (
            <div key={section.id} className="relative overflow-hidden rounded-2xl" style={{
              background: 'rgba(25,23,37,0.7)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
            }}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-4 text-left focus:outline-none focus:bg-white/5 transition-colors"
              >
                <h2 className="font-bold text-[#DEE1F7]">{section.title}</h2>
                <motion.div
                  animate={{ rotate: openSection === section.id ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#958DA1] opacity-50 shrink-0"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.div>
              </button>

              <AnimatePresence>
                {openSection === section.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-[rgba(255,255,255,0.05)] mt-1">
                      {section.content}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
