import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "uuid-1" }),
  usePathname: () => "/dashboard/popup-promotions/uuid-1",
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetById = vi.fn();
const mockGetAnalytics = vi.fn();
const mockDuplicate = vi.fn();
const mockCreateABVariant = vi.fn();

vi.mock("@services/marketing/popup-promotions", () => ({
  popupPromotionsService: {
    getById: (...args: unknown[]) => mockGetById(...args),
    getAnalytics: (...args: unknown[]) => mockGetAnalytics(...args),
    duplicate: (...args: unknown[]) => mockDuplicate(...args),
    createABVariant: (...args: unknown[]) => mockCreateABVariant(...args),
  },
}));

const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

const MOCK_POPUP = {
  id: "uuid-1",
  name: "Welcome Offer",
  content_type: "template",
  status: "active",
  priority: 10,
  ab_variant: null,
  ab_group_id: null,
  target_config: { user_types: ["client"] },
  schedule_config: { start_date: "2026-05-01" },
  frequency_cap: { max_per_day: 1 },
  created_at: "2026-05-01T00:00:00Z",
  updated_at: "2026-05-01T00:00:00Z",
};

const MOCK_ANALYTICS = {
  impressions: 1500,
  clicks: 120,
  dismissals: 300,
  conversions: 45,
  ctr: 8.0,
  dismiss_rate: 20.0,
  cvr: 3.0,
};

function setupMocks() {
  mockGetById.mockResolvedValue({ data: MOCK_POPUP });
  mockGetAnalytics.mockResolvedValue({ data: MOCK_ANALYTICS });
}

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/popup-promotions/[id]/page");
  const result = render(<Page />);
  await screen.findByText("Welcome Offer");
  return result;
}

describe("PopupPromotionDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it("renders popup name", async () => {
    await renderPage();
    expect(screen.getByText("Welcome Offer")).toBeInTheDocument();
  });

  it("renders analytics stat cards", async () => {
    await renderPage();
    expect(screen.getByText("Impressions")).toBeInTheDocument();
    expect(screen.getByText("1500")).toBeInTheDocument();
    expect(screen.getByText("Clicks")).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("Conversions")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("renders action buttons", async () => {
    await renderPage();
    expect(screen.getByText("Duplicate")).toBeInTheDocument();
    expect(screen.getByText("A/B Test")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });
});
