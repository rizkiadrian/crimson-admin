<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Lingkar Project — Fullstack Reference

This document serves as the master reference for the Lingkar Fullstack project. The system consists of a Laravel 12 Backend API (`lingkar-id-backend`) and a Next.js 16 Backoffice Dashboard (`lingkar-crm`).

## 1. Project Topology

- **Backend API:** `/Users/rizkiadrian/works/personal/lingkar-id-backend`
- **Frontend CRM:** `/Users/rizkiadrian/works/personal/lingkar-crm`
- **Mobile App:** `/Users/rizkiadrian/works/personal/LingkarIdApp` (React Native 0.85, client-facing app)

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

> For the React Native mobile app, see `LingkarIdApp/README.md`.

### Tech Stack

- **Framework:** Next.js 16 (App Router only).
- **Styling:** Tailwind CSS 4 with custom design tokens in `globals.css`.
- **State Management:** Zustand (Global Notifications, Confirm Dialogs) + Local React state.
- **Data Fetching:** Axios + Custom Hooks (`useTableData`, `useInfiniteScroll`, `useDetailData`).
- **Charts:** Recharts with design-system-mapped colors (`CHART_COLORS`, `CHART_SETS`).
- **Calendar:** react-day-picker 9 + date-fns 4.

### Next.js 16 Specific Rules

- **Image remotePatterns:** Must include `search: ""` property. Without it, the image optimizer returns 400.
- **Config changes:** `next.config.ts` changes require dev server restart (not hot-reloaded).

### Core Architectural Patterns

1. **React 19 Compliance:** No synchronous `setState` inside `useEffect` bodies. `useDetailData` uses `useReducer` + `queueMicrotask`. `FilterPopup` animation uses two separate effects (mount + visibility). Edit forms use a "Page + Inner Form" split to pass fetched data directly as initial state.
2. **URL-Synced State:** Pagination (`?page=N`) and Search (`?search=keyword`) are synchronized with URL Query Params via `useTableData`. Infinite scroll pages use `useInfiniteScroll` which syncs `?search=` to URL. Edit pages capture `?returnPage=N` to navigate back to the exact table page.
3. **API Service Layer:** No direct `axios.get` or `fetch` calls inside React components. All components call typed wrapper functions inside `src/services/`. The `api.ts` client supports `get`, `post`, `put`, `delete`, `patch`. The `post()` method auto-detects `FormData` and removes the `Content-Type` header so axios sets `multipart/form-data` with boundary automatically.
   - **Activity Logs service** (`services/sales/activity-logs/`): `getActivityLogs` (list), `createActivityLog` (create with `ICreateActivityLogPayload`), and `getActivityLogDetail` (detail with reviewer info). The create function auto-detects file attachments and sends as `multipart/form-data` when present, JSON otherwise. API response includes `attachment_url`, `thumbnail_url`, and `attachment_type` fields (appended via backend model accessors). Image attachments have auto-generated thumbnails (max 200×200px) via backend `ThumbnailService`.
   - **Backoffice Activity Logs service** (`services/backoffice/activity-logs/`): `list` (paginated with search, status, type filters), `detail` (single log with relations), `updateStatus` (approve/reject with reason + optional comment). Detail pages show "Detail Permintaan" section: for `request_update_lead_status` shows Tipe Lead, Status Lead Saat Ini, and Status Yang Diminta badges; for `request_lead_assign` shows Lead name, Tipe Lead, and Sales ID Yang Diminta badges. List table includes "Requested" column showing requested status (→ Won) or sales ID (SLS-0002). On approve, backend `applyApprovedAction()` auto-updates lead status/assignment.
   - **Deposit Requests service** (`services/backoffice/deposit-requests/`): `list` (paginated with search, status, payment_method filters), `detail` (single deposit with user + reviewer relations), `updateStatus` (approve/reject with reason). Approval atomically credits wallet balance and creates WalletTransaction. Rejection requires reason (max 1000 chars). Both outcomes dispatch `NotifyClientUser` job. Non-pending deposits reject status changes (422). Inactive wallets reject approval (422).
   - **Comments service** (`services/shared/comments/`): `list` (chronological comments for an activity log), `create` (new comment). Access controlled at backend — only activity log owner or reviewer can access.
   - **Sales Notifications service** (`services/sales/notifications/`): `list`, `unreadCount`, `markAsRead`, `markAllAsRead`. Mirrors the backoffice notifications service pattern.
   - **Form submission pattern:** Create forms use `handleFormError(err, setFormErrors)` from `@lib/utils` for 422 field-level errors, and `showNotification(err.message, "error")` for general errors. Success flow: toast + `router.push(PATHS.xxx)`.
   - **Type note:** `IUserAuth.sales_id` is typed as `string | null` (backend returns format "SLS-XXXX"), not `number | null`.
   - **Type note:** `IActivityLogLead` includes optional `type?: string` and `status?: string` fields. `IActiveLead` includes `type: string` and `status: string` fields. Lead dropdown in create form shows `[Type · Status]` format: `LD-0032 — PT Agung Sedayu [Client · New]`.
   - **Active leads list:** `LeadService.getActiveLeadsList` returns `id`, `name`, `lead_id`, `type`, and `status` fields. Supports `?unassigned_only=1` (leads without assigned sales) and `?assigned_to_me=1` (leads assigned to current sales user). Frontend create form dynamically filters: `request_lead_assign` → `unassigned_only`, `request_update_lead_status` → `assigned_to_me`, `general_note` → no filter.
   - **Sales Dashboard service** (`services/sales/dashboard/`): `salesDashboardService.getDashboard()` fetches sales-specific summary. Returns: leads (total, active, won, lost, by_status, by_type, by_priority), activities (total, this_month, by_status), recent_activities (5 latest), recent_leads (5 latest assigned). Used by `/sales-dashboard` page.
   - **Backoffice Dashboard service** (`services/backoffice/dashboard/`): `IDashboardData` includes `deposits: { total: number; pending: number }` and `journey: IJourneySummary` (stages array with counts per stage + conversion_rate). Dashboard page shows a `StatCard` for deposits (title "Deposit Requests", value = total, description = "N pending review", icon Wallet, iconVariant "warning") and a `StatCard` for journey (title "Active Users", value = active stage count, description = "X.X% conversion rate", icon TrendingUp, iconVariant "success").
   - **Deposit request pages**: List page at `/dashboard/deposit-requests` (TableCard with search, status/payment_method filters, columns: Client Name, Reference Code, Amount in Rp format, Payment Method, Status badge, Created Date). Detail page at `/dashboard/deposit-requests/[id]` (DetailCard with deposit info, attachment preview, approve/reject form for pending, read-only review info for processed). Uses `useTableData` and `useDetailData` hooks respectively.
   - **Analytics pages**: Funnel Overview at `/dashboard/analytics/funnel` (period filter controls, funnel bar chart with `BarChartComponent`, trend line chart with Recharts `LineChart`, average time per stage, uses `CHART_COLORS`/`CHART_SETS`). User Segments at `/dashboard/analytics/segments` (top section with Total Users summary card + DonutChart showing stage distribution, redesigned stage cards with unique icons per stage — UserPlus/UserCheck/Wallet/Zap/Moon/UserX — colored progress bars, hover animations, click-to-deselect; `SegmentUsersTable` sub-component mounts only when stage is selected, paginated user table via `useTableData`, registration/last-active date filters, CSV export). Event Log at `/dashboard/analytics/events` (paginated table via `useTableData`, SearchInput, event type/date range filters via FilterPopup, `MetadataPopover` component for metadata display — truncated metadata shown as clickable primary-colored link with dotted underline, popover shows full formatted JSON with copy-to-clipboard button, smart positioning above/below, closes on click outside or Escape key).
   - **Banners service** (`services/backoffice/banners/`): `bannersService.list` (paginated with search, type, status filters), `bannersService.detail` (single banner), `bannersService.create` (FormData for both types), `bannersService.update` (POST with `_method=PUT` for multipart), `bannersService.delete`, `bannersService.updateStatus` (toggle active/inactive), `bannersService.reorder` (array of `{id, display_order}`). Types: `IBanner`, `IBannerParams`, `ITextElement`, `IBackgroundConfig`, `ICtaConfig`, `BannerType`, `BannerStatus`. Two banner types: `image` (file upload, JPEG/PNG/WebP, max 2MB, 1080x608 ±10px) and `text_placement` (DOM-based Canva-style editor with background config + text elements + CTA button, rendered to PNG on submit). Both types support `target_url` (web URL or deeplink, max 500 chars). `ICtaConfig` fields: text, position_x/y, bg_color, text_color, border_radius, font_size, padding_x/y. Hex colors support 8-char alpha (#FFFFFFB3). Text placement banners send FormData with JSON strings for background_config, text_elements, cta_config (backend `prepareForValidation()` decodes them). Image dimension validation (1080x608 ±10px) only applies to `type=image`.
   - **Service Categories service** (`services/backoffice/service-categories/`): `serviceCategoriesService.list` (paginated with search), `serviceCategoriesService.detail` (single category), `serviceCategoriesService.create` (FormData for SVG icon upload), `serviceCategoriesService.update` (POST with `_method=PUT` for multipart FormData), `serviceCategoriesService.delete`. Types: `IServiceCategory`, `IServiceCategoryParams`, `CategoryType`. `CategoryType` = `"general" | "daily" | "monthly" | "popular"`. `IServiceCategory` fields: `id` (number), `name`, `slug`, `description` (nullable), `icon` (nullable, full URL from backend accessor), `types` (nullable CategoryType array), `is_active` (boolean), `created_at`, `updated_at`. Icon is SVG only (max 2MB). Types field uses multi-checkbox (not multi-select) because only 4 options. Status toggle on list page follows banner management pattern.
   - **Analytics service** (`services/backoffice/analytics/`): `analyticsService.getFunnelStats` (funnel stats with period filter), `analyticsService.getFunnelTrends` (daily/weekly trend data), `analyticsService.getSegmentSummary` (user counts per stage), `analyticsService.getSegmentUsers` (paginated users in stage with date filters), `analyticsService.exportSegmentCsv` (CSV download as blob), `analyticsService.getEventLog` (paginated event log with search/filters). Types: `IFunnelStats`, `IFunnelTrends`, `ISegmentSummary`, `ISegmentUser`, `IUserEvent`, `IFunnelParams`, `ISegmentUsersParams`, `IEventLogParams`, `IJourneySummary`. Backend uses dual approach for event tracking: `EventTrackingService.trackEvent()` (synchronous direct write for lifecycle events) and `EventTrackingService.trackEventAsync()` (queue-based write via Redis for high-frequency mobile events dispatched as `TrackUserEvent` job).
   - **Banner pages**: List page at `/dashboard/banners` (TableCard with search, type/status filters, status toggle, delete with ConfirmDialog). Create page at `/dashboard/banners/create` (conditional form: image upload or DOM-based canvas editor, target URL field for both types, CTA properties panel for text_placement). Edit page at `/dashboard/banners/[id]/edit` (pre-populated form via `useDetailData`, "Page + Inner Form" split). Canvas editor components in `_partials/`: `CanvasEditor` (DOM-based Canva-style, 2:1 ratio matching mobile 280×140, drag-and-drop text + CTA, double-click inline edit, `captureImage()` exports 1080×540 PNG via `forwardRef` + `useImperativeHandle`), `TextPropertiesPanel` (content, font_size, font_color, font_weight), `CtaPropertiesPanel` (toggle enable/disable, text, colors, border radius, font size, padding), `BackgroundSelector` (8 solid + 8 gradient presets, custom color), `TemplateSelector` (4 templates matching mobile app's PromoBanner: Cashback 20%, Gratis Transfer, Referral Bonus, Promo Spesial — applies text + CTA + background together), `BannerPreviewModal` (~375px mobile viewport preview, renders CTA button).
   - **Service Category pages**: List page at `/dashboard/service-categories` (TableCard with search, status toggle, delete with ConfirmDialog. Columns: icon thumbnail, name, slug, types badges, status badge, created date, actions). Create page at `/dashboard/service-categories/create` (FormCard with name, description, icon SVG upload with preview, types multi-checkbox for general/daily/monthly/popular, is_active toggle. Client-side validation: name required, max 255 chars, icon SVG only, max 2MB). Edit page at `/dashboard/service-categories/[id]/edit` (pre-populated form via `useDetailData`, "Page + Inner Form" split, shows existing icon preview, optional icon replacement, POST with `_method=PUT` FormData, returnPage preservation). Uses `useTableData` and `useDetailData` hooks respectively.
4. **UI Component System:**
   - Forms: `FormCard` (Header, Body, Footer, Loading, Error)
   - Lists: `TableCard` + `TableCardContent` (with built-in skeleton, error, and empty states)
   - Details: `DetailCard` (Header, Body, Section, FieldGrid, Field, ImageGrid)
   - Charts: `ChartCard` + `DonutChart` + `BarChartComponent` with `CHART_COLORS`/`CHART_SETS`
   - Dashboard: `StatCard` for summary metrics
   - Inputs: `FormInput` (text, password, phone format, date format with calendar), `FormCheckbox` / `FormCheckboxGroup` (custom-styled checkbox with hidden native input, Check icon, primary-500 fill, focus-visible ring, group label + error support)
   - Search: `SearchInput` (debounced, with clear button)
   - Modals: `FilterPopup`, `ConfirmDialog`
   - Timeline: `ActivityCard` (with attachment thumbnail preview and file icon badge, `isInsideLink` prop to prevent nested `<a>` hydration errors by using `<span role="button">` + `stopPropagation` + `window.open()`), `ActivityCardSkeleton` (from `@app/components/ui/ActivityCard`), `ActivityTimeline` (for sales activities timeline view)
   - Comments: `CommentThread` (from `@app/components/ui/CommentThread`) — reusable comment list + create form, used in both backoffice and sales activity log detail pages. Shows avatar initial, name, role badge, body, relative timestamp (date-fns `id` locale).
   - **FORBIDDEN native elements:** Do NOT use `<button>`, `<input>`, `<select>`, `<a>`, or `<img>` directly. Always use:
     - `<button>` → `Button` from `@app/components/ui/Button`
     - `<input>` → `FormInput` from `@app/components/ui/FormInput`
     - `<select>` → `FormSelect` from `@app/components/ui/FormSelect`
     - `<a>` → `Button` with `href` prop (renders as Next.js `Link`)
     - `<img>` → Next.js `<Image>` with proper `remotePatterns` config
   - **Button as list item pattern:** When using `Button` for clickable list items (e.g., notification rows), override defaults: `className="w-full h-auto justify-start items-start text-left rounded-none border-none hover:border-none"`
5. **Global Modals/Toasts:** Use `useNotificationStore().showNotification` for toasts and `useConfirmStore().showConfirm` for confirmation modals. Do not mount custom `<Modal>` components.
6. **Sidebar Navigation:** Uses accordion pattern with `NavGroup` type. Groups auto-expand when child route is active. Active detection uses `pathname.startsWith()`. Sidebar receives `roleName` prop from the server component layout (read from `role_name` cookie) — it does NOT use Zustand for role-based menu decisions. Sales Management group includes: Leads, Sales Members, Activity Logs. Finance group includes: Deposit Requests. Analytics group includes: Funnel Overview, User Segments, Event Log (after Finance group, uses TrendingUp/Users/ScrollText icons). Master Data group includes: Service Categories (after Analytics group, uses Database group icon + FolderTree item icon). Banners sidebar item with Image icon links to `/dashboard/banners`. Bottom section displays user info (name from Zustand profile, role from prop, avatar initial) and a logout button (LogOut icon, red on hover). Logout calls `logout()` server action → `clearProfile()` → redirect to `/login`.
7. **Notification Bell:** `NotificationBell` component in Navbar with `useBackofficeNotificationStore` (Zustand). Supports both backoffice and sales roles — detects role via `BUSINESSFLOW.salesRoles`/`backofficeRoles` and uses the appropriate store (`useBackofficeNotificationStore` or `useSalesNotificationStore`). Polls unread count every 30s. Dropdown shows latest 5 notifications. Full page at `/dashboard/notifications`. Receives `roleName` prop from Navbar (passed down from layout) to determine if polling should be active. Clicking a notification with a `link` field navigates to that URL (deep link to activity log detail pages). Includes `resolveLink()` helper that constructs links from `reference_type` + `reference_id` when `link` is null. Shows type labels: `status_change` → "Status Update", `new_comment` → "Komentar Baru".
8. **Design System Page:** Live component preview at `/design-system`. Currently 20 sections. Must be updated when components change (Kiro hook `sync-design-system` reminds). Every new component or visual change MUST add a showcase to `/design-system` and update `docs/DESIGN_SYSTEM.md`.
9. **Zustand Store Naming:** `useXxxStore` for global UI state (toasts, confirm dialog). `useBackofficeXxxStore` for domain-specific state (notifications). `useSalesXxxStore` for sales-specific state (e.g., `useSalesNotificationStore` at `src/store/useSalesNotificationStore.ts` — mirrors backoffice notification store but uses `salesNotificationsService`). Page-level state stays in component `useState`.
10. **Role Cookie & Server-Side Routing:** Login (`setCredentials` server action) fetches `/auth/me` after obtaining tokens to get `role_name`, then stores it as an httpOnly cookie via `setRoleCookie`. Middleware (`src/middleware.ts`) reads the `role_name` cookie and performs 307 redirects: Sales → `/sales-dashboard`, Backoffice → `/dashboard`. The dashboard layout (`src/app/(dashboard)/layout.tsx`) is an async server component that reads the cookie and passes `roleName` as a prop to `Sidebar`, `Navbar`, and `BackofficeStatus`. The `useUserProfile` store calls `syncRoleCookie` server action after profile fetch to keep the cookie in sync. Cookie keys are centralized in `COOKIE_KEYS` (`src/config/env.ts`); helpers in `src/lib/secure-cookie.ts`. Logout (`logout` server action in `src/actions/auth/auth.actions.ts`) calls `POST /auth/logout` to revoke tokens (best-effort), then `removeAuth()` to clear all cookies (`access_token`, `refresh_token`, `role_name`). If the backend call fails, cookies are still cleared (graceful degradation).

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

Test pages: Dashboard, Backoffice Members, Client Members, Mitra Members, Design System, Notifications, Activity Logs, Sales Activities, Deposit Requests, Banners, Analytics (Funnel, Segments, Events), Service Categories. Login: `admin@example.com` / `Password123`.

For detailed testing workflows (browser testing, backend curl commands, database verification, Postman setup), see `.agent/skills/testing-workflows.md`.
