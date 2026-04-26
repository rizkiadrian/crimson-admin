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

- [ ] Service layer: `services/backoffice/<feature>/` with `*.types.ts`, `*.service.ts`, `index.ts`
- [ ] Zustand store (only if global state needed)
- [ ] Page component(s) in `app/(dashboard)/dashboard/<feature>/`
- [ ] Routing path added to `config/routing.ts`
- [ ] Sidebar entry added to `Sidebar.tsx` (if navigable page)
- [ ] All interactive elements use `Button` component (no native `<button>`)
- [ ] All inputs use `FormInput`/`FormSelect` (no native `<input>`/`<select>`)
- [ ] TypeScript check: `npx tsc --noEmit` passes
- [ ] Browser test via Chrome DevTools MCP

## Documentation (MUST update all)

- [ ] `docs/PRD.md` — New feature module section
- [ ] `docs/DESIGN_SYSTEM.md` — If new UI component
- [ ] `docs/ARCHITECTURE.md` — If new directory, store, or library
- [ ] `README.md` (frontend) — Feature Status table
- [ ] Design system showcase at `/design-system` — If new visual component
- [ ] `CLAUDE.md` (both repos) — If new patterns
