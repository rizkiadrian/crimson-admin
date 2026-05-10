import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/event-registry",
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetAll = vi.fn();
const mockDelete = vi.fn();
vi.mock("@services/marketing/event-registry", () => ({
  eventRegistryService: {
    list: (...args: unknown[]) => mockGetAll(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
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

const MOCK_EVENTS = [
  {
    id: 1,
    key: "user_registered",
    label: "User Registered",
    category: "lifecycle",
    is_system: true,
    is_active: true,
    created_at: "2026-01-01",
  },
  {
    id: 2,
    key: "page_viewed",
    label: "Page Viewed",
    category: "engagement",
    is_system: false,
    is_active: true,
    created_at: "2026-01-02",
  },
  {
    id: 3,
    key: "banner_clicked",
    label: "Banner Clicked",
    category: "marketing",
    is_system: false,
    is_active: false,
    created_at: "2026-01-03",
  },
];

const MOCK_PAGINATION = {
  total: 3,
  per_page: 20,
  current_page: 1,
  last_page: 1,
  next_page_url: null,
  prev_page_url: null,
};

function setupMockList() {
  mockGetAll.mockResolvedValue({
    data: MOCK_EVENTS,
    meta: { pagination: MOCK_PAGINATION },
  });
}

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/event-registry/page");
  const result = render(<Page />);
  await screen.findByText("user_registered");
  return result;
}

describe("EventRegistryPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  it("renders page title and create button", async () => {
    await renderPage();
    expect(screen.getByText("Event Registry")).toBeInTheDocument();
    expect(screen.getByText("Create Event")).toBeInTheDocument();
  });

  it("renders event keys", async () => {
    await renderPage();
    expect(screen.getByText("user_registered")).toBeInTheDocument();
    expect(screen.getByText("page_viewed")).toBeInTheDocument();
    expect(screen.getByText("banner_clicked")).toBeInTheDocument();
  });

  it("renders System badge for system events", async () => {
    await renderPage();
    expect(screen.getByText("System")).toBeInTheDocument();
  });

  it("renders Custom badge for custom events", async () => {
    await renderPage();
    const customBadges = screen.getAllByText("Custom");
    expect(customBadges.length).toBe(2);
  });

  it("renders category badges", async () => {
    await renderPage();
    expect(screen.getByText("Lifecycle")).toBeInTheDocument();
    expect(screen.getByText("Engagement")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
  });

  it("does not render edit/delete for system events", async () => {
    await renderPage();
    // System event has no actions, custom events have delete buttons
    const deleteButtons = screen.getAllByLabelText("Delete");
    // Only 2 custom events have delete
    expect(deleteButtons.length).toBe(2);
  });
});
