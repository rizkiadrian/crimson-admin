import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/banners",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock bannersService
const mockList = vi.fn();
const mockDelete = vi.fn();
const mockUpdateStatus = vi.fn();

vi.mock("@services/marketing/banners", () => ({
  bannersService: {
    list: (...args: unknown[]) => mockList(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    updateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
  },
  // Re-export types as values for the component
  get BannerType() {
    return {};
  },
  get BannerStatus() {
    return {};
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

const MOCK_BANNERS = [
  {
    id: "banner-1",
    title: "Promo Spesial",
    type: "image" as const,
    status: "active" as const,
    display_order: 1,
    image_path: "backoffice/banners/promo.jpg",
    image_url: "http://localhost/storage/backoffice/banners/promo.jpg",
    background_config: null,
    text_elements: null,
    created_at: "2025-01-15T10:00:00.000Z",
    updated_at: "2025-01-15T10:00:00.000Z",
    deleted_at: null,
  },
  {
    id: "banner-2",
    title: "Diskon Akhir Tahun",
    type: "text_placement" as const,
    status: "inactive" as const,
    display_order: 2,
    image_path: null,
    image_url: null,
    background_config: {
      type: "gradient" as const,
      colors: ["#FF5733", "#33FF57"],
      direction: "to-right" as const,
    },
    text_elements: [
      {
        id: "te-1",
        content: "Diskon 50%",
        position_x: 50,
        position_y: 50,
        font_size: 36,
        font_color: "#FFFFFF",
        font_weight: "bold" as const,
      },
    ],
    created_at: "2025-02-20T14:30:00.000Z",
    updated_at: "2025-02-20T14:30:00.000Z",
    deleted_at: null,
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

function setupMockList(banners = MOCK_BANNERS, pagination = MOCK_PAGINATION) {
  mockList.mockResolvedValue({
    data: banners,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  // Dynamic import to ensure mocks are in place
  const { default: BannersPage } = await import("../page");
  const result = render(<BannersPage />);
  // Wait for the table to render with data
  await screen.findByText("Promo Spesial");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("BannersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Render table with mock data ─────────────────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title and Create Banner button", async () => {
      await renderPage();

      expect(screen.getByText("Banners")).toBeInTheDocument();
      expect(screen.getByText("Create Banner")).toBeInTheDocument();
    });

    it("renders banner titles in the table", async () => {
      await renderPage();

      expect(screen.getByText("Promo Spesial")).toBeInTheDocument();
      expect(screen.getByText("Diskon Akhir Tahun")).toBeInTheDocument();
    });

    it("renders type badges correctly", async () => {
      await renderPage();

      expect(screen.getByText("Image")).toBeInTheDocument();
      expect(screen.getByText("Text Placement")).toBeInTheDocument();
    });

    it("renders status badges correctly", async () => {
      await renderPage();

      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
    });

    it("renders display order values", async () => {
      await renderPage();

      // Display order values are rendered as text in the table rows
      // Use getAllByText since "1" and "2" may appear in other contexts (e.g. pagination)
      const orderCells = screen
        .getAllByText(/^[12]$/)
        .filter(
          (el) =>
            el.classList.contains("text-text-muted") &&
            el.tagName.toLowerCase() === "p"
        );
      expect(orderCells).toHaveLength(2);
    });

    it("renders thumbnail image for image-type banner", async () => {
      await renderPage();

      const img = screen.getByAltText("Promo Spesial");
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        "src",
        "http://localhost/storage/backoffice/banners/promo.jpg"
      );
    });

    it("renders Text placeholder for text_placement-type banner", async () => {
      await renderPage();

      // The text_placement banner shows a "Text" placeholder div
      expect(screen.getByText("Text")).toBeInTheDocument();
    });

    it("renders action buttons for each banner row", async () => {
      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      expect(deleteButtons).toHaveLength(2);

      // Edit buttons render as links (via Button with href)
      const deactivateButton = screen.getByLabelText("Deactivate");
      const activateButton = screen.getByLabelText("Activate");
      expect(deactivateButton).toBeInTheDocument();
      expect(activateButton).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();

      expect(screen.getByText("Thumbnail")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Order")).toBeInTheDocument();
      expect(screen.getByText("Created Date")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  // ── Search functionality ────────────────────────────────────────────────────

  describe("search functionality", () => {
    it("renders search input with placeholder", async () => {
      await renderPage();

      const searchInput = screen.getByPlaceholderText("Search by title...");
      expect(searchInput).toBeInTheDocument();
    });

    it("calls service with search param after typing and pressing Enter", async () => {
      const user = userEvent.setup();
      await renderPage();

      // Clear the initial call count
      mockList.mockClear();

      const searchInput = screen.getByPlaceholderText("Search by title...");
      await user.type(searchInput, "Promo{Enter}");

      // After Enter, the service should be called with search param
      expect(mockList).toHaveBeenCalledWith(
        expect.objectContaining({ search: "Promo" })
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

      expect(screen.getByText("Filter Banners")).toBeInTheDocument();
    });

    it("shows type filter section in the filter popup", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      expect(screen.getByText("Filter Banners")).toBeInTheDocument();
      // "Type" appears in both the table header and the filter popup section
      const typeElements = screen.getAllByText("Type");
      expect(typeElements.length).toBeGreaterThanOrEqual(2);
    });

    it("shows status filter section in the filter popup", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      expect(screen.getByText("Filter Banners")).toBeInTheDocument();
      // "Status" appears in both the table header and the filter popup section
      const statusElements = screen.getAllByText("Status");
      expect(statusElements.length).toBeGreaterThanOrEqual(2);
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
          title: "Hapus Banner?",
          description: expect.stringContaining("Promo Spesial"),
        })
      );
    });

    it("calls bannersService.delete when confirm callback is executed", async () => {
      const user = userEvent.setup();
      mockDelete.mockResolvedValue({ message: "Banner berhasil dihapus" });

      await renderPage();

      const deleteButtons = screen.getAllByLabelText("Delete");
      await user.click(deleteButtons[0]);

      // Extract the onConfirm callback from the showConfirm call
      const confirmCall = mockShowConfirm.mock.calls[0][0];
      await confirmCall.onConfirm();

      expect(mockDelete).toHaveBeenCalledWith("banner-1");
      expect(mockShowNotification).toHaveBeenCalledWith(
        "Banner berhasil dihapus",
        "success"
      );
    });
  });

  // ── Toggle status ─────────────────────────────────────────────────────────

  describe("toggle status", () => {
    it("calls showConfirm with deactivate label for active banner", async () => {
      const user = userEvent.setup();
      await renderPage();

      // First banner is active, so its toggle button should say "Deactivate"
      const deactivateButton = screen.getByLabelText("Deactivate");
      await user.click(deactivateButton);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Nonaktifkan Banner?",
          confirmLabel: "Nonaktifkan",
        })
      );
    });

    it("calls showConfirm with activate label for inactive banner", async () => {
      const user = userEvent.setup();
      await renderPage();

      // Second banner is inactive, so its toggle button should say "Activate"
      const activateButton = screen.getByLabelText("Activate");
      await user.click(activateButton);

      expect(mockShowConfirm).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Aktifkan Banner?",
          confirmLabel: "Aktifkan",
        })
      );
    });
  });
});
