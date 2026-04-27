# Product Requirements Document — Lingkar CRM

## Product Overview

Lingkar CRM is the administrative control panel for the Lingkar service marketplace. It enables backoffice operators and administrators to manage the full lifecycle of platform users — from registration and verification to profile updates and account deletion — with full audit trail via email notifications.

### Target Users

| Role       | Access Level       | Description                                                     |
| ---------- | ------------------ | --------------------------------------------------------------- |
| Admin      | Full access        | Platform administrators with unrestricted access to all modules |
| Backoffice | Operational access | Support staff managing day-to-day user operations               |

### Key Capabilities

- **User Management** — Full CRUD for backoffice staff and client members with role-based access control
- **Client Lifecycle** — Create, verify, update, and deactivate client accounts with automated email notifications at each stage
- **URL-Synced Pagination** — Bookmarkable table pages with browser back/forward support
- **Return-Page Preservation** — Edit pages remember which table page the user came from
- **Global Confirm Dialog** — Zustand-driven confirmation modal for destructive actions with async loading state
- **Filter System** — Composable filter popups with chip selectors, range sliders, and date pickers
- **Design System** — Comprehensive component library with live preview at `/design-system`
- **Notifications** — Real-time notification bell with unread badge, dropdown panel, and full page view for backoffice users

---

## Feature Modules

### FM-01: User Management — Backoffice Members

**Route:** `/dashboard/backoffice-members`
**API Base:** `/api/v1/backoffice/backoffice-members`
**Priority:** P0 — Core

| ID       | Feature              | Status  | Description                                                      |
| -------- | -------------------- | ------- | ---------------------------------------------------------------- |
| FM-01-01 | List with pagination | ✅ Done | URL-synced `?page=N`, skeleton loading, refetch overlay          |
| FM-01-02 | Create member        | ✅ Done | FormCard with name, email, phone (auto-format), password         |
| FM-01-03 | Edit member          | ✅ Done | Fetches detail via `useDetailData`, return-page preservation     |
| FM-01-04 | Delete member        | ✅ Done | Global confirm dialog with async loading, error toast on failure |
| FM-01-05 | Filter popup         | ✅ Done | Role chips, verification status, date range                      |

**User Flow:**

1. Admin navigates to Backoffice Members via sidebar accordion
2. Table loads with paginated data, URL reflects current page
3. Click "Add New" → create form with validation errors from API
4. Click edit icon → edit form pre-filled with current data, preserves return page
5. Click delete icon → confirm dialog → soft delete → refetch table → success toast

**API Endpoints:**

| Method | Endpoint                                | Request Body                           | Response                              |
| ------ | --------------------------------------- | -------------------------------------- | ------------------------------------- |
| GET    | `/backoffice-members?page=N&per_page=N` | —                                      | Paginated list with `meta.pagination` |
| POST   | `/backoffice-members`                   | `{ name, email, phone, password }`     | Created user object                   |
| GET    | `/backoffice-members/{id}`              | —                                      | User detail with role                 |
| PUT    | `/backoffice-members/{id}`              | `{ name?, email?, phone?, password? }` | Updated user object                   |
| DELETE | `/backoffice-members/{id}`              | —                                      | `null` (soft delete)                  |

**Acceptance Criteria:**

- Table skeleton shows during initial load, progress bar during pagination
- Edit form pre-fills all fields from API detail response
- Password field is optional on edit — empty means keep current
- Delete is guarded: cannot delete non-Backoffice users, cannot delete self
- After edit/delete, user returns to the same table page they came from

---

### FM-02: User Management — Client Members

**Route:** `/dashboard/client-members`
**API Base:** `/api/v1/backoffice/client-members`
**Priority:** P0 — Core

| ID       | Feature              | Status             | Description                                                                                             |
| -------- | -------------------- | ------------------ | ------------------------------------------------------------------------------------------------------- |
| FM-02-01 | List with pagination | ✅ Done            | Shows verification status badge (Verified/Unverified)                                                   |
| FM-02-02 | Create client        | ✅ Done            | Creates user + profile (async) + sends welcome email                                                    |
| FM-02-03 | Edit client          | ✅ Done            | Updates user + syncs profile (async) + sends change notification email                                  |
| FM-02-04 | Delete client        | ✅ Done            | Soft deletes user + removes profile (async) + sends deletion email                                      |
| FM-02-05 | Filter popup         | ✅ Done            | Verification status chips, date range                                                                   |
| FM-02-06 | Manual verify        | ✅ Done (API only) | `PATCH .../verify` sets `is_verified=true` + sends verification email                                   |
| FM-02-07 | Verify UI button     | ✅ Done            | Inline verify button (ShieldCheck icon) in table row, only for unverified clients. Uses confirm dialog. |

**Backend Side Effects per Action:**

| Action | Async Job                             | Email Notification                                      | Description                     |
| ------ | ------------------------------------- | ------------------------------------------------------- | ------------------------------- |
| Create | `CreateUserProfile`                   | `ClientAccountCreatedMail`                              | Welcome email with account info |
| Update | `UpdateUserProfile` (if name changed) | `ProfileUpdatedByBackofficeMail` (lists changed fields) | Change notification             |
| Delete | `DeleteUserProfile`                   | `ClientAccountDeletedMail`                              | Deletion notification           |
| Verify | —                                     | `ClientManuallyVerifiedMail`                            | Verification confirmation       |

**API Endpoints:**

| Method | Endpoint                            | Request Body                           | Response                              |
| ------ | ----------------------------------- | -------------------------------------- | ------------------------------------- |
| GET    | `/client-members?page=N&per_page=N` | —                                      | Paginated list with `meta.pagination` |
| POST   | `/client-members`                   | `{ name, email, phone, password }`     | Created user object                   |
| GET    | `/client-members/{id}`              | —                                      | User detail with role                 |
| PUT    | `/client-members/{id}`              | `{ name?, email?, phone?, password? }` | Updated user object                   |
| DELETE | `/client-members/{id}`              | —                                      | `null` (soft delete)                  |
| PATCH  | `/client-members/{id}/verify`       | —                                      | Verified user object                  |

**Acceptance Criteria:**

- Table shows `is_verified` as a colored badge (green = Verified, yellow = Unverified)
- Create triggers async profile creation and welcome email
- Update detects which fields changed and lists them in the notification email
- Delete captures user data before soft-delete for the notification email
- Verify endpoint returns 400 if user is already verified
- All role guards enforce Client-only operations (403 if target is not Client)

---

### FM-03: User Management — Mitra Members

**Route:** `/dashboard/mitra-members`
**API Base:** `/api/v1/backoffice/mitra-members`
**Priority:** P0 — Core

| ID       | Feature                    | Status             | Description                                                              |
| -------- | -------------------------- | ------------------ | ------------------------------------------------------------------------ |
| FM-03-01 | List with pagination       | ✅ Done            | Shows verification status badge (4 states) + service category            |
| FM-03-02 | Show detail page           | ✅ Done            | DetailCard with account info, mitra profile, and document viewer         |
| FM-03-03 | Edit basic info            | ✅ Done            | Update name, email, phone (mitra manages their own profile/docs)         |
| FM-03-04 | Delete member              | ✅ Done            | Global confirm dialog with async loading                                 |
| FM-03-05 | Filter popup               | ✅ Done            | Verification status chips (4 states), date range                         |
| FM-03-06 | Update verification status | ✅ Done (API only) | `PATCH .../verification-status` with pending/approved/rejected/suspended |

**Key differences from Client Members:**

- No "Create" — mitras self-register via the public API
- Show page with document viewer (photo, KTP, selfie KTP, SKCK)
- 4-state verification status instead of boolean `is_verified`
- Table shows service category under the mitra's name

**API Endpoints:**

| Method | Endpoint                                  | Request Body                | Response                                             |
| ------ | ----------------------------------------- | --------------------------- | ---------------------------------------------------- |
| GET    | `/mitra-members?page=N&per_page=N`        | —                           | Paginated list with mitra profile + service category |
| GET    | `/mitra-members/{id}`                     | —                           | User detail with mitra profile and documents         |
| PUT    | `/mitra-members/{id}`                     | `{ name?, email?, phone? }` | Updated user with mitra profile                      |
| PATCH  | `/mitra-members/{id}/verification-status` | `{ verification_status }`   | Updated user with new status                         |
| DELETE | `/mitra-members/{id}`                     | —                           | `null` (soft delete)                                 |

---

### FM-04: Navigation

**Priority:** P1 — UX

| ID       | Feature                | Status  | Description                                                                                                        |
| -------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| FM-03-01 | Sidebar accordion      | ✅ Done | Collapsible groups with chevron toggle and smooth animation                                                        |
| FM-03-02 | Active state detection | ✅ Done | Uses `pathname.startsWith()` for sub-page highlighting                                                             |
| FM-03-03 | Auto-expand on active  | ✅ Done | Groups auto-open when any child route is active                                                                    |
| FM-03-04 | User info & logout     | ✅ Done | Bottom section shows user name, role, avatar initial, and logout button (LogOut icon, red on hover, loading state) |

**Navigation Structure:**

```
Dashboard
▼ User Management (accordion)
  ├── Backoffice Members
  ├── Client Members
  └── Mitra Members
▼ Sales Management (accordion)
  ├── Leads
  ├── Sales Members
  └── Activity Logs
Analytics
Reports
Notifikasi
── System ──
  Settings
  Help Center
```

---

### FM-04: Global UI Systems

**Priority:** P0 — Core

| ID       | Feature                  | Status  | Description                                                                                                                         |
| -------- | ------------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| FM-04-01 | Toast notifications      | ✅ Done | Success/error/info toasts via `useNotificationStore`                                                                                |
| FM-04-02 | Confirm dialog           | ✅ Done | Async confirm with loading spinner via `useConfirmStore`                                                                            |
| FM-04-03 | Filter popup             | ✅ Done | Composable: chips, range slider, date range                                                                                         |
| FM-04-04 | URL-synced pagination    | ✅ Done | `?page=N` in URL, browser back/forward support                                                                                      |
| FM-04-05 | Return-page preservation | ✅ Done | Edit links carry `?returnPage=N`, redirect back after submit                                                                        |
| FM-04-06 | Logout                   | ✅ Done | Sidebar logout button → server action revokes tokens (best-effort) → clears cookies → clears Zustand profile → redirect to `/login` |

---

---

### FM-05: Sales Management — Leads

**Route:** `/dashboard/leads`
**API Base:** `/api/v1/backoffice/leads`
**Priority:** P1 — Core

| ID       | Feature                | Status  | Description                                                         |
| -------- | ---------------------- | ------- | ------------------------------------------------------------------- |
| FM-05-01 | List with pagination   | ✅ Done | URL-synced `?page=N`, search, skeleton loading, refetch overlay     |
| FM-05-02 | Create lead            | ✅ Done | FormCard with type, name, source (required), email, phone, priority |
| FM-05-03 | Edit lead              | ✅ Done | Pre-fills all fields via `useDetailData`, return-page preservation  |
| FM-05-04 | Delete lead            | ✅ Done | Global confirm dialog with async loading                            |
| FM-05-05 | Update pipeline status | ✅ Done | Inline status dropdown per row, PATCH to `/status` endpoint         |
| FM-05-06 | Convert lead           | ✅ Done | Modal dialog with `converted_user_id` input, PATCH to `/convert`    |
| FM-05-07 | Filter popup           | ✅ Done | Type chips (client/mitra), 7-stage status chips, priority chips     |
| FM-05-08 | Dashboard integration  | ✅ Done | Total Leads StatCard + Pipeline BarChart on dashboard home          |

**Pipeline Status Flow:**

```
new → contacted → qualified → proposal → negotiation → won
                                                      ↘ lost
```

**Status Badge Colors:**

| Status      | Badge Variant |
| ----------- | ------------- |
| new         | neutral       |
| contacted   | primary       |
| qualified   | tertiary      |
| proposal    | warning       |
| negotiation | primary       |
| won         | success       |
| lost        | error         |

**API Endpoints:**

| Method | Endpoint                   | Request Body                                  | Response                              |
| ------ | -------------------------- | --------------------------------------------- | ------------------------------------- |
| GET    | `/leads?page=N&per_page=N` | —                                             | Paginated list with `meta.pagination` |
| POST   | `/leads`                   | `{ type, name, source, email?, phone?, ... }` | Created lead object                   |
| GET    | `/leads/{id}`              | —                                             | Lead detail                           |
| PUT    | `/leads/{id}`              | All fields optional                           | Updated lead object                   |
| DELETE | `/leads/{id}`              | —                                             | `null`                                |
| PATCH  | `/leads/{id}/status`       | `{ status }`                                  | Updated lead with new status          |
| PATCH  | `/leads/{id}/convert`      | `{ converted_user_id }`                       | Updated lead (status → won)           |

**Acceptance Criteria:**

- Table shows type, status, and priority as colored badges
- Status can be updated inline from a dropdown without navigating away
- Convert action opens a modal dialog, not a new page
- Phone number field auto-formats using `FormInput format="phone"`
- All `select` fields (type, priority, status) use `FormSelect` component
- Dashboard shows total leads count and pipeline distribution chart
- Sidebar shows "Leads" under "Sales Management" accordion group
- Can optionally assign a Lead to a specific Sales member

---

### FM-06: Sales Management — Sales Members

**Route:** `/dashboard/sales-members`
**API Base:** `/api/v1/backoffice/sales-members`
**Priority:** P1 — Core

| ID       | Feature                | Status  | Description                                                         |
| -------- | ---------------------- | ------- | ------------------------------------------------------------------- |
| FM-06-01 | List with pagination   | ✅ Done | URL-synced `?page=N`, search, skeleton loading, refetch overlay     |
| FM-06-02 | Create sales member    | ✅ Done | FormCard with name, email, phone, password                          |
| FM-06-03 | Edit sales member      | ✅ Done | Pre-fills all fields via `useDetailData`, return-page preservation  |
| FM-06-04 | Delete sales member    | ✅ Done | Global confirm dialog with async loading                            |
| FM-06-05 | Auto-generated ID      | ✅ Done | Backend automatically assigns `SLS-XXXX` ID on creation             |
| FM-06-06 | Dropdown list endpoint | ✅ Done | `/sales-members-list` lightweight endpoint for Lead form assignment |

**API Endpoints:**

| Method | Endpoint                           | Request Body                           | Response                              |
| ------ | ---------------------------------- | -------------------------------------- | ------------------------------------- |
| GET    | `/sales-members?page=N&per_page=N` | —                                      | Paginated list with `meta.pagination` |
| POST   | `/sales-members`                   | `{ name, email, phone, password }`     | Created sales user object             |
| GET    | `/sales-members/{id}`              | —                                      | Sales user detail                     |
| PUT    | `/sales-members/{id}`              | `{ name?, email?, phone?, password? }` | Updated sales user object             |
| DELETE | `/sales-members/{id}`              | —                                      | `null` (soft delete)                  |
| GET    | `/sales-members-list`              | —                                      | Lightweight array of sales users      |

**Acceptance Criteria:**

- Sales member list displays auto-generated `sales_id` (e.g., SLS-0001)
- Edit page shows `sales_id` as a badge in the header
- Leads module integrated to allow assignment to sales members

---

### FM-07: Backoffice Notifications

**Route:** `/dashboard/notifications` (full page) + Navbar bell dropdown
**API Base:** `/api/v1/backoffice/notifications`
**Priority:** P1 — Core

| ID       | Feature                 | Status  | Description                                                                  |
| -------- | ----------------------- | ------- | ---------------------------------------------------------------------------- |
| FM-07-01 | Bell icon with badge    | ✅ Done | Navbar bell shows unread count, polls every 30s                              |
| FM-07-02 | Dropdown panel          | ✅ Done | Shows latest 5 notifications with type badges, timestamps, read/unread state |
| FM-07-03 | Mark as read            | ✅ Done | Click unread notification to mark as read, updates badge count               |
| FM-07-04 | Mark all as read        | ✅ Done | "Tandai semua dibaca" button in dropdown and full page                       |
| FM-07-05 | Full notifications page | ✅ Done | Paginated list using `useTableData`, sidebar entry                           |

**Architecture:**

- `useBackofficeNotificationStore` (Zustand) manages unread count, recent notifications, dropdown state
- `NotificationBell` component in Navbar handles dropdown UI + outside-click dismiss
- Full page at `/dashboard/notifications` uses `TableCard` + `TableCardPagination`
- Service layer at `services/backoffice/notifications/`

**Notification Types:**

| Type                  | Badge Color | Source                         |
| --------------------- | ----------- | ------------------------------ |
| `activity_log`        | Tertiary    | Sales creates/updates activity |
| `lead_assign_request` | Warning     | Sales requests lead assignment |
| `lead_status_request` | Success     | Sales requests status change   |

**API Endpoints:**

| Method | Endpoint                           | Request Body | Response                              |
| ------ | ---------------------------------- | ------------ | ------------------------------------- |
| GET    | `/notifications?page=N&per_page=N` | —            | Paginated list with `meta.pagination` |
| GET    | `/notifications/unread-count`      | —            | `{ unread_count: number }`            |
| PATCH  | `/notifications/{id}/read`         | —            | Updated notification object           |
| PATCH  | `/notifications/read-all`          | —            | `{ marked_count: number }`            |

**Acceptance Criteria:**

- Bell badge shows numeric count (max "99+"), hidden when 0
- Dropdown closes on outside click (uses `mouseup` for React 19 compliance)
- Unread notifications have primary-50 background tint and bold text
- Read notifications have muted styling
- Polling interval is 30 seconds for unread count
- Full page uses same card-based layout as other table pages

---

### FM-08: Sales Activities

**Route:** `/sales-activities`
**API Base:** `/api/v1/sales/activity-logs`
**Priority:** P1 — Core

| ID       | Feature                | Status  | Description                                                                                                                                                        |
| -------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FM-08-01 | Timeline list page     | ✅ Done | Timeline/list view (not table) with ActivityCard items, chronological order                                                                                        |
| FM-08-02 | Infinite scroll        | ✅ Done | IntersectionObserver-based auto-loading, append pagination, scroll sentinel                                                                                        |
| FM-08-03 | Search with URL sync   | ✅ Done | Debounced search via SearchInput, syncs `?search=` to URL, resets on change                                                                                        |
| FM-08-04 | Loading states         | ✅ Done | Skeleton placeholders (ActivityCardSkeleton) on initial load, spinner on more                                                                                      |
| FM-08-05 | Empty states           | ✅ Done | "Belum ada aktivitas" (no data) and "Tidak ada hasil" (no search results)                                                                                          |
| FM-08-06 | Error handling         | ✅ Done | Initial error with retry, load-more error with inline retry, data preservation                                                                                     |
| FM-08-07 | Create activity report | ✅ Done | FormCard at `/sales-activities/create` with conditional fields, multipart file upload, client-side validation, error handling, and toast notifications             |
| FM-08-08 | Attachment thumbnail   | ✅ Done | Image attachments show clickable thumbnail preview (max 120px, skeleton loading, error fallback); non-image attachments show file icon badge (PDF/DOC/XLS/generic) |

**Key Differences from Table Pages:**

- Uses **timeline/list view** instead of `TableCard` — data is chronological with visual type icons and relative timestamps
- Uses **`useInfiniteScroll` hook** instead of `useTableData` — append-based pagination with IntersectionObserver
- **ActivityCard** displays: type icon (FileText/UserPlus/RefreshCw), title, status badge (pending/approved/rejected), lead name, description, attachment preview (thumbnail or file icon badge), relative time

**Activity Types:**

| Type                         | Icon      | Color    | Description                   |
| ---------------------------- | --------- | -------- | ----------------------------- |
| `general_note`               | FileText  | Tertiary | General activity note         |
| `request_lead_assign`        | UserPlus  | Primary  | Request to assign a lead      |
| `request_update_lead_status` | RefreshCw | Warning  | Request to update lead status |

**Status Badge Colors:**

| Status   | Badge Variant |
| -------- | ------------- |
| pending  | warning       |
| approved | success       |
| rejected | error         |

**API Endpoints:**

| Method | Endpoint                                 | Request Body                                                                                                                                                | Response                              |
| ------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| GET    | `/sales/activity-logs?page=N&per_page=N` | —                                                                                                                                                           | Paginated list with `meta.pagination` |
| POST   | `/sales/activity-logs`                   | `{ type, title, description?, lead_id?, attachment?, metadata?: { requested_status?, requested_sales_id? } }` — multipart/form-data when attachment present | Created activity log                  |

**Acceptance Criteria:**

- Timeline displays activity logs in reverse chronological order
- Each ActivityCard shows type icon, title, status badge, lead name (if any), and relative time
- Infinite scroll loads next page when scroll sentinel enters viewport
- Search debounces input and syncs to URL `?search=` parameter
- Loading page with `?search=query` applies filter on mount
- Skeleton placeholders shown during initial load
- Existing data preserved when load-more fails
- Sidebar "Sales Activity Report" links to `/sales-activities`
- Create form validates title is not empty (whitespace-only rejected)
- "Requested Sales Member ID" field appears only when type is `request_lead_assign`, auto-populated from user profile (`sales_id`), and is read-only
- Successful submit shows success toast and redirects to sales activities list
- Validation errors (422) display per-field error messages; general errors show error toast
- Submit button disabled with loading indicator during submission
- File attachment sent as `multipart/form-data`; JSON otherwise
- Backend dispatches `NotifyBackofficeUsers` job on create, notifying all admin/backoffice users
- API response includes `attachment_url`, `thumbnail_url`, and `attachment_type` fields (appended via model accessors)
- Image attachments display a clickable thumbnail (max 120px width, rounded corners) that opens full-size in a new tab
- Non-image attachments display a file icon badge with extension label (PDF, DOC, XLS, or generic FILE)
- Thumbnail shows skeleton placeholder while loading; falls back to file icon on error

---

### FM-09: Activity Log Review

**Route:** `/dashboard/activity-logs` (backoffice), `/sales-activities/{id}` (sales detail)
**API Base:** `/api/v1/backoffice/activity-logs`, `/api/v1/activity-logs/{id}/comments`, `/api/v1/sales/notifications`
**Priority:** P1 — Core

| ID       | Feature                        | Status  | Description                                                                                                                                                                                                                                                                                                                                               |
| -------- | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FM-09-01 | Backoffice activity log list   | ✅ Done | Table with search, status/type filters, paginated. Shows sales name, title, type badge, status badge, lead. "Requested" column shows requested status (→ Won) or sales ID (SLS-0002)                                                                                                                                                                      |
| FM-09-02 | Backoffice activity log detail | ✅ Done | DetailCard with activity info, "Detail Permintaan" section, status update form (if pending), read-only review info (if reviewed). Detail Permintaan shows: for `request_update_lead_status` — Tipe Lead badge, Status Lead Saat Ini badge, Status Yang Diminta badge; for `request_lead_assign` — Lead name, Tipe Lead badge, Sales ID Yang Diminta badge |
| FM-09-03 | Status update (approve/reject) | ✅ Done | FormSelect + FormTextarea for reason + optional initial comment. Dispatches NotifySalesUser. On approve: `applyApprovedAction()` auto-updates lead status for `request_update_lead_status` (auto-sets `contacted_at` when moving from "new", `converted_at` when status becomes "won") and assigns lead for `request_lead_assign`                         |
| FM-09-04 | Comment thread                 | ✅ Done | Reusable CommentThread component. Chronological comments with user name, role badge, relative timestamp                                                                                                                                                                                                                                                   |
| FM-09-05 | Sales activity log detail      | ✅ Done | DetailCard with activity info, "Detail Permintaan" section, reviewer info (when reviewed), comment thread                                                                                                                                                                                                                                                 |
| FM-09-06 | Sales notifications            | ✅ Done | Sales notification service (list, unread count, mark read, mark all read). Mirrors backoffice notifications. `useSalesNotificationStore` Zustand store. NotificationBell supports both backoffice and sales roles via role detection                                                                                                                      |
| FM-09-07 | Notification deep link         | ✅ Done | NotificationBell click navigates to notification's `link` URL (e.g., `/dashboard/activity-logs/{id}`)                                                                                                                                                                                                                                                     |
| FM-09-08 | Activity card detail link      | ✅ Done | ActivityCard in timeline links to `/sales-activities/{id}` detail page                                                                                                                                                                                                                                                                                    |

**Architecture:**

- `CommentThread` is a reusable component used in both backoffice detail and sales detail pages
- Comment access control is enforced at the service layer: only the activity log owner (sales) or reviewer (backoffice) can view/create comments
- Comments are only shown when the activity log status ≠ pending (i.e., after review)
- `NotifySalesUser` job targets a single sales user (unlike `NotifyBackofficeUsers` which broadcasts)
- Comment notifications target only the other party: sales comment → backoffice reviewer, reviewer comment → sales owner

**API Endpoints:**

| Method | Endpoint                                      | Request Body                   | Response                              |
| ------ | --------------------------------------------- | ------------------------------ | ------------------------------------- |
| GET    | `/backoffice/activity-logs?page=N&per_page=N` | —                              | Paginated list with `meta.pagination` |
| GET    | `/backoffice/activity-logs/{id}`              | —                              | Activity log detail with relations    |
| PATCH  | `/backoffice/activity-logs/{id}/status`       | `{ status, reason, comment? }` | Updated activity log                  |
| GET    | `/activity-logs/{id}/comments`                | —                              | Comment list (chronological)          |
| POST   | `/activity-logs/{id}/comments`                | `{ body }`                     | Created comment                       |
| GET    | `/sales/notifications?page=N&per_page=N`      | —                              | Paginated list with `meta.pagination` |
| GET    | `/sales/notifications/unread-count`           | —                              | `{ unread_count: number }`            |
| PATCH  | `/sales/notifications/{id}/read`              | —                              | Updated notification                  |
| PATCH  | `/sales/notifications/read-all`               | —                              | `{ marked_count: number }`            |

**Acceptance Criteria:**

- Backoffice list shows all activity logs from all sales users, ordered by created_at desc
- Search filters by title or description (case-insensitive)
- Status filter: pending, approved, rejected. Type filter: general_note, request_lead_assign, request_update_lead_status
- Status update form only shown when activity log is pending; read-only review info shown when reviewed
- Status change requires reason (max 1000 chars); optional initial comment (max 2000 chars)
- Non-pending activity logs reject status changes with 422
- Comment thread shows comments in chronological order (oldest first)
- Comment access restricted to activity log owner and reviewer (403 for others)
- Comments only allowed on reviewed activity logs (422 for pending)
- Sales detail page shows reviewer name, reason, and timestamp when reviewed
- Notification deep link navigates to the correct detail page on click
- ActivityCard in sales timeline links to `/sales-activities/{id}`
- "Detail Permintaan" section visible on both backoffice and sales detail pages
- "Requested" column in backoffice list table shows formatted requested value
- Lead dropdown in create form shows `[Type · Status]` format: `LD-0032 — PT Agung Sedayu [Client · New]`
- NotificationBell supports both backoffice and sales roles with `resolveLink()` fallback for deep linking when `link` is null
- Notification type labels: `status_change` → "Status Update", `new_comment` → "Komentar Baru"

---

## Roadmap

| ID       | Feature                     | Priority | Status     |
| -------- | --------------------------- | -------- | ---------- |
| FM-03-07 | Mitra verify UI button      | P1       | 🔲 Planned |
| FM-05    | Leads Management            | P1       | ✅ Done    |
| FM-06    | Sales Members Management    | P1       | ✅ Done    |
| FM-07    | Backoffice Notifications    | P1       | ✅ Done    |
| FM-08    | Sales Activities            | P1       | ✅ Done    |
| FM-09    | Activity Log Review         | P1       | ✅ Done    |
| FM-10    | Deposit Management          | P2       | 🔲 Planned |
| FM-11    | Service Category Management | P2       | 🔲 Planned |
| FM-12    | Dashboard Analytics         | P2       | ✅ Done    |
| FM-13    | Audit Log                   | P3       | 🔲 Planned |
| FM-14    | Role-based UI visibility    | P3       | 🔲 Planned |
