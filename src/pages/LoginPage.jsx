import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
    const { user, login, signup, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const [isSignup, setIsSignup] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // If already logged in, redirect to dashboard
    if (user) return <Navigate to="/" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isSignup) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/', { replace: true });
        } catch (err) {
            setError(getFriendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogle = async () => {
        setError('');
        setLoading(true);
        try {
            await loginWithGoogle();
            navigate('/', { replace: true });
        } catch (err) {
            if (err.code !== 'auth/popup-closed-by-user') {
                setError(getFriendlyError(err.code));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-sm"
            >
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="text-5xl mb-3"
                    >
                        🎮
                    </motion.div>
                    <h1 className="text-2xl font-bold text-text">
                        Gamified Task Tracker
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Trasforma ogni task in una vittoria
                    </p>
                </div>

                {/* Card */}
                <div className="bg-surface-card rounded-2xl p-6 shadow-xl shadow-black/20 border border-white/5">
                    {/* Tab Toggle */}
                    <div className="flex bg-surface rounded-xl p-1 mb-6">
                        <button
                            type="button"
                            onClick={() => { setIsSignup(false); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${!isSignup
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-secondary hover:text-text'
                                }`}
                        >
                            Accedi
                        </button>
                        <button
                            type="button"
                            onClick={() => { setIsSignup(true); setError(''); }}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${isSignup
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-text-secondary hover:text-text'
                                }`}
                        >
                            Registrati
                        </button>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-danger/10 border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-4"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                autoComplete={isSignup ? 'new-password' : 'current-password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={6}
                                className="w-full px-4 py-2.5 bg-surface border border-white/10 rounded-xl text-text placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Caricamento…
                                </span>
                            ) : isSignup ? (
                                'Crea account'
                            ) : (
                                'Accedi'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-text-secondary text-xs uppercase tracking-wider">oppure</span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        onClick={handleGoogle}
                        disabled={loading}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-text font-medium rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continua con Google
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-text-secondary/50 text-xs mt-6">
                    Gamified Task Tracker v1.0
                </p>
            </motion.div>
        </div>
    );
}

/** Map Firebase Auth error codes to user-friendly Italian messages */
function getFriendlyError(code) {
    const map = {
        'auth/email-already-in-use': 'Questa email è già registrata.',
        'auth/invalid-email': 'Email non valida.',
        'auth/weak-password': 'La password deve avere almeno 6 caratteri.',
        'auth/user-not-found': 'Nessun account trovato con questa email.',
        'auth/wrong-password': 'Password non corretta.',
        'auth/invalid-credential': 'Credenziali non valide. Riprova.',
        'auth/too-many-requests': 'Troppi tentativi. Riprova tra qualche minuto.',
        'auth/network-request-failed': 'Errore di rete. Controlla la connessione.',
    };
    return map[code] || 'Si è verificato un errore. Riprova.';
}
