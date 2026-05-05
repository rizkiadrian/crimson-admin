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

| ID       | Feature                    | Status             | Description                                                                                                                               |
| -------- | -------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| FM-03-01 | List with pagination       | ✅ Done            | Shows verification status badge (4 states) + service category                                                                             |
| FM-03-02 | Show detail page           | ✅ Done            | DetailCard with account info, mitra profile, and document viewer                                                                          |
| FM-03-03 | Edit basic info            | ✅ Done            | Update name, email, phone (mitra manages their own profile/docs)                                                                          |
| FM-03-04 | Delete member              | ✅ Done            | Global confirm dialog with async loading                                                                                                  |
| FM-03-05 | Filter popup               | ✅ Done            | Verification status chips (4 states), date range                                                                                          |
| FM-03-06 | Update verification status | ✅ Done (API only) | `PATCH .../verification-status` with pending/approved/rejected/suspended                                                                  |
| FM-03-07 | Verify UI button           | ✅ Done            | Inline verify button (ShieldCheck icon) in table row + detail page header, only for pending status. Uses confirm dialog to approve mitra. |

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

**Acceptance Criteria:**

- Table shows `verification_status` as a colored badge (4 states: pending, approved, rejected, suspended)
- Verify button (ShieldCheck icon) appears in table row actions only when `verification_status === "pending"`
- Verify button appears on detail page header actions only when `verification_status === "pending"`
- Clicking verify opens confirm dialog with title "Approve Mitra Verification?" and description explaining status change
- Confirm dialog has "Approve" confirm button and "Batal" cancel button
- On confirm: calls `PATCH /mitra-members/{id}/verification-status` with `{ verification_status: "approved" }`
- On success: shows success toast with API response message, refetches table/detail data
- On error: shows error toast with API response message, data remains unchanged
- Verify button hidden for approved, rejected, and suspended statuses

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
▼ Finance (accordion)
  └── Deposit Requests
▼ Content (accordion)
  └── Banners
▼ Analytics (accordion)
  ├── Funnel Overview
  ├── User Segments
  └── Event Log
▼ Master Data (accordion)
  └── Service Categories
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
- `lead_id` is required when type is `request_lead_assign` or `request_update_lead_status`; label changes dynamically
- `request_update_lead_status`: lead dropdown only shows leads assigned to current sales user (`?assigned_to_me=1`); backend validates lead assignment + no pending request for same lead
- `request_lead_assign`: lead dropdown only shows unassigned leads (`?unassigned_only=1`); backend validates lead not already assigned to another sales
- Info banners explain constraints for each request type
- Lead selection clears when activity type changes (different types show different lead sets)
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

### FM-10: Deposit Request Management

**Route:** `/dashboard/deposit-requests` (list), `/dashboard/deposit-requests/[id]` (detail)
**API Base:** `/api/v1/backoffice/deposit-requests`
**Priority:** P2 — Finance

| ID       | Feature              | Status  | Description                                                                                                                                                                                                                                                            |
| -------- | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FM-10-01 | List with pagination | ✅ Done | Paginated table with columns: Client Name, Reference Code, Amount (Rp format), Payment Method, Status badge, Created Date. SearchInput for reference code / client name. FilterPopup with status chips (pending, approved, rejected, expired) and payment method chips |
| FM-10-02 | Detail page          | ✅ Done | DetailCard with deposit info (client name, email, reference code, amount, payment method, status, created date), attachment preview (clickable image or download link), approve/reject form (pending only), read-only review info (processed)                          |
| FM-10-03 | Approve deposit      | ✅ Done | Status update to "approved" → wallet balance credited atomically + WalletTransaction record created + NotifyClientUser job dispatched. Optional reason field                                                                                                           |
| FM-10-04 | Reject deposit       | ✅ Done | Status update to "rejected" with required reason (max 1000 chars) → NotifyClientUser job dispatched with rejection reason                                                                                                                                              |
| FM-10-05 | Dashboard widget     | ✅ Done | StatCard on backoffice dashboard showing total deposit requests and pending count ("N pending review")                                                                                                                                                                 |
| FM-10-06 | Sidebar navigation   | ✅ Done | "Finance" accordion group with "Deposit Requests" item (Wallet/CreditCard icons)                                                                                                                                                                                       |

**Deposit Status Flow:**

```
pending → approved (wallet credited, transaction logged)
        → rejected (reason recorded)
```

**Status Badge Colors:**

| Status   | Badge Variant |
| -------- | ------------- |
| pending  | warning       |
| approved | success       |
| rejected | error         |
| expired  | neutral       |

**API Endpoints:**

| Method | Endpoint                              | Request Body          | Response                              |
| ------ | ------------------------------------- | --------------------- | ------------------------------------- |
| GET    | `/deposit-requests?page=N&per_page=N` | —                     | Paginated list with `meta.pagination` |
| GET    | `/deposit-requests/{id}`              | —                     | Deposit detail with user + reviewer   |
| PATCH  | `/deposit-requests/{id}/status`       | `{ status, reason? }` | Updated deposit request               |

**Acceptance Criteria:**

- Table displays deposit requests ordered by created_at descending
- Search filters by reference_code or client name (case-insensitive)
- Status and payment method filters work independently
- Row click navigates to detail page
- Detail page shows attachment as clickable image preview (if image) or download link (if file)
- Approve/reject form only shown when status is "pending"; read-only review info shown when processed
- Rejection requires a non-empty reason (max 1000 chars); approval reason is optional
- Approval atomically: updates status + credits wallet + creates WalletTransaction
- Non-pending deposits reject status changes with 422
- Inactive wallet (locked/banned) rejects approval with 422
- Dashboard StatCard shows total and pending deposit counts
- Sidebar "Finance" group with "Deposit Requests" item between Sales Management and Other navs

---

### FM-11: Banner Management

**Route:** `/dashboard/banners` (list), `/dashboard/banners/create` (create), `/dashboard/banners/[id]/edit` (edit)
**API Base:** `/api/v1/backoffice/banners`
**Priority:** P2 — Content

| ID       | Feature              | Status  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------- | -------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FM-11-01 | List with pagination | ✅ Done | Paginated table with columns: thumbnail preview, title, type badge (image/text_placement), status badge (active/inactive), display order, created date, actions. SearchInput for title. FilterPopup with type chips (image, text_placement) and status chips (active, inactive). Actions: edit link, toggle status, delete with ConfirmDialog                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| FM-11-02 | Create banner        | ✅ Done | FormCard with title, type selector, target URL field (both types). Conditional rendering: Image type → file upload with preview + client-side aspect ratio validation (1080x608 ±10px). Text Placement type → BackgroundSelector + CanvasEditor (DOM-based, Canva-style) + TextPropertiesPanel + CtaPropertiesPanel + TemplateSelector. Canvas capture on submit renders text_placement to PNG image for upload. "Add Text" button, "Preview" button, submit                                                                                                                                                                                                                                                                                                                            |
| FM-11-03 | Edit banner          | ✅ Done | Pre-populated form via `useDetailData`. Image type: shows current image, optional new upload. Text Placement type: loads existing background_config, text_elements, and cta_config into editor. Uses "Page + Inner Form" split for React 19 compliance                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FM-11-04 | Canvas editor        | ✅ Done | DOM-based editor (Canva-style) for text placement banners. 2:1 aspect ratio (matching mobile app's 280×140 banner card), drag-and-drop for text elements AND CTA button, double-click to inline edit text, real-time background rendering (solid/gradient), percentage-based positioning (0-100). `captureImage()` renders to hidden canvas for PNG export at 1080×540. Uses `forwardRef` + `useImperativeHandle`. Includes TextPropertiesPanel, BackgroundSelector (8 solid + 8 gradient presets, custom color), CtaPropertiesPanel (toggle enable/disable, text, colors, border radius, font size, padding), TemplateSelector (4 templates matching mobile app's PromoBanner: Cashback 20%, Gratis Transfer, Referral Bonus, Promo Spesial — with CTA configs and background configs) |
| FM-11-05 | Banner preview       | ✅ Done | BannerPreviewModal simulating mobile viewport (~375px width). Image type: renders uploaded image. Text Placement type: renders background + text elements + CTA button at correct positions. Close/Back to Edit button                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| FM-11-06 | Status toggle        | ✅ Done | Inline status toggle per row via `bannersService.updateStatus`. PATCH endpoint toggles between active/inactive                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| FM-11-07 | Reorder              | ✅ Done | Reorder display_order via `bannersService.reorder`. PATCH endpoint accepts array of `{id, display_order}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| FM-11-08 | Sidebar navigation   | ✅ Done | "Banners" item with Image icon in sidebar, links to `/dashboard/banners`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |

**Banner Types:**

| Type             | Description                                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `image`          | Upload gambar langsung (JPEG/PNG/WebP, max 2MB, 1080x608 ±10px). Supports optional `target_url` (web URL or deeplink)                  |
| `text_placement` | DOM-based editor (Canva-style) for menempatkan elemen teks + CTA button di atas background warna. Rendered to PNG on submit for upload |

**Status Badge Colors:**

| Status   | Badge Variant |
| -------- | ------------- |
| active   | success       |
| inactive | neutral       |

**Canvas Editor Components:**

| Component             | Description                                                                                                                                                                                                                                                                          |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `CanvasEditor`        | DOM-based editor (Canva-style, 2:1 aspect ratio matching mobile 280×140), renders background + text elements + CTA button, drag-and-drop reposition, double-click inline edit, `captureImage()` exports to 1080×540 PNG via hidden canvas, uses `forwardRef` + `useImperativeHandle` |
| `TextPropertiesPanel` | Properties panel for selected text element (content, font_size, font_color, font_weight)                                                                                                                                                                                             |
| `CtaPropertiesPanel`  | CTA button editor (toggle enable/disable, text, bg_color, text_color, border_radius, font_size, padding_x, padding_y). Default CTA: "Selengkapnya"                                                                                                                                   |
| `BackgroundSelector`  | Background preset grid (8 solid + 8 gradient), custom color input, gradient direction select                                                                                                                                                                                         |
| `TemplateSelector`    | 4 pre-configured templates matching mobile app's PromoBanner (Cashback 20%, Gratis Transfer, Referral Bonus, Promo Spesial) with CTA configs + background configs. Applies text elements, CTA, and background together                                                               |
| `BannerPreviewModal`  | Preview modal simulating mobile viewport (~375px width), renders CTA button in preview                                                                                                                                                                                               |

**API Endpoints:**

| Method | Endpoint                     | Request Body                                                                                                                                                                                 | Response                              |
| ------ | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| GET    | `/banners?page=N&per_page=N` | —                                                                                                                                                                                            | Paginated list with `meta.pagination` |
| GET    | `/banners/{id}`              | —                                                                                                                                                                                            | Banner detail                         |
| POST   | `/banners`                   | FormData for both types (image file + target_url for image; image file + background_config JSON string + text_elements JSON string + cta_config JSON string + target_url for text_placement) | Created banner                        |
| PUT    | `/banners/{id}`              | FormData for both types (same fields as create, all optional)                                                                                                                                | Updated banner                        |
| DELETE | `/banners/{id}`              | —                                                                                                                                                                                            | `null` (soft delete)                  |
| PATCH  | `/banners/{id}/status`       | `{ status }`                                                                                                                                                                                 | Updated banner                        |
| PATCH  | `/banners/reorder`           | `{ banners: [{ id, display_order }] }`                                                                                                                                                       | Success response                      |

**Acceptance Criteria:**

- Table displays banners ordered by display_order asc, created_at desc
- Search filters by title (case-insensitive)
- Type and status filters work independently
- Image upload validates format (JPEG/PNG/WebP), size (max 2MB), and dimensions (1080x608 ±10px) client-side
- Target URL field available for both banner types (web URLs and deeplinks, max 500 chars)
- DOM-based canvas editor maintains 2:1 aspect ratio (matching mobile app's 280×140 banner card), text elements and CTA button are draggable within bounds
- Double-click text elements for inline editing
- Text element positions stored as percentage (0-100) for responsiveness
- CTA button configurable: text, colors (supports 8-char alpha hex like #FFFFFF33), border radius, font size, padding
- Template application applies background + text elements + CTA config together (4 templates matching mobile app's PromoBanner)
- Canvas capture on submit: text_placement banners are rendered to PNG (1080×540) via hidden canvas and uploaded as image file
- Preview modal simulates mobile viewport (~375px width) and renders CTA button
- New banners default to status "inactive" with next available display_order
- Soft delete — deleted banners excluded from list
- Mobile endpoint (`GET /client/banners`) returns only active banners ordered by display_order
- `api.ts` `post()` method auto-detects FormData and removes Content-Type header so axios sets multipart/form-data with boundary automatically

---

### FM-12: User Journey Funnel

**Route:** `/dashboard/analytics/funnel` (funnel), `/dashboard/analytics/segments` (segments), `/dashboard/analytics/events` (event log)
**API Base:** `/api/v1/backoffice/analytics`
**Priority:** P2 — Analytics

| ID       | Feature                 | Status  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------- | ----------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FM-12-01 | Funnel Overview page    | ✅ Done | Period filter controls (7d, 30d, 90d, custom date range) synced to URL. Funnel bar chart (Registration → Verified → Funded → Active) with conversion rate labels. Trend line chart showing stage counts over time. Average time per stage display. Uses `ChartCard`, `BarChartComponent`, Recharts `LineChart` with `CHART_COLORS`/`CHART_SETS`                                                                                                                                                                                                      |
| FM-12-02 | User Segments page      | ✅ Done | Top section with Total Users summary card + DonutChart showing stage distribution. Redesigned stage cards with unique icons per stage (UserPlus, UserCheck, Wallet, Zap, Moon, UserX), colored progress bars, hover animations, click-to-deselect (clicking same stage hides table). `SegmentUsersTable` sub-component mounts only when stage is selected. Paginated user table via `useTableData`. Filter controls: registration date range, last active date range. CSV export button. URL-synced: stage, pagination, filters                      |
| FM-12-03 | Event Log page          | ✅ Done | Paginated table via `useTableData`. SearchInput for user name/email. FilterPopup with event type dropdown and date range. Columns: User, Event Type (badge), Timestamp, Metadata (`MetadataPopover` component — truncated metadata >50 chars shown as clickable primary-colored link with dotted underline, popover shows full formatted JSON with "METADATA" header, copy-to-clipboard button, close button, smart positioning above/below based on viewport space, closes on click outside or Escape key). URL-synced: search, filters, pagination |
| FM-12-04 | Dashboard widget        | ✅ Done | StatCard on backoffice dashboard showing "Active Users" count with conversion rate percentage description. Uses `TrendingUp` icon with success variant                                                                                                                                                                                                                                                                                                                                                                                               |
| FM-12-05 | Analytics service layer | ✅ Done | Typed service at `src/services/backoffice/analytics/` with interfaces (IFunnelStats, IFunnelTrends, ISegmentSummary, ISegmentUser, IUserEvent) and service functions (getFunnelStats, getFunnelTrends, getSegmentSummary, getSegmentUsers, exportSegmentCsv, getEventLog)                                                                                                                                                                                                                                                                            |
| FM-12-06 | Sidebar navigation      | ✅ Done | "Analytics" accordion group (after Finance) with items: Funnel Overview (TrendingUp icon), User Segments (Users icon), Event Log (ScrollText icon)                                                                                                                                                                                                                                                                                                                                                                                                   |
| FM-12-07 | Routing                 | ✅ Done | `ANALYTICS_SERVICES` paths: `analyticsFunnel`, `analyticsSegments`, `analyticsEvents` in centralized `PATHS` object                                                                                                                                                                                                                                                                                                                                                                                                                                  |

**Journey Stages:**

```
registered → verified → funded → active
                                       → dormant (30 days inactive, scheduler)
                                       → churned (90 days inactive, scheduler)
dormant/churned → active (any lifecycle event re-activates)
```

**Event Types:**

| Event Type          | Trigger                   | Tracking Method |
| ------------------- | ------------------------- | --------------- |
| `user_registered`   | Client/Mitra registration | Direct write    |
| `email_verified`    | Email verification        | Direct write    |
| `first_deposit`     | First deposit approval    | Direct write    |
| `first_transaction` | First transaction         | Direct write    |
| `app_opened`        | Mobile app open           | Queue (Redis)   |
| `banner_clicked`    | Banner click in mobile    | Queue (Redis)   |
| `service_viewed`    | Service view in mobile    | Queue (Redis)   |

**API Endpoints:**

| Method | Endpoint                                                | Request Body | Response                                     |
| ------ | ------------------------------------------------------- | ------------ | -------------------------------------------- |
| GET    | `/analytics/funnel?period=30d`                          | —            | Funnel stats (stages, conversions, avg time) |
| GET    | `/analytics/funnel/trends?period=30d&granularity=daily` | —            | Trend data (labels, series per stage)        |
| GET    | `/analytics/segments`                                   | —            | Segment summary (counts per stage)           |
| GET    | `/analytics/segments/{stage}?page=N`                    | —            | Paginated users in stage                     |
| GET    | `/analytics/segments/export?stage=active`               | —            | CSV file download                            |
| GET    | `/analytics/events?page=N&event_type=&search=`          | —            | Paginated event log                          |

**Acceptance Criteria:**

- Funnel bar chart displays Registration → Verified → Funded → Active with user counts and conversion rate percentages
- Period filter (7d, 30d, 90d, custom) updates funnel data and syncs to URL query params
- Trend line chart shows daily/weekly stage counts over the selected period
- Average time per stage displayed in human-readable format (hours)
- Segment summary cards show user count per stage (all 6 stages including dormant, churned)
- Clicking a stage card shows paginated user table with Name, Email, Phone, Registration Date, Last Active columns
- CSV export downloads filtered user list matching the paginated view
- Event log table shows events ordered by created_at descending
- Event log search filters by user name/email (case-insensitive)
- Event log filters: event type dropdown, date range picker
- Metadata column shows `MetadataPopover` — truncated JSON (>50 chars) as clickable primary-colored link with dotted underline, popover shows full formatted JSON with copy-to-clipboard button
- Dashboard StatCard shows active user count with conversion rate description
- Analytics sidebar group appears after Finance group with three items
- All pages use service layer pattern (no direct API calls from components)
- All pages use `CHART_COLORS`/`CHART_SETS` for chart rendering

---

### FM-13: Service Category Management

**Route:** `/dashboard/service-categories` (list), `/dashboard/service-categories/create` (create), `/dashboard/service-categories/[id]/edit` (edit)
**API Base:** `/api/v1/backoffice/service-categories`
**Priority:** P2 — Master Data

| ID       | Feature              | Status  | Description                                                                                                                                                                                                                                                                                                                |
| -------- | -------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FM-13-01 | List with pagination | ✅ Done | Paginated table with columns: icon (SVG thumbnail via Next.js `<Image>` with `unoptimized`), name, slug, types (as badges), status badge (active/inactive), created date, actions. SearchInput for name. Actions: toggle status, edit link with `returnPage`, delete with ConfirmDialog                                    |
| FM-13-02 | Create category      | ✅ Done | FormCard with name (required, max 255), description (optional textarea), icon (SVG upload, max 2MB with preview), types (multi-checkbox: general, daily, monthly, popular), is_active (toggle, default false). Client-side validation for name, icon format/size. FormData submission. 422 → field errors, non-422 → toast |
| FM-13-03 | Edit category        | ✅ Done | Pre-populated form via `useDetailData`. "Page + Inner Form" split for React 19 compliance. Shows existing icon preview. Optional icon replacement. Submit via POST with `_method=PUT` FormData. Navigates back with preserved `returnPage`                                                                                 |
| FM-13-04 | Status toggle        | ✅ Done | Inline status toggle per row. Sends update request to toggle `is_active`. Success → notification + table refresh. Failure → error notification                                                                                                                                                                             |
| FM-13-05 | Delete category      | ✅ Done | ConfirmDialog before delete. Success → notification + table refresh. Failure → error notification                                                                                                                                                                                                                          |
| FM-13-06 | Service layer        | ✅ Done | Typed service at `src/services/backoffice/service-categories/` with `serviceCategoriesService`: list, detail, create, update, delete. Types: `IServiceCategory`, `IServiceCategoryParams`, `CategoryType`                                                                                                                  |
| FM-13-07 | Sidebar navigation   | ✅ Done | "Master Data" accordion group (after Analytics, before Content) with "Service Categories" item (FolderTree icon). Group icon: Database                                                                                                                                                                                     |
| FM-13-08 | Routing              | ✅ Done | `SERVICE_CATEGORIES_SERVICES` paths: `serviceCategories`, `serviceCategoryCreate`, `serviceCategoryEdit` in centralized `PATHS` object                                                                                                                                                                                     |

**Category Types:**

| Type      | Description               |
| --------- | ------------------------- |
| `general` | General service category  |
| `daily`   | Daily recurring service   |
| `monthly` | Monthly recurring service |
| `popular` | Popular/featured service  |

**Status Badge Colors:**

| Status   | Badge Variant |
| -------- | ------------- |
| active   | success       |
| inactive | neutral       |

**API Endpoints:**

| Method | Endpoint                                | Request Body                                                       | Response                              |
| ------ | --------------------------------------- | ------------------------------------------------------------------ | ------------------------------------- |
| GET    | `/service-categories?page=N&per_page=N` | —                                                                  | Paginated list with `meta.pagination` |
| GET    | `/service-categories/{id}`              | —                                                                  | Service category detail               |
| POST   | `/service-categories`                   | FormData: `name`, `description?`, `icon?`, `types[]?`, `is_active` | Created service category              |
| PUT    | `/service-categories/{id}`              | FormData: same fields as create (all optional)                     | Updated service category              |
| DELETE | `/service-categories/{id}`              | —                                                                  | `null` (soft delete)                  |

**Acceptance Criteria:**

- Table displays service categories ordered by created_at descending
- Search filters by name via API search parameter (case-insensitive)
- Icon displayed as SVG thumbnail using Next.js `<Image>` with `unoptimized` prop
- Types displayed as individual badges per row
- Status toggle updates `is_active` inline without navigating to edit page
- Create form validates: name required, name max 255 chars, icon must be SVG, icon max 2MB
- Types field uses multi-checkbox (4 options visible at once), not multi-select dropdown
- Edit form pre-populates all fields including existing icon preview
- Edit form uses "Page + Inner Form" split pattern for React 19 compliance
- Icon upload is optional on both create and edit (nullable field)
- Slug is auto-generated by backend from name (not editable in frontend)
- Delete is guarded by ConfirmDialog before sending request
- Sidebar "Master Data" group with "Service Categories" item
- All pages use service layer pattern (no direct API calls from components)

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
| FM-10    | Deposit Management          | P2       | ✅ Done    |
| FM-11    | Banner Management           | P2       | ✅ Done    |
| FM-12    | User Journey Funnel         | P2       | ✅ Done    |
| FM-13    | Service Category Management | P2       | ✅ Done    |
| FM-14    | Dashboard Analytics         | P2       | ✅ Done    |
| FM-14b   | Sales Dashboard             | P2       | ✅ Done    |
| FM-15    | Audit Log                   | P3       | 🔲 Planned |
| FM-16    | Role-based UI visibility    | P3       | 🔲 Planned |
