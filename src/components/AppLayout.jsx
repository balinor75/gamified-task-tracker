import { Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-surface text-text">
            {/* Main content area */}
            <main className="max-w-lg mx-auto">
                <Outlet />
            </main>

            {/* Bottom navigation bar — will be expanded in Fase 2 */}
            <nav className="fixed bottom-0 left-0 right-0 bg-surface-card/80 backdrop-blur-xl border-t border-white/5 safe-bottom">
                <div className="max-w-lg mx-auto flex items-center justify-around h-16">
                    <NavItem icon="🏠" label="Home" active />
                    <NavItem icon="📊" label="Stats" />
                    <NavItem icon="⚙️" label="Impost." />
                </div>
            </nav>
        </div>
    );
}

function NavItem({ icon, label, active = false }) {
    return (
        <button
            type="button"
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${active ? 'text-primary' : 'text-text-secondary hover:text-text'
                }`}
        >
            <span className="text-xl">{icon}</span>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
