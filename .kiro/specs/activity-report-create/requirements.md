# Requirements Document

## Introduction

Fitur ini menyempurnakan form "Create Activity Report" pada modul Sales Activities di Lingkar CRM. Form ini memungkinkan sales user untuk membuat activity log baru melalui `POST /api/v1/sales/activity-logs`. Fitur mencakup: field kondisional "Requested Sales Member ID" yang auto-populated dan read-only saat tipe aktivitas adalah `request_lead_assign`, submit form lengkap dengan error handling, serta verifikasi bahwa backend mengirim notifikasi ke semua backoffice user saat activity report dibuat.

## Glossary

- **Create_Form**: Halaman form di `/sales-activities/create` yang digunakan sales user untuk membuat activity report baru
- **Activity_Log_Service**: Service layer frontend (`activityLogsService`) yang berkomunikasi dengan backend API `/sales/activity-logs`
- **User_Profile_Store**: Zustand store (`useUserProfile`) yang menyimpan data user yang sedang login, termasuk `sales_id`
- **Sales_ID**: Identifier unik sales user dalam format string (contoh: "SLS-0002"), tersimpan di field `sales_id` pada model User
- **Activity_Type_Selector**: Dropdown select pada form yang menentukan tipe activity log (`general_note`, `request_lead_assign`, `request_update_lead_status`)
- **Backend_API**: Endpoint `POST /api/v1/sales/activity-logs` yang menerima dan memproses pembuatan activity log
- **NotifyBackofficeUsers_Job**: Async job di backend yang membuat notifikasi persisten untuk semua user dengan role admin/backoffice

## Requirements

### Requirement 1: Service Layer Create Function

**User Story:** As a developer, I want a typed service function for creating activity logs, so that the form component can submit data to the backend API without making direct API calls.

#### Acceptance Criteria

1. THE Activity_Log_Service SHALL expose a `createActivityLog` function that accepts form data and sends a `POST` request to `/sales/activity-logs`
2. WHEN the form data includes a file attachment, THE Activity_Log_Service SHALL send the request as `multipart/form-data` instead of JSON
3. THE Activity_Log_Service SHALL return the created activity log object matching the `IActivityLog` type on success
4. IF the backend returns a validation error (HTTP 422), THEN THE Activity_Log_Service SHALL propagate the error with field-level error messages

### Requirement 2: Conditional Requested Sales Member ID Field

**User Story:** As a sales user, I want the "Requested Sales Member ID" field to automatically show my sales_id when I select "Request Lead Assign" type, so that the backoffice knows which sales member is making the request without me having to type it manually.

#### Acceptance Criteria

1. WHEN the Activity_Type_Selector value is `request_lead_assign`, THE Create_Form SHALL display a "Requested Sales Member ID" input field
2. WHEN the Activity_Type_Selector value is NOT `request_lead_assign`, THE Create_Form SHALL hide the "Requested Sales Member ID" input field
3. WHEN the "Requested Sales Member ID" field is displayed, THE Create_Form SHALL auto-populate it with the current user's Sales_ID from the User_Profile_Store
4. THE "Requested Sales Member ID" input field SHALL be read-only and visually indicate that it cannot be edited by the user
5. IF the User_Profile_Store does not contain a Sales_ID value, THEN THE Create_Form SHALL display a placeholder text "Sales ID tidak tersedia" in the field

### Requirement 3: Form Submission and Validation

**User Story:** As a sales user, I want to submit the activity report form and receive clear feedback, so that I know whether my report was created successfully or what errors need to be fixed.

#### Acceptance Criteria

1. WHEN the user submits the form with valid data, THE Create_Form SHALL call the Activity_Log_Service `createActivityLog` function with the form payload
2. WHEN the activity log is created successfully, THE Create_Form SHALL navigate the user back to the sales activities list page
3. WHEN the activity log is created successfully, THE Create_Form SHALL display a success toast notification with the message from the backend
4. IF the backend returns validation errors, THEN THE Create_Form SHALL display field-level error messages below the corresponding form inputs
5. IF the backend returns a general error, THEN THE Create_Form SHALL display an error toast notification with the error message
6. WHILE the form is being submitted, THE Create_Form SHALL disable the submit button and show a loading indicator
7. THE Create_Form SHALL validate that the "Title" field is not empty before submitting to the backend
8. WHEN the activity type is `request_update_lead_status`, THE Create_Form SHALL include `metadata.requested_status` in the submission payload
9. WHEN the activity type is `request_lead_assign`, THE Create_Form SHALL include `metadata.requested_sales_id` with the current user's Sales_ID in the submission payload

### Requirement 4: Frontend Type Correction for Sales ID

**User Story:** As a developer, I want the `IUserAuth` type to correctly reflect the `sales_id` field as a string, so that TypeScript type checking works correctly when accessing the user's sales ID.

#### Acceptance Criteria

1. THE `IUserAuth` interface SHALL define the `sales_id` field as type `string | null` instead of `number | null`
2. FOR ALL components that reference `sales_id` from the user profile, THE type system SHALL enforce string-based access without type casting

### Requirement 5: Backend Notification Verification

**User Story:** As a product owner, I want to verify that all backoffice users receive a notification when a sales user creates an activity report, so that requests are promptly reviewed.

#### Acceptance Criteria

1. WHEN a new activity log is created via the Backend_API, THE ActivityLogService SHALL dispatch the NotifyBackofficeUsers_Job
2. THE NotifyBackofficeUsers_Job SHALL create a notification record for each user with role `admin` or `backoffice`
3. THE notification SHALL contain the sales user's name, the action performed, and the activity log title
