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

| ID       | Feature                | Status  | Description                                                 |
| -------- | ---------------------- | ------- | ----------------------------------------------------------- |
| FM-03-01 | Sidebar accordion      | ✅ Done | Collapsible groups with chevron toggle and smooth animation |
| FM-03-02 | Active state detection | ✅ Done | Uses `pathname.startsWith()` for sub-page highlighting      |
| FM-03-03 | Auto-expand on active  | ✅ Done | Groups auto-open when any child route is active             |

**Navigation Structure:**

```
Dashboard
▼ User Management (accordion)
  ├── Backoffice Members
  └── Client Members
Analytics
Reports
── System ──
  Settings
  Help Center
```

---

### FM-04: Global UI Systems

**Priority:** P0 — Core

| ID       | Feature                  | Status  | Description                                                  |
| -------- | ------------------------ | ------- | ------------------------------------------------------------ |
| FM-04-01 | Toast notifications      | ✅ Done | Success/error/info toasts via `useNotificationStore`         |
| FM-04-02 | Confirm dialog           | ✅ Done | Async confirm with loading spinner via `useConfirmStore`     |
| FM-04-03 | Filter popup             | ✅ Done | Composable: chips, range slider, date range                  |
| FM-04-04 | URL-synced pagination    | ✅ Done | `?page=N` in URL, browser back/forward support               |
| FM-04-05 | Return-page preservation | ✅ Done | Edit links carry `?returnPage=N`, redirect back after submit |

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

---

## Roadmap

| ID       | Feature                     | Priority | Status     |
| -------- | --------------------------- | -------- | ---------- |
| FM-03-07 | Mitra verify UI button      | P1       | 🔲 Planned |
| FM-05    | Leads Management            | P1       | ✅ Done    |
| FM-06    | Deposit Management          | P2       | 🔲 Planned |
| FM-07    | Service Category Management | P2       | 🔲 Planned |
| FM-08    | Dashboard Analytics         | P2       | ✅ Done    |
| FM-09    | Audit Log                   | P3       | 🔲 Planned |
| FM-10    | Role-based UI visibility    | P3       | 🔲 Planned |
