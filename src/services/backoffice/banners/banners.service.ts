import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type { IBanner, IBannerParams, BannerStatus } from "./banners.types";

export const bannersService = {
  /** GET /backoffice/banners — paginated list of banners */
  list: async (
    params: IBannerParams = {}
  ): Promise<IApiListResponse<IBanner, IPaginationMeta>> => {
    return await api.get("/backoffice/banners", { params });
  },

  /** GET /backoffice/banners/:id — single banner detail */
  detail: async (id: string): Promise<IApiResponse<IBanner>> => {
    return await api.get(`/backoffice/banners/${id}`);
  },

  /** POST /backoffice/banners — create a new banner */
  create: async (data: FormData | object): Promise<IApiResponse<IBanner>> => {
    return await api.post("/backoffice/banners", data);
  },

  /** POST /backoffice/banners/:id — update banner (POST with _method=PUT for multipart) */
  update: async (
    id: string,
    data: FormData | object
  ): Promise<IApiResponse<IBanner>> => {
    return await api.post(`/backoffice/banners/${id}`, data);
  },

  /** DELETE /backoffice/banners/:id — soft delete a banner */
  delete: async (id: string): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/banners/${id}`);
  },

  /** PATCH /backoffice/banners/:id/status — toggle banner status */
  updateStatus: async (
    id: string,
    payload: { status: BannerStatus }
  ): Promise<IApiResponse<IBanner>> => {
    return await api.patch(`/backoffice/banners/${id}/status`, payload);
  },

  /** PATCH /backoffice/banners/reorder — update display order */
  reorder: async (payload: {
    banners: { id: string; display_order: number }[];
  }): Promise<IApiResponse<null>> => {
    return await api.patch("/backoffice/banners/reorder", payload);
  },
};
