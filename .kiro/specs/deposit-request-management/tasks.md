# Implementation Plan: Deposit Request Management

## Overview

Implementasi fitur Deposit Request Management yang memungkinkan Backoffice/Admin user untuk melihat, mereview, menyetujui, atau menolak deposit request dari client. Saat deposit disetujui, sistem mengkredit saldo wallet client secara atomik dan membuat record transaksi wallet. Saat ditolak, alasan penolakan dicatat. Kedua outcome memicu notifikasi async ke client. Dashboard backoffice juga menampilkan widget pending deposit count.

Implementasi dibagi menjadi tiga bagian utama: backend (Laravel — `lingkar-id-backend/`), frontend (Next.js — `lingkar-crm/`), dan dokumentasi. Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru.

## Tasks

- [x] 1. Backend: Migrations
  - [x] 1.1 Buat migration `add_review_fields_to_deposit_requests_table`
    - Tambah kolom `reviewed_by` (nullable foreignId, constrained to `users`, nullOnDelete)
    - Tambah kolom `review_reason` (nullable text)
    - Tambah kolom `reviewed_at` (nullable timestamp)
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.2 Buat migration `create_client_notifications_table`
    - Kolom: `id`, `user_id` (foreignId, constrained to `users`, cascadeOnDelete), `type` (string), `title` (string), `message` (text), `link` (nullable string), `read_at` (nullable timestamp), `reference_type` (nullable string), `reference_id` (nullable uuid), `timestamps`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 7.1_

- [x] 2. Backend: Models
  - [x] 2.1 Update `DepositRequest` model di `app/Models/DepositRequest.php`
    - Tambah `reviewed_by`, `review_reason`, `reviewed_at` ke `$fillable`
    - Tambah `'reviewed_at' => 'datetime'` ke `$casts`
    - Tambah `'attachment_url'` ke `$appends`
    - Tambah relasi `reviewedBy()` → `belongsTo(User::class, 'reviewed_by')`
    - Tambah accessor `getAttachmentUrlAttribute()` → return `Storage::disk('public')->url($this->attachment)` jika attachment ada, null jika tidak
    - Tambah `scopeSearch($query, ?string $search)` → ILIKE search pada `reference_code` dan relasi `user.name`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 2.2 Buat model `ClientNotification` di `app/Models/ClientNotification.php`
    - Constants: `TYPE_DEPOSIT_APPROVED = 'deposit_approved'`, `TYPE_DEPOSIT_REJECTED = 'deposit_rejected'`
    - `$fillable`: `user_id`, `type`, `title`, `message`, `link`, `read_at`, `reference_type`, `reference_id`
    - `$casts`: `'read_at' => 'datetime'`
    - Relasi `user()` → `belongsTo(User::class)`
    - Scope `scopeUnread($query)` → `whereNull('read_at')`
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 3. Backend: Job NotifyClientUser
  - [x] 3.1 Buat job `NotifyClientUser` di `app/Jobs/NotifyClientUser.php`
    - Implements `ShouldQueue`, use `Queueable`
    - Constructor params: `int $userId`, `string $type`, `string $title`, `string $message`, `?string $link`, `?string $referenceType`, `?string $referenceId` (UUID string)
    - Method `handle()`: buat `ClientNotification::create([...])` dengan semua params
    - Mengikuti pola `NotifySalesUser` job
    - _Requirements: 5.1_

- [x] 4. Backend: Service
  - [x] 4.1 Buat `BackofficeDepositService` di `app/Services/Backoffice/BackofficeDepositService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllDepositRequests()`: query semua deposit requests, paginated, eager load `user` (id, name, email). Support filter: `search` (via `scopeSearch`), `status`, `payment_method`. Order by `created_at` desc.
    - Method `getDepositRequestById(string $id)`: findOrFail dengan eager load `user`, `reviewedBy`
    - Method `updateStatus(DepositRequest $deposit, array $data)`:
      - Guard: reject jika status !== 'pending' (throw 422 "Deposit request sudah diproses sebelumnya.")
      - Jika approving:
        - Guard: cek wallet status (reject jika locked/banned → throw 422 "Wallet klien tidak aktif.")
        - Wrap dalam `DB::transaction`:
          1. Update deposit status ke 'approved', set `reviewed_by`, `reviewed_at`, `review_reason`
          2. Credit wallet balance (`balance + amount`)
          3. Create `WalletTransaction` record (type='credit', balance_before, balance_after, reference_type='deposit_request', reference_id=deposit UUID)
        - Dispatch `NotifyClientUser` job (type='deposit_approved', message includes formatted amount)
      - Jika rejecting:
        - Update deposit status ke 'rejected', set `reviewed_by`, `reviewed_at`, `review_reason`
        - Dispatch `NotifyClientUser` job (type='deposit_rejected', message includes rejection reason)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3, 4.4, 5.2, 5.3_

- [x] 5. Backend: FormRequest, Controller, dan Routes
  - [x] 5.1 Buat `UpdateDepositStatusRequest` di `app/Http/Requests/Backoffice/UpdateDepositStatusRequest.php`
    - Rules: `status` → required|string|in:approved,rejected; `reason` → required_if:status,rejected|nullable|string|max:1000
    - _Requirements: 4.2_

  - [x] 5.2 Buat `BackofficeDepositController` di `app/Http/Controllers/Api/v1/Backoffice/BackofficeDepositController.php`
    - Inject `BackofficeDepositService`
    - `index()` → paginated list via service `getAllDepositRequests()`, return `paginatedResponse`
    - `show(string $id)` → `ApiResponse::success` dari service `getDepositRequestById($id)`
    - `updateStatus(UpdateDepositStatusRequest $request, DepositRequest $deposit)` → panggil service `updateStatus()`, return `ApiResponse::success`
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

  - [x] 5.3 Tambah routes di `routes/api.php`
    - Di dalam prefix `backoffice`, middleware `role:admin,backoffice`:
      - `GET /backoffice/deposit-requests` → `BackofficeDepositController@index`
      - `GET /backoffice/deposit-requests/{deposit_request}` → `BackofficeDepositController@show`
      - `PATCH /backoffice/deposit-requests/{deposit_request}/status` → `BackofficeDepositController@updateStatus`
    - _Requirements: 1.6, 1.7_

- [x] 6. Backend: Dashboard Update
  - [x] 6.1 Update `DashboardService` di `app/Services/Backoffice/DashboardService.php`
    - Tambah method private `getDepositsSummary()` → return `['total' => int, 'pending' => int]` dari `DepositRequest` model
    - Include `'deposits' => $this->getDepositsSummary()` di return value `getSummary()`
    - _Requirements: 11.1_

- [x] 7. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file baru/dimodifikasi
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 11.1, 13.1_

- [x] 8. Checkpoint — Backend selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Backend: Property-based tests
  - [x] 9.1 Write property test untuk list ordering
    - **Property 1: List ordering is always descending by created_at**
    - Generate N random deposit requests, verify list endpoint returns semua records ordered by `created_at` desc
    - Buat test file di `tests/Feature/Backoffice/BackofficeDepositRequestTest.php`
    - **Validates: Requirements 1.1**

  - [x] 9.2 Write property test untuk search filter
    - **Property 2: Search filter returns only matching results**
    - Generate random deposit requests + search strings, verify semua items yang dikembalikan mengandung search string di `reference_code` atau `user.name` (case-insensitive)
    - **Validates: Requirements 1.3**

  - [x] 9.3 Write property test untuk enum filters
    - **Property 3: Enum filters return only matching results**
    - Generate random deposit requests dengan mixed statuses/payment_methods, verify filter mengembalikan hanya items yang sesuai
    - **Validates: Requirements 1.4, 1.5**

  - [x] 9.4 Write property test untuk status change reviewer info
    - **Property 4: Status change records reviewer information**
    - Generate random pending deposit requests + valid payloads, verify `reviewed_by`, `reviewed_at`, dan `status` terekam dengan benar
    - **Validates: Requirements 3.1, 4.1**

  - [x] 9.5 Write property test untuk non-pending guard
    - **Property 5: Non-pending deposits cannot be processed**
    - Generate random non-pending deposit requests (approved/rejected/expired), verify 422 rejection dan status tetap unchanged
    - **Validates: Requirements 3.5, 4.3**

  - [x] 9.6 Write property test untuk wallet balance invariant
    - **Property 6: Wallet balance invariant on approval**
    - Generate random pending deposit requests dengan berbagai amount, verify wallet balance = initial + amount setelah approval
    - **Validates: Requirements 3.2**

  - [x] 9.7 Write property test untuk transaction record invariant
    - **Property 7: Transaction record invariant on approval**
    - Generate random approved deposit requests, verify WalletTransaction record exists dengan type='credit', amount sesuai, balance_after = balance_before + amount, reference_type='deposit_request', reference_id = deposit UUID
    - **Validates: Requirements 3.3**

  - [x] 9.8 Write property test untuk approval notification
    - **Property 8: Approval dispatches notification with deposit amount**
    - Generate random approved deposit requests, verify ClientNotification record created dengan type='deposit_approved' dan message mengandung formatted amount
    - **Validates: Requirements 3.7, 5.2**

  - [x] 9.9 Write property test untuk rejection notification
    - **Property 9: Rejection dispatches notification with reason**
    - Generate random rejected deposit requests dengan reason R, verify ClientNotification record created dengan type='deposit_rejected' dan message mengandung reason R
    - **Validates: Requirements 4.4, 5.3**

  - [x] 9.10 Write property test untuk rejection reason validation
    - **Property 10: Rejection reason validation**
    - Generate random invalid reasons (empty, whitespace-only, >1000 chars), verify validation error saat reject
    - **Validates: Requirements 4.2**

  - [x] 9.11 Write property test untuk dashboard counts
    - **Property 11: Dashboard deposit counts accuracy**
    - Generate random deposit requests dengan mixed statuses, verify dashboard `deposits.total` dan `deposits.pending` sesuai
    - **Validates: Requirements 11.1**

  - [x] 9.12 Write property test untuk attachment URL accessor
    - **Property 12: Attachment URL accessor**
    - Generate deposit requests dengan dan tanpa attachment, verify accessor returns non-null URL atau null sesuai
    - **Validates: Requirements 13.3**

- [x] 10. Checkpoint — Backend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Frontend: Service layer — Deposit Requests
  - [x] 11.1 Buat type definitions di `src/services/backoffice/deposit-requests/deposit-requests.types.ts`
    - Interface `IDepositRequest` dengan fields: `id` (string/UUID), `user_id`, `amount`, `reference_code`, `payment_method`, `attachment`, `attachment_url`, `status` (DepositRequestStatus), `reviewed_by`, `review_reason`, `reviewed_at`, `created_at`, `updated_at`, `user: { id: number; name: string; email: string }`, `reviewed_by_user: { id: number; name: string } | null`
    - Type `DepositRequestStatus = 'pending' | 'approved' | 'rejected' | 'expired'`
    - Interface `IDepositRequestParams` extends `IPaginationParams` dengan `search?`, `status?`, `payment_method?`
    - Interface `IUpdateDepositStatusPayload`: `status: 'approved' | 'rejected'`, `reason?: string`
    - _Requirements: 10.1_

  - [x] 11.2 Buat service functions di `src/services/backoffice/deposit-requests/deposit-requests.service.ts`
    - `depositRequestsService.list(params)` → `api.get('/backoffice/deposit-requests', { params })`
    - `depositRequestsService.detail(id)` → `api.get('/backoffice/deposit-requests/${id}')`
    - `depositRequestsService.updateStatus(id, payload)` → `api.patch('/backoffice/deposit-requests/${id}/status', payload)`
    - _Requirements: 10.2_

  - [x] 11.3 Buat barrel export di `src/services/backoffice/deposit-requests/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 10.3_

- [x] 12. Frontend: Routing dan Sidebar Navigation
  - [x] 12.1 Update `src/config/routing.ts`
    - Tambah `DEPOSIT_REQUESTS_SERVICES` dengan `depositRequests: '/dashboard/deposit-requests'` dan `depositRequestDetail: (id: string) => \`/dashboard/deposit-requests/${id}\``
    - Spread ke `PATHS` export
    - _Requirements: 12.4_

  - [x] 12.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah `FINANCE_NAV` NavGroup baru dengan label "Finance", icon `Wallet` dari lucide-react
    - Item: `{ label: 'Deposit Requests', href: PATHS.depositRequests, icon: CreditCard }`
    - Insert ke backoffice nav array antara `SALES_MANAGEMENT_NAV` dan `OTHER_NAVS`
    - Import `Wallet` dan `CreditCard` dari lucide-react
    - _Requirements: 12.1, 12.2, 12.3_

- [x] 13. Frontend: Dashboard Widget Update
  - [x] 13.1 Update `src/services/backoffice/dashboard/dashboard.types.ts`
    - Tambah interface `IDepositsSummary`: `{ total: number; pending: number }`
    - Tambah field `deposits: IDepositsSummary` ke `IDashboardData` interface
    - _Requirements: 11.1_

  - [x] 13.2 Update dashboard page di `src/app/(dashboard)/dashboard/page.tsx`
    - Tambah `StatCard` untuk deposits: title "Deposit Requests", value `deposits.total`, description `${deposits.pending} pending review`, icon `Wallet`, iconVariant "warning"
    - Import `Wallet` dari lucide-react
    - _Requirements: 11.2, 11.3_

- [x] 14. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Frontend: Deposit Request List Page
  - [x] 15.1 Buat page component di `src/app/(dashboard)/dashboard/deposit-requests/page.tsx`
    - Gunakan `useTableData` hook dengan `depositRequestsService.list`
    - `TableCard` dengan kolom: Client Name (`user.name`), Reference Code, Amount (format Rupiah: `Rp X.XXX.XXX`), Payment Method, Status (badge), Created Date
    - `SearchInput` untuk search by reference code / client name
    - `FilterPopup` dengan status chips (pending, approved, rejected, expired) dan payment method chips
    - Setiap row click navigates ke detail page via `PATHS.depositRequestDetail(id)`
    - Gunakan `useTableData` untuk URL-synced pagination
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 16. Frontend: Deposit Request Detail Page
  - [x] 16.1 Buat page component di `src/app/(dashboard)/dashboard/deposit-requests/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan `depositRequestsService.detail`
    - `DetailCard` dengan sections:
      - **Informasi Deposit**: client name, email, reference code, amount (format Rupiah), payment method, status badge, created date
      - **Lampiran**: clickable image preview (jika image) atau download link (jika file). Gunakan Next.js `<Image>` untuk preview
      - **Update Status** (hanya jika status === 'pending'): `FormSelect` untuk status (approved/rejected), `FormTextarea` untuk reason (required untuk rejection, optional untuk approval), submit `Button`
      - **Informasi Review** (jika status !== 'pending'): reviewer name, reason, review timestamp (read-only)
    - Handle form submission via `depositRequestsService.updateStatus()`
    - Toast notification on success/error via `useNotificationStore`
    - Refetch detail setelah status update berhasil
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [x] 17. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Dokumentasi
  - [x] 18.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (backoffice deposit requests) di API Endpoints table, update Project Structure
    - Update `CLAUDE.md`: tambah BackofficeDepositService, BackofficeDepositController, NotifyClientUser job, ClientNotification model di API Modules table
    - Update Postman collection `postman/Lingkar_ID_API.postman_collection.json`: tambah semua endpoint baru (GET list, GET detail, PATCH status). Validate JSON setelah edit: `python3 -c "import json; json.load(open('postman/Lingkar_ID_API.postman_collection.json')); print('Valid')"`
    - _Requirements: 1.1, 3.1, 4.1, 5.1_

  - [x] 18.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Deposit Request Management (list, detail, approve/reject, dashboard widget)
    - Update `docs/ARCHITECTURE.md`: tambah deposit-requests service layer, routing updates, Finance nav group, dashboard widget
    - Update `README.md`: tambah Deposit Request Management ke Feature Status table
    - Update `CLAUDE.md`: tambah info Deposit Request Management pages, service layer, sidebar Finance group
    - _Requirements: 8.6, 9.1, 11.2, 12.1_

- [x] 19. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend tasks (1-10) harus diselesaikan sebelum frontend tasks (11-17) karena frontend bergantung pada API baru
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 12 correctness properties dari design document
- Approval flow menggunakan `DB::transaction()` untuk atomicity (status update + wallet credit + transaction creation)
- Notification dispatch terjadi setelah transaction commit — tidak ada notifikasi jika transaction gagal
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, FormTextarea, Badge, TableCard, DetailCard, StatCard) — jangan gunakan native HTML elements
- Format Rupiah: gunakan `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` atau pattern yang sudah ada di project
