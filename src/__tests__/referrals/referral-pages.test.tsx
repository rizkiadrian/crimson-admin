import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockParams = vi.fn(() => ({ id: "1" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams(),
  usePathname: () => "/dashboard/referrals",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock referrals service
const mockList = vi.fn();
const mockDetailFn = vi.fn();
const mockFlag = vi.fn();
const mockRetryReward = vi.fn();

vi.mock("@services/backoffice/referrals", () => ({
  referralsService: {
    list: (...args: unknown[]) => mockList(...args),
    detail: (...args: unknown[]) => mockDetailFn(...args),
    flag: (...args: unknown[]) => mockFlag(...args),
    retryReward: (...args: unknown[]) => mockRetryReward(...args),
  },
}));

// Mock confirm store
const mockShowConfirm = vi.fn();
vi.mock("@store/useConfirmStore", () => ({
  useConfirmStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showConfirm: mockShowConfirm }),
}));

// Mock notification store
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_REFERRALS = [
  {
    id: 1,
    campaign_id: 1,
    referrer_id: 10,
    referee_id: 20,
    referral_code: "JOHN1234",
    status: "pending" as const,
    current_milestone_id: 1,
    completed_at: null,
    expires_at: null,
    flag_reason: null,
    created_at: "2025-06-01T10:00:00.000Z",
    updated_at: "2025-06-01T10:00:00.000Z",
    referrer: { id: 10, name: "John Doe", email: "john@example.com" },
    referee: { id: 20, name: "Jane Smith", email: "jane@example.com" },
    campaign: { id: 1, name: "Referral Client Q1" },
    current_milestone: { id: 1, name: "Registration", sort_order: 1 },
  },
  {
    id: 2,
    campaign_id: 1,
    referrer_id: 11,
    referee_id: 21,
    referral_code: "BOB5678",
    status: "completed" as const,
    current_milestone_id: 3,
    completed_at: "2025-06-15T12:00:00.000Z",
    expires_at: null,
    flag_reason: null,
    created_at: "2025-05-20T08:00:00.000Z",
    updated_at: "2025-06-15T12:00:00.000Z",
    referrer: { id: 11, name: "Bob Wilson", email: "bob@example.com" },
    referee: { id: 21, name: "Alice Brown", email: "alice@example.com" },
    campaign: { id: 1, name: "Referral Client Q1" },
    current_milestone: { id: 3, name: "First Transaction", sort_order: 3 },
  },
  {
    id: 3,
    campaign_id: 2,
    referrer_id: 12,
    referee_id: 22,
    referral_code: "MIKE9012",
    status: "flagged" as const,
    current_milestone_id: null,
    completed_at: null,
    expires_at: null,
    flag_reason: "Suspicious activity detected",
    created_at: "2025-06-10T14:00:00.000Z",
    updated_at: "2025-06-12T09:00:00.000Z",
    referrer: { id: 12, name: "Mike Johnson", email: "mike@example.com" },
    referee: { id: 22, name: "Sara Lee", email: "sara@example.com" },
    campaign: { id: 2, name: "Referral Mitra Q2" },
    current_milestone: null,
  },
];

const MOCK_PAGINATION = {
  total: 3,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

const MOCK_REFERRAL_DETAIL = {
  id: 1,
  campaign_id: 1,
  referrer_id: 10,
  referee_id: 20,
  referral_code: "JOHN1234",
  status: "pending" as const,
  current_milestone_id: 1,
  completed_at: null,
  expires_at: "2025-12-31T23:59:59.000Z",
  flag_reason: null,
  created_at: "2025-06-01T10:00:00.000Z",
  updated_at: "2025-06-01T10:00:00.000Z",
  referrer: { id: 10, name: "John Doe", email: "john@example.com" },
  referee: { id: 20, name: "Jane Smith", email: "jane@example.com" },
  campaign: {
    id: 1,
    name: "Referral Client Q1",
    milestones: [
      {
        id: 1,
        name: "Registration",
        sort_order: 1,
        event_type: "registration",
      },
      {
        id: 2,
        name: "Profile Completed",
        sort_order: 2,
        event_type: "profile_completed",
      },
      {
        id: 3,
        name: "First Transaction",
        sort_order: 3,
        event_type: "first_transaction",
      },
    ],
  },
  rewards: [
    {
      id: "reward-uuid-1",
      referral_id: 1,
      milestone_id: 1,
      recipient_id: 10,
      recipient_type: "referrer" as const,
      reward_type: "cashback" as const,
      amount: 50000,
      tier_bonus_amount: 5000,
      voucher_id: null,
      wallet_transaction_id: "txn-uuid-1",
      status: "disbursed" as const,
      disbursed_at: "2025-06-02T10:00:00.000Z",
      created_at: "2025-06-02T10:00:00.000Z",
      milestone: { id: 1, name: "Registration" },
    },
    {
      id: "reward-uuid-2",
      referral_id: 1,
      milestone_id: 1,
      recipient_id: 20,
      recipient_type: "referee" as const,
      reward_type: "voucher" as const,
      amount: null,
      tier_bonus_amount: 0,
      voucher_id: 5,
      wallet_transaction_id: null,
      status: "failed" as const,
      disbursed_at: null,
      created_at: "2025-06-02T10:00:00.000Z",
      milestone: { id: 1, name: "Registration" },
    },
  ],
};

const MOCK_FLAGGED_DETAIL = {
  ...MOCK_REFERRAL_DETAIL,
  id: 3,
  status: "flagged" as const,
  flag_reason: "Suspicious activity detected",
  rewards: [],
};

function setupMockList(
  referrals = MOCK_REFERRALS,
  pagination = MOCK_PAGINATION
) {
  mockList.mockResolvedValue({
    data: referrals,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderListPage() {
  const { default: ReferralsPage } =
    await import("@app/(dashboard)/dashboard/referrals/page");
  const result = render(<ReferralsPage />);
  // Wait for data to load
  await screen.findByText("John Doe");
  return result;
}

async function renderDetailPage(
  detail:
    | typeof MOCK_REFERRAL_DETAIL
    | typeof MOCK_FLAGGED_DETAIL = MOCK_REFERRAL_DETAIL
) {
  mockDetailFn.mockResolvedValue({ data: detail });
  const { default: ReferralDetailPage } =
    await import("@app/(dashboard)/dashboard/referrals/[id]/page");
  const result = render(<ReferralDetailPage />);
  // Wait for data to load
  await screen.findByText("Referral Details");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 19.1, 19.4, 20.1, 20.2, 20.3, 20.4, 20.5**
 */
describe("Referral List Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Table rendering with progress indicator ─────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title", async () => {
      await renderListPage();

      expect(screen.getByText("Referrals")).toBeInTheDocument();
    });

    it("renders referrer names in the table", async () => {
      await renderListPage();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
      expect(screen.getByText("Mike Johnson")).toBeInTheDocument();
    });

    it("renders referee names in the table", async () => {
      await renderListPage();

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Alice Brown")).toBeInTheDocument();
      expect(screen.getByText("Sara Lee")).toBeInTheDocument();
    });

    it("renders campaign names in the table", async () => {
      await renderListPage();

      const q1Campaigns = screen.getAllByText("Referral Client Q1");
      expect(q1Campaigns.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Referral Mitra Q2")).toBeInTheDocument();
    });

    it("renders milestone progress indicator", async () => {
      await renderListPage();

      // First referral has current_milestone with sort_order 1
      expect(screen.getByText("1 completed")).toBeInTheDocument();
      // Second referral has current_milestone with sort_order 3
      expect(screen.getByText("3 completed")).toBeInTheDocument();
      // Third referral has no current_milestone
      expect(screen.getByText("0 completed")).toBeInTheDocument();
    });
  });

  // ── Status badge variants ───────────────────────────────────────────────────

  describe("status badge variants", () => {
    it("renders Pending badge for pending referrals", async () => {
      await renderListPage();

      expect(screen.getByText("Pending")).toBeInTheDocument();
    });

    it("renders Completed badge for completed referrals", async () => {
      await renderListPage();

      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    it("renders Flagged badge for flagged referrals", async () => {
      await renderListPage();

      expect(screen.getByText("Flagged")).toBeInTheDocument();
    });
  });
});

describe("Referral Detail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Milestone timeline rendering ────────────────────────────────────────────

  describe("milestone timeline rendering", () => {
    it("renders milestone progress section", async () => {
      await renderDetailPage();

      expect(screen.getByText("Milestone Progress")).toBeInTheDocument();
    });

    it("renders all milestones from campaign", async () => {
      await renderDetailPage();

      // "Registration" appears in both milestone timeline and reward table
      const registrationElements = screen.getAllByText("Registration");
      expect(registrationElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("Profile Completed")).toBeInTheDocument();
      expect(screen.getByText("First Transaction")).toBeInTheDocument();
    });

    it("renders milestone event types", async () => {
      await renderDetailPage();

      expect(screen.getByText("Event: registration")).toBeInTheDocument();
      expect(screen.getByText("Event: profile_completed")).toBeInTheDocument();
      expect(screen.getByText("Event: first_transaction")).toBeInTheDocument();
    });

    it("renders step numbers for milestones", async () => {
      await renderDetailPage();

      expect(screen.getByText("Step 1")).toBeInTheDocument();
      expect(screen.getByText("Step 2")).toBeInTheDocument();
      expect(screen.getByText("Step 3")).toBeInTheDocument();
    });
  });

  // ── Reward history table ────────────────────────────────────────────────────

  describe("reward history table", () => {
    it("renders reward history section", async () => {
      await renderDetailPage();

      expect(screen.getByText("Reward History")).toBeInTheDocument();
    });

    it("renders reward table headers", async () => {
      await renderDetailPage();

      expect(screen.getByText("Milestone")).toBeInTheDocument();
      expect(screen.getByText("Recipient")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
    });

    it("renders recipient type badges", async () => {
      await renderDetailPage();

      // "Referrer" and "Referee" appear in both info cards and reward table
      const referrerElements = screen.getAllByText("Referrer");
      const refereeElements = screen.getAllByText("Referee");
      expect(referrerElements.length).toBeGreaterThanOrEqual(1);
      expect(refereeElements.length).toBeGreaterThanOrEqual(1);
    });

    it("renders reward type badges", async () => {
      await renderDetailPage();

      expect(screen.getByText("Cashback")).toBeInTheDocument();
      expect(screen.getByText("Voucher")).toBeInTheDocument();
    });

    it("renders reward status badges", async () => {
      await renderDetailPage();

      expect(screen.getByText("Disbursed")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });

    it("renders tier bonus amount for cashback rewards", async () => {
      await renderDetailPage();

      // The reward has tier_bonus_amount of 5000
      const bonusText = screen.getByText(/bonus/i);
      expect(bonusText).toBeInTheDocument();
    });
  });

  // ── Retry button visibility for failed rewards ──────────────────────────────

  describe("retry button visibility", () => {
    it("shows retry button for failed rewards", async () => {
      await renderDetailPage();

      const retryButtons = screen.getAllByLabelText("Retry");
      expect(retryButtons.length).toBe(1);
    });

    it("does not show retry button for disbursed rewards", async () => {
      const detailWithOnlyDisbursed = {
        ...MOCK_REFERRAL_DETAIL,
        rewards: [MOCK_REFERRAL_DETAIL.rewards[0]], // Only the disbursed one
      };
      await renderDetailPage(detailWithOnlyDisbursed);

      expect(screen.queryByLabelText("Retry")).not.toBeInTheDocument();
    });

    it("calls retryReward service when retry button is clicked", async () => {
      mockRetryReward.mockResolvedValue({ message: "Retry berhasil" });
      const user = userEvent.setup();
      await renderDetailPage();

      const retryButton = screen.getByLabelText("Retry");
      await user.click(retryButton);

      expect(mockRetryReward).toHaveBeenCalledWith("reward-uuid-2");
    });
  });

  // ── Flag section display ────────────────────────────────────────────────────

  describe("flag section display", () => {
    it("displays flag information when referral is flagged", async () => {
      await renderDetailPage(MOCK_FLAGGED_DETAIL);

      expect(screen.getByText("Flag Information")).toBeInTheDocument();
      expect(
        screen.getByText("Suspicious activity detected")
      ).toBeInTheDocument();
    });

    it("displays Flagged label in flag section", async () => {
      await renderDetailPage(MOCK_FLAGGED_DETAIL);

      // The flag section has a "Flagged" text label
      const flaggedElements = screen.getAllByText("Flagged");
      expect(flaggedElements.length).toBeGreaterThanOrEqual(1);
    });

    it("does not display flag section for non-flagged referrals", async () => {
      await renderDetailPage(); // Default is pending, not flagged

      expect(screen.queryByText("Flag Information")).not.toBeInTheDocument();
    });
  });

  // ── Referral info display ───────────────────────────────────────────────────

  describe("referral info display", () => {
    it("renders referrer information", async () => {
      await renderDetailPage();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    it("renders referee information", async () => {
      await renderDetailPage();

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("renders referral code", async () => {
      await renderDetailPage();

      expect(screen.getByText("JOHN1234")).toBeInTheDocument();
    });
  });
});
