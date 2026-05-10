import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IPopupPromotion,
  IPopupPromotionParams,
  IPopupPromotionCreatePayload,
  IPopupPromotionUpdatePayload,
  IPopupAnalytics,
  IPopupTimelineEntry,
  IPopupBreakdownEntry,
  IPopupABVariant,
  PopupStatus,
} from "./popup-promotions.types";

export const popupPromotionsService = {
  getAll: async (
    params: IPopupPromotionParams = {}
  ): Promise<IApiListResponse<IPopupPromotion, IPaginationMeta>> => {
    return await api.get("/marketing/popup-promotions", { params });
  },

  getById: async (id: string): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.get(`/marketing/popup-promotions/${id}`);
  },

  create: async (
    data: IPopupPromotionCreatePayload
  ): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.post("/marketing/popup-promotions", data);
  },

  update: async (
    id: string,
    data: IPopupPromotionUpdatePayload
  ): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.put(`/marketing/popup-promotions/${id}`, data);
  },

  delete: async (id: string): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/popup-promotions/${id}`);
  },

  changeStatus: async (
    id: string,
    status: PopupStatus
  ): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.patch(`/marketing/popup-promotions/${id}/status`, {
      status,
    });
  },

  duplicate: async (id: string): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.post(`/marketing/popup-promotions/${id}/duplicate`);
  },

  createABVariant: async (
    id: string
  ): Promise<IApiResponse<IPopupPromotion>> => {
    return await api.post(`/marketing/popup-promotions/${id}/ab-variant`);
  },

  getAnalytics: async (
    id: string,
    params?: { date_from?: string; date_to?: string }
  ): Promise<IApiResponse<IPopupAnalytics>> => {
    return await api.get(`/marketing/popup-promotions/${id}/analytics`, {
      params,
    });
  },

  getTimeline: async (
    id: string,
    params?: { granularity?: string }
  ): Promise<IApiResponse<IPopupTimelineEntry[]>> => {
    return await api.get(
      `/marketing/popup-promotions/${id}/analytics/timeline`,
      { params }
    );
  },

  getBreakdown: async (
    id: string,
    params?: { dimension?: string }
  ): Promise<IApiResponse<IPopupBreakdownEntry[]>> => {
    return await api.get(
      `/marketing/popup-promotions/${id}/analytics/breakdown`,
      { params }
    );
  },

  getCompare: async (id: string): Promise<IApiResponse<IPopupABVariant[]>> => {
    return await api.get(`/marketing/popup-promotions/${id}/compare`);
  },

  uploadImage: async (file: File): Promise<IApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append("image", file);
    return await api.post(
      "/marketing/popup-promotions/upload-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },
};
