# Tasks — Client Registration with OTP Verification

## Backend Tasks

- [x] 1. Database Migration & Model
  - [x] 1.1 Create migration `create_otp_verifications_table` with columns: `id`, `user_id` (foreign key to users with cascade delete), `otp_hash` (string), `expires_at` (timestamp), `attempts` (integer default 0), `max_attempts` (integer default 5), `created_at`, `updated_at`. Add index on `user_id`.
  - [x] 1.2 Create `app/Models/OtpVerification.php` with `$fillable` (`user_id`, `otp_hash`, `expires_at`, `attempts`, `max_attempts`), `$casts` (`expires_at` → datetime, `attempts` → integer, `max_attempts` → integer), `user()` BelongsTo relationship, `isExpired()` method, and `hasExceededMaxAttempts()` method.
  - [x] 1.3 Add `otpVerification()` HasOne relationship to `app/Models/User.php`.

- [x] 2. Configuration
  - [x] 2.1 Add `otp` key to `config/businessflow.php` with values: `expiry_minutes` (5), `max_attempts` (5), `code_length` (6), `resend_cooldown_seconds` (60), `dev_bypass_code` ('223344').

- [x] 3. AuthHelper Update
  - [x] 3.1 Add static method `generateOtp(int $length = 6): array` to `app/Support/AuthHelper.php` that generates a random numeric code of the specified length (range 100000–999999 for 6 digits), returns `['plain' => '123456', 'hash' => hash('sha256', '123456')]`.

- [x] 4. OtpVerificationService
  - [x] 4.1 Create `app/Services/Auth/OtpVerificationService.php` with `generate(User $user): void` method that: deletes any existing OtpVerification for the user, calls `AuthHelper::generateOtp()`, creates OtpVerification record with hashed code and config-driven expiry/max_attempts, logs the plain OTP via `Log::info()` with user email, code, and expiry time.
  - [x] 4.2 Add `verify(User $user, string $code): array` method that: returns already-verified response if `$user->is_verified`, finds the user's OtpVerification record, checks dev bypass code (accepts '223344' when `APP_ENV !== 'production'`), checks expiry, checks max attempts, validates SHA-256 hash match, on success sets `is_verified=true` and deletes OTP record, on failure increments attempts counter.
  - [x] 4.3 Add `resend(User $user): array` method that: returns already-verified response if `$user->is_verified`, checks cooldown (60s since last OTP creation using `created_at`), calls `generate()` to create new OTP, returns success response.

- [x] 5. RegisterService Update
  - [x] 5.1 Update `app/Services/Auth/RegisterService.php` `handle()` method to accept `verification_method` parameter (default `'otp'`). When `'otp'`: call `OtpVerificationService::generate()` instead of creating EmailVerification and sending email. When `'email'`: keep existing email verification flow.

- [x] 6. FormRequest Updates
  - [x] 6.1 Update `app/Http/Requests/RegisterFormRequest.php` to add `verification_method` rule: `['sometimes', 'string', 'in:email,otp']`.
  - [x] 6.2 Create `app/Http/Requests/VerifyOtpFormRequest.php` with rule: `otp` → `['required', 'string', 'size:6', 'regex:/^\d{6}$/']`.

- [x] 7. Controller Endpoints
  - [x] 7.1 Add `verifyOtp(VerifyOtpFormRequest $request, OtpVerificationService $service)` method to `AuthController` that calls `$service->verify()` and returns `ApiResponse::success()` or `ApiResponse::error()`.
  - [x] 7.2 Add `resendOtp(Request $request, OtpVerificationService $service)` method to `AuthController` that calls `$service->resend()` and returns appropriate ApiResponse.
  - [x] 7.3 Add `resendVerificationEmail(Request $request, RegisterService $registerService)` method to `AuthController` that invalidates existing EmailVerification, generates new token, queues verification email, returns ApiResponse.

- [x] 8. Routes
  - [x] 8.1 Add routes to `routes/api.php` inside the `auth:sanctum` middleware group: `POST /auth/otp/verify` → `AuthController@verifyOtp`, `POST /auth/otp/resend` → `AuthController@resendOtp` with throttle middleware (`throttle:1,1` for 1 request per minute), `POST /auth/verify/resend` → `AuthController@resendVerificationEmail` with throttle middleware.

- [x] 9. PHP Syntax Check
  - [x] 9.1 Run `php -l` on all new and modified PHP files: OtpVerification model, OtpVerificationService, AuthHelper, RegisterService, RegisterFormRequest, VerifyOtpFormRequest, AuthController, routes/api.php, config/businessflow.php.

## Frontend Tasks

- [x] 10. Auth Service Types & Methods
  - [x] 10.1 Add types to `src/services/auth/auth.types.ts`: `IRegisterPayload` (email, password, password_confirmation, full_name, verification_method?), `IRegisterResponse` (user + credential), `IVerifyOtpPayload` (otp), and update exports.
  - [x] 10.2 Add methods to `src/services/auth/auth.service.ts`: `register(payload)` → `POST /auth/register`, `verifyOtp(payload)` → `POST /auth/otp/verify`, `resendOtp()` → `POST /auth/otp/resend`, `resendVerificationEmail()` → `POST /auth/verify/resend`.

- [x] 11. Auth Store Updates
  - [x] 11.1 Update `src/store/useAuthStore.ts` to add `register` action: calls `authService.register()`, stores tokens via `secureStorage.setTokens()`, sets `isAuthenticated: true`, calls `fetchProfile()`. Add `verifyOtp` action: calls `authService.verifyOtp()`, calls `fetchProfile()`. Add `resendOtp` action: calls `authService.resendOtp()`. Add `pendingVerification` state field (`'otp' | 'email' | null`) set during register to track which verification screen to show.

- [x] 12. RegisterScreen
  - [x] 12.1 Create `src/screens/auth/RegisterScreen.tsx` with form fields: full name, email, password, password confirmation. Add verification method selector (segmented control with "Email Link" and "Kode OTP" options, OTP selected by default). Follow LoginScreen styling patterns (brand area, form card, KeyboardAvoidingView). Wire submit to `useAuthStore.register()`. Display field-level errors from backend. Show loading state on submit. Add "Sudah punya akun? Masuk" link navigating back to Login.

- [x] 13. VerifyOtpScreen
  - [x] 13.1 Create `src/screens/auth/VerifyOtpScreen.tsx` with 6 individual digit `TextInput` boxes using `useRef` array for focus management. Auto-advance focus on digit entry. Auto-submit when all 6 digits entered by calling `useAuthStore.verifyOtp()`. On success: navigate to main Dashboard. On failure: display error message, clear all inputs, focus first box. Add 60-second countdown timer (using `useEffect` + `setInterval`). Show "Kirim Ulang" button enabled only when countdown reaches 0, calling `useAuthStore.resendOtp()` and resetting timer. Show loading indicator during verify/resend requests.

- [x] 14. VerifyEmailScreen
  - [x] 14.1 Create `src/screens/auth/VerifyEmailScreen.tsx` displaying instruction message to check email inbox. Show user's email address from `useAuthStore.user.email`. Add "Kirim Ulang Email" button calling `authService.resendVerificationEmail()` with loading state. Add "Kembali ke Login" button that calls `useAuthStore.logout()` and navigates to Login screen.

- [x] 15. AuthNavigator
  - [x] 15.1 Create `src/navigation/AuthNavigator.tsx` as a React Navigation stack with screens: Login (initial), Register, VerifyOtp, VerifyEmail. Export `AuthNavigator` component.

- [x] 16. App.tsx Update
  - [x] 16.1 Update `App.tsx` to replace direct `<LoginScreen />` render with `<NavigationContainer><AuthNavigator /></NavigationContainer>` when not authenticated. Keep existing `<NavigationContainer><MainTabNavigator /></NavigationContainer>` for authenticated users. Handle `pendingVerification` state to show appropriate verification screen after registration.

- [x] 17. LoginScreen Update
  - [x] 17.1 Update `src/screens/auth/LoginScreen.tsx` "Daftar" Pressable to use `navigation.navigate('Register')` instead of being a no-op. Accept `navigation` prop from AuthNavigator stack.

## Property-Based Tests

- [x] 18. Backend Property Tests
  - [x] 18.1 [PBT] Property 1: OTP Generation Produces Valid Hashed Code — Create test that runs 100 iterations calling `AuthHelper::generateOtp()` with random lengths, verifying: plain code is numeric string of exact length, integer value in valid range, and `hash('sha256', plain) === hash`. Tag: `Feature: client-registration-otp, Property 1: OTP Generation Produces Valid Hashed Code`.
  - [x] 18.2 [PBT] Property 2: Single Active OTP Per User Invariant — Create test that runs 100 iterations: for each iteration, create a user, call `OtpVerificationService::generate()` a random number of times (1–5), verify exactly 1 OtpVerification record exists for that user. Tag: `Feature: client-registration-otp, Property 2: Single Active OTP Per User Invariant`.
  - [x] 18.3 [PBT] Property 3: Incorrect OTP Attempt Increment — Create test that runs 100 iterations: for each iteration, create a user with OTP, generate a random 6-digit code that doesn't match the stored hash, call verify, assert attempts incremented by exactly 1. Tag: `Feature: client-registration-otp, Property 3: Incorrect OTP Attempt Increment`.
  - [x] 18.4 [PBT] Property 4: Model Helper Methods Correctness — Create test that runs 100 iterations: for each iteration, create OtpVerification with random `expires_at` (past/future) and random `attempts`/`max_attempts` values, verify `isExpired()` returns correct boolean and `hasExceededMaxAttempts()` returns correct boolean. Tag: `Feature: client-registration-otp, Property 4: Model Helper Methods Correctness`.

## Documentation

- [x] 19. Documentation Updates
  - [x] 19.1 Update `lingkar-id-backend/README.md` API Endpoints table with new routes: `POST /auth/otp/verify`, `POST /auth/otp/resend`, `POST /auth/verify/resend`.
  - [x] 19.2 Update `lingkar-id-backend/CLAUDE.md` API Modules table to include OTP verification endpoints under Auth module.
