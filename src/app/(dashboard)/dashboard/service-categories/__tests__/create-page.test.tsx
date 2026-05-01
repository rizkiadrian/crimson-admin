import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/service-categories/create",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock serviceCategoriesService
const mockCreate = vi.fn();
vi.mock("@services/backoffice/service-categories", () => ({
  serviceCategoriesService: {
    create: (...args: unknown[]) => mockCreate(...args),
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

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function renderPage() {
  const { default: ServiceCategoryCreatePage } = await import("../create/page");
  return render(<ServiceCategoryCreatePage />);
}

function createSvgFile(name = "icon.svg", size = 1024): File {
  const content = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
  const file = new File([content], name, { type: "image/svg+xml" });
  // Override size for testing large files
  if (size !== content.length) {
    Object.defineProperty(file, "size", { value: size });
  }
  return file;
}

function createNonSvgFile(): File {
  return new File(["hello"], "image.png", { type: "image/png" });
}

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("ServiceCategoryCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Renders all form fields (Req 3.1) ─────────────────────────────────────

  describe("form rendering", () => {
    it("renders the page title and description", async () => {
      await renderPage();

      expect(
        screen.getByRole("heading", { name: /create service category/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText("Add a new service category to the system.")
      ).toBeInTheDocument();
    });

    it("renders name input field", async () => {
      await renderPage();

      const nameInput = screen.getByLabelText("Name");
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveAttribute("placeholder", "e.g. Plumbing");
    });

    it("renders description textarea field", async () => {
      await renderPage();

      const descInput = screen.getByLabelText("Description");
      expect(descInput).toBeInTheDocument();
    });

    it("renders icon upload button", async () => {
      await renderPage();

      expect(screen.getByText("Upload Icon")).toBeInTheDocument();
      expect(screen.getByText("SVG format only. Max 2MB.")).toBeInTheDocument();
    });

    it("renders type checkboxes for all category types", async () => {
      await renderPage();

      expect(screen.getByLabelText("General")).toBeInTheDocument();
      expect(screen.getByLabelText("Daily")).toBeInTheDocument();
      expect(screen.getByLabelText("Monthly")).toBeInTheDocument();
      expect(screen.getByLabelText("Popular")).toBeInTheDocument();
    });

    it("renders is_active checkbox defaulting to unchecked", async () => {
      await renderPage();

      const activeCheckbox = screen.getByLabelText("Active");
      expect(activeCheckbox).toBeInTheDocument();
      expect(activeCheckbox).not.toBeChecked();
    });

    it("renders Cancel and Create buttons", async () => {
      await renderPage();

      // Cancel renders as a link (Button with href)
      expect(screen.getByRole("link", { name: /cancel/i })).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /create service category/i })
      ).toBeInTheDocument();
    });
  });

  // ── Client-side validation (Req 3.4, 3.5, 7.1, 7.3) ─────────────────────

  describe("client-side validation", () => {
    it("shows error when name is empty on submit", async () => {
      await renderPage();

      // Submit the form directly
      const form = document.querySelector("form")!;
      fireEvent.submit(form);

      // Validation should prevent API call and show error
      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("shows error when icon file is not SVG format", async () => {
      await renderPage();

      const fileInput = screen.getByLabelText(
        "Upload category icon"
      ) as HTMLInputElement;
      const nonSvgFile = createNonSvgFile();

      fireEvent.change(fileInput, { target: { files: [nonSvgFile] } });

      await waitFor(() => {
        expect(
          screen.getByText("File harus berformat SVG.")
        ).toBeInTheDocument();
      });
    });

    it("shows error when icon file exceeds 2MB", async () => {
      await renderPage();

      const fileInput = screen.getByLabelText(
        "Upload category icon"
      ) as HTMLInputElement;
      const largeSvgFile = createSvgFile("large.svg", 3 * 1024 * 1024);

      fireEvent.change(fileInput, { target: { files: [largeSvgFile] } });

      await waitFor(() => {
        expect(
          screen.getByText("Ukuran file tidak boleh lebih dari 2MB.")
        ).toBeInTheDocument();
      });
    });
  });

  // ── Successful submission (Req 3.2, 3.3) ──────────────────────────────────

  describe("successful submission", () => {
    it("submits form and navigates to list page on success", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        message: "Service category berhasil dibuat",
        data: { id: 1, name: "Plumbing" },
      });

      await renderPage();

      // Fill in name
      const nameInput = screen.getByLabelText("Name");
      await user.type(nameInput, "Plumbing");

      // Submit
      const submitButton = screen.getByRole("button", {
        name: /create service category/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData));
      });

      // Verify FormData contents
      const formData = mockCreate.mock.calls[0][0] as FormData;
      expect(formData.get("name")).toBe("Plumbing");
      expect(formData.get("is_active")).toBe("0");

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          "Service category berhasil dibuat",
          "success"
        );
        expect(mockPush).toHaveBeenCalledWith("/dashboard/service-categories");
      });
    });

    it("sends selected types in FormData", async () => {
      const user = userEvent.setup();
      mockCreate.mockResolvedValue({
        message: "Created",
        data: { id: 1 },
      });

      await renderPage();

      // Fill name
      await user.type(screen.getByLabelText("Name"), "Cleaning");

      // Select types
      await user.click(screen.getByLabelText("General"));
      await user.click(screen.getByLabelText("Daily"));

      // Toggle active
      await user.click(screen.getByLabelText("Active"));

      // Submit
      await user.click(
        screen.getByRole("button", { name: /create service category/i })
      );

      await waitFor(() => {
        expect(mockCreate).toHaveBeenCalledWith(expect.any(FormData));
      });

      const formData = mockCreate.mock.calls[0][0] as FormData;
      expect(formData.get("name")).toBe("Cleaning");
      expect(formData.getAll("types[]")).toEqual(["general", "daily"]);
      expect(formData.get("is_active")).toBe("1");
    });
  });

  // ── 422 error handling (Req 3.4) ──────────────────────────────────────────

  describe("422 error handling", () => {
    it("calls handleFormError for 422 validation errors", async () => {
      const user = userEvent.setup();
      const apiError = {
        message: "The given data was invalid.",
        status: 422,
        errors: {
          name: ["The name has already been taken."],
        },
      };
      mockCreate.mockRejectedValue(apiError);

      await renderPage();

      // Fill name and submit
      await user.type(screen.getByLabelText("Name"), "Duplicate");
      await user.click(
        screen.getByRole("button", { name: /create service category/i })
      );

      await waitFor(() => {
        expect(mockHandleFormError).toHaveBeenCalledWith(
          apiError,
          expect.any(Function)
        );
      });

      // Should NOT show toast when there are field-level errors
      expect(mockShowNotification).not.toHaveBeenCalledWith(
        expect.anything(),
        "error"
      );
    });

    it("shows toast for non-422 errors without field errors", async () => {
      const user = userEvent.setup();
      const apiError = {
        message: "Internal Server Error",
        status: 500,
      };
      mockCreate.mockRejectedValue(apiError);

      await renderPage();

      await user.type(screen.getByLabelText("Name"), "Test");
      await user.click(
        screen.getByRole("button", { name: /create service category/i })
      );

      await waitFor(() => {
        expect(mockShowNotification).toHaveBeenCalledWith(
          "Internal Server Error",
          "error"
        );
      });
    });
  });
});
