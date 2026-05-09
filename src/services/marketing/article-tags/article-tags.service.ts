import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type { IArticleTag, IArticleTagParams } from "./article-tags.types";

export const articleTagsService = {
  list: async (
    params: IArticleTagParams = {}
  ): Promise<IApiListResponse<IArticleTag, IPaginationMeta>> => {
    return await api.get("/marketing/article-tags", { params });
  },

  detail: async (id: number): Promise<IApiResponse<IArticleTag>> => {
    return await api.get(`/marketing/article-tags/${id}`);
  },

  create: async (data: object): Promise<IApiResponse<IArticleTag>> => {
    return await api.post("/marketing/article-tags", data);
  },

  update: async (
    id: number,
    data: object
  ): Promise<IApiResponse<IArticleTag>> => {
    return await api.put(`/marketing/article-tags/${id}`, data);
  },

  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/article-tags/${id}`);
  },
};
