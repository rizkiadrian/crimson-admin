# New Feature Checklist

When building a new feature module, complete ALL items below.

## Backend (if API changes)

- [ ] Service class in `app/Services/` with business logic
- [ ] Controller in `app/Http/Controllers/Api/v1/` (thin, delegates to service)
- [ ] FormRequest validation classes in `app/Http/Requests/`
- [ ] Routes registered in `routes/api.php` with proper middleware
- [ ] PHP syntax check: `php -l <file>` on all modified files
- [ ] Postman collection updated + JSON validated
- [ ] Backend `README.md` updated (API Endpoints table, Project Structure)
- [ ] Backend `CLAUDE.md` updated (API Modules table if new module)

## Frontend

### Service Layer

Create the service directory at `src/services/backoffice/<feature>/`:

```
services/backoffice/<feature>/
├── <feature>.types.ts     # Interfaces matching API response
├── <feature>.service.ts   # Typed API calls via api.get/post/put/delete
└── index.ts               # Barrel exports (re-export types + service object)
```

> **Reference:** See `src/services/backoffice/client-members/` as a complete example.

- [ ] `<feature>.types.ts` — Interfaces for API response, payload, and params
- [ ] `<feature>.service.ts` — All typed API calls (list, create, detail, update, delete)
- [ ] `index.ts` — Barrel export

### Routing

Add routes to `src/config/routing.ts` following the existing group pattern:

```ts
// Add a new group for the feature
const MYFEATURE_SERVICES = {
  myFeature: "/dashboard/my-feature",
  myFeatureCreate: "/dashboard/my-feature/create",
  myFeatureEdit: (id: number) => `/dashboard/my-feature/${id}/edit`,
};

// Then spread it into the PATHS export
export const PATHS = {
  ...existing,
  ...MYFEATURE_SERVICES,
};
```

- [ ] Routes added to `src/config/routing.ts`

### Pages & UI

- [ ] Zustand store (only if global state needed — not for page-level state)
- [ ] Page component(s) in `src/app/(dashboard)/dashboard/<feature>/`
  - List page: uses `useTableData` + `TableCard` + `TableCardContent` + `TableCardPagination`
  - Create page: uses `FormCard` + `FormCardHeader` + `FormCardBody` + `FormCardFooter`
  - Edit page: "Page + Inner Form" split — page uses `useDetailData`, passes data as props to inner form
- [ ] Sidebar entry added to `Sidebar.tsx` (if navigable page)
- [ ] All interactive elements use `Button` component (no native `<button>`)
- [ ] All inputs use `FormInput`/`FormSelect` (no native `<input>`/`<select>`)
- [ ] TypeScript check: `npx tsc --noEmit` passes
- [ ] Browser test via Chrome DevTools MCP (Kiro) or `browser_subagent` (Antigravity/Claude)

## Documentation (MUST update all)

- [ ] `docs/PRD.md` — New feature module section
- [ ] `docs/DESIGN_SYSTEM.md` — If new UI component
- [ ] `docs/ARCHITECTURE.md` — If new directory, store, or library
- [ ] `README.md` (frontend) — Feature Status table
- [ ] Design system showcase at `/design-system` — If new visual component
- [ ] `CLAUDE.md` (both repos) — If new patterns
