---
name: fullstack-feature-pattern
description: "Step-by-step template for building a complete fullstack feature from backend API to frontend UI. Use when building features that span both repos."
---

# Fullstack Feature Pattern

Step-by-step template for building a complete fullstack feature.

> **Reference module:** The `client-members` feature is the canonical example.
> Backend: `app/Services/ClientMemberService.php` → `app/Http/Controllers/.../ClientMemberController.php`
> Frontend: `src/services/backoffice/client-members/` + `src/app/(dashboard)/dashboard/client-members/`

---

## Phase 1: Backend API

1. **Migration** — `docker exec lingkarid.local php artisan make:migration create_<table>_table`
2. **Model** — `app/Models/` with `$fillable`, `$casts`, relationships, `scopeSearch()`
3. **Service** — `app/Services/<Domain>/` with `ApiPaginationTrait`, role guards, `AuthHelper::hashPassword()`
4. **FormRequest** — `app/Http/Requests/<Domain>/` with validation rules
5. **Controller** — `app/Http/Controllers/Api/v1/<Domain>/` (thin: validate → service → `ApiResponse`)
6. **Routes** — `routes/api.php` with `apiResource()` and proper middleware
7. **Verify** — `php -l`, `route:list`, curl test

---

## Phase 2: Frontend Service Layer

```
src/services/backoffice/<feature>/
├── <feature>.types.ts    # Interfaces matching API response + payloads + params
├── <feature>.service.ts  # Typed API calls via api.get/post/put/delete/patch
└── index.ts              # Barrel: export * from "./<feature>.types"; export { <feature>Service }
```

**Reference:** See `src/services/backoffice/client-members/` for a complete example.

Types file structure:

```ts
// <feature>.types.ts
import { IPaginationParams } from "@services/general";

export interface IFeatureItem {
  id: number;
  name: string; /* ... */
}
export interface IFeatureCreatePayload {
  name: string; /* ... */
}
export interface IFeatureUpdatePayload {
  name: string; /* ... */
}
export type IFeatureParams = IPaginationParams;
```

---

## Phase 3: Frontend Pages

- **List** — `useTableData` + `TableCard` + `TableCardContent` + `TableCardPagination`
- **Create** — `FormCard` + `FormInput`/`FormSelect` + `handleFormError()`
- **Edit** — Page + Inner Form split (React 19 compliant): page uses `useDetailData`, inner form receives `initialData` as prop

> See `.agents/skills/component-rules/SKILL.md` for full code examples of each page type.
> See `.agents/skills/state-management-patterns/SKILL.md` for the "Page + Inner Form" pattern.
> See `.agents/skills/error-handling-patterns/SKILL.md` for `handleFormError` usage.

---

## Phase 4: Navigation

- Add path to `src/config/routing.ts`:

```ts
// In routing.ts — add a new group
const MYFEATURE_SERVICES = {
  myFeature: "/dashboard/my-feature",
  myFeatureCreate: "/dashboard/my-feature/create",
  myFeatureEdit: (id: number) => `/dashboard/my-feature/${id}/edit`,
};

// Spread into PATHS export
export const PATHS = { ...existing, ...MYFEATURE_SERVICES };
```

- Add sidebar entry to `Sidebar.tsx` (NavGroup with children, or standalone item)

---

## Phase 5: Documentation

Update ALL: PRD.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, README.md (both), Postman, /design-system showcase, CLAUDE.md (both)

> See `.agents/skills/documentation-update-guide/SKILL.md` for the exact table of what to update per change type.
