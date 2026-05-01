# Implementation Plan: User Journey Funnel

## Overview

Implementasi fitur User Journey Funnel — sistem analytics in-house untuk platform Lingkar ID yang melacak lifecycle events pengguna, mengelola journey stage via state machine, dan menyediakan halaman CRM backoffice untuk funnel visualization, user segmentation, dan event log browsing.

Sistem menggunakan **dual approach** untuk event tracking:

1. **Direct write** (`trackEvent()`) — untuk lifecycle events (user_registered, email_verified, first_deposit, first_transaction) yang low-volume dan harus transactional dengan aksi pemicu.
2. **Queue-based write** (`trackEventAsync()`) — untuk high-frequency events dari mobile (app_opened, banner_clicked, service_viewed) yang di-dispatch sebagai job ke Redis queue dan diproses oleh worker container yang sudah ada.

Implementasi dibagi menjadi empat bagian utama: backend core (Laravel — `lingkar-id-backend/`), backend analytics API, frontend (Next.js — `lingkar-crm/`), dan dokumentasi. Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru.

## Tasks

- [x] 1. Backend: Migration dan Model
  - [x] 1.1 Buat migration `create_user_events_table`
    - Kolom: `id` (bigIncrements, primary), `user_id` (foreignId, constrained to `users`, cascadeOnDelete), `event_type` (string, indexed), `metadata` (json, nullable), `created_at` (timestamp, indexed, default `now()`)
    - Tidak ada `updated_at` (append-only table)
    - Tambah composite index pada `(user_id, event_type)` untuk first-event lookups
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 1.1_

  - [x] 1.2 Buat migration `add_journey_stage_to_users_table`
    - Tambah kolom `journey_stage` (string, nullable, default `'registered'`, indexed) ke tabel `users`
    - Jalankan migration via `docker exec lingkarid.local php artisan migrate`
    - _Requirements: 2.1, 2.4_

  - [x] 1.3 Buat model `UserEvent` di `app/Models/UserEvent.php`
    - `$timestamps = false` (hanya `created_at`, tanpa `updated_at`)
    - Constants: `TYPE_USER_REGISTERED`, `TYPE_EMAIL_VERIFIED`, `TYPE_FIRST_DEPOSIT`, `TYPE_FIRST_TRANSACTION`, `TYPE_APP_OPENED`, `TYPE_BANNER_CLICKED`, `TYPE_SERVICE_VIEWED`
    - Constant `ALLOWED_EVENT_TYPES` array berisi semua type constants
    - `$fillable`: `user_id`, `event_type`, `metadata`
    - `$casts`: `metadata` → array, `created_at` → datetime
    - Relasi `user()` → `belongsTo(User::class)`
    - Scopes: `scopeOfType($query, string $eventType)`, `scopeForUser($query, int $userId)`, `scopeInDateRange($query, ?string $from, ?string $to)`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

  - [x] 1.4 Update model `User` di `app/Models/User.php`
    - Tambah `journey_stage` ke `$fillable`
    - Tambah relasi `userEvents()` → `hasMany(UserEvent::class)`
    - Tambah scope `scopeInStage($query, string $stage)` → filter by `journey_stage`
    - _Requirements: 2.2, 2.3_

- [x] 2. Backend: EventTrackingService (Dual Approach)
  - [x] 2.1 Buat `EventTrackingService` di `app/Services/Analytics/EventTrackingService.php`
    - Constants: `STAGE_ORDER = ['registered', 'verified', 'funded', 'active']`
    - Constant `EVENT_STAGE_MAP` mapping event types ke target journey stages
    - Method `trackEvent(int $userId, string $eventType, ?array $metadata = null): UserEvent` — synchronous direct write: create `UserEvent` record, lalu panggil `evaluateStageTransition()`. Digunakan untuk lifecycle events (user_registered, email_verified, first_deposit, first_transaction)
    - Method `trackEventAsync(int $userId, string $eventType, ?array $metadata = null): void` — dispatch `TrackUserEvent` job ke Redis queue. Digunakan untuk high-frequency events dari mobile (app_opened, banner_clicked, service_viewed)
    - Private method `evaluateStageTransition(User $user, string $eventType): void` — cek `EVENT_STAGE_MAP`, jika event maps ke stage, panggil `shouldAdvanceStage()`. Jika user dormant/churned dan event adalah lifecycle event, set stage ke 'active'
    - Private method `shouldAdvanceStage(string $currentStage, string $targetStage): bool` — return true hanya jika target stage index > current stage index di `STAGE_ORDER`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [x] 2.2 Buat job `TrackUserEvent` di `app/Jobs/TrackUserEvent.php`
    - Implements `ShouldQueue`, use `Queueable`
    - Constructor params: `int $userId`, `string $eventType`, `?array $metadata`
    - Property `$connection = 'redis'` — explicitly use Redis queue connection
    - Method `handle(EventTrackingService $service): void` — panggil `$service->trackEvent($this->userId, $this->eventType, $this->metadata)`
    - Mengikuti pola existing jobs (`NotifyBackofficeUsers`, `NotifySalesUser`)
    - _Requirements: 3.1_

- [x] 3. Backend: Auto-Tracking Integration Points
  - [x] 3.1 Update `RegisterService` di `app/Services/Auth/RegisterService.php`
    - Inject `EventTrackingService` via constructor
    - Setelah user berhasil dibuat, panggil `$this->eventTrackingService->trackEvent($user->id, UserEvent::TYPE_USER_REGISTERED, ['source' => 'client'])` (direct write, transactional)
    - _Requirements: 4.1, 16.1_

  - [x] 3.2 Update `MitraRegistrationService` di `app/Services/Mitra/MitraRegistrationService.php`
    - Inject `EventTrackingService` via constructor
    - Setelah mitra user berhasil dibuat, panggil `$this->eventTrackingService->trackEvent($user->id, UserEvent::TYPE_USER_REGISTERED, ['source' => 'mitra'])` (direct write, transactional)
    - _Requirements: 4.2, 16.1_

  - [x] 3.3 Update `VerifyEmailService` di `app/Services/Auth/VerifyEmailService.php`
    - Inject `EventTrackingService` via constructor
    - Setelah email berhasil diverifikasi, panggil `$this->eventTrackingService->trackEvent($user->id, UserEvent::TYPE_EMAIL_VERIFIED)` (direct write, transactional)
    - _Requirements: 4.3, 16.2_

  - [x] 3.4 Update `BackofficeDepositService` di `app/Services/Backoffice/BackofficeDepositService.php`
    - Inject `EventTrackingService` via constructor
    - Di dalam `approveDeposit()`, setelah DB::transaction commit, cek apakah user sudah punya `first_deposit` event: `$hasFirstDeposit = UserEvent::where('user_id', $deposit->user_id)->where('event_type', UserEvent::TYPE_FIRST_DEPOSIT)->exists()`
    - Jika belum ada, panggil `$this->eventTrackingService->trackEvent($deposit->user_id, UserEvent::TYPE_FIRST_DEPOSIT, ['amount' => $deposit->amount])` (direct write, di dalam transaction)
    - _Requirements: 4.4, 4.5, 16.3, 16.4_

- [x] 4. Backend: Dormancy Scheduler
  - [x] 4.1 Buat command `ProcessDormantUsers` di `app/Console/Commands/ProcessDormantUsers.php`
    - Signature: `users:process-dormant`
    - Description: `Transition inactive users to dormant/churned stages`
    - Method `handle()`:
      - Query users dengan role Client atau Mitra (via `Role::CLIENT`, `Role::MITRA`)
      - Untuk users di stage 'active', 'funded', atau 'verified': cek last `UserEvent` created_at. Jika > 30 hari lalu → update `journey_stage` ke 'dormant'
      - Untuk users di stage 'dormant': cek last `UserEvent` created_at. Jika > 90 hari dari most recent event → update `journey_stage` ke 'churned'
      - Skip users dengan role Admin, Backoffice, atau Sales
      - Log jumlah users yang ditransisikan: `$this->info("Processed: {$dormantCount} → dormant, {$churnedCount} → churned")`
      - Catch exceptions per-user untuk resilience
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 4.2 Register command di scheduler (`app/Console/Kernel.php` atau `routes/console.php`)
    - Schedule `users:process-dormant` untuk run daily
    - _Requirements: 5.1_

- [x] 5. Backend: Event Ingestion Endpoint
  - [x] 5.1 Buat `TrackEventRequest` di `app/Http/Requests/TrackEventRequest.php`
    - Rules: `event_type` → required|string|max:50|in:{allowed_event_types}, `metadata` → nullable|array
    - _Requirements: 6.4, 6.6_

  - [x] 5.2 Buat `EventIngestionController` di `app/Http/Controllers/Api/v1/EventIngestionController.php`
    - Inject `EventTrackingService`
    - Method `track(TrackEventRequest $request)`: gunakan `$request->user()->id` sebagai user_id, panggil `$service->trackEventAsync()` (queue-based untuk mobile events), return `ApiResponse::success` dengan created event data
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 5.3 Tambah route di `routes/api.php`
    - Di dalam `auth:sanctum` middleware group: `POST /events/track` → `EventIngestionController@track`
    - _Requirements: 6.1, 6.2_

- [x] 6. Backend: Verifikasi syntax PHP (Core)
  - Jalankan `php -l` pada semua file baru/dimodifikasi: UserEvent model, EventTrackingService, TrackUserEvent job, ProcessDormantUsers command, EventIngestionController, TrackEventRequest, updated RegisterService, MitraRegistrationService, VerifyEmailService, BackofficeDepositService, User model, routes/api.php
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1_

- [x] 7. Checkpoint — Backend core selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Backend: Analytics Service dan API
  - [x] 8.1 Buat `AnalyticsService` di `app/Services/Backoffice/AnalyticsService.php`
    - Use `ApiPaginationTrait`
    - Method `getFunnelStats(?string $period, ?string $dateFrom, ?string $dateTo): array`:
      - Hitung user counts per journey stage (registered, verified, funded, active)
      - Jika period filter diberikan, hitung berdasarkan users yang masuk stage dalam period tersebut (via `user_events.created_at`)
      - Hitung conversion rates: `verified_count / registered_count * 100`, dst.
      - Hitung average time per stage (rata-rata waktu antara event masuk stage dan event keluar stage, dalam jam)
      - Return array dengan `stages`, `conversions`, `average_time`
    - Method `getFunnelTrends(?string $period, ?string $dateFrom, ?string $dateTo, string $granularity = 'daily'): array`:
      - Return daily/weekly user counts per stage over specified period
      - Return array dengan `labels` (date strings) dan `series` (per-stage data arrays)
    - Method `getSegmentSummary(): array`:
      - Return user counts per journey stage (semua stages termasuk dormant, churned)
      - Return array dengan `stages` dan `total`
    - Method `getSegmentUsers(string $stage, array $filters): LengthAwarePaginator`:
      - Paginated list of users in specified stage
      - Support filters: `registration_date_from`, `registration_date_to`, `last_active_from`, `last_active_to`
      - Include: user id, name, email, phone, journey_stage, created_at, last_event_at (subquery)
    - Method `exportSegmentCsv(string $stage, array $filters): StreamedResponse`:
      - Stream CSV file dengan headers: Name, Email, Phone, Journey Stage, Registration Date, Last Active
      - Apply same filters as `getSegmentUsers`
    - Method `getEventLog(array $filters): LengthAwarePaginator`:
      - Paginated list of user events, ordered by `created_at` desc
      - Eager load `user` (id, name, email)
      - Support filters: `event_type`, `user_id`, `date_from`, `date_to`, `search` (user name/email ILIKE)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.3, 8.4, 8.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [x] 8.2 Buat FormRequests untuk analytics endpoints
    - `FunnelStatsRequest` di `app/Http/Requests/Backoffice/FunnelStatsRequest.php`: `period` → nullable|string|in:7d,30d,90d,custom; `date_from` → nullable|date|required_if:period,custom; `date_to` → nullable|date|required_if:period,custom|after_or_equal:date_from; `granularity` → nullable|string|in:daily,weekly
    - `SegmentUsersRequest` di `app/Http/Requests/Backoffice/SegmentUsersRequest.php`: `stage` → nullable|string|in:registered,verified,funded,active,dormant,churned; `registration_date_from` → nullable|date; `registration_date_to` → nullable|date; `last_active_from` → nullable|date; `last_active_to` → nullable|date
    - `EventLogRequest` di `app/Http/Requests/Backoffice/EventLogRequest.php`: `event_type` → nullable|string; `user_id` → nullable|integer|exists:users,id; `date_from` → nullable|date; `date_to` → nullable|date; `search` → nullable|string|max:100
    - _Requirements: 7.2, 8.3, 8.6, 9.2, 9.3, 9.4, 9.5_

  - [x] 8.3 Buat `AnalyticsController` di `app/Http/Controllers/Api/v1/Backoffice/AnalyticsController.php`
    - Inject `AnalyticsService`
    - `funnel(FunnelStatsRequest $request)` → `ApiResponse::success` dari service `getFunnelStats()`
    - `funnelTrends(FunnelStatsRequest $request)` → `ApiResponse::success` dari service `getFunnelTrends()`
    - `segments()` → `ApiResponse::success` dari service `getSegmentSummary()`
    - `segmentUsers(SegmentUsersRequest $request, string $stage)` → `paginatedResponse` dari service `getSegmentUsers()`
    - `exportSegments(SegmentUsersRequest $request)` → StreamedResponse dari service `exportSegmentCsv()`
    - `events(EventLogRequest $request)` → `paginatedResponse` dari service `getEventLog()`
    - _Requirements: 7.1, 7.4, 7.6, 7.7, 8.1, 8.2, 8.4, 9.1, 9.7_

  - [x] 8.4 Tambah routes di `routes/api.php`
    - Di dalam prefix `backoffice`, middleware `role:admin,backoffice`:
      - `GET /backoffice/analytics/funnel` → `AnalyticsController@funnel`
      - `GET /backoffice/analytics/funnel/trends` → `AnalyticsController@funnelTrends`
      - `GET /backoffice/analytics/segments` → `AnalyticsController@segments`
      - `GET /backoffice/analytics/segments/export` → `AnalyticsController@exportSegments` (HARUS sebelum `{stage}` route)
      - `GET /backoffice/analytics/segments/{stage}` → `AnalyticsController@segmentUsers`
      - `GET /backoffice/analytics/events` → `AnalyticsController@events`
    - _Requirements: 7.6, 8.1, 9.7_

- [x] 9. Backend: Dashboard Update
  - [x] 9.1 Update `DashboardService` di `app/Services/Backoffice/DashboardService.php`
    - Tambah method private `getJourneySummary()` → return `['stages' => [...counts per stage...], 'conversion_rate' => float]`
    - `conversion_rate` = `(active_count / registered_count) * 100`
    - Include `'journey' => $this->getJourneySummary()` di return value `getSummary()`
    - _Requirements: 11.3_

- [x] 10. Backend: Verifikasi syntax PHP (Analytics)
  - Jalankan `php -l` pada semua file baru/dimodifikasi: AnalyticsService, AnalyticsController, FunnelStatsRequest, SegmentUsersRequest, EventLogRequest, DashboardService
  - Pastikan tidak ada syntax error
  - _Requirements: 7.1, 8.1, 9.1, 11.3_

- [x] 11. Checkpoint — Backend analytics selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Backend: Property-based tests (Core)
  - [x] 12.1 Write property test untuk event tracking record creation
    - **Property 1: Event tracking creates a record with correct fields**
    - Generate random valid users, event types, dan metadata. Verify `UserEvent` record created dengan `user_id`, `event_type`, `metadata` matching input dan `created_at` is set
    - Buat test file di `tests/Feature/Analytics/EventTrackingTest.php`
    - **Validates: Requirements 3.1**

  - [x] 12.2 Write property test untuk forward-only stage progression
    - **Property 2: Forward-only stage progression**
    - Generate random users di berbagai stages, track events yang map ke earlier/equal stages. Verify `journey_stage` tidak berubah. Track events yang map ke later stages, verify stage advances
    - **Validates: Requirements 3.6**

  - [x] 12.3 Write property test untuk dormant/churned re-activation
    - **Property 3: Dormant/churned user re-activation**
    - Generate random users di stage 'dormant' atau 'churned', track lifecycle events. Verify `journey_stage` transitions ke 'active'
    - **Validates: Requirements 3.7**

  - [x] 12.4 Write property test untuk first-deposit conditional tracking
    - **Property 4: First-deposit conditional tracking**
    - Generate random users, beberapa dengan existing `first_deposit` event, beberapa tanpa. Approve deposit, verify `first_deposit` event created hanya jika belum ada sebelumnya
    - **Validates: Requirements 4.4, 16.3**

  - [x] 12.5 Write property test untuk dormancy scheduler inactivity transitions
    - **Property 5: Dormancy scheduler inactivity transitions**
    - Generate random Client/Mitra users dengan varied last event timestamps. Run scheduler, verify users > 30 hari inactive → dormant, dormant users > 90 hari → churned
    - **Validates: Requirements 5.2, 5.3**

  - [x] 12.6 Write property test untuk dormancy scheduler role filtering
    - **Property 6: Dormancy scheduler role filtering**
    - Generate random Admin/Backoffice/Sales users dengan > 30 hari inactivity. Run scheduler, verify `journey_stage` tidak berubah
    - **Validates: Requirements 5.4**

  - [x] 12.7 Write property test untuk event ingestion authenticated
    - **Property 7: Event ingestion creates event for authenticated user**
    - Generate random authenticated users dan valid event payloads. POST ke `/events/track`, verify `UserEvent` created dengan `user_id` = authenticated user ID
    - **Validates: Requirements 6.1, 6.3**

  - [x] 12.8 Write property test untuk event ingestion validation
    - **Property 8: Event ingestion validation rejects invalid input**
    - Generate random invalid event_types (empty, > 50 chars, not in allowed list). POST ke `/events/track`, verify 422 response dan no `UserEvent` created
    - **Validates: Requirements 6.4, 6.6**

- [x] 13. Backend: Property-based tests (Analytics)
  - [x] 13.1 Write property test untuk funnel stats accuracy
    - **Property 9: Funnel stats accuracy and conversion rate calculation**
    - Generate random users across journey stages. Call funnel endpoint, verify stage counts match actual counts dan conversion rates = `(next_stage_count / current_stage_count) * 100`
    - Buat test file di `tests/Feature/Analytics/AnalyticsApiTest.php`
    - **Validates: Requirements 7.1, 7.3**

  - [x] 13.2 Write property test untuk funnel period filtering
    - **Property 10: Funnel period filtering**
    - Generate events at varied timestamps (inside/outside period). Call funnel endpoint with period filter, verify only events within period are counted
    - **Validates: Requirements 7.2**

  - [x] 13.3 Write property test untuk segment users filtering
    - **Property 11: Segment users filtered by stage and date ranges**
    - Generate random users dengan varied stages dan dates. Call segments/{stage} endpoint with date filters, verify only matching users returned
    - **Validates: Requirements 8.2, 8.3**

  - [x] 13.4 Write property test untuk CSV export consistency
    - **Property 12: CSV export matches filtered segment list**
    - Generate random users, call both paginated endpoint dan CSV export with same filters. Verify CSV contains exactly same user IDs
    - **Validates: Requirements 8.4**

  - [x] 13.5 Write property test untuk invalid stage validation
    - **Property 13: Invalid stage validation**
    - Generate random invalid stage strings. Call segments/{stage} endpoint, verify 422 response
    - **Validates: Requirements 8.6**

  - [x] 13.6 Write property test untuk event log ordering and filters
    - **Property 14: Event log ordering and filters**
    - Generate random events. Call event log endpoint with various filter combinations, verify results match ALL filters dan ordered by `created_at` desc
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**

  - [x] 13.7 Write property test untuk event log search
    - **Property 15: Event log search filter**
    - Generate random events dengan varied user names/emails. Call event log endpoint with search string, verify only events where user name/email contains search string (case-insensitive)
    - **Validates: Requirements 9.5**

  - [x] 13.8 Write property test untuk dashboard journey summary
    - **Property 16: Dashboard journey summary accuracy**
    - Generate random users across stages. Call dashboard endpoint, verify journey summary counts match actual counts dan conversion_rate = `(active_count / registered_count) * 100`
    - **Validates: Requirements 11.3**

- [x] 14. Checkpoint — Backend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Frontend: Service layer — Analytics
  - [x] 15.1 Buat type definitions di `src/services/backoffice/analytics/analytics.types.ts`
    - Interface `IStageCount`: `stage: string`, `count: number`
    - Interface `IConversionRate`: `from_stage: string`, `to_stage: string`, `rate: number`
    - Interface `IStageTime`: `stage: string`, `average_hours: number`
    - Interface `IFunnelStats`: `stages: IStageCount[]`, `conversions: IConversionRate[]`, `average_time: IStageTime[]`
    - Interface `IFunnelTrendSeries`: `stage: string`, `data: number[]`
    - Interface `IFunnelTrends`: `labels: string[]`, `series: IFunnelTrendSeries[]`
    - Interface `IFunnelParams`: `period?: '7d' | '30d' | '90d' | 'custom'`, `date_from?: string`, `date_to?: string`, `granularity?: 'daily' | 'weekly'`
    - Interface `ISegmentSummary`: `stages: IStageCount[]`, `total: number`
    - Interface `ISegmentUser`: `id: number`, `name: string`, `email: string`, `phone: string | null`, `journey_stage: string`, `created_at: string`, `last_event_at: string | null`
    - Interface `ISegmentUsersParams` extends `IPaginationParams`: `stage: string`, `registration_date_from?: string`, `registration_date_to?: string`, `last_active_from?: string`, `last_active_to?: string`
    - Interface `IUserEvent`: `id: number`, `user: { id: number; name: string; email: string }`, `event_type: string`, `metadata: Record<string, unknown> | null`, `created_at: string`
    - Interface `IEventLogParams` extends `IPaginationParams`: `event_type?: string`, `user_id?: number`, `date_from?: string`, `date_to?: string`
    - Interface `IJourneySummary`: `stages: IStageCount[]`, `conversion_rate: number`
    - _Requirements: 15.1_

  - [x] 15.2 Buat service functions di `src/services/backoffice/analytics/analytics.service.ts`
    - `analyticsService.getFunnelStats(params)` → `api.get('/backoffice/analytics/funnel', { params })`
    - `analyticsService.getFunnelTrends(params)` → `api.get('/backoffice/analytics/funnel/trends', { params })`
    - `analyticsService.getSegmentSummary()` → `api.get('/backoffice/analytics/segments')`
    - `analyticsService.getSegmentUsers(stage, params)` → `api.get(\`/backoffice/analytics/segments/${stage}\`, { params })`
    - `analyticsService.exportSegmentCsv(params)` → `api.get('/backoffice/analytics/segments/export', { params, responseType: 'blob' })`
    - `analyticsService.getEventLog(params)` → `api.get('/backoffice/analytics/events', { params })`
    - _Requirements: 15.2, 15.3_

  - [x] 15.3 Buat barrel export di `src/services/backoffice/analytics/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 15.4_

- [x] 16. Frontend: Routing dan Sidebar Navigation
  - [x] 16.1 Update `src/config/routing.ts`
    - Tambah `ANALYTICS_SERVICES` dengan:
      - `analyticsFunnel: '/dashboard/analytics/funnel'`
      - `analyticsSegments: '/dashboard/analytics/segments'`
      - `analyticsEvents: '/dashboard/analytics/events'`
    - Spread ke `PATHS` export
    - _Requirements: 14.4_

  - [x] 16.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah `ANALYTICS_NAV` NavGroup baru dengan label "Analytics", icon `BarChart3` atau `TrendingUp` dari lucide-react
    - Items:
      - `{ label: 'Funnel Overview', href: PATHS.analyticsFunnel, icon: TrendingUp }`
      - `{ label: 'User Segments', href: PATHS.analyticsSegments, icon: Users }`
      - `{ label: 'Event Log', href: PATHS.analyticsEvents, icon: ScrollText }`
    - Insert ke backoffice nav array setelah `FINANCE_NAV`
    - _Requirements: 14.1, 14.2, 14.3_

- [x] 17. Frontend: Dashboard Widget Update
  - [x] 17.1 Update `src/services/backoffice/dashboard/dashboard.types.ts`
    - Import `IJourneySummary` dari analytics types
    - Tambah field `journey: IJourneySummary` ke `IDashboardData` interface
    - _Requirements: 11.3_

  - [x] 17.2 Update dashboard page di `src/app/(dashboard)/dashboard/page.tsx`
    - Tambah `StatCard` untuk journey: title "Active Users", value `journey.stages.find(s => s.stage === 'active')?.count`, description `${journey.conversion_rate.toFixed(1)}% conversion rate`, icon `TrendingUp`, iconVariant "success"
    - Import `TrendingUp` dari lucide-react
    - _Requirements: 11.1, 11.2_

- [x] 18. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Frontend: Funnel Overview Page
  - [x] 19.1 Buat page component di `src/app/(dashboard)/dashboard/analytics/funnel/page.tsx`
    - Period filter controls: button group (7d, 30d, 90d) + custom date range picker (menggunakan `FormInput` type date)
    - Sync selected period ke URL query params (`?period=30d` atau `?period=custom&date_from=...&date_to=...`)
    - Funnel bar chart menggunakan `ChartCard` + `BarChartComponent` (Recharts) dengan `CHART_COLORS`:
      - Bars: Registration → Verified → Funded → Active
      - Labels: user count per stage + conversion rate percentage antar stages
    - Trend line chart menggunakan `ChartCard` + Recharts `LineChart` dengan `CHART_SETS`:
      - Lines per stage over time (daily/weekly)
    - Average time per stage display: cards atau table showing "Avg X hours in [stage]"
    - Fetch data via `analyticsService.getFunnelStats()` dan `analyticsService.getFunnelTrends()`
    - Loading state via `FormCard.Loading` pattern
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [x] 19.2 Write unit tests untuk Funnel Overview Page
    - Test render funnel chart dengan mock data
    - Test period filter updates URL params
    - Test trend line chart renders correctly
    - **Validates: Requirements 10.1, 10.2, 10.3**

- [x] 20. Frontend: User Segments Page
  - [x] 20.1 Buat page component di `src/app/(dashboard)/dashboard/analytics/segments/page.tsx`
    - Summary view: clickable cards per stage showing count (menggunakan design system cards/badges)
    - Sync selected stage ke URL query params (`?stage=verified`)
    - Ketika stage dipilih, tampilkan paginated user table via `useTableData` hook dengan `analyticsService.getSegmentUsers`
    - `TableCard` dengan kolom: Name, Email, Phone, Registration Date, Last Active (last event timestamp)
    - Filter controls: registration date range (2x `FormInput` type date), last active date range (2x `FormInput` type date)
    - CSV export button: panggil `analyticsService.exportSegmentCsv()`, trigger download via `URL.createObjectURL` + `<a>` click
    - Sync pagination, stage, dan filters ke URL query params
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

  - [x] 20.2 Write unit tests untuk User Segments Page
    - Test render summary cards dengan mock data
    - Test stage selection shows user table
    - Test filter controls update params
    - Test CSV export triggers download
    - **Validates: Requirements 12.1, 12.2, 12.5**

- [x] 21. Frontend: Event Log Page
  - [x] 21.1 Buat page component di `src/app/(dashboard)/dashboard/analytics/events/page.tsx`
    - Gunakan `useTableData` hook dengan `analyticsService.getEventLog`
    - `TableCard` dengan kolom: User (name), Event Type (badge), Timestamp (formatted), Metadata (truncated JSON preview — max ~50 chars, tooltip/expand untuk full JSON)
    - `SearchInput` untuk search by user name/email
    - `FilterPopup` dengan:
      - Event type dropdown/chips (user_registered, email_verified, first_deposit, first_transaction, app_opened, banner_clicked, service_viewed)
      - Date range picker (date_from, date_to)
    - Sync search, filters, dan pagination ke URL query params via `useTableData`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 21.2 Write unit tests untuk Event Log Page
    - Test render table dengan mock data
    - Test search functionality
    - Test filter by event type dan date range
    - **Validates: Requirements 13.1, 13.2, 13.3**

- [x] 22. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all tests pass, ask the user if questions arise.

- [x] 23. Dokumentasi
  - [x] 23.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (POST /events/track, GET /backoffice/analytics/funnel, funnel/trends, segments, segments/{stage}, segments/export, events) di API Endpoints table, update Project Structure (UserEvent model, EventTrackingService, AnalyticsService, TrackUserEvent job, ProcessDormantUsers command)
    - Update `CLAUDE.md`: tambah EventTrackingService, AnalyticsService, AnalyticsController, EventIngestionController, TrackUserEvent job, ProcessDormantUsers command, UserEvent model di API Modules table. Tambah info tentang dual approach (trackEvent vs trackEventAsync) dan Redis queue usage
    - Update Postman collection `postman/Lingkar_ID_API.postman_collection.json`: tambah semua endpoint baru. Validate JSON setelah edit: `python3 -c "import json; json.load(open('postman/Lingkar_ID_API.postman_collection.json')); print('Valid')"`
    - _Requirements: 1.1, 3.1, 6.1, 7.1, 8.1, 9.1_

  - [x] 23.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul User Journey Funnel (funnel overview, user segments, event log, dashboard widget)
    - Update `docs/ARCHITECTURE.md`: tambah analytics service layer, routing updates, Analytics nav group, dashboard widget, funnel/segments/event log pages
    - Update `README.md`: tambah User Journey Funnel ke Feature Status table
    - Update `CLAUDE.md`: tambah info Analytics pages, service layer, sidebar Analytics group, dashboard journey widget, EventTrackingService dual approach
    - _Requirements: 10.6, 12.7, 13.5, 14.1_

- [x] 24. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks bertanda `*` bersifat opsional dan bisa di-skip untuk implementasi lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- Backend core tasks (1-7) harus diselesaikan sebelum backend analytics tasks (8-14) karena analytics bergantung pada UserEvent model dan EventTrackingService
- Backend tasks harus diselesaikan sebelum frontend tasks karena frontend bergantung pada API baru
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests memvalidasi 16 correctness properties dari design document
- **Dual approach event tracking:**
  - `trackEvent()` — synchronous direct write untuk lifecycle events (user_registered, email_verified, first_deposit, first_transaction). Low-volume, harus transactional dengan aksi pemicu
  - `trackEventAsync()` — dispatch `TrackUserEvent` job ke Redis queue untuk high-frequency mobile events (app_opened, banner_clicked, service_viewed). Diproses oleh existing worker container (`laravel-worker` running `php artisan queue:work redis`)
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, FormTextarea, Badge, TableCard, DetailCard, StatCard, ChartCard, BarChartComponent, SearchInput, FilterPopup) — jangan gunakan native HTML elements
- Chart colors: selalu gunakan `CHART_COLORS`/`CHART_SETS` dari `chart-colors.ts`, jangan hardcode hex
- CSV export menggunakan `StreamedResponse` di backend dan `URL.createObjectURL` + download trigger di frontend
- Dormancy scheduler (`users:process-dormant`) harus di-register untuk run daily via Laravel scheduler
- Route `/backoffice/analytics/segments/export` HARUS didefinisikan sebelum `/backoffice/analytics/segments/{stage}` di routes/api.php untuk menghindari route conflict
