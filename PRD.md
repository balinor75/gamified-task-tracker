# PRD — Gamified Task Tracker PWA

> **Versione:** 1.0  
> **Ultimo aggiornamento:** 2026-03-01  
> **Stato:** Approvato — Pronto per l'implementazione

---

## 1. Panoramica del Prodotto

### 1.1 Problema
Le to-do list tradizionali sono noiose. Gli utenti le abbandonano dopo pochi giorni perché non c'è nessun incentivo a tornare. Manca un feedback emotivo immediato che premi il completamento dei task.

### 1.2 Soluzione
Una **Progressive Web App (PWA)** per il tracciamento delle attività personali, con un forte focus sulla **gamification**: streak giornaliere, badge, animazioni di completamento, suoni e ricompense visive che trasformano ogni task completato in una micro-vittoria.

### 1.3 Target
Singoli individui che cercano uno strumento semplice, rapido e motivante per la produttività quotidiana (spesa, promemoria, abitudini).

### 1.4 Non-Goals (Esclusioni esplicite)
- ❌ Collaborazione tra team o task condivisi
- ❌ Project management complesso (Gantt, Kanban avanzato)
- ❌ Chat o commenti
- ❌ Integrazioni con tool di terze parti (v1)

---

## 2. Stack Tecnologico

| Layer | Tecnologia | Motivazione |
|:---|:---|:---|
| **Framework** | React 18+ (via Vite) | Ecosistema maturo, componenti riutilizzabili, ottimo per animazioni complesse |
| **Styling** | TailwindCSS v4 | Sviluppo UI rapido, responsive e mobile-first senza file CSS separati |
| **Animazioni** | Framer Motion | Animazioni physics-based fluide essenziali per il core gamificato |
| **State Management** | Zustand | Leggero, zero boilerplate, perfetto per streak e stato UI |
| **Auth** | Firebase Authentication | Email/password + Google Sign-In, generoso piano gratuito |
| **Database** | Cloud Firestore | NoSQL real-time, listener in tempo reale, Firestore Security Rules |
| **Hosting** | Firebase Hosting | Deploy integrato, CDN globale, HTTPS automatico, supporto PWA |
| **VCS** | GitHub | Versionamento, CI/CD, code review |

---

## 3. Architettura

### 3.1 Componenti Principali

```
┌─────────────────────────────────────────────────┐
│                    PWA (React)                   │
├──────────┬──────────┬───────────┬────────────────┤
│ Auth     │ Task     │ Gamific.  │ Settings       │
│ Layer    │ Board    │ Engine    │                │
├──────────┴──────────┴───────────┴────────────────┤
│            Zustand (State Management)            │
├──────────────────────────────────────────────────┤
│            Firebase SDK (Client)                 │
├──────────┬───────────────────────────────────────┤
│ Firebase │ Cloud Firestore                       │
│ Auth     │ (real-time listeners)                 │
└──────────┴───────────────────────────────────────┘
```

1. **Auth Layer** — Login con email/password o Google Sign-In via Firebase Auth.
2. **Task Board** — Vista principale. Lista minimale con inserimento rapido e gesture (swipe per completare).
3. **Gamification Engine** — Zustand gestisce streak, contatori e badge. Framer Motion orchestra le animazioni (confetti, checkmark burst, shake) con update ottimistico prima della risposta del DB.
4. **Data Sync** — Firebase SDK con `onSnapshot` per listener real-time su Firestore.

### 3.2 Modello Dati (Firestore)

**Collezione `tasks`**

| Campo | Tipo | Descrizione |
|:---|:---|:---|
| `user_id` | `string` | UID dell'utente (da Firebase Auth) |
| `title` | `string` | Titolo del task |
| `is_completed` | `boolean` | Stato di completamento |
| `created_at` | `timestamp` | Data di creazione |
| `completed_at` | `timestamp \| null` | Data di completamento |

**Collezione `user_stats`**

| Campo | Tipo | Descrizione |
|:---|:---|:---|
| `user_id` | `string` | UID dell'utente |
| `current_streak` | `number` | Streak corrente (giorni consecutivi) |
| `longest_streak` | `number` | Record streak storico |
| `total_completed` | `number` | Totale task completati |
| `last_activity_date` | `timestamp` | Data dell'ultima attività |

### 3.3 Sicurezza

I dati sono protetti da **Firestore Security Rules** che garantiscono che ogni utente possa leggere/scrivere esclusivamente i propri documenti:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /tasks/{taskId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.user_id;
      allow create: if request.auth != null
        && request.auth.uid == request.resource.data.user_id;
    }
    match /user_stats/{statId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.user_id;
    }
  }
}
```

---

## 4. Fasi di Implementazione

### Fase 0 — Setup Progetto
- [ ] Creare repository GitHub (`gamified-task-tracker`)
- [ ] Inizializzare progetto React con Vite (`npx create-vite@latest`)
- [ ] Installare dipendenze: `tailwindcss`, `framer-motion`, `zustand`, `firebase`
- [ ] Configurare TailwindCSS v4
- [ ] Configurare Firebase project (Auth + Firestore + Hosting)
- [ ] Configurare PWA manifest e Service Worker
- [ ] Commit iniziale e push su GitHub

### Fase 1 — Autenticazione
- [ ] Implementare pagina Login/Signup
- [ ] Integrare Firebase Auth (email/password + Google)
- [ ] Creare `AuthContext` React con protezione route
- [ ] Scrivere Firestore Security Rules
- [ ] Test manuale del flusso auth

### Fase 2 — Task Board (Core CRUD)
- [ ] Componente `TaskInput` — inserimento rapido con un solo campo
- [ ] Componente `TaskList` — lista dei task attivi con real-time listener
- [ ] Componente `TaskItem` — singolo elemento con checkbox e swipe-to-complete
- [ ] Logica CRUD su Firestore (create, read, update, delete)
- [ ] Filtro "Completati" / "Attivi"

### Fase 3 — Gamification Engine
- [ ] Store Zustand per `user_stats` (streak, contatori)
- [ ] Logica di calcolo streak (giorni consecutivi con almeno 1 task completato)
- [ ] Animazione di completamento task (Framer Motion: checkmark + confetti)
- [ ] Badge e milestone visivi (es. "10 task!", "7 giorni di fila!")
- [ ] Suoni di completamento (Web Audio API)
- [ ] Componente `StreakBanner` nella dashboard

### Fase 4 — UI/UX Polish
- [ ] Design system con TailwindCSS (colori, tipografia, spacing)
- [ ] Dark mode toggle
- [ ] Micro-animazioni su hover, focus, transizioni di pagina
- [ ] Empty states illustrati
- [ ] Loading skeleton / shimmer

### Fase 5 — PWA & Deploy
- [ ] Configurare Service Worker per caching offline
- [ ] Testare comportamento offline-first
- [ ] Configurare Firebase Hosting
- [ ] Deploy su Firebase Hosting
- [ ] Verificare installabilità PWA (mobile e desktop)

### Fase 6 — Testing & QA
- [ ] Verifica cross-browser (Chrome, Safari, Firefox)
- [ ] Verifica responsive (mobile, tablet, desktop)
- [ ] Audit Lighthouse (Performance, A11y, PWA score)
- [ ] Bug fixing finale

---

## 5. Skills da Utilizzare

> Le skills sono installate globalmente in `C:\Users\balin\.gemini\antigravity\skills\`.
> L'agente AI le attiva automaticamente in base al contesto della richiesta.

| Fase | Skill Applicabili | Uso |
|:---|:---|:---|
| Tutte | `react-best-practices` | Seguire le best practice React per ogni componente |
| Tutte | `tailwind-patterns` | Pattern CSS-first con TailwindCSS v4 |
| Tutte | `clean-code` | Mantenere codice leggibile e manutenibile |
| 0 | `firebase` | Setup Firebase project, auth e Firestore |
| 0 | `git-pushing` | Commit e push con messaggi convenzionali |
| 1 | `auth-implementation-patterns` | Pattern di autenticazione sicura |
| 2 | `react-patterns` | Composizione e hooks moderni React |
| 2 | `react-ui-patterns` | Pattern UI per loading, errori, fetch |
| 3 | `zustand-store-ts` | Store Zustand tipizzato per gamification |
| 4 | `frontend-design` | Design premium, non generico |
| 4 | `web-performance-optimization` | Ottimizzazione Core Web Vitals |
| 5 | `verification-before-completion` | Validazione pre-deploy |
| 6 | `webapp-testing` | Testing con Playwright |
| 6 | `find-bugs` | Audit del codice per vulnerabilità |

---

## 6. MCP Server Configurati

> I server MCP sono configurati in `C:\Users\balin\.gemini\antigravity\mcp_config.json`.
> Estendono le capacità dell'agente AI con strumenti esterni.

| Server | Tipo | Uso nel Progetto |
|:---|:---|:---|
| **`firebase-mcp-server`** | Firebase CLI MCP | Gestire il progetto Firebase: creare app, configurare Auth/Firestore, leggere Security Rules, inizializzare Hosting, ottenere SDK config |
| **`github-mcp-server`** | GitHub API MCP | Creare repository, gestire branch, push files, creare PR, gestire issues |
| **`supabase-mcp-server`** | Supabase API MCP | ⚠️ **Non usare per questo progetto** — limite free tier raggiunto. Disponibile per altri progetti. |
| **`StitchMCP`** | Google Stitch UI Design | Prototipazione UI rapida: generare mockup delle schermate prima dell'implementazione |

---

## 7. Principi di Design

- **Mobile-first**: Ogni decisione UI parte dal viewport mobile.
- **Optimistic UI**: L'interfaccia reagisce istantaneamente; la sincronizzazione col DB avviene in background.
- **YAGNI**: Non aggiungere funzionalità non richieste. L'MVP deve essere snello.
- **Accessibilità**: Heading structure corretta, contrasti adeguati, navigazione da tastiera.
- **Estetica Premium**: Colori curati, tipografia moderna (Google Fonts: Inter), gradienti, glassmorphism per dark mode. Nessun design generico.

---

## 8. Riferimenti

- [Design Document (Brainstorming)](file:///C:/Users/balin/.gemini/antigravity/brain/ea260235-33f1-44e7-a484-67b29c806938/design_document.md) — Il documento iniziale da cui nasce questo PRD.

---

*Questo PRD è pensato per essere letto da agenti AI e sviluppatori umani. Seguire le fasi in ordine, attivare le skills indicate, e utilizzare i server MCP configurati per ogni operazione integrata.*
