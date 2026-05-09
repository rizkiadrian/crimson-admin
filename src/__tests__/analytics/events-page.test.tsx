import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/analytics/events",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock analytics service
const mockGetEventLog = vi.fn();

vi.mock("@services/marketing/analytics", () => ({
  analyticsService: {
    getEventLog: (...args: unknown[]) => mockGetEventLog(...args),
  },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_EVENTS = [
  {
    id: 1,
    user: { id: 10, name: "John Doe", email: "john@example.com" },
    event_type: "user_registered",
    metadata: { source: "client" },
    created_at: "2025-06-15T10:30:00.000Z",
  },
  {
    id: 2,
    user: { id: 11, name: "Jane Smith", email: "jane@example.com" },
    event_type: "email_verified",
    metadata: null,
    created_at: "2025-06-15T11:00:00.000Z",
  },
  {
    id: 3,
    user: { id: 12, name: "Bob Wilson", email: "bob@example.com" },
    event_type: "first_deposit",
    metadata: { amount: 500000 },
    created_at: "2025-06-15T12:00:00.000Z",
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

function setupMockList(events = MOCK_EVENTS, pagination = MOCK_PAGINATION) {
  mockGetEventLog.mockResolvedValue({
    data: events,
    meta: { pagination },
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: EventLogPage } =
    await import("@app/(dashboard)/dashboard/analytics/events/page");
  const result = render(<EventLogPage />);
  // Wait for data to load
  await screen.findByText("John Doe");
  return result;
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("EventLogPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockList();
  });

  // ── Render table with mock data ─────────────────────────────────────────────

  describe("table rendering", () => {
    it("renders the page title", async () => {
      await renderPage();

      expect(screen.getByText("Event Log")).toBeInTheDocument();
    });

    it("renders column headers", async () => {
      await renderPage();

      expect(screen.getByText("User")).toBeInTheDocument();
      expect(screen.getByText("Event Type")).toBeInTheDocument();
      expect(screen.getByText("Timestamp")).toBeInTheDocument();
      expect(screen.getByText("Metadata")).toBeInTheDocument();
    });

    it("renders user names in the table", async () => {
      await renderPage();

      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Bob Wilson")).toBeInTheDocument();
    });

    it("renders user emails in the table", async () => {
      await renderPage();

      expect(screen.getByText("john@example.com")).toBeInTheDocument();
      expect(screen.getByText("jane@example.com")).toBeInTheDocument();
      expect(screen.getByText("bob@example.com")).toBeInTheDocument();
    });

    it("renders event type badges", async () => {
      await renderPage();

      expect(screen.getByText("Registered")).toBeInTheDocument();
      expect(screen.getByText("Email Verified")).toBeInTheDocument();
      expect(screen.getByText("First Deposit")).toBeInTheDocument();
    });

    it("renders metadata as truncated JSON", async () => {
      await renderPage();

      // First event has metadata { source: "client" }
      expect(screen.getByText('{"source":"client"}')).toBeInTheDocument();
      // Second event has null metadata — shows dash
      const dashes = screen.getAllByText("—");
      expect(dashes.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ── Search functionality ────────────────────────────────────────────────────

  describe("search functionality", () => {
    it("renders search input with placeholder", async () => {
      await renderPage();

      const searchInput = screen.getByPlaceholderText(
        "Search by user name or email..."
      );
      expect(searchInput).toBeInTheDocument();
    });

    it("calls service with search param after typing and pressing Enter", async () => {
      const user = userEvent.setup();
      await renderPage();

      // Clear the initial call count
      mockGetEventLog.mockClear();

      const searchInput = screen.getByPlaceholderText(
        "Search by user name or email..."
      );
      await user.type(searchInput, "John{Enter}");

      expect(mockGetEventLog).toHaveBeenCalledWith(
        expect.objectContaining({ search: "John" })
      );
    });
  });

  // ── Filter by event type and date range ─────────────────────────────────────

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

      expect(screen.getByText("Filter Events")).toBeInTheDocument();
    });

    it("shows event type filter section", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      // "Event Type" appears in both the table header and the filter popup
      const eventTypeElements = screen.getAllByText("Event Type");
      expect(eventTypeElements.length).toBeGreaterThanOrEqual(2);
    });

    it("shows date range filter section", async () => {
      const user = userEvent.setup();
      await renderPage();

      const filterButton = screen.getByLabelText("Filter");
      await user.click(filterButton);

      expect(screen.getByText("Date Range")).toBeInTheDocument();
    });
  });
});
