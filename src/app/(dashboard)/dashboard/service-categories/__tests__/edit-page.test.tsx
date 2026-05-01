import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
const mockParamsId = "42";
const mockReturnPage = "3";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: mockParamsId }),
  useSearchParams: () => new URLSearchParams(`returnPage=${mockReturnPage}`),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock serviceCategoriesService
const mockDetail = vi.fn();
const mockUpdate = vi.fn();
vi.mock("@services/backoffice/service-categories", () => ({
  serviceCategoriesService: {
    detail: (...args: unknown[]) => mockDetail(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
  },
}));

// Mock useNotificationStore
const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (
    selector: (state: Record<string, unknown>) => unknown
  ) => selector({ showNotification: mockShowNotification }),
}));

// Mock handleFormError from @lib/utils
const mockHandleFormError = vi.fn();
vi.mock("@lib/utils", async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    handleFormError: (...args: unknown[]) => mockHandleFormError(...args),
  };
});

// Mock useDetailData hook
const mockUseDetailData = vi.fn();
vi.mock("@lib/hooks/use-detail-data", () => ({
  useDetailData: (...args: unknown[]) => mockUseDetailData(...args),
}));

// ─── Fixtures ───────────────────────────────────────────────────────────────────

const MOCK_CATEGORY = {
  id: 42,
  name: "Plumbing",
  slug: "plumbing",
  description: "Plumbing services",
  icon: "https://example.com/icons/plumbing.svg",
  types: ["general", "daily"] as string[],
  is_active: true,
  created_at: "2024-01-15T10:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: ServiceCategoryEditPage } =
    await import("../[id]/edit/page");
  return render(<ServiceCategoryEditPage />);
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("ServiceCategoryEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Loading state (Req 4.1) ───────────────────────────────────────────────

  describe("loading state", () => {
    it("renders loading state when data is being fetched", async () => {
      mockUseDetailData.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
        refetch: vi.fn(),
      });

      await renderPage();

      // FormCardLoading renders a loading skeleton — check it doesn't show the form
      expect(
        screen.queryByRole("heading", { name: /edit service category/i })
      ).not.toBeInTheDocument();
    });
  });

  // ── Error state (Req 4.1) ─────────────────────────────────────────────────

  describe("error state", () => {
    it("renders error state when fetch fails", async () => {
      mockUseDetailData.mockReturnValue({
        data: null,
        isLoading: false,
        error: "Network error",
        refetch: vi.fn(),
      });

      await renderPage();

      expect(
        screen.getByText("Failed to load service category")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /back to service categories/i })
      ).toBeInTheDocument();
    });

    it("renders error state when category data is null", async () => {
      mockUseDetailData.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      await renderPage();

      expect(
        screen.getByText("Failed to load service category")
      ).toBeInTheDocument();
    });
  });

  // ── Pre-populated form (Req 4.1, 4.2) ────────────────────────────────────

  describe("pre-populated form", () => {
    beforeEach(() => {
      mockUseDetailData.mockReturnValue({
        data: MOCK_CATEGORY,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
    });

    it("renders the edit page title and description", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: /edit service category/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/update the service category details/i)
      ).toBeInTheDocument();
    });

    it("pre-populates name field with existing data", async () => {
      await renderPage();

      const nameInput = screen.getByLabelText("Name");
      expect(nameInput).toHaveValue("Plumbing");
    });

    it("pre-populates description field with existing data", async () => {
      await renderPage();

      const descInput = screen.getByLabelText("Description");
      expect(descInput).toHaveValue("Plumbing services");
    });

    it("pre-populates type checkboxes with existing data", async () => {
      await renderPage();

      expect(screen.getByLabelText("General")).toBeChecked();
      expect(screen.getByLabelText("Daily")).toBeChecked();
      expect(screen.getByLabelText("Monthly")).not.toBeChecked();
      expect(screen.getByLabelText("Popular")).not.toBeChecked();
    });

    it("pre-populates is_active checkbox with existing data", async () => {
      await renderPage();

      expect(screen.getByLabelText("Active")).toBeChecked();
    });
  });

  // ── Existing icon preview (Req 4.4) ───────────────────────────────────────

  describe("existing icon preview", () => {
    it("shows current icon preview when category has an icon", async () => {
      mockUseDetailData.mockReturnValue({
        data: MOCK_CATEGORY,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      await renderPage();

      expect(screen.getByText("Current Icon")).toBeInTheDocument();
      const iconImg = screen.getByAltText("Current category icon");
      expect(iconImg).toBeInTheDocument();
      expect(iconImg).toHaveAttribute(
        "src",
        "https://example.com/icons/plumbing.svg"
      );
    });

    it("does not show current icon preview when category has no icon", async () => {
      mockUseDetailData.mockReturnValue({
        data: { ...MOCK_CATEGORY, icon: null },
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });

      await renderPage();

      expect(screen.queryByText("Current Icon")).not.toBeInTheDocument();
    });
  });

  // ── Successful update with returnPage (Req 4.6) ──────────────────────────

  describe("successful update", () => {
    it("submits form and navigates back with returnPage on success", async () => {
      const user = userEvent.setup();
      mockUseDetailData.mockReturnValue({
        data: MOCK_CATEGORY,
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      mockUpdate.mockResolvedValue({
        message: "Service category berhasil diperbarui",
        data: { ...MOCK_CATEGORY, name: "Plumbing Updated" },
      });

      await renderPage();

      // Modify the name
      const nameInput = screen.getByLabelText("Name");
      await user.clear(nameInput);
      await user.type(nameInput, "Plumbing Updated");

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /save changes/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(42, expect.any(FormData));
      });

      // Verify FormData contents
      const formData = mockUpdate.mock.calls[0][1] as FormData;
      expect(formData.get("_method")).toBe("PUT");
      expect(formData.get("name")).toBe("Plumbing Updated");
      expect(formData.get("is_active")).toBe("1");

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          "Service category berhasil diperbarui",
          "success"
        );
        // Should navigate back with returnPage=3
        expect(mockPush).toHaveBeenCalledWith(
          "/dashboard/service-categories?page=3"
        );
      });
    });
  });
});
