import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IArticleCategory,
  IArticleCategoryParams,
} from "./article-categories.types";

export const articleCategoriesService = {
  list: async (
    params: IArticleCategoryParams = {}
  ): Promise<IApiListResponse<IArticleCategory, IPaginationMeta>> => {
    return await api.get("/marketing/article-categories", { params });
  },

  detail: async (id: number): Promise<IApiResponse<IArticleCategory>> => {
    return await api.get(`/marketing/article-categories/${id}`);
  },

  create: async (data: object): Promise<IApiResponse<IArticleCategory>> => {
    return await api.post("/marketing/article-categories", data);
  },

  update: async (
    id: number,
    data: object
  ): Promise<IApiResponse<IArticleCategory>> => {
    return await api.put(`/marketing/article-categories/${id}`, data);
  },

  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/article-categories/${id}`);
  },
};
