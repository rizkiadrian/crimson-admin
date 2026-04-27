# Requirements Document: Activity Log Review

## Introduction

Fitur Activity Log Review memungkinkan user Backoffice/Admin untuk melihat, mereview, dan mengubah status seluruh activity log yang dibuat oleh sales user. Fitur ini juga menyediakan sistem komentar (comment thread) antara backoffice reviewer dan sales owner, sehingga komunikasi terkait perubahan status dapat dilakukan secara terstruktur dan terkontrol.

**Estimasi Credit:** ~20 credits total

- Backend migration + model: ~1 credit
- Backend service + controller + routes: ~3 credits
- Backend comment system (CRUD + access control): ~3 credits
- Frontend backoffice activity log list page: ~3 credits
- Frontend backoffice activity log detail + status update: ~3 credits
- Frontend comment thread component: ~4 credits
- Frontend sales side updates (show reviewer + comments): ~2 credits
- Documentation: ~1 credit

## Glossary

- **Activity_Log**: Record aktivitas sales yang disimpan di tabel `activity_logs`, berisi type, title, description, attachment, dan status (pending/approved/rejected).
- **Backoffice_User**: User dengan role `admin` atau `backoffice` yang memiliki akses untuk mereview activity log.
- **Sales_User**: User dengan role `sales` yang membuat activity log.
- **Activity_Log_Comment**: Record komentar pada activity log, disimpan di tabel `activity_log_comments`.
- **Comment_Thread**: Kumpulan komentar pada satu activity log yang hanya bisa diakses oleh sales owner dan backoffice reviewer.
- **Reviewer**: Backoffice_User yang mengubah status activity log dari pending ke approved/rejected.
- **Status_Change**: Proses perubahan status activity log dari `pending` ke `approved` atau `rejected` oleh Reviewer.
- **CRM_Frontend**: Aplikasi Next.js (Lingkar CRM) yang menyediakan UI untuk backoffice dan sales.
- **Backend_API**: Aplikasi Laravel (Lingkar ID Backend) yang menyediakan REST API.

## Requirements

### Requirement 1: Backoffice Melihat Semua Activity Log

**User Story:** Sebagai Backoffice_User, saya ingin melihat semua activity log dari seluruh Sales_User, sehingga saya dapat mereview dan memproses permintaan mereka.

#### Acceptance Criteria

1. WHEN a Backoffice_User requests the activity log list, THE Backend_API SHALL return a paginated list of all Activity_Log records from all Sales_User ordered by creation date descending.
2. THE Backend_API SHALL include the Sales_User name and the related Lead information in each Activity_Log response item.
3. WHERE a search query is provided, THE Backend_API SHALL filter Activity_Log records by title or description matching the search query.
4. WHERE a status filter is provided, THE Backend_API SHALL filter Activity_Log records by the specified status value (pending, approved, or rejected).
5. WHERE a type filter is provided, THE Backend_API SHALL filter Activity_Log records by the specified activity type.
6. WHEN a Backoffice_User opens the Activity Log page in CRM_Frontend, THE CRM_Frontend SHALL display a table with columns: Sales Name, Title, Type, Status, Lead, and Created Date.
7. THE CRM_Frontend SHALL provide search input and filter controls for status and type on the Activity Log list page.

### Requirement 2: Backoffice Mengubah Status Activity Log

**User Story:** Sebagai Backoffice_User, saya ingin mengubah status activity log dari pending menjadi approved atau rejected dengan alasan, sehingga sales user mengetahui hasil review.

#### Acceptance Criteria

1. WHEN a Backoffice_User submits a status change request with a valid new status and reason, THE Backend_API SHALL update the Activity_Log status to the new value.
2. WHEN a Backoffice_User changes the status of an Activity_Log, THE Backend_API SHALL record the Backoffice_User ID in the `status_changed_by` field of the Activity_Log.
3. WHEN a Backoffice_User changes the status of an Activity_Log, THE Backend_API SHALL record the reason in the `status_change_reason` field of the Activity_Log.
4. WHEN a Backoffice_User changes the status of an Activity_Log, THE Backend_API SHALL record the timestamp in the `status_changed_at` field of the Activity_Log.
5. IF a Backoffice_User attempts to change the status of an Activity_Log that is not in pending status, THEN THE Backend_API SHALL return a 422 error with a descriptive message.
6. IF a Backoffice_User submits a status change without a reason, THEN THE Backend_API SHALL return a 422 validation error.
7. WHEN a Backoffice_User views the activity log detail in CRM_Frontend, THE CRM_Frontend SHALL display a status update form with status selection (approved/rejected) and a required reason text field.
8. WHILE an Activity_Log status is not pending, THE CRM_Frontend SHALL disable the status update form and display the existing status, reason, reviewer name, and timestamp.

### Requirement 3: Sales Melihat Reviewer

**User Story:** Sebagai Sales_User, saya ingin melihat siapa yang mengubah status activity log saya, sehingga saya mengetahui siapa yang mereview.

#### Acceptance Criteria

1. WHEN a Sales_User requests their activity log detail, THE Backend_API SHALL include the Reviewer name (from `status_changed_by` relation) in the response.
2. WHEN a Sales_User requests their activity log detail, THE Backend_API SHALL include the `status_change_reason` and `status_changed_at` in the response.
3. WHILE an Activity_Log has been reviewed, THE CRM_Frontend SHALL display the Reviewer name, reason, and review timestamp on the ActivityCard component.

### Requirement 4: Comment Thread pada Status Change

**User Story:** Sebagai Backoffice_User atau Sales_User, saya ingin berdiskusi melalui komentar pada activity log yang sudah direview, sehingga komunikasi terkait review tercatat dengan baik.

#### Acceptance Criteria

1. WHEN a Backoffice_User changes the status of an Activity_Log, THE Backend_API SHALL allow the Backoffice_User to include an optional initial comment.
2. WHEN a user with comment access requests the comment list for an Activity_Log, THE Backend_API SHALL return all Activity_Log_Comment records ordered by creation date ascending.
3. WHEN a user with comment access submits a new comment, THE Backend_API SHALL create an Activity_Log_Comment record with the user ID, activity log ID, and comment body.
4. THE Backend_API SHALL include the commenter name and role in each Activity_Log_Comment response item.
5. WHEN a new comment is added to an Activity_Log, THE CRM_Frontend SHALL display the comment in the Comment_Thread with the commenter name, role badge, comment body, and relative timestamp.
6. THE CRM_Frontend SHALL display a comment input form at the bottom of the Comment_Thread for users with comment access.
7. WHILE an Activity_Log status is still pending (not yet reviewed), THE CRM_Frontend SHALL not display the Comment_Thread section.

### Requirement 5: Access Control untuk Comment Thread

**User Story:** Sebagai sistem, saya ingin membatasi akses komentar hanya kepada sales owner dan backoffice reviewer, sehingga privasi diskusi terjaga.

#### Acceptance Criteria

1. THE Backend_API SHALL restrict comment creation access to only the Sales_User who owns the Activity_Log AND the Backoffice_User who changed the status (recorded in `status_changed_by`).
2. THE Backend_API SHALL restrict comment list access to only the Sales_User who owns the Activity_Log AND the Backoffice_User who changed the status (recorded in `status_changed_by`).
3. IF a user without comment access attempts to create a comment, THEN THE Backend_API SHALL return a 403 Forbidden error.
4. IF a user without comment access attempts to view comments, THEN THE Backend_API SHALL return a 403 Forbidden error.
5. THE CRM_Frontend SHALL hide the Comment_Thread section for users who do not have comment access to the Activity_Log.

### Requirement 6: Database Schema untuk Comment dan Status Tracking

**User Story:** Sebagai developer, saya ingin schema database yang mendukung fitur review dan komentar, sehingga data tersimpan dengan benar.

#### Acceptance Criteria

1. THE Backend_API SHALL add `status_changed_by` (nullable foreign key to users), `status_change_reason` (nullable text), and `status_changed_at` (nullable timestamp) columns to the `activity_logs` table.
2. THE Backend_API SHALL create an `activity_log_comments` table with columns: id, activity_log_id (foreign key), user_id (foreign key), body (text), and timestamps.
3. THE Backend_API SHALL enforce cascading delete on `activity_log_comments` when the parent Activity_Log is deleted.
4. THE Backend_API SHALL enforce that `activity_log_comments.activity_log_id` references a valid Activity_Log record.
5. THE Backend_API SHALL enforce that `activity_log_comments.user_id` references a valid User record.

### Requirement 7: Notifikasi dan Deep Link ke Activity Detail

**User Story:** Sebagai Sales_User atau Backoffice_User, saya ingin mendapatkan notifikasi ketika ada perubahan status atau komentar baru pada activity log, sehingga saya bisa segera merespons tanpa harus mengecek secara manual.

#### Acceptance Criteria

1. WHEN a Backoffice_User changes the status of an Activity_Log, THE Backend_API SHALL create a notification for the Sales_User who owns the Activity_Log with a message indicating the new status and the reviewer name.
2. WHEN a Backoffice_User adds a comment on an Activity_Log, THE Backend_API SHALL create a notification for the Sales_User who owns the Activity_Log with a message indicating a new comment from the reviewer.
3. WHEN a Sales_User adds a comment on an Activity_Log, THE Backend_API SHALL create a notification for the Backoffice_User who reviewed the Activity_Log (recorded in `status_changed_by`) with a message indicating a new reply from the sales user.
4. EACH notification created for status change or comment SHALL include a `link` field containing the URL path to the activity log detail page (e.g., `/dashboard/activity-logs/{id}` for backoffice, `/sales-activities/{id}` for sales).
5. WHEN a user clicks on a notification in the CRM_Frontend, THE CRM_Frontend SHALL navigate the user to the activity log detail page referenced in the notification `link` field.
6. THE notification for sales users SHALL use the existing sales notification mechanism (if available) or create a new `sales_notifications` table following the same pattern as `backoffice_notifications`.
7. THE notification for backoffice users SHALL use the existing `BackofficeNotification` model and `NotifyBackofficeUsers` dispatch pattern, but targeted to the specific reviewer user only (not all backoffice users).

## Estimasi Credit (Updated)

| Area                                                    | Estimasi          | Detail                                                                                             |
| ------------------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------------------- |
| Backend migration + model                               | ~1.5 credits      | `activity_log_comments` table, kolom baru di `activity_logs`, sales notification table (jika baru) |
| Backend service + controller + routes                   | ~3 credits        | Backoffice activity log list, detail, status update                                                |
| Backend comment system (CRUD + access control)          | ~3 credits        | Comment CRUD, access control logic                                                                 |
| Backend notification system                             | ~2 credits        | Notif saat status change, comment, deep link URL                                                   |
| Frontend backoffice activity log list page              | ~3 credits        | Table dengan search, filter status/type                                                            |
| Frontend backoffice activity log detail + status update | ~3 credits        | Detail page + form approve/reject dengan reason                                                    |
| Frontend comment thread component                       | ~4 credits        | Comment list + reply form + real-time display                                                      |
| Frontend sales side updates (reviewer info + comments)  | ~2 credits        | Tampilkan reviewer info + comment thread di sales detail                                           |
| Frontend notification deep link                         | ~1 credit         | Klik notif → navigate ke activity detail                                                           |
| Documentation                                           | ~1 credit         | PRD, ARCHITECTURE, README, CLAUDE                                                                  |
| **Total**                                               | **~24.5 credits** |                                                                                                    |
