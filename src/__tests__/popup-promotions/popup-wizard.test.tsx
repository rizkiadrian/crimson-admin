import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/popup-promotions/create",
  useSearchParams: () => new URLSearchParams(),
}));

const mockCreate = vi.fn();
vi.mock("@services/marketing/popup-promotions", () => ({
  popupPromotionsService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

// Mock PopupEditor components
vi.mock("@app/components/ui/PopupEditor", () => ({
  PopupTemplateSelector: () => (
    <div data-testid="template-selector">Template Selector</div>
  ),
  PopupHtmlEditor: () => <div data-testid="html-editor">HTML Editor</div>,
}));

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/popup-promotions/create/page");
  return render(<Page />);
}

describe("PopupPromotionCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("step navigation", () => {
    it("renders step 1 by default", async () => {
      await renderPage();
      expect(screen.getByText("Step 1: Basic Info")).toBeInTheDocument();
      expect(screen.getByLabelText("Popup Name")).toBeInTheDocument();
    });

    it("navigates to step 2 on Next click", async () => {
      const user = userEvent.setup();
      await renderPage();
      await user.click(screen.getByText("Next"));
      expect(screen.getByText("Step 2: Content")).toBeInTheDocument();
    });

    it("navigates back on Back click", async () => {
      const user = userEvent.setup();
      await renderPage();
      await user.click(screen.getByText("Next"));
      await user.click(screen.getByText("Back"));
      expect(screen.getByText("Step 1: Basic Info")).toBeInTheDocument();
    });

    it("shows Create Popup button on final step", async () => {
      const user = userEvent.setup();
      await renderPage();
      // Navigate to step 5
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText("Next"));
      }
      expect(screen.getByText("Create Popup")).toBeInTheDocument();
    });
  });

  describe("step 1: basic info", () => {
    it("renders name, content type, and priority fields", async () => {
      await renderPage();
      expect(screen.getByLabelText("Popup Name")).toBeInTheDocument();
      expect(screen.getByText("Content Type")).toBeInTheDocument();
      expect(screen.getByLabelText("Priority")).toBeInTheDocument();
    });
  });

  describe("step 3: targeting", () => {
    it("renders user type buttons", async () => {
      const user = userEvent.setup();
      await renderPage();
      await user.click(screen.getByText("Next"));
      await user.click(screen.getByText("Next"));
      expect(screen.getByText("Client")).toBeInTheDocument();
      expect(screen.getByText("Mitra")).toBeInTheDocument();
    });

    it("renders journey stage buttons", async () => {
      const user = userEvent.setup();
      await renderPage();
      await user.click(screen.getByText("Next"));
      await user.click(screen.getByText("Next"));
      expect(screen.getByText("Registered")).toBeInTheDocument();
      expect(screen.getByText("Verified")).toBeInTheDocument();
      expect(screen.getByText("Funded")).toBeInTheDocument();
    });

    it("renders platform buttons", async () => {
      const user = userEvent.setup();
      await renderPage();
      await user.click(screen.getByText("Next"));
      await user.click(screen.getByText("Next"));
      expect(screen.getByText("Android")).toBeInTheDocument();
      expect(screen.getByText("iOS")).toBeInTheDocument();
    });
  });

  describe("step 4: scheduling", () => {
    it("renders date fields", async () => {
      const user = userEvent.setup();
      await renderPage();
      for (let i = 0; i < 3; i++) await user.click(screen.getByText("Next"));
      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Date (optional)")).toBeInTheDocument();
    });
  });

  describe("step 5: review and submit", () => {
    it("shows review summary", async () => {
      const user = userEvent.setup();
      await renderPage();
      for (let i = 0; i < 4; i++) await user.click(screen.getByText("Next"));
      expect(screen.getByText(/Name:/)).toBeInTheDocument();
      expect(screen.getByText(/Type:/)).toBeInTheDocument();
      expect(screen.getByText(/Priority:/)).toBeInTheDocument();
    });

    it("calls create API on submit", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({ message: "Created" });
      await renderPage();
      for (let i = 0; i < 4; i++) await user.click(screen.getByText("Next"));
      await user.click(screen.getByText("Create Popup"));
      expect(mockCreate).toHaveBeenCalled();
    });
  });
});
