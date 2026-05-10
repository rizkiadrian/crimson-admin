import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/popup-promotions",
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetAll = vi.fn();
const mockDelete = vi.fn();
const mockChangeStatus = vi.fn();
const mockDuplicate = vi.fn();

vi.mock("@services/marketing/popup-promotions", () => ({
  popupPromotionsService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    changeStatus: (...args: unknown[]) => mockChangeStatus(...args),
    duplicate: (...args: unknown[]) => mockDuplicate(...args),
  },
}));

const mockShowConfirm = vi.fn();
vi.mock("@store/useConfirmStore", () => ({
  useConfirmStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showConfirm: mockShowConfirm }),
}));

const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

const MOCK_POPUPS = [
  {
    id: "uuid-1",
    name: "Welcome Offer",
    content_type: "template" as const,
    status: "active" as const,
    priority: 10,
    created_at: "2026-05-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
  },
  {
    id: "uuid-2",
    name: "Flash Sale",
    content_type: "canvas" as const,
    status: "draft" as const,
    priority: 5,
    created_at: "2026-05-02T00:00:00Z",
    updated_at: "2026-05-02T00:00:00Z",
  },
  {
    id: "uuid-3",
    name: "Paused Promo",
    content_type: "html" as const,
    status: "paused" as const,
    priority: 3,
    created_at: "2026-05-03T00:00:00Z",
    updated_at: "2026-05-03T00:00:00Z",
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

function setupMockList() {
  mockGetAll.mockResolvedValue({
    data: MOCK_POPUPS,
    meta: { pagination: MOCK_PAGINATION },
  });
}

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/popup-promotions/page");
  const result = render(<Page />);
  await screen.findByText("Welcome Offer");
  return result;
}

describe("PopupPromotionsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  describe("table rendering", () => {
    it("renders the page title", async () => {
      await renderPage();
      expect(screen.getByText("Popup Promotions")).toBeInTheDocument();
    });

    it("renders popup names", async () => {
      await renderPage();
      expect(screen.getByText("Welcome Offer")).toBeInTheDocument();
      expect(screen.getByText("Flash Sale")).toBeInTheDocument();
      expect(screen.getByText("Paused Promo")).toBeInTheDocument();
    });

    it("renders Create Popup button", async () => {
      await renderPage();
      expect(screen.getByText("Create Popup")).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Priority")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  describe("badge rendering", () => {
    it("renders status badges", async () => {
      await renderPage();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Draft")).toBeInTheDocument();
      expect(screen.getByText("Paused")).toBeInTheDocument();
    });

    it("renders content type badges", async () => {
      await renderPage();
      expect(screen.getByText("Template")).toBeInTheDocument();
      expect(screen.getByText("Canvas")).toBeInTheDocument();
      expect(screen.getByText("HTML")).toBeInTheDocument();
    });
  });

  describe("actions", () => {
    it("renders pause button for active popups", async () => {
      await renderPage();
      expect(screen.getByLabelText("Pause")).toBeInTheDocument();
    });

    it("renders resume button for paused popups", async () => {
      await renderPage();
      expect(screen.getByLabelText("Resume")).toBeInTheDocument();
    });

    it("renders duplicate buttons", async () => {
      await renderPage();
      const duplicateButtons = screen.getAllByLabelText("Duplicate");
      expect(duplicateButtons.length).toBe(3);
    });

    it("renders delete buttons", async () => {
      await renderPage();
      const deleteButtons = screen.getAllByLabelText("Delete");
      expect(deleteButtons.length).toBe(3);
    });
  });
});
