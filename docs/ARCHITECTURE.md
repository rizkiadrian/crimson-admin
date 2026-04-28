# Architecture — Lingkar CRM

## Tech Stack

| Layer            | Technology                       | Version |
| ---------------- | -------------------------------- | ------- |
| Framework        | Next.js (App Router)             | 16      |
| Language         | TypeScript                       | 5       |
| Styling          | Tailwind CSS                     | 4       |
| State Management | Zustand                          | 5       |
| Data Fetching    | Custom hooks                     | —       |
| HTTP Client      | Axios                            | 1.15+   |
| Calendar         | react-day-picker + date-fns      | 9 / 4   |
| Icons            | Lucide React                     | 1.7+    |
| Linting          | ESLint + Prettier                | —       |
| Git Hooks        | Husky + lint-staged + commitlint | —       |

---

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── ui/              # Reusable UI primitives
│   │   │   ├── Button/
│   │   │   ├── Text/
│   │   │   ├── FormInput/       # Input with phone/date/password modes
│   │   │   ├── FormCard/        # Card system for form pages (Header, Body, Footer, Loading, Error)
│   │   │   ├── Table/           # Table system (primitives + TableCard composites)
│   │   │   ├── TableHeader/
│   │   │   ├── FilterPopup/     # Modal filter (chips, range slider, date range)
│   │   │   ├── DetailCard/      # Card system for detail/show pages (sections, fields, image grid)
│   │   │   ├── StatCard/        # Summary stat card for dashboards
│   │   │   ├── SearchInput/     # Debounced search input with clear button
│   │   │   ├── ConfirmDialog/   # Global confirm modal (Zustand-driven)
│   │   │   ├── GlobalNotification/  # Toast notifications (Zustand-driven)
│   │   │   └── ActivityCard/   # Activity item card, skeleton, and helpers (formatRelativeTime, getActivityTypeConfig, getStatusBadgeConfig, getFileIconConfig)
│   │   │   └── CommentThread/ # Reusable comment thread component (list + create, access controlled)
│   │   ├── layout/
│   │   │   ├── Sidebar/         # Accordion navigation with grouped items (User Management, Sales Management, Finance)
│   │   │   └── Navbar/          # Top bar with search, NotificationBell dropdown (supports backoffice + sales roles, resolveLink fallback), profile
│   │   └── core/
│   │       ├── BackofficeStatus/
│   │       └── SetupClient/
│   ├── (dashboard)/
│   │   └── dashboard/
│   │       ├── backoffice-members/
│   │       │   ├── page.tsx                    # List page
│   │       │   ├── create/page.tsx             # Create form
│   │       │   ├── [id]/edit/page.tsx          # Edit form
│   │       │   └── _partials/member-table/     # Table component
│   │       ├── client-members/                 # Same structure as backoffice-members
│   │       ├── mitra-members/
│   │       │   ├── page.tsx                    # List page
│   │       │   ├── [id]/page.tsx               # Show/detail page (with document viewer)
│   │       │   ├── [id]/edit/page.tsx          # Edit form (basic info only)
│   │       │   └── _partials/mitra-table/      # Table component
│   │       ├── leads/
│   │       │   ├── page.tsx                    # List page
│   │       │   ├── create/page.tsx             # Create form
│   │       │   ├── [id]/edit/page.tsx          # Edit form
│   │       │   └── _partials/
│   │       │       ├── lead-table/             # Table with status/priority badges
│   │       │       └── convert-lead-modal/     # Modal for converting lead to user
│   │       ├── sales-members/
│   │       │   ├── page.tsx                    # List page
│   │       │   ├── create/page.tsx             # Create form
│   │       │   ├── [id]/edit/page.tsx          # Edit form
│   │       │   └── _partials/sales-table/      # Table component
│   │       ├── notifications/
│   │       │   └── page.tsx                    # Full notifications list page
│   │       ├── activity-logs/
│   │       │   ├── page.tsx                    # Backoffice activity log list (table with search, status/type filters, "Requested" column)
│   │       │   └── [id]/page.tsx               # Backoffice activity log detail + "Detail Permintaan" section + status update + comments
│   │       ├── deposit-requests/
│   │       │   ├── page.tsx                    # Deposit request list (table with search, status/payment_method filters)
│   │       │   └── [id]/page.tsx               # Deposit request detail + attachment preview + approve/reject form
│   │       └── page.tsx                        # Dashboard home (backoffice, incl. deposits StatCard)
│   ├── (dashboard)/
│   │   └── sales-dashboard/
│   │       └── page.tsx                        # Sales dashboard (leads stats, activity stats, charts, recent items)
│   ├── (dashboard)/
│   │   └── sales-activities/
│   │       ├── page.tsx                        # Timeline list page (infinite scroll)
│   │       ├── create/page.tsx                 # Create activity report form
│   │       ├── [id]/page.tsx                   # Sales activity log detail (reviewer info + "Detail Permintaan" section + comments)
│   │       └── _partials/
│   │           └── activity-timeline/          # Timeline container component
│   ├── design-system/          # Live component preview (/design-system)
│   └── login/
├── lib/
│   ├── hooks/
│   │   ├── use-table-data.ts   # Paginated list fetching + URL sync
│   │   ├── use-infinite-scroll.ts # Infinite scroll fetching + append pagination + URL sync
│   │   └── use-detail-data.ts  # Single resource fetching (useReducer + queueMicrotask)
│   ├── api.ts                  # Axios instance with interceptors
│   └── utils.ts                # cn(), handleFormError(), getNameInitials()
├── services/
│   ├── backoffice/
│   │   ├── backoffice-members/ # Types + service (list, create, detail, update, delete)
│   │   ├── client-members/     # Types + service (list, create, detail, update, delete)
│   │   ├── mitra-members/      # Types + service (list, detail, update, delete)
│   │   ├── leads/              # Types + service (list, create, detail, update, delete, updateStatus, convert)
│   │   ├── sales-members/      # Types + service (list, create, detail, update, delete, list-dropdown)
│   │   ├── notifications/      # Types + service (list, unreadCount, markAsRead, markAllAsRead)
│   │   ├── activity-logs/      # Types + service (list, detail, updateStatus) — backoffice activity log review
│   │   ├── deposit-requests/  # Types + service (list, detail, updateStatus) — deposit request management
│   │   └── dashboard/          # Types + service (summary incl. leads stats, deposits summary)
│   ├── sales/
│   │   ├── active-leads/       # Types + service (getActiveLeads with ?search, ?unassigned_only, ?assigned_to_me)
│   │   ├── activity-logs/      # Types (IActivityLog, ICreateActivityLogPayload, ActivityLogType) + service (list, create, detail with multipart/form-data support)
│   │   ├── dashboard/          # Types + service (salesDashboardService.getDashboard — leads, activities, recent items)
│   │   └── notifications/      # Types + service (list, unreadCount, markAsRead, markAllAsRead) — sales notifications
│   └── shared/
│       └── comments/           # Types + service (list, create) — activity log comments (access controlled)
├── store/
│   ├── useNotificationStore.ts          # Global toast (success/error/info)
│   ├── useConfirmStore.ts               # Global confirm dialog
│   ├── useBackofficeNotificationStore.ts # Notification bell state (unread count, dropdown, polling)
│   └── useSalesNotificationStore.ts     # Sales notification bell state (mirrors backoffice pattern, uses salesNotificationsService)
├── config/
│   ├── env.ts
│   └── routing.ts              # Centralized PATHS object (incl. activityLogs, activityLogDetail, salesActivityDetail, depositRequests, depositRequestDetail)
└── middleware.ts                # Auth redirect + role-based routing middleware
```

---

## Architectural Decisions

### ADR-01: React 19 Compliance

**Decision:** No synchronous `setState` inside `useEffect` bodies.

**Context:** React 19 flags synchronous state updates inside effects as cascading renders. This affects data fetching hooks and animation state.

**Implementation:**

- `useDetailData` uses `useReducer` with `queueMicrotask()` for loading state transitions
- `FilterPopup` animation uses two separate effects: one for mount, one for visibility
- Edit pages use a **page + inner form split**: page handles loading/error, inner form receives data as props and initializes state via `useState(() => transform(data))`

### ADR-02: Service Layer Pattern

**Decision:** Components never call `api.get()` directly.

**Context:** Centralizing API calls in service files provides type safety, single source of truth for endpoints, and easy mocking for tests.

**Implementation:**

- Each domain has a `services/{domain}/` directory with `*.types.ts` and `*.service.ts`
- Service functions are passed to hooks as `fetcher` callbacks
- Response types use generics: `IApiResponse<T>`, `IApiListResponse<T>`

### ADR-03: Global State via Zustand

**Decision:** Only truly global UI state uses Zustand.

**Context:** Zustand is lightweight and doesn't require providers. But overusing global state creates coupling.

**Implementation:**

- `useNotificationStore` — toast notifications (success/error/info with auto-dismiss)
- `useConfirmStore` — confirm dialog (title, description, async onConfirm)
- `useBackofficeNotificationStore` — notification bell (unread count polling, recent list, dropdown state, mark-as-read)
- `useSalesNotificationStore` — sales notification bell (mirrors backoffice pattern, uses `salesNotificationsService`)
- Page-level state (form data, filters, loading) stays in component `useState`

### ADR-04: URL as Source of Truth for Pagination

**Decision:** Table pages sync current page to `?page=N` in the URL.

**Context:** Users expect to bookmark, share, and use browser back/forward on paginated lists.

**Implementation:**

- `useTableData` reads initial page from `useSearchParams()` on mount
- `handlePageChange` pushes `?page=N` via `router.push()` with `scroll: false`
- `setParams` (filter change) resets to page 1 and removes `?page` from URL
- Edit links carry `?returnPage=N` so users return to the correct page after submit

### ADR-05: Role-Based Routing via Cookie in Middleware

**Decision:** Store `role_name` in an httpOnly cookie and use Next.js middleware for server-side role-based routing instead of client-side redirect.

**Context:** Previously, Sales users experienced a flash/loading state because the dashboard page rendered first, fetched the profile via Zustand, checked the role, then did `router.replace(/sales-dashboard)`. This caused a visible flicker on every page load.

**Implementation:**

- `setCredentials` server action fetches `GET /auth/me` after login to obtain `role_name`, then stores it in a `role_name` httpOnly cookie alongside `access_token` and `refresh_token`
- Middleware reads `role_name` from `request.cookies` and performs 307 redirects before the page renders:
  - Sales → `/dashboard` or `/dashboard/*` → redirect to `/sales-dashboard`
  - Backoffice → `/sales-dashboard` or `/sales-activities` → redirect to `/dashboard`
- If `role_name` cookie is missing (e.g., user logged in before this feature), middleware falls back to no role redirect; `useUserProfile` store calls `syncRoleCookie` after profile fetch to populate the cookie for subsequent requests
- Layout (`layout.tsx`) is an async server component that reads the cookie and passes `roleName` as a prop to `Sidebar`, `Navbar`, and `BackofficeStatus` — eliminating Zustand dependency for role-based UI decisions
- `removeAuth` deletes the `role_name` cookie alongside auth tokens on logout

### Cookie Schema

| Cookie Name     | Value                           | httpOnly | Secure     | SameSite | Path | MaxAge |
| --------------- | ------------------------------- | -------- | ---------- | -------- | ---- | ------ |
| `access_token`  | JWT string                      | ✅       | production | lax      | /    | 1 day  |
| `refresh_token` | JWT string                      | ✅       | production | lax      | /    | 1 day  |
| `role_name`     | String ("Admin", "Sales", etc.) | ✅       | production | lax      | /    | 1 day  |

All cookie keys are centralized in `COOKIE_KEYS` (`src/config/env.ts`). Helpers: `setRoleCookie`, `getRoleCookie` in `src/lib/secure-cookie.ts`.

### ADR-06: Design System as Living Documentation

**Decision:** `/design-system` route renders every UI component with interactive examples.

**Context:** Static documentation goes stale. A live preview page ensures components are always testable.

**Implementation:**

- Each component has a showcase in `design-system/components/`
- Kiro hooks auto-remind to update the design system page and README when component files change

---

## Authentication & Middleware

### Login Flow (with Role Cookie)

```
[Login Form]
    │
    ├── Submit credentials
    ├── Server Action: setCredentials(credentials)
    │       ├── POST /auth/login → { access_token, refresh_token }
    │       ├── GET /auth/me (Bearer token) → { role_name, name, email, ... }
    │       ├── Set cookies: access_token, refresh_token, role_name
    │       └── If /auth/me fails → login still succeeds (graceful degradation, no role cookie)
    │
    └── Client receives success → navigate to /dashboard

[Subsequent Request to /dashboard]
    │
    ├── Middleware reads cookies: access_token, role_name
    │       ├── No access_token → redirect to /login
    │       ├── Sales + /dashboard or /dashboard/* → 307 redirect to /sales-dashboard
    │       ├── Backoffice + /sales-dashboard or /sales-activities → 307 redirect to /dashboard
    │       ├── No role_name cookie → continue without role redirect (fallback)
    │       └── Unknown role → continue without role redirect
    │
    └── Layout (server component) reads role_name cookie → passes roleName prop to Sidebar, Navbar, BackofficeStatus
```

### Logout Flow

```
[Sidebar — User Info Section]
    │
    ├── Displays: user name (Zustand profile), role (from prop), avatar initial
    ├── LogOut icon button (red on hover, disabled while loading)
    │
    └── Click Logout
            │
            ├── Server Action: logout()
            │       ├── Read access_token from cookies
            │       ├── POST /auth/logout (Bearer token) — best-effort, revoke tokens
            │       │       └── If backend call fails → continue (graceful degradation)
            │       └── removeAuth() — delete cookies: access_token, refresh_token, role_name
            │
            ├── Client: clearProfile() — reset Zustand user profile store
            └── router.push(/login) — redirect to login page
```

### Role Cookie Sync

When `useUserProfile` store fetches the profile (e.g., on page load), it calls `syncRoleCookie(role_name)` server action fire-and-forget. This ensures the cookie stays in sync with the latest API data, covering cases where the role was changed server-side or the cookie was missing.

---

## Conventions

| Area             | Convention                                                               |
| ---------------- | ------------------------------------------------------------------------ |
| File naming      | kebab-case (`member-table.tsx`, `use-table-data.ts`)                     |
| Component naming | PascalCase exports (`MemberTable`, `FormCard`)                           |
| Barrel exports   | Every component directory has `index.ts` re-exporting from the main file |
| Comments         | JSDoc on all public functions and interfaces, in English                 |
| Commits          | Conventional Commits enforced via commitlint + Husky                     |
| State sync       | No `useEffect` for syncing API data → use page + inner form split        |
| Password hashing | Backend: always use `AuthHelper::hashPassword()`, never `Hash::make()`   |

---

## Data Flow

### Table Page (List → Edit → Return)

```
[Table Page ?page=2]
    │
    ├── useTableData reads ?page=2 from URL
    ├── Fetches /api/v1/.../members?page=2&per_page=10
    ├── Renders table with pagination
    │
    ├── Click Edit → /members/{id}/edit?returnPage=2
    │       │
    │       ├── useDetailData fetches /members/{id}
    │       ├── Page component: loading → error → render inner form
    │       ├── Inner form: useState(() => transform(data))
    │       │
    │       ├── Submit → PUT /members/{id}
    │       ├── Success → router.push(/members?page=2)
    │       └── Error → handleFormError → field errors
    │
    └── Click Delete → ConfirmDialog
            │
            ├── Confirm → DELETE /members/{id}
            ├── Success → refetch() → toast
            └── Error → toast → dialog stays open
```

### Global UI Systems

```
[Any Component]
    │
    ├── showNotification("message", "success")
    │       → useNotificationStore → GlobalNotification renders toast
    │       → Auto-dismiss after 4s
    │
    └── showConfirm({ title, description, onConfirm })
            → useConfirmStore → ConfirmDialog renders modal
            → onConfirm: async → loading spinner → hideConfirm on success
            → Error: setLoading(false) → dialog stays open for retry
```

### Create Activity Report (Form with Conditional Fields + File Upload)

```
[CreateSalesActivityReportPage]
    │
    ├── useState → form state (type, title, description, attachment, metadata)
    ├── useUserProfile → profile.sales_id (auto-populate conditional field)
    │
    ├── Type = "request_lead_assign"
    │       → Show read-only "Requested Sales Member ID" field
    │       → Value = profile.sales_id (auto-populated, not editable)
    │
    ├── Submit
    │       ├── Client-side: title.trim() must not be empty
    │       ├── Build ICreateActivityLogPayload (include metadata based on type)
    │       ├── activityLogsService.createActivityLog(payload)
    │       │       ├── File present → FormData + multipart/form-data
    │       │       └── No file → JSON payload
    │       ├── Success → showNotification(resp.message, "success") → router.push(PATHS.salesActivities)
    │       ├── 422 → handleFormError(err, setFormErrors) → field-level errors
    │       └── 500 → showNotification(err.message, "error")
    │
    └── Backend: ActivityLogService → ThumbnailService (generate thumbnail for images) → NotifyBackofficeUsers::dispatch()
```

### Attachment Thumbnail Flow (Backend → Frontend)

```
[Backend: Upload]
    │
    ├── ActivityLogService.handleAttachmentUpload()
    │       ├── Store original file → storage/app/public/sales/activity-logs/{hash}.ext
    │       └── ThumbnailService.generateThumbnail(storedPath)
    │               ├── Image? → resize max 200×200 → store thumb_{hash}.ext → return path
    │               └── Non-image? → return null (skip thumbnail)
    │
    ├── ActivityLog model $appends: ['attachment_url', 'thumbnail_url', 'attachment_type']
    │       ├── attachment_url  → Storage::url(attachment) or null
    │       ├── thumbnail_url   → Storage::url(thumb_path) if file exists, or null
    │       └── attachment_type → 'image' | 'file' | null (based on extension)
    │
    └── API response includes all three fields automatically

[Frontend: Display]
    │
    └── ActivityCard
            ├── attachment_type === 'image' + thumbnail_url
            │       → <Image src={thumbnail_url}> with skeleton loading
            │       → Clickable: opens attachment_url in new tab
            │       → onError: falls back to file icon badge
            ├── attachment_type === 'file' + attachment_url
            │       → File icon badge via getFileIconConfig(url)
            │       → Clickable: opens attachment_url in new tab
            └── No attachment → nothing rendered
```

### Activity Log Review Flow (Backoffice → Sales)

```
[Backoffice: Activity Log List]
    │
    ├── useTableData reads ?page=N from URL
    ├── Fetches /api/v1/backoffice/activity-logs?page=N&per_page=10&search=&status=&type=
    ├── Renders table with status/type badges, sales user name, lead info
    ├── "Requested" column shows requested status (→ Won) or sales ID (SLS-0002)
    │
    └── Click row → /dashboard/activity-logs/{id}

[Backoffice: Activity Log Detail]
    │
    ├── useDetailData fetches /backoffice/activity-logs/{id}
    ├── Renders DetailCard with activity info
    ├── "Detail Permintaan" section:
    │       ├── request_update_lead_status → Tipe Lead badge, Status Lead Saat Ini badge, Status Yang Diminta badge
    │       └── request_lead_assign → Lead name, Tipe Lead badge, Sales ID Yang Diminta badge
    │
    ├── Status = "pending"
    │       → Show status update form (FormSelect + FormTextarea + optional comment)
    │       → Submit → PATCH /backoffice/activity-logs/{id}/status
    │       → Backend: update status fields + applyApprovedAction() (auto-update lead status/assignment) + dispatch NotifySalesUser
    │       → Success → refetch detail → show read-only review info
    │
    ├── Status ≠ "pending"
    │       → Show read-only review info (reviewer name, reason, timestamp)
    │       → Show CommentThread component
    │
    └── CommentThread
            ├── Fetches GET /activity-logs/{id}/comments
            ├── Displays comments chronologically (oldest first)
            ├── Each comment: avatar initial, name, role badge, body, relative time
            ├── Submit new comment → POST /activity-logs/{id}/comments
            └── Backend: create comment + dispatch notification to other party

[Sales: Activity Log Detail]
    │
    ├── useDetailData fetches /sales/activity-logs/{id} (includes reviewer info)
    ├── Renders DetailCard with activity info
    ├── "Detail Permintaan" section (same as backoffice detail)
    │
    ├── Status ≠ "pending"
    │       → Show review info section (reviewer name, reason, timestamp)
    │       → Show CommentThread component
    │
    └── Status = "pending"
            → No review info, no comment thread

[Notification Deep Link Flow]
    │
    ├── NotificationBell supports both backoffice and sales roles
    │       ├── Detects role via BUSINESSFLOW.salesRoles / backofficeRoles
    │       └── Uses appropriate store (useBackofficeNotificationStore or useSalesNotificationStore)
    ├── NotificationBell dropdown shows notification with link field
    ├── Click notification → markAsRead + router.push(notification.link)
    │       ├── If link is present → use directly
    │       ├── If link is null → resolveLink(reference_type, reference_id) constructs URL
    │       ├── Backoffice notification link: /dashboard/activity-logs/{id}
    │       └── Sales notification link: /sales-activities/{id}
    ├── Notification detail page (/dashboard/notifications) uses resolveNotificationLink() fallback + router.push() on click
    ├── Type labels: status_change → "Status Update", new_comment → "Komentar Baru"
    └── Navigates to the correct detail page
```
