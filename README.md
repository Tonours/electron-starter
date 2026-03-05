# Electron Starter

Electron + React + TypeScript starter focused on secure IPC defaults and
runtime resilience.

## Included in this codebase

- React 19 renderer (Vite 7 + TypeScript 5)
- Shared IPC contracts in `src/shared/ipc/*` with Zod request/response schemas
- Validated IPC handlers in main (`validatedHandle`) with standardized error
  envelopes
- Trusted IPC sender checks + navigation guard (`window.open` denied, external
  navigation blocked unless explicitly allowed)
- Preload bridge with fatal error reporting channel
- Main-process fatal error policy + renderer crash recovery hooks
- Tailwind CSS v4 + `tailwind-variants`
- Unit tests (Vitest) and Electron e2e test (Playwright)
- CI quality gate (`pnpm gate:ci`)

## Requirements

- Node.js `>=22`
- pnpm `>=9`

## Install

```bash
pnpm install
```

## Development

```bash
pnpm dev
```

## Quality and tests

```bash
pnpm gate      # lint + typecheck + unit tests
pnpm test:e2e  # build + Electron Playwright scenario
```

## Build, run, package

```bash
pnpm build
pnpm start
pnpm package:mac
```

## Environment variables

- `CRASH_REPORTER_UPLOAD=1` to enable crash report upload
- `CRASH_REPORTER_SUBMIT_URL=https://your-endpoint.example.com` to define the
  upload endpoint

## Project structure

```text
src/main      # Electron main process (bootstrap, IPC, security, lifecycle)
src/preload   # contextBridge API and preload fatal reporting
src/renderer  # React UI
src/shared    # IPC channels, contracts, schemas, shared types
tests/unit    # Vitest unit tests
tests/e2e     # Playwright Electron scenario
docs          # release/review checklists and migration notes
```

## Notes

- `sandbox` is currently disabled in `BrowserWindow` config.
- Crash reporter starts at boot, but upload is disabled by default.
- CI currently runs lint + typecheck + unit tests + build (no code-signing).
