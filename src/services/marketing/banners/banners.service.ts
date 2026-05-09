import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type { IBanner, IBannerParams, BannerStatus } from "./banners.types";

export const bannersService = {
  /** GET /marketing/banners — paginated list of banners */
  list: async (
    params: IBannerParams = {}
  ): Promise<IApiListResponse<IBanner, IPaginationMeta>> => {
    return await api.get("/marketing/banners", { params });
  },

  /** GET /marketing/banners/:id — single banner detail */
  detail: async (id: string): Promise<IApiResponse<IBanner>> => {
    return await api.get(`/marketing/banners/${id}`);
  },

  /** POST /marketing/banners — create a new banner */
  create: async (data: FormData | object): Promise<IApiResponse<IBanner>> => {
    return await api.post("/marketing/banners", data);
  },

  /** POST /marketing/banners/:id — update banner (POST with _method=PUT for multipart) */
  update: async (
    id: string,
    data: FormData | object
  ): Promise<IApiResponse<IBanner>> => {
    return await api.post(`/marketing/banners/${id}`, data);
  },

  /** DELETE /marketing/banners/:id — soft delete a banner */
  delete: async (id: string): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/banners/${id}`);
  },

  /** PATCH /marketing/banners/:id/status — toggle banner status */
  updateStatus: async (
    id: string,
    payload: { status: BannerStatus }
  ): Promise<IApiResponse<IBanner>> => {
    return await api.patch(`/marketing/banners/${id}/status`, payload);
  },

  /** PATCH /marketing/banners/reorder — update display order */
  reorder: async (payload: {
    banners: { id: string; display_order: number }[];
  }): Promise<IApiResponse<null>> => {
    return await api.patch("/marketing/banners/reorder", payload);
  },
};
