# Requirements Document: Deposit Request Management

## Introduction

Deposit Request Management enables backoffice/admin users to review, approve, or reject deposit requests submitted by clients through the Lingkar mobile app. When a deposit is approved, the system credits the client's wallet balance and creates an auditable wallet transaction record. When a deposit is rejected, the system records the rejection reason. Both outcomes trigger an async notification to the client. The backoffice dashboard also displays a pending deposit count widget for at-a-glance monitoring.

This feature follows the Activity Log Review pattern (list → detail → approve/reject workflow) already established in the codebase, adapted for the financial deposit context with wallet balance mutation and transaction logging.

## Glossary

- **Deposit_Request_Management_API**: The set of Laravel backoffice API endpoints for listing, viewing, approving, and rejecting deposit requests
- **Deposit_Request_List_Page**: The Next.js CRM page that displays a paginated, searchable, filterable table of all deposit requests
- **Deposit_Request_Detail_Page**: The Next.js CRM page that displays full deposit request information and provides the approve/reject form
- **Deposit_Approval_Service**: The Laravel service class that handles the approve workflow (status update, wallet credit, transaction record, notification)
- **Deposit_Rejection_Service**: The reject workflow within the same service (status update with reason, notification)
- **Wallet**: The user's digital wallet (one per user, auto-created on registration via UserObserver) with a decimal balance
- **Wallet_Transaction**: An immutable ledger record capturing balance_before, amount, balance_after for each wallet mutation, with a unique idempotency constraint on (reference_type, reference_id, type)
- **Client_Notification**: A persistent notification record for client users, following the same pattern as BackofficeNotification and SalesNotification
- **NotifyClientUser_Job**: An async queued job that creates a Client_Notification record for a specific client user
- **Dashboard_Widget**: A StatCard component on the backoffice dashboard showing pending deposit request count
- **Backoffice_User**: A user with role Admin or Backoffice who has access to the deposit management endpoints

## Requirements

### Requirement 1: Deposit Request List API

**User Story:** As a backoffice user, I want to retrieve a paginated list of all deposit requests with search and filter capabilities, so that I can efficiently find and review pending deposits.

#### Acceptance Criteria

1. THE Deposit_Request_Management_API SHALL return a paginated list of deposit requests ordered by created_at descending
2. THE Deposit_Request_Management_API SHALL eager-load the associated user relation (id, name, email) for each deposit request
3. WHEN a search query parameter is provided, THE Deposit_Request_Management_API SHALL filter deposit requests by reference_code or user name using case-insensitive matching
4. WHEN a status filter parameter is provided, THE Deposit_Request_Management_API SHALL return only deposit requests matching the specified status (pending, approved, rejected, expired)
5. WHEN a payment_method filter parameter is provided, THE Deposit_Request_Management_API SHALL return only deposit requests matching the specified payment method
6. THE Deposit_Request_Management_API SHALL require authentication and the role:admin,backoffice middleware
7. THE Deposit_Request_Management_API SHALL return responses in the standard ApiResponse format with pagination metadata

### Requirement 2: Deposit Request Detail API

**User Story:** As a backoffice user, I want to view the full details of a single deposit request including the client information and attachment, so that I can make an informed approval decision.

#### Acceptance Criteria

1. THE Deposit_Request_Management_API SHALL return a single deposit request with eager-loaded user relation and attachment URL
2. WHEN the deposit request has an attachment, THE Deposit_Request_Management_API SHALL include the full attachment URL in the response
3. IF the specified deposit request does not exist, THEN THE Deposit_Request_Management_API SHALL return a 404 error response
4. THE Deposit_Request_Management_API SHALL include the reviewer information (reviewed_by user relation, review_reason, reviewed_at) when the deposit has been reviewed

### Requirement 3: Deposit Request Approval

**User Story:** As a backoffice user, I want to approve a deposit request so that the client's wallet balance is credited and a transaction record is created.

#### Acceptance Criteria

1. WHEN a backoffice user submits an approval, THE Deposit_Approval_Service SHALL update the deposit request status to "approved" and record the reviewer ID and review timestamp
2. WHEN a deposit request is approved, THE Deposit_Approval_Service SHALL locate the client's Wallet by user_id and credit the wallet balance by the deposit amount
3. WHEN a deposit request is approved, THE Deposit_Approval_Service SHALL create a Wallet_Transaction record with type "credit", the deposit amount, balance_before, balance_after, reference_type "deposit_request", and reference_id set to the deposit request ID
4. THE Deposit_Approval_Service SHALL execute the status update, wallet credit, and transaction creation within a single database transaction to ensure atomicity
5. IF the deposit request status is not "pending", THEN THE Deposit_Approval_Service SHALL return a 422 error indicating the deposit has already been processed
6. IF the client's Wallet has status "locked" or "banned", THEN THE Deposit_Approval_Service SHALL return a 422 error indicating the wallet is not active
7. WHEN a deposit request is approved, THE Deposit_Approval_Service SHALL dispatch a NotifyClientUser_Job to notify the client

### Requirement 4: Deposit Request Rejection

**User Story:** As a backoffice user, I want to reject a deposit request with a reason, so that the client is informed why the deposit was not accepted.

#### Acceptance Criteria

1. WHEN a backoffice user submits a rejection, THE Deposit_Rejection_Service SHALL update the deposit request status to "rejected", record the reviewer ID, review timestamp, and the rejection reason
2. THE Deposit_Rejection_Service SHALL require a non-empty reason string (max 1000 characters) for rejection
3. IF the deposit request status is not "pending", THEN THE Deposit_Rejection_Service SHALL return a 422 error indicating the deposit has already been processed
4. WHEN a deposit request is rejected, THE Deposit_Rejection_Service SHALL dispatch a NotifyClientUser_Job to notify the client with the rejection reason

### Requirement 5: Client Notification on Deposit Status Change

**User Story:** As a client, I want to receive a notification when my deposit request is approved or rejected, so that I am informed of the outcome.

#### Acceptance Criteria

1. THE NotifyClientUser_Job SHALL implement the ShouldQueue interface and create a Client_Notification record for the target client user
2. WHEN a deposit is approved, THE NotifyClientUser_Job SHALL create a notification with type "deposit_approved", a title indicating approval, and a message including the deposit amount
3. WHEN a deposit is rejected, THE NotifyClientUser_Job SHALL create a notification with type "deposit_rejected", a title indicating rejection, and a message including the rejection reason
4. THE Client_Notification model SHALL follow the same schema pattern as BackofficeNotification and SalesNotification (user_id, type, title, message, link, read_at, reference_type, reference_id)

### Requirement 6: Deposit Request Migration Updates

**User Story:** As a developer, I want the deposit_requests table to have reviewer tracking fields, so that the system records who reviewed each deposit and when.

#### Acceptance Criteria

1. THE database migration SHALL add a nullable reviewed_by column (foreignId constrained to users, nullOnDelete) to the deposit_requests table
2. THE database migration SHALL add a nullable review_reason column (text) to the deposit_requests table
3. THE database migration SHALL add a nullable reviewed_at column (timestamp) to the deposit_requests table

### Requirement 7: Client Notification Infrastructure

**User Story:** As a developer, I want a client_notifications table and model following the existing notification pattern, so that client users can receive persistent notifications.

#### Acceptance Criteria

1. THE database migration SHALL create a client_notifications table with columns: id, user_id (foreignId constrained to users, cascadeOnDelete), type (string), title (string), message (text), link (nullable string), read_at (nullable timestamp), reference_type (nullable string), reference_id (nullable uuid), timestamps
2. THE Client_Notification model SHALL define constants for notification types: TYPE_DEPOSIT_APPROVED and TYPE_DEPOSIT_REJECTED
3. THE Client_Notification model SHALL include a scopeUnread query scope that filters by null read_at

### Requirement 8: Deposit Request List Page (Frontend)

**User Story:** As a backoffice user, I want a CRM page that displays all deposit requests in a table with search and filters, so that I can browse and manage deposits efficiently.

#### Acceptance Criteria

1. THE Deposit_Request_List_Page SHALL display a paginated table using the TableCard component with columns: Client Name, Reference Code, Amount (formatted as Indonesian Rupiah), Payment Method, Status (badge), Created Date
2. THE Deposit_Request_List_Page SHALL provide a SearchInput for searching by reference code or client name
3. THE Deposit_Request_List_Page SHALL provide a FilterPopup for filtering by status (pending, approved, rejected, expired) and payment method
4. THE Deposit_Request_List_Page SHALL synchronize pagination state with URL query parameters using the useTableData hook
5. WHEN a table row is clicked, THE Deposit_Request_List_Page SHALL navigate to the deposit request detail page
6. THE Deposit_Request_List_Page SHALL be accessible via the sidebar navigation under a "Finance" or appropriate group

### Requirement 9: Deposit Request Detail Page (Frontend)

**User Story:** As a backoffice user, I want a detail page for each deposit request that shows all information and provides approve/reject actions, so that I can review and process deposits.

#### Acceptance Criteria

1. THE Deposit_Request_Detail_Page SHALL display deposit request details using the DetailCard component: client name, email, reference code, amount (formatted as Indonesian Rupiah), payment method, status (badge), created date
2. WHEN the deposit request has an attachment, THE Deposit_Request_Detail_Page SHALL display the attachment as a clickable image preview (or file download link for non-image files)
3. WHILE the deposit request status is "pending", THE Deposit_Request_Detail_Page SHALL display an action form with a FormSelect for status (approved/rejected), a FormTextarea for reason (required for rejection), and a submit Button
4. WHILE the deposit request status is not "pending", THE Deposit_Request_Detail_Page SHALL display read-only review information: reviewer name, reason, and review timestamp
5. WHEN the approve/reject form is submitted, THE Deposit_Request_Detail_Page SHALL call the service layer and display a toast notification on success or error
6. THE Deposit_Request_Detail_Page SHALL use the useDetailData hook for data fetching

### Requirement 10: Frontend Service Layer

**User Story:** As a developer, I want typed service functions and interfaces for the deposit request API, so that frontend components have type-safe API access.

#### Acceptance Criteria

1. THE service layer SHALL define TypeScript interfaces for IDepositRequest (with user relation, attachment_url, reviewer fields), IDepositRequestParams (pagination, search, status filter, payment_method filter), and IUpdateDepositStatusPayload (status, reason)
2. THE service layer SHALL provide functions for list (paginated with params), detail (by ID), and updateStatus (by ID with payload)
3. THE service layer SHALL follow the existing service pattern with barrel exports from an index.ts file

### Requirement 11: Dashboard Pending Deposit Widget

**User Story:** As a backoffice user, I want to see the count of pending deposit requests on the dashboard, so that I can quickly identify deposits awaiting review.

#### Acceptance Criteria

1. THE DashboardService SHALL include a deposits summary in the dashboard response containing the total count and pending count of deposit requests
2. THE Dashboard_Widget SHALL display the pending deposit count using a StatCard component on the backoffice dashboard page
3. THE Dashboard_Widget SHALL display a description showing the pending count relative to the total (e.g., "N pending review")

### Requirement 12: Sidebar Navigation

**User Story:** As a backoffice user, I want a navigation entry for deposit request management in the sidebar, so that I can easily access the feature.

#### Acceptance Criteria

1. THE sidebar navigation SHALL include a "Deposit Requests" menu item under an appropriate navigation group
2. THE sidebar menu item SHALL use an appropriate icon from lucide-react (e.g., Wallet or CreditCard)
3. THE sidebar menu item SHALL link to the Deposit_Request_List_Page path
4. THE routing configuration SHALL define paths for depositRequests (list) and depositRequestDetail (by ID) in the centralized PATHS object

### Requirement 13: DepositRequest Model Updates

**User Story:** As a developer, I want the DepositRequest model to include reviewer relations and attachment URL accessors, so that the API responses contain complete information.

#### Acceptance Criteria

1. THE DepositRequest model SHALL include reviewed_by, review_reason, and reviewed_at in the fillable array
2. THE DepositRequest model SHALL define a reviewedBy relationship (belongsTo User via reviewed_by column)
3. THE DepositRequest model SHALL define an attachment_url accessor that returns the full Storage URL when an attachment exists, or null otherwise
4. THE DepositRequest model SHALL append attachment_url to API responses via the $appends array
5. THE DepositRequest model SHALL define a scopeSearch query scope for case-insensitive search across reference_code and the related user name
