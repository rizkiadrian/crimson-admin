import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mock @lib/api ──────────────────────────────────────────────────────────────

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockDelete = vi.fn();

vi.mock("@lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

// ─── Import after mocks ─────────────────────────────────────────────────────────

import { serviceCategoriesService } from "../service-categories.service";

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe("serviceCategoriesService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── list() ────────────────────────────────────────────────────────────────────
  // Validates: Requirement 1.1

  describe("list()", () => {
    it("calls GET /backoffice/service-categories with params", async () => {
      const mockResponse = { data: [], meta: { pagination: {} } };
      mockGet.mockResolvedValue(mockResponse);

      const params = { page: 2, per_page: 10 };
      const result = await serviceCategoriesService.list(params);

      expect(mockGet).toHaveBeenCalledWith("/backoffice/service-categories", {
        params,
      });
      expect(result).toEqual(mockResponse);
    });

    it("calls GET /backoffice/service-categories with default empty params", async () => {
      const mockResponse = { data: [], meta: { pagination: {} } };
      mockGet.mockResolvedValue(mockResponse);

      await serviceCategoriesService.list();

      expect(mockGet).toHaveBeenCalledWith("/backoffice/service-categories", {
        params: {},
      });
    });
  });

  // ── detail() ──────────────────────────────────────────────────────────────────
  // Validates: Requirement 1.2

  describe("detail()", () => {
    it("calls GET /backoffice/service-categories/:id", async () => {
      const mockResponse = {
        data: { id: 5, name: "Plumbing", slug: "plumbing" },
      };
      mockGet.mockResolvedValue(mockResponse);

      const result = await serviceCategoriesService.detail(5);

      expect(mockGet).toHaveBeenCalledWith("/backoffice/service-categories/5");
      expect(result).toEqual(mockResponse);
    });
  });

  // ── create() ──────────────────────────────────────────────────────────────────
  // Validates: Requirement 1.3

  describe("create()", () => {
    it("sends FormData via POST to /backoffice/service-categories", async () => {
      const mockResponse = {
        data: { id: 10, name: "Cleaning", slug: "cleaning" },
      };
      mockPost.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append("name", "Cleaning");
      formData.append("is_active", "1");

      const result = await serviceCategoriesService.create(formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/backoffice/service-categories",
        formData
      );
      expect(result).toEqual(mockResponse);
    });
  });

  // ── update() ──────────────────────────────────────────────────────────────────
  // Validates: Requirement 1.4

  describe("update()", () => {
    it("sends FormData via POST to /backoffice/service-categories/:id (with _method=PUT in FormData)", async () => {
      const mockResponse = {
        data: { id: 3, name: "Updated", slug: "updated" },
      };
      mockPost.mockResolvedValue(mockResponse);

      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", "Updated");

      const result = await serviceCategoriesService.update(3, formData);

      expect(mockPost).toHaveBeenCalledWith(
        "/backoffice/service-categories/3",
        formData
      );
      expect(result).toEqual(mockResponse);

      // Verify the FormData passed to api.post is the same instance
      const passedFormData = mockPost.mock.calls[0][1] as FormData;
      expect(passedFormData.get("_method")).toBe("PUT");
      expect(passedFormData.get("name")).toBe("Updated");
    });
  });

  // ── delete() ──────────────────────────────────────────────────────────────────
  // Validates: Requirement 1.5

  describe("delete()", () => {
    it("calls DELETE /backoffice/service-categories/:id", async () => {
      const mockResponse = { data: null };
      mockDelete.mockResolvedValue(mockResponse);

      const result = await serviceCategoriesService.delete(7);

      expect(mockDelete).toHaveBeenCalledWith(
        "/backoffice/service-categories/7"
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
