# Electron Dev notes

This folder contains minimal Electron glue for OpenMux.

Dev steps (from repo root):

1. Start backend services (sandbox and server) and web UI in dev mode:

```bash
npm run dev:sandbox
npm run dev:server
npm run dev:web
```

2. Start Electron in dev mode (opens a window to the running web dev server):

```bash
npm run dev:electron
```

Notes:
- Ensure `electron` is installed globally or as a dev dependency: `npm install -D electron`.
- The Electron `preload.ts` exposes `window.openmux.sandboxRequest` which the renderer will use when available.
- In production, build the `web` bundle and run `npm run start:electron` after packaging.
