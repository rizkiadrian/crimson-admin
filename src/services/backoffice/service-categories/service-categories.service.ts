import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IServiceCategory,
  IServiceCategoryParams,
} from "./service-categories.types";

export const serviceCategoriesService = {
  /** GET /backoffice/service-categories — paginated list of service categories */
  list: async (
    params: IServiceCategoryParams = {}
  ): Promise<IApiListResponse<IServiceCategory, IPaginationMeta>> => {
    return await api.get("/backoffice/service-categories", { params });
  },

  /** GET /backoffice/service-categories/:id — single service category detail */
  detail: async (id: number): Promise<IApiResponse<IServiceCategory>> => {
    return await api.get(`/backoffice/service-categories/${id}`);
  },

  /** POST /backoffice/service-categories — create a new service category (FormData for icon upload) */
  create: async (data: FormData): Promise<IApiResponse<IServiceCategory>> => {
    return await api.post("/backoffice/service-categories", data);
  },

  /** POST /backoffice/service-categories/:id — update service category (POST with _method=PUT for multipart FormData) */
  update: async (
    id: number,
    data: FormData
  ): Promise<IApiResponse<IServiceCategory>> => {
    return await api.post(`/backoffice/service-categories/${id}`, data);
  },

  /** DELETE /backoffice/service-categories/:id — delete a service category */
  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/service-categories/${id}`);
  },
};
