# 🎮 Gamified Task Tracker

Trasforma ogni task completato in una **micro-vittoria** con streak, badge e animazioni.

## Stack

- **React 19** + **Vite 7** — UI moderna e veloce
- **TailwindCSS v4** — Styling mobile-first
- **Framer Motion** — Animazioni gamificate
- **Zustand** — State management leggero
- **Firebase** — Auth + Firestore + Hosting

## Sviluppo

### Live Demo
L'app è disponibile in produzione su Firebase Hosting:
[**Gamified Task Tracker - Live**](https://gamified-task-tracker-2026.web.app/)

```bash
npm install
npm run dev       # → http://localhost:5173
npm run build     # → /dist
```

## Struttura

```
src/
├── components/   # UI riutilizzabili (AppLayout, TaskItem, TaskList)
├── contexts/     # AuthContext (Firebase Auth)
├── hooks/        # Custom hooks (useTasks)
├── lib/          # Firebase SDK config e servizi API
├── pages/        # LoginPage, DashboardPage
└── store/        # Zustand stores (taskStore)
```

## Stato Progetto

- ✅ Fase 0 — Setup completato
- ✅ Fase 1 — Autenticazione (email/password + Google)
- ✅ Fase 2 — Task Board (CRUD)
- ✅ Fase 3 — Gamification Engine
- ✅ Fase 4 — UI/UX Polish
- ✅ Fase 5 — PWA & Deploy
- ⬜ Fase 6 — Testing & QA

## Licenza

Progetto privato.
