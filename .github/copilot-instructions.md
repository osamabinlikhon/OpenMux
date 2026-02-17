# Copilot / Agent Instructions for OpenMux

These instructions help AI coding agents be productive in this repository. Keep guidance concise and actionable — follow the examples in the codebase.

## Quick Goals
- Help implement features across `web/`, `server/`, and `sandbox/` while preserving isolation and security boundaries.
- Prefer small, focused changes with tests and clear changelogs.

## Code Style
- Language: TypeScript across `web/`, `server/`, and `sandbox/`.
- Formatting: follow existing project style (use existing `tsconfig.json` and follow import/indent patterns shown in `web/src` and `server/src`).
- Files to reference: [README.md](README.md) and `web/src/components/ChatInterface.tsx` for React patterns.

## Architecture (brief)
- Frontend: `web/` (Vite + React + Zustand). See `web/src` for UI components.
- API Server: `server/` (Express/TypeScript). See `server/src/index.ts` and `server/controllers`.
- Sandbox: `sandbox/` provides tool implementations (`sandbox/src/tools`) that run inside Docker containers.
- Keep boundaries: changes that affect runtime behavior of sandboxes must consider container security and network ports.

## Build & Test (commands to run)
- Setup (root): `./setup.sh` then `npm install`
- Docker (recommended): `npm run docker` or use `docker-compose.yml`.
- Local development (three terminals):
  - `npm run web` (start web frontend)
  - `npm run server` (start API server)
  - `npm run sandbox` (start sandbox service)
- Tests: follow workspace test scripts shown in README:
  - `npm run test --workspace=web`
  - `npm run test --workspace=server`
  - `npm run test --workspace=sandbox`

## Project Conventions
- Tool implementations live in `sandbox/src/tools/` (see `ToolRegistry.ts`, `BrowserTool.ts`, `ShellTool.ts`, `FileTool.ts`).
- When adding a new tool:
  1. Implement the class in `sandbox/src/tools/` following existing tool interfaces.
  2. Register it in `sandbox/src/index.ts`.
  3. Add examples in `sandbox/src` tests and documentation in `README.md` if applicable.
- For frontend changes, mirror existing component patterns in `web/src/components` and use the `store/sessionStore.ts` for session state.

## Integration Points
- Docker / sandbox lifecycle: the server spawns and manages Docker sandboxes. Changes to session or sandbox APIs must update both `server/` and `sandbox/` contracts.
- Ports and env: refer to `docker-compose.yml` and `server/.env` config referenced in `README.md` when changing ports or environment variables.

## Security & Safety
- Never bypass sandbox isolation. Running arbitrary host-level commands is not allowed — only modify sandbox tool behavior inside `sandbox/`.
- Validate inputs at the server boundary (`server/controllers`), and follow existing patterns for session creation and termination.

## When You Modify Files
- Keep changes minimal and self-contained. Add tests where practical.
- Update `README.md` or relevant service docs when public behavior or API changes.

## Helpful Files to Inspect
- [README.md](README.md) — project overview and commands
- `web/src/components/ChatInterface.tsx` — UI message handling
- `server/src/index.ts` — server entrypoint and session management
- `sandbox/src/tools/ToolRegistry.ts` — how tools are registered and executed

---
If any section is unclear or you need deeper examples (e.g., preferred lint rules, test frameworks), tell me which area and I will expand or merge examples from nearby files.
