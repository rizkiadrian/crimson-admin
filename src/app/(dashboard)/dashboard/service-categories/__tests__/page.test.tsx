import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/service-categories",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock serviceCategoriesService
const mockList = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("@services/backoffice/service-categories", () => ({
  serviceCategoriesService: {
    list: (...args: unknown[]) => mockList(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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

const MOCK_CATEGORIES = [
  {
    id: 1,
    name: "Plumbing",
    slug: "plumbing",
    description: "Plumbing services",
    icon: "http://localhost/storage/icons/plumbing.svg",
    types: ["general" as const, "daily" as const],
    is_active: true,
    created_at: "2025-01-15T10:00:00.000Z",
    updated_at: "2025-01-15T10:00:00.000Z",
  },
  {
    id: 2,
    name: "Electrical",
    slug: "electrical",
    description: null,
    icon: null,
    types: ["monthly" as const],
    is_active: false,
    created_at: "2025-02-20T14:30:00.000Z",
    updated_at: "2025-02-20T14:30:00.000Z",
  },
];

const MOCK_PAGINATION = {
  total: 2,
  per_page: 15,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

function setupMockList(
  categories = MOCK_CATEGORIES,
  pagination = MOCK_PAGINATION
) {
  mockList.mockResolvedValue({
    data: categories,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: ServiceCategoriesPage } = await import("../page");
  const result = render(<ServiceCategoriesPage />);
  // Wait for the table to render with data
  await screen.findByText("Plumbing");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("ServiceCategoriesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Render table with correct columns ─────────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title and Create button", async () => {
      await renderPage();

      expect(screen.getByText("Service Categories")).toBeInTheDocument();
      expect(screen.getByText("Create Service Category")).toBeInTheDocument();
    });

    it("renders category names in the table", async () => {
      await renderPage();

      expect(screen.getByText("Plumbing")).toBeInTheDocument();
      expect(screen.getByText("Electrical")).toBeInTheDocument();
    });

    it("renders slug values", async () => {
      await renderPage();

      expect(screen.getByText("plumbing")).toBeInTheDocument();
      expect(screen.getByText("electrical")).toBeInTheDocument();
    });

    it("renders type badges correctly", async () => {
      await renderPage();

      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Daily")).toBeInTheDocument();
      expect(screen.getByText("Monthly")).toBeInTheDocument();
    });

    it("renders status badges correctly", async () => {
      await renderPage();

      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();

      expect(screen.getByText("Icon")).toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Slug")).toBeInTheDocument();
      expect(screen.getByText("Types")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Created Date")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("renders icon image for category with icon", async () => {
      await renderPage();

      const img = screen.getByAltText("Plumbing");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "http://localhost/storage/icons/plumbing.svg"
      );
    });

    it("renders action buttons for each row", async () => {
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      expect(deleteButtons).toHaveLength(2);

      const deactivateButton = screen.getByLabelText("Deactivate");
      const activateButton = screen.getByLabelText("Activate");
      expect(deactivateButton).toBeInTheDocument();
      expect(activateButton).toBeInTheDocument();
    });
  });

  // ── Search functionality ────────────────────────────────────────────────────

  describe("search functionality", () => {
    it("renders search input with placeholder", async () => {
      await renderPage();

      const searchInput = screen.getByPlaceholderText("Search by name...");
      expect(searchInput).toBeInTheDocument();
    });

    it("calls service with search param after typing and pressing Enter", async () => {
      const user = userEvent.setup();
      await renderPage();

      mockList.mockClear();

      const searchInput = screen.getByPlaceholderText("Search by name...");
      await user.type(searchInput, "Plumbing{Enter}");

      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Plumbing" })
      );
    });
  });

  // ── Delete confirmation ───────────────────────────────────────────────────

  describe("delete confirmation", () => {
    it("calls showConfirm when delete button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Hapus Service Category?",
          description: expect.stringContaining("Plumbing"),
        })
      );
    });

    it("calls serviceCategoriesService.delete when confirm callback is executed", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({
        message: "Service category berhasil dihapus",
      });

      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      // Extract the onConfirm callback from the showConfirm call
      const confirmCall = mockShowConfirm.mock.calls[0][0];
      await confirmCall.onConfirm();

      expect(mockDelete).toHaveBeenCalledWith(1);
      expect(mockShowNotification).toHaveBeenCalledWith(
        "Service category berhasil dihapus",
        "success"
      );
    });
  });

  // ── Toggle status ─────────────────────────────────────────────────────────

  describe("toggle status", () => {
    it("calls update service to deactivate an active category", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        data: { ...MOCK_CATEGORIES[0], is_active: false },
      });

      await renderPage();

      // First category is active, so its toggle button should say "Deactivate"
      const deactivateButton = screen.getByLabelText("Deactivate");
      await user.click(deactivateButton);

      expect(mockUpdate).toHaveBeenCalledWith(1, expect.any(FormData));

      // Verify the FormData contains the toggled is_active value
      const formData = mockUpdate.mock.calls[0][1] as FormData;
      expect(formData.get("is_active")).toBe("0");
      expect(formData.get("_method")).toBe("PUT");
    });

    it("calls update service to activate an inactive category", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        data: { ...MOCK_CATEGORIES[1], is_active: true },
      });

      await renderPage();

      // Second category is inactive, so its toggle button should say "Activate"
      const activateButton = screen.getByLabelText("Activate");
      await user.click(activateButton);

      expect(mockUpdate).toHaveBeenCalledWith(2, expect.any(FormData));

      // Verify the FormData contains the toggled is_active value
      const formData = mockUpdate.mock.calls[0][1] as FormData;
      expect(formData.get("is_active")).toBe("1");
      expect(formData.get("_method")).toBe("PUT");
    });

    it("shows success notification after status toggle", async () => {
      const user = userEvent.setup();
      mockUpdate.mockResolvedValue({
        data: { ...MOCK_CATEGORIES[0], is_active: false },
      });

      await renderPage();

      const deactivateButton = screen.getByLabelText("Deactivate");
      await user.click(deactivateButton);

      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining("Plumbing"),
        "success"
      );
    });
  });
});
