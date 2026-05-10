# Requirements Document

## Introduction

Fitur In-App Popup Promotion Management memungkinkan tim Marketing membuat, mengelola, dan menganalisis popup promosi yang ditampilkan di mobile app. Popup bisa dibuat melalui 4 mode (template, image upload, canvas editor, HTML code), dikonfigurasi dengan targeting audience dan trigger rules yang advanced, dijadwalkan, di-A/B test, dan di-track performanya secara lengkap. Fitur ini juga mencakup Event Registry sebagai master data event yang bisa di-track dan dipakai sebagai trigger popup.

Scope implementasi: Backend API (Laravel) dan CRM frontend (Next.js). Mobile app hanya consume API — tidak termasuk dalam scope implementasi ini.

## Glossary

- **Popup_Promotion**: Entitas utama — konfigurasi popup promosi yang ditampilkan di mobile app.
- **Content_Type**: Mode pembuatan konten popup: `template`, `image`, `canvas`, `html`.
- **Trigger_Rule**: Kondisi yang menentukan kapan popup muncul (delay, scroll, event-based, dll).
- **Target_Config**: Konfigurasi audience yang melihat popup (user type, journey stage, segment, device).
- **Frequency_Cap**: Batas berapa kali popup ditampilkan ke satu user.
- **Linked_Action**: Aksi yang terjadi saat user klik CTA (deeplink, voucher redeem, dll).
- **AB_Test**: Mekanisme membandingkan 2 variant popup untuk menentukan mana yang lebih efektif.
- **AB_Group**: Kumpulan variant popup yang sedang di-test bersama.
- **Event_Registry**: Master data event yang bisa di-track oleh mobile app dan dipakai sebagai trigger.
- **System_Event**: Event dari journey funnel backend (read-only): `user_registered`, `email_verified`, `first_deposit`, `first_transaction`.
- **Custom_Event**: Event yang di-fire mobile app dan bisa dikelola (CRUD) dari CRM: `page_viewed`, `app_opened`, dll.
- **Metadata_Condition**: Kondisi matching pada metadata event untuk trigger popup (misal: screen = "service_detail").
- **Attribution_Window**: Jangka waktu setelah klik popup di mana action dihitung sebagai conversion.
- **Canvas_Editor**: Editor visual drag & drop untuk membuat popup dengan free positioning elements.
- **Marketing_User**: Pengguna dengan role Marketing atau Admin yang memiliki akses ke fitur ini.

## Requirements

### Requirement 1: Popup Promotion CRUD

**User Story:** As a Marketing_User, I want to create, view, edit, and delete popup promotions, so that I can manage promotional content shown to mobile app users.

#### Acceptance Criteria

1. THE Popup API SHALL provide a paginated list endpoint with filters for status, content_type, user_type, and date range.
2. THE Popup API SHALL provide a detail endpoint that returns a single popup with all config fields.
3. WHEN a Marketing_User creates a popup, THE API SHALL require: name and content_type. All other fields are optional (defaults to draft status).
4. THE API SHALL validate that name is present and does not exceed 200 characters.
5. THE API SHALL validate that content_type is one of: `template`, `image`, `canvas`, `html`.
6. THE API SHALL validate that priority is a positive integer (default 0).
7. WHEN a Marketing_User deletes a popup, THE API SHALL soft-delete the record.
8. THE API SHALL provide a duplicate endpoint that clones a popup with status reset to draft.

### Requirement 2: Popup Status Lifecycle

**User Story:** As a Marketing_User, I want to control the lifecycle of popups (draft, schedule, activate, pause, end), so that I can manage when promotions are live.

#### Acceptance Criteria

1. WHEN a popup is created, THE API SHALL set its status to "draft" by default.
2. WHEN a Marketing_User sets a schedule (start_date), THE API SHALL transition status to "scheduled".
3. THE system SHALL automatically transition "scheduled" popups to "active" when start_date is reached.
4. WHEN a Marketing_User pauses an active popup, THE API SHALL set status to "paused".
5. WHEN a Marketing_User resumes a paused popup, THE API SHALL set status back to "active".
6. THE system SHALL automatically transition "active" popups to "ended" when end_date is reached.
7. WHEN a Marketing_User manually ends a popup, THE API SHALL set status to "ended".
8. THE API SHALL validate status transitions: only valid transitions are allowed (draft→scheduled, scheduled→active, active→paused, paused→active, active→ended).

### Requirement 3: Content Creation — Template Mode

**User Story:** As a Marketing_User, I want to create popups from pre-built templates, so that I can quickly launch promotions without design skills.

#### Acceptance Criteria

1. THE system SHALL provide at least 4 templates: Welcome Offer, Flash Sale, Voucher Promo, Announcement.
2. EACH template SHALL define slots: headline (required), subtext (optional), image (optional), CTA text (required), CTA action (required), theme color.
3. THE API SHALL validate that all required slots for the selected template are filled.
4. THE content_config for template mode SHALL store: template_id, slot values, and theme color.

### Requirement 4: Content Creation — Image Upload Mode

**User Story:** As a Marketing_User, I want to upload a pre-designed popup image, so that I can use custom designs created in external tools.

#### Acceptance Criteria

1. THE API SHALL accept image uploads in PNG, JPG, and WebP formats, max 5 MB.
2. THE API SHALL allow optional CTA button overlay configuration: position (x, y), text, action link.
3. THE API SHALL allow configurable close button position.
4. THE content_config for image mode SHALL store: image_path, image_url, cta_overlay (optional), close_button_position.

### Requirement 5: Content Creation — Canvas Editor Mode

**User Story:** As a Marketing_User, I want to design popups using a drag & drop canvas editor with full color control, so that I can create custom visual promotions.

#### Acceptance Criteria

1. THE canvas editor SHALL support vertical aspect ratios suitable for popup display (3:4 or 2:3).
2. THE canvas editor SHALL support draggable elements: Text, Image, CTA Button, Shape (rectangle, circle), Close button.
3. EACH element SHALL have configurable properties: position (x, y), size (width, height), opacity (0-100%).
4. THE color system SHALL support: preset swatches, hex input, visual color picker (hue + saturation/brightness), and RGBA alpha channel.
5. THE background system SHALL support: solid color, gradient (2-4 stops, linear 0-360° or radial, per-stop hex), image upload, and pattern/texture presets.
6. THE gradient editor SHALL allow adding/removing color stops, dragging stop positions, and configuring direction.
7. THE canvas editor SHALL require a close/dismiss button element on every popup.
8. THE content_config for canvas mode SHALL store: all element positions, properties, background config as JSON. Mobile app renders natively from this JSON.

### Requirement 6: Content Creation — HTML Code Mode

**User Story:** As a Marketing_User, I want to write custom HTML/CSS for popups, so that I can create complex layouts not possible with the canvas editor.

#### Acceptance Criteria

1. THE HTML editor SHALL provide syntax highlighting via Monaco or CodeMirror.
2. THE HTML editor SHALL show a live preview in split view.
3. THE system SHALL support template variables: `{{user_name}}`, `{{voucher_code}}`, `{{deeplink}}`.
4. THE system SHALL sanitize HTML to prevent XSS (strip script tags, event handlers).
5. THE system SHALL validate that the HTML contains a close/dismiss mechanism.
6. THE content_config for HTML mode SHALL store the sanitized HTML string. Mobile app renders via sandboxed WebView.

### Requirement 7: Targeting & Audience Configuration

**User Story:** As a Marketing_User, I want to target popups to specific user segments, so that promotions are relevant to the audience.

#### Acceptance Criteria

1. THE target_config SHALL support user_types filter: `client`, `mitra`, or both.
2. THE target_config SHALL support journey_stages filter using existing funnel stages: `registered`, `verified`, `funded`, `active`.
3. THE target_config SHALL support registered_within_days filter for targeting new users.
4. THE target_config SHALL support platforms filter: `android`, `ios`.
5. THE target_config SHALL support segment_ids filter referencing existing analytics segments.
6. ALL target conditions SHALL be combined with AND logic.

### Requirement 8: Trigger Rules Configuration

**User Story:** As a Marketing_User, I want to configure when popups appear based on user behavior and events, so that promotions are shown at the right moment.

#### Acceptance Criteria

1. THE trigger_config SHALL support trigger types: immediate, delay (seconds), scroll_depth (percent), exit_intent, session_count, inactivity (seconds), event-based.
2. THE event-based trigger SHALL reference an event_key from the Event Registry.
3. THE event-based trigger SHALL support metadata_conditions with operators: `equals`, `not_equals`, `in`, `contains`, `exists`.
4. MULTIPLE triggers SHALL be combinable with AND logic.
5. THE API SHALL validate that referenced event_keys exist in the Event Registry.

### Requirement 9: Scheduling & Frequency Cap

**User Story:** As a Marketing_User, I want to schedule popups and limit how often they appear, so that users are not overwhelmed.

#### Acceptance Criteria

1. THE schedule_config SHALL support: start_date, end_date (nullable), time_window (start HH:mm, end HH:mm), days_of_week (array of 0-6, nullable).
2. THE frequency_cap SHALL support: max_per_day, max_per_session, max_lifetime, cooldown_minutes. All nullable (null = unlimited).
3. THE API SHALL validate that start_date is not in the past when scheduling.
4. THE API SHALL validate that end_date is after start_date when provided.

### Requirement 10: A/B Testing

**User Story:** As a Marketing_User, I want to A/B test popup variants, so that I can determine which design or message performs better.

#### Acceptance Criteria

1. THE API SHALL provide an endpoint to create a variant B from an existing popup (clone with ab_variant="B").
2. WHEN variant B is created, THE system SHALL generate an ab_group_id and assign it to both variants.
3. THE mobile app eligible endpoint SHALL assign users to variants randomly (50/50 split) and persist the assignment.
4. THE assignment SHALL be sticky: same user always sees the same variant for a given ab_group_id.
5. THE API SHALL provide a comparison endpoint returning side-by-side metrics for both variants.
6. THE unique constraint (user_id, ab_group_id) SHALL prevent duplicate assignments.

### Requirement 11: Analytics & Performance Tracking

**User Story:** As a Marketing_User, I want to see detailed performance metrics for each popup, so that I can measure effectiveness and optimize campaigns.

#### Acceptance Criteria

1. THE system SHALL track events: impression, click, dismiss, conversion per popup per user.
2. THE analytics endpoint SHALL return aggregate metrics: impressions, clicks, CTR, dismissals, dismiss_rate, conversions, CVR.
3. THE analytics timeline endpoint SHALL return daily/weekly data for chart rendering.
4. THE analytics breakdown endpoint SHALL return metrics grouped by: device_type, journey_stage, time_of_day.
5. CONVERSION tracking SHALL use an attribution_window (configurable per popup, default 24 hours) — if user completes linked_action within the window after clicking, it counts as conversion.
6. THE marketing dashboard SHALL display additional widgets: Active Popups count, Popup Conversions this month, top performing popups by CVR.

### Requirement 12: Event Registry

**User Story:** As a Marketing_User, I want to manage a registry of trackable events, so that I can use them as popup triggers and track user behavior.

#### Acceptance Criteria

1. THE Event Registry API SHALL provide a list endpoint showing both system events and custom events.
2. System events (journey funnel: `user_registered`, `email_verified`, `first_deposit`, `first_transaction`) SHALL be read-only — cannot be edited or deleted.
3. Custom events (`page_viewed`, `app_opened`, `service_viewed`, `banner_clicked`, and user-created) SHALL support full CRUD.
4. WHEN creating a custom event, THE API SHALL require: key (slug, unique), label, category (`engagement`/`marketing`/`transaction`). Optional: description, is_active (default true).
5. THE API SHALL validate that event key is unique, lowercase, uses underscores, and does not exceed 100 characters.
6. THE API SHALL prevent deletion of system events, returning an appropriate error.
7. THE API SHALL seed default custom events on first deployment: `page_viewed`, `app_opened`, `service_viewed`, `banner_clicked`.

### Requirement 13: Mobile App API — Popup Delivery

**User Story:** As a mobile app, I want to fetch eligible popups for the current user, so that I can display them at the right time.

#### Acceptance Criteria

1. THE eligible endpoint SHALL return popups matching: user's type, journey stage, device platform, segment membership, scheduling window, and frequency cap.
2. THE eligible endpoint SHALL respect priority ordering (higher priority first).
3. THE eligible endpoint SHALL return only 1 popup per request (highest priority eligible).
4. THE eligible endpoint SHALL handle A/B assignment transparently — returning the assigned variant.
5. THE response SHALL include: id, content_type, content_config, trigger_config, linked_action, ab_variant.

### Requirement 14: Mobile App API — Event Ingestion

**User Story:** As a mobile app, I want to send tracking events and custom events to the backend, so that popup triggers and analytics work correctly.

#### Acceptance Criteria

1. THE impression/click/dismiss endpoints SHALL accept popup_id and store the event with user_id, device_type, and timestamp.
2. THE generic event ingestion endpoint SHALL accept: event_key (required) and metadata (optional JSON object).
3. THE API SHALL validate that event_key exists in the Event Registry (system or custom).
4. THE API SHALL reject events for inactive (is_active=false) custom events.

### Requirement 15: CRM User Interface

**User Story:** As a Marketing_User, I want an intuitive interface to manage popup promotions and event registry, so that I can efficiently create and monitor campaigns.

#### Acceptance Criteria

1. THE CRM SHALL add "Popup Promotions" and "Event Registry" to the Marketing sidebar navigation.
2. THE Popup list page SHALL display: name, content_type badge, status badge, priority, impressions, CTR, and quick actions (pause/resume, duplicate, delete).
3. THE Popup create/edit page SHALL use a wizard with steps: Basic Info → Content → Targeting & Triggers → Scheduling → Review & Publish.
4. THE Popup detail page SHALL show configuration summary and analytics dashboard (metrics, charts, breakdowns).
5. THE A/B compare page SHALL show side-by-side metrics for both variants with winner recommendation.
6. THE Event Registry list page SHALL show system events (read-only badge) and custom events (editable) in a single table.
7. THE Event Registry create/edit form SHALL use the existing FormCard pattern with fields: key, label, category, description, status.
8. THE Popup list page SHALL support filters: status, content_type, user_type target, date range.

### Requirement 16: Priority & Conflict Resolution

**User Story:** As a system, I want to resolve conflicts when multiple popups are eligible for the same user, so that the user experience is not disrupted.

#### Acceptance Criteria

1. WHEN multiple popups are eligible, THE system SHALL select the one with highest priority value.
2. THE system SHALL display only 1 popup per trigger event (no stacking).
3. AFTER a popup is dismissed or clicked, THE next eligible popup MAY appear on the next trigger event.
4. THE cooldown_minutes in frequency_cap SHALL be respected between consecutive popup displays.
