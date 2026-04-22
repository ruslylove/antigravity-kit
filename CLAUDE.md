# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This is a hybrid repo:

- `web/` — the actual Next.js 16 / React 19 application (branded **Siam EV — CSMS**, a Charging Station Management System UI). All build/dev/lint commands run from here.
- `.agent/` — Antigravity Kit templates (agents, skills, workflows). This is content authored for AI tooling; the web app reads static descriptors from `web/src/services/*.json` (not from `.agent/` at runtime).
- Root `package.json` is just metadata for the Antigravity Kit publication — it has **no scripts**. Don't run npm commands from the repo root.
- `captain-definition` + `web/Dockerfile` configure CapRover deployment (builds from `web/`, exposes port 3000, uses Next.js `output: "standalone"`).

## Common Commands

All commands run from `web/`:

```bash
cd web
npm install           # first-time or after dep changes
npm run dev           # Next.js dev server (http://localhost:3000)
npm run build         # production build (standalone output)
npm run start         # serve the built app
npm run lint          # ESLint via eslint-config-next (flat config)
```

There is **no test runner configured** — don't invent `npm test`. There is no type-check script either; rely on `next build` or run `npx tsc --noEmit` from `web/` if needed.

## Architecture

### Tech stack
Next.js 16, React 19, TypeScript, Tailwind CSS v4, Leaflet maps, MDX docs, `next-themes`.

### Next.js App Router conventions in use

- `next.config.ts` enables `reactCompiler: true` (React Compiler via `babel-plugin-react-compiler`) and MDX page extensions — `.md`/`.mdx` files in `src/app/**` render as pages.
- `output: "standalone"` — the build produces a self-contained Node.js server. The Dockerfile copies `.next/standalone` and `.next/static`. Don't change this without updating the Dockerfile.
- TypeScript path alias `@/*` → `web/src/*` (see `tsconfig.json`).
- Dark mode via `next-themes` with `defaultTheme="dark"`, `attribute="class"` (`src/app/layout.tsx`, `src/components/theme-provider.tsx`). Tailwind v4 with CSS variables; theme tokens live in `src/app/globals.css`.

### Three functional surfaces

1. **Marketing landing** — `src/app/page.tsx` (single large client component with Typewriter/Leaflet-style visuals).
2. **Docs site** — `src/app/docs/**` with `layout.tsx` providing sidebar + TOC shell. Sidebar is driven by the single source of truth in `src/lib/docs-config.ts`. Custom MDX components live in `src/mdx-components.tsx` (typography overrides) and `src/components/mdx/` (`Callout`, `StepList`, `Terminal`, `ProTips`, `FeatureGrid`) — import these rather than writing new MDX primitives.
3. **Remote control UI** — `src/app/remote-control/page.tsx` is the primary dashboard component that manages three operational domains:
    - **EV** (charging stations via OCPP): Uses `control-overlay.tsx`.
    - **Facilities**: Uses `facilities-overlay.tsx`.
    - **Fleet** (trucks): Uses `fleet-overlay.tsx`.
    It uses `map-viewport.tsx` (Leaflet map) and `nodes-table-view.tsx` (tabular view). The page maintains three tabs (`MAP` / `NODES` / `SETTINGS`) and persists the upstream OCPP URL in `localStorage` under `siam_ocpp_url`. State is polled every 3-5 seconds.

### Data flow for stations

The remote-control page always fetches via **a same-origin URL**, never directly from the upstream OCPP backend:

- If the user has configured a URL (default in code: `http://141.11.156.67:8080`), the client calls `/api/proxy?url=<encoded>` and the route handler (`src/app/api/proxy/route.ts`) fetches `${url}/api/ocpp/stations` server-side with `cache: 'no-store'`. This avoids mixed-content/CORS issues and keeps the upstream hidden from the browser.
- If no URL is set, the client falls back to `/api/ocpp/stations` (`src/app/api/ocpp/stations/route.ts`), which returns **mocked Bangkok stations with some animated telemetry values** for demo/dev. Treat this route as a fixture, not a real backend.

When changing the `Station` shape, update all three places: the `Station` interface in `remote-control/page.tsx`, the mock route, and the three subcomponents that consume it. `powerLimit` is normalized to a number at the page level — upstream may send it as a string.

### UI kit

Uses shadcn-style components (see `components.json`: `style: "new-york"`, `rsc: true`, icons: `lucide`) generated into `src/components/ui/`. The base primitives are from `@base-ui/react`, not Radix. Use `cn` from `@/lib/utils` for class merging. When adding new shadcn components, prefer the existing registry aliases (`@/components/ui`, `@/lib/utils`, `@/hooks`) rather than introducing new paths.

### OCPP context

`OCPP_NodeRED_Implementation.tex`/`.pdf` at the repo root document the upstream OCPP Node-RED backend the proxy talks to. Read this if you need the real station/socket data shape beyond the mock.

## Antigravity Kit (AI Tooling)

The `.agent/` directory contains vendored content for AI coding assistants (agents, skills, workflows).

### Validation Scripts

```bash
# Quick validation (security, lint, types, tests, UX, SEO)
python .agent/scripts/checklist.py .

# Full pre-deployment suite (+ Lighthouse, Playwright E2E, bundle analysis)
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

### Workflow Commands

Invoke in AI chat with a slash command (if supported):

| Command | Purpose |
|---|---|
| `/brainstorm` | Explore options before implementing |
| `/create` | Scaffold new features or apps |
| `/debug` | Systematic root-cause analysis |
| `/plan` | Break down a task into steps |
| `/enhance` | Improve existing code |
| `/test` | Generate and run tests |
| `/ui-ux-pro-max` | Design with 50 visual styles |

> [!NOTE]
> `.agent/rules/GEMINI.md` describes a specific protocol for Gemini-based agents. If you are using Claude Code, treat `.agent/` primarily as static data and follow the specific instructions in this `CLAUDE.md` file.
