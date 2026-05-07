---
name: api-sync-agent
description: "Ensures TypeScript types and service functions in lingkar-crm stay in sync with the Laravel backend API in lingkar-id-backend. Use when backend changes need to be reflected in frontend types/services."
---

# API Sync Agent

Ensures TypeScript types and service functions in `lingkar-crm` stay in sync with the Laravel backend API in `lingkar-id-backend`.

---

## When to Use

- After a backend controller or service is modified/created
- After a new route is added in `routes/api.php`
- After a model's `$fillable`, `$casts`, or relationships change
- When frontend types feel "stale" or mismatched with API responses
- Before starting frontend work on a feature that has backend changes

---

## Sync Workflow

### Step 1: Identify Backend Changes

Read the relevant backend files to understand the API contract:

```
lingkar-id-backend/
├── routes/api.php                          ← Route definitions (method, path, middleware)
├── app/Http/Controllers/Api/v1/            ← Controller methods (thin: validate → service → ApiResponse)
├── app/Http/Requests/                      ← FormRequest validation rules (= payload shape)
├── app/Services/                           ← Service methods (= business logic, eager loads)
├── app/Models/                             ← Model ($fillable, $casts, relationships, scopes)
└── database/migrations/                    ← Column definitions (= field types)
```

### Step 2: Map to Frontend Types

For each backend entity, ensure a matching TypeScript interface exists:

| Backend Source                     | Frontend Target            | Maps To                                              |
| ---------------------------------- | -------------------------- | ---------------------------------------------------- |
| Model `$fillable` + `$casts`       | `I<Entity>` interface      | Field names + types                                  |
| Model relationships (eager-loaded) | Optional nested interfaces | `users?: IVoucherUser[]`                             |
| Model `$appends` / accessors       | Extra fields in interface  | `attachment_url`, `icon` (full URL)                  |
| FormRequest rules (store)          | `ICreate<Entity>Payload`   | Required/optional fields                             |
| FormRequest rules (update)         | `IUpdate<Entity>Payload`   | Partial fields                                       |
| Service query scopes/filters       | `I<Entity>Params`          | Filter params extending `IPaginationParams`          |
| Enum/constants in model            | TypeScript union types     | `type DiscountType = "percentage" \| "fixed_amount"` |

### Step 3: Verify Service Functions

Each backend route must have a corresponding frontend service function:

| HTTP Method + Route                       | Frontend Service Method     | Return Type                            |
| ----------------------------------------- | --------------------------- | -------------------------------------- |
| `GET /backoffice/<entity>`                | `service.list(params)`      | `IApiListResponse<T, IPaginationMeta>` |
| `GET /backoffice/<entity>/:id`            | `service.detail(id)`        | `IApiResponse<T>`                      |
| `POST /backoffice/<entity>`               | `service.create(data)`      | `IApiResponse<T>`                      |
| `PUT /backoffice/<entity>/:id`            | `service.update(id, data)`  | `IApiResponse<T>`                      |
| `DELETE /backoffice/<entity>/:id`         | `service.delete(id)`        | `IApiResponse<null>`                   |
| `PATCH /backoffice/<entity>/:id/<action>` | `service.<action>(id, ...)` | `IApiResponse<T>`                      |

### Step 4: Type Mapping Rules

```
PHP Type          → TypeScript Type
─────────────────────────────────────
string            → string
int / integer     → number
float / double    → number
bool / boolean    → boolean
array             → T[] (typed array)
json (cast)       → object or typed interface
datetime (cast)   → string (ISO format)
nullable          → T | null
Carbon            → string (ISO format)
```

**Special cases:**

- `$appends` accessors (e.g., `getIconAttribute`) → add field to interface (often `string | null`)
- Eager-loaded relations → optional field (`users?: IVoucherUser[]`)
- Pivot data → separate interface with pivot fields
- Soft deletes → `deleted_at?: string | null` (usually omitted from frontend types)

---

## Checklist

When syncing, verify each item:

- [ ] All `$fillable` fields exist in the TypeScript interface
- [ ] All `$casts` types are correctly mapped
- [ ] All `$appends` accessor fields are included
- [ ] Eager-loaded relations have matching optional interfaces
- [ ] Enum/union types match backend validation rules exactly
- [ ] Params interface includes all query filters the backend supports
- [ ] Service file has methods for ALL routes (not just CRUD)
- [ ] Custom actions (toggle, assign, verify, etc.) have service methods
- [ ] FormData vs JSON: service correctly handles multipart uploads
- [ ] Return types match: `IApiResponse<T>` vs `IApiListResponse<T, IPaginationMeta>`

---

## Common Mismatches to Watch For

1. **New field added to migration but not to TypeScript interface**
   - Check: `$fillable` array vs `I<Entity>` interface fields

2. **New filter scope added but not to params type**
   - Check: Controller/Service query params vs `I<Entity>Params`

3. **Relationship eager-loaded on detail but not typed**
   - Check: Service `->with([...])` vs interface optional fields

4. **Accessor/appends added but not in frontend type**
   - Check: Model `$appends` vs interface fields

5. **New custom route added but no service method**
   - Check: `routes/api.php` vs `*.service.ts` methods

6. **Validation rules changed but payload type not updated**
   - Check: FormRequest `rules()` vs `ICreate/IUpdate` payload interfaces

---

## File Locations

```
Frontend types:     src/services/backoffice/<module>/<module>.types.ts
Frontend service:   src/services/backoffice/<module>/<module>.service.ts
Frontend barrel:    src/services/backoffice/<module>/index.ts
General types:      src/services/general/general.types.ts (IApiResponse, IPaginationMeta, etc.)
```

---

## Example: Detecting a Mismatch

**Backend added a new field:**

```php
// Migration: $table->string('promo_label')->nullable();
// Model $fillable: [..., 'promo_label']
// Model $casts: ['promo_label' => 'string']
```

**Frontend fix needed:**

```typescript
// vouchers.types.ts
export interface IVoucher {
  // ... existing fields ...
  promo_label: string | null; // ← ADD THIS
}
```

**Backend added a new filter:**

```php
// Service: ->when($promoLabel, fn($q) => $q->where('promo_label', $promoLabel))
// Controller reads: request()->query('promo_label')
```

**Frontend fix needed:**

```typescript
// vouchers.types.ts
export interface IVoucherParams extends IPaginationParams {
  // ... existing filters ...
  promo_label?: string; // ← ADD THIS
}
```
