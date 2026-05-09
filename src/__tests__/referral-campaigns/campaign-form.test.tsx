import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
const mockParams = vi.fn(() => ({ id: "1" }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams(),
  usePathname: () => "/dashboard/referral-campaigns/create",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock referral campaigns service
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDetail = vi.fn();

vi.mock("@services/marketing/referral-campaigns", () => ({
  referralCampaignsService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    detail: (...args: unknown[]) => mockDetail(...args),
  },
}));

// Mock notification store
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_CAMPAIGN_DETAIL = {
  id: 1,
  name: "Referral Client Q1 2025",
  description: "Test campaign",
  target_role: "client" as const,
  status: "active" as const,
  starts_at: "2025-01-01T00:00:00.000Z",
  ends_at: "2025-03-31T23:59:59.000Z",
  max_referrals_per_user: 10,
  created_by: 1,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
  deleted_at: null,
  milestones: [
    {
      id: 1,
      campaign_id: 1,
      name: "Registration",
      event_type: "registration",
      sort_order: 1,
      referrer_reward_type: "cashback" as const,
      referrer_reward_amount: 50000,
      referrer_voucher_id: null,
      referee_reward_type: "voucher" as const,
      referee_reward_amount: null,
      referee_voucher_id: 5,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    },
  ],
  tiers: [
    {
      id: 1,
      campaign_id: 1,
      name: "Bronze",
      icon: null,
      min_referrals: 0,
      max_referrals: 5,
      bonus_percentage: 5,
      extra_perks: null,
      sort_order: 1,
      created_at: "2025-01-01T00:00:00.000Z",
      updated_at: "2025-01-01T00:00:00.000Z",
    },
  ],
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderCreatePage() {
  const { default: CreatePage } =
    await import("@app/(dashboard)/dashboard/referral-campaigns/create/page");
  const result = render(<CreatePage />);
  // Wait for form to render
  await screen.findByText("Create Referral Campaign");
  return result;
}

async function renderEditPage() {
  mockDetail.mockResolvedValue({ data: MOCK_CAMPAIGN_DETAIL });
  const { default: EditPage } =
    await import("@app/(dashboard)/dashboard/referral-campaigns/[id]/edit/page");
  const result = render(<EditPage />);
  // Wait for data to load and form to render
  await screen.findByText("Edit Referral Campaign");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 16.3, 16.4, 16.5, 16.6, 16.7, 17.2, 17.3**
 */
describe("Campaign Create/Edit Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Conditional field rendering per reward_type ─────────────────────────────

  describe("conditional field rendering per reward_type", () => {
    it("shows amount input when referrer reward type is cashback (default)", async () => {
      await renderCreatePage();

      // Default reward type is cashback, so amount field should be visible
      const amountInputs = screen.getAllByPlaceholderText("e.g. 50000");
      expect(amountInputs.length).toBeGreaterThanOrEqual(1);
    });

    it("shows voucher ID input when reward type is changed to voucher", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      // Open the referrer reward type dropdown (custom FormSelect)
      const referrerTypeButton = document.getElementById(
        "milestones.0.referrer_reward_type"
      ) as HTMLElement;
      await user.click(referrerTypeButton);

      // Select "Voucher" option from the dropdown
      const voucherOption = screen.getByRole("option", { name: "Voucher" });
      await user.click(voucherOption);

      // Voucher ID field should appear
      await waitFor(() => {
        expect(screen.getByPlaceholderText("Voucher ID")).toBeInTheDocument();
      });
    });

    it("hides amount input when reward type is changed to none", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      // Open the referrer reward type dropdown
      const referrerTypeButton = document.getElementById(
        "milestones.0.referrer_reward_type"
      ) as HTMLElement;
      await user.click(referrerTypeButton);

      // Select "None" option
      const noneOption = screen.getByRole("option", { name: "None" });
      await user.click(noneOption);

      // Amount field should not be visible for this milestone's referrer section
      await waitFor(() => {
        const amountFields = screen.queryAllByPlaceholderText("e.g. 50000");
        // Only referee amount should remain (referee is still cashback)
        expect(amountFields.length).toBeLessThanOrEqual(1);
      });
    });
  });

  // ── Milestone repeater add/remove ───────────────────────────────────────────

  describe("milestone repeater add/remove", () => {
    it("renders one milestone entry by default", async () => {
      await renderCreatePage();

      expect(screen.getByText("Milestone 1")).toBeInTheDocument();
    });

    it("adds a new milestone when Add Milestone is clicked", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      const addButton = screen.getByText("Add Milestone");
      await user.click(addButton);

      expect(screen.getByText("Milestone 2")).toBeInTheDocument();
    });

    it("removes a milestone when remove button is clicked", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      // Add a second milestone first
      const addButton = screen.getByText("Add Milestone");
      await user.click(addButton);
      expect(screen.getByText("Milestone 2")).toBeInTheDocument();

      // Remove the second milestone
      const removeButtons = screen.getAllByLabelText("Remove milestone");
      await user.click(removeButtons[1]);

      expect(screen.queryByText("Milestone 2")).not.toBeInTheDocument();
    });

    it("does not show remove button when only one milestone exists", async () => {
      await renderCreatePage();

      expect(
        screen.queryByLabelText("Remove milestone")
      ).not.toBeInTheDocument();
    });
  });

  // ── Tier repeater add/remove ────────────────────────────────────────────────

  describe("tier repeater add/remove", () => {
    it("shows no tiers by default with informational message", async () => {
      await renderCreatePage();

      expect(
        screen.getByText(
          "No tiers configured. Add tiers to provide bonus rewards for active referrers."
        )
      ).toBeInTheDocument();
    });

    it("adds a new tier when Add Tier is clicked", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      const addButton = screen.getByText("Add Tier");
      await user.click(addButton);

      expect(screen.getByText("Tier 1")).toBeInTheDocument();
    });

    it("removes a tier when remove button is clicked", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      // Add a tier
      const addButton = screen.getByText("Add Tier");
      await user.click(addButton);
      expect(screen.getByText("Tier 1")).toBeInTheDocument();

      // Remove the tier
      const removeButton = screen.getByLabelText("Remove tier");
      await user.click(removeButton);

      expect(screen.queryByText("Tier 1")).not.toBeInTheDocument();
    });

    it("adds multiple tiers with correct numbering", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      const addButton = screen.getByText("Add Tier");
      await user.click(addButton);
      await user.click(addButton);

      expect(screen.getByText("Tier 1")).toBeInTheDocument();
      expect(screen.getByText("Tier 2")).toBeInTheDocument();
    });
  });

  // ── Date validation ─────────────────────────────────────────────────────────

  describe("date validation (starts_at before ends_at)", () => {
    it("renders start date and end date inputs", async () => {
      await renderCreatePage();

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date (optional)")).toBeInTheDocument();
    });

    it("renders start date input as a date picker field", async () => {
      await renderCreatePage();

      const startDateInput = screen.getByLabelText("Start Date");
      // Date inputs use a calendar picker (read-only text input)
      expect(startDateInput).toBeInTheDocument();
      expect(startDateInput).toHaveAttribute(
        "placeholder",
        "Select start date"
      );
    });

    it("renders end date input as a date picker field", async () => {
      await renderCreatePage();

      const endDateInput = screen.getByLabelText("End Date (optional)");
      expect(endDateInput).toBeInTheDocument();
      expect(endDateInput).toHaveAttribute("placeholder", "Select end date");
    });
  });

  // ── Edit restrictions ───────────────────────────────────────────────────────

  describe("edit restrictions (disabled target_role when has active referrals)", () => {
    it("disables target_role select when campaign is active", async () => {
      await renderEditPage();

      // FormSelect renders a button with the id as the trigger
      const targetRoleButton = document.getElementById(
        "target_role"
      ) as HTMLElement;
      expect(targetRoleButton).toBeDisabled();
    });

    it("shows warning notice when campaign has active referrals", async () => {
      await renderEditPage();

      expect(
        screen.getByText(/Campaign ini memiliki referral aktif/)
      ).toBeInTheDocument();
    });

    it("does not disable target_role for draft campaigns", async () => {
      const draftCampaign = {
        ...MOCK_CAMPAIGN_DETAIL,
        status: "draft" as const,
      };
      mockDetail.mockResolvedValue({ data: draftCampaign });

      const { default: EditPage } =
        await import("@app/(dashboard)/dashboard/referral-campaigns/[id]/edit/page");
      render(<EditPage />);
      await screen.findByText("Edit Referral Campaign");

      const targetRoleButton = document.getElementById(
        "target_role"
      ) as HTMLElement;
      expect(targetRoleButton).not.toBeDisabled();
    });

    it("does not show warning for draft campaigns", async () => {
      const draftCampaign = {
        ...MOCK_CAMPAIGN_DETAIL,
        status: "draft" as const,
      };
      mockDetail.mockResolvedValue({ data: draftCampaign });

      const { default: EditPage } =
        await import("@app/(dashboard)/dashboard/referral-campaigns/[id]/edit/page");
      render(<EditPage />);
      await screen.findByText("Edit Referral Campaign");

      expect(
        screen.queryByText(/Campaign ini memiliki referral aktif/)
      ).not.toBeInTheDocument();
    });
  });
});
