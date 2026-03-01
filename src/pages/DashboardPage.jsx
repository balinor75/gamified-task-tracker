import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    return (
        <div className="p-4 pb-24">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                {/* Welcome header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text">
                        Ciao{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Pronto per una giornata produttiva?
                    </p>
                </div>

                {/* Placeholder card — will be replaced by Task Board in Fase 2 */}
                <div className="bg-surface-card rounded-2xl p-6 border border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🚀</span>
                        <div>
                            <h2 className="text-lg font-semibold text-text">Setup completato!</h2>
                            <p className="text-text-secondary text-sm">
                                L'autenticazione funziona. Il Task Board arriva presto.
                            </p>
                        </div>
                    </div>

                    <div className="text-sm text-text-secondary space-y-1 bg-surface rounded-xl p-4">
                        <p><span className="text-text-secondary/60">Email:</span> {user?.email}</p>
                        <p><span className="text-text-secondary/60">UID:</span> <span className="font-mono text-xs">{user?.uid}</span></p>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={logout}
                    className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-text font-medium rounded-xl transition-all duration-200"
                >
                    Esci dall'account
                </button>
            </motion.div>
        </div>
    );
}
