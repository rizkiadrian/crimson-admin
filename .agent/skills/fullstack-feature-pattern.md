# Fullstack Feature Pattern

Step-by-step template for building a complete fullstack feature.

## Phase 1: Backend API

1. **Migration** — `docker exec lingkarid.local php artisan make:migration create_<table>_table`
2. **Model** — `app/Models/` with `$fillable`, `$casts`, relationships, `scopeSearch()`
3. **Service** — `app/Services/<Domain>/` with `ApiPaginationTrait`, role guards, `AuthHelper::hashPassword()`
4. **FormRequest** — `app/Http/Requests/<Domain>/` with validation rules
5. **Controller** — `app/Http/Controllers/Api/v1/<Domain>/` (thin: validate → service → `ApiResponse`)
6. **Routes** — `routes/api.php` with `apiResource()` and proper middleware
7. **Verify** — `php -l`, `route:list`, curl test

## Phase 2: Frontend Service Layer

```
services/backoffice/<feature>/
├── <feature>.types.ts    # Interfaces matching API response
├── <feature>.service.ts  # Typed API calls via api.get/post/put/delete
└── index.ts              # Barrel exports
```

## Phase 3: Frontend Pages

- **List** — `useTableData` + `TableCard` + `TableCardContent` + `TableCardPagination`
- **Create** — `FormCard` + `FormInput`/`FormSelect` + `handleFormError()`
- **Edit** — Page + Inner Form split (React 19 compliant): page handles loading/error, inner form gets data as props

## Phase 4: Navigation

- Add path to `config/routing.ts`
- Add sidebar entry to `Sidebar.tsx`

## Phase 5: Documentation

Update ALL: PRD.md, DESIGN_SYSTEM.md, ARCHITECTURE.md, README.md (both), Postman, /design-system showcase, CLAUDE.md (both)
