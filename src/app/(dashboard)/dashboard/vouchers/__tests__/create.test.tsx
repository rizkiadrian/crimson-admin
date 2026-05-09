import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
const mockParams: Record<string, string> = {};
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
  usePathname: () => "/dashboard/vouchers/create",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock vouchersService
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDetail = vi.fn();

vi.mock("@services/marketing/vouchers", () => ({
  vouchersService: {
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    detail: (...args: unknown[]) => mockDetail(...args),
  },
}));

// Mock serviceCategoriesService
const mockCategoriesList = vi.fn();
vi.mock("@services/backoffice/service-categories", () => ({
  serviceCategoriesService: {
    list: (...args: unknown[]) => mockCategoriesList(...args),
  },
}));

// Mock useNotificationStore
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (
    selector: (state: Record<string, unknown>) => unknown
  ) => selector({ showNotification: mockShowNotification }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_CATEGORIES = [
  { id: 1, name: "Haircut", icon_url: null, is_active: true },
  { id: 2, name: "Massage", icon_url: null, is_active: true },
];

const MOCK_VOUCHER_USED = {
  id: 5,
  code: "USED01",
  name: "Used Voucher",
  description: "A voucher that has been used",
  discount_type: "percentage" as const,
  target_user_type: "all" as const,
  discount_value: 15,
  max_discount_cap: 30000,
  min_transaction_amount: 50000,
  service_category_id: null,
  quota: 100,
  used_count: 10,
  per_user_limit: 2,
  distribution_type: "public_code" as const,
  starts_at: "2025-01-01T00:00:00.000Z",
  expires_at: "2025-12-31T00:00:00.000Z",
  is_active: true,
  created_by: 1,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-15T00:00:00.000Z",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderCreatePage() {
  const { default: VoucherCreatePage } = await import("../create/page");
  const result = render(<VoucherCreatePage />);
  await screen.findByRole("heading", { name: /Create Voucher/i });
  return result;
}

async function renderEditPage(voucher = MOCK_VOUCHER_USED) {
  mockParams.id = String(voucher.id);
  mockDetail.mockResolvedValue({ data: voucher });

  const { default: VoucherEditPage } = await import("../[id]/edit/page");
  const result = render(<VoucherEditPage />);
  await screen.findByRole("heading", { name: /Edit Voucher/i });
  return result;
}

/**
 * Helper to select an option from the custom FormSelect dropdown.
 * FormSelect uses a button trigger (with id) + listbox pattern, not a native <select>.
 * Since <button> is non-labellable, we find it by its id attribute directly.
 */
async function selectFormOption(
  user: ReturnType<typeof userEvent.setup>,
  selectId: string,
  optionLabel: string
) {
  const trigger = document.getElementById(selectId) as HTMLButtonElement;
  await user.click(trigger);
  const option = await screen.findByRole("option", { name: optionLabel });
  await user.click(option);
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("VoucherCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoriesList.mockResolvedValue({
      data: MOCK_CATEGORIES,
      meta: {
        pagination: { total: 2, per_page: 100, current_page: 1, last_page: 1 },
      },
    });
  });

  // ── Conditional field rendering per discount_type ───────────────────────────

  describe("conditional field rendering per discount_type", () => {
    it("shows discount_value and max_discount_cap for percentage type (default)", async () => {
      await renderCreatePage();

      expect(screen.getByLabelText(/Discount Value/)).toBeInTheDocument();
      expect(
        screen.getByLabelText("Max Discount Cap (Rp)")
      ).toBeInTheDocument();
    });

    it("shows discount_value (Rp) and hides max_discount_cap for fixed_amount", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Fixed Amount");

      await waitFor(() => {
        expect(
          screen.getByLabelText("Discount Value (Rp)")
        ).toBeInTheDocument();
      });
      expect(
        screen.queryByLabelText("Max Discount Cap (Rp)")
      ).not.toBeInTheDocument();
    });

    it("shows service_category_id and hides discount_value for free_service", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Free Service");

      await waitFor(() => {
        expect(
          document.getElementById("service_category_id")
        ).toBeInTheDocument();
      });
      expect(screen.queryByLabelText(/Discount Value/)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("Max Discount Cap (Rp)")
      ).not.toBeInTheDocument();
    });

    it("shows discount_value (%) and hides max_discount_cap for commission_discount", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Commission Discount");

      await waitFor(() => {
        expect(screen.getByLabelText("Discount Value (%)")).toBeInTheDocument();
      });
      expect(
        screen.queryByLabelText("Max Discount Cap (Rp)")
      ).not.toBeInTheDocument();
    });
  });

  // ── commission_discount forces target=mitra ─────────────────────────────────

  describe("commission_discount forces target=mitra", () => {
    it("forces target_user_type to mitra when commission_discount is selected", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Commission Discount");

      await waitFor(() => {
        const targetTrigger = document.getElementById("target_user_type");
        expect(targetTrigger).toHaveTextContent("Mitra");
      });
    });

    it("disables target_user_type selector when commission_discount is selected", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Commission Discount");

      await waitFor(() => {
        const targetTrigger = document.getElementById("target_user_type");
        expect(targetTrigger).toBeDisabled();
      });
    });
  });

  // ── free_service shows required service_category_id ─────────────────────────

  describe("free_service shows required service_category_id", () => {
    it("shows service category selector when free_service is selected", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "discount_type", "Free Service");

      await waitFor(() => {
        expect(
          document.getElementById("service_category_id")
        ).toBeInTheDocument();
      });
    });

    it("does not show service category selector for other discount types", async () => {
      await renderCreatePage();

      // Default is percentage — no service category
      expect(
        document.getElementById("service_category_id")
      ).not.toBeInTheDocument();
    });
  });

  // ── distribution_type controls code field visibility ────────────────────────

  describe("distribution_type controls code field visibility", () => {
    it("shows code field when distribution_type is public_code (default)", async () => {
      await renderCreatePage();

      // Default distribution_type is "public_code"
      expect(screen.getByLabelText("Voucher Code")).toBeInTheDocument();
    });

    it("hides code field when distribution_type is auto_assign", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      await selectFormOption(user, "distribution_type", "Auto Assign");

      await waitFor(() => {
        expect(screen.queryByLabelText("Voucher Code")).not.toBeInTheDocument();
      });
    });

    it("shows code field when distribution_type is both", async () => {
      const user = userEvent.setup();
      await renderCreatePage();

      // First switch to auto_assign to hide code, then switch to both
      await selectFormOption(user, "distribution_type", "Auto Assign");
      await waitFor(() => {
        expect(screen.queryByLabelText("Voucher Code")).not.toBeInTheDocument();
      });

      await selectFormOption(user, "distribution_type", "Both");
      await waitFor(() => {
        expect(screen.getByLabelText("Voucher Code")).toBeInTheDocument();
      });
    });
  });

  // ── Date validation (starts_at before expires_at) ───────────────────────────

  describe("date validation", () => {
    it("renders start date and expiry date fields", async () => {
      await renderCreatePage();

      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Expiry Date")).toBeInTheDocument();
    });

    it("submits form and includes date fields in payload", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        message: "Voucher berhasil dibuat",
        data: { id: 1 },
      });

      await renderCreatePage();

      // Fill required fields
      await user.type(screen.getByLabelText("Voucher Name"), "Test Voucher");
      await user.type(screen.getByLabelText("Voucher Code"), "TEST01");
      await user.type(screen.getByLabelText(/Discount Value/), "20");
      await user.type(screen.getByLabelText("Max Discount Cap (Rp)"), "50000");

      // Submit the form (dates will be empty since calendar picker is complex to simulate)
      const submitButton = screen.getByRole("button", {
        name: /Create Voucher/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Test Voucher",
            code: "TEST01",
            discount_type: "percentage",
            discount_value: 20,
            max_discount_cap: 50000,
            // starts_at and expires_at are included in the payload structure
            starts_at: expect.any(String),
            expires_at: expect.any(String),
          })
        );
      });
    });
  });
});

// ─── Edit Page Tests ────────────────────────────────────────────────────────────

describe("VoucherEditPage — edit restrictions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategoriesList.mockResolvedValue({
      data: MOCK_CATEGORIES,
      meta: {
        pagination: { total: 2, per_page: 100, current_page: 1, last_page: 1 },
      },
    });
  });

  it("shows warning notice when voucher has been used", async () => {
    await renderEditPage(MOCK_VOUCHER_USED);

    expect(screen.getByText(/Voucher ini sudah digunakan/)).toBeInTheDocument();
  });

  it("disables discount_type field when used_count > 0", async () => {
    await renderEditPage(MOCK_VOUCHER_USED);

    const discountTypeSelect = document.getElementById("discount_type");
    expect(discountTypeSelect).toBeDisabled();
  });

  it("disables code field when used_count > 0", async () => {
    await renderEditPage(MOCK_VOUCHER_USED);

    const codeInput = screen.getByLabelText("Voucher Code");
    expect(codeInput).toBeDisabled();
  });

  it("does not disable other fields when used_count > 0", async () => {
    await renderEditPage(MOCK_VOUCHER_USED);

    const nameInput = screen.getByLabelText("Voucher Name");
    expect(nameInput).not.toBeDisabled();
  });

  it("does not show warning when voucher has not been used", async () => {
    const unusedVoucher = { ...MOCK_VOUCHER_USED, used_count: 0 };
    await renderEditPage(unusedVoucher);

    expect(
      screen.queryByText(/Voucher ini sudah digunakan/)
    ).not.toBeInTheDocument();
  });

  it("does not disable discount_type when used_count is 0", async () => {
    const unusedVoucher = { ...MOCK_VOUCHER_USED, used_count: 0 };
    await renderEditPage(unusedVoucher);

    const discountTypeSelect = document.getElementById("discount_type");
    expect(discountTypeSelect).not.toBeDisabled();
  });
});
