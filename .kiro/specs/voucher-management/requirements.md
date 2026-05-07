# Requirements Document

## Introduction

Fitur Voucher Management menyediakan sistem voucher yang fleksibel untuk marketplace layanan Lingkar. Backoffice admin membuat dan mengelola voucher melalui CRM (Next.js), sementara backend (Laravel) menyediakan API validasi dan redemption yang siap dikonsumsi oleh mobile app di fase berikutnya. Sistem mendukung empat tipe diskon: percentage (dengan max cap), fixed amount, free service, dan commission discount (untuk mitra). Voucher dapat ditargetkan ke Client, Mitra, atau keduanya, dengan distribusi melalui public code, auto-assign ke wallet pengguna, atau kombinasi keduanya. Scope implementasi mencakup CRM (backoffice UI) dan Backend API — integrasi mobile app ditangguhkan ke fase berikutnya.

## Glossary

- **Voucher_API**: Endpoint Laravel di bawah prefix `/api/v1/backoffice/vouchers` yang menangani operasi CRUD voucher untuk backoffice.
- **Voucher_Validation_API**: Endpoint Laravel di bawah prefix `/api/v1/vouchers` yang menangani validasi dan redemption voucher untuk mobile app.
- **Voucher_Editor**: Halaman CRM yang menyediakan form pembuatan dan pengeditan voucher, termasuk conditional fields berdasarkan discount type.
- **Voucher_List_Page**: Halaman CRM yang menampilkan daftar voucher dengan filter, search, dan status badges.
- **Voucher_Detail_Page**: Halaman CRM yang menampilkan detail voucher beserta usage stats dan assigned users.
- **BackofficeVoucherService**: Service layer Laravel (`app/Services/Backoffice/BackofficeVoucherService.php`) yang menangani CRUD, assign, dan toggle voucher.
- **VoucherValidationService**: Service layer Laravel (`app/Services/Voucher/VoucherValidationService.php`) yang menangani validasi dan redemption voucher.
- **Backoffice_User**: Pengguna dengan role admin atau backoffice yang memiliki akses ke fitur Voucher Management di CRM.
- **Client_User**: Pengguna mobile app dengan role client yang dapat menggunakan voucher saat checkout.
- **Mitra_User**: Pengguna mobile app dengan role mitra yang dapat menerima commission discount voucher.
- **Voucher_Wallet**: Kumpulan voucher yang telah di-assign ke pengguna tertentu melalui mekanisme auto-assign atau manual assignment.
- **Target_Segment**: Kriteria segmentasi pengguna yang menentukan siapa yang eligible menerima voucher (new_user, verified_only, specific_users, all).
- **Quota**: Batas global penggunaan voucher. Null berarti unlimited.
- **Per_User_Limit**: Batas maksimal penggunaan voucher per pengguna individual.

## Requirements

### Requirement 1: Voucher CRUD Operations

**User Story:** As a Backoffice_User, I want to create, view, edit, and delete vouchers, so that I can manage promotional vouchers for the Lingkar marketplace.

#### Acceptance Criteria

1. THE Voucher_API SHALL provide a paginated list endpoint that returns all vouchers with support for filtering by discount_type, target_user_type, is_active status, and date_range.
2. THE Voucher_API SHALL provide a search capability that filters vouchers by code or name.
3. THE Voucher_API SHALL provide a detail endpoint that returns a single voucher by its identifier, including usage statistics.
4. WHEN a Backoffice_User submits a valid voucher creation request, THE Voucher_API SHALL create a new voucher record and return the created voucher data.
5. WHEN a Backoffice_User submits a valid voucher update request, THE Voucher_API SHALL update the existing voucher record and return the updated voucher data.
6. WHEN a Backoffice_User submits a voucher deletion request, THE Voucher_API SHALL soft-delete the voucher record and return a success response.
7. THE Voucher_API SHALL provide an endpoint to toggle the is_active status of a voucher between active and inactive.

### Requirement 2: Voucher Creation Validation

**User Story:** As a Backoffice_User, I want the system to validate my voucher inputs, so that only valid and consistent voucher configurations are saved.

#### Acceptance Criteria

1. THE Voucher_API SHALL validate that the voucher code is unique (case-insensitive) when provided, returning a 422 error if a duplicate exists.
2. THE Voucher_API SHALL validate that starts_at is before expires_at.
3. THE Voucher_API SHALL validate that discount_value for percentage type is between 1 and 100.
4. THE Voucher_API SHALL validate that discount_type is one of: "percentage", "fixed_amount", "free_service", or "commission_discount".
5. THE Voucher_API SHALL validate that target_user_type is one of: "client", "mitra", or "all".
6. THE Voucher_API SHALL validate that distribution_type is one of: "public_code", "auto_assign", or "both".
7. WHEN discount_type is "commission_discount", THE Voucher_API SHALL enforce target_user_type to be "mitra".
8. WHEN discount_type is "free_service", THE Voucher_API SHALL require a valid service_category_id.
9. WHEN discount_type is "percentage", THE Voucher_API SHALL require max_discount_cap to be provided.
10. WHEN distribution_type is "public_code" or "both", THE Voucher_API SHALL require a non-empty code field.

### Requirement 3: Voucher Edit Restrictions

**User Story:** As a Backoffice_User, I want the system to prevent changes that would invalidate existing voucher usage, so that data integrity is maintained for used vouchers.

#### Acceptance Criteria

1. WHEN a voucher has been used (used_count > 0), THE Voucher_API SHALL reject changes to the discount_type field with a 422 error.
2. WHEN a voucher has been used (used_count > 0), THE Voucher_API SHALL reject changes to the code field with a 422 error.
3. WHEN a voucher has been used (used_count > 0), THE Voucher_Editor SHALL display a warning notice informing the Backoffice_User that discount_type and code cannot be changed.
4. THE Voucher_API SHALL allow updates to all other fields regardless of usage status.

### Requirement 4: Voucher Discount Type Configuration

**User Story:** As a Backoffice_User, I want the form to show relevant fields based on the selected discount type, so that I only fill in applicable configuration.

#### Acceptance Criteria

1. WHEN discount_type is "percentage", THE Voucher_Editor SHALL display discount_value (as percentage input) and max_discount_cap fields.
2. WHEN discount_type is "fixed_amount", THE Voucher_Editor SHALL display discount_value (as Rupiah amount input) and hide max_discount_cap.
3. WHEN discount_type is "free_service", THE Voucher_Editor SHALL display service_category_id selector (required) and hide discount_value and max_discount_cap.
4. WHEN discount_type is "commission_discount", THE Voucher_Editor SHALL display discount_value (as percentage input), hide max_discount_cap, and force target_user_type to "mitra" (disabling the target selector).

### Requirement 5: Voucher User Assignment

**User Story:** As a Backoffice_User, I want to assign vouchers to specific users, so that targeted users receive vouchers in their wallet.

#### Acceptance Criteria

1. THE Voucher_API SHALL provide an endpoint to assign a voucher to one or more specific users.
2. WHEN a voucher is assigned to a user, THE Voucher_API SHALL create a voucher_user record with assigned_at timestamp and usage_count of 0.
3. IF a voucher is already assigned to a user, THEN THE Voucher_API SHALL return a 422 error with message "User sudah memiliki voucher ini".
4. THE Voucher_Detail_Page SHALL display a table of assigned users with their assignment status (used/unused).
5. THE Voucher_Detail_Page SHALL provide an "Assign to User" action button that opens a modal with a user picker.

### Requirement 6: Voucher Validation (Mobile API)

**User Story:** As a Client_User, I want to validate a voucher code before checkout, so that I can see the discount amount before completing my transaction.

#### Acceptance Criteria

1. THE Voucher_Validation_API SHALL provide a validate endpoint that checks voucher eligibility without redeeming.
2. WHEN a valid voucher code and transaction details are submitted, THE Voucher_Validation_API SHALL return the calculated discount amount and final transaction amount.
3. THE Voucher_Validation_API SHALL verify that the voucher exists and is_active is true.
4. THE Voucher_Validation_API SHALL verify that the current time is between starts_at and expires_at.
5. THE Voucher_Validation_API SHALL verify that the requesting user's type matches target_user_type (or target is "all").
6. THE Voucher_Validation_API SHALL verify that the requesting user matches the voucher's target segment criteria.
7. THE Voucher_Validation_API SHALL verify that used_count is less than quota (when quota is set).
8. THE Voucher_Validation_API SHALL verify that the user's usage_count is less than per_user_limit.
9. THE Voucher_Validation_API SHALL verify that transaction_amount is greater than or equal to min_transaction_amount (when set).
10. THE Voucher_Validation_API SHALL verify that the transaction's service_category_id matches the voucher's service_category_id (when set).
11. WHEN discount_type is "commission_discount", THE Voucher_Validation_API SHALL verify that the requesting user is a Mitra_User.

### Requirement 7: Voucher Redemption (Mobile API)

**User Story:** As a Client_User, I want to redeem a voucher during checkout, so that the discount is applied to my transaction.

#### Acceptance Criteria

1. THE Voucher_Validation_API SHALL provide a redeem endpoint that applies the voucher discount.
2. WHEN a redeem request is submitted, THE Voucher_Validation_API SHALL re-execute all validation rules from Requirement 6 before processing.
3. THE Voucher_Validation_API SHALL use an atomic database increment to update used_count, preventing race conditions on quota.
4. IF the atomic increment affects zero rows, THEN THE Voucher_Validation_API SHALL return a 422 error indicating quota is exhausted.
5. WHEN redemption succeeds, THE Voucher_Validation_API SHALL update the voucher_user record with used_at timestamp and increment usage_count.
6. THE Voucher_Validation_API SHALL calculate the discount based on discount_type: percentage applies discount_value percent capped at max_discount_cap, fixed_amount applies discount_value directly, free_service applies full service cost as discount, commission_discount reduces platform fee by discount_value percent.

### Requirement 8: User Voucher Wallet (Mobile API)

**User Story:** As a Client_User, I want to see vouchers assigned to me, so that I can use them during checkout.

#### Acceptance Criteria

1. THE Voucher_Validation_API SHALL provide a my-vouchers endpoint that returns all vouchers assigned to the authenticated user.
2. THE Voucher_Validation_API SHALL include the assignment status (used/unused) and remaining usage count for each voucher.
3. THE Voucher_Validation_API SHALL exclude soft-deleted vouchers from the wallet response.

### Requirement 9: CRM Voucher List Page

**User Story:** As a Backoffice_User, I want to see all vouchers in a table with search, filter, and status indicators, so that I can efficiently manage the voucher inventory.

#### Acceptance Criteria

1. THE Voucher_List_Page SHALL display a paginated table with columns: Code, Name, Discount Type, Target User Type, Status (badge), Quota (used/total), Period, and Actions.
2. THE Voucher_List_Page SHALL provide a search input that filters vouchers by code or name.
3. THE Voucher_List_Page SHALL provide filter options for discount_type, target_user_type, and status.
4. THE Voucher_List_Page SHALL display status badges with the following logic: "Active" (success) when is_active is true and current time is between starts_at and expires_at; "Inactive" (neutral) when is_active is false; "Expired" (error) when expires_at is before current time; "Scheduled" (primary) when starts_at is after current time.
5. THE Voucher_List_Page SHALL provide navigation to create, edit, and detail pages.
6. THE Voucher_List_Page SHALL provide a delete action with confirmation dialog for each voucher row.

### Requirement 10: CRM Voucher Create Page

**User Story:** As a Backoffice_User, I want a form with conditional fields to create vouchers, so that I can configure all voucher parameters in a single page.

#### Acceptance Criteria

1. THE Voucher_Editor SHALL organize the create form into sections: Basic Info, Discount Config, Conditions & Limits, Distribution, and Target Segment.
2. THE Voucher_Editor SHALL conditionally show or hide fields based on the selected discount_type as specified in Requirement 4.
3. THE Voucher_Editor SHALL provide date pickers for starts_at and expires_at with validation that starts_at is before expires_at.
4. THE Voucher_Editor SHALL provide inputs for quota (optional, null for unlimited), per_user_limit (default 1), and min_transaction_amount (optional).
5. THE Voucher_Editor SHALL provide a service category selector when discount_type is "free_service" or when category restriction is desired.
6. THE Voucher_Editor SHALL provide target segment configuration with options: new_user, verified_only, specific_users, or all.
7. WHEN target_segment is "specific_users", THE Voucher_Editor SHALL provide a user picker to select target user IDs.

### Requirement 11: CRM Voucher Edit Page

**User Story:** As a Backoffice_User, I want to edit existing vouchers with the same form layout as creation, so that I can update voucher parameters consistently.

#### Acceptance Criteria

1. THE Voucher_Editor SHALL pre-populate all form fields from the existing voucher data on the edit page.
2. THE Voucher_Editor SHALL apply the edit restrictions defined in Requirement 3 for used vouchers.
3. THE Voucher_Editor SHALL preserve the return page context so the user returns to the correct list page after saving.

### Requirement 12: CRM Voucher Detail Page

**User Story:** As a Backoffice_User, I want to view complete voucher information with usage statistics, so that I can monitor voucher performance.

#### Acceptance Criteria

1. THE Voucher_Detail_Page SHALL display all voucher configuration fields in a read-only detail card.
2. THE Voucher_Detail_Page SHALL display usage statistics summary including used_count, quota, and redemption rate.
3. THE Voucher_Detail_Page SHALL display a table of assigned users with columns: user name, assigned_at, status (used/unused), and usage_count.
4. THE Voucher_Detail_Page SHALL provide an "Assign to User" action button that opens a modal with a user picker for manual assignment.

### Requirement 13: CRM Sidebar Navigation

**User Story:** As a Backoffice_User, I want to access voucher management from the sidebar, so that I can navigate to the feature easily.

#### Acceptance Criteria

1. THE Voucher_Editor SHALL be accessible from a "Marketing" accordion group in the CRM sidebar.
2. THE "Marketing" accordion group SHALL contain "Banners" and "Vouchers" navigation items.
3. WHEN the existing "Content" sidebar group contains only Banners, THE CRM SHALL rename the group to "Marketing" and add the Vouchers item.

### Requirement 14: Voucher Data Integrity

**User Story:** As a developer, I want voucher quota handling to be atomic and race-condition safe, so that vouchers cannot be over-redeemed under concurrent usage.

#### Acceptance Criteria

1. THE VoucherValidationService SHALL use a database-level atomic increment (UPDATE ... SET used_count = used_count + 1 WHERE used_count < quota) to prevent over-redemption.
2. IF the atomic increment returns zero affected rows, THEN THE VoucherValidationService SHALL return a 422 error indicating the voucher quota is exhausted.
3. THE VoucherValidationService SHALL re-validate is_active status and expiry at redemption time, not relying on prior validation results.
4. FOR ALL valid voucher data, serializing voucher configuration to JSON and deserializing it back SHALL produce an equivalent data structure (round-trip property for target_segments and voucher_user records).
