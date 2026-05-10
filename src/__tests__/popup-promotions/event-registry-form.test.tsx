import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/event-registry/create",
  useSearchParams: () => new URLSearchParams(),
}));

const mockCreate = vi.fn();
vi.mock("@services/marketing/event-registry", () => ({
  eventRegistryService: {
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ showNotification: mockShowNotification }),
}));

async function renderPage() {
  const { default: Page } =
    await import("@app/(dashboard)/dashboard/event-registry/create/page");
  return render(<Page />);
}

describe("EventRegistryCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", async () => {
    await renderPage();
    expect(screen.getByLabelText("Event Key")).toBeInTheDocument();
    expect(screen.getByLabelText("Label")).toBeInTheDocument();
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
  });

  it("renders submit and cancel buttons", async () => {
    await renderPage();
    expect(
      screen.getByRole("button", { name: /Create Event/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("calls create API on submit", async () => {
    const user = userEvent.setup();
    mockCreate.mockResolvedValue({ message: "Created" });
    await renderPage();

    await user.type(screen.getByLabelText("Event Key"), "test_event");
    await user.type(screen.getByLabelText("Label"), "Test Event");
    await user.click(screen.getByRole("button", { name: /Create Event/i }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "test_event",
        label: "Test Event",
        category: "engagement",
      })
    );
  });

  it("displays validation errors from API", async () => {
    const user = userEvent.setup();
    mockCreate.mockRejectedValue({
      message: "Validation failed",
      errors: { key: ["The key field is required."] },
    });
    await renderPage();
    await user.click(screen.getByRole("button", { name: /Create Event/i }));
    await screen.findByText("The key field is required.");
  });
});
