# Implementation Plan: Referral Program

## Overview

Implementasi fitur Referral Program yang memungkinkan Client dan Mitra mengajak user baru bergabung ke platform Lingkar melalui kode referral. Sistem mengimplementasikan multi-milestone reward disbursement yang diproses otomatis melalui UserEventObserver, dengan tier system untuk bonus tambahan.

Implementasi mencakup backend (Laravel — `lingkar-id-backend/`) dan frontend CRM (Next.js — `lingkar-crm/`). Backend dikerjakan terlebih dahulu karena frontend bergantung pada API baru. Urutan: database migrations → models → core services → backoffice services → observer/job → controllers/routes → CRM frontend.

## Tasks

- [ ] 1. Backend: Database Migrations
  - [x] 1.1 Buat migration `create_referral_campaigns_table`
    - Kolom: `id` (bigint PK), `name` (string), `description` (text nullable), `target_role` (enum: client, mitra), `status` (enum: draft, active, paused, ended), `starts_at` (datetime), `ends_at` (datetime nullable), `max_referrals_per_user` (int nullable), `created_by` (FK → users), timestamps, softDeletes
    - Index pada `['status', 'target_role']`
    - _Requirements: 1.1, 1.4, 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Buat migration `create_referral_tiers_table`
    - Kolom: `id` (bigint PK), `campaign_id` (FK → referral_campaigns, cascade), `name` (string), `icon` (string nullable), `min_referrals` (int), `max_referrals` (int nullable), `bonus_percentage` (decimal 5,2), `extra_perks` (json nullable), `sort_order` (int), timestamps
    - Unique constraint pada `['campaign_id', 'sort_order']`
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 1.3 Buat migration `create_referral_milestones_table`
    - Kolom: `id` (bigint PK), `campaign_id` (FK → referral_campaigns, cascade), `name` (string), `event_type` (string), `sort_order` (int), `referrer_reward_type` (enum: cashback, voucher, none), `referrer_reward_amount` (decimal 12,2 nullable), `referrer_voucher_id` (FK → vouchers nullable), `referee_reward_type` (enum: cashback, voucher, none), `referee_reward_amount` (decimal 12,2 nullable), `referee_voucher_id` (FK → vouchers nullable), timestamps
    - Unique constraints: `['campaign_id', 'sort_order']`, `['campaign_id', 'event_type']`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 1.4 Buat migration `create_referral_codes_table`
    - Kolom: `id` (bigint PK), `user_id` (FK → users), `campaign_id` (FK → referral_campaigns), `code` (string unique), `usage_count` (int default 0), `is_active` (boolean default true), timestamps
    - Unique constraint pada `['user_id', 'campaign_id']`
    - Index pada `['code']`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 1.5 Buat migration `create_referrals_table`
    - Kolom: `id` (bigint PK), `campaign_id` (FK → referral_campaigns), `referrer_id` (FK → users), `referee_id` (FK → users), `referral_code` (string), `status` (enum: pending, completed, expired, flagged), `current_milestone_id` (FK → referral_milestones nullable), `completed_at` (datetime nullable), `expires_at` (datetime nullable), `flag_reason` (string nullable), timestamps
    - Unique constraint pada `['campaign_id', 'referee_id']`
    - Indexes: `['referee_id', 'status']`, `['referrer_id', 'campaign_id', 'status']`
    - _Requirements: 7.6, 7.7, 22.1_

  - [x] 1.6 Buat migration `create_referral_rewards_table`
    - Kolom: `id` (UUID PK), `referral_id` (FK → referrals), `milestone_id` (FK → referral_milestones), `recipient_id` (FK → users), `recipient_type` (enum: referrer, referee), `reward_type` (enum: cashback, voucher), `amount` (decimal 12,2 nullable), `tier_bonus_amount` (decimal 12,2 default 0), `voucher_id` (FK → vouchers nullable), `wallet_transaction_id` (string UUID nullable), `status` (enum: pending, disbursed, failed), `disbursed_at` (datetime nullable), timestamps
    - Index pada `['referral_id', 'milestone_id', 'recipient_type']`
    - _Requirements: 9.4, 9.5, 10.3, 24.3_

  - [x] 1.7 Jalankan semua migrations
    - `docker exec lingkarid.local php artisan migrate`
    - Verifikasi semua tabel terbuat dengan benar
    - _Requirements: 1.4_

- [ ] 2. Backend: Eloquent Models
  - [x] 2.1 Buat model `ReferralCampaign` di `app/Models/ReferralCampaign.php`
    - `$fillable`, `$casts` sesuai design (status → enum, target_role → enum, starts_at/ends_at → datetime)
    - Relations: `tiers()` → hasMany ReferralTier (ordered by sort_order), `milestones()` → hasMany ReferralMilestone (ordered by sort_order), `codes()` → hasMany ReferralCode, `referrals()` → hasMany Referral, `creator()` → belongsTo User
    - Scopes: `scopeActive`, `scopeOfStatus`, `scopeOfTargetRole`, `scopeSearch` (ILIKE pada name)
    - Use `SoftDeletes` trait
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 2.2 Buat model `ReferralTier` di `app/Models/ReferralTier.php`
    - `$fillable`: campaign_id, name, icon, min_referrals, max_referrals, bonus_percentage, extra_perks, sort_order
    - `$casts`: extra_perks → array, bonus_percentage → decimal:2
    - Relations: `campaign()` → belongsTo ReferralCampaign
    - _Requirements: 4.1, 4.5_

  - [x] 2.3 Buat model `ReferralMilestone` di `app/Models/ReferralMilestone.php`
    - `$fillable`: campaign_id, name, event_type, sort_order, referrer_reward_type, referrer_reward_amount, referrer_voucher_id, referee_reward_type, referee_reward_amount, referee_voucher_id
    - `$casts`: referrer_reward_amount → decimal:2, referee_reward_amount → decimal:2
    - Relations: `campaign()` → belongsTo ReferralCampaign, `referrerVoucher()` → belongsTo Voucher, `refereeVoucher()` → belongsTo Voucher
    - _Requirements: 5.1, 5.6_

  - [x] 2.4 Buat model `ReferralCode` di `app/Models/ReferralCode.php`
    - `$fillable`: user_id, campaign_id, code, usage_count, is_active
    - `$casts`: is_active → boolean, usage_count → integer
    - Relations: `user()` → belongsTo User, `campaign()` → belongsTo ReferralCampaign
    - _Requirements: 6.1, 6.2_

  - [x] 2.5 Buat model `Referral` di `app/Models/Referral.php`
    - `$fillable`: campaign_id, referrer_id, referee_id, referral_code, status, current_milestone_id, completed_at, expires_at, flag_reason
    - `$casts`: status → enum, completed_at → datetime, expires_at → datetime
    - Relations: `campaign()` → belongsTo ReferralCampaign, `referrer()` → belongsTo User, `referee()` → belongsTo User, `currentMilestone()` → belongsTo ReferralMilestone, `rewards()` → hasMany ReferralReward
    - Scopes: `scopePending`, `scopeCompleted`, `scopeFlagged`, `scopeOfCampaign`, `scopeSearch` (ILIKE pada referrer/referee name via join)
    - _Requirements: 7.7, 12.1, 12.2_

  - [x] 2.6 Buat model `ReferralReward` di `app/Models/ReferralReward.php`
    - `$fillable`: referral_id, milestone_id, recipient_id, recipient_type, reward_type, amount, tier_bonus_amount, voucher_id, wallet_transaction_id, status, disbursed_at
    - `$casts`: amount → decimal:2, tier_bonus_amount → decimal:2, disbursed_at → datetime
    - `$keyType = 'string'`, `$incrementing = false` (UUID PK)
    - Relations: `referral()` → belongsTo Referral, `milestone()` → belongsTo ReferralMilestone, `recipient()` → belongsTo User, `voucher()` → belongsTo Voucher
    - _Requirements: 9.4, 24.3_

- [ ] 3. Backend: Core Service Layer (Services/Referral/)
  - [x] 3.1 Buat `ReferralService` di `app/Services/Referral/ReferralService.php`
    - Method `generateCode(User $user, ReferralCampaign $campaign)`: generate code format `{NAME_PREFIX}{RANDOM_4}`, retry up to 3x on collision, enforce one code per user per campaign
    - Method `applyReferralCode(User $referee, string $code)`: validate code (active, campaign active/in-period, not self-referral, not over max limit, referee not already referred), create referral record with status "pending" and current_milestone_id null
    - Method `getActiveCampaignForRole(string $role)`: find active campaign matching role within valid period
    - Anti-fraud checks: self-referral prevention, max_referrals_per_user enforcement, unique constraint on (campaign_id, referee_id)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 22.1, 22.2, 22.3, 22.4_

  - [x] 3.2 Buat `ReferralMilestoneService` di `app/Services/Referral/ReferralMilestoneService.php`
    - Method `checkAndAdvance(Referral $referral, string $eventType)`: determine next expected milestone by sort_order, advance only if event_type matches, idempotent (same event processed twice = no-op)
    - Method `getNextMilestone(Referral $referral)`: get next milestone based on current_milestone_id and campaign sort_order, return null if all completed
    - Sequential processing: never skip milestones, never go backwards
    - On first milestone completion: increment referral_code usage_count
    - On all milestones completed: set referral status "completed", set completed_at
    - _Requirements: 8.4, 8.5, 8.6, 8.7, 24.1, 24.2_

  - [x] 3.3 Buat `ReferralRewardService` di `app/Services/Referral/ReferralRewardService.php`
    - Method `disburseForMilestone(Referral $referral, ReferralMilestone $milestone)`: handle both referrer (with tier bonus) and referee (base only) rewards
    - Method `determineCurrentTier(User $referrer, ReferralCampaign $campaign)`: count completed referrals, match against tier ranges
    - Method `calculateTierBonus(float $baseAmount, ReferralTier $tier)`: formula `base * (bonus_percentage / 100)`
    - Method `retryDisbursement(ReferralReward $reward)`: re-attempt using same config
    - Cashback flow: calculate total (base + tier_bonus), credit wallet via WalletTransaction (type: 'referral_reward'), record in referral_rewards
    - Voucher flow: create VoucherUser record (status: unused), record in referral_rewards
    - Failure handling: catch exceptions, set reward status "failed", do NOT fail the job
    - Idempotency check: verify no existing reward for same referral+milestone+recipient_type before disbursing
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 10.1, 10.2, 10.3, 10.4, 11.1, 11.2, 11.3, 11.4, 13.2, 13.3, 13.4, 24.3, 24.4_

- [ ] 4. Backend: Observer, Job, dan Integration Points
  - [x] 4.1 Buat `UserEventObserver` di `app/Observers/UserEventObserver.php`
    - Method `created(UserEvent $event)`: dispatch `ProcessReferralMilestone::dispatch($event->user_id, $event->event_type)`
    - Register observer di `AppServiceProvider::boot()` untuk model `UserEvent`
    - _Requirements: 8.1, 23.2_

  - [x] 4.2 Buat `ProcessReferralMilestone` job di `app/Jobs/ProcessReferralMilestone.php`
    - Implements `ShouldQueue`, uses `Dispatchable, InteractsWithQueue, Queueable, SerializesModels`
    - Constructor: `public int $userId, public string $eventType`
    - Handle method: find pending referral (referee_id = userId, status in [pending]), exit if none, exit if flagged, call `ReferralMilestoneService::checkAndAdvance()`, if advanced call `ReferralRewardService::disburseForMilestone()`
    - Error handling: no pending referral → exit silently, flagged → exit silently, event doesn't match → exit silently, reward failure → catch and continue (milestone still advances)
    - Retry: 3 attempts with backoff
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 12.5, 24.1, 24.2_

  - [x] 4.3 Modifikasi `RegisterService::handle()` di `app/Services/Auth/RegisterService.php`
    - Accept optional `referral_code` parameter
    - After successful user creation, call `ReferralService::applyReferralCode($user, $referralCode)` if code provided
    - Wrap in try-catch: referral failure should NOT block registration
    - _Requirements: 23.1_

  - [x] 4.4 Modifikasi `MitraMemberService` untuk track `mitra_approved` event
    - In `updateVerificationStatus()` method: when mitra status changes to approved, track `mitra_approved` event via `EventTrackingService`
    - _Requirements: 23.3_

  - [x] 4.5 Tambah constants pada existing models
    - `WalletTransaction`: add `TYPE_REFERRAL_REWARD = 'referral_reward'`
    - `UserEvent`: add `TYPE_MITRA_APPROVED = 'mitra_approved'` to `ALLOWED_EVENT_TYPES`
    - _Requirements: 23.4, 23.5_

- [ ] 5. Backend: Backoffice Service Layer (Services/Backoffice/)
  - [x] 5.1 Buat `ReferralCampaignService` di `app/Services/Backoffice/ReferralCampaignService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllCampaigns()`: paginated query with filters (status, target_role, search by name), order by created_at desc
    - Method `getCampaignById(string $id)`: findOrFail with eager load milestones, tiers
    - Method `createCampaign(array $data)`: create campaign + milestones + tiers in transaction, set created_by from Auth::id()
    - Method `updateCampaign(ReferralCampaign $campaign, array $data)`: update campaign, sync milestones/tiers. Enforce edit restrictions (no target_role change if has active referrals)
    - Method `deleteCampaign(ReferralCampaign $campaign)`: soft delete
    - Method `updateStatus(ReferralCampaign $campaign, string $status)`: update status field
    - Tier methods: `createTier`, `updateTier`, `deleteTier` (verify tier not in use before delete)
    - Milestone methods: `createMilestone`, `updateMilestone`, `deleteMilestone` (verify milestone not completed by any referral before delete)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [x] 5.2 Buat `ReferralManagementService` di `app/Services/Backoffice/ReferralManagementService.php`
    - Use `ApiPaginationTrait`
    - Method `getAllReferrals()`: paginated query with filters (campaign_id, status, date range, search by referrer/referee name), eager load referrer, referee, campaign, currentMilestone
    - Method `getReferralById(string $id)`: findOrFail with eager load rewards, milestones progress
    - Method `flagReferral(Referral $referral, string $reason)`: set status "flagged", set flag_reason
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 22.5_

  - [x] 5.3 Buat `ReferralAnalyticsService` di `app/Services/Backoffice/ReferralAnalyticsService.php`
    - Method `getOverview(?int $campaignId, ?string $period)`: return total_referrals, active_referrals, completed_referrals, conversion_rate (completed/total or 0), total_rewards_disbursed
    - Method `getLeaderboard(?int $campaignId, int $limit = 10)`: top referrers by completed referral count, descending order
    - Method `getTierDistribution(int $campaignId)`: count of referrers in each tier for campaign
    - _Requirements: 14.1, 14.2, 14.3_

- [ ] 6. Backend: FormRequests
  - [x] 6.1 Buat `StoreReferralCampaignRequest` di `app/Http/Requests/Backoffice/StoreReferralCampaignRequest.php`
    - Rules: `name` → required|string|max:255; `target_role` → required|in:client,mitra; `starts_at` → required|date; `ends_at` → nullable|date|after:starts_at; `max_referrals_per_user` → nullable|integer|min:1
    - Milestone rules: `milestones` → required|array|min:1; `milestones.*.name` → required|string; `milestones.*.event_type` → required|string|distinct; `milestones.*.sort_order` → required|integer|distinct; `milestones.*.referrer_reward_type` → required|in:cashback,voucher,none; `milestones.*.referrer_reward_amount` → required_if:referrer_reward_type,cashback|numeric|min:0.01; `milestones.*.referrer_voucher_id` → required_if:referrer_reward_type,voucher|exists:vouchers,id
    - Same pattern for referee reward fields
    - Tier rules: `tiers` → nullable|array; `tiers.*.name` → required|string; `tiers.*.min_referrals` → required|integer|min:0; `tiers.*.max_referrals` → nullable|integer; `tiers.*.bonus_percentage` → required|numeric|between:0,100; `tiers.*.sort_order` → required|integer|distinct
    - Custom validation: tier ranges must not overlap
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_

  - [x] 6.2 Buat `UpdateReferralCampaignRequest` di `app/Http/Requests/Backoffice/UpdateReferralCampaignRequest.php`
    - Same rules as Store but with edit restriction logic
    - If campaign has active referrals: reject target_role changes
    - _Requirements: 2.1, 2.2, 3.1, 3.3_

  - [x] 6.3 Buat `UpdateCampaignStatusRequest` di `app/Http/Requests/Backoffice/UpdateCampaignStatusRequest.php`
    - Rules: `status` → required|in:draft,active,paused,ended
    - _Requirements: 1.7_

  - [x] 6.4 Buat `FlagReferralRequest` di `app/Http/Requests/Backoffice/FlagReferralRequest.php`
    - Rules: `reason` → required|string|max:500
    - _Requirements: 12.4, 22.5_

- [ ] 7. Backend: Controllers dan Routes
  - [x] 7.1 Buat `ReferralCampaignController` di `app/Http/Controllers/Api/v1/Backoffice/ReferralCampaignController.php`
    - Inject `ReferralCampaignService`
    - `index()` → paginated list with filters, return `paginatedResponse`
    - `store(StoreReferralCampaignRequest)` → create campaign with milestones + tiers, return 201
    - `show(int $id)` → detail with milestones & tiers, return `ApiResponse::success`
    - `update(UpdateReferralCampaignRequest, ReferralCampaign)` → update, return `ApiResponse::success`
    - `destroy(ReferralCampaign)` → soft delete, return `ApiResponse::success`
    - `updateStatus(UpdateCampaignStatusRequest, ReferralCampaign)` → update status, return `ApiResponse::success`
    - Tier endpoints: `listTiers`, `storeTier`, `updateTier`, `destroyTier`
    - Milestone endpoints: `listMilestones`, `storeMilestone`, `updateMilestone`, `destroyMilestone`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 4.1, 5.1_

  - [x] 7.2 Buat `ReferralManagementController` di `app/Http/Controllers/Api/v1/Backoffice/ReferralManagementController.php`
    - Inject `ReferralManagementService`, `ReferralRewardService`
    - `index()` → paginated referral list with filters, return `paginatedResponse`
    - `show(int $id)` → referral detail with milestone progress + rewards, return `ApiResponse::success`
    - `flag(FlagReferralRequest, Referral)` → flag referral, return `ApiResponse::success`
    - `retryReward(ReferralReward $reward)` → retry failed disbursement, return `ApiResponse::success`
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 13.1_

  - [x] 7.3 Buat `ReferralAnalyticsController` di `app/Http/Controllers/Api/v1/Backoffice/ReferralAnalyticsController.php`
    - Inject `ReferralAnalyticsService`
    - `overview(Request)` → stats summary with campaign_id and period filters, return `ApiResponse::success`
    - `leaderboard(Request)` → top referrers with campaign_id and limit params, return `ApiResponse::success`
    - `tierDistribution(Request)` → tier breakdown for campaign, return `ApiResponse::success`
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 7.4 Tambah routes di `routes/api.php`
    - Backoffice routes (prefix `backoffice`, middleware `role:admin,backoffice`):
      - Campaign CRUD: GET/POST `/referral-campaigns`, GET/PUT/DELETE `/referral-campaigns/{campaign}`, PATCH `/referral-campaigns/{campaign}/status`
      - Tiers: GET/POST `/referral-campaigns/{campaign}/tiers`, PUT/DELETE `/referral-campaigns/{campaign}/tiers/{tier}`
      - Milestones: GET/POST `/referral-campaigns/{campaign}/milestones`, PUT/DELETE `/referral-campaigns/{campaign}/milestones/{milestone}`
      - Referrals: GET `/referrals`, GET `/referrals/{referral}`, PATCH `/referrals/{referral}/flag`
      - Rewards: PATCH `/referral-rewards/{reward}/retry`
      - Analytics: GET `/referral-analytics/overview`, GET `/referral-analytics/leaderboard`, GET `/referral-analytics/tier-distribution`
    - _Requirements: 1.1, 12.1, 13.1, 14.1_

- [x] 8. Backend: Verifikasi syntax PHP
  - Jalankan `php -l` pada semua file baru/dimodifikasi
  - Pastikan tidak ada syntax error
  - _Requirements: 1.1-24.5_

- [x] 9. Checkpoint — Backend core selesai
  - Ensure all backend files compile without errors, ask the user if questions arise.

- [ ] 10. Backend: Property-Based Tests
  - [x] 10.1 Write property test untuk campaign data round-trip
    - **Property 1: Campaign data round-trip**
    - Generate random valid campaign configs (with milestones and tiers), create via API, fetch by ID, verify equivalent data structure preserved
    - Buat test file di `tests/Feature/Backoffice/BackofficeReferralCampaignTest.php`
    - **Validates: Requirements 1.3, 1.4, 24.5**

  - [x] 10.2 Write property test untuk campaign validation rejects invalid input
    - **Property 2: Campaign validation rejects invalid input**
    - Generate random invalid payloads (empty name, invalid target_role, starts_at >= ends_at, non-positive max_referrals_per_user, duplicate milestone event_types, overlapping tier ranges, non-positive cashback amounts, bonus_percentage outside [0,100]), verify 422 rejection
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.7, 2.8, 2.10**

  - [x] 10.3 Write property test untuk referral code format compliance
    - **Property 3: Referral code format compliance**
    - Generate random user names and active campaigns, generate codes, verify regex match `^[A-Z0-9]{1,5}[A-Z0-9]{4}$`
    - **Validates: Requirements 6.1**

  - [x] 10.4 Write property test untuk referral initial state invariant
    - **Property 4: Referral initial state invariant**
    - Generate random valid referral code applications, verify referral has status "pending" and current_milestone_id null
    - **Validates: Requirements 7.7**

  - [x] 10.5 Write property test untuk sequential milestone advancement
    - **Property 5: Sequential milestone advancement**
    - Generate campaigns with N milestones, fire events in various orders, verify only next expected milestone advances, no skipping, no backwards
    - **Validates: Requirements 8.4, 8.5, 24.1**

  - [x] 10.6 Write property test untuk milestone processing idempotence
    - **Property 6: Milestone processing idempotence**
    - Process same event_type for same user multiple times, verify single result (no duplicate rewards, no duplicate advancements)
    - **Validates: Requirements 24.2**

  - [x] 10.7 Write property test untuk referral completion detection
    - **Property 7: Referral completion detection**
    - Generate N-milestone campaigns, complete all milestones sequentially, verify referral status "completed" with non-null completed_at
    - **Validates: Requirements 8.7**

  - [x] 10.8 Write property test untuk tier bonus calculation correctness
    - **Property 8: Tier bonus calculation correctness**
    - Generate random base amounts and tier configs, verify: tier_bonus = base \* (bonus_percentage / 100), below all tiers = zero bonus, referee rewards always zero bonus
    - **Validates: Requirements 9.2, 9.6, 11.1, 11.2, 11.3**

  - [x] 10.9 Write property test untuk audit trail completeness
    - **Property 9: Audit trail completeness**
    - Generate random disbursement attempts (success and failure), verify referral_rewards record exists with correct status, successful cashback has WalletTransaction with reference_type "referral_reward"
    - **Validates: Requirements 24.3, 24.4**

  - [x] 10.10 Write property test untuk flagged referral freezes processing
    - **Property 10: Flagged referral freezes processing**
    - Flag referrals, fire matching events, verify no milestone advancement and no reward disbursement
    - **Validates: Requirements 12.5**

  - [x] 10.11 Write property test untuk campaign list filtering correctness
    - **Property 11: Campaign list filtering correctness**
    - Generate random campaign data with various statuses/roles, apply filters, verify all returned campaigns match filter criteria
    - **Validates: Requirements 1.1**

  - [x] 10.12 Write property test untuk ordered responses invariant
    - **Property 12: Ordered responses invariant**
    - Generate random sort_orders for tiers/milestones, fetch via API, verify response sorted ascending by sort_order
    - **Validates: Requirements 4.5, 5.6**

  - [x] 10.13 Write property test untuk analytics conversion rate consistency
    - **Property 13: Analytics conversion rate consistency**
    - Generate random referral data, verify conversion_rate = completed/total (or 0 when total=0), leaderboard sorted descending by count
    - **Validates: Requirements 14.1, 14.2**

- [x] 11. Checkpoint — Backend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Frontend: Service Layer dan Types
  - [x] 12.1 Buat type definitions di `src/services/backoffice/referral-campaigns/referral-campaigns.types.ts`
    - Enums/types: `ReferralCampaignStatus`, `TargetRole`, `RewardType`, `ReferralStatus`, `RewardStatus`, `RecipientType`
    - Interfaces: `IReferralCampaign`, `IReferralCampaignDetail`, `IReferralTier`, `IReferralMilestone`, `IReferralCode`
    - Params: `IReferralCampaignParams` (page, status, target_role, search)
    - Payloads: `IReferralCampaignCreatePayload`, `IReferralCampaignUpdatePayload`
    - _Requirements: 1.1, 15.1_

  - [x] 12.2 Buat service functions di `src/services/backoffice/referral-campaigns/referral-campaigns.service.ts`
    - `referralCampaignsService.list(params)` → GET /backoffice/referral-campaigns
    - `referralCampaignsService.detail(id)` → GET /backoffice/referral-campaigns/{id}
    - `referralCampaignsService.create(data)` → POST /backoffice/referral-campaigns
    - `referralCampaignsService.update(id, data)` → PUT /backoffice/referral-campaigns/{id}
    - `referralCampaignsService.delete(id)` → DELETE /backoffice/referral-campaigns/{id}
    - `referralCampaignsService.updateStatus(id, status)` → PATCH /backoffice/referral-campaigns/{id}/status
    - _Requirements: 1.1, 1.4, 1.5, 1.6, 1.7_

  - [x] 12.3 Buat barrel export di `src/services/backoffice/referral-campaigns/index.ts`
    - Re-export semua dari types dan service files
    - _Requirements: 1.1_

  - [x] 12.4 Buat type definitions di `src/services/backoffice/referrals/referrals.types.ts`
    - Interfaces: `IReferral`, `IReferralDetail`, `IReferralReward`, `IReferralOverview`, `IReferralLeaderboard`, `ITierDistribution`
    - Params: `IReferralParams` (page, campaign_id, status, search, date_from, date_to)
    - _Requirements: 12.1, 14.1_

  - [x] 12.5 Buat service functions di `src/services/backoffice/referrals/referrals.service.ts`
    - `referralsService.list(params)` → GET /backoffice/referrals
    - `referralsService.detail(id)` → GET /backoffice/referrals/{id}
    - `referralsService.flag(id, reason)` → PATCH /backoffice/referrals/{id}/flag
    - `referralsService.retryReward(rewardId)` → PATCH /backoffice/referral-rewards/{id}/retry
    - _Requirements: 12.1, 12.3, 12.4, 13.1_

  - [x] 12.6 Buat service functions di `src/services/backoffice/referrals/referral-analytics.service.ts`
    - `referralAnalyticsService.overview(params)` → GET /backoffice/referral-analytics/overview
    - `referralAnalyticsService.leaderboard(params)` → GET /backoffice/referral-analytics/leaderboard
    - `referralAnalyticsService.tierDistribution(campaignId)` → GET /backoffice/referral-analytics/tier-distribution
    - _Requirements: 14.1, 14.2, 14.3_

  - [x] 12.7 Buat barrel export di `src/services/backoffice/referrals/index.ts`
    - Re-export semua dari types, service, dan analytics files
    - _Requirements: 12.1_

- [ ] 13. Frontend: Routing dan Sidebar Navigation
  - [x] 13.1 Update `src/config/routing.ts`
    - Tambah referral routes: `referralCampaigns: '/dashboard/referral-campaigns'`, `referralCampaignCreate: '/dashboard/referral-campaigns/create'`, `referralCampaignEdit: (id: number) => \`/dashboard/referral-campaigns/${id}/edit\``, `referralCampaignDetail: (id: number) => \`/dashboard/referral-campaigns/${id}\``, `referrals: '/dashboard/referrals'`, `referralDetail: (id: number) => \`/dashboard/referrals/${id}\``
    - _Requirements: 21.1_

  - [x] 13.2 Update sidebar navigation di `src/app/components/layout/Sidebar/Sidebar.tsx`
    - Tambah "Referral Program" item di group "Marketing" (setelah Vouchers)
    - Icon: `Gift` dari lucide-react
    - Href: `PATHS.referralCampaigns`
    - _Requirements: 21.1, 21.2, 21.3_

- [x] 14. Checkpoint — Service layer dan routing frontend selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada type error
  - Ensure all checks pass, ask the user if questions arise.

- [ ] 15. Frontend: Campaign List Page
  - [x] 15.1 Buat page component di `src/app/(dashboard)/dashboard/referral-campaigns/page.tsx`
    - Gunakan `useTableData` hook dengan `referralCampaignsService.list`
    - `TableCard` dengan kolom: Name, Target Role (badge), Status (badge), Period (starts_at - ends_at), Total Referrals, Total Disbursed, Actions
    - `SearchInput` untuk search by campaign name
    - `FilterPopup` dengan `FilterChipGroup` untuk filter status (draft, active, paused, ended) dan target_role (client, mitra)
    - Status badge variants: "draft" (neutral), "active" (success), "paused" (warning), "ended" (error)
    - Actions per row: view detail (link), edit (link), toggle status, delete (dengan `ConfirmDialog`)
    - Tombol "Create Campaign" link ke create page
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_

- [ ] 16. Frontend: Campaign Create Page
  - [x] 16.1 Buat page component di `src/app/(dashboard)/dashboard/referral-campaigns/create/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Section 1 — Basic Info: name (FormInput), description (FormInput/textarea), target_role (FormSelect: client/mitra), starts_at (date picker), ends_at (date picker, optional), max_referrals_per_user (FormInput number, optional)
    - Section 2 — Milestones (repeater): each entry has name, event_type (FormSelect dropdown), sort_order, referrer_reward_type (FormSelect: cashback/voucher/none), conditional referrer_reward_amount or referrer_voucher_id, referee_reward_type, conditional referee_reward_amount or referee_voucher_id
    - Section 3 — Tiers (repeater): each entry has name, icon (optional), min_referrals, max_referrals (optional), bonus_percentage, sort_order
    - Conditional field display: WHEN reward_type is "cashback" → show amount input; WHEN reward_type is "voucher" → show voucher selector dropdown
    - Client-side validation: starts_at before ends_at, bonus_percentage 0-100, positive amounts
    - Submit → call `referralCampaignsService.create()`, redirect ke campaign list
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7_

- [ ] 17. Frontend: Campaign Edit Page
  - [x] 17.1 Buat page component di `src/app/(dashboard)/dashboard/referral-campaigns/[id]/edit/page.tsx`
    - "Page + Inner Form" split pattern untuk React 19 compliance
    - Gunakan `useDetailData` hook dengan `referralCampaignsService.detail` untuk load existing data
    - Pre-populate form fields dari existing campaign data (including milestones and tiers)
    - Edit restrictions: jika campaign has active referrals → disable target_role field, tampilkan warning notice
    - Submit → call `referralCampaignsService.update(id, data)`, redirect ke campaign list
    - _Requirements: 17.1, 17.2, 17.3, 3.4_

- [ ] 18. Frontend: Campaign Detail Page
  - [x] 18.1 Buat page component di `src/app/(dashboard)/dashboard/referral-campaigns/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan `referralCampaignsService.detail`
    - Campaign config `DetailCard` (read-only): name, description, target_role, status, period, max_referrals_per_user
    - Overview stats cards: total referrals, active referrals, completed referrals, conversion rate, total rewards disbursed
    - Milestone breakdown section: list/bar showing completion count per milestone
    - Tier distribution section: donut chart or list showing referrer count per tier (use `CHART_COLORS` from chart-colors.ts)
    - Tabs: Overview | Referrals (filtered table using `referralsService.list` with campaign_id filter) | Rewards (filtered table) | Leaderboard (using `referralAnalyticsService.leaderboard`)
    - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 19. Frontend: Referral List Page
  - [x] 19.1 Buat page component di `src/app/(dashboard)/dashboard/referrals/page.tsx`
    - Gunakan `useTableData` hook dengan `referralsService.list`
    - `TableCard` dengan kolom: Referrer (name), Referee (name), Campaign (name), Status (badge), Milestones (progress indicator — e.g. "2/3"), Rewards Given (count/amount), Created (date)
    - `SearchInput` untuk search by referrer/referee name
    - `FilterPopup` dengan: campaign dropdown, status chips (pending, completed, expired, flagged), date range
    - Status badge variants: "pending" (warning), "completed" (success), "expired" (neutral), "flagged" (error)
    - Actions per row: view detail (link), flag (with reason input dialog)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

- [ ] 20. Frontend: Referral Detail Page
  - [x] 20.1 Buat page component di `src/app/(dashboard)/dashboard/referrals/[id]/page.tsx`
    - Gunakan `useDetailData` hook dengan `referralsService.detail`
    - Referrer info card: user name, role, registration date
    - Referee info card: user name, role, registration date
    - Milestone timeline: visual progress with checkmarks for completed milestones, current milestone highlighted
    - Reward history table: columns Milestone, Recipient (referrer/referee badge), Type (cashback/voucher badge), Amount, Status (badge), Disbursed At
    - Flag section: if referral is flagged, display flag_reason and timestamp with error styling
    - "Retry" button for rewards with status "failed" → call `referralsService.retryReward(rewardId)`
    - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5_

- [x] 21. Checkpoint — Frontend pages selesai
  - Jalankan `npx tsc --noEmit` di `lingkar-crm/` untuk memastikan tidak ada TypeScript error
  - Ensure all checks pass, ask the user if questions arise.

- [ ] 22. Frontend: Unit Tests
  - [x] 22.1 Write unit tests untuk campaign list page
    - Test render table dengan mock data
    - Test search functionality
    - Test filter chips (status, target_role)
    - Test status badge rendering with correct variants
    - Test delete confirmation dialog
    - **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.6**

  - [x] 22.2 Write unit tests untuk campaign create/edit form
    - Test conditional field rendering per reward_type (cashback shows amount, voucher shows selector)
    - Test milestone repeater add/remove
    - Test tier repeater add/remove
    - Test date validation (starts_at before ends_at)
    - Test edit restrictions (disabled target_role when has active referrals)
    - **Validates: Requirements 16.3, 16.4, 16.5, 16.6, 16.7, 17.2, 17.3**

  - [x] 22.3 Write unit tests untuk referral list and detail pages
    - Test referral list table rendering with progress indicator
    - Test status badge variants
    - Test milestone timeline rendering
    - Test reward history table
    - Test retry button visibility for failed rewards
    - Test flag section display
    - **Validates: Requirements 19.1, 19.4, 20.1, 20.2, 20.3, 20.4, 20.5**

- [x] 23. Checkpoint — Frontend tests selesai
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 24. Dokumentasi
  - [x] 24.1 Update dokumentasi backend (`lingkar-id-backend/`)
    - Update `README.md`: tambah API endpoints baru (referral campaigns CRUD, tiers, milestones, referrals management, rewards retry, analytics) di API Endpoints table, update Project Structure
    - Update `CLAUDE.md`: tambah ReferralService, ReferralMilestoneService, ReferralRewardService, ReferralCampaignService, ReferralManagementService, ReferralAnalyticsService, controllers, models di API Modules table
    - Update Postman collection: tambah semua endpoint baru. Validate JSON setelah edit.
    - _Requirements: 1.1, 12.1, 13.1, 14.1_

  - [x] 24.2 Update dokumentasi frontend (`lingkar-crm/`)
    - Update `docs/PRD.md`: tambah modul Referral Program (campaign list/create/edit/detail, referral list/detail, analytics, navigation)
    - Update `docs/ARCHITECTURE.md`: tambah referral-campaigns dan referrals service layers, routing updates
    - Update `README.md`: tambah Referral Program ke Feature Status table
    - _Requirements: 15.1, 21.1_

- [x] 25. Final checkpoint — Semua selesai
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Backend tasks (1-11) harus diselesaikan sebelum frontend tasks (12-23) karena frontend bergantung pada API baru
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental di setiap fase
- Property tests (task 10) memvalidasi 13 correctness properties dari design document
- Backend commands dijalankan via Docker: `docker exec lingkarid.local php artisan ...`
- Frontend menggunakan component system project (Button, FormInput, FormSelect, TableCard, Badge, ConfirmDialog, FilterPopup, FilterChipGroup) — jangan gunakan native HTML elements
- Semua API responses menggunakan `ApiResponse::success()` / `ApiResponse::error()` pattern
- Service layer pattern: Controllers thin, semua business logic di Services
- React 19 compliance: "Page + Inner Form" split pattern untuk form pages
- Chart colors: gunakan `CHART_COLORS`/`CHART_SETS` dari `chart-colors.ts` untuk visualisasi tier distribution
- Observer pattern: `UserEventObserver` → `ProcessReferralMilestone` job → `ReferralMilestoneService` → `ReferralRewardService`
- Idempotency: check existing reward record before disbursing to prevent duplicates on queue retries
- Anti-fraud: DB unique constraints + service-level checks (self-referral, max limit, active campaign)
- Reward failure handling: catch exceptions, record as "failed", do NOT fail the job (milestone still advances)
- Sidebar: tambah "Referral Program" di group "Marketing" dengan Gift icon
