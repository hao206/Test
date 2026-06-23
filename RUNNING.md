Run instructions (dev)

Open two terminals.

Terminal 1 — Frontend (Vite dev):

```bash
npm install
npm run dev
```

This starts the Vite dev server (default port 3000).

Terminal 2 — Backend (Express):

```bash
npm run start
# or
node server.js
```

Server defaults:
- Serves API under `/api/*`
- Serves `dist` when built by `npm run build` and `npm run preview` for static preview.

Notes:
- For dev, CORS is enabled for `localhost` origins so the Vite server can call the API.
- To produce a production build and serve statically:
  1. `npm run build`
  2. `npm run start`

Vietnamese (tóm tắt):

Mở hai terminal. 1) `npm run dev` cho frontend. 2) `npm run start` cho backend. CORS đã bật cho localhost.
