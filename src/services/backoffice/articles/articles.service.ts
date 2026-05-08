import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type { IArticle, IArticleParams } from "./articles.types";

export const articlesService = {
  list: async (
    params: IArticleParams = {}
  ): Promise<IApiListResponse<IArticle, IPaginationMeta>> => {
    return await api.get("/backoffice/articles", { params });
  },

  detail: async (id: number): Promise<IApiResponse<IArticle>> => {
    return await api.get(`/backoffice/articles/${id}`);
  },

  create: async (data: FormData | object): Promise<IApiResponse<IArticle>> => {
    return await api.post("/backoffice/articles", data);
  },

  update: async (
    id: number,
    data: FormData | object
  ): Promise<IApiResponse<IArticle>> => {
    return await api.post(`/backoffice/articles/${id}`, data);
  },

  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/articles/${id}`);
  },

  publish: async (id: number): Promise<IApiResponse<IArticle>> => {
    return await api.patch(`/backoffice/articles/${id}/publish`);
  },

  unpublish: async (id: number): Promise<IApiResponse<IArticle>> => {
    return await api.patch(`/backoffice/articles/${id}/unpublish`);
  },

  archive: async (id: number): Promise<IApiResponse<IArticle>> => {
    return await api.patch(`/backoffice/articles/${id}/archive`);
  },

  schedule: async (
    id: number,
    payload: { published_at: string }
  ): Promise<IApiResponse<IArticle>> => {
    return await api.patch(`/backoffice/articles/${id}/schedule`, payload);
  },

  uploadImage: async (file: File): Promise<IApiResponse<{ url: string }>> => {
    const formData = new FormData();
    formData.append("image", file);
    return await api.post("/backoffice/articles/upload-image", formData);
  },
};
