# CLAUDE.md — Agent Instructions for uipath-workshop-api

## What This Project Is

A **mock enterprise API platform** for UiPath automation workshops. It provides 145+ REST endpoints across 6 business domains (HR, Finance, CRM, IoT, Analytics, ITSM) with realistic fake data. Everything runs in-memory — no database, no auth, data resets on restart.

There are two frontends served from `/public`:
1. **Workshop API Explorer** (`/`) — interactive API testing UI for workshop participants
2. **ITSM Console** (`/itsm-app/`) — full-featured IT service management app wired to the API

## Quick Start

```bash
npm install
npm start          # starts on port 4000
# Open http://localhost:4000 for the API Explorer
# Open http://localhost:4000/itsm-app/ for the ITSM Console
```

## Architecture Overview

Read `ARCHITECTURE.md` for the complete technical reference. Key points:

- **Single file backend**: `server.js` (2700 lines) — Express via json-server v0.17.4
- **All data in memory**: `generateDatabase()` creates 42 collections at startup, mutated in-place
- **No build step**: Pure vanilla JS everywhere (Node.js backend, plain HTML/JS/CSS frontend)
- **ITSM Console**: SPA with 22 JS modules, all global-scope objects, connected to API via `api.js`
- **Route rewrites**: `enhanced_routes_complete.json` maps semantic URLs to json-server collections

## Project Structure

```
server.js                         # Entire backend (Express + json-server + 76 custom endpoints)
enhanced_routes_complete.json     # 118 URL rewrites (/api/x/y → /collection_name)
package.json                      # Dependencies: json-server, faker, debug
public/
  index.html                      # Workshop API Explorer UI (Tailwind + Axios)
  script.js                       # Explorer module definitions & API testing logic
  api-documentation.html          # Static API reference (Tailwind)
  js/                             # Explorer supporting modules (layout, tabs, welcome, objectives)
  styles/                         # Explorer CSS modules
  legacy-portal/                  # Simulated legacy HR form (3 HTML pages)
  itsm-app/
    index.html                    # ITSM Console shell (loads all scripts)
    js/
      data.js                     # ITSMData global — offline seed data + runtime cache
      api.js                      # ITSMApi — HTTP service layer (IIFE)
      app.js                      # Main app: init, navigation, dashboard, module routing
      modules/                    # 22 feature modules (all global-scope objects)
    styles/                       # retro.css (theme) + components.css
    icons/                        # 28 PNG line icons
    demo-content/                 # Error logs, KB articles, screenshots for demos
    tests/                        # Playwright test suite
src/
  services/
    validationService.js          # Workshop validation (not wired in yet)
```

## Critical Patterns

### Backend (server.js)

- **Data storage**: Single `db` object. All custom routes mutate `db.collection_name` arrays directly
- **ID generation**: Each ITSM entity auto-increments (INC-001, CHG-456, REQ-001, etc.) — find max existing ID and increment
- **Audit logging**: `addItsmAudit(action, targetId, targetType, details, actor)` appends to `db.itsm_audit_log` — called by all mutation endpoints
- **ITSM Reset**: `POST /api/itsm/reset` regenerates all `itsm_*` keys by calling `generateDatabase()` and cherry-picking ITSM collections
- **json-server router goes LAST**: Custom routes must be registered before `server.use(router)` or json-server will handle the request first
- **Route rewrites**: Applied between custom routes and the json-server router

### ITSM Console Frontend

- **No framework, no bundler**: All 22 modules are `<script>` tags loaded in dependency order in `index.html`
- **Global scope objects**: Every module exposes a global (e.g., `IncidentsModule`, `ChangesModule`, `Toast`, `Utils`)
- **ITSMData as cache**: `api.js` loads all collections from API into `ITSMData` at startup. Modules read from `ITSMData` synchronously. After any mutation, `api.js` refreshes the affected collection
- **Offline fallback**: If API is unreachable, `data.js` seed data is used as-is
- **Module routing**: `app.js` maps sidebar `data-module` attributes to render functions. Each returns an HTML string injected into `#content-area`
- **Modals/Toasts**: Use `Modals.show(htmlString)` / `Toast.show(message, type)` — both are global

### Property Name Mapping (Frontend ↔ Backend)

| ITSMData key         | API collection / endpoint        |
|----------------------|----------------------------------|
| `serviceRequests`    | `itsm_requests` / `/api/itsm/requests` |
| `knowledgeArticles`  | `itsm_knowledge` / `/api/itsm/knowledge` |
| `catalogItems`       | `itsm_catalog` / `/api/itsm/catalog` |
| `auditLog`           | `itsm_audit_log` / `/api/itsm/audit-log` |
| Everything else      | Same name with `itsm_` prefix    |

### Icons

ITSM Console uses 28 PNG line icons in `public/itsm-app/icons/`. All referenced by filename (no extension) in code. CSS classes control sizing:
- `.nav-icon img` — 16px sidebar icons (invert on active)
- `.page-icon` — 20px page headers
- `.card-header-icon` — 17px dashboard cards
- `.catalog-icon` — 32px catalog items
- `.modal-icon` — 18px modal headers
- `.bell-icon img` — 18px, inverted white for dark header

## Common Tasks

### Adding a new ITSM endpoint
1. Add the route handler in `server.js` (before `server.use(router)`)
2. Call `addItsmAudit()` for mutations
3. Add URL rewrite in `enhanced_routes_complete.json` if needed for json-server collection access
4. Add the API method in `public/itsm-app/js/api.js`
5. Call it from the relevant frontend module
6. Update `public/api-documentation.html` and `README.md`

### Adding a new ITSM frontend module
1. Create `public/itsm-app/js/modules/newmodule.js` — export a global object with a `render()` method
2. Add `<script>` tag in `index.html` (before `app.js`)
3. Add sidebar nav item in `index.html` with `data-module="module-name"`
4. Add routing entry in `app.js` `modules` object
5. Add icon to `icons/` if needed

### Modifying seed data
- **Backend**: Edit `generateDatabase()` in `server.js` — affects API responses and reset behavior
- **Frontend fallback**: Edit `data.js` — only used when API is unreachable
- **Both must stay in sync** for icon names, field names, and ID formats

## Testing

```bash
# Playwright E2E tests (requires server running on port 4000)
cd public/itsm-app && npx playwright test

# Manual API testing
curl http://localhost:4000/api/itsm/incidents
curl http://localhost:4000/health
```

Pre-commit hook runs ESLint on `src/` and `server.js`. The jest test reference (`tests/modular-architecture.test.js`) is stale — skip with `--no-verify` if it blocks.

## Deployment

- **Azure**: GitHub Actions workflow in `.github/workflows/azure-deploy.yml` (push to main)
- **Railway**: One-click template deploy
- **Port**: `process.env.PORT` or 4000
- **No build step needed**: `npm install --production && node server.js`

## Don'ts

- Don't add TypeScript, bundlers, or build tools — this is intentionally vanilla JS
- Don't add authentication — the whole point is zero-auth for workshop ease
- Don't persist data to disk — in-memory resets are a feature, not a bug
- Don't refactor modules into ES modules/imports — script loading order in `index.html` is the module system
- Don't remove `data.js` seed data — it's the offline fallback
- Don't add a database — json-server's in-memory store is the architecture
