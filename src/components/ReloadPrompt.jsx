import { useRegisterSW } from 'virtual:pwa-register/react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export default function ReloadPrompt() {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {(offlineReady || needRefresh) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-xl shadow-indigo-500/10 border border-slate-700 bg-slate-800 text-slate-200 flex flex-col gap-3 max-w-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-100">
                {offlineReady
                  ? 'App pronta per l\'uso offline!'
                  : 'Nuovo aggiornamento disponibile'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {offlineReady
                  ? 'Ora puoi usare l\'app anche senza connessione.'
                  : 'Ricarica per vedere i nuovi contenuti.'}
              </p>
            </div>
            <button
              onClick={close}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              aria-label="Chiudi"
            >
              <X size={20} />
            </button>
          </div>
          
          {needRefresh && (
            <button
              onClick={() => updateServiceWorker(true)}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              <RefreshCw size={16} />
              <span>Ricarica ora</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
