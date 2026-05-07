# Implementation Plan: Voucher Management

## Overview

Implementasi fitur Voucher Management yang menyediakan sistem voucher fleksibel untuk marketplace layanan Lingkar. Backoffice admin membuat dan mengelola voucher melalui CRM, sementara backend menyediakan API validasi dan redemption yang siap dikonsumsi mobile app di fase berikutnya.

Implementasi mencakup tiga bagian utama: backend (Laravel — `lingkar-id-backend/`), frontend (Next.js — `lingkar-crm/`), dan dokumentasi. Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru.

## Tasks

- [x] 1. Backend: Migration dan Model
  - [x] 1.1 Buat migration `create_vouchers_table`
    - Kolom sesuai data model di design: `id` (bigint PK auto-increment), `code` (string unique nullable), `name` (string), `description` (text nullable), `discount_type` (enum: percentage, fixed_amount, free_service, commission_discount), `target_user_type` (enum: client, mitra, all), `discount_value` (decimal 12,2), `max_discount_cap` (decimal 12,2 nullable), `min_transaction_amount` (decimal 12,2 nullable), `service_category_id` (FK nullable), `quota` (integer nullable), `used_count` (integer default 0), `per_user_limit` (integer default 1), `distribution_type` (enum: public_code, auto_assign, both), `starts_at` (datetime), `expires_at` (datetime), `is_active` (boolean default true), `created_by` (FK), timestamps, softDeletes
    - Index pada `['is_active', 'starts_at', 'expires_at']`, `['discount_type']`, `['target_user_type']`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 1.1, 1.4, 1.5, 14.1_

  - [x] 1.2 Buat migration `create_voucher_user_table`
    - Kolom: `id` (bigint PK), `voucher_id` (FK → vouchers, cascade delete), `user_id` (FK → users), `assigned_at` (datetime), `used_at` (datetime nullable), `usage_count` (integer default 0), timestamps
    - Unique constraint pada `['voucher_id', 'user_id']`
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 1.3 Buat migration `create_voucher_target_segments_table`
    - Kolom: `id` (bigint PK), `voucher_id` (FK → vouchers, cascade delete), `segment_type` (enum: new_user, verified_only, specific_users, all), `user_ids` (JSON nullable), `created_at` (timestamp)
    - _Requirements: 6.6, 10.6_

  - [x] 1.4 Buat model `Voucher` di `app/Models/Voucher.php`
    - `$fillable`, `$casts` sesuai design document
    - Relations: `users()` → hasMany VoucherUser, `targetSegments()` → hasMany VoucherTargetSegment, `serviceCategory()` → belongsTo, `creator()` → belongsTo User
    - Scopes: `scopeActive`, `scopeSearch` (ILIKE pada code dan name), `scopeOfDiscountType`, `scopeOfTargetUserType`, `scopeOfStatus`
    - Use `SoftDeletes` trait
    - _Requirements: 1.1, 1.2, 1.6, 14.4_

  - [x] 1.5 Buat model `VoucherUser` di `app/Models/VoucherUser.php`
    - `$fillable`: voucher_id, user_id, assigned_at, used_at, usage_count
    - `$casts`: assigned_at → datetime, used_at → datetime, usage_count → integer
    - Relations: `voucher()` → belongsTo, `user()` → belongsTo
    - _Requirements: 5.2, 7.5_

  - [x] 1.6 Buat model `VoucherTargetSegment` di `app/Models/VoucherTargetSegment.php`
    - `$fillable`: voucher_id, segment_type, user_ids
    - `$casts`: user_ids → array
    - Relations: `voucher()` → belongsTo
    - _Requirements: 6.6, 10.6_

- [x] 2. Backend: FormRequests
  - [x] 2.1 Buat `StoreVoucherRequest` di `app/Http/Requests/Backoffice/StoreVoucherRequest.php`
    - Rules: `name` → required|string|max:255; `code` → nullable|string|unique:vouchers,code (case-insensitive); `description` → nullable|string; `discount_type` → required|in:percentage,fixed_amount,free_service,commission_discount; `target_user_type` → required|in:client,mitra,all; `distribution_type` → required|in:public_code,auto_assign,both
    - Conditional rules: discount_value required for percentage/fixed_amount/commission_discount (1-100 for percentage/commission, positive for fixed); max_discount_cap required for percentage; service_category_id required for free_service; code required when distribution_type is public_code or both
    - Date validation: starts_at required|date|before:expires_at; expires_at required|date|after:starts_at
    - Enforce: commission_discount → target_user_type must be mitra
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 2.2 Buat `UpdateVoucherRequest` di `app/Http/Requests/Backoffice/UpdateVoucherRequest.php`
    - Same as StoreVoucherRequest but with edit restriction logic
    - If voucher used_count > 0: reject changes to discount_type and code
    - Code uniqueness check excludes current voucher ID
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 2.3 Buat `AssignVoucherRequest` di `app/Http/Requests/Backoffice/AssignVoucherRequest.php`
    - Rules: `user_ids` → required|array|min:1; `user_ids.*` → required|integer|exists:users,id
    - _Requirements: 5.1_

  - [x] 2.4 Buat `ValidateVoucherRequest` di `app/Http/Requests/ValidateVoucherRequest.php`
    - Rules: `code` → required|string; `transaction_amount` → required|numeric|min:0; `service_category_id` → nullable|integer
    - _Requirements: 6.1, 6.2_

- [x] 3. Backend: BackofficeVoucherService
  - [x] 3.1 Buat `BackofficeVoucherService` di `app/Services/Backoffice/BackofficeVoucherService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllVouchers()`: paginated query with filters (search, discount_type, target_user_type, is_active, date_range). Order by created_at desc.
    - Method `getVoucherById(int $id)`: findOrFail with eager load users, targetSegments, serviceCategory. Include usage stats.
    - Method `createVoucher(array $data)`: create voucher + target segments. Set created_by from auth user.
    - Method `updateVoucher(Voucher $voucher, array $data)`: update voucher + sync target segments.
    - Method `deleteVoucher(Voucher $voucher)`: soft delete.
    - Method `toggleActive(Voucher $voucher)`: toggle is_active boolean.
    - Method `assignToUsers(Voucher $voucher, array $userIds)`: create voucher_user records. Check for duplicates, throw 422 if exists.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 5.1, 5.2, 5.3_

- [x] 4. Backend: VoucherValidationService
  - [x] 4.1 Buat `VoucherValidationService` di `app/Services/Voucher/VoucherValidationService.php`
    - Method `validate(array $data, User $user)`: find voucher by code, run all validation rules, calculate discount, return result without redeeming.
    - Method `redeem(array $data, User $user)`: re-run all validation rules, atomic increment quota, update voucher_user record, return result.
    - Method `getUserVouchers(User $user)`: get all assigned vouchers for user, exclude soft-deleted, include status.
    - Private `runValidationRules()`: execute rules in order (active, period, user type, segment, quota, per-user limit, min amount, category, commission-mitra).
    - Private `calculateDiscount()`: percentage (capped), fixed_amount, free_service (full cost), commission_discount.
    - Private `atomicIncrementQuota()`: DB-level atomic increment with quota check.
    - _Requirements: 6.1-6.11, 7.1-7.6, 8.1-8.3, 14.1, 14.2, 14.3_

- [x] 5. Backend: Controllers dan Routes
  - [x] 5.1 Buat `BackofficeVoucherController` di `app/Http/Controllers/Api/v1/Backoffice/BackofficeVoucherController.php`
    - Inject `BackofficeVoucherService`
    - `index()` → paginated list, return `paginatedResponse`
    - `show(int $id)` → detail with usage stats, return `ApiResponse::success`
    - `store(StoreVoucherRequest $request)` → create, return 201
    - `update(UpdateVoucherRequest $request, Voucher $voucher)` → update, return `ApiResponse::success`
    - `destroy(Voucher $voucher)` → soft delete, return `ApiResponse::success`
    - `toggleActive(Voucher $voucher)` → toggle, return `ApiResponse::success`
    - `assign(AssignVoucherRequest $request, Voucher $voucher)` → assign users, return `ApiResponse::success`
    - _Requirements: 1.1-1.7, 5.1_

  - [x] 5.2 Buat `VoucherController` di `app/Http/Controllers/Api/v1/VoucherController.php`
    - Inject `VoucherValidationService`
    - `validate(ValidateVoucherRequest $request)` → validate, return `ApiResponse::success`
    - `redeem(ValidateVoucherRequest $request)` → redeem, return `ApiResponse::success`
    - `myVouchers()` → user's wallet, return `ApiResponse::success`
    - _Requirements: 6.1, 7.1, 8.1_

  - [x] 5.3 Tambah routes di `routes/api.php`
    - Backoffice routes (prefix `backoffice`, middleware `role:admin,backoffice`):
      - `GET /backoffice/vouchers` → index
      - `POST /backoffice/vouchers` → store
      - `GET /backoffice/vouchers/{voucher}` → show
      - `PUT /backoffice/vouchers/{voucher}` → update
      - `DELETE /backoffice/vouchers/{voucher}` → destroy
      - `PATCH /backoffice/vouchers/{voucher}/toggle-active` → toggleActive
      - `POST /backoffice/vouchers/{voucher}/assign` → assign
    - Public/authenticated routes (prefix `v1`, middleware auth):
      - `POST /vouchers/validate` → validate
      - `POST /vouchers/redeem` → redeem
      - `GET /vouchers/my-vouchers` → myVouchers
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1_

- [x] 6. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file baru/dimodifikasi
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1-14.4_

- [x] 7. Checkpoint — Backend selesai
  - Ensure all backend files compile without errors, ask the user if questions arise.

- [x] 8. Backend: Property-based tests
  - [x] 8.1 Write property test untuk type-specific validation constraints
    - **Property 1: Voucher creation validation — type-specific constraints**
    - Generate random voucher creation payloads with various discount_type combinations, verify: commission_discount enforces mitra, free_service requires service_category_id, percentage requires max_discount_cap and value 1-100, public_code/both requires code
    - Buat test file di `tests/Feature/Backoffice/BackofficeVoucherTest.php`
    - **Validates: Requirements 2.3, 2.7, 2.8, 2.9, 2.10**

  - [x] 8.2 Write property test untuk edit restrictions
    - **Property 2: Voucher edit restrictions for used vouchers**
    - Generate random update payloads for vouchers with used_count > 0, verify discount_type and code changes are rejected, other field changes are accepted
    - **Validates: Requirements 3.1, 3.2, 3.4**

  - [x] 8.3 Write property test untuk atomic quota
    - **Property 3: Atomic quota prevents over-redemption**
    - Create voucher with small quota, simulate multiple concurrent redemption attempts, verify used_count never exceeds quota
    - **Validates: Requirements 7.3, 7.4, 14.1, 14.2**

  - [x] 8.4 Write property test untuk validation rule completeness
    - **Property 4: Validation rules are complete and ordered**
    - Generate vouchers with various invalid states (inactive, expired, wrong user type, quota full, per-user limit reached, min amount not met, wrong category), verify each rule correctly rejects
    - **Validates: Requirements 6.3-6.11, 7.2**

  - [x] 8.5 Write property test untuk discount calculation
    - **Property 5: Discount calculation correctness**
    - Generate random transaction amounts and voucher configs, verify: percentage = min(amount × value/100, cap), fixed = value, discount never exceeds transaction amount
    - **Validates: Requirements 7.6**

  - [x] 8.6 Write property test untuk soft-delete exclusion
    - **Property 6: Soft-deleted vouchers excluded from all queries**
    - Create and soft-delete vouchers, verify they don't appear in list, detail returns 404, wallet excludes them
    - **Validates: Requirements 1.6, 8.3**

  - [x] 8.7 Write property test untuk code uniqueness
    - **Property 7: Voucher code uniqueness (case-insensitive)**
    - Generate random codes, create voucher, attempt to create another with same code in different casing, verify 422 rejection
    - **Validates: Requirements 2.1**

  - [x] 8.8 Write property test untuk date validation
    - **Property 8: Date validation — starts_at before expires_at**
    - Generate random date pairs where starts_at >= expires_at, verify rejection. Generate valid pairs, verify acceptance.
    - **Validates: Requirements 2.2**

  - [x] 8.9 Write property test untuk per-user limit
    - **Property 9: Per-user limit enforcement**
    - Create voucher with per_user_limit, redeem up to limit, verify next attempt is rejected even with remaining global quota
    - **Validates: Requirements 6.8**

  - [x] 8.10 Write property test untuk assignment duplicate prevention
    - **Property 10: Voucher assignment duplicate prevention**
    - Assign voucher to user, attempt re-assignment, verify 422 with correct message
    - **Validates: Requirements 5.3**

  - [x] 8.11 Write property test untuk JSON round-trip
    - **Property 12: JSON round-trip for voucher target segments**
    - Generate random valid target segment data, serialize to JSON and deserialize, verify equivalence
    - **Validates: Requirements 14.4**

- [x] 9. Checkpoint — Backend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Frontend: Service layer — Vouchers
  - [x] 10.1 Buat type definitions di `src/services/backoffice/vouchers/vouchers.types.ts`
    - Types: `DiscountType`, `TargetUserType`, `DistributionType`, `SegmentType`
    - Interfaces: `IVoucher`, `IVoucherUser`, `IVoucherTargetSegment`, `IVoucherParams`
    - Sesuai design document
    - _Requirements: 1.1, 9.1_

  - [x] 10.2 Buat service functions di `src/services/backoffice/vouchers/vouchers.service.ts`
    - `vouchersService.list(params)` → GET /backoffice/vouchers
    - `vouchersService.detail(id)` → GET /backoffice/vouchers/{id}
    - `vouchersService.create(data)` → POST /backoffice/vouchers
    - `vouchersService.update(id, data)` → PUT /backoffice/vouchers/{id}
    - `vouchersService.delete(id)` → DELETE /backoffice/vouchers/{id}
    - `vouchersService.toggleActive(id)` → PATCH /backoffice/vouchers/{id}/toggle-active
    - `vouchersService.assign(id, payload)` → POST /backoffice/vouchers/{id}/assign
    - _Requirements: 1.1-1.7, 5.1_

  - [x] 10.3 Buat barrel export di `src/services/backoffice/vouchers/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

- [x] 11. Frontend: Routing dan Sidebar Navigation
  - [x] 11.1 Update `src/config/routing.ts`
    - Tambah voucher routes: `vouchers: '/dashboard/vouchers'`, `voucherCreate: '/dashboard/vouchers/create'`, `voucherEdit: (id: number) => \`/dashboard/vouchers/${id}/edit\``, `voucherDetail: (id: number) => \`/dashboard/vouchers/${id}\``
    - Spread ke `PATHS` export
    - _Requirements: 9.5, 13.1_

  - [x] 11.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Rename "Content" group to "Marketing" (atau tambah "Marketing" group jika belum ada)
    - Pastikan "Banners" tetap ada di group "Marketing"
    - Tambah "Vouchers" item di group "Marketing"
    - Icon: `Ticket` dari lucide-react
    - Href: `PATHS.vouchers`
    - _Requirements: 13.1, 13.2, 13.3_

- [x] 12. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all checks pass, ask the user if questions arise.

- [x] 13. Frontend: Voucher List Page
  - [x] 13.1 Buat page component di `src/app/(dashboard)/dashboard/vouchers/page.tsx`
    - Gunakan `useTableData` hook dengan `vouchersService.list`
    - `TableCard` dengan kolom: Code, Name, Discount Type (badge), Target (badge), Status (badge), Quota (used/total atau "Unlimited"), Period (starts_at - expires_at), Actions
    - `SearchInput` untuk search by code atau name
    - `FilterPopup` dengan `FilterChipGroup` untuk filter discount_type, target_user_type, status
    - Status badge logic: Active (success), Inactive (neutral), Expired (error), Scheduled (primary)
    - Actions per row: view detail (link), edit (link), toggle active, delete (dengan `ConfirmDialog`)
    - Tombol "Create Voucher" link ke `PATHS.voucherCreate`
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 14. Frontend: Voucher Create Page
  - [x] 14.1 Buat page component di `src/app/(dashboard)/dashboard/vouchers/create/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Section 1 — Basic Info: name (FormInput), code (FormInput, conditional visibility based on distribution_type), description (FormInput/textarea)
    - Section 2 — Discount Config: discount_type (FormSelect) → conditional fields sesuai Requirement 4
    - Section 3 — Conditions & Limits: starts_at (date picker), expires_at (date picker), quota (FormInput number, optional), per_user_limit (FormInput number, default 1), min_transaction_amount (FormInput number, optional)
    - Section 4 — Distribution: distribution_type (FormSelect)
    - Section 5 — Target Segment: target_user_type (FormSelect), segment_type (FormSelect), user picker (conditional on specific_users)
    - Submit → call `vouchersService.create()`, redirect ke voucher list
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 4.1, 4.2, 4.3, 4.4_

- [x] 15. Frontend: Voucher Edit Page
  - [x] 15.1 Buat page component di `src/app/(dashboard)/dashboard/vouchers/[id]/edit/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Gunakan `useDetailData` hook dengan `vouchersService.detail` untuk load existing data
    - Pre-populate form fields dari existing voucher data
    - Sama seperti create page tapi:
      - Jika used_count > 0: disable discount_type dan code fields, tampilkan warning notice
      - Code uniqueness check excludes current voucher
    - Submit → call `vouchersService.update(id, data)`, redirect ke voucher list (preserve return page)
    - _Requirements: 11.1, 11.2, 11.3, 3.3_

- [x] 16. Frontend: Voucher Detail Page
  - [x] 16.1 Buat page component di `src/app/(dashboard)/dashboard/vouchers/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan `vouchersService.detail`
    - `DetailCard` dengan semua voucher configuration fields (read-only)
    - Usage stats summary: used_count / quota (atau "Unlimited"), redemption rate percentage
    - Assigned Users table: user name, assigned_at, status badge (used/unused), usage_count
    - "Assign to User" button → modal with user search/picker
    - Modal submit → call `vouchersService.assign(id, { user_ids })`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 5.4, 5.5_

- [x] 17. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all checks pass, ask the user if questions arise.

- [x] 18. Frontend: Unit tests
  - [x] 18.1 Write unit tests untuk voucher list page
    - Test render table dengan mock data
    - Test search functionality
    - Test filter functionality
    - Test status badge derivation (Property 11)
    - Test delete confirmation dialog
    - Test toggle active action
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.6**

  - [x] 18.2 Write unit tests untuk voucher create/edit form
    - Test conditional field rendering per discount_type
    - Test commission_discount forces target=mitra
    - Test free_service shows required service_category_id
    - Test distribution_type controls code field visibility
    - Test date validation (starts_at before expires_at)
    - Test edit restrictions (disabled fields when used_count > 0)
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4, 10.2, 11.2**

- [x] 19. Checkpoint — Frontend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Dokumentasi
  - [x] 20.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (backoffice vouchers CRUD + toggle + assign, public validate/redeem/my-vouchers) di API Endpoints table, update Project Structure
    - Update `CLAUDE.md`: tambah BackofficeVoucherService, VoucherValidationService, BackofficeVoucherController, VoucherController, Voucher/VoucherUser/VoucherTargetSegment models di API Modules table
    - Update Postman collection: tambah semua endpoint baru. Validate JSON setelah edit.
    - _Requirements: 1.1, 5.1, 6.1, 7.1, 8.1_

  - [x] 20.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Voucher Management (list, create, edit, detail, assignment, navigation)
    - Update `docs/ARCHITECTURE.md`: tambah vouchers service layer, routing updates, sidebar restructure
    - Update `README.md`: tambah Voucher Management ke Feature Status table
    - Update `CLAUDE.md`: tambah info Voucher Management pages, service layer
    - _Requirements: 9.1, 13.1_

- [x] 21. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Backend tasks (1-9) harus diselesaikan sebelum frontend tasks (10-19) karena frontend bergantung pada API baru
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 12 correctness properties dari design document
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, TableCard, Badge, ConfirmDialog) — jangan gunakan native HTML elements
- Semua API responses menggunakan `ApiResponse::success()` / `ApiResponse::error()` pattern
- Service layer pattern: Controllers thin, semua business logic di Services
- React 19 compliance: "Page + Inner Form" split pattern untuk form pages
- Atomic quota handling menggunakan DB-level increment, bukan application-level lock
- Code uniqueness check harus case-insensitive (ILIKE atau LOWER comparison)
- Sidebar restructure: rename "Content" → "Marketing", tambah "Vouchers" item
