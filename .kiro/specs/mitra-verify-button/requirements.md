# Requirements Document

## Introduction

This feature adds a "Verify" button to the Mitra Members table in the Lingkar CRM backoffice dashboard. Currently, the backend API endpoint for updating Mitra verification status exists (`PATCH /mitra-members/{id}/verification-status`), but the CRM frontend has no UI control to trigger it from the table view. This feature bridges that gap by adding an inline verify/approve button in the Mitra table row actions, following the same pattern established by the Client Members verify button (FM-02-07).

Unlike Client Members (which use a simple boolean `is_verified`), Mitra Members have a 4-state verification status (`pending`, `approved`, `rejected`, `suspended`). The verify button will specifically transition a Mitra from `pending` status to `approved`.

## Glossary

- **CRM**: The Lingkar CRM backoffice dashboard (Next.js application)
- **Mitra_Table**: The paginated table component displaying Mitra members at `/dashboard/mitra-members`
- **Mitra_Actions**: The action buttons component rendered in each Mitra table row
- **Verification_Service**: The typed service function in `src/services/backoffice/mitra-members/` that calls the backend verification status endpoint
- **Confirm_Dialog**: The global Zustand-driven confirmation modal (`useConfirmStore`) used for destructive or significant actions
- **Toast**: The notification toast system (`useNotificationStore`) for success/error feedback
- **Backend_API**: The Laravel backend endpoint `PATCH /api/v1/backoffice/mitra-members/{id}/verification-status`

## Requirements

### Requirement 1: Service Layer Function

**User Story:** As a developer, I want a typed service function for updating Mitra verification status, so that the UI can call the backend endpoint without direct API calls.

#### Acceptance Criteria

1. THE Verification_Service SHALL expose a function `mitraMembersUpdateVerificationStatus(id: number, status: string)` that calls `PATCH /backoffice/mitra-members/{id}/verification-status` with `{ verification_status: status }` as the request body
2. THE Verification_Service SHALL return a typed `IApiResponse<IMitraUser>` response from the function
3. THE Verification_Service SHALL accept only valid status values: `pending`, `approved`, `rejected`, `suspended`

### Requirement 2: Verify Button Visibility

**User Story:** As a backoffice operator, I want to see a verify button only for Mitra members whose status is `pending`, so that I can quickly identify and approve pending verifications.

#### Acceptance Criteria

1. WHILE a Mitra member has `verification_status` equal to `pending`, THE Mitra_Actions SHALL display a verify button with a ShieldCheck icon
2. WHILE a Mitra member has `verification_status` equal to `approved`, `rejected`, or `suspended`, THE Mitra_Actions SHALL hide the verify button
3. THE Mitra_Actions SHALL render the verify button using the `Button` component from `@app/components/ui/Button` with `variant="ghost"` and `size="icon"`
4. THE Mitra_Actions SHALL apply success-themed hover styling (`hover:text-success-600 hover:bg-success-50`) to the verify button
5. THE Mitra_Actions SHALL include `aria-label="Verify"` on the verify button for accessibility

### Requirement 3: Confirmation Dialog

**User Story:** As a backoffice operator, I want a confirmation dialog before verifying a Mitra, so that I do not accidentally approve a partner without reviewing their documents.

#### Acceptance Criteria

1. WHEN the operator clicks the verify button, THE Confirm_Dialog SHALL display with a title indicating Mitra verification approval
2. WHEN the operator clicks the verify button, THE Confirm_Dialog SHALL display a description explaining that the Mitra status will change to `approved`
3. THE Confirm_Dialog SHALL display a confirm button labeled "Approve" and a cancel button labeled "Batal"
4. WHEN the operator clicks "Batal", THE Confirm_Dialog SHALL close without making any API call

### Requirement 4: Verification Execution

**User Story:** As a backoffice operator, I want the system to call the verification API and update the table when I confirm, so that the Mitra status is updated immediately.

#### Acceptance Criteria

1. WHEN the operator confirms the verification, THE Verification_Service SHALL send a PATCH request with `{ verification_status: "approved" }` to the Backend_API
2. WHEN the Backend_API returns a success response, THE Toast SHALL display the success message from the API response
3. WHEN the Backend_API returns a success response, THE Mitra_Table SHALL refetch the current page data to reflect the updated status
4. WHEN the Backend_API returns an error response, THE Toast SHALL display the error message from the API response
5. IF the Backend_API returns an error response, THEN THE Confirm_Dialog SHALL close and the Mitra_Table data SHALL remain unchanged
6. WHILE the verification request is in progress, THE Confirm_Dialog SHALL display a loading state on the confirm button

### Requirement 5: Detail Page Verify Action

**User Story:** As a backoffice operator, I want to verify a Mitra from the detail page as well, so that I can approve after reviewing their documents without going back to the table.

#### Acceptance Criteria

1. WHILE viewing a Mitra detail page with `verification_status` equal to `pending`, THE Detail_Page SHALL display a "Verify" button in the header actions area
2. WHILE viewing a Mitra detail page with `verification_status` not equal to `pending`, THE Detail_Page SHALL hide the verify button
3. WHEN the operator clicks the verify button on the detail page, THE Confirm_Dialog SHALL display with the same confirmation flow as the table row button
4. WHEN the Backend_API returns a success response from the detail page, THE Detail_Page SHALL refetch the Mitra data to reflect the updated status badge
