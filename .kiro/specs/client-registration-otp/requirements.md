# Requirements Document

## Introduction

Client Registration with Dual Verification for the LingkarID mobile app. This feature adds a complete registration flow to the React Native app (LingkarIdApp) and extends the Laravel backend (lingkar-id-backend) with OTP-based verification as an alternative to the existing email-link verification. Users choose their preferred verification method during registration: Email Link (existing) or OTP Code (new, default). OTP codes are currently logged to the Laravel log channel (viewable via Laravel Telescope) rather than sent via email — email delivery will be added in a future iteration. In development mode, the code "223344" is always accepted as a valid OTP regardless of the actual generated code.

## Glossary

- **Backend**: The lingkar-id-backend Laravel application serving the REST API at `/api/v1/`
- **Mobile_App**: The LingkarIdApp React Native application consumed by end-user clients
- **Register_Endpoint**: `POST /api/v1/auth/register` — the API endpoint that creates a new user account
- **OTP**: A 6-digit numeric One-Time Password logged to the Laravel log channel (viewable via Telescope) for account verification. In development, the code "223344" is always accepted as valid.
- **OTP_Record**: A database record storing the hashed OTP code, user reference, expiry timestamp, and attempt counter
- **Email_Link**: The existing verification method where a 64-character token is sent via email as a clickable link
- **Verification_Method**: A user-selected parameter (`email` or `otp`) indicating which verification flow to use
- **Auth_Store**: The Zustand-based state management store in the Mobile_App that manages authentication state
- **Auth_Service**: The typed API service layer in the Mobile_App that wraps HTTP calls to the Backend
- **RegisterService**: The Laravel service class (`App\Services\Auth\RegisterService`) that handles user creation and verification dispatch
- **OtpVerificationService**: A new Laravel service class responsible for generating, sending, validating, and resending OTP codes
- **ApiResponse**: The standardized JSON response wrapper (`App\Support\ApiResponse`) used by all Backend endpoints
- **AuthHelper**: The support class (`App\Support\AuthHelper`) providing password hashing and token generation utilities
- **EnsureUserIsVerified**: The middleware that blocks unverified users (returns 403) from accessing client routes
- **RegisterScreen**: A new screen in the Mobile_App where users fill in registration details and select a Verification_Method
- **VerifyOtpScreen**: A new screen in the Mobile_App where users enter the 6-digit OTP code received via email
- **VerifyEmailScreen**: A new screen in the Mobile_App that instructs users to check their email for the verification link
- **Auth_Navigator**: A React Navigation stack managing Login, Register, VerifyOtp, and VerifyEmail screens

## Requirements

### Requirement 1: Registration Endpoint with Verification Method Selection

**User Story:** As a new user, I want to choose between email link and OTP verification during registration, so that I can verify my account using my preferred method.

#### Acceptance Criteria

1. WHEN a registration request is received with `verification_method` set to `email`, THE Register_Endpoint SHALL create the user account, generate an Email_Link verification token, send the verification email, and return the user data with authentication credentials.
2. WHEN a registration request is received with `verification_method` set to `otp`, THE Register_Endpoint SHALL create the user account, generate an OTP, send the OTP via email, and return the user data with authentication credentials.
3. WHEN a registration request is received without a `verification_method` parameter, THE Register_Endpoint SHALL default to `otp` verification.
4. WHEN a registration request contains an invalid `verification_method` value, THE Register_Endpoint SHALL return a 422 validation error specifying the allowed values (`email`, `otp`).
5. THE Register_Endpoint SHALL continue to validate `email`, `password`, `password_confirmation`, and `full_name` fields using the existing validation rules before processing the Verification_Method.

### Requirement 2: OTP Generation and Storage

**User Story:** As the system, I want to generate secure OTP codes and store them with expiry and attempt tracking, so that verification is time-limited and brute-force resistant.

#### Acceptance Criteria

1. WHEN the OtpVerificationService generates an OTP, THE OtpVerificationService SHALL produce a 6-digit numeric code (range 100000–999999).
2. WHEN the OtpVerificationService stores an OTP, THE OtpVerificationService SHALL store a SHA-256 hash of the OTP code in the OTP_Record, not the plain-text code.
3. WHEN the OtpVerificationService creates an OTP_Record, THE OtpVerificationService SHALL set the expiry timestamp to 5 minutes from the creation time.
4. WHEN the OtpVerificationService creates an OTP_Record, THE OtpVerificationService SHALL initialize the attempt counter to 0 and set the maximum allowed attempts to 5.
5. WHEN a new OTP is generated for a user who already has an existing unexpired OTP_Record, THE OtpVerificationService SHALL invalidate the previous OTP_Record before creating the new one.

### Requirement 3: OTP Delivery (Log-based for Development)

**User Story:** As a developer, I want OTP codes logged to the Laravel log channel so that I can verify them via Laravel Telescope during development, with email delivery planned for a future iteration.

#### Acceptance Criteria

1. WHEN an OTP is generated for a user, THE Backend SHALL log the OTP code to the Laravel log channel using `Log::info()` with the user's email and the plain-text OTP code, so it is visible in Laravel Telescope.
2. THE Backend SHALL NOT send OTP codes via email in the current implementation — email delivery will be added in a future iteration.
3. THE log entry SHALL include the user's email address, the 6-digit OTP code, and the expiry time for easy identification in Telescope.

### Requirement 4: OTP Verification Endpoint

**User Story:** As a new user, I want to submit my OTP code to verify my account, so that I can access the full application.

#### Acceptance Criteria

1. WHEN a valid OTP code is submitted to `POST /api/v1/auth/otp/verify` for an unverified user, THE Backend SHALL set the user's `is_verified` field to `true`, delete the OTP_Record, and return a success response.
2. WHEN an incorrect OTP code is submitted, THE Backend SHALL increment the attempt counter on the OTP_Record and return an error response indicating the code is invalid.
3. WHEN an OTP code is submitted after the OTP_Record has expired, THE Backend SHALL return an error response indicating the code has expired.
4. WHEN an OTP code is submitted after the attempt counter has reached the maximum of 5, THE Backend SHALL return an error response indicating the maximum attempts have been exceeded.
5. WHEN an OTP verification request is received for a user who is already verified, THE Backend SHALL return a success response indicating the user is already verified.
6. THE `POST /api/v1/auth/otp/verify` endpoint SHALL require authentication (Bearer token) to identify the user.
7. WHEN the application environment is not `production` (i.e., `APP_ENV` is `local` or `testing`), THE Backend SHALL accept the code `223344` as a valid OTP for any user, bypassing hash comparison and expiry checks, to facilitate development and testing.

### Requirement 5: OTP Resend Endpoint

**User Story:** As a new user, I want to request a new OTP code if my previous one expired or I did not receive it, so that I can still complete verification.

#### Acceptance Criteria

1. WHEN a resend request is received at `POST /api/v1/auth/otp/resend` for an unverified user, THE Backend SHALL invalidate any existing OTP_Record for that user, generate a new OTP, send it via email, and return a success response.
2. WHEN a resend request is received for a user who is already verified, THE Backend SHALL return a response indicating the user is already verified.
3. THE `POST /api/v1/auth/otp/resend` endpoint SHALL enforce rate limiting to prevent abuse (maximum 1 resend per 60 seconds per user).
4. WHEN a resend request is rate-limited, THE Backend SHALL return a 429 response indicating the user must wait before requesting another code.
5. THE `POST /api/v1/auth/otp/resend` endpoint SHALL require authentication (Bearer token) to identify the user.

### Requirement 6: OTP Database Migration

**User Story:** As a developer, I want a dedicated database table for OTP records, so that OTP data is stored separately from email verification tokens.

#### Acceptance Criteria

1. THE Backend SHALL have an `otp_verifications` migration creating a table with columns: `id`, `user_id` (foreign key to users), `otp_hash` (string), `expires_at` (timestamp), `attempts` (integer default 0), `max_attempts` (integer default 5), `created_at`, and `updated_at`.
2. THE `otp_verifications` table SHALL have an index on `user_id` for efficient lookup.
3. THE Backend SHALL have an `OtpVerification` Eloquent model with appropriate fillable fields, casts, and a `user` relationship.
4. THE `OtpVerification` model SHALL provide an `isExpired()` method that returns `true` when `expires_at` is in the past.
5. THE `OtpVerification` model SHALL provide a `hasExceededMaxAttempts()` method that returns `true` when `attempts` is greater than or equal to `max_attempts`.

### Requirement 7: OTP Configuration

**User Story:** As a developer, I want OTP parameters to be configurable, so that expiry time, code length, and attempt limits can be adjusted without code changes.

#### Acceptance Criteria

1. THE Backend SHALL store OTP configuration values in `config/businessflow.php` under a new `otp` key, including `expiry_minutes` (default 5), `max_attempts` (default 5), `code_length` (default 6), `resend_cooldown_seconds` (default 60), and `dev_bypass_code` (default `223344`).
2. THE OtpVerificationService SHALL read all OTP parameters from the configuration rather than using hardcoded values.
3. THE `dev_bypass_code` SHALL only be accepted when `APP_ENV` is not `production`.

### Requirement 8: Registration Screen

**User Story:** As a new user, I want a registration screen in the mobile app, so that I can create an account with my email, password, and full name.

#### Acceptance Criteria

1. THE RegisterScreen SHALL display input fields for full name, email, password, and password confirmation.
2. THE RegisterScreen SHALL display a Verification_Method selector allowing the user to choose between "Email Link" and "OTP Code", with "OTP Code" selected by default.
3. WHEN the user submits the registration form with valid data, THE RegisterScreen SHALL call the Auth_Service register function, store the returned authentication tokens, and navigate to the appropriate verification screen based on the selected Verification_Method.
4. WHEN the Backend returns validation errors, THE RegisterScreen SHALL display field-level error messages below the corresponding input fields.
5. WHEN the Backend returns a general error, THE RegisterScreen SHALL display an alert with the error message.
6. WHILE a registration request is in progress, THE RegisterScreen SHALL disable the submit button and show a loading indicator.
7. THE RegisterScreen SHALL provide a navigation link back to the LoginScreen.

### Requirement 9: OTP Verification Screen

**User Story:** As a new user who chose OTP verification, I want a screen to enter my 6-digit code, so that I can verify my account.

#### Acceptance Criteria

1. THE VerifyOtpScreen SHALL display 6 individual digit input boxes for entering the OTP code.
2. THE VerifyOtpScreen SHALL automatically advance focus to the next input box when a digit is entered.
3. WHEN all 6 digits are entered, THE VerifyOtpScreen SHALL automatically submit the OTP code for verification.
4. WHEN the OTP verification succeeds, THE VerifyOtpScreen SHALL update the Auth_Store user profile and navigate to the main Dashboard.
5. WHEN the OTP verification fails, THE VerifyOtpScreen SHALL display the error message from the Backend and clear the input boxes.
6. THE VerifyOtpScreen SHALL display a countdown timer starting from 60 seconds, after which the resend button becomes active.
7. WHEN the user taps the resend button, THE VerifyOtpScreen SHALL call the Auth_Service resend function, reset the countdown timer, and display a confirmation message.
8. WHILE a verification or resend request is in progress, THE VerifyOtpScreen SHALL show a loading indicator and disable user interaction with the input boxes and resend button.

### Requirement 10: Email Verification Screen

**User Story:** As a new user who chose email link verification, I want a screen that tells me to check my email, so that I know what to do next.

#### Acceptance Criteria

1. THE VerifyEmailScreen SHALL display a message instructing the user to check their email inbox for the verification link.
2. THE VerifyEmailScreen SHALL display the user's email address so the user can confirm the correct inbox.
3. THE VerifyEmailScreen SHALL provide a "Resend Email" button that triggers a new verification email.
4. WHILE a resend request is in progress, THE VerifyEmailScreen SHALL disable the resend button and show a loading indicator.
5. THE VerifyEmailScreen SHALL provide a "Back to Login" button that logs the user out and navigates to the LoginScreen.

### Requirement 11: Auth Navigation Stack

**User Story:** As a user, I want seamless navigation between login, registration, and verification screens, so that the authentication flow feels cohesive.

#### Acceptance Criteria

1. THE Mobile_App SHALL have an Auth_Navigator stack containing LoginScreen, RegisterScreen, VerifyOtpScreen, and VerifyEmailScreen.
2. WHEN an unauthenticated user opens the Mobile_App, THE Auth_Navigator SHALL display the LoginScreen as the initial route.
3. WHEN the user taps "Daftar" on the LoginScreen, THE Auth_Navigator SHALL navigate to the RegisterScreen.
4. WHEN registration succeeds with `otp` Verification_Method, THE Auth_Navigator SHALL navigate to the VerifyOtpScreen.
5. WHEN registration succeeds with `email` Verification_Method, THE Auth_Navigator SHALL navigate to the VerifyEmailScreen.
6. WHEN OTP verification succeeds, THE Auth_Navigator SHALL navigate to the main Dashboard (MainTabNavigator).
7. WHEN a verified user logs in, THE Auth_Navigator SHALL navigate directly to the main Dashboard.

### Requirement 12: Auth Store and Service Updates

**User Story:** As a developer, I want the auth store and service layer updated with register, verify OTP, and resend functions, so that all screens can use a consistent API interface.

#### Acceptance Criteria

1. THE Auth_Service SHALL expose a `register` function accepting `email`, `password`, `password_confirmation`, `full_name`, and `verification_method` parameters and returning the API response with user data and credentials.
2. THE Auth_Service SHALL expose a `verifyOtp` function accepting an `otp` string parameter and returning the API response.
3. THE Auth_Service SHALL expose a `resendOtp` function with no parameters and returning the API response.
4. THE Auth_Service SHALL expose a `resendVerificationEmail` function with no parameters and returning the API response.
5. THE Auth_Store SHALL expose a `register` action that calls Auth_Service register, stores tokens in secure storage, sets `isAuthenticated` to `true`, and fetches the user profile.
6. THE Auth_Store SHALL expose a `verifyOtp` action that calls Auth_Service verifyOtp and refreshes the user profile on success.
7. THE Auth_Store SHALL expose a `resendOtp` action that calls Auth_Service resendOtp.

### Requirement 13: Resend Email Verification Endpoint

**User Story:** As a new user who chose email verification, I want to request a new verification email from the mobile app, so that I can complete verification if the original email was lost.

#### Acceptance Criteria

1. WHEN a resend request is received at `POST /api/v1/auth/verify/resend` for an unverified user, THE Backend SHALL invalidate any existing EmailVerification record for that user, generate a new verification token, send the verification email, and return a success response.
2. WHEN a resend request is received for a user who is already verified, THE Backend SHALL return a response indicating the user is already verified.
3. THE `POST /api/v1/auth/verify/resend` endpoint SHALL enforce rate limiting (maximum 1 resend per 60 seconds per user).
4. THE `POST /api/v1/auth/verify/resend` endpoint SHALL require authentication (Bearer token) to identify the user.
