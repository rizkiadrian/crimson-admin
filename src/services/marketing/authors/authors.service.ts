import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type { IAuthor, IAuthorParams } from "./authors.types";

export const authorsService = {
  list: async (
    params: IAuthorParams = {}
  ): Promise<IApiListResponse<IAuthor, IPaginationMeta>> => {
    return await api.get("/marketing/authors", { params });
  },

  detail: async (id: number): Promise<IApiResponse<IAuthor>> => {
    return await api.get(`/marketing/authors/${id}`);
  },

  create: async (data: FormData): Promise<IApiResponse<IAuthor>> => {
    return await api.post("/marketing/authors", data);
  },

  update: async (
    id: number,
    data: FormData
  ): Promise<IApiResponse<IAuthor>> => {
    return await api.post(`/marketing/authors/${id}`, data);
  },

  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/authors/${id}`);
  },
};
