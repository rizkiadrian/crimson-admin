import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ─── Mocks ──────────────────────────────────────────────────────────────────────

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/dashboard/articles",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({ id: "1" }),
}));

const mockArticlesList = vi.fn();
const mockArticlesDelete = vi.fn();
const mockArticlesPublish = vi.fn();
const mockArticlesUnpublish = vi.fn();
const mockArticlesArchive = vi.fn();
const mockArticlesDetail = vi.fn();
const mockArticlesCreate = vi.fn();
const mockArticlesUploadImage = vi.fn();

vi.mock("@services/marketing/articles", () => ({
  articlesService: {
    list: (...args: unknown[]) => mockArticlesList(...args),
    delete: (...args: unknown[]) => mockArticlesDelete(...args),
    publish: (...args: unknown[]) => mockArticlesPublish(...args),
    unpublish: (...args: unknown[]) => mockArticlesUnpublish(...args),
    archive: (...args: unknown[]) => mockArticlesArchive(...args),
    detail: (...args: unknown[]) => mockArticlesDetail(...args),
    create: (...args: unknown[]) => mockArticlesCreate(...args),
    update: vi.fn(),
    uploadImage: (...args: unknown[]) => mockArticlesUploadImage(...args),
    schedule: vi.fn(),
  },
}));

const mockAuthorsList = vi.fn();
vi.mock("@services/marketing/authors", () => ({
  authorsService: {
    list: (...args: unknown[]) => mockAuthorsList(...args),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockCategoriesList = vi.fn();
vi.mock("@services/marketing/article-categories", () => ({
  articleCategoriesService: {
    list: (...args: unknown[]) => mockCategoriesList(...args),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTagsList = vi.fn();
vi.mock("@services/marketing/article-tags", () => ({
  articleTagsService: {
    list: (...args: unknown[]) => mockTagsList(...args),
    detail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockShowConfirm = vi.fn();
vi.mock("@store/useConfirmStore", () => ({
  useConfirmStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ showConfirm: mockShowConfirm }),
}));

const mockShowNotification = vi.fn();
vi.mock("@store/useNotificationStore", () => ({
  useNotificationStore: (
    selector: (state: Record<string, unknown>) => unknown
  ) => selector({ showNotification: mockShowNotification }),
}));

// Mock Tiptap (heavy dependency)
vi.mock("@tiptap/react", () => ({
  useEditor: () => ({
    getHTML: () => "<p>test</p>",
    commands: { setContent: vi.fn() },
    chain: () => ({ focus: () => ({ toggleBold: () => ({ run: vi.fn() }) }) }),
    isActive: () => false,
    can: () => ({ undo: () => false, redo: () => false }),
  }),
  EditorContent: () => <div data-testid="tiptap-editor">Editor</div>,
}));
vi.mock("@tiptap/starter-kit", () => ({ default: {} }));
vi.mock("@tiptap/extension-image", () => ({ default: {} }));
vi.mock("@tiptap/extension-link", () => ({
  default: { configure: () => ({}) },
}));
vi.mock("@tiptap/extension-placeholder", () => ({
  default: { configure: () => ({}) },
}));

// ─── Test Data ──────────────────────────────────────────────────────────────────

const MOCK_ARTICLES = [
  {
    id: 1,
    title: "Test Article",
    slug: "test-article",
    excerpt: "Test excerpt",
    body: "<p>Body</p>",
    status: "draft" as const,
    is_featured: false,
    published_at: null,
    author_id: 1,
    category_id: 1,
    author: { id: 1, name: "John Doe" },
    category: { id: 1, name: "Tech", slug: "tech" },
    tags: [{ id: 1, name: "JS", slug: "js" }],
    thumbnail_path: null,
    thumbnail_url: null,
    meta_title: null,
    meta_description: null,
    created_at: "2025-01-15T10:00:00.000Z",
    updated_at: "2025-01-15T10:00:00.000Z",
    deleted_at: null,
  },
  {
    id: 2,
    title: "Published Article",
    slug: "published-article",
    excerpt: null,
    body: "<p>Published</p>",
    status: "published" as const,
    is_featured: true,
    published_at: "2025-01-16T10:00:00.000Z",
    author_id: 1,
    category_id: null,
    author: { id: 1, name: "John Doe" },
    category: null,
    tags: [],
    thumbnail_path: null,
    thumbnail_url: null,
    meta_title: null,
    meta_description: null,
    created_at: "2025-01-16T10:00:00.000Z",
    updated_at: "2025-01-16T10:00:00.000Z",
    deleted_at: null,
  },
];

const MOCK_LIST_RESPONSE = {
  data: MOCK_ARTICLES,
  message: "Success",
  meta: { current_page: 1, last_page: 1, per_page: 15, total: 2 },
};

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("ArticlesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockArticlesList.mockResolvedValue(MOCK_LIST_RESPONSE);
  });

  it("renders the articles table with data", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Article")).toBeInTheDocument();
      expect(screen.getByText("Published Article")).toBeInTheDocument();
    });
  });

  it("renders status badges correctly", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Draft").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Published").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("calls list service on mount", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(mockArticlesList).toHaveBeenCalled();
    });
  });

  it("shows publish button for draft articles", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      const publishButtons = screen.getAllByLabelText("Publish");
      expect(publishButtons).toHaveLength(1);
    });
  });

  it("shows unpublish and archive buttons for published articles", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getAllByLabelText("Unpublish")).toHaveLength(1);
      expect(screen.getAllByLabelText("Archive")).toHaveLength(1);
    });
  });

  it("opens confirm dialog on delete", async () => {
    const user = userEvent.setup();
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByText("Test Article")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByLabelText("Delete");
    await user.click(deleteButtons[0]);

    expect(mockShowConfirm).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Hapus Article?" })
    );
  });

  it("has a create article button linking to create page", async () => {
    const { default: ArticlesPage } =
      await import("@app/(dashboard)/dashboard/articles/page");
    render(<ArticlesPage />);

    await waitFor(() => {
      expect(screen.getByText("Create Article")).toBeInTheDocument();
    });
  });
});

describe("ArticleCreatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorsList.mockResolvedValue({
      data: [{ id: 1, name: "John Doe" }],
      meta: {},
    });
    mockCategoriesList.mockResolvedValue({
      data: [{ id: 1, name: "Tech", slug: "tech" }],
      meta: {},
    });
    mockTagsList.mockResolvedValue({
      data: [{ id: 1, name: "JS", slug: "js" }],
      meta: {},
    });
  });

  it("renders the create form with all fields", async () => {
    const { default: ArticleCreatePage } =
      await import("@app/(dashboard)/dashboard/articles/create/page");
    render(<ArticleCreatePage />);

    await waitFor(() => {
      expect(
        screen.getByText("Write and publish a new article.")
      ).toBeInTheDocument();
      expect(screen.getByTestId("tiptap-editor")).toBeInTheDocument();
    });
  });

  it("loads tags on mount", async () => {
    const { default: ArticleCreatePage } =
      await import("@app/(dashboard)/dashboard/articles/create/page");
    render(<ArticleCreatePage />);

    await waitFor(() => {
      expect(mockTagsList).toHaveBeenCalled();
      expect(screen.getByText("JS")).toBeInTheDocument();
    });
  });
});
