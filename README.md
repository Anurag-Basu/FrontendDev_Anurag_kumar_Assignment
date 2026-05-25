# UIDAI Frontend assignment – mock wallet

Vite + React + TS + RTK (`/api/credentials`), masked identifier widget, Vitest RTL around the reveal timer, PWA bundle via Workbox runtime cache config.

Scripts:

- `npm run dev` — dev server + inline mock middleware
- `npm run build` — typecheck + `dist/` + `sw.js`
- `npm run preview:offline` — static preview **and** the mock JSON route (`scripts/preview-with-api.mjs`)
- `npm run test`

Folder layout (`src/`): `pages/` (screen shell), `components/` (dashboard + secure mask), plus `store/`, `api/`, `types/`, `lib/` helpers.

At repo root, **`mock-data/`** contains the JSON blob the Vite middleware and `preview-with-api.mjs` use for `/api/credentials`.

**Offline cache:** Plain `npm run dev` isn’t the same as a production bundle. After `npm run build`, use preview, open the app once while online, then you can try airplane mode / offline to see cached credentials.
