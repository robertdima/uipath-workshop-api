# Architecture Reference — uipath-workshop-api

Complete technical reference for AI agents and developers. For quick-start instructions, see `CLAUDE.md`.

---

## Table of Contents

- [1. System Overview](#1-system-overview)
- [2. Backend — server.js](#2-backend--serverjs)
- [3. Database Collections](#3-database-collections)
- [4. API Endpoints](#4-api-endpoints)
- [5. URL Rewrite Map](#5-url-rewrite-map)
- [6. ITSM Console Frontend](#6-itsm-console-frontend)
- [7. Workshop API Explorer](#7-workshop-api-explorer)
- [8. Legacy Portal](#8-legacy-portal)
- [9. Configuration & Deployment](#9-configuration--deployment)
- [10. File Index](#10-file-index)

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Node.js Process                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    server.js (Express)                    │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │   │
│  │  │   CORS +   │  │  76 Custom   │  │   json-server   │  │   │
│  │  │  Static    │→ │  API Routes  │→ │    Router       │  │   │
│  │  │  Serving   │  │  (business   │  │  (auto CRUD on  │  │   │
│  │  │  /public   │  │   logic)     │  │   42 collections)│  │   │
│  │  └────────────┘  └──────────────┘  └─────────────────┘  │   │
│  │                          ↕                    ↕          │   │
│  │                  ┌──────────────────────────────┐        │   │
│  │                  │     In-Memory DB Object      │        │   │
│  │                  │   (42 collections, ~500+     │        │   │
│  │                  │    records, faker-generated)  │        │   │
│  │                  └──────────────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Served from /public:                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  API Explorer │  │ ITSM Console │  │   Legacy Portal      │  │
│  │  (/)          │  │ (/itsm-app/) │  │   (/legacy-portal/)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**Runtime**: Node.js 14+ | **Port**: `process.env.PORT` or 4000 | **Dependencies**: json-server 0.17.4, @faker-js/faker 8.x

---

## 2. Backend — server.js

**File**: `server.js` (~2700 lines)

### Startup Sequence

1. `generateDatabase()` → creates the `db` object with all 42 collections
2. Load route rewrites from `enhanced_routes_complete.json` (118 rules)
3. `jsonServer.create()` → Express app
4. Apply middleware: CORS → `jsonServer.defaults()` (static files from `/public`) → body parser
5. Register all custom API routes (must be before json-server router)
6. Apply `jsonServer.rewriter(rewrites)` → URL aliasing
7. Apply `jsonServer.router(db)` → auto CRUD on all collections
8. `server.listen(PORT, '0.0.0.0')`

### Middleware Stack (order matters)

```
Request
  → CORS headers (wildcard origin, all methods, OPTIONS preflight)
  → jsonServer.defaults() — static file serving from /public, logger, gzip
  → jsonServer.bodyParser — JSON body parsing
  → Custom routes — 76 hand-written endpoints with business logic
  → jsonServer.rewriter() — URL aliases (/api/hr/workers → /hr_workers)
  → jsonServer.router(db) — auto GET/POST/PUT/PATCH/DELETE on all collections
```

### Data Architecture

All data lives in a single JavaScript object `db` returned by `generateDatabase()`. Custom routes mutate this object directly (e.g., `db.itsm_incidents.push(newIncident)`). json-server's router also reads/writes this same object for auto-CRUD.

**No persistence** — data resets on process restart. ITSM data can be reset at runtime via `POST /api/itsm/reset`.

### Key Helper Functions

| Function | Purpose |
|---|---|
| `generateDatabase()` | Creates all 42 collections with faker + curated data |
| `addItsmAudit(action, targetId, targetType, details, actor)` | Appends entry to `db.itsm_audit_log` |
| `generateItsmIncidents()` | Returns 6 curated incidents (INC-001 to INC-006) |
| `generateItsmChanges()` | Returns 3 curated changes (CHG-456 to CHG-458) |
| `generateItsmRequests()` | Returns 8 curated requests (REQ-001 to REQ-008) |
| `generateItsmAssets()` | Returns 9 curated assets |
| `generateItsmKnowledge()` | Returns 4 KB articles |
| `generateItsmCatalog()` | Returns 12 service catalog items (CAT-001 to CAT-012) |

---

## 3. Database Collections

### HR Domain
| Collection | Records | Source |
|---|---|---|
| `hr_workers` | 47 | 12 managers + 35 employees, faker-generated |
| `hr_orgs` | 12 | Supervisory org units |
| `hr_worker_performance` | 47 | One per worker, 2025-Q2 |
| `hr_onboardings` | 6 | 2 pending / 2 in-progress / 2 completed |

### Finance Domain
| Collection | Records | Source |
|---|---|---|
| `finance_invoices` | 50 | Mixed statuses (pending/approved/paid/rejected/overdue) |
| `finance_expenses` | 60 | Faker-generated |
| `budget_variance` | 12 | By department |
| `financial_summaries` | 6 | Monthly: 2025-01 to 2025-06 |
| `vendor_performance` | ~15 | Derived from unique invoice vendors |

### CRM Domain
| Collection | Records | Source |
|---|---|---|
| `crm_customers` | 25 | active/prospect/churned/at_risk |
| `crm_opportunities` | 15 | Sales pipeline |
| `crm_orders` | 12 | Order records |
| `crm_support_tickets` | 18 | Support tickets |
| `crm_renewals` | ~10 | Subset of active customers |
| `sales_pipeline_reports` | 5 | Stage aggregates |

### IoT Domain
| Collection | Records | Source |
|---|---|---|
| `iot_devices` | 30 | Mixed types and locations |
| `iot_telemetry` | 180 | 6 readings per device |
| `iot_alerts` | 12 | Warning/critical alerts |
| `iot_maintenance` | 30 | Maintenance schedules |

### Analytics / Cross-Domain
| Collection | Records | Source |
|---|---|---|
| `projects` | 8 | Project records |
| `project_resources` | ~25 | 2-5 workers per project |
| `integration_employee_reports` | 12 | Department summaries |
| `notifications` | 25 | System notifications |
| `workflow_triggers` | 10 | Automation triggers |
| `employee_profiles` | 47 | One per worker |
| `customer_relationships` | 25 | CRM relationship data |

### ITSM Domain (all curated, not faker-generated)
| Collection | Records | ID Format |
|---|---|---|
| `itsm_incidents` | 6 | INC-001 to INC-006 |
| `itsm_changes` | 3 | CHG-456 to CHG-458 |
| `itsm_requests` | 8 | REQ-001 to REQ-008 |
| `itsm_problems` | 2 | PRB-001, PRB-002 |
| `itsm_assets` | 9 | WS-001, SRV-001, MOB-001, etc. |
| `itsm_knowledge` | 4 | KB-101, KB-112, KB-203, KB-512 |
| `itsm_catalog` | 12 | CAT-001 to CAT-012 |
| `itsm_runbooks` | 6 | RB-VPN-001, etc. |
| `itsm_teams` | 6 | TEAM-SD, TEAM-NET, etc. |
| `itsm_technicians` | 7 | USR-001 to USR-007 |
| `itsm_customers` | 7 | CUST-001 to CUST-007 |
| `itsm_sla_configs` | 4 | P1/P2/P3/P4 |
| `itsm_email_templates` | 5 | TMPL-001 to TMPL-005 |
| `itsm_notifications` | 4 | NOTIF-001 to NOTIF-004 |
| `itsm_policies` | 5 | POL-SEC-201, etc. |
| `itsm_audit_log` | 6+ | AUD-xxx (grows on mutations) |

---

## 4. API Endpoints

### System
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Status, environment, collection count, total records |

### HR Onboarding (Custom Business Logic)
| Method | Path | Description |
|---|---|---|
| POST | `/api/hr/onboarding` | Create new onboarding record |
| PATCH | `/api/hr/onboarding/:workerId/status` | Update onboarding status |
| POST | `/api/hr/onboarding/:workerId/equipment` | Mark equipment assigned |
| POST | `/api/hr/onboarding/:workerId/access` | Mark access granted |
| POST | `/api/hr/onboarding/reset` | Reset all onboarding data |
| POST | `/api/hr/onboarding/generate` | Generate new random records |
| GET | `/api/hr/onboarding/pending` | Filter: status=pending |
| GET | `/api/hr/onboarding/inProgress` | Filter: status=in-progress |
| GET | `/api/hr/onboarding/enriched` | Records with joined worker data |
| GET | `/api/hr/onboarding/:id` | Get by id or workerId |
| DELETE | `/api/hr/onboarding/:id` | Delete record |

### Legacy Portal
| Method | Path | Description |
|---|---|---|
| POST | `/api/hr/legacy-portal/submit` | Upsert by employeeId into onboardings |
| GET | `/api/hr/legacy-portal/submissions` | Filter where source='Legacy Portal' |
| GET | `/api/hr/legacy-portal/verify/:id` | Lookup by employeeId |

### IoT (Custom)
| Method | Path | Description |
|---|---|---|
| GET | `/api/iot/devices/:id/telemetry` | Live telemetry (faker-generated per request) |

### ITSM Incidents
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/incidents` | Create (auto-ID INC-NNN, audit logged) |
| PATCH | `/api/itsm/incidents/:id/status` | Update status |
| POST | `/api/itsm/incidents/:id/notes` | Add work note |
| POST | `/api/itsm/incidents/:id/assign` | Assign to group/technician |
| POST | `/api/itsm/incidents/:id/escalate` | Bump priority (P4→P1) |
| POST | `/api/itsm/incidents/:id/resolve` | Resolve with resolution notes |
| POST | `/api/itsm/incidents/:id/link` | Link to KB/problem/change |
| GET | `/api/itsm/incidents/stats` | Aggregate counts |

### ITSM Changes
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/changes` | Create (auto-ID CHG-NNN) |
| PATCH | `/api/itsm/changes/:id/status` | Update status |
| POST | `/api/itsm/changes/:id/approve` | CAB approval |
| POST | `/api/itsm/changes/:id/reject` | Reject with reason |
| POST | `/api/itsm/changes/:id/implement` | Start implementation |
| POST | `/api/itsm/changes/:id/complete` | Complete (implemented/failed) |
| GET | `/api/itsm/changes/calendar` | All changes with scheduling |
| GET | `/api/itsm/changes/stats` | Aggregate counts |

### ITSM Service Requests
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/requests` | Create (auto-ID REQ-NNN, resolves catalog item) |
| PATCH | `/api/itsm/requests/:id/status` | Update status |
| POST | `/api/itsm/requests/:id/approve` | Approve request |
| POST | `/api/itsm/requests/:id/reject` | Reject with reason |
| POST | `/api/itsm/requests/:id/fulfill` | Mark fulfilled |
| POST | `/api/itsm/requests/:id/assign` | Assign to technician |
| POST | `/api/itsm/requests/:id/notes` | Add work note |
| GET | `/api/itsm/requests/stats` | Aggregate counts |
| GET | `/api/itsm/requests/pending-approval` | Filter: pending approval |

### ITSM Problems
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/problems` | Create (auto-ID PRB-NNN) |
| PATCH | `/api/itsm/problems/:id/status` | Update status |
| PATCH | `/api/itsm/problems/:id/root-cause` | Set root cause/workaround |
| POST | `/api/itsm/problems/:id/link-incident` | Link incident to problem |
| GET | `/api/itsm/problems/known-errors` | Filter: status=Known Error |

### ITSM Assets
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/assets` | Create (auto-ID by type prefix) |
| PATCH | `/api/itsm/assets/:id/status` | Update status |
| GET | `/api/itsm/assets/by-type/:type` | Filter by asset type |
| GET | `/api/itsm/assets/:id/history` | Audit log filtered to asset |
| GET | `/api/itsm/assets/stats` | Counts by type and status |

### ITSM Knowledge Base
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/knowledge` | Create (auto-ID KB-NNN, status=Draft) |
| PATCH | `/api/itsm/knowledge/:id/publish` | Set status=Published |
| PATCH | `/api/itsm/knowledge/:id/archive` | Set status=Archived |
| POST | `/api/itsm/knowledge/:id/helpful` | Increment helpful counter |
| POST | `/api/itsm/knowledge/:id/view` | Increment view counter |
| GET | `/api/itsm/knowledge/search` | Text search (query param `q`) |

### ITSM Runbooks
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/runbooks` | Create (auto-ID RB-NNN) |
| POST | `/api/itsm/runbooks/:id/execute` | Log execution, return steps |

### ITSM Policies
| Method | Path | Description |
|---|---|---|
| GET | `/api/itsm/policies/by-category/:category` | Filter by category |
| GET | `/api/itsm/policies/search` | Text search (query param `q`) |

### ITSM Dashboard & Reports
| Method | Path | Description |
|---|---|---|
| GET | `/api/itsm/dashboard/stats` | All-in-one stats (incidents, changes, requests, problems, assets, SLA) |
| GET | `/api/itsm/reports/incident-summary` | Totals, by priority, by category |
| GET | `/api/itsm/reports/sla-compliance` | Met/breached counts |
| GET | `/api/itsm/reports/team-performance` | Stats by assignment group |
| GET | `/api/itsm/reports/change-success-rate` | Implemented vs failed |
| GET | `/api/itsm/reports/request-fulfillment` | Fulfilment stats |

### ITSM Audit Log
| Method | Path | Description |
|---|---|---|
| GET | `/api/itsm/audit-log/recent` | Last 50 entries, newest first |
| GET | `/api/itsm/audit-log/by-target/:targetId` | Filter by target entity |
| GET | `/api/itsm/audit-log/by-actor/:actor` | Filter by actor |

### ITSM Notifications
| Method | Path | Description |
|---|---|---|
| PATCH | `/api/itsm/notifications/:id/read` | Mark single notification read |
| POST | `/api/itsm/notifications/mark-all-read` | Mark all read (optional recipientId) |
| GET | `/api/itsm/notifications/unread` | Get unread notifications |

### ITSM Reset
| Method | Path | Description |
|---|---|---|
| POST | `/api/itsm/reset` | Regenerate all ITSM collections to defaults |

### Auto-CRUD (json-server)

Every collection in the database automatically gets full REST endpoints via json-server:

```
GET    /{collection}          — list all (supports ?field=value filtering, _sort, _order, _page, _limit)
GET    /{collection}/:id      — get by id
POST   /{collection}          — create (auto-assigns id if missing)
PUT    /{collection}/:id      — full replace
PATCH  /{collection}/:id      — partial update
DELETE /{collection}/:id      — delete
```

Collections are accessed via their rewritten URLs (see section 5) or directly by name (e.g., `/itsm_incidents`).

---

## 5. URL Rewrite Map

The file `enhanced_routes_complete.json` maps 118 semantic URLs to json-server collection paths. These work alongside (not instead of) the custom routes.

**Pattern**: `/api/{domain}/{resource}` → `/{collection_name}`

Key mappings:

| Semantic URL | Collection |
|---|---|
| `/api/hr/workers` | `/hr_workers` |
| `/api/hr/performance` | `/hr_worker_performance` |
| `/api/hr/onboarding` | `/hr_onboardings` |
| `/api/hr/supervisoryOrganizations` | `/hr_orgs` |
| `/api/finance/invoices` | `/finance_invoices` |
| `/api/finance/expenses` | `/finance_expenses` |
| `/api/crm/customers` | `/crm_customers` |
| `/api/crm/opportunities` | `/crm_opportunities` |
| `/api/iot/devices` | `/iot_devices` |
| `/api/iot/alerts` | `/iot_alerts` |
| `/api/itsm/incidents` | `/itsm_incidents` |
| `/api/itsm/changes` | `/itsm_changes` |
| `/api/itsm/requests` | `/itsm_requests` |
| `/api/itsm/catalog` | `/itsm_catalog` |
| `/api/itsm/knowledge` | `/itsm_knowledge` |
| `/api/itsm/audit-log` | `/itsm_audit_log` |

**Important**: "Filtered" rewrites (e.g., `/api/hr/workers/active` → `/hr_workers`) map to the full collection. Actual filtering is done client-side or via json-server query params (`?status=active`).

---

## 6. ITSM Console Frontend

### Entry Point

`public/itsm-app/index.html` — HTML shell with sidebar navigation, content area, right panel, and modal/toast containers.

### Script Loading Order (dependency chain)

```
data.js          → defines ITSMData global object (seed data + runtime cache)
api.js           → defines ITSMApi IIFE (HTTP service layer, populates ITSMData from API)
utils.js         → defines Utils global (formatting, badges, escaping)
toast.js         → defines Toast global (showToast)
modals.js        → defines Modals global (showModal, closeModal)
notifications.js → defines NotificationsModule
settings.js      → defines SettingsModule
auditlog.js      → defines AuditLogModule
reports.js       → defines ReportsModule
runbooks.js      → defines RunbooksModule
knowledge.js     → defines KnowledgeModule
incidents.js     → defines IncidentsModule
changes.js       → defines ChangesModule
assets.js        → defines AssetsModule
sla.js           → defines SLAModule
customers.js     → defines CustomersModule
assignment.js    → defines AssignmentModule
linking.js       → defines LinkingModule
problems.js      → defines ProblemsModule
catalog.js       → defines CatalogModule
requests.js      → defines RequestsModule
email.js         → defines EmailModule
bulk.js          → defines BulkModule
app.js           → main app init (depends on everything above)
```

### Data Flow

```
Startup:
  DOMContentLoaded → initializeApp()
    → setupNavigation() + setupClock()
    → ITSMApi.loadAll()               ← parallel fetch 16 collections + dashboard stats
       → populates ITSMData.*         ← from API responses
       → falls back to data.js seeds  ← if API unreachable
    → updateSidebarBadges()
    → renderModule('dashboard')

User Mutation (e.g., create incident):
  UI button click → module function (e.g., submitNewIncident)
    → await ITSMApi.createIncident(data)     ← POST to API
       → API creates record, returns it
       → ITSMApi calls loadCollection('incidents')  ← re-fetch full list
       → ITSMData.incidents updated
    → Toast.show('Created!')
    → re-render current view
```

### Module Router (app.js)

```javascript
const modules = {
    'dashboard':       renderDashboard,
    'incidents':       renderIncidents,
    'my-tickets':      renderMyTickets,
    'knowledge-base':  renderKnowledgeBase,
    'runbooks':        renderRunbooks,
    'changes':         renderChanges,
    'cab-calendar':    renderCABCalendar,
    'assets':          renderAssets,
    'policies':        renderPolicies,
    'reports':         renderReports,
    'audit-log':       renderAuditLog,
    'settings':        renderSettings,
    'demo-reset':      renderDemoReset,
    'problems':        renderProblems,
    'requests':        renderRequests,
    'service-catalog': renderServiceCatalog,
    'my-requests':     renderMyRequests,
};
```

### API Service Layer (api.js)

`ITSMApi` is an IIFE exposing async methods. Uses `BASE_URL = ''` (same-origin).

**Collection Map** (frontend cache key → backend path):
```javascript
const COLLECTION_MAP = {
    incidents:         '/itsm_incidents',
    changes:           '/itsm_changes',
    serviceRequests:   '/itsm_requests',
    problems:          '/itsm_problems',
    assets:            '/itsm_assets',
    knowledgeArticles: '/itsm_knowledge',
    catalogItems:      '/itsm_catalog',
    teams:             '/itsm_teams',
    technicians:       '/itsm_technicians',
    customers:         '/itsm_customers',
    notifications:     '/itsm_notifications',
    auditLog:          '/itsm_audit_log',
    policies:          '/itsm_policies',
    runbooks:          '/itsm_runbooks',
    slaConfigs:        '/itsm_sla_configs',
    emailTemplates:    '/itsm_email_templates',
};
```

**Public API methods**: `loadAll`, `loadCollection`, `loadDashboardStats`, `createIncident`, `updateIncidentStatus`, `addIncidentNote`, `assignIncident`, `escalateIncident`, `resolveIncident`, `linkIncident`, `saveEntity`, `createChange`, `updateChangeStatus`, `approveChange`, `rejectChange`, `implementChange`, `completeChange`, `createRequest`, `updateRequestStatus`, `approveRequest`, `rejectRequest`, `fulfillRequest`, `assignRequest`, `addRequestNote`, `createProblem`, `updateProblemStatus`, `updateProblemRootCause`, `linkIncidentToProblem`, `createAsset`, `updateAssetStatus`, `createKBArticle`, `publishKBArticle`, `archiveKBArticle`, `viewKBArticle`, `markKBHelpful`, `markNotificationRead`, `markAllNotificationsRead`, `resetDemoData`

### Sidebar Navigation Structure

```
SERVICE DESK
  Dashboard           data-module="dashboard"
  Incidents           data-module="incidents"         [badge: open count]
  Problems            data-module="problems"          [badge: open count]
  My Tickets          data-module="my-tickets"
  Service Requests    data-module="requests"          [badge: open count]
  Service Catalog     data-module="service-catalog"
  My Requests         data-module="my-requests"

KNOWLEDGE
  Knowledge Base      data-module="knowledge-base"
  Runbooks            data-module="runbooks"

CHANGE MANAGEMENT
  Change Requests     data-module="changes"
  CAB Calendar        data-module="cab-calendar"

CONFIGURATION
  Assets / CMDB       data-module="assets"
  Policies            data-module="policies"

REPORTS
  Reports             data-module="reports"
  Audit Log           data-module="audit-log"

ADMINISTRATION
  Settings            data-module="settings"
  Reset Demo Data     data-module="demo-reset"
```

### Styling

- `styles/retro.css` — Main theme (early-2000s enterprise look): CSS variables, layout, header, sidebar, content area, modals, toasts, scrollbars, icon sizing classes
- `styles/components.css` — Data tables, forms, buttons, badges, cards, widgets, toolbars, split-pane layout, tabs

### Icons

28 PNG line icons in `public/itsm-app/icons/`:

```
alert.png       audit.png       book-open.png   book.png
bug.png         calendar.png    cards.png       cart.png
chart.png       dashboard.png   delivery.png    desktop.png
document.png    download.png    edit.png        email.png
key.png         legal.png       note.png        phone.png
refresh-alt.png refresh.png     scroll.png      search.png
settings.png    slideshow.png   user.png        warning.png
```

Referenced by filename (without extension) in catalog items and inline `<img>` tags. CSS classes control sizing per context (see `CLAUDE.md` → Icons section).

---

## 7. Workshop API Explorer

### Entry Point

`public/index.html` — Single-page app using Tailwind CSS (CDN), Axios (CDN), Prism.js.

### Layout

- **Sidebar** (`<aside>`): Navigation tree grouped by domain (HR, Finance, CRM, IoT, Analytics, ITSM)
- **Content area** (`#content-area`): Dynamically rendered module content
- **Custom Tailwind theme**: UiPath brand colors (Robotic Orange #FA4616, Agentic Teal #0BA2B3, Deep Blue #182126)

### Supporting JS Modules (`public/js/`)

| File | Global | Purpose |
|---|---|---|
| `layout-manager.js` | `LayoutManager` | Flexible layout, panel resizing, sidebar collapse |
| `objectives-manager.js` | `ObjectivesManager` | Workshop learning objective tracking, achievements |
| `tabs.js` | `TabManager` | Tab configurations per module, UiPath workflow examples |
| `welcome.js` | — | Welcome screen, guided tour, quick-start scenarios |

### How Modules Work

`script.js` defines a `modules` object where each key maps to a module with `title`, `icon`, `description`, and `endpoints[]`. Each endpoint has `method`, `path`, `description`, optionally `needsId` and `body`. The UI renders endpoint cards with "Try It" buttons that execute real API calls via Axios.

---

## 8. Legacy Portal

`public/legacy-portal/` — Three static HTML pages simulating an ACME Corp HR registration system.

| Page | Purpose | API Endpoint |
|---|---|---|
| `index.html` | Registration form | `POST /api/hr/legacy-portal/submit` |
| `search.html` | Search submissions | `GET /api/hr/legacy-portal/submissions` |
| `view.html` | View single record | `GET /api/hr/legacy-portal/verify/:id` |

Used in UiPath workshops to demonstrate automating data entry from a "legacy" web application into the modern API.

---

## 9. Configuration & Deployment

### Dependencies (package.json)

```
Runtime:  json-server@0.17.4, @faker-js/faker@8.x, debug@4.x
Dev:      @playwright/test@1.58.x
Scripts:  start → node server.js, dev → node server.js
Engine:   node >= 14.0.0
```

### ESLint (eslint.config.js)

Flat config (v9+). Lints `src/` and `server.js` only. `public/` is ignored. Rules: `no-unused-vars: warn`, `no-console: off`.

### Deployment Options

| Platform | Method |
|---|---|
| **Azure** | GitHub Actions (`.github/workflows/azure-deploy.yml`), push to main triggers deploy |
| **Railway** | One-click template |
| **Any Node.js host** | `npm install --production && node server.js` |

### GitHub Actions Workflow

Trigger: push to `main` or manual `workflow_dispatch`. Steps: checkout → setup Node 20 → `npm install --production` → deploy via `azure/webapps-deploy@v3`. Secrets: `AZURE_WEBAPP_NAME`, `AZURE_WEBAPP_PUBLISH_PROFILE`.

### Testing

```bash
# Playwright E2E (requires server running on :4000)
cd public/itsm-app && npx playwright test

# Quick API smoke test
curl http://localhost:4000/health
curl http://localhost:4000/api/itsm/incidents
```

---

## 10. File Index

| File | Lines | Purpose |
|---|---|---|
| `server.js` | ~2700 | Entire backend |
| `enhanced_routes_complete.json` | 118 | URL rewrite rules |
| `package.json` | ~25 | Dependencies and scripts |
| `eslint.config.js` | ~12 | Linting config |
| `.github/workflows/azure-deploy.yml` | ~25 | CI/CD pipeline |
| `src/services/validationService.js` | ~315 | Workshop validation (unused) |
| `public/index.html` | ~500 | API Explorer UI |
| `public/script.js` | ~600 | Explorer logic and module definitions |
| `public/api-documentation.html` | ~1620 | Static API reference |
| `public/js/layout-manager.js` | ~390 | Layout management |
| `public/js/objectives-manager.js` | ~450 | Learning objectives |
| `public/js/tabs.js` | ~370 | Tab system + workflow examples |
| `public/js/welcome.js` | ~300 | Welcome screen and tour |
| `public/itsm-app/index.html` | ~235 | ITSM Console shell |
| `public/itsm-app/js/data.js` | ~580 | Seed data + runtime cache |
| `public/itsm-app/js/api.js` | ~640 | HTTP service layer |
| `public/itsm-app/js/app.js` | ~700 | Main app logic |
| `public/itsm-app/js/modules/incidents.js` | ~600 | Incident management |
| `public/itsm-app/js/modules/changes.js` | ~550 | Change management |
| `public/itsm-app/js/modules/requests.js` | ~680 | Service requests |
| `public/itsm-app/js/modules/catalog.js` | ~400 | Service catalog |
| `public/itsm-app/js/modules/problems.js` | ~450 | Problem management |
| `public/itsm-app/js/modules/assets.js` | ~400 | Asset/CMDB management |
| `public/itsm-app/js/modules/knowledge.js` | ~350 | Knowledge base |
| `public/itsm-app/js/modules/reports.js` | ~400 | Reports and analytics |
| `public/itsm-app/js/modules/utils.js` | ~200 | Shared utilities |
| `public/itsm-app/styles/retro.css` | ~670 | Main theme |
| `public/itsm-app/styles/components.css` | ~800 | Component styles |
