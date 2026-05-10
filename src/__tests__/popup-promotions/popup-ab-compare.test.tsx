import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useParams: () => ({ id: "uuid-1" }),
  usePathname: () => "/dashboard/popup-promotions/uuid-1/compare",
  useSearchParams: () => new URLSearchParams(),
}));

const mockGetCompare = vi.fn();
vi.mock("@services/marketing/popup-promotions", () => ({
  popupPromotionsService: {
    getCompare: (...args: unknown[]) => mockGetCompare(...args),
  },
}));

const MOCK_VARIANTS = [
  {
    popup_id: "uuid-1",
    variant: "A",
    name: "Welcome Offer A",
    impressions: 1000,
    clicks: 80,
    conversions: 30,
    ctr: 8.0,
    cvr: 3.0,
  },
  {
    popup_id: "uuid-2",
    variant: "B",
    name: "Welcome Offer B",
    impressions: 1000,
    clicks: 120,
    conversions: 50,
    ctr: 12.0,
    cvr: 5.0,
  },
];

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/popup-promotions/[id]/compare/page");
  const result = render(<Page />);
  await screen.findByText("A/B Test Comparison");
  return result;
}

describe("PopupABComparePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCompare.mockResolvedValue({ data: MOCK_VARIANTS });
  });

  it("renders comparison title", async () => {
    await renderPage();
    expect(screen.getByText("A/B Test Comparison")).toBeInTheDocument();
  });

  it("renders both variants", async () => {
    await renderPage();
    expect(screen.getByText("Variant A")).toBeInTheDocument();
    // Variant B appears in both the card and winner recommendation
    expect(screen.getAllByText(/Variant B/).length).toBeGreaterThanOrEqual(1);
  });

  it("shows winner recommendation", async () => {
    await renderPage();
    expect(screen.getByText(/Recommended winner/)).toBeInTheDocument();
  });

  it("renders empty state when no variants", async () => {
    mockGetCompare.mockResolvedValue({ data: [] });
    const { default: Page } =
      await import("@app/(dashboard)/dashboard/popup-promotions/[id]/compare/page");
    render(<Page />);
    await screen.findByText("This popup is not part of an A/B test.");
  });
});
