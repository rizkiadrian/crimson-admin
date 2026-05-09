import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/referral-campaigns",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock referral campaigns service
const mockList = vi.fn();
const mockDelete = vi.fn();

vi.mock("@services/marketing/referral-campaigns", () => ({
  referralCampaignsService: {
    list: (...args: unknown[]) => mockList(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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

const MOCK_CAMPAIGNS = [
  {
    id: 1,
    name: "Referral Client Q1 2025",
    description: "Campaign for clients",
    target_role: "client" as const,
    status: "active" as const,
    starts_at: "2025-01-01T00:00:00.000Z",
    ends_at: "2025-03-31T23:59:59.000Z",
    max_referrals_per_user: 10,
    created_by: 1,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 2,
    name: "Referral Mitra Q2 2025",
    description: null,
    target_role: "mitra" as const,
    status: "draft" as const,
    starts_at: "2025-04-01T00:00:00.000Z",
    ends_at: null,
    max_referrals_per_user: null,
    created_by: 1,
    created_at: "2025-03-15T00:00:00.000Z",
    updated_at: "2025-03-15T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 3,
    name: "Paused Campaign",
    description: "Paused for review",
    target_role: "client" as const,
    status: "paused" as const,
    starts_at: "2025-02-01T00:00:00.000Z",
    ends_at: "2025-06-30T23:59:59.000Z",
    max_referrals_per_user: 5,
    created_by: 1,
    created_at: "2025-02-01T00:00:00.000Z",
    updated_at: "2025-02-15T00:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 4,
    name: "Ended Campaign",
    description: null,
    target_role: "mitra" as const,
    status: "ended" as const,
    starts_at: "2024-10-01T00:00:00.000Z",
    ends_at: "2024-12-31T23:59:59.000Z",
    max_referrals_per_user: null,
    created_by: 1,
    created_at: "2024-10-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    deleted_at: null,
  },
];

const MOCK_PAGINATION = {
  total: 4,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

function setupMockList(
  campaigns = MOCK_CAMPAIGNS,
  pagination = MOCK_PAGINATION
) {
  mockList.mockResolvedValue({
    data: campaigns,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: ReferralCampaignsPage } =
    await import("@app/(dashboard)/dashboard/referral-campaigns/page");
  const result = render(<ReferralCampaignsPage />);
  // Wait for data to load
  await screen.findByText("Referral Client Q1 2025");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

/**
 * **Validates: Requirements 15.1, 15.2, 15.3, 15.4, 15.6**
 */
describe("ReferralCampaignsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Render table with mock data ─────────────────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title", async () => {
      await renderPage();

      expect(screen.getByText("Referral Campaigns")).toBeInTheDocument();
    });

    it("renders campaign names in the table", async () => {
      await renderPage();

      expect(screen.getByText("Referral Client Q1 2025")).toBeInTheDocument();
      expect(screen.getByText("Referral Mitra Q2 2025")).toBeInTheDocument();
      expect(screen.getByText("Paused Campaign")).toBeInTheDocument();
      expect(screen.getByText("Ended Campaign")).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Target Role")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Period")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("renders Create Campaign button", async () => {
      await renderPage();

      expect(screen.getByText("Create Campaign")).toBeInTheDocument();
    });
  });

  // ── Status badge rendering ──────────────────────────────────────────────────

  describe("status badge rendering", () => {
    it("renders Active badge for active campaigns", async () => {
      await renderPage();

      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("renders Draft badge for draft campaigns", async () => {
      await renderPage();

      expect(screen.getByText("Draft")).toBeInTheDocument();
    });

    it("renders Paused badge for paused campaigns", async () => {
      await renderPage();

      expect(screen.getByText("Paused")).toBeInTheDocument();
    });

    it("renders Ended badge for ended campaigns", async () => {
      await renderPage();

      expect(screen.getByText("Ended")).toBeInTheDocument();
    });

    it("renders target role badges (Client and Mitra)", async () => {
      await renderPage();

      const clientBadges = screen.getAllByText("Client");
      const mitraBadges = screen.getAllByText("Mitra");
      expect(clientBadges.length).toBeGreaterThanOrEqual(1);
      expect(mitraBadges.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Search functionality ────────────────────────────────────────────────────

  describe("search functionality", () => {
    it("renders search input with placeholder", async () => {
      await renderPage();

      const searchInput = screen.getByPlaceholderText(
        "Search by campaign name..."
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("calls service with search param after typing and pressing Enter", async () => {
      const user = userEvent.setup();
      await renderPage();

      mockList.mockClear();

      const searchInput = screen.getByPlaceholderText(
        "Search by campaign name..."
      );
      await user.type(searchInput, "Client{Enter}");

      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Client" })
      );
    });
  });

  // ── Filter chips (status, target_role) ──────────────────────────────────────

  describe("filter functionality", () => {
    it("renders filter button", async () => {
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      expect(filterButton).toBeInTheDocument();
    });

    it("opens filter popup when filter button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      expect(screen.getByText("Filter Campaigns")).toBeInTheDocument();
    });

    it("shows status filter section with chips", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // Filter popup should show status options
      const statusSection = screen.getAllByText("Status");
      expect(statusSection.length).toBeGreaterThanOrEqual(2); // table header + filter section
    });

    it("shows target role filter section", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // "Target Role" appears in both the table header and the filter section
      const targetRoleElements = screen.getAllByText("Target Role");
      expect(targetRoleElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Delete confirmation dialog ──────────────────────────────────────────────

  describe("delete confirmation", () => {
    it("renders delete buttons for each campaign row", async () => {
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      expect(deleteButtons.length).toBe(4);
    });

    it("calls showConfirm when delete button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Hapus Campaign?",
          description: expect.stringContaining("Referral Client Q1 2025"),
        })
      );
    });

    it("calls delete service when confirm callback is executed", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({ message: "Campaign berhasil dihapus" });

      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      // Execute the onConfirm callback
      const confirmCall = mockShowConfirm.mock.calls[0][0];
      await confirmCall.onConfirm();

      expect(mockDelete).toHaveBeenCalledWith(1);
    });
  });
});
