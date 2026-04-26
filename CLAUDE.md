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
   - Do NOT use plain `<input>` or `<select>`; always use `FormInput` and `FormSelect`.
   - Do NOT use `<img>`; always use Next.js `<Image>` with proper `remotePatterns` config.
5. **Global Modals/Toasts:** Use `useNotificationStore().showNotification` for toasts and `useConfirmStore().showConfirm` for confirmation modals. Do not mount custom `<Modal>` components.
6. **Sidebar Navigation:** Uses accordion pattern with `NavGroup` type. Groups auto-expand when child route is active. Active detection uses `pathname.startsWith()`.
7. **Design System Page:** Live component preview at `/design-system`. Currently 14 sections. Must be updated when components change (Kiro hook `sync-design-system` reminds).

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

1. **Implementation Plans First:** Always provide an implementation plan artifact before writing code for any medium to large feature updates.
2. **Double Check Types:** Both projects are strictly typed (PHPStan for backend, TypeScript for frontend). Do not leave `any` or loose typings.
3. **Docs Update — UI Components:** If an update impacts UI components, you MUST update `docs/DESIGN_SYSTEM.md` and the frontend showcase page at `src/app/design-system/page.tsx`.
4. **Docs Update — Features & APIs:** If a new feature or API is added, you MUST update `README.md` in both backend and frontend, update the Postman collection (`postman/Lingkar_ID_API.postman_collection.json`), and update the Product Requirements in `docs/PRD.md` (frontend).
5. **Docs Update — Architecture:** If there is a change to the folder hierarchy or a new library is introduced to the frontend, you MUST update `docs/ARCHITECTURE.md`.
6. **No Hallucinations on External Libraries:** Stick strictly to Tailwind 4 utility classes for styling. Do NOT use Tailwind CSS v3 arbitrary value syntax if v4 handles it natively.
7. **NPM Audit:** A Kiro hook runs `npm audit` after every agent execution. Ensure zero new vulnerabilities when adding packages.
8. **Chart Colors:** Always use `CHART_COLORS` and `CHART_SETS` from `components/ui/Chart/chart-colors.ts`. Never hardcode hex values in chart components.
9. **PHP Syntax Check:** After creating/modifying PHP files, always run `php -l <file>` to verify syntax.
10. **TypeScript Build Check:** After frontend changes, always run `npx tsc --noEmit` to verify compilation.
