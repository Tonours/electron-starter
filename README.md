# Electron Starter

Minimal Electron + React + TypeScript starter with:
- typed IPC contract (`ping -> pong`)
- secure preload bridge (`contextIsolation: true`, `nodeIntegration: false`)
- Tailwind CSS v4 + `tailwind-variants`
- unit tests (Vitest) and Electron e2e (Playwright)
- GitHub Actions quality gate (lint, typecheck, unit tests, build)

## Requirements

- Node.js `>=22`
- pnpm `>=9`

## Install

```bash
pnpm install
```

## Run in development

```bash
pnpm dev
```

## Quality and tests

```bash
pnpm gate      # lint + typecheck + unit tests
pnpm test:e2e  # build + Electron Playwright scenario
```

## Build

```bash
pnpm build
```

## Package (macOS example, no code-signing)

```bash
pnpm package:mac
```

## Project structure

```text
src/main      # Electron main process
src/preload   # secure bridge exposed to renderer
src/renderer  # React UI
src/shared    # shared IPC contracts and schemas
tests/unit    # Vitest unit tests
tests/e2e     # Playwright Electron scenario
```

## Notes

- `sandbox` is currently disabled in BrowserWindow config to keep preload IPC behavior stable in this starter setup.
- CI is intentionally limited to a standard quality/build pipeline (no code-signing yet).
