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

| ID       | Feature              | Status             | Description                                                            |
| -------- | -------------------- | ------------------ | ---------------------------------------------------------------------- |
| FM-02-01 | List with pagination | ✅ Done            | Shows verification status badge (Verified/Unverified)                  |
| FM-02-02 | Create client        | ✅ Done            | Creates user + profile (async) + sends welcome email                   |
| FM-02-03 | Edit client          | ✅ Done            | Updates user + syncs profile (async) + sends change notification email |
| FM-02-04 | Delete client        | ✅ Done            | Soft deletes user + removes profile (async) + sends deletion email     |
| FM-02-05 | Filter popup         | ✅ Done            | Verification status chips, date range                                  |
| FM-02-06 | Manual verify        | ✅ Done (API only) | `PATCH .../verify` sets `is_verified=true` + sends verification email  |
| FM-02-07 | Verify UI button     | 🔲 Planned         | Inline verify button in table row for unverified clients               |

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

### FM-03: Navigation

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

## Roadmap

| ID       | Feature                     | Priority | Status     |
| -------- | --------------------------- | -------- | ---------- |
| FM-02-07 | Client verify UI button     | P1       | 🔲 Planned |
| FM-05    | Mitra Management            | P1       | 🔲 Planned |
| FM-06    | Deposit Management          | P2       | 🔲 Planned |
| FM-07    | Service Category Management | P2       | 🔲 Planned |
| FM-08    | Dashboard Analytics         | P2       | 🔲 Planned |
| FM-09    | Audit Log                   | P3       | 🔲 Planned |
| FM-10    | Role-based UI visibility    | P3       | 🔲 Planned |
