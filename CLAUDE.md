# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

This repository has two distinct parts:

- **`.agent/`** — The Antigravity Kit itself: 20 specialist AI agents, 37 skills, 11 workflow slash commands. These are markdown/Python files consumed by AI coding assistants, not application code.
- **`web/`** — A Next.js 16 web application: a real-time CSMS (Charging Station Management System) dashboard plus a documentation site.

## Web App Commands

All commands run from `web/`:

```bash
cd web
npm run dev      # Start dev server (Next.js)
npm run build    # Production build (standalone output)
npm run start    # Serve production build
npm run lint     # ESLint
```

## Web App Architecture

**Tech stack**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Leaflet maps, MDX docs, `next-themes`.

**App Router structure** (`web/src/app/`):
- `/remote-control` — The primary dashboard page (root `/` redirects here). A client component managing three operational domains: **EV** (charging stations via OCPP), **Facilities**, **Fleet** (trucks). Each domain has a sidebar overlay, map layer, and table view. State is polled every 3-5 seconds.
- `/docs` — MDX-based documentation site for the Antigravity Kit, with sidebar nav configured in `web/src/lib/docs-config.ts`.

**API routes** (`web/src/app/api/`):
- `GET /api/proxy?url=<Node-RED URL>` — Reverse proxy to external OCPP backend (Node-RED at `http://141.11.156.67:1880` by default, stored in `localStorage` key `siam_ocpp_url`).
- `GET/POST /api/ocpp/stations` — Mock EV station data with schedule persistence to `web/data/schedules.json`.
- `GET /api/facilities` — Facility mock data.
- `GET /api/fleet` — Fleet/truck mock data.

**Key types** are in `web/src/app/remote-control/types.ts`: `Station`, `Facility`, `FacilityZone`, `Truck`, `TruckRoute`, `DomainType`, `LayerVisibility`.

**Component structure** (`web/src/components/remote-control/`):
- `map-viewport.tsx` — Leaflet map, rendered with `ref` (forwarded) for `invalidateSize` calls.
- `control-overlay.tsx` / `facilities-overlay.tsx` / `fleet-overlay.tsx` — Domain-specific sidebar panels.
- `*-table-view.tsx` — Table views shown when sidebar tab is "NODES" or "LIST".

**Build output**: `standalone` mode — the build produces a self-contained Node.js server. Deployed via Docker/CapRover (`captain-definition`). Versioned bundles (`dashboard_bundle_v*.tar.gz`) live in the repo root.

## Antigravity Kit Validation Scripts

```bash
# Quick validation (security, lint, types, tests, UX, SEO)
python .agent/scripts/checklist.py .

# Full pre-deployment suite (+ Lighthouse, Playwright E2E, bundle analysis)
python .agent/scripts/verify_all.py . --url http://localhost:3000
```

## Antigravity Kit Workflow Commands

Invoke in AI chat with a slash command:

| Command | Purpose |
|---|---|
| `/brainstorm` | Explore options before implementing |
| `/create` | Scaffold new features or apps |
| `/debug` | Systematic root-cause analysis |
| `/plan` | Break down a task into steps |
| `/enhance` | Improve existing code |
| `/test` | Generate and run tests |
| `/ui-ux-pro-max` | Design with 50 visual styles |

Skills are loaded automatically when task context matches — no need to reference them explicitly.
