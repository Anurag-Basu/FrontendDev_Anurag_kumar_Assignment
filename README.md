# UIDAI Frontend assignment – mock wallet

Vite + React + TS + RTK (`/api/credentials`), masked identifier widget, Vitest RTL around the reveal timer, PWA bundle via Workbox runtime cache config.

## Setup & Run

```bash
git clone https://github.com/Anurag-Basu/FrontendDev_Anurag_kumar_Assignment.git
cd FrontendDev_Anurag_kumar_Assignment
npm install
```

## Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server + inline mock middleware (localhost:5173) |
| `npm run build` | Typecheck + production `dist/` + `sw.js` |
| `npm run preview:offline` | Static preview + mock JSON route (localhost:4173) |
| `npm run test` | Run unit tests (Vitest) |
| `npm run lint` | ESLint check |

## Folder layout

`src/`: `pages/` (screen shell), `components/` (dashboard + secure mask), `store/`, `api/`, `types/`, `lib/` helpers.

At repo root, **`mock-data/`** contains the JSON blob the Vite middleware and `preview-with-api.mjs` use for `/api/credentials`.

## Offline cache

Plain `npm run dev` isn't the same as a production bundle. After `npm run build`, use `npm run preview:offline`, open the app once while online, then try airplane mode / offline to see cached credentials.
