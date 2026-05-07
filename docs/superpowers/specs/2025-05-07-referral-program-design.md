# Referral Program — Design Spec

**Date:** 2025-05-07
**Scope:** Backend (Laravel) + CRM (Next.js) — Mobile app deferred to Phase 2
**Approach:** Tiered Reward with Wallet Cashback + Voucher rewards, Multi-milestone, Fully Configurable from CRM

---

## Overview

Referral program yang memungkinkan Client dan Mitra mengajak user baru bergabung ke platform Lingkar. Reward diberikan secara bertahap (multi-milestone) sesuai progress referee, dengan tier system yang memberikan bonus tambahan untuk referrer aktif.

**Key decisions:**

- Both Client dan Mitra bisa refer (masing-masing refer role yang sama)
- Multi-milestone: reward bertahap sesuai journey stage referee
- Fully configurable dari CRM (campaign, tier, milestone, reward)
- Automatic via `UserEventObserver` — zero manual intervention untuk reward disbursement
- Reward types: wallet cashback + voucher auto-assign

---

## Data Model

### New Tables (6)

#### 1. `referral_campaigns`

| Column                  | Type                               | Notes               |
| ----------------------- | ---------------------------------- | ------------------- |
| id                      | bigint PK                          |                     |
| name                    | string                             | Campaign name       |
| description             | text, nullable                     |                     |
| target_role             | enum: client, mitra                | Who can participate |
| status                  | enum: draft, active, paused, ended |                     |
| starts_at               | datetime                           | Campaign start      |
| ends_at                 | datetime, nullable                 | Null = no end date  |
| max_referrals_per_user  | int, nullable                      | Null = unlimited    |
| created_by              | FK → users                         | Backoffice creator  |
| created_at / updated_at | timestamps                         |                     |
| deleted_at              | timestamp, nullable                | Soft delete         |

#### 2. `referral_tiers`

| Column                  | Type                    | Notes                                     |
| ----------------------- | ----------------------- | ----------------------------------------- |
| id                      | bigint PK               |                                           |
| campaign_id             | FK → referral_campaigns |                                           |
| name                    | string                  | e.g. "Bronze", "Silver"                   |
| icon                    | string, nullable        | Emoji or icon key                         |
| min_referrals           | int                     | Minimum completed referrals to reach tier |
| max_referrals           | int, nullable           | Null = no upper bound (top tier)          |
| bonus_percentage        | decimal(5,2)            | Extra % added to base reward              |
| extra_perks             | json, nullable          | Additional perks metadata                 |
| sort_order              | int                     | Display ordering                          |
| created_at / updated_at | timestamps              |                                           |

#### 3. `referral_milestones`

| Column                  | Type                          | Notes                         |
| ----------------------- | ----------------------------- | ----------------------------- |
| id                      | bigint PK                     |                               |
| campaign_id             | FK → referral_campaigns       |                               |
| name                    | string                        | e.g. "Registered", "Verified" |
| event_type              | string                        | Maps to UserEvent types       |
| sort_order              | int                           | Milestone sequence            |
| referrer_reward_type    | enum: cashback, voucher, none |                               |
| referrer_reward_amount  | decimal(12,2), nullable       | For cashback                  |
| referrer_voucher_id     | FK → vouchers, nullable       | For voucher reward            |
| referee_reward_type     | enum: cashback, voucher, none |                               |
| referee_reward_amount   | decimal(12,2), nullable       | For cashback                  |
| referee_voucher_id      | FK → vouchers, nullable       | For voucher reward            |
| created_at / updated_at | timestamps                    |                               |

#### 4. `referral_codes`

| Column                  | Type                    | Notes                |
| ----------------------- | ----------------------- | -------------------- |
| id                      | bigint PK               |                      |
| user_id                 | FK → users              | Code owner           |
| campaign_id             | FK → referral_campaigns |                      |
| code                    | string, unique          | e.g. "RIZKI2025"     |
| usage_count             | int, default 0          | Successful referrals |
| is_active               | boolean, default true   |                      |
| created_at / updated_at | timestamps              |                      |

**Constraints:** UNIQUE(user_id, campaign_id) — one code per user per campaign.

#### 5. `referrals`

| Column                  | Type                                       | Notes                    |
| ----------------------- | ------------------------------------------ | ------------------------ |
| id                      | bigint PK                                  |                          |
| campaign_id             | FK → referral_campaigns                    |                          |
| referrer_id             | FK → users                                 | Who referred             |
| referee_id              | FK → users                                 | Who was referred         |
| referral_code           | string                                     | Code used at signup      |
| status                  | enum: pending, completed, expired, flagged |                          |
| current_milestone_id    | FK → referral_milestones, nullable         | Last completed milestone |
| completed_at            | datetime, nullable                         | When all milestones done |
| expires_at              | datetime, nullable                         | Referral expiry          |
| created_at / updated_at | timestamps                                 |                          |

**Constraints:** UNIQUE(campaign_id, referee_id) — one referral per referee per campaign.

#### 6. `referral_rewards`

| Column                  | Type                             | Notes                                  |
| ----------------------- | -------------------------------- | -------------------------------------- |
| id                      | UUID PK                          | Safe for wallet transaction references |
| referral_id             | FK → referrals                   |                                        |
| milestone_id            | FK → referral_milestones         |                                        |
| recipient_id            | FK → users                       | Who receives reward                    |
| recipient_type          | enum: referrer, referee          |                                        |
| reward_type             | enum: cashback, voucher          |                                        |
| amount                  | decimal(12,2), nullable          | Cashback amount (base + tier bonus)    |
| tier_bonus_amount       | decimal(12,2), default 0         | Tier bonus portion                     |
| voucher_id              | FK → vouchers, nullable          | For voucher rewards                    |
| wallet_transaction_id   | string (UUID), nullable          | FK to wallet_transactions              |
| status                  | enum: pending, disbursed, failed |                                        |
| disbursed_at            | datetime, nullable               |                                        |
| created_at / updated_at | timestamps                       |                                        |

---

## Backend Architecture

### Service Layer

```
app/Services/
├── Referral/                          ← Core referral logic
│   ├── ReferralService.php            ← Code generation, apply code, get campaign
│   ├── ReferralMilestoneService.php   ← Check & advance milestones
│   └── ReferralRewardService.php      ← Disburse cashback/voucher, tier bonus calc
├── Backoffice/
│   ├── ReferralCampaignService.php    ← Campaign CRUD, tier/milestone management
│   ├── ReferralManagementService.php  ← Referral list, flag, reward retry
│   └── ReferralAnalyticsService.php   ← Overview, leaderboard, tier distribution
```

### Observer Pattern (Trigger Mechanism)

```php
// app/Observers/UserEventObserver.php
class UserEventObserver
{
    public function created(UserEvent $event): void
    {
        // Dispatch queued job — non-blocking
        ProcessReferralMilestone::dispatch($event->user_id, $event->event_type);
    }
}
```

**Why Observer over manual service call:**

- Single point of entry — fires regardless of how UserEvent is created
- Decoupled — referral logic doesn't touch EventTrackingService
- Consistent with existing pattern (UserObserver for wallet creation)
- Future-proof for other reactive features

### Job: ProcessReferralMilestone

```
1. Find pending referral where referee_id = $userId
2. If none → exit (user wasn't referred)
3. Get campaign milestones, find next expected milestone
4. If event_type matches next milestone's event_type:
   a. Advance referral.current_milestone_id
   b. Calculate referrer's current tier → get bonus_percentage
   c. Disburse referrer reward (base + tier bonus)
   d. Disburse referee reward (if configured)
   e. If all milestones completed → mark referral as "completed"
   f. Increment referral_codes.usage_count (on first milestone only)
5. Track event in referral_rewards table
```

### Integration Points

| Existing Code                       | Modification                                                                                            |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `RegisterService::handle()`         | Accept optional `referral_code` param. After user creation, call `ReferralService::applyReferralCode()` |
| `UserEvent` model                   | Register `UserEventObserver` in `AppServiceProvider`                                                    |
| `MitraMemberService` (verification) | Track new event `mitra_approved` via `EventTrackingService` when mitra status → approved                |
| `WalletTransaction`                 | Add type constant `TYPE_REFERRAL_REWARD = 'referral_reward'`                                            |
| `UserEvent`                         | Add constant `TYPE_MITRA_APPROVED = 'mitra_approved'` to ALLOWED_EVENT_TYPES                            |

### Referral Code Generation

- Format: `{NAME_PREFIX}{RANDOM_4}` — e.g. "RIZKI7X2K"
- Name prefix: first 5 chars of user name (uppercase, alphanumeric only)
- Random suffix: 4 alphanumeric chars
- Collision handling: retry up to 3 times with different random suffix
- Generated on-demand when user first accesses referral feature (lazy generation)

### Anti-Fraud (Phase 1 — Basic)

- Same referee can only be referred once per campaign (DB unique constraint)
- Referrer cannot refer themselves (service-level check)
- Referral code must belong to active campaign within valid period
- Max referrals per user enforced (if configured on campaign)
- Manual "flag" action from CRM for suspicious patterns

---

## API Endpoints

### Campaign Management

| Method | Endpoint                                                     | Body                          | Response                                |
| ------ | ------------------------------------------------------------ | ----------------------------- | --------------------------------------- |
| GET    | `/backoffice/referral-campaigns?page=N&status=&target_role=` | —                             | Paginated list                          |
| POST   | `/backoffice/referral-campaigns`                             | Campaign + milestones + tiers | Created campaign                        |
| GET    | `/backoffice/referral-campaigns/{id}`                        | —                             | Campaign detail with milestones & tiers |
| PUT    | `/backoffice/referral-campaigns/{id}`                        | Partial update                | Updated campaign                        |
| DELETE | `/backoffice/referral-campaigns/{id}`                        | —                             | Soft delete                             |
| PATCH  | `/backoffice/referral-campaigns/{id}/status`                 | `{status}`                    | Updated status                          |

### Tier Management

| Method | Endpoint                                             | Body           | Response     |
| ------ | ---------------------------------------------------- | -------------- | ------------ |
| GET    | `/backoffice/referral-campaigns/{id}/tiers`          | —              | Tier list    |
| POST   | `/backoffice/referral-campaigns/{id}/tiers`          | Tier data      | Created tier |
| PUT    | `/backoffice/referral-campaigns/{id}/tiers/{tierId}` | Partial update | Updated tier |
| DELETE | `/backoffice/referral-campaigns/{id}/tiers/{tierId}` | —              | Deleted      |

### Milestone Management

| Method | Endpoint                                               | Body           | Response          |
| ------ | ------------------------------------------------------ | -------------- | ----------------- |
| GET    | `/backoffice/referral-campaigns/{id}/milestones`       | —              | Milestone list    |
| POST   | `/backoffice/referral-campaigns/{id}/milestones`       | Milestone data | Created milestone |
| PUT    | `/backoffice/referral-campaigns/{id}/milestones/{mId}` | Partial update | Updated milestone |
| DELETE | `/backoffice/referral-campaigns/{id}/milestones/{mId}` | —              | Deleted           |

### Referral Records

| Method | Endpoint                                                    | Body       | Response                     |
| ------ | ----------------------------------------------------------- | ---------- | ---------------------------- |
| GET    | `/backoffice/referrals?page=N&campaign_id=&status=&search=` | —          | Paginated list               |
| GET    | `/backoffice/referrals/{id}`                                | —          | Referral detail with rewards |
| PATCH  | `/backoffice/referrals/{id}/flag`                           | `{reason}` | Flagged referral             |

### Rewards

| Method | Endpoint                                                   | Body | Response                  |
| ------ | ---------------------------------------------------------- | ---- | ------------------------- |
| GET    | `/backoffice/referral-rewards?page=N&referral_id=&status=` | —    | Paginated list            |
| PATCH  | `/backoffice/referral-rewards/{id}/retry`                  | —    | Retry failed disbursement |

### Analytics

| Method | Endpoint                                                         | Body | Response       |
| ------ | ---------------------------------------------------------------- | ---- | -------------- |
| GET    | `/backoffice/referral-analytics/overview?campaign_id=&period=`   | —    | Stats summary  |
| GET    | `/backoffice/referral-analytics/leaderboard?campaign_id=&limit=` | —    | Top referrers  |
| GET    | `/backoffice/referral-analytics/tier-distribution?campaign_id=`  | —    | Tier breakdown |

---

## CRM Pages

### Navigation

Sidebar: **Marketing** accordion → add "Referral Program" item (Gift icon)

### Page Structure

#### 1. Campaign List — `/dashboard/referral-campaigns`

- Table columns: Name, Target Role (badge), Status (badge), Period, Total Referrals, Total Disbursed, Actions
- Filters: status chips (draft/active/paused/ended), target_role chips (client/mitra)
- Search: by campaign name
- Actions: edit, toggle status, delete (ConfirmDialog)

#### 2. Campaign Create — `/dashboard/referral-campaigns/create`

Multi-section FormCard:

- **Basic Info:** name, description, target_role, starts_at, ends_at, max_referrals_per_user
- **Milestones (repeater):** For each milestone: name, event_type (dropdown), referrer reward config, referee reward config
- **Tiers (repeater):** For each tier: name, icon, min/max referrals, bonus_percentage, extra_perks

#### 3. Campaign Edit — `/dashboard/referral-campaigns/[id]/edit`

Same form as create, pre-populated. Restrictions: cannot change target_role if campaign has referrals.

#### 4. Campaign Detail — `/dashboard/referral-campaigns/[id]`

- Overview stats: total referrals, active referrals, completed, conversion rate, total rewards disbursed
- Milestone breakdown: bar chart showing completion per milestone
- Tier distribution: donut chart
- Tabs: Overview | Referrals (filtered table) | Rewards (filtered table) | Leaderboard

#### 5. Referral List — `/dashboard/referrals`

- Table columns: Referrer, Referee, Campaign, Status (badge), Milestones (progress indicator), Rewards Given, Created
- Filters: campaign dropdown, status chips, date range
- Search: referrer/referee name
- Actions: view detail, flag

#### 6. Referral Detail — `/dashboard/referrals/[id]`

- Referrer info card + Referee info card
- Milestone timeline (visual progress with checkmarks)
- Reward history table
- Flag section (if flagged: reason + timestamp)

---

## Milestone Event Mapping

| Milestone    | Client event_type | Mitra event_type       |
| ------------ | ----------------- | ---------------------- |
| Registered   | `user_registered` | `user_registered`      |
| Verified     | `email_verified`  | `mitra_approved` (new) |
| First Action | `first_deposit`   | `first_transaction`    |

---

## Reward Disbursement Flow

### Cashback

```
1. Calculate base amount from milestone config
2. Get referrer's current tier → bonus_percentage
3. tier_bonus = base × (bonus_percentage / 100)
4. total = base + tier_bonus
5. Credit wallet: Wallet.balance += total
6. Create WalletTransaction(type: 'referral_reward', reference_type: 'referral_reward', reference_id: reward.id)
7. Update referral_rewards record (status: disbursed, wallet_transaction_id, disbursed_at)
```

### Voucher

```
1. Get voucher_id from milestone config
2. Create VoucherUser record (user_id, voucher_id, status: unused)
3. Update referral_rewards record (status: disbursed, disbursed_at)
```

### Failure Handling

- If wallet credit fails (inactive wallet, etc): reward.status = 'failed'
- CRM shows failed rewards with "Retry" button
- Retry re-attempts the same disbursement logic

---

## Status Badges (CRM)

### Campaign Status

| Status | Badge Variant |
| ------ | ------------- |
| draft  | neutral       |
| active | success       |
| paused | warning       |
| ended  | error         |

### Referral Status

| Status    | Badge Variant |
| --------- | ------------- |
| pending   | warning       |
| completed | success       |
| expired   | neutral       |
| flagged   | error         |

### Reward Status

| Status    | Badge Variant |
| --------- | ------------- |
| pending   | warning       |
| disbursed | success       |
| failed    | error         |

---

## Out of Scope (Phase 2)

- Mobile app UI (share screen, progress tracker, tier badge)
- Advanced anti-fraud (device fingerprint, IP detection, velocity checks)
- Push notifications for milestone completion
- Referral link with deeplink (currently code-based only)
- Leaderboard public page (mobile)
- Campaign A/B testing
