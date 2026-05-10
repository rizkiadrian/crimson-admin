import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("@lib/api", () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    put: (...args: unknown[]) => mockPut(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

import { eventRegistryService } from "../event-registry.service";

describe("eventRegistryService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("list calls GET /marketing/event-registry with params", async () => {
    mockGet.mockResolvedValue({ data: [], meta: {} });
    const params = { category: "engagement" as const };
    await eventRegistryService.list(params);
    expect(mockGet).toHaveBeenCalledWith("/marketing/event-registry", {
      params,
    });
  });

  it("create calls POST with payload", async () => {
    mockPost.mockResolvedValue({ data: {} });
    const payload = {
      key: "test_event",
      label: "Test",
      category: "engagement" as const,
    };
    await eventRegistryService.create(payload);
    expect(mockPost).toHaveBeenCalledWith("/marketing/event-registry", payload);
  });

  it("update calls PUT with id and payload", async () => {
    mockPut.mockResolvedValue({ data: {} });
    await eventRegistryService.update(5, { label: "Updated" });
    expect(mockPut).toHaveBeenCalledWith("/marketing/event-registry/5", {
      label: "Updated",
    });
  });

  it("delete calls DELETE with id", async () => {
    mockDelete.mockResolvedValue({ data: null });
    await eventRegistryService.delete(5);
    expect(mockDelete).toHaveBeenCalledWith("/marketing/event-registry/5");
  });
});
