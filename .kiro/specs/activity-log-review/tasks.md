# Implementation Plan: Activity Log Review

## Overview

Implementasi fitur Activity Log Review yang memungkinkan Backoffice/Admin user untuk melihat, mereview, dan mengubah status seluruh activity log dari sales user. Fitur ini mencakup comment thread antara backoffice reviewer dan sales owner, serta notifikasi dua arah dengan deep link ke halaman detail.

Implementasi dibagi menjadi tiga bagian utama: backend (Laravel — `lingkar-id-backend/`), frontend (Next.js — `lingkar-crm/`), dan dokumentasi. Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru.

## Tasks

- [x] 1. Backend: Migrations
  - [x] 1.1 Buat migration `add_review_fields_to_activity_logs_table`
    - Tambah kolom `status_changed_by` (nullable foreignId, constrained to `users`, nullOnDelete)
    - Tambah kolom `status_change_reason` (nullable text)
    - Tambah kolom `status_changed_at` (nullable timestamp)
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 6.1_

  - [x] 1.2 Buat migration `create_activity_log_comments_table`
    - Kolom: `id`, `activity_log_id` (foreignId, constrained to `activity_logs`, cascadeOnDelete), `user_id` (foreignId, constrained to `users`, cascadeOnDelete), `body` (text), `timestamps`
    - Tambah index pada `activity_log_id`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

  - [x] 1.3 Buat migration `create_sales_notifications_table`
    - Schema mengikuti pola `backoffice_notifications`: `id`, `user_id` (foreignId, constrained to `users`, cascadeOnDelete), `type` (string), `title` (string), `message` (text), `link` (nullable string), `read_at` (nullable timestamp), `reference_type` (nullable string), `reference_id` (nullable bigint), `timestamps`
    - Tambah index pada `type` dan composite index `[user_id, read_at]`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 7.6_

- [x] 2. Backend: Models
  - [x] 2.1 Update `ActivityLog` model di `app/Models/ActivityLog.php`
    - Tambah `status_changed_by`, `status_change_reason`, `status_changed_at` ke `$fillable`
    - Tambah `'status_changed_at' => 'datetime'` ke `$casts`
    - Tambah relasi `statusChangedBy()` → `belongsTo(User::class, 'status_changed_by')`
    - Tambah relasi `comments()` → `hasMany(ActivityLogComment::class)`
    - _Requirements: 6.1, 2.2, 3.1_

  - [x] 2.2 Buat model `ActivityLogComment` di `app/Models/ActivityLogComment.php`
    - `$fillable`: `activity_log_id`, `user_id`, `body`
    - Relasi `activityLog()` → `belongsTo(ActivityLog::class)`
    - Relasi `user()` → `belongsTo(User::class)`
    - _Requirements: 6.2, 4.3_

  - [x] 2.3 Buat model `SalesNotification` di `app/Models/SalesNotification.php`
    - Mengikuti pola `BackofficeNotification` model
    - Constants: `TYPE_STATUS_CHANGE = 'status_change'`, `TYPE_NEW_COMMENT = 'new_comment'`
    - `$fillable`: `user_id`, `type`, `title`, `message`, `link`, `read_at`, `reference_type`, `reference_id`
    - `$casts`: `'read_at' => 'datetime'`
    - Relasi `user()` → `belongsTo(User::class)`
    - Scope `scopeUnread($query)` → `whereNull('read_at')`
    - _Requirements: 7.6_

- [x] 3. Backend: Services
  - [x] 3.1 Buat `BackofficeActivityLogService` di `app/Services/Backoffice/BackofficeActivityLogService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllActivityLogs()`: query semua activity logs (semua sales users), paginated, eager load `user`, `lead`, `statusChangedBy`. Support filter: `search` (title/description via existing `scopeSearch`), `status`, `type`. Order by `created_at` desc.
    - Method `getActivityLogById(string $id)`: findOrFail dengan eager load `user`, `lead`, `statusChangedBy`, `comments.user`
    - Method `updateStatus(ActivityLog $activityLog, array $data)`: validasi status masih `pending` (throw 422 jika tidak), update `status`, `status_changed_by` (Auth::id()), `status_change_reason`, `status_changed_at` (now()). Jika `comment` ada di data, buat `ActivityLogComment` record. Dispatch `NotifySalesUser` job ke owner activity log dengan link `/sales-activities/{id}`.
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 2.5, 7.1_

  - [x] 3.2 Buat `ActivityLogCommentService` di `app/Services/Shared/ActivityLogCommentService.php`
    - Method `checkAccess(ActivityLog $activityLog, User $user): bool` — return true jika user adalah owner (`user_id`) ATAU reviewer (`status_changed_by`)
    - Method `getComments(ActivityLog $activityLog): Collection` — query semua comments untuk activity log, eager load `user` (with role), order by `created_at` asc
    - Method `createComment(ActivityLog $activityLog, User $user, string $body): ActivityLogComment` — validasi activity log sudah direview (status ≠ pending, throw 422 jika masih pending). Buat comment record. Dispatch notifikasi ke pihak lain: jika commenter adalah sales owner → dispatch `NotifyBackofficeUsers` targeted ke reviewer saja (buat `BackofficeNotification` langsung, bukan broadcast), dengan link `/dashboard/activity-logs/{id}`. Jika commenter adalah reviewer → dispatch `NotifySalesUser` ke sales owner dengan link `/sales-activities/{id}`.
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.1, 5.2, 7.2, 7.3, 7.4_

  - [x] 3.3 Buat `SalesNotificationService` di `app/Services/Sales/SalesNotificationService.php`
    - Mengikuti pola `Backoffice\NotificationService`
    - Use `ApiPaginationTrait`
    - Method `getMyNotifications()`: paginated, order by `created_at` desc, filter by `Auth::id()`
    - Method `getUnreadCount(): int`
    - Method `markAsRead(SalesNotification $notification): SalesNotification` — validasi ownership
    - Method `markAllAsRead(): int`
    - _Requirements: 7.6_

  - [x] 3.4 Update existing `Sales\ActivityLogService` di `app/Services/Sales/ActivityLogService.php`
    - Update `getActivityLogById()` untuk eager load `statusChangedBy` relation
    - Response akan otomatis include `status_change_reason` dan `status_changed_at` karena sudah ditambah ke `$fillable`
    - _Requirements: 3.1, 3.2_

- [x] 4. Backend: Job NotifySalesUser
  - [x] 4.1 Buat job `NotifySalesUser` di `app/Jobs/NotifySalesUser.php`
    - Implements `ShouldQueue`, use `Queueable`
    - Constructor params: `int $userId` (target sales user), `string $type`, `string $title`, `string $message`, `?string $link`, `?string $referenceType`, `?int $referenceId`
    - Method `handle()`: buat `SalesNotification::create([...])` dengan semua params
    - Mengikuti pola `NotifyBackofficeUsers` tapi targeted ke satu user saja
    - _Requirements: 7.1, 7.2, 7.6_

- [x] 5. Backend: Controllers, FormRequests, dan Routes
  - [x] 5.1 Buat `UpdateActivityLogStatusRequest` di `app/Http/Requests/Backoffice/UpdateActivityLogStatusRequest.php`
    - Rules: `status` → required|in:approved,rejected; `reason` → required|string|max:1000; `comment` → nullable|string|max:2000
    - _Requirements: 2.1, 2.6_

  - [x] 5.2 Buat `StoreActivityLogCommentRequest` di `app/Http/Requests/Shared/StoreActivityLogCommentRequest.php`
    - Rules: `body` → required|string|max:2000
    - _Requirements: 4.3_

  - [x] 5.3 Buat `BackofficeActivityLogController` di `app/Http/Controllers/Api/v1/Backoffice/BackofficeActivityLogController.php`
    - Inject `BackofficeActivityLogService`
    - `index()` → `paginatedResponse` dari service `getAllActivityLogs()`
    - `show(string $id)` → `ApiResponse::success` dari service `getActivityLogById($id)`
    - `updateStatus(UpdateActivityLogStatusRequest $request, ActivityLog $activityLog)` → panggil service `updateStatus()`, return `ApiResponse::success`
    - _Requirements: 1.1, 1.2, 2.1_

  - [x] 5.4 Buat `ActivityLogCommentController` di `app/Http/Controllers/Api/v1/Shared/ActivityLogCommentController.php`
    - Inject `ActivityLogCommentService`
    - `index(ActivityLog $activityLog)` → check access via service, return comments via `ApiResponse::success`
    - `store(StoreActivityLogCommentRequest $request, ActivityLog $activityLog)` → check access, create comment via service, return `ApiResponse::success`
    - Return 403 jika access denied
    - _Requirements: 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_

  - [x] 5.5 Buat `Sales\NotificationController` di `app/Http/Controllers/Api/v1/Sales/NotificationController.php`
    - Mengikuti pola `Backoffice\NotificationController`
    - Inject `SalesNotificationService`
    - `index()`, `unreadCount()`, `markAsRead(SalesNotification $notification)`, `markAllAsRead()`
    - _Requirements: 7.6_

  - [x] 5.6 Tambah routes di `routes/api.php`
    - Backoffice routes (di dalam prefix `backoffice`, middleware `role:admin,backoffice`):
      - `GET /backoffice/activity-logs` → `BackofficeActivityLogController@index`
      - `GET /backoffice/activity-logs/{activity_log}` → `BackofficeActivityLogController@show`
      - `PATCH /backoffice/activity-logs/{activity_log}/status` → `BackofficeActivityLogController@updateStatus`
    - Shared comment routes (di dalam `auth:sanctum`, accessible by both roles):
      - `GET /activity-logs/{activity_log}/comments` → `ActivityLogCommentController@index`
      - `POST /activity-logs/{activity_log}/comments` → `ActivityLogCommentController@store`
    - Sales notification routes (di dalam prefix `sales`, middleware `role:sales`):
      - `GET /sales/notifications` → `Sales\NotificationController@index`
      - `GET /sales/notifications/unread-count` → `Sales\NotificationController@unreadCount`
      - `PATCH /sales/notifications/{notification}/read` → `Sales\NotificationController@markAsRead`
      - `PATCH /sales/notifications/read-all` → `Sales\NotificationController@markAllAsRead`
    - _Requirements: 1.1, 2.1, 4.2, 4.3, 5.1, 5.2, 7.6_

- [x] 6. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file baru/dimodifikasi
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1, 2.1, 4.3, 7.6_

- [x] 7. Checkpoint — Backend selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Backend: Property-based tests
  - [x] 8.1 Write property test untuk list ordering
    - **Property 1: Activity log list returns all records in descending order**
    - Generate N random activity logs dari multiple sales users, verify list endpoint returns semua records ordered by `created_at` desc
    - Buat test file di `tests/Feature/Backoffice/BackofficeActivityLogTest.php`
    - **Validates: Requirements 1.1**

  - [x] 8.2 Write property test untuk search filter
    - **Property 3: Search filter returns only matching results**
    - Generate random activity logs + search strings, verify semua items yang dikembalikan mengandung search string di title atau description (case-insensitive)
    - **Validates: Requirements 1.3**

  - [x] 8.3 Write property test untuk enum filters
    - **Property 4: Enum filters return only matching results**
    - Generate random activity logs dengan mixed statuses/types, verify filter mengembalikan hanya items yang sesuai
    - **Validates: Requirements 1.4, 1.5**

  - [x] 8.4 Write property test untuk status change
    - **Property 5: Status change records all review fields correctly**
    - Generate random pending activity logs + valid payloads, verify semua fields (status, status_changed_by, status_change_reason, status_changed_at, optional comment) terekam dengan benar
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 4.1**

  - [x] 8.5 Write property test untuk non-pending rejection
    - **Property 6: Non-pending activity logs reject status changes**
    - Generate random non-pending activity logs, verify 422 rejection
    - **Validates: Requirements 2.5**

  - [x] 8.6 Write property test untuk comment access control
    - **Property 10: Comment access control restricts to owner and reviewer**
    - Generate random users + activity logs, verify access control matrix (owner dan reviewer dapat akses, lainnya 403)
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

  - [x] 8.7 Write property test untuk cascading delete
    - **Property 11: Cascading delete removes associated comments**
    - Generate activity logs dengan random comments, delete log, verify semua comments terhapus
    - **Validates: Requirements 6.3**

  - [x] 8.8 Write property test untuk status change notification
    - **Property 12: Status change notification targets sales owner with correct link**
    - Generate status changes, verify notification targeting ke sales owner dengan link `/sales-activities/{id}`
    - **Validates: Requirements 7.1, 7.4**

  - [x] 8.9 Write property test untuk comment notification
    - **Property 13: Comment notification targets the other party with correct link**
    - Generate comments dari kedua sisi, verify notification targeting ke pihak lain dengan link yang benar
    - **Validates: Requirements 7.2, 7.3, 7.4, 7.7**

- [x] 9. Frontend: Service layer — Backoffice Activity Logs
  - [x] 9.1 Buat type definitions di `src/services/backoffice/activity-logs/activity-logs.types.ts`
    - Interface `IBackofficeActivityLog` extends `IActivityLog` dari `@services/sales/activity-logs` dengan tambahan: `user: { id: number; name: string }`, `status_changed_by_user: { id: number; name: string } | null`, `status_change_reason: string | null`, `status_changed_at: string | null`
    - Interface `IBackofficeActivityLogParams` extends `IPaginationParams` dengan `search?`, `status?` (ActivityLogStatus), `type?` (ActivityLogType)
    - Interface `IUpdateStatusPayload`: `status: 'approved' | 'rejected'`, `reason: string`, `comment?: string`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 2.1_

  - [x] 9.2 Buat service functions di `src/services/backoffice/activity-logs/activity-logs.service.ts`
    - `backofficeActivityLogsService.list(params)` → `api.get('/backoffice/activity-logs', { params })`
    - `backofficeActivityLogsService.detail(id)` → `api.get('/backoffice/activity-logs/${id}')`
    - `backofficeActivityLogsService.updateStatus(id, payload)` → `api.patch('/backoffice/activity-logs/${id}/status', payload)`
    - Ikuti pola existing service files
    - _Requirements: 1.1, 2.1_

  - [x] 9.3 Buat barrel export di `src/services/backoffice/activity-logs/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

- [x] 10. Frontend: Service layer — Shared Comments
  - [x] 10.1 Buat type definitions di `src/services/shared/comments/comments.types.ts`
    - Interface `IActivityLogComment`: `id`, `activity_log_id`, `user_id`, `body`, `user: { id: number; name: string; role: string }`, `created_at`, `updated_at`
    - Interface `ICreateCommentPayload`: `body: string`
    - _Requirements: 4.3, 4.4_

  - [x] 10.2 Buat service functions di `src/services/shared/comments/comments.service.ts`
    - `commentsService.list(activityLogId)` → `api.get('/activity-logs/${activityLogId}/comments')`
    - `commentsService.create(activityLogId, payload)` → `api.post('/activity-logs/${activityLogId}/comments', payload)`
    - _Requirements: 4.2, 4.3_

  - [x] 10.3 Buat barrel export di `src/services/shared/comments/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 4.2_

- [x] 11. Frontend: Service layer — Sales Notifications
  - [x] 11.1 Buat type definitions di `src/services/sales/notifications/notifications.types.ts`
    - Mengikuti pola `src/services/backoffice/notifications/notifications.types.ts`
    - Interface `ISalesNotification` (sama dengan `INotification`), `IUnreadCount`, `IMarkAllReadResult`
    - _Requirements: 7.6_

  - [x] 11.2 Buat service functions di `src/services/sales/notifications/notifications.service.ts`
    - `salesNotificationsService.list`, `unreadCount`, `markAsRead`, `markAllAsRead`
    - Endpoint prefix: `/sales/notifications`
    - Mengikuti pola `backoffice/notifications/notifications.service.ts`
    - _Requirements: 7.6_

  - [x] 11.3 Buat barrel export di `src/services/sales/notifications/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 7.6_

- [x] 12. Frontend: Update existing sales activity log types
  - Update `IActivityLog` interface di `src/services/sales/activity-logs/activity-logs.types.ts`
    - Tambah field: `status_changed_by: number | null`, `status_change_reason: string | null`, `status_changed_at: string | null`, `status_changed_by_user: { id: number; name: string } | null`
    - _Requirements: 3.1, 3.2_

- [x] 13. Checkpoint — Service layer frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Frontend: CommentThread reusable component
  - [x] 14.1 Buat `CommentThread` component di `src/app/components/ui/CommentThread/comment-thread.tsx`
    - Props: `activityLogId: number`, `currentUserId: number`, `hasAccess: boolean`
    - Fetch comments via `commentsService.list(activityLogId)` menggunakan `useEffect` + state management
    - Display setiap comment dengan: avatar initial (huruf pertama nama), nama commenter, role badge (gunakan `Badge` dari `@app/components/ui/Table`), body, relative timestamp (gunakan `date-fns` `formatDistanceToNow` dengan locale `id`)
    - Comment input form di bagian bawah: `FormTextarea` + `Button` (submit)
    - Optimistic UI: append comment ke list segera, refetch on success
    - Jika `!hasAccess`, render nothing atau pesan "Tidak ada akses"
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 5.5_

  - [x] 14.2 Buat barrel export di `src/app/components/ui/CommentThread/index.ts`
    - _Requirements: 4.5_

  - [ ] 14.3 Write unit tests untuk CommentThread component
    - Test render dengan mock comments data
    - Test submit comment form
    - Test render tanpa akses (hasAccess=false)
    - **Property 8: Comment creation produces correct record with user info**
    - **Property 9: Comment list returns chronological order**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.5, 4.6**

- [x] 15. Frontend: Backoffice Activity Log List Page
  - [x] 15.1 Buat page component di `src/app/(dashboard)/dashboard/activity-logs/page.tsx`
    - Gunakan `useTableData` hook dengan `backofficeActivityLogsService.list`
    - White card container (sesuai project pattern)
    - `TableCard` dengan kolom: Sales Name (`user.name`), Title, Type (badge), Status (badge), Lead (`lead.name`), Created Date
    - `SearchInput` untuk search by title/description
    - `FilterPopup` untuk filter status (pending/approved/rejected) dan type (general_note/request_lead_assign/request_update_lead_status)
    - Setiap row link ke `/dashboard/activity-logs/{id}`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [ ] 15.2 Write unit tests untuk backoffice activity log list page
    - Test render table dengan mock data
    - Test search dan filter functionality
    - **Property 2: Activity log list includes user and lead relations**
    - **Validates: Requirements 1.2, 1.6, 1.7**

- [x] 16. Frontend: Backoffice Activity Log Detail Page
  - [x] 16.1 Buat page component di `src/app/(dashboard)/dashboard/activity-logs/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan `backofficeActivityLogsService.detail`
    - `DetailCard` dengan sections:
      - Activity info: title, type (badge), description, attachment preview (reuse pattern dari ActivityCard), lead info, sales user name
      - Status section: jika `pending` → tampilkan form status update (`FormSelect` untuk status approved/rejected, `FormTextarea` untuk reason (required), `FormTextarea` untuk initial comment (optional), `Button` submit). Jika sudah reviewed → tampilkan read-only: status badge, reason, reviewer name, timestamp
      - Comment thread: tampilkan `CommentThread` component hanya jika status ≠ pending
    - Handle form submission via `backofficeActivityLogsService.updateStatus()`
    - Show toast notification on success/error
    - _Requirements: 2.1, 2.7, 2.8, 4.1, 4.5, 4.6, 4.7_

  - [ ] 16.2 Write unit tests untuk backoffice activity log detail page
    - Test render detail dengan mock data (pending state)
    - Test render detail dengan mock data (reviewed state)
    - Test status update form submission
    - Test comment thread visibility based on status
    - **Property 7: Reviewed activity log includes reviewer information**
    - **Validates: Requirements 2.7, 2.8, 4.7**

- [x] 17. Frontend: Sales Activity Log Detail Page
  - [x] 17.1 Buat page component di `src/app/(dashboard)/sales-activities/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan existing `activityLogsService` (yang sudah di-update untuk include reviewer info)
    - `DetailCard` dengan sections:
      - Activity info: title, type (badge), description, attachment preview, lead info
      - Review info (hanya tampil jika status ≠ pending): reviewer name (`status_changed_by_user.name`), reason, review timestamp
      - Comment thread: tampilkan `CommentThread` component hanya jika status ≠ pending
    - _Requirements: 3.1, 3.2, 3.3, 4.5, 4.6, 4.7_

  - [ ] 17.2 Write unit tests untuk sales activity log detail page
    - Test render detail dengan mock data (pending state — no review info, no comments)
    - Test render detail dengan mock data (reviewed state — review info + comments visible)
    - **Validates: Requirements 3.1, 3.2, 3.3, 4.7**

- [x] 18. Frontend: Routing, Sidebar, dan Navigation Updates
  - [x] 18.1 Update `src/config/routing.ts`
    - Tambah `ACTIVITY_LOGS_SERVICES` dengan `activityLogs: "/dashboard/activity-logs"` dan `activityLogDetail: (id: number) => \`/dashboard/activity-logs/${id}\``
    - Update `SALES_ACTIVITIES_SERVICES` tambah `salesActivityDetail: (id: number) => \`/sales-activities/${id}\``
    - Spread ke `PATHS` export
    - _Requirements: 1.6, 7.5_

  - [x] 18.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah "Activity Logs" item di bawah Sales Management group untuk backoffice users
    - Icon: `FileText` dari lucide-react
    - Href: `PATHS.activityLogs`
    - _Requirements: 1.6_

  - [x] 18.3 Update `ActivityCard` component untuk link ke detail page
    - Wrap card content dalam `Link` dari `next/link` ke `/sales-activities/{id}`
    - Pastikan link tidak mengganggu attachment link (stopPropagation atau nested link handling)
    - _Requirements: 3.3, 7.5_

  - [x] 18.4 Update `NotificationBell` component untuk deep link handling
    - Ketika notification memiliki field `link`, navigate ke URL tersebut saat diklik (selain mark as read)
    - Berlaku untuk backoffice notifications yang sudah ada
    - _Requirements: 7.5_

- [x] 19. Checkpoint — Frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 20. Dokumentasi
  - [x] 20.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (backoffice activity logs, shared comments, sales notifications) di API Endpoints table, update Project Structure
    - Update `CLAUDE.md`: tambah BackofficeActivityLogService, ActivityLogCommentService, SalesNotificationService, NotifySalesUser job di API Modules table
    - Update Postman collection `postman/Lingkar_ID_API.postman_collection.json`: tambah semua endpoint baru (backoffice activity logs CRUD, shared comments, sales notifications). Validate JSON setelah edit: `python3 -c "import json; json.load(open('postman/Lingkar_ID_API.postman_collection.json')); print('Valid')"`
    - _Requirements: 1.1, 2.1, 4.2, 4.3, 7.6_

  - [x] 20.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Activity Log Review (backoffice list, detail, status update, comment thread, sales detail, notifications)
    - Update `docs/ARCHITECTURE.md`: tambah service layers baru, CommentThread component, routing updates, notification deep link flow
    - Update `README.md`: tambah Activity Log Review ke Feature Status table
    - Update `CLAUDE.md`: tambah info Activity Log Review pages, CommentThread component, sales notifications service
    - _Requirements: 1.6, 2.7, 3.3, 4.5, 7.5_

- [x] 21. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend tasks (1-8) harus diselesaikan sebelum frontend tasks (9-19) karena frontend bergantung pada API baru
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 13 correctness properties dari design document
- Unit tests memvalidasi contoh spesifik dan edge cases
- Dokumentasi update wajib dilakukan sesuai project rules (AGENTS.md)
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, FormTextarea, Badge, TableCard, DetailCard) — jangan gunakan native HTML elements
- Comment routes bersifat shared (accessible by both backoffice dan sales) dengan access control di service layer
