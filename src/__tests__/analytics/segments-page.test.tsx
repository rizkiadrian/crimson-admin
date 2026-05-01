import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
let mockSearchParamsMap = new Map<string, string>();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/analytics/segments",
  useSearchParams: () => {
    const params = new URLSearchParams();
    mockSearchParamsMap.forEach((v, k) => params.set(k, v));
    return params;
  },
}));

// Mock analytics service
const mockGetSegmentSummary = vi.fn();
const mockGetSegmentUsers = vi.fn();
const mockExportSegmentCsv = vi.fn();

vi.mock("@services/backoffice/analytics", () => ({
  analyticsService: {
    getSegmentSummary: (...args: unknown[]) => mockGetSegmentSummary(...args),
    getSegmentUsers: (...args: unknown[]) => mockGetSegmentUsers(...args),
    exportSegmentCsv: (...args: unknown[]) => mockExportSegmentCsv(...args),
  },
}));

// Mock useNotificationStore
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (
    selector: (state: Record<string, unknown>) => unknown
  ) => selector({ showNotification: mockShowNotification }),
}));

// Mock StatCard
vi.mock("@app/components/ui/StatCard", () => ({
  StatCard: ({
    title,
    value,
    description,
    className,
  }: {
    title: string;
    value: string;
    description: string;
    className?: string;
  }) => (
    <div data-testid={`stat-card-${title}`} className={className}>
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

// Mock FilterPopup
vi.mock("@app/components/ui/FilterPopup", () => ({
  FilterPopup: ({
    children,
    open,
    title,
    onApply,
    onReset,
  }: {
    children: React.ReactNode;
    open: boolean;
    title: string;
    onApply: () => void;
    onReset: () => void;
  }) =>
    open ? (
      <div data-testid="filter-popup">
        <h3>{title}</h3>
        {children}
        <button onClick={onApply}>Apply</button>
        <button onClick={onReset}>Reset</button>
      </div>
    ) : null,
  FilterSection: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <div data-testid={`filter-section-${label}`}>
      <span>{label}</span>
      {children}
    </div>
  ),
  FilterDateRange: ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
  }: {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
  }) => (
    <div data-testid="filter-date-range">
      <input
        aria-label="Start date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
      />
      <input
        aria-label="End date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
      />
    </div>
  ),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_SUMMARY = {
  stages: [
    { stage: "registered", count: 500 },
    { stage: "verified", count: 350 },
    { stage: "funded", count: 200 },
    { stage: "active", count: 100 },
    { stage: "dormant", count: 40 },
    { stage: "churned", count: 10 },
  ],
  total: 1200,
};

const MOCK_USERS = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "+6281234567890",
    journey_stage: "verified",
    created_at: "2025-01-15T10:00:00.000Z",
    last_event_at: "2025-06-01T08:00:00.000Z",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: null,
    journey_stage: "verified",
    created_at: "2025-02-20T14:30:00.000Z",
    last_event_at: null,
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

function setupMocks() {
  mockGetSegmentSummary.mockResolvedValue({ data: MOCK_SUMMARY });
  mockGetSegmentUsers.mockResolvedValue({
    data: MOCK_USERS,
    meta: { pagination: MOCK_PAGINATION },
  });
  mockExportSegmentCsv.mockResolvedValue(
    new Blob(["csv data"], { type: "text/csv" })
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: UserSegmentsPage } =
    await import("@app/(dashboard)/dashboard/analytics/segments/page");
  const result = render(<UserSegmentsPage />);
  // Wait for summary to load
  await screen.findByText("User Segments");
  return result;
}

async function renderPageWithStage(stage: string) {
  mockSearchParamsMap.set("stage", stage);
  const { default: UserSegmentsPage } =
    await import("@app/(dashboard)/dashboard/analytics/segments/page");
  const result = render(<UserSegmentsPage />);
  // Wait for data to load
  await screen.findByText("John Doe");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("UserSegmentsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsMap = new Map();
    setupMocks();
  });

  // ── Render summary cards with mock data ─────────────────────────────────────

  describe("summary cards rendering", () => {
    it("renders the page title and description", async () => {
      await renderPage();

      expect(screen.getByText("User Segments")).toBeInTheDocument();
      expect(
        screen.getByText("Users grouped by journey stage")
      ).toBeInTheDocument();
    });

    it("renders stat cards for each stage", async () => {
      await renderPage();

      // Wait for summary data to load
      await screen.findByTestId("stat-card-Registered");

      expect(screen.getByTestId("stat-card-Registered")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Verified")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Funded")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Active")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Dormant")).toBeInTheDocument();
      expect(screen.getByTestId("stat-card-Churned")).toBeInTheDocument();
    });

    it("displays correct counts in stat cards", async () => {
      await renderPage();

      await screen.findByTestId("stat-card-Registered");

      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("350")).toBeInTheDocument();
      expect(screen.getByText("200")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
    });
  });

  // ── Stage selection shows user table ────────────────────────────────────────

  describe("stage selection", () => {
    it("updates URL when a stage card is clicked", async () => {
      const user = userEvent.setup();
      await renderPage();

      await screen.findByTestId("stat-card-Verified");

      const verifiedButton = screen.getByLabelText("Select Verified stage");
      await user.click(verifiedButton);

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("stage=verified"),
        expect.anything()
      );
    });

    it("shows user table when stage is selected via URL", async () => {
      await renderPageWithStage("verified");

      // Table should show user data
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
    });

    it("renders table columns correctly", async () => {
      await renderPageWithStage("verified");

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
      expect(screen.getByText("Phone")).toBeInTheDocument();
      expect(screen.getByText("Registration Date")).toBeInTheDocument();
      expect(screen.getByText("Last Active")).toBeInTheDocument();
    });

    it("shows dash for null phone and last_event_at", async () => {
      await renderPageWithStage("verified");

      // Jane Smith has null phone and null last_event_at
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Filter controls update params ──────────────────────────────────────────

  describe("filter controls", () => {
    it("renders filter button when stage is selected", async () => {
      await renderPageWithStage("verified");

      const filterButton = screen.getByLabelText("Filter");
      expect(filterButton).toBeInTheDocument();
    });

    it("opens filter popup when filter button is clicked", async () => {
      const user = userEvent.setup();
      await renderPageWithStage("verified");

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      expect(screen.getByText("Filter Segment Users")).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-section-Registration Date")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("filter-section-Last Active Date")
      ).toBeInTheDocument();
    });
  });

  // ── CSV export triggers download ───────────────────────────────────────────

  describe("CSV export", () => {
    it("renders export CSV button when stage is selected", async () => {
      await renderPageWithStage("verified");

      const exportButton = screen.getByLabelText("Export CSV");
      expect(exportButton).toBeInTheDocument();
    });

    it("calls exportSegmentCsv when export button is clicked", async () => {
      const user = userEvent.setup();
      await renderPageWithStage("verified");

      // Mock URL.createObjectURL and revokeObjectURL
      const mockCreateObjectURL = vi.fn(() => "blob:mock-url");
      const mockRevokeObjectURL = vi.fn();
      global.URL.createObjectURL = mockCreateObjectURL;
      global.URL.revokeObjectURL = mockRevokeObjectURL;

      const exportButton = screen.getByLabelText("Export CSV");
      await user.click(exportButton);

      // Wait for async export to complete
      await vi.waitFor(() => {
        expect(mockExportSegmentCsv).toHaveBeenCalledWith(
          expect.objectContaining({ stage: "verified" })
        );
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it("shows error notification when export fails", async () => {
      const user = userEvent.setup();
      mockExportSegmentCsv.mockRejectedValue(new Error("Export failed"));

      await renderPageWithStage("verified");

      const exportButton = screen.getByLabelText("Export CSV");
      await user.click(exportButton);

      await vi.waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          "Failed to export CSV",
          "error"
        );
      });
    });
  });
});
