# Requirements Document

## Introduction

Fitur Referral Program memungkinkan Client dan Mitra mengajak user baru bergabung ke platform Lingkar melalui kode referral. Reward diberikan secara bertahap (multi-milestone) sesuai progress referee dalam menyelesaikan journey stages, dengan tier system yang memberikan bonus tambahan untuk referrer aktif. Sistem sepenuhnya dikonfigurasi dari CRM (campaign, tier, milestone, reward) dan diproses otomatis melalui UserEventObserver tanpa intervensi manual. Reward berupa wallet cashback dan/atau voucher auto-assign. Scope implementasi mencakup Backend (Laravel) dan CRM (Next.js) — integrasi mobile app ditangguhkan ke Phase 2.

## Glossary

- **Referral_Campaign_API**: Endpoint Laravel di bawah prefix `/api/v1/backoffice/referral-campaigns` yang menangani operasi CRUD campaign referral untuk backoffice.
- **Referral_Management_API**: Endpoint Laravel di bawah prefix `/api/v1/backoffice/referrals` yang menangani pengelolaan record referral dan reward.
- **Referral_Analytics_API**: Endpoint Laravel di bawah prefix `/api/v1/backoffice/referral-analytics` yang menyediakan data overview, leaderboard, dan tier distribution.
- **ReferralService**: Service layer Laravel (`app/Services/Referral/ReferralService.php`) yang menangani code generation, apply referral code, dan campaign lookup.
- **ReferralMilestoneService**: Service layer Laravel (`app/Services/Referral/ReferralMilestoneService.php`) yang menangani pengecekan dan advancing milestone.
- **ReferralRewardService**: Service layer Laravel (`app/Services/Referral/ReferralRewardService.php`) yang menangani disbursement cashback/voucher dan tier bonus calculation.
- **ReferralCampaignService**: Service layer Laravel (`app/Services/Backoffice/ReferralCampaignService.php`) yang menangani campaign CRUD, tier, dan milestone management dari CRM.
- **ReferralManagementService**: Service layer Laravel (`app/Services/Backoffice/ReferralManagementService.php`) yang menangani referral list, flag, dan reward retry.
- **ReferralAnalyticsService**: Service layer Laravel (`app/Services/Backoffice/ReferralAnalyticsService.php`) yang menangani overview stats, leaderboard, dan tier distribution.
- **ProcessReferralMilestone**: Queued job Laravel yang diproses secara asynchronous untuk mengecek dan advancing milestone ketika UserEvent dibuat.
- **UserEventObserver**: Observer pada model UserEvent yang men-dispatch ProcessReferralMilestone job ketika event baru dibuat.
- **Campaign_List_Page**: Halaman CRM (`/dashboard/referral-campaigns`) yang menampilkan daftar campaign referral.
- **Campaign_Editor**: Halaman CRM untuk membuat dan mengedit campaign referral, termasuk konfigurasi milestone dan tier.
- **Campaign_Detail_Page**: Halaman CRM (`/dashboard/referral-campaigns/[id]`) yang menampilkan detail campaign beserta analytics.
- **Referral_List_Page**: Halaman CRM (`/dashboard/referrals`) yang menampilkan daftar record referral.
- **Referral_Detail_Page**: Halaman CRM (`/dashboard/referrals/[id]`) yang menampilkan detail referral beserta milestone timeline dan reward history.
- **Backoffice_User**: Pengguna dengan role admin atau backoffice yang memiliki akses ke fitur Referral Program di CRM.
- **Referrer**: User (Client atau Mitra) yang mengajak user baru bergabung menggunakan kode referral.
- **Referee**: User baru yang mendaftar menggunakan kode referral dari Referrer.
- **Referral_Code**: Kode unik yang dimiliki setiap user per campaign, digunakan saat registrasi untuk menghubungkan Referee ke Referrer.
- **Milestone**: Tahapan journey yang harus diselesaikan Referee untuk men-trigger reward disbursement.
- **Tier**: Level yang dicapai Referrer berdasarkan jumlah referral completed, memberikan bonus percentage tambahan pada reward.
- **Wallet_Cashback**: Reward berupa penambahan saldo ke wallet user melalui WalletTransaction.
- **Voucher_Reward**: Reward berupa auto-assign voucher ke user melalui pembuatan VoucherUser record.

## Requirements

### Requirement 1: Campaign CRUD Operations

**User Story:** As a Backoffice_User, I want to create, view, edit, and delete referral campaigns, so that I can manage promotional referral programs for the Lingkar platform.

#### Acceptance Criteria

1. THE Referral_Campaign_API SHALL provide a paginated list endpoint that returns all campaigns with support for filtering by status and target_role.
2. THE Referral_Campaign_API SHALL provide a search capability that filters campaigns by name.
3. THE Referral_Campaign_API SHALL provide a detail endpoint that returns a single campaign by its identifier, including associated milestones and tiers.
4. WHEN a Backoffice_User submits a valid campaign creation request with milestones and tiers, THE Referral_Campaign_API SHALL create the campaign record along with its milestones and tiers, and return the created campaign data.
5. WHEN a Backoffice_User submits a valid campaign update request, THE Referral_Campaign_API SHALL update the existing campaign record and return the updated campaign data.
6. WHEN a Backoffice_User submits a campaign deletion request, THE Referral_Campaign_API SHALL soft-delete the campaign record and return a success response.
7. THE Referral_Campaign_API SHALL provide an endpoint to update the status of a campaign (draft, active, paused, ended).

### Requirement 2: Campaign Validation

**User Story:** As a Backoffice_User, I want the system to validate my campaign inputs, so that only valid and consistent campaign configurations are saved.

#### Acceptance Criteria

1. THE Referral_Campaign_API SHALL validate that name is required and not empty.
2. THE Referral_Campaign_API SHALL validate that target_role is one of: "client" or "mitra".
3. THE Referral_Campaign_API SHALL validate that starts_at is a valid datetime and is before ends_at when ends_at is provided.
4. THE Referral_Campaign_API SHALL validate that max_referrals_per_user is a positive integer when provided.
5. THE Referral_Campaign_API SHALL validate that each milestone has a unique event_type within the same campaign.
6. THE Referral_Campaign_API SHALL validate that each milestone has a valid sort_order forming a sequential progression.
7. THE Referral_Campaign_API SHALL validate that tier min_referrals values do not overlap within the same campaign.
8. THE Referral_Campaign_API SHALL validate that referrer_reward_amount and referee_reward_amount are positive decimals when their respective reward_type is "cashback".
9. THE Referral_Campaign_API SHALL validate that referrer_voucher_id and referee_voucher_id reference existing voucher records when their respective reward_type is "voucher".
10. THE Referral_Campaign_API SHALL validate that bonus_percentage is between 0 and 100 for each tier.

### Requirement 3: Campaign Edit Restrictions

**User Story:** As a Backoffice_User, I want the system to prevent changes that would invalidate existing referral data, so that data integrity is maintained for active referrals.

#### Acceptance Criteria

1. WHEN a campaign has active referrals (referrals with status "pending" or "completed"), THE Referral_Campaign_API SHALL reject changes to the target_role field with a 422 error.
2. WHEN a campaign status is "active", THE Referral_Campaign_API SHALL reject deletion of milestones that have already been completed by any referral with a 422 error.
3. THE Referral_Campaign_API SHALL allow updates to campaign name, description, ends_at, max_referrals_per_user, and status regardless of referral activity.
4. WHEN a campaign has active referrals, THE Campaign_Editor SHALL display a warning notice informing the Backoffice_User that target_role cannot be changed.

### Requirement 4: Tier Management

**User Story:** As a Backoffice_User, I want to configure reward tiers for a campaign, so that active referrers receive progressively better bonus rewards.

#### Acceptance Criteria

1. THE Referral_Campaign_API SHALL provide endpoints to list, create, update, and delete tiers for a specific campaign.
2. WHEN a tier is created, THE ReferralCampaignService SHALL validate that min_referrals does not overlap with existing tiers in the same campaign.
3. THE ReferralCampaignService SHALL enforce that sort_order values are unique within a campaign's tiers.
4. WHEN a tier is deleted, THE ReferralCampaignService SHALL verify that no referrer currently holds that tier before allowing deletion, returning a 422 error if the tier is in use.
5. THE Referral_Campaign_API SHALL return tiers ordered by sort_order in all list responses.

### Requirement 5: Milestone Management

**User Story:** As a Backoffice_User, I want to configure milestones for a campaign, so that rewards are disbursed progressively as referees complete journey stages.

#### Acceptance Criteria

1. THE Referral_Campaign_API SHALL provide endpoints to list, create, update, and delete milestones for a specific campaign.
2. WHEN a milestone is created, THE ReferralCampaignService SHALL validate that event_type is unique within the campaign.
3. THE ReferralCampaignService SHALL enforce that sort_order values are unique and sequential within a campaign's milestones.
4. WHEN a milestone reward_type is "cashback", THE ReferralCampaignService SHALL require a positive reward_amount.
5. WHEN a milestone reward_type is "voucher", THE ReferralCampaignService SHALL require a valid voucher_id referencing an existing voucher.
6. THE Referral_Campaign_API SHALL return milestones ordered by sort_order in all list responses.

### Requirement 6: Referral Code Generation

**User Story:** As a Referrer, I want a unique referral code generated for me per campaign, so that I can share it with potential referees.

#### Acceptance Criteria

1. THE ReferralService SHALL generate a referral code in the format "{NAME_PREFIX}{RANDOM_4}" where NAME_PREFIX is the first 5 characters of the user's name (uppercase, alphanumeric only) and RANDOM_4 is 4 random alphanumeric characters.
2. THE ReferralService SHALL enforce a unique constraint of one code per user per campaign.
3. IF a code collision occurs during generation, THEN THE ReferralService SHALL retry with a different random suffix up to 3 times before returning an error.
4. THE ReferralService SHALL only generate codes for campaigns with status "active" and within the valid campaign period.
5. THE ReferralService SHALL only generate codes for users whose role matches the campaign's target_role.

### Requirement 7: Referral Code Application at Registration

**User Story:** As a Referee, I want to apply a referral code during registration, so that both the Referrer and I can receive rewards as I progress through the platform.

#### Acceptance Criteria

1. WHEN a user registers with a referral_code parameter, THE ReferralService SHALL validate the code and create a referral record linking the Referee to the Referrer.
2. THE ReferralService SHALL verify that the referral code belongs to an active campaign within its valid period.
3. THE ReferralService SHALL verify that the referral code's is_active flag is true.
4. IF the Referrer has reached the campaign's max_referrals_per_user limit, THEN THE ReferralService SHALL reject the referral code with an appropriate error message.
5. IF the Referee attempts to use their own referral code, THEN THE ReferralService SHALL reject the code with an error message indicating self-referral is not allowed.
6. THE ReferralService SHALL enforce that a Referee can only be referred once per campaign (database unique constraint on campaign_id + referee_id).
7. WHEN a referral record is created, THE ReferralService SHALL set the initial status to "pending" with current_milestone_id as null.

### Requirement 8: Automatic Milestone Processing

**User Story:** As a system operator, I want milestones to be processed automatically when user events occur, so that rewards are disbursed without manual intervention.

#### Acceptance Criteria

1. WHEN a UserEvent record is created, THE UserEventObserver SHALL dispatch a ProcessReferralMilestone job with the user_id and event_type.
2. THE ProcessReferralMilestone job SHALL find the pending referral where referee_id matches the user_id.
3. IF no pending referral exists for the user, THEN THE ProcessReferralMilestone job SHALL exit without error.
4. THE ProcessReferralMilestone job SHALL determine the next expected milestone based on the referral's current_milestone_id and the campaign's milestone sort_order.
5. WHEN the event_type matches the next expected milestone's event_type, THE ProcessReferralMilestone job SHALL advance the referral's current_milestone_id to the matched milestone.
6. WHEN the first milestone is completed, THE ProcessReferralMilestone job SHALL increment the referral_code's usage_count by 1.
7. WHEN all milestones in the campaign are completed, THE ProcessReferralMilestone job SHALL update the referral status to "completed" and set completed_at to the current timestamp.

### Requirement 9: Reward Disbursement — Cashback

**User Story:** As a Referrer or Referee, I want to receive wallet cashback rewards when milestones are completed, so that I am incentivized to participate in the referral program.

#### Acceptance Criteria

1. WHEN a milestone is completed and the milestone's reward_type is "cashback", THE ReferralRewardService SHALL calculate the base reward amount from the milestone configuration.
2. WHEN disbursing a referrer cashback reward, THE ReferralRewardService SHALL calculate the tier bonus by multiplying the base amount by the referrer's current tier bonus_percentage divided by 100.
3. THE ReferralRewardService SHALL credit the recipient's wallet with the total amount (base + tier_bonus) by creating a WalletTransaction with type "referral_reward".
4. THE ReferralRewardService SHALL create a referral_rewards record with status "disbursed", the wallet_transaction_id, and disbursed_at timestamp.
5. IF the wallet credit operation fails (inactive wallet or other error), THEN THE ReferralRewardService SHALL create the referral_rewards record with status "failed".
6. THE ReferralRewardService SHALL disburse referee rewards without tier bonus calculation (base amount only).

### Requirement 10: Reward Disbursement — Voucher

**User Story:** As a Referrer or Referee, I want to receive voucher rewards when milestones are completed, so that I can use them for platform services.

#### Acceptance Criteria

1. WHEN a milestone is completed and the milestone's reward_type is "voucher", THE ReferralRewardService SHALL assign the configured voucher to the recipient by creating a VoucherUser record.
2. THE ReferralRewardService SHALL create the VoucherUser record with status "unused" and the current timestamp as assigned_at.
3. THE ReferralRewardService SHALL create a referral_rewards record with status "disbursed", the voucher_id, and disbursed_at timestamp.
4. IF the voucher assignment fails (voucher inactive or deleted), THEN THE ReferralRewardService SHALL create the referral_rewards record with status "failed".

### Requirement 11: Tier Bonus Calculation

**User Story:** As a Referrer, I want to receive increasing bonus rewards as I refer more users, so that I am motivated to continue referring.

#### Acceptance Criteria

1. THE ReferralRewardService SHALL determine the referrer's current tier by matching the referrer's completed referral count against the campaign's tier min_referrals and max_referrals ranges.
2. WHEN the referrer's completed referral count falls within a tier's min_referrals and max_referrals range, THE ReferralRewardService SHALL apply that tier's bonus_percentage to the base cashback reward.
3. IF the referrer's completed referral count does not match any tier (below minimum tier), THEN THE ReferralRewardService SHALL apply zero bonus percentage.
4. THE ReferralRewardService SHALL record the tier_bonus_amount separately in the referral_rewards record for audit purposes.

### Requirement 12: Referral Record Management

**User Story:** As a Backoffice_User, I want to view and manage referral records, so that I can monitor referral activity and handle suspicious cases.

#### Acceptance Criteria

1. THE Referral_Management_API SHALL provide a paginated list endpoint that returns referrals with support for filtering by campaign_id, status, and date range.
2. THE Referral_Management_API SHALL provide a search capability that filters referrals by referrer or referee name.
3. THE Referral_Management_API SHALL provide a detail endpoint that returns a single referral with its milestone progress and reward history.
4. THE Referral_Management_API SHALL provide a flag endpoint that updates a referral's status to "flagged" with a reason field.
5. WHEN a referral is flagged, THE ReferralManagementService SHALL prevent further milestone processing for that referral.

### Requirement 13: Reward Retry for Failed Disbursements

**User Story:** As a Backoffice_User, I want to retry failed reward disbursements, so that users receive their earned rewards after transient failures are resolved.

#### Acceptance Criteria

1. THE Referral_Management_API SHALL provide a retry endpoint for referral_rewards with status "failed".
2. WHEN a retry is requested, THE ReferralRewardService SHALL re-attempt the disbursement using the same reward configuration (type, amount, voucher_id).
3. WHEN the retry succeeds, THE ReferralRewardService SHALL update the reward record status to "disbursed" with the current timestamp.
4. IF the retry fails again, THEN THE ReferralRewardService SHALL keep the reward record status as "failed" and return an error response.

### Requirement 14: Referral Analytics

**User Story:** As a Backoffice_User, I want to view referral program analytics, so that I can measure campaign performance and identify top referrers.

#### Acceptance Criteria

1. THE Referral_Analytics_API SHALL provide an overview endpoint returning total referrals, active referrals, completed referrals, conversion rate, and total rewards disbursed, filterable by campaign_id and period.
2. THE Referral_Analytics_API SHALL provide a leaderboard endpoint returning top referrers ranked by completed referral count, filterable by campaign_id with a configurable limit.
3. THE Referral_Analytics_API SHALL provide a tier-distribution endpoint returning the count of referrers in each tier for a given campaign.

### Requirement 15: CRM Campaign List Page

**User Story:** As a Backoffice_User, I want to see all referral campaigns in a table with search, filter, and status indicators, so that I can efficiently manage campaigns.

#### Acceptance Criteria

1. THE Campaign_List_Page SHALL display a paginated table with columns: Name, Target Role (badge), Status (badge), Period, Total Referrals, Total Disbursed, and Actions.
2. THE Campaign_List_Page SHALL provide filter chips for status (draft, active, paused, ended) and target_role (client, mitra).
3. THE Campaign_List_Page SHALL provide a search input that filters campaigns by name.
4. THE Campaign_List_Page SHALL display status badges with variants: "draft" (neutral), "active" (success), "paused" (warning), "ended" (error).
5. THE Campaign_List_Page SHALL provide navigation to create, edit, and detail pages.
6. THE Campaign_List_Page SHALL provide a delete action with confirmation dialog for each campaign row.

### Requirement 16: CRM Campaign Create Page

**User Story:** As a Backoffice_User, I want a multi-section form to create campaigns with milestones and tiers, so that I can configure all campaign parameters in a single page.

#### Acceptance Criteria

1. THE Campaign_Editor SHALL organize the create form into sections: Basic Info, Milestones (repeater), and Tiers (repeater).
2. THE Campaign_Editor SHALL provide inputs for name, description, target_role (dropdown), starts_at (date picker), ends_at (date picker, optional), and max_referrals_per_user (optional).
3. THE Campaign_Editor SHALL provide a milestone repeater where each entry includes: name, event_type (dropdown), sort_order, referrer_reward_type, referrer_reward_amount or referrer_voucher_id, referee_reward_type, referee_reward_amount or referee_voucher_id.
4. WHEN a milestone reward_type is "cashback", THE Campaign_Editor SHALL display the reward_amount input field.
5. WHEN a milestone reward_type is "voucher", THE Campaign_Editor SHALL display a voucher selector dropdown.
6. THE Campaign_Editor SHALL provide a tier repeater where each entry includes: name, icon (optional), min_referrals, max_referrals (optional), bonus_percentage, and sort_order.
7. THE Campaign_Editor SHALL validate that starts_at is before ends_at when ends_at is provided.

### Requirement 17: CRM Campaign Edit Page

**User Story:** As a Backoffice_User, I want to edit existing campaigns with the same form layout as creation, so that I can update campaign parameters consistently.

#### Acceptance Criteria

1. THE Campaign_Editor SHALL pre-populate all form fields from the existing campaign data on the edit page, including milestones and tiers.
2. THE Campaign_Editor SHALL apply the edit restrictions defined in Requirement 3 for campaigns with active referrals.
3. WHEN a campaign has active referrals, THE Campaign_Editor SHALL disable the target_role field and display a warning notice.

### Requirement 18: CRM Campaign Detail Page

**User Story:** As a Backoffice_User, I want to view complete campaign information with analytics, so that I can monitor campaign performance.

#### Acceptance Criteria

1. THE Campaign_Detail_Page SHALL display campaign configuration fields in a read-only detail card.
2. THE Campaign_Detail_Page SHALL display overview statistics: total referrals, active referrals, completed referrals, conversion rate, and total rewards disbursed.
3. THE Campaign_Detail_Page SHALL display a milestone breakdown showing completion count per milestone.
4. THE Campaign_Detail_Page SHALL display a tier distribution visualization showing referrer count per tier.
5. THE Campaign_Detail_Page SHALL provide tabs for: Overview, Referrals (filtered table), Rewards (filtered table), and Leaderboard.

### Requirement 19: CRM Referral List Page

**User Story:** As a Backoffice_User, I want to see all referral records in a table with search and filter, so that I can monitor referral activity across campaigns.

#### Acceptance Criteria

1. THE Referral_List_Page SHALL display a paginated table with columns: Referrer, Referee, Campaign, Status (badge), Milestones (progress indicator), Rewards Given, and Created.
2. THE Referral_List_Page SHALL provide filter options for campaign (dropdown), status chips (pending, completed, expired, flagged), and date range.
3. THE Referral_List_Page SHALL provide a search input that filters referrals by referrer or referee name.
4. THE Referral_List_Page SHALL display status badges with variants: "pending" (warning), "completed" (success), "expired" (neutral), "flagged" (error).
5. THE Referral_List_Page SHALL provide navigation to referral detail page and a flag action for each row.

### Requirement 20: CRM Referral Detail Page

**User Story:** As a Backoffice_User, I want to view complete referral information with milestone progress and reward history, so that I can investigate individual referral cases.

#### Acceptance Criteria

1. THE Referral_Detail_Page SHALL display referrer and referee information cards showing user name, role, and registration date.
2. THE Referral_Detail_Page SHALL display a milestone timeline with visual progress indicators (checkmarks for completed milestones).
3. THE Referral_Detail_Page SHALL display a reward history table with columns: Milestone, Recipient, Type, Amount, Status (badge), and Disbursed At.
4. WHEN a referral is flagged, THE Referral_Detail_Page SHALL display the flag reason and timestamp.
5. THE Referral_Detail_Page SHALL provide a "Retry" button for rewards with status "failed".

### Requirement 21: CRM Sidebar Navigation

**User Story:** As a Backoffice_User, I want to access referral program management from the sidebar, so that I can navigate to the feature easily.

#### Acceptance Criteria

1. THE Campaign_List_Page SHALL be accessible from a "Referral Program" item within the "Marketing" accordion group in the CRM sidebar.
2. THE "Marketing" accordion group SHALL contain "Banners", "Vouchers", and "Referral Program" navigation items.
3. THE "Referral Program" sidebar item SHALL use a Gift icon consistent with the design specification.

### Requirement 22: Anti-Fraud Constraints

**User Story:** As a system operator, I want basic anti-fraud measures in place, so that the referral program is protected from obvious abuse patterns.

#### Acceptance Criteria

1. THE ReferralService SHALL enforce a database unique constraint on (campaign_id, referee_id) preventing the same Referee from being referred multiple times in one campaign.
2. THE ReferralService SHALL reject referral code application when the Referee's user_id matches the Referrer's user_id (self-referral prevention).
3. THE ReferralService SHALL enforce the campaign's max_referrals_per_user limit by checking the referral_code's usage_count before creating a new referral.
4. THE ReferralService SHALL verify that the referral code belongs to a campaign with status "active" and current time is within starts_at and ends_at bounds.
5. THE Referral_Management_API SHALL provide a manual flag action allowing Backoffice_User to mark suspicious referrals as "flagged" with a reason.

### Requirement 23: Integration with Existing Systems

**User Story:** As a developer, I want the referral program to integrate cleanly with existing platform services, so that the feature works within the established architecture.

#### Acceptance Criteria

1. WHEN a user registers with a referral_code, THE RegisterService SHALL pass the referral_code to ReferralService for processing after successful user creation.
2. THE UserEventObserver SHALL be registered in AppServiceProvider to observe the UserEvent model's "created" event.
3. WHEN a mitra's status changes to approved, THE MitraMemberService SHALL track a "mitra_approved" event via EventTrackingService.
4. THE WalletTransaction model SHALL include a type constant TYPE_REFERRAL_REWARD with value "referral_reward" for referral cashback transactions.
5. THE UserEvent model SHALL include "mitra_approved" in its ALLOWED_EVENT_TYPES constant.

### Requirement 24: Data Integrity and Reliability

**User Story:** As a developer, I want referral processing to be reliable and data-consistent, so that rewards are correctly disbursed and no data is lost.

#### Acceptance Criteria

1. THE ProcessReferralMilestone job SHALL process milestones sequentially according to sort_order, advancing only to the next expected milestone.
2. THE ProcessReferralMilestone job SHALL be idempotent — processing the same event_type for the same user multiple times SHALL NOT create duplicate rewards.
3. THE ReferralRewardService SHALL record all disbursement attempts (successful and failed) in the referral_rewards table for audit purposes.
4. THE ReferralRewardService SHALL use the WalletTransaction reference_type "referral_reward" and reference_id pointing to the referral_rewards record ID for traceability.
5. FOR ALL valid referral campaign configurations, serializing campaign data (milestones, tiers) to JSON and deserializing back SHALL produce an equivalent data structure (round-trip property for API responses).
