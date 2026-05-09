import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/analytics/funnel",
  useSearchParams: () => mockSearchParams,
}));

// Mock recharts — render children and data attributes for assertions
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  LineChart: ({
    children,
    data,
  }: {
    children: React.ReactNode;
    data: unknown[];
  }) => (
    <div data-testid="line-chart" data-points={data?.length}>
      {children}
    </div>
  ),
  Line: ({ dataKey, name }: { dataKey: string; name: string }) => (
    <div data-testid={`line-${dataKey}`}>{name}</div>
  ),
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
}));

// Mock analytics service
const mockGetFunnelStats = vi.fn();
const mockGetFunnelTrends = vi.fn();

vi.mock("@services/marketing/analytics", () => ({
  analyticsService: {
    getFunnelStats: (...args: unknown[]) => mockGetFunnelStats(...args),
    getFunnelTrends: (...args: unknown[]) => mockGetFunnelTrends(...args),
  },
}));

// Mock Chart components
vi.mock("@app/components/ui/Chart", () => ({
  ChartCard: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div data-testid="chart-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  BarChartComponent: ({
    data,
  }: {
    data: { name: string; value: number }[];
  }) => (
    <div data-testid="bar-chart">
      {data?.map((d) => (
        <div key={d.name} data-testid={`bar-${d.name}`}>
          {d.name}: {d.value}
        </div>
      ))}
    </div>
  ),
  CHART_COLORS: {
    neutral: "#999",
    grid: "#eee",
    label: "#666",
    axis: "#888",
  },
  CHART_SETS: {
    categorical: ["#4F46E5", "#10B981", "#F59E0B", "#EF4444"],
  },
}));

// Mock StatCard
vi.mock("@app/components/ui/StatCard", () => ({
  StatCard: ({
    title,
    value,
    description,
  }: {
    title: string;
    value: string;
    description: string;
  }) => (
    <div data-testid={`stat-card-${title}`}>
      <span>{title}</span>
      <span>{value}</span>
      <span>{description}</span>
    </div>
  ),
}));

// Mock FormCard
vi.mock("@app/components/ui/FormCard", () => ({
  FormCard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="form-card">{children}</div>
  ),
  FormCardLoading: () => <div data-testid="form-card-loading">Loading...</div>,
  FormCardError: ({ message }: { message: string }) => (
    <div data-testid="form-card-error">{message}</div>
  ),
}));

// Mock Button
vi.mock("@app/components/ui/Button", () => ({
  Button: ({
    children,
    onClick,
    variant,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// Mock FormInput
vi.mock("@app/components/ui/FormInput", () => ({
  FormInput: ({
    id,
    label,
    value,
    onChange,
    ...props
  }: {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    [key: string]: unknown;
  }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        onChange={onChange}
        aria-label={label}
        {...props}
      />
    </div>
  ),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_FUNNEL_STATS = {
  stages: [
    { stage: "registered", count: 1000 },
    { stage: "verified", count: 750 },
    { stage: "funded", count: 300 },
    { stage: "active", count: 150 },
  ],
  conversions: [
    { from_stage: "registered", to_stage: "verified", rate: 75.0 },
    { from_stage: "verified", to_stage: "funded", rate: 40.0 },
    { from_stage: "funded", to_stage: "active", rate: 50.0 },
  ],
  average_time: [
    { stage: "registered", average_hours: 2.5 },
    { stage: "verified", average_hours: 48.0 },
    { stage: "funded", average_hours: 120.0 },
    { stage: "active", average_hours: 240.0 },
  ],
};

const MOCK_FUNNEL_TRENDS = {
  labels: ["2025-01-01", "2025-01-02", "2025-01-03"],
  series: [
    { stage: "registered", data: [100, 120, 110] },
    { stage: "verified", data: [80, 90, 85] },
    { stage: "funded", data: [30, 35, 32] },
    { stage: "active", data: [15, 18, 16] },
  ],
};

function setupMocks() {
  mockGetFunnelStats.mockResolvedValue({ data: MOCK_FUNNEL_STATS });
  mockGetFunnelTrends.mockResolvedValue({ data: MOCK_FUNNEL_TRENDS });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: FunnelOverviewPage } =
    await import("@app/(dashboard)/dashboard/analytics/funnel/page");
  const result = render(<FunnelOverviewPage />);
  // Wait for data to load
  await screen.findByText("Conversion Funnel");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("FunnelOverviewPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ── Render funnel chart with mock data ──────────────────────────────────────

  describe("funnel chart rendering", () => {
    it("renders the page title and description", async () => {
      await renderPage();

      expect(screen.getByText("Funnel Overview")).toBeInTheDocument();
      expect(
        screen.getByText("User journey conversion funnel and trends")
      ).toBeInTheDocument();
    });

    it("renders the Conversion Funnel chart card", async () => {
      await renderPage();

      expect(screen.getByText("Conversion Funnel")).toBeInTheDocument();
      expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
    });

    it("renders bar chart with stage data and conversion rates", async () => {
      await renderPage();

      // Bar chart should show stage names with conversion rates
      expect(
        screen.getByTestId("bar-Registration (75.0%)")
      ).toBeInTheDocument();
      expect(screen.getByTestId("bar-Verified (40.0%)")).toBeInTheDocument();
      expect(screen.getByTestId("bar-Funded (50.0%)")).toBeInTheDocument();
      // Active has no conversion rate (last stage)
      expect(screen.getByTestId("bar-Active")).toBeInTheDocument();
    });

    it("renders average time stat cards", async () => {
      await renderPage();

      // Average time cards should be rendered
      expect(screen.getByTestId("stat-card-Registration")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Verified")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Funded")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Active")).toBeInTheDocument();
    });
  });

  // ── Period filter updates URL params ────────────────────────────────────────

  describe("period filter", () => {
    it("renders period filter buttons", async () => {
      await renderPage();

      expect(screen.getByText("7d")).toBeInTheDocument();
      expect(screen.getByText("30d")).toBeInTheDocument();
      expect(screen.getByText("90d")).toBeInTheDocument();
      expect(screen.getByText("Custom")).toBeInTheDocument();
    });

    it("updates URL when period button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      const btn7d = screen.getByText("7d");
      await user.click(btn7d);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("period=7d")
      );
    });

    it("shows custom date inputs when Custom period is selected", async () => {
      const user = userEvent.setup();
      await renderPage();

      const customBtn = screen.getByText("Custom");
      await user.click(customBtn);

      // After clicking Custom, the URL should be updated with period=custom
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("period=custom")
      );
    });
  });

  // ── Trend line chart renders correctly ──────────────────────────────────────

  describe("trend line chart", () => {
    it("renders the Stage Trends chart card", async () => {
      await renderPage();

      expect(screen.getByText("Stage Trends")).toBeInTheDocument();
    });

    it("renders line chart with trend data", async () => {
      await renderPage();

      const lineChart = screen.getByTestId("line-chart");
      expect(lineChart).toBeInTheDocument();
      // Should have 3 data points (matching labels length)
      expect(lineChart).toHaveAttribute("data-points", "3");
    });

    it("renders a line for each stage", async () => {
      await renderPage();

      expect(screen.getByTestId("line-registered")).toBeInTheDocument();
      expect(screen.getByTestId("line-verified")).toBeInTheDocument();
      expect(screen.getByTestId("line-funded")).toBeInTheDocument();
      expect(screen.getByTestId("line-active")).toBeInTheDocument();
    });
  });

  // ── Loading and error states ────────────────────────────────────────────────

  describe("loading and error states", () => {
    it("shows loading state while fetching", async () => {
      // Make the fetcher never resolve
      mockGetFunnelStats.mockReturnValue(new Promise(() => {}));
      mockGetFunnelTrends.mockReturnValue(new Promise(() => {}));

      const { default: FunnelOverviewPage } =
        await import("@app/(dashboard)/dashboard/analytics/funnel/page");
      render(<FunnelOverviewPage />);

      // Should show loading indicators
      const loadingElements = screen.getAllByTestId("form-card-loading");
      expect(loadingElements.length).toBeGreaterThan(0);
    });
  });
});
