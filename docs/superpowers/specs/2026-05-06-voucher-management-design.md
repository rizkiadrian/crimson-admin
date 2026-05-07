# Voucher Management — Design Spec

**Date:** 2026-05-06
**Scope:** CRM (backoffice UI) + Backend API (Laravel)
**Mobile app integration:** Deferred to future phase

---

## Overview

A flexible voucher system for the Lingkar service marketplace. Backoffice admins create and manage vouchers via CRM. Backend exposes validation and redemption APIs ready for mobile app consumption.

**Supported discount types:**

- Percentage discount (with max cap)
- Fixed amount discount
- Free service (1x specific service category)
- Commission discount (reduced platform fee for mitra)

**Target users:** Client, Mitra, or both

**Distribution methods:**

- Public code — user inputs code at checkout
- Auto-assign — system assigns voucher to user's "wallet" based on segment criteria
- Both — voucher has a code AND can be auto-assigned

---

## Data Model

### Table: `vouchers`

| Column                   | Type                              | Notes                                                               |
| ------------------------ | --------------------------------- | ------------------------------------------------------------------- |
| `id`                     | bigint PK                         | Auto-increment                                                      |
| `code`                   | string, unique, nullable          | Public voucher code. Null = auto-assign only                        |
| `name`                   | string                            | Internal name for admin                                             |
| `description`            | text, nullable                    | User-facing description                                             |
| `discount_type`          | enum                              | `percentage`, `fixed_amount`, `free_service`, `commission_discount` |
| `target_user_type`       | enum                              | `client`, `mitra`, `all`                                            |
| `discount_value`         | decimal(12,2)                     | Percentage (1-100) or fixed amount in Rupiah                        |
| `max_discount_cap`       | decimal(12,2), nullable           | Max discount for percentage type                                    |
| `min_transaction_amount` | decimal(12,2), nullable           | Minimum order value                                                 |
| `service_category_id`    | FK → service_categories, nullable | Restrict to specific category                                       |
| `quota`                  | integer, nullable                 | Global usage limit. Null = unlimited                                |
| `used_count`             | integer, default 0                | Atomic counter                                                      |
| `per_user_limit`         | integer, default 1                | Max uses per user                                                   |
| `distribution_type`      | enum                              | `public_code`, `auto_assign`, `both`                                |
| `starts_at`              | datetime                          | Start of validity period                                            |
| `expires_at`             | datetime                          | End of validity period                                              |
| `is_active`              | boolean, default true             | Manual toggle by admin                                              |
| `created_by`             | FK → users                        | Admin who created                                                   |
| `created_at`             | timestamp                         |                                                                     |
| `updated_at`             | timestamp                         |                                                                     |
| `deleted_at`             | timestamp, nullable               | Soft delete                                                         |

### Table: `voucher_user` (pivot — assignment & usage tracking)

| Column        | Type               | Notes                             |
| ------------- | ------------------ | --------------------------------- |
| `id`          | bigint PK          |                                   |
| `voucher_id`  | FK → vouchers      |                                   |
| `user_id`     | FK → users         |                                   |
| `assigned_at` | datetime           | When voucher was assigned         |
| `used_at`     | datetime, nullable | When first used. Null = unused    |
| `usage_count` | integer, default 0 | Times this user used this voucher |
| `created_at`  | timestamp          |                                   |
| `updated_at`  | timestamp          |                                   |

### Table: `voucher_target_segments`

| Column         | Type           | Notes                                                |
| -------------- | -------------- | ---------------------------------------------------- |
| `id`           | bigint PK      |                                                      |
| `voucher_id`   | FK → vouchers  |                                                      |
| `segment_type` | enum           | `new_user`, `verified_only`, `specific_users`, `all` |
| `user_ids`     | JSON, nullable | Array of user IDs for `specific_users`               |
| `created_at`   | timestamp      |                                                      |

### Type-specific column usage

| discount_type         | discount_value | max_discount_cap | service_category_id |
| --------------------- | -------------- | ---------------- | ------------------- |
| `percentage`          | % (1-100)      | Required         | Optional            |
| `fixed_amount`        | Rupiah amount  | Not used         | Optional            |
| `free_service`        | 0              | Not used         | Required            |
| `commission_discount` | % (1-100)      | Not used         | Optional            |

---

## Backend API

### Backoffice Endpoints (CRM)

**Base:** `/api/v1/backoffice/vouchers`

| Method | Endpoint                       | Description                          |
| ------ | ------------------------------ | ------------------------------------ |
| GET    | `/vouchers?page=N&per_page=N`  | Paginated list with filters & search |
| POST   | `/vouchers`                    | Create voucher                       |
| GET    | `/vouchers/{id}`               | Detail with usage stats              |
| PUT    | `/vouchers/{id}`               | Update voucher                       |
| DELETE | `/vouchers/{id}`               | Soft delete                          |
| PATCH  | `/vouchers/{id}/toggle-active` | Activate/deactivate                  |
| POST   | `/vouchers/{id}/assign`        | Assign to specific users             |

**Filters:** `discount_type`, `target_user_type`, `is_active`, `date_range`
**Search:** by `code` or `name`

### Public Endpoints (for mobile app — built now, consumed later)

**Base:** `/api/v1/vouchers`

| Method | Endpoint                | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| POST   | `/vouchers/validate`    | Check eligibility without redeeming |
| POST   | `/vouchers/redeem`      | Use the voucher                     |
| GET    | `/vouchers/my-vouchers` | User's assigned vouchers (wallet)   |

### Validate Request/Response

**Request:**

```json
{
  "code": "RAMADAN50",
  "transaction_amount": 200000,
  "service_category_id": 3
}
```

**Response (success):**

```json
{
  "success": true,
  "message": "Voucher valid",
  "data": {
    "voucher_id": 1,
    "discount_type": "percentage",
    "discount_value": 50,
    "calculated_discount": 100000,
    "final_amount": 100000
  }
}
```

### Validation Rules (executed in order)

1. Voucher exists and `is_active = true`
2. Current time between `starts_at` and `expires_at`
3. User type matches `target_user_type` (or `all`)
4. User matches target segment criteria
5. `used_count < quota` (if quota set)
6. User's `usage_count < per_user_limit`
7. `transaction_amount >= min_transaction_amount` (if set)
8. `service_category_id` matches (if set)
9. Type-specific: `commission_discount` only redeemable by mitra

### Atomic Quota Handling

```sql
UPDATE vouchers
SET used_count = used_count + 1
WHERE id = ? AND (quota IS NULL OR used_count < quota)
```

If affected rows = 0, quota exhausted → return 422.

### Service Layer

```
app/Services/Backoffice/BackofficeVoucherService.php  → CRUD, assign, toggle
app/Services/Voucher/VoucherValidationService.php     → validate, redeem, eligibility
```

---

## CRM Frontend

### Navigation

Sidebar restructure — rename "Content" to "Marketing":

```
▼ Marketing (accordion)
  ├── Banners
  └── Vouchers
```

### Pages

**List:** `/dashboard/vouchers`

- TableCard with columns: Code, Name, Discount Type, Target, Status (badge), Quota (used/total), Period, Actions
- Filter popup: discount_type chips, target_user_type chips, status chips, date range
- Search by code or name
- Status badge logic:
  - **Active** (success): `is_active && now between starts_at..expires_at`
  - **Inactive** (neutral): `!is_active`
  - **Expired** (error): `expires_at < now`
  - **Scheduled** (primary): `starts_at > now`

**Create:** `/dashboard/vouchers/create`

- FormCard with conditional fields based on `discount_type`
- Sections: Basic Info, Discount Config, Conditions & Limits, Distribution, Target Segment

**Edit:** `/dashboard/vouchers/{id}/edit`

- Same as create, pre-filled. Return-page preservation.
- Cannot change `discount_type` or `code` if voucher has been used.

**Detail:** `/dashboard/vouchers/{id}`

- DetailCard with all voucher info
- Usage stats summary
- "Assigned Users" table below with status (used/unused)
- "Assign to User" action button → modal with user picker

### Conditional Form Fields

| discount_type         | Shows                                   | Hides                                       |
| --------------------- | --------------------------------------- | ------------------------------------------- |
| `percentage`          | discount_value (%), max_discount_cap    | —                                           |
| `fixed_amount`        | discount_value (Rp)                     | max_discount_cap                            |
| `free_service`        | service_category_id (required)          | discount_value, max_discount_cap            |
| `commission_discount` | discount_value (%), forces target=mitra | max_discount_cap, target_user_type selector |

### Components Used (existing)

- `TableCard`, `TableCardPagination`
- `FormCard`, `FormInput`, `FormSelect`
- `Badge` (status badges)
- `Button`, `useConfirmStore` (delete)
- `useTableData`, `useDetailData`

---

## Error Handling & Edge Cases

### Creation Validation

- `code` must be unique (case-insensitive) → 422 if duplicate
- `starts_at` must be before `expires_at`
- `discount_value` for percentage must be 1-100
- `commission_discount` forces `target_user_type = mitra`
- `free_service` requires `service_category_id`

### Redemption Edge Cases

- **Race condition on quota:** Atomic DB increment (see SQL above)
- **Expired mid-checkout:** Re-validate on redeem, not just validate
- **Per-user limit reached:** 422 with clear message
- **Deactivated after validate:** Redeem re-checks `is_active`

### CRM Edge Cases

- **Edit used voucher:** Allow all fields except `discount_type` and `code`. Show warning notice.
- **Delete assigned voucher:** Soft delete. Users see "Tidak berlaku lagi" in wallet.
- **Assign duplicate:** 422 "User sudah memiliki voucher ini"

---

## Out of Scope (Future Phases)

- Cashback to deposit/balance
- Mobile app UI integration (wallet screen, checkout flow)
- Usage analytics charts on detail page
- Bulk voucher code generation
- Voucher stacking (multiple vouchers per transaction)
