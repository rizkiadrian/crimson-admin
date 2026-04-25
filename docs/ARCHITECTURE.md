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
│   │   │   └── GlobalNotification/  # Toast notifications (Zustand-driven)
│   │   ├── layout/
│   │   │   ├── Sidebar/         # Accordion navigation with grouped items
│   │   │   └── Navbar/
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
│   │       └── page.tsx                        # Dashboard home
│   ├── design-system/          # Live component preview (/design-system)
│   └── login/
├── lib/
│   ├── hooks/
│   │   ├── use-table-data.ts   # Paginated list fetching + URL sync
│   │   └── use-detail-data.ts  # Single resource fetching (useReducer + queueMicrotask)
│   ├── api.ts                  # Axios instance with interceptors
│   └── utils.ts                # cn(), handleFormError(), getNameInitials()
├── services/
│   └── backoffice/
│       ├── backoffice-members/ # Types + service (list, create, detail, update, delete)
│       ├── client-members/     # Types + service (list, create, detail, update, delete)
│       ├── mitra-members/      # Types + service (list, detail, update, delete)
│       ├── leads/              # Types + service (list, create, detail, update, delete, updateStatus, convert)
│       ├── sales-members/      # Types + service (list, create, detail, update, delete, list-dropdown)
│       └── dashboard/          # Types + service (summary incl. leads stats)
├── store/
│   ├── useNotificationStore.ts # Global toast (success/error/info)
│   └── useConfirmStore.ts      # Global confirm dialog
├── config/
│   ├── env.ts
│   └── routing.ts              # Centralized PATHS object
└── middleware.ts                # Auth redirect middleware
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
- Page-level state (form data, filters, loading) stays in component `useState`

### ADR-04: URL as Source of Truth for Pagination

**Decision:** Table pages sync current page to `?page=N` in the URL.

**Context:** Users expect to bookmark, share, and use browser back/forward on paginated lists.

**Implementation:**

- `useTableData` reads initial page from `useSearchParams()` on mount
- `handlePageChange` pushes `?page=N` via `router.push()` with `scroll: false`
- `setParams` (filter change) resets to page 1 and removes `?page` from URL
- Edit links carry `?returnPage=N` so users return to the correct page after submit

### ADR-05: Design System as Living Documentation

**Decision:** `/design-system` route renders every UI component with interactive examples.

**Context:** Static documentation goes stale. A live preview page ensures components are always testable.

**Implementation:**

- Each component has a showcase in `design-system/components/`
- Kiro hooks auto-remind to update the design system page and README when component files change

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
