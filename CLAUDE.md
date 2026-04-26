<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Lingkar Project — Fullstack Reference

This document serves as the master reference for the Lingkar Fullstack project. The system consists of a Laravel 12 Backend API (`lingkar-id-backend`) and a Next.js 16 Backoffice Dashboard (`lingkar-crm`).

## 1. Project Topology

- **Backend API:** `/Users/rizkiadrian/works/personal/lingkar-id-backend`
- **Frontend CRM:** `/Users/rizkiadrian/works/personal/lingkar-crm`

---

## 2. Backend (Laravel 12 API)

### Tech Stack

- **Framework:** Laravel 12 (PHP 8.2+) running on Laravel Octane (via Docker/Sail).
- **Auth:** Laravel Sanctum (Access Token 15min + Refresh Token 7 days).
- **Database:** PostgreSQL (Docker container `lingkar-id-backend-pgsql-1` on port 5432).
- **Queue:** Database driver. All emails and profile operations are async.

### Core Architectural Patterns

1. **Service Layer Pattern:** Controllers must remain extremely thin. All business logic must reside in `app/Services/`. Controllers only validate input via FormRequests, call service methods, and return standardized JSON.
2. **API Response Standardization:** Use the `ApiResponse` support class. Responses must return exactly: `{ success: boolean, message: string, data: array|object, meta: { http_status, pagination? } }`.
3. **Password Hashing:** Always use `AuthHelper::hashPassword()`. NEVER use `Hash::make()` directly anywhere in the codebase.
4. **Database & Migrations:**
   - Core tables use `SoftDeletes`.
   - `UserObserver` handles automatic side effects (auto-creating wallets on user registration).
   - User model has `scopeSearch()` for ILIKE search across name, email, phone.
5. **Queue & Background Jobs:** All email sending and profile operations must be dispatched as async queued jobs (`ShouldQueue`). Jobs: `CreateUserProfile`, `UpdateUserProfile`, `DeleteUserProfile`.
6. **Email Notifications:** 5 mailables: `VerifyEmailMail`, `ClientAccountCreatedMail`, `ProfileUpdatedByBackofficeMail`, `ClientManuallyVerifiedMail`, `ClientAccountDeletedMail`.
7. **Role Guards:** Every service method that modifies a user must validate the target user's role matches the service context (e.g., `ClientMemberService` only operates on `Role::CLIENT`).
8. **Docker:** App runs in Docker. Main container: `lingkarid.local`. Use `docker exec lingkarid.local php artisan ...` for artisan commands.
9. **Postman Collection:** Located at `postman/Lingkar_ID_API.postman_collection.json`. Must be updated when endpoints change.

---

## 3. Frontend (Next.js 16 CRM)

### Tech Stack

- **Framework:** Next.js 16 (App Router only).
- **Styling:** Tailwind CSS 4 with custom design tokens in `globals.css`.
- **State Management:** Zustand (Global Notifications, Confirm Dialogs) + Local React state.
- **Data Fetching:** Axios + Custom Hooks (`useTableData`, `useDetailData`).
- **Charts:** Recharts with design-system-mapped colors (`CHART_COLORS`, `CHART_SETS`).
- **Calendar:** react-day-picker 9 + date-fns 4.

### Next.js 16 Specific Rules

- **Image remotePatterns:** Must include `search: ""` property. Without it, the image optimizer returns 400.
- **Config changes:** `next.config.ts` changes require dev server restart (not hot-reloaded).

### Core Architectural Patterns

1. **React 19 Compliance:** No synchronous `setState` inside `useEffect` bodies. `useDetailData` uses `useReducer` + `queueMicrotask`. `FilterPopup` animation uses two separate effects (mount + visibility). Edit forms use a "Page + Inner Form" split to pass fetched data directly as initial state.
2. **URL-Synced State:** Pagination (`?page=N`) and Search (`?search=keyword`) are synchronized with URL Query Params via `useTableData`. Edit pages capture `?returnPage=N` to navigate back to the exact table page.
3. **API Service Layer:** No direct `axios.get` or `fetch` calls inside React components. All components call typed wrapper functions inside `src/services/`. The `api.ts` client supports `get`, `post`, `put`, `delete`, `patch`.
4. **UI Component System:**
   - Forms: `FormCard` (Header, Body, Footer, Loading, Error)
   - Lists: `TableCard` + `TableCardContent` (with built-in skeleton, error, and empty states)
   - Details: `DetailCard` (Header, Body, Section, FieldGrid, Field, ImageGrid)
   - Charts: `ChartCard` + `DonutChart` + `BarChartComponent` with `CHART_COLORS`/`CHART_SETS`
   - Dashboard: `StatCard` for summary metrics
   - Inputs: `FormInput` (text, password, phone format, date format with calendar)
   - Search: `SearchInput` (debounced, with clear button)
   - Modals: `FilterPopup`, `ConfirmDialog`
   - **FORBIDDEN native elements:** Do NOT use `<button>`, `<input>`, `<select>`, `<a>`, or `<img>` directly. Always use:
     - `<button>` → `Button` from `@app/components/ui/Button`
     - `<input>` → `FormInput` from `@app/components/ui/FormInput`
     - `<select>` → `FormSelect` from `@app/components/ui/FormSelect`
     - `<a>` → `Button` with `href` prop (renders as Next.js `Link`)
     - `<img>` → Next.js `<Image>` with proper `remotePatterns` config
   - **Button as list item pattern:** When using `Button` for clickable list items (e.g., notification rows), override defaults: `className="w-full h-auto justify-start items-start text-left rounded-none border-none hover:border-none"`
5. **Global Modals/Toasts:** Use `useNotificationStore().showNotification` for toasts and `useConfirmStore().showConfirm` for confirmation modals. Do not mount custom `<Modal>` components.
6. **Sidebar Navigation:** Uses accordion pattern with `NavGroup` type. Groups auto-expand when child route is active. Active detection uses `pathname.startsWith()`.
7. **Notification Bell:** `NotificationBell` component in Navbar with `useBackofficeNotificationStore` (Zustand). Polls unread count every 30s. Dropdown shows latest 5 notifications. Full page at `/dashboard/notifications`.
8. **Design System Page:** Live component preview at `/design-system`. Currently 16 sections. Must be updated when components change (Kiro hook `sync-design-system` reminds). Every new component or visual change MUST add a showcase to `/design-system` and update `docs/DESIGN_SYSTEM.md`.
9. **Zustand Store Naming:** `useXxxStore` for global UI state (toasts, confirm dialog). `useBackofficeXxxStore` for domain-specific state (notifications). Page-level state stays in component `useState`.

---

## 4. API Contract Integration

**Standard Pagination Request:** `GET /endpoint?page=1&per_page=10&search=keyword`
**Standard Pagination Response:**

```json
{
  "success": true,
  "message": "Successfully retrieved list",
  "data": [ ... items ... ],
  "meta": {
    "http_status": 200,
    "pagination": {
      "total": 50,
      "per_page": 10,
      "current_page": 1,
      "last_page": 5,
      "next_page_url": "...?page=2",
      "prev_page_url": null
    }
  }
}
```

---

## 5. Database Access

- **PostgreSQL** runs in Docker on `127.0.0.1:5432` (mapped from container `pgsql`).
- To query directly, use a PHP script with `parse_ini_file('.env')` and PDO, connecting to `127.0.0.1` (not the Docker hostname `pgsql`).
- Artisan commands run inside Docker: `docker exec lingkarid.local php artisan ...`

---

## 6. Development Guidelines for AI Agents

> **Detailed skills:** See `.agent/skills/` directory for checklists and patterns.

1. **Implementation Plans First:** Always provide an implementation plan before writing code for medium to large features.
2. **Strict Types:** TypeScript for frontend, PHPStan for backend. No `any` or loose typings.
3. **Docs Update:** After any change, check `.agent/skills/documentation-update-guide.md` for which docs to update.
4. **No Hallucinations:** Stick to Tailwind 4 utility classes. Do NOT use Tailwind CSS v3 syntax.
5. **NPM Audit:** Ensure zero new vulnerabilities when adding packages.
6. **Chart Colors:** Always use `CHART_COLORS`/`CHART_SETS` from `chart-colors.ts`. Never hardcode hex.
7. **TypeScript Build Check:** Always run `npx tsc --noEmit` after frontend changes.
8. **PHP Syntax Check:** Always run `php -l <file>` after backend changes.
9. **Testing:** See `.agent/skills/testing-workflows.md` for Kiro and CLI testing workflows.

---

## 7. Component Usage Rules

> **Full reference:** `.agent/skills/component-rules.md`

**NEVER use native HTML elements** when a design system component exists.

| Forbidden          | Use Instead           | Import From                     |
| ------------------ | --------------------- | ------------------------------- |
| `<button>`         | `<Button>`            | `@app/components/ui/Button`     |
| `<input>`          | `<FormInput>`         | `@app/components/ui/FormInput`  |
| `<select>`         | `<FormSelect>`        | `@app/components/ui/FormSelect` |
| `<a>`              | `<Button href="...">` | `@app/components/ui/Button`     |
| `<img>`            | `<Image>`             | `next/image`                    |
| `window.alert()`   | `showNotification()`  | `@store/useNotificationStore`   |
| `window.confirm()` | `showConfirm()`       | `@store/useConfirmStore`        |

For Button override patterns (list items, action buttons), see `.agent/skills/component-rules.md`.

---

## 8. New Feature Checklist

> **Full reference:** `.agent/skills/new-feature-checklist.md`

When building a new feature, read the full checklist at `.agent/skills/new-feature-checklist.md`. Key items:

- Backend: Service → Controller → FormRequest → Routes → Postman → README
- Frontend: Service layer → Zustand store → Pages → Routing → Sidebar → TypeScript check
- Docs: PRD.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, README.md, /design-system showcase, CLAUDE.md

---

## 9. Agent Skills Directory

> **MANDATORY FOR CLAUDE/AUGMENT:** Kiro auto-injects these skills via `.kiro/steering/`. Claude and Augment do NOT — you must read them **manually before writing any code**. Skipping this will cause rule violations.

### Reading Order

1. **Always:** `.agent/skills/component-rules.md` — before writing any JSX
2. **New features:** `.agent/skills/new-feature-checklist.md`
3. **Fullstack features:** `.agent/skills/fullstack-feature-pattern.md`
4. **State / data fetching:** `.agent/skills/state-management-patterns.md`
5. **Form submit / async actions:** `.agent/skills/error-handling-patterns.md`
6. **After any change:** `.agent/skills/documentation-update-guide.md`
7. **Verification:** `.agent/skills/testing-workflows.md`

### Skill Files Reference

| File                            | Description                                                               |
| ------------------------------- | ------------------------------------------------------------------------- |
| `README.md`                     | Index — which skill to read when                                          |
| `component-rules.md`            | Forbidden elements, Button variants, FormCard, TableCard, hooks, mistakes |
| `new-feature-checklist.md`      | Complete checklist (backend + frontend + routing + docs)                  |
| `fullstack-feature-pattern.md`  | Step-by-step template with real module references                         |
| `state-management-patterns.md`  | useState vs useTableData vs useDetailData vs Zustand + React 19 rules     |
| `error-handling-patterns.md`    | handleFormError, showNotification, showConfirm, fetch errors              |
| `documentation-update-guide.md` | Which docs to update after each type of change                            |
| `testing-workflows.md`          | Kiro (MCP), Antigravity (browser_subagent), and CLI verification          |

### Agent Capabilities

| Agent              | Browser Testing         | Skills Auto-Loaded?      |
| ------------------ | ----------------------- | ------------------------ |
| Kiro               | `mcp_chrome_devtools_*` | ✅ via `.kiro/steering/` |
| Antigravity/Claude | `browser_subagent`      | ❌ read manually         |
| Augment            | Varies                  | ❌ read manually         |

---

## 10. Testing Without Kiro (CLI-Only)

> **Full reference:** `.agent/skills/testing-workflows.md`

Quick commands:

```bash
npx tsc --noEmit          # TypeScript check (must pass)
npm audit                 # No new vulnerabilities
npm run dev               # Start dev server at localhost:3000
```

Test pages: Dashboard, Backoffice Members, Client Members, Mitra Members, Design System, Notifications. Login: `admin@example.com` / `Password123`.

For detailed testing workflows (browser testing, backend curl commands, database verification, Postman setup), see `.agent/skills/testing-workflows.md`.
