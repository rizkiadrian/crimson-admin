import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/vouchers",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock vouchersService
const mockList = vi.fn();
const mockDelete = vi.fn();
const mockToggleActive = vi.fn();

vi.mock("@services/backoffice/vouchers", () => ({
  vouchersService: {
    list: (...args: unknown[]) => mockList(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    toggleActive: (...args: unknown[]) => mockToggleActive(...args),
  },
}));

// Mock useConfirmStore
const mockShowConfirm = vi.fn();
vi.mock("@store/useConfirmStore", () => ({
  useConfirmStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ showConfirm: mockShowConfirm }),
}));

// Mock useNotificationStore
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (
    selector: (state: Record<string, unknown>) => unknown
  ) => selector({ showNotification: mockShowNotification }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const now = new Date();
const pastDate = new Date(now.getTime() - 86400000 * 30).toISOString(); // 30 days ago
const futureDate = new Date(now.getTime() + 86400000 * 30).toISOString(); // 30 days from now
const farFutureDate = new Date(now.getTime() + 86400000 * 60).toISOString(); // 60 days from now
const farPastDate = new Date(now.getTime() - 86400000 * 60).toISOString(); // 60 days ago

const MOCK_VOUCHERS = [
  {
    id: 1,
    code: "NEWYEAR2024",
    name: "Diskon Tahun Baru",
    description: "Diskon spesial tahun baru",
    discount_type: "percentage" as const,
    target_user_type: "all" as const,
    discount_value: 20,
    max_discount_cap: 50000,
    min_transaction_amount: 100000,
    service_category_id: null,
    quota: 100,
    used_count: 25,
    per_user_limit: 1,
    distribution_type: "public_code" as const,
    starts_at: pastDate,
    expires_at: futureDate,
    is_active: true,
    created_by: 1,
    created_at: pastDate,
    updated_at: pastDate,
  },
  {
    id: 2,
    code: "MITRA50",
    name: "Mitra Commission",
    description: null,
    discount_type: "commission_discount" as const,
    target_user_type: "mitra" as const,
    discount_value: 50,
    max_discount_cap: null,
    min_transaction_amount: null,
    service_category_id: null,
    quota: null,
    used_count: 0,
    per_user_limit: 3,
    distribution_type: "auto_assign" as const,
    starts_at: pastDate,
    expires_at: futureDate,
    is_active: false,
    created_by: 1,
    created_at: pastDate,
    updated_at: pastDate,
  },
  {
    id: 3,
    code: "EXPIRED01",
    name: "Voucher Expired",
    description: null,
    discount_type: "fixed_amount" as const,
    target_user_type: "client" as const,
    discount_value: 25000,
    max_discount_cap: null,
    min_transaction_amount: null,
    service_category_id: null,
    quota: 50,
    used_count: 50,
    per_user_limit: 1,
    distribution_type: "public_code" as const,
    starts_at: farPastDate,
    expires_at: pastDate, // expired (past date < now, but is_active is true)
    is_active: true,
    created_by: 1,
    created_at: farPastDate,
    updated_at: farPastDate,
  },
  {
    id: 4,
    code: "FUTURE01",
    name: "Voucher Scheduled",
    description: null,
    discount_type: "free_service" as const,
    target_user_type: "client" as const,
    discount_value: 0,
    max_discount_cap: null,
    min_transaction_amount: null,
    service_category_id: 1,
    quota: 10,
    used_count: 0,
    per_user_limit: 1,
    distribution_type: "public_code" as const,
    starts_at: futureDate, // scheduled (starts in the future)
    expires_at: farFutureDate,
    is_active: true,
    created_by: 1,
    created_at: pastDate,
    updated_at: pastDate,
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

function setupMockList(vouchers = MOCK_VOUCHERS, pagination = MOCK_PAGINATION) {
  mockList.mockResolvedValue({
    data: vouchers,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: VouchersPage } = await import("../page");
  const result = render(<VouchersPage />);
  await screen.findByText("Diskon Tahun Baru");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("VouchersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Render table with mock data ─────────────────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title and Create Voucher button", async () => {
      await renderPage();

      expect(screen.getByText("Vouchers")).toBeInTheDocument();
      expect(screen.getByText("Create Voucher")).toBeInTheDocument();
    });

    it("renders voucher names in the table", async () => {
      await renderPage();

      expect(screen.getByText("Diskon Tahun Baru")).toBeInTheDocument();
      expect(screen.getByText("Mitra Commission")).toBeInTheDocument();
      expect(screen.getByText("Voucher Expired")).toBeInTheDocument();
      expect(screen.getByText("Voucher Scheduled")).toBeInTheDocument();
    });

    it("renders voucher codes in the table", async () => {
      await renderPage();

      expect(screen.getByText("NEWYEAR2024")).toBeInTheDocument();
      expect(screen.getByText("MITRA50")).toBeInTheDocument();
    });

    it("renders discount type badges correctly", async () => {
      await renderPage();

      expect(screen.getByText("Percentage")).toBeInTheDocument();
      expect(screen.getByText("Commission")).toBeInTheDocument();
      expect(screen.getByText("Fixed Amount")).toBeInTheDocument();
      expect(screen.getByText("Free Service")).toBeInTheDocument();
    });

    it("renders target badges correctly", async () => {
      await renderPage();

      // "All" target badge for first voucher
      const allBadges = screen.getAllByText("All");
      expect(allBadges.length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText("Mitra")).toBeInTheDocument();

      // "Client" target badge
      const clientBadges = screen.getAllByText("Client");
      expect(clientBadges.length).toBeGreaterThanOrEqual(1);
    });

    it("renders quota display correctly", async () => {
      await renderPage();

      expect(screen.getByText("25/100")).toBeInTheDocument();
      expect(screen.getByText("Unlimited")).toBeInTheDocument();
      expect(screen.getByText("50/50")).toBeInTheDocument();
      expect(screen.getByText("0/10")).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();

      expect(screen.getByText("Code")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Discount Type")).toBeInTheDocument();
      expect(screen.getByText("Target")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Quota")).toBeInTheDocument();
      expect(screen.getByText("Period")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  // ── Status badge derivation (Property 11) ──────────────────────────────────

  describe("status badge derivation (Property 11)", () => {
    it("shows 'Active' badge for active voucher within valid period", async () => {
      await renderPage();

      // First voucher: is_active=true, starts_at < now < expires_at → Active
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("shows 'Inactive' badge when is_active is false (highest priority)", async () => {
      await renderPage();

      // Second voucher: is_active=false → Inactive (regardless of dates)
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("shows 'Expired' badge when expires_at < now", async () => {
      await renderPage();

      // Third voucher: is_active=true, expires_at < now → Expired
      expect(screen.getByText("Expired")).toBeInTheDocument();
    });

    it("shows 'Scheduled' badge when starts_at > now", async () => {
      await renderPage();

      // Fourth voucher: is_active=true, starts_at > now → Scheduled
      expect(screen.getByText("Scheduled")).toBeInTheDocument();
    });
  });

  // ── Search functionality ────────────────────────────────────────────────────

  describe("search functionality", () => {
    it("renders search input with placeholder", async () => {
      await renderPage();

      const searchInput = screen.getByPlaceholderText(
        "Search by code or name..."
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("calls service with search param after typing and pressing Enter", async () => {
      const user = userEvent.setup();
      await renderPage();

      mockList.mockClear();

      const searchInput = screen.getByPlaceholderText(
        "Search by code or name..."
      );
      await user.type(searchInput, "NEWYEAR{Enter}");

      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "NEWYEAR" })
      );
    });
  });

  // ── Filter functionality ──────────────────────────────────────────────────

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

      expect(screen.getByText("Filter Vouchers")).toBeInTheDocument();
    });

    it("shows discount type filter section in the filter popup", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // "Discount Type" appears in both the table header and the filter popup
      const discountTypeElements = screen.getAllByText("Discount Type");
      expect(discountTypeElements.length).toBeGreaterThanOrEqual(2);
    });

    it("shows target filter section in the filter popup", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // "Target" appears in both the table header and the filter popup
      const targetElements = screen.getAllByText("Target");
      expect(targetElements.length).toBeGreaterThanOrEqual(2);
    });

    it("shows status filter section in the filter popup", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // "Status" appears in both the table header and the filter popup
      const statusElements = screen.getAllByText("Status");
      expect(statusElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Delete confirmation dialog ────────────────────────────────────────────

  describe("delete confirmation dialog", () => {
    it("calls showConfirm when delete button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Hapus Voucher?",
          description: expect.stringContaining("Diskon Tahun Baru"),
        })
      );
    });

    it("calls vouchersService.delete when confirm callback is executed", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({ message: "Voucher berhasil dihapus" });

      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      // Extract the onConfirm callback from the showConfirm call
      const confirmCall = mockShowConfirm.mock.calls[0][0];
      await confirmCall.onConfirm();

      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockShowNotification).toHaveBeenCalledWith(
        "Voucher berhasil dihapus",
        "success"
      );
    });
  });

  // ── Toggle active action ──────────────────────────────────────────────────

  describe("toggle active action", () => {
    it("calls showConfirm with deactivate label for active voucher", async () => {
      const user = userEvent.setup();
      await renderPage();

      // First voucher is active, so its toggle button should say "Deactivate"
      const deactivateButton = screen.getAllByLabelText("Deactivate")[0];
      await user.click(deactivateButton);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Nonaktifkan Voucher?",
          confirmLabel: "Nonaktifkan",
        })
      );
    });

    it("calls showConfirm with activate label for inactive voucher", async () => {
      const user = userEvent.setup();
      await renderPage();

      // Second voucher is inactive, so its toggle button should say "Activate"
      const activateButton = screen.getAllByLabelText("Activate")[0];
      await user.click(activateButton);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Aktifkan Voucher?",
          confirmLabel: "Aktifkan",
        })
      );
    });

    it("calls vouchersService.toggleActive when confirm callback is executed", async () => {
      const user = userEvent.setup();
      mockToggleActive.mockResolvedValue({
        message: "Status voucher berhasil diubah",
      });

      await renderPage();

      const deactivateButton = screen.getAllByLabelText("Deactivate")[0];
      await user.click(deactivateButton);

      const confirmCall = mockShowConfirm.mock.calls[0][0];
      await confirmCall.onConfirm();

      expect(mockToggleActive).toHaveBeenCalledWith(1);
      expect(mockShowNotification).toHaveBeenCalledWith(
        "Status voucher berhasil diubah",
        "success"
      );
    });
  });
});
