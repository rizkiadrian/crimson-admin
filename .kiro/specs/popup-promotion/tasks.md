# Implementation Plan: In-App Popup Promotion Management

## Overview

Implementasi fitur In-App Popup Promotion Management untuk marketing module. Mencakup backend (Laravel — `lingkar-id-backend/`) dan frontend (Next.js — `lingkar-crm/`). Backend dikerjakan terlebih dahulu karena frontend bergantung pada API.

Fitur dibagi menjadi 3 fase:

1. **Event Registry** — master data event (prerequisite untuk trigger rules)
2. **Popup Promotions** — CRUD, targeting, scheduling, A/B testing
3. **Analytics & Dashboard** — tracking, metrics, charts

> **Skills referenced:** `fullstack-feature-pattern`, `new-feature-checklist`, `component-rules`, `state-management-patterns`, `error-handling-patterns`, `testing-workflows`, `documentation-update-guide`

## Tasks

### Phase 1: Event Registry

- [x] 1. Backend: Migration dan Model — Event Registry
  - [x] 1.1 Buat migration `create_event_registry_table`
    - Kolom: `id` (bigint, PK, auto-increment), `key` (varchar 100, not null, unique), `label` (varchar 200, not null), `category` (enum: `lifecycle`, `engagement`, `marketing`, `transaction`), `description` (text, nullable), `is_system` (boolean, default false), `is_active` (boolean, default true), `timestamps`
    - _Requirements: 12_

  - [x] 1.2 Buat model `EventRegistry` di `app/Models/EventRegistry.php`
    - `$fillable`: `key`, `label`, `category`, `description`, `is_system`, `is_active`
    - `$casts`: `is_system` → boolean, `is_active` → boolean
    - Scope: `scopeSystem($query)`, `scopeCustom($query)`, `scopeActive($query)`, `scopeOfCategory($query, ?string $category)`
    - _Requirements: 12_

  - [x] 1.3 Buat seeder `EventRegistrySeeder`
    - System events (is_system=true): `user_registered` (lifecycle), `email_verified` (lifecycle), `first_deposit` (lifecycle), `first_transaction` (lifecycle)
    - Default custom events (is_system=false): `page_viewed` (engagement), `app_opened` (engagement), `service_viewed` (engagement), `banner_clicked` (marketing)
    - _Requirements: 12_

- [x] 2. Backend: Service, Controller, Routes — Event Registry
  - [x] 2.1 Buat `StoreEventRegistryRequest`
    - Rules: `key` → required|string|max:100|unique:event*registry,key|regex:/^[a-z]a-z0-9*]\*$/; `label` → required|string|max:200; `category` → required|in:engagement,marketing,transaction; `description` → nullable|string|max:500; `is_active` → nullable|boolean
    - _Requirements: 12_

  - [x] 2.2 Buat `UpdateEventRegistryRequest`
    - Sama tapi key unique ignore current ID
    - _Requirements: 12_

  - [x] 2.3 Buat `EventRegistryService` di `app/Services/Marketing/EventRegistryService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllEvents(params)` (filter by category, is_system), `createEvent(data)` (validate not system key), `updateEvent(event, data)` (block system events), `deleteEvent(event)` (block system events), `validateEventKey(key): bool` (exists and is_active)
    - _Requirements: 12_

  - [x] 2.4 Buat `EventRegistryController` di `app/Http/Controllers/Api/v1/Marketing/EventRegistryController.php`
    - Inject `EventRegistryService`
    - Methods: `index()`, `store(StoreEventRegistryRequest)`, `update(UpdateEventRegistryRequest, EventRegistry)`, `destroy(EventRegistry)`
    - _Requirements: 12_

  - [x] 2.5 Tambah routes di `routes/api.php`
    - Marketing routes (prefix `marketing`, middleware `role:admin,marketing`):
      - `apiResource('event-registry', EventRegistryController::class)->except(['show'])`
    - _Requirements: 12_

- [x] 3. Frontend: Service Layer — Event Registry
  - [x] 3.1 Buat types di `src/services/marketing/event-registry/event-registry.types.ts`
    - Interfaces: `IEventRegistry`, `IEventRegistryParams`, `IEventRegistryCreatePayload`, `IEventRegistryUpdatePayload`
    - _Requirements: 12_

  - [x] 3.2 Buat service di `src/services/marketing/event-registry/event-registry.service.ts`
    - Methods: `getAll(params)`, `create(payload)`, `update(id, payload)`, `delete(id)`
    - _Requirements: 12_

  - [x] 3.3 Buat `src/services/marketing/event-registry/index.ts` barrel export
    - _Requirements: 12_

- [x] 4. Frontend: Event Registry Pages
  - [x] 4.1 Buat list page `src/app/(dashboard)/dashboard/event-registry/page.tsx`
    - TableCard with columns: key, label, category badge, system/custom badge, status, actions
    - System events: no edit/delete actions
    - Custom events: edit/delete actions
    - Filter by category
    - Use `useTableData` hook
    - _Requirements: 12, 15_

  - [x] 4.2 Buat create page `src/app/(dashboard)/dashboard/event-registry/create/page.tsx`
    - FormCard with fields: key (slug input), label, category (select), description (textarea), is_active (toggle)
    - Validation: key format (lowercase, underscores only)
    - _Requirements: 12, 15_

  - [x] 4.3 Buat edit page `src/app/(dashboard)/dashboard/event-registry/[id]/edit/page.tsx`
    - Same as create, pre-filled via `useDetailData`
    - _Requirements: 12, 15_

### Phase 2: Popup Promotions — Core CRUD

- [x] 5. Backend: Migration dan Model — Popup Promotions
  - [x] 5.1 Buat migration `create_popup_promotions_table`
    - Kolom: `id` (uuid, PK), `name` (varchar 200, not null), `content_type` (enum: `template`, `image`, `canvas`, `html`), `content_config` (json, nullable), `status` (enum: `draft`, `scheduled`, `active`, `paused`, `ended`, default `draft`), `priority` (int, default 0), `trigger_config` (json, nullable), `target_config` (json, nullable), `schedule_config` (json, nullable), `frequency_cap` (json, nullable), `linked_action` (json, nullable), `ab_variant` (varchar 10, nullable), `ab_group_id` (uuid, nullable), `timestamps`, `softDeletes`
    - Index pada `['status']`, `['ab_group_id']`
    - _Requirements: 1, 2_

  - [x] 5.2 Buat migration `create_popup_events_table`
    - Kolom: `id` (bigint, PK, auto-increment), `popup_id` (uuid, FK → popup_promotions.id), `user_id` (uuid, nullable), `event_type` (enum: `impression`, `click`, `dismiss`, `conversion`), `device_type` (varchar 20, nullable), `metadata` (json, nullable), `created_at` (timestamp)
    - Index pada `['popup_id', 'event_type']`, `['user_id', 'popup_id']`
    - _Requirements: 11_

  - [x] 5.3 Buat migration `create_popup_ab_assignments_table`
    - Kolom: `id` (bigint, PK, auto-increment), `user_id` (uuid, not null), `ab_group_id` (uuid, not null), `variant` (varchar 10, not null), `assigned_at` (timestamp, not null)
    - Unique constraint: `(user_id, ab_group_id)`
    - _Requirements: 10_

  - [x] 5.4 Buat model `PopupPromotion` di `app/Models/PopupPromotion.php`
    - `$fillable`: all fields except id, timestamps, deleted_at
    - `$casts`: `content_config` → array, `trigger_config` → array, `target_config` → array, `schedule_config` → array, `frequency_cap` → array, `linked_action` → array
    - Use `SoftDeletes`, `HasUuids` traits
    - Relations: `hasMany(PopupEvent::class, 'popup_id')`, `abVariants()` → same ab_group_id
    - Scopes: `scopeOfStatus`, `scopeOfContentType`, `scopeOfUserType` (JSON where on target_config), `scopeActive`, `scopeScheduled`
    - _Requirements: 1, 2_

  - [x] 5.5 Buat model `PopupEvent` di `app/Models/PopupEvent.php`
    - `$fillable`: `popup_id`, `user_id`, `event_type`, `device_type`, `metadata`
    - `$casts`: `metadata` → array
    - `$timestamps = false` (only created_at)
    - Relation: `belongsTo(PopupPromotion::class, 'popup_id')`
    - _Requirements: 11_

  - [x] 5.6 Buat model `PopupAbAssignment` di `app/Models/PopupAbAssignment.php`
    - `$fillable`: `user_id`, `ab_group_id`, `variant`, `assigned_at`
    - `$timestamps = false`
    - _Requirements: 10_

- [x] 6. Backend: FormRequests — Popup Promotions
  - [x] 6.1 Buat `StorePopupPromotionRequest`
    - Rules: `name` → required|string|max:200; `content_type` → required|in:template,image,canvas,html; `content_config` → nullable|array; `priority` → nullable|integer|min:0; `trigger_config` → nullable|array; `target_config` → nullable|array; `schedule_config` → nullable|array; `frequency_cap` → nullable|array; `linked_action` → nullable|array
    - _Requirements: 1_

  - [x] 6.2 Buat `UpdatePopupPromotionRequest`
    - Sama seperti Store
    - _Requirements: 1_

  - [x] 6.3 Buat `ChangePopupStatusRequest`
    - Rules: `status` → required|in:scheduled,active,paused,ended
    - _Requirements: 2_

- [x] 7. Backend: Services — Popup Promotions
  - [x] 7.1 Buat `PopupPromotionService` di `app/Services/Marketing/PopupPromotionService.php`
    - Use `ApiPaginationTrait`
    - Methods: `getAllPopups(params)`, `getPopupById(id)`, `createPopup(data)`, `updatePopup(popup, data)`, `deletePopup(popup)`, `changeStatus(popup, newStatus)` (validate transitions), `duplicatePopup(popup)`, `createABVariant(popup)`, `activateScheduledPopups()`, `endExpiredPopups()`
    - Image handling: store uploaded images for image mode content_config
    - _Requirements: 1, 2, 10_

  - [x] 7.2 Buat `TargetingEngine` di `app/Services/Marketing/TargetingEngine.php`
    - Methods: `getEligiblePopup(user, context)`, `matchesTarget(popup, user)`, `matchesSchedule(popup, now)`, `matchesFrequencyCap(popup, user)`, `matchesTrigger(popup, event)`
    - Metadata matching: implement operators (equals, not_equals, in, contains, exists)
    - _Requirements: 7, 8, 9, 13, 16_

  - [x] 7.3 Buat `ABTestService` di `app/Services/Marketing/ABTestService.php`
    - Methods: `getOrAssignVariant(userId, abGroupId)` (sticky 50/50 random), `getComparisonMetrics(abGroupId)`
    - _Requirements: 10_

  - [x] 7.4 Buat `PopupAnalyticsService` di `app/Services/Marketing/PopupAnalyticsService.php`
    - Methods: `getAggregateMetrics(popupId, dateRange)`, `getTimeline(popupId, granularity)`, `getBreakdown(popupId, dimension)`, `trackEvent(popupId, userId, eventType, deviceType, metadata)`, `checkConversion(popupId, userId, linkedAction, attributionWindow)`
    - _Requirements: 11_

- [x] 8. Backend: Controllers dan Routes — Popup Promotions
  - [x] 8.1 Buat `PopupPromotionController` di `app/Http/Controllers/Api/v1/Marketing/PopupPromotionController.php`
    - Inject `PopupPromotionService`
    - Methods: `index()`, `show(id)`, `store(StorePopupPromotionRequest)`, `update(UpdatePopupPromotionRequest, PopupPromotion)`, `destroy(PopupPromotion)`, `changeStatus(ChangePopupStatusRequest, PopupPromotion)`, `duplicate(PopupPromotion)`, `createABVariant(PopupPromotion)`
    - _Requirements: 1, 2, 10_

  - [x] 8.2 Buat `PopupAnalyticsController` di `app/Http/Controllers/Api/v1/Marketing/PopupAnalyticsController.php`
    - Inject `PopupAnalyticsService`, `ABTestService`
    - Methods: `analytics(PopupPromotion)`, `timeline(PopupPromotion)`, `breakdown(PopupPromotion)`, `compare(PopupPromotion)`
    - _Requirements: 11_

  - [x] 8.3 Buat `ClientPopupController` di `app/Http/Controllers/Api/v1/Client/ClientPopupController.php`
    - Inject `TargetingEngine`, `ABTestService`, `PopupAnalyticsService`
    - Methods: `eligible(Request)`, `impression(PopupPromotion)`, `click(PopupPromotion)`, `dismiss(PopupPromotion)`
    - _Requirements: 13, 14_

  - [x] 8.4 Buat `ClientEventController` di `app/Http/Controllers/Api/v1/Client/ClientEventController.php`
    - Inject `EventRegistryService`
    - Methods: `store(Request)` — validate event_key exists and is active, store event
    - _Requirements: 14_

  - [x] 8.5 Tambah routes di `routes/api.php`
    - Marketing routes (prefix `marketing`, middleware `role:admin,marketing`):
      - `apiResource('popup-promotions', PopupPromotionController::class)`
      - `PATCH /popup-promotions/{popup}/status` → `changeStatus`
      - `POST /popup-promotions/{popup}/duplicate` → `duplicate`
      - `POST /popup-promotions/{popup}/ab-variant` → `createABVariant`
      - `GET /popup-promotions/{popup}/analytics` → `PopupAnalyticsController@analytics`
      - `GET /popup-promotions/{popup}/analytics/timeline` → `PopupAnalyticsController@timeline`
      - `GET /popup-promotions/{popup}/analytics/breakdown` → `PopupAnalyticsController@breakdown`
      - `GET /popup-promotions/{popup}/compare` → `PopupAnalyticsController@compare`
    - Client routes (prefix `client`, middleware `auth:sanctum`):
      - `GET /popups/eligible` → `ClientPopupController@eligible`
      - `POST /popups/{popup}/impression` → `ClientPopupController@impression`
      - `POST /popups/{popup}/click` → `ClientPopupController@click`
      - `POST /popups/{popup}/dismiss` → `ClientPopupController@dismiss`
      - `POST /events` → `ClientEventController@store`
    - _Requirements: 1, 2, 10, 11, 13, 14_

- [x] 9. Backend: Scheduled Tasks
  - [x] 9.1 Register scheduled tasks di `app/Console/Kernel.php`
    - `PopupPromotionService::activateScheduledPopups()` — every minute
    - `PopupPromotionService::endExpiredPopups()` — every minute
    - _Requirements: 2_

### Phase 3: Frontend — Popup Promotions

- [x] 10. Frontend: Service Layer — Popup Promotions
  - [x] 10.1 Buat types di `src/services/marketing/popup-promotions/popup-promotions.types.ts`
    - Interfaces: `IPopupPromotion`, `IPopupPromotionDetail`, `IPopupPromotionParams`, `IPopupPromotionCreatePayload`, `IPopupPromotionUpdatePayload`, `IPopupAnalytics`, `IPopupTimeline`, `IPopupBreakdown`, `IPopupABComparison`
    - Enums/types: `PopupContentType`, `PopupStatus`, `TriggerType`, `MetadataOperator`
    - _Requirements: 1, 11_

  - [x] 10.2 Buat service di `src/services/marketing/popup-promotions/popup-promotions.service.ts`
    - Methods: `getAll(params)`, `getById(id)`, `create(payload)`, `update(id, payload)`, `delete(id)`, `changeStatus(id, status)`, `duplicate(id)`, `createABVariant(id)`, `getAnalytics(id)`, `getTimeline(id, params)`, `getBreakdown(id, params)`, `getCompare(id)`
    - _Requirements: 1, 11_

  - [x] 10.3 Buat `src/services/marketing/popup-promotions/index.ts` barrel export
    - _Requirements: 1_

- [x] 11. Frontend: Popup Editor Components
  - [x] 11.1 Buat `src/app/components/ui/PopupEditor/PopupCanvasEditor.tsx`
    - Extend BannerEditor CanvasEditor pattern
    - Vertical aspect ratio (3:4)
    - Support elements: text, image, CTA button, shape, close button
    - Drag & drop with free positioning
    - _Requirements: 5_

  - [x] 11.2 Buat `src/app/components/ui/PopupEditor/PopupElementPanel.tsx`
    - Form-based property panel for selected element
    - Position (x, y), size (w, h), opacity, element-specific props
    - _Requirements: 5_

  - [x] 11.3 Buat `src/app/components/ui/PopupEditor/PopupColorPicker.tsx`
    - 3-level: preset swatches, hex input, visual picker (hue + saturation/brightness)
    - RGBA support with opacity slider
    - _Requirements: 5_

  - [x] 11.4 Buat `src/app/components/ui/PopupEditor/PopupGradientEditor.tsx`
    - 2-4 color stops, draggable positions
    - Direction: linear (angle 0-360°) or radial
    - Per-stop hex input or color picker
    - Live preview
    - _Requirements: 5_

  - [x] 11.5 Buat `src/app/components/ui/PopupEditor/PopupBackgroundSelector.tsx`
    - Modes: solid, gradient, image upload, pattern/texture
    - Uses PopupColorPicker and PopupGradientEditor
    - _Requirements: 5_

  - [x] 11.6 Buat `src/app/components/ui/PopupEditor/PopupTemplateSelector.tsx`
    - Template gallery: Welcome Offer, Flash Sale, Voucher Promo, Announcement
    - Slot forms per template (headline, subtext, image, CTA, theme color)
    - _Requirements: 3_

  - [x] 11.7 Buat `src/app/components/ui/PopupEditor/PopupHtmlEditor.tsx`
    - Monaco or CodeMirror with syntax highlighting
    - Split view: code left, live preview right
    - Template variable hints: `{{user_name}}`, `{{voucher_code}}`, `{{deeplink}}`
    - _Requirements: 6_

  - [x] 11.8 Buat `src/app/components/ui/PopupEditor/PopupPreviewModal.tsx`
    - Mobile frame mockup showing popup preview
    - Renders based on content_type
    - _Requirements: 5, 15_

  - [x] 11.9 Buat `src/app/components/ui/PopupEditor/index.ts` barrel export
    - _Requirements: 3, 4, 5, 6_

- [x] 12. Frontend: Popup Promotions Pages
  - [x] 12.1 Buat list page `src/app/(dashboard)/dashboard/popup-promotions/page.tsx`
    - TableCard with columns: name, content_type badge, status badge, priority, impressions, CTR, actions
    - Quick actions: pause/resume (status change), duplicate, delete
    - Filters: status, content_type, user_type, date range
    - Use `useTableData` hook
    - _Requirements: 1, 15_

  - [x] 12.2 Buat create page `src/app/(dashboard)/dashboard/popup-promotions/create/page.tsx`
    - Multi-step wizard with step navigation
    - Step 1: BasicInfoStep (name, content_type select, priority)
    - Step 2: ContentStep (conditional render based on content_type)
    - Step 3: TargetingStep (user_types, journey_stages, platforms, segment_ids, trigger rules builder, frequency cap)
    - Step 4: SchedulingStep (start_date, end_date, time_window, days_of_week, A/B toggle)
    - Step 5: ReviewStep (summary of all config, preview button, save draft / schedule actions)
    - _Requirements: 1, 3, 4, 5, 6, 7, 8, 9, 15_

  - [x] 12.3 Buat edit page `src/app/(dashboard)/dashboard/popup-promotions/[id]/edit/page.tsx`
    - Same wizard as create, pre-filled via `useDetailData`
    - Page + Inner Form split pattern (React 19 compliance)
    - _Requirements: 1, 15_

  - [x] 12.4 Buat detail page `src/app/(dashboard)/dashboard/popup-promotions/[id]/page.tsx`
    - Config summary section (content type, targeting, schedule, frequency cap)
    - Analytics section: StatCards (impressions, clicks, CTR, conversions, CVR)
    - Line chart: timeline
    - Bar charts: breakdown by device, journey stage, time of day
    - Quick actions: edit, pause/resume, duplicate, create A/B variant
    - _Requirements: 11, 15_

  - [x] 12.5 Buat A/B compare page `src/app/(dashboard)/dashboard/popup-promotions/[id]/compare/page.tsx`
    - Side-by-side metrics: variant A vs B
    - StatCards per variant
    - Comparison chart
    - Winner recommendation text
    - _Requirements: 10, 15_

- [x] 13. Frontend: Trigger Rules Builder Component
  - [x] 13.1 Buat `src/app/(dashboard)/dashboard/popup-promotions/_partials/TriggerRulesBuilder.tsx`
    - Dynamic form: add/remove trigger rules
    - Per rule: type select (immediate, delay, scroll_depth, exit_intent, session_count, inactivity, event)
    - Event type: event_key dropdown (from event registry API), metadata conditions builder
    - Metadata condition: field input, operator select, value input
    - _Requirements: 8_

- [x] 14. Frontend: Navigation & Routing
  - [x] 14.1 Update `src/config/routing.ts`
    - Add `POPUP_PROMOTION_SERVICES` and `EVENT_REGISTRY_SERVICES` path constants
    - _Requirements: 15_

  - [x] 14.2 Update `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Add "Popup Promotions" (icon: Layers) and "Event Registry" (icon: Zap) to `MARKETING_NAV`
    - _Requirements: 15_

- [x] 15. Frontend: Marketing Dashboard Widget Update
  - [x] 15.1 Update `src/app/(dashboard)/marketing-dashboard/page.tsx`
    - Add StatCard: "Active Popups" with total impressions
    - Add StatCard: "Popup Conversions" this month
    - _Requirements: 11_

  - [x] 15.2 Update `src/services/marketing/dashboard/marketing-dashboard.types.ts`
    - Add `IMarketingPopupStats` interface: `active_count`, `total_impressions`, `conversions_this_month`
    - Add to `IMarketingDashboardData`
    - _Requirements: 11_

### Phase 4: Backend Property Tests

- [x] 16. Backend: Property-based Tests
  - [x] 16.1 Write property test untuk Popup CRUD dan soft-delete
    - **Property 1: Popup CRUD operations and soft-delete exclusion**
    - Create popup, verify appears in list. Soft-delete, verify excluded from list and detail returns 404. Verify duplicate creates new popup with status=draft.
    - Buat test file di `tests/Feature/Marketing/PopupPromotionTest.php`
    - **Validates: Requirements 1**

  - [x] 16.2 Write property test untuk status lifecycle transitions
    - **Property 2: Popup status transitions are valid and enforced**
    - Test valid transitions: draft→scheduled (with start_date), scheduled→active (auto), active→paused, paused→active, active→ended. Test invalid transitions are rejected (e.g., draft→active, ended→active).
    - **Validates: Requirements 2**

  - [x] 16.3 Write property test untuk scheduled activation dan expiration
    - **Property 3: Scheduled popups auto-activate and active popups auto-end**
    - Create scheduled popups with various start_dates (past, future), run activateScheduledPopups(), verify only past-due transition to active. Create active popups with end_dates, run endExpiredPopups(), verify only expired transition to ended.
    - **Validates: Requirements 2**

  - [x] 16.4 Write property test untuk targeting engine — user type matching
    - **Property 4: Targeting engine correctly filters by user type and journey stage**
    - Create popups targeting client-only, mitra-only, both. Request eligible as client user → only client/both popups returned. Request as mitra → only mitra/both. Test journey stage filtering similarly.
    - **Validates: Requirements 7, 13**

  - [x] 16.5 Write property test untuk targeting engine — frequency cap
    - **Property 5: Frequency cap correctly limits popup display**
    - Create popup with max_lifetime=2. Track 2 impressions for user. Request eligible → popup not returned. Create popup with max_per_day=1, track 1 impression today → not eligible today, eligible tomorrow.
    - **Validates: Requirements 9, 13, 16**

  - [x] 16.6 Write property test untuk targeting engine — scheduling window
    - **Property 6: Schedule config correctly filters by time window and days of week**
    - Create popup with time_window 08:00-22:00, days_of_week [1,2,3,4,5]. Test eligible at Monday 10:00 → yes. Test at Sunday 10:00 → no. Test at Monday 23:00 → no.
    - **Validates: Requirements 9, 13**

  - [x] 16.7 Write property test untuk A/B testing assignment
    - **Property 7: A/B assignment is sticky and respects unique constraint**
    - Create A/B group. Assign user → get variant. Request again → same variant returned. Verify (user_id, ab_group_id) unique constraint prevents duplicate assignments. Verify ~50/50 distribution over 100 random assignments.
    - **Validates: Requirements 10**

  - [x] 16.8 Write property test untuk event-based trigger dengan metadata matching
    - **Property 8: Event-based triggers correctly match metadata conditions**
    - Create popup with trigger: event_key=page_viewed, metadata_conditions=[{field:screen, operator:equals, value:home}]. Fire event with screen=home → popup eligible. Fire with screen=profile → not eligible. Test operators: in, contains, not_equals, exists.
    - **Validates: Requirements 8**

  - [x] 16.9 Write property test untuk Event Registry CRUD dan system event protection
    - **Property 9: Event Registry protects system events from modification**
    - Attempt update/delete on system event → 403/422 rejected. Create custom event → success. Update/delete custom event → success. Verify key uniqueness constraint.
    - Buat test file di `tests/Feature/Marketing/EventRegistryTest.php`
    - **Validates: Requirements 12**

  - [x] 16.10 Write property test untuk event ingestion validation
    - **Property 10: Event ingestion validates event_key exists and is active**
    - Fire event with valid active key → 200. Fire with non-existent key → 422. Fire with inactive key → 422. Fire system event key → 200 (system events always active).
    - Buat test file di `tests/Feature/Client/ClientEventTest.php`
    - **Validates: Requirements 14**

  - [x] 16.11 Write property test untuk popup analytics tracking
    - **Property 11: Popup events are correctly tracked and aggregated**
    - Track impression, click, dismiss for a popup. Query analytics → verify counts match. Track conversion within attribution window → counted. Track conversion outside window → not counted.
    - Buat test file di `tests/Feature/Marketing/PopupAnalyticsTest.php`
    - **Validates: Requirements 11**

  - [x] 16.12 Write property test untuk priority conflict resolution
    - **Property 12: Eligible endpoint returns highest priority popup only**
    - Create 3 eligible popups with priority 1, 5, 3. Request eligible → returns priority 5. Pause priority 5 → returns priority 3. Verify only 1 popup returned per request.
    - **Validates: Requirements 16**

- [x] 17. Checkpoint — Backend tests selesai
  - Jalankan `php artisan test` — semua pass
  - Verify routes via `route:list --path=marketing`
  - Curl test: create popup, change status, get eligible
  - _Requirements: 1, 2, 7, 8, 9, 10, 11, 12, 13, 14, 16_

### Phase 5: Frontend Unit Tests

- [x] 18. Frontend: Service Layer Unit Tests
  - [x] 18.1 Write unit tests untuk popup-promotions service
    - Test `getAll()` calls correct endpoint with params
    - Test `getById()` calls correct endpoint
    - Test `create()` sends correct payload
    - Test `changeStatus()` calls PATCH with status
    - Test `duplicate()` calls POST duplicate endpoint
    - Test `createABVariant()` calls POST ab-variant endpoint
    - Test `getAnalytics()`, `getTimeline()`, `getBreakdown()`, `getCompare()` call correct endpoints
    - Buat test file di `src/services/marketing/popup-promotions/__tests__/popup-promotions.service.test.ts`
    - **Validates: Requirements 1, 10, 11**

  - [x] 18.2 Write unit tests untuk event-registry service
    - Test `getAll()` calls correct endpoint with params (category, is_system filters)
    - Test `create()` sends correct payload
    - Test `update()` calls PUT with correct id
    - Test `delete()` calls DELETE with correct id
    - Buat test file di `src/services/marketing/event-registry/__tests__/event-registry.service.test.ts`
    - **Validates: Requirements 12**

- [x] 19. Frontend: Property Tests
  - [x] 19.1 Write property test untuk trigger_config JSON round-trip
    - **Property 1: trigger_config JSON serialization round-trip**
    - Generate arbitrary trigger configs (various types, metadata conditions with all operators), serialize to JSON and back, verify deep equality.
    - Buat test file di `src/services/marketing/popup-promotions/__tests__/popup-promotions.properties.test.ts`
    - **Validates: Requirements 8**

  - [x] 19.2 Write property test untuk target_config JSON round-trip
    - **Property 2: target_config JSON serialization round-trip**
    - Generate arbitrary target configs (user_types, journey_stages, platforms, segment_ids combinations), serialize and deserialize, verify equality.
    - **Validates: Requirements 7**

  - [x] 19.3 Write property test untuk schedule_config validation
    - **Property 3: schedule_config time_window and days_of_week constraints**
    - Generate time_windows where start < end (valid) and start >= end (invalid). Generate days_of_week with values 0-6 (valid) and outside range (invalid). Verify validation logic.
    - **Validates: Requirements 9**

  - [x] 19.4 Write property test untuk metadata_conditions operator logic
    - **Property 4: Metadata condition operators produce correct boolean results**
    - Generate arbitrary field values and test each operator: equals (exact match), not_equals (negation), in (array membership), contains (substring), exists (field presence). Verify correctness.
    - **Validates: Requirements 8**

- [x] 20. Frontend: Page Unit Tests
  - [x] 20.1 Write unit tests untuk popup-promotions list page
    - Test table renders with mock data (name, content_type badge, status badge, priority, impressions, CTR)
    - Test filter functionality (status chips, content_type select, date range)
    - Test quick actions: pause/resume calls changeStatus, duplicate calls duplicate, delete shows confirm dialog
    - Test status badge rendering (draft=neutral, scheduled=primary, active=success, paused=warning, ended=error)
    - Buat test file di `src/__tests__/popup-promotions/popup-list.test.tsx`
    - **Validates: Requirements 1, 15**

  - [x] 20.2 Write unit tests untuk popup create wizard
    - Test wizard step navigation (next/back buttons)
    - Test Step 1: name required, content_type select renders options
    - Test Step 2: conditional render based on content_type (template selector, image upload, canvas placeholder, HTML editor placeholder)
    - Test Step 3: user_types checkboxes, journey_stages checkboxes, platforms checkboxes, trigger rules builder renders
    - Test Step 4: date pickers render, A/B toggle
    - Test Step 5: review summary renders all config, submit calls create API
    - Test form validation errors display via handleFormError
    - Buat test file di `src/__tests__/popup-promotions/popup-wizard.test.tsx`
    - **Validates: Requirements 1, 3, 4, 5, 6, 7, 8, 9, 15**

  - [x] 20.3 Write unit tests untuk popup detail + analytics page
    - Test config summary section renders (content_type, targeting, schedule)
    - Test StatCards render with mock analytics data (impressions, clicks, CTR, conversions, CVR)
    - Test chart components render with timeline data
    - Test quick actions (edit, pause/resume, duplicate, create A/B variant)
    - Buat test file di `src/__tests__/popup-promotions/popup-detail.test.tsx`
    - **Validates: Requirements 11, 15**

  - [x] 20.4 Write unit tests untuk A/B compare page
    - Test side-by-side metrics render for variant A and B
    - Test winner recommendation text displays
    - Test handles case where no data yet (loading/empty state)
    - Buat test file di `src/__tests__/popup-promotions/popup-ab-compare.test.tsx`
    - **Validates: Requirements 10, 15**

  - [x] 20.5 Write unit tests untuk event registry list page
    - Test table renders system events with "System" badge (read-only, no actions)
    - Test table renders custom events with "Custom" badge (edit/delete actions)
    - Test filter by category
    - Test delete confirmation for custom events
    - Buat test file di `src/__tests__/popup-promotions/event-registry.test.tsx`
    - **Validates: Requirements 12, 15**

  - [x] 20.6 Write unit tests untuk event registry form
    - Test create form: key (slug format validation), label, category select, description, is_active toggle
    - Test edit form pre-fills from API
    - Test submit calls correct API method
    - Test validation errors display
    - Buat test file di `src/__tests__/popup-promotions/event-registry-form.test.tsx`
    - **Validates: Requirements 12, 15**

  - [x] 20.7 Write unit tests untuk TriggerRulesBuilder component
    - Test add/remove trigger rules
    - Test type select renders all trigger types
    - Test event-based type shows event_key dropdown and metadata conditions builder
    - Test metadata condition: add/remove conditions, operator select, value input
    - Buat test file di `src/__tests__/popup-promotions/trigger-rules-builder.test.tsx`
    - **Validates: Requirements 8**

- [x] 21. Checkpoint — Frontend tests selesai
  - Jalankan `npm run test:run` — semua pass
  - _Requirements: 1, 7, 8, 9, 10, 11, 12, 15_

### Phase 6: Documentation & Verification

- [x] 22. Documentation Updates
  - [x] 22.1 Update `docs/PRD.md`
    - Add FM-XX: Popup Promotion Management feature module
    - Add FM-XX: Event Registry feature module
    - _Requirements: 1-16_

  - [x] 22.2 Update `docs/ARCHITECTURE.md`
    - Add popup-promotions and event-registry to project structure
    - Document TargetingEngine and ABTestService
    - _Requirements: 1-16_

  - [x] 22.3 Update `docs/DESIGN_SYSTEM.md`
    - Add PopupEditor component documentation (PopupCanvasEditor, PopupColorPicker, PopupGradientEditor, etc.)
    - _Requirements: 5_

  - [x] 22.4 Update `README.md`
    - Add Popup Promotions and Event Registry to Feature Status table
    - _Requirements: 15_

  - [x] 22.5 Update Postman collection
    - Add "Popup Promotions" folder: CRUD, status change, duplicate, ab-variant, analytics endpoints
    - Add "Event Registry" folder: list, create, update, delete
    - Add "Client Popups" folder: eligible, impression, click, dismiss, events
    - Validate JSON: `python3 -m json.tool postman/Lingkar_ID_API.postman_collection.json > /dev/null`
    - _Requirements: 1, 11, 12, 13, 14_

- [x] 23. Final Verification
  - [x] 23.1 Run `php artisan test` — backend tests pass
    - _Requirements: all_

  - [x] 23.2 Run `npm run test:run` — frontend tests pass
    - _Requirements: all_

  - [x] 23.3 Run `npx tsc --noEmit` — no TypeScript errors
    - _Requirements: all_

  - [x] 23.4 Run `npm run build` — build succeeds
    - _Requirements: all_

  - [x] 23.5 Visual verification via dev server
    - Event Registry: list, create, edit pages
    - Popup Promotions: list, create wizard (all steps), edit, detail+analytics
    - Canvas editor: drag & drop, color picker, gradient editor
    - Marketing dashboard: new widgets
    - _Requirements: all_
