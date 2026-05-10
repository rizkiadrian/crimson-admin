import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockPatch = vi.fn();
const mockDelete = vi.fn();

vi.mock("@lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

import { popupPromotionsService } from "../popup-promotions.service";

describe("popupPromotionsService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll calls GET /marketing/popup-promotions with params", async () => {
    mockGet.mockResolvedValue({ data: [], meta: {} });
    const params = { page: 1, status: "active" as const };
    await popupPromotionsService.getAll(params);
    expect(mockGet).toHaveBeenCalledWith("/marketing/popup-promotions", {
      params,
    });
  });

  it("getById calls GET /marketing/popup-promotions/:id", async () => {
    mockGet.mockResolvedValue({ data: {} });
    await popupPromotionsService.getById("uuid-1");
    expect(mockGet).toHaveBeenCalledWith("/marketing/popup-promotions/uuid-1");
  });

  it("create calls POST with payload", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const payload = { name: "Test", content_type: "template" as const };
    await popupPromotionsService.create(payload);
    expect(mockPost).toHaveBeenCalledWith(
      "/marketing/popup-promotions",
      payload
    );
  });

  it("changeStatus calls PATCH with status", async () => {
    mockPatch.mockResolvedValue({ data: {} });
    await popupPromotionsService.changeStatus("uuid-1", "paused");
    expect(mockPatch).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1/status",
      { status: "paused" }
    );
  });

  it("duplicate calls POST duplicate endpoint", async () => {
    mockPost.mockResolvedValue({ data: {} });
    await popupPromotionsService.duplicate("uuid-1");
    expect(mockPost).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1/duplicate"
    );
  });

  it("createABVariant calls POST ab-variant endpoint", async () => {
    mockPost.mockResolvedValue({ data: {} });
    await popupPromotionsService.createABVariant("uuid-1");
    expect(mockPost).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1/ab-variant"
    );
  });

  it("getAnalytics calls correct endpoint with params", async () => {
    mockGet.mockResolvedValue({ data: {} });
    await popupPromotionsService.getAnalytics("uuid-1", {
      date_from: "2026-01-01",
    });
    expect(mockGet).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1/analytics",
      { params: { date_from: "2026-01-01" } }
    );
  });

  it("getCompare calls correct endpoint", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await popupPromotionsService.getCompare("uuid-1");
    expect(mockGet).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1/compare"
    );
  });

  it("delete calls DELETE endpoint", async () => {
    mockDelete.mockResolvedValue({ data: null });
    await popupPromotionsService.delete("uuid-1");
    expect(mockDelete).toHaveBeenCalledWith(
      "/marketing/popup-promotions/uuid-1"
    );
  });
});
