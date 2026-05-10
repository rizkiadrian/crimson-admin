import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IEventRegistry,
  IEventRegistryParams,
  IEventRegistryCreatePayload,
  IEventRegistryUpdatePayload,
} from "./event-registry.types";

export const eventRegistryService = {
  list: async (
    params: IEventRegistryParams = {}
  ): Promise<IApiListResponse<IEventRegistry, IPaginationMeta>> => {
    return await api.get("/marketing/event-registry", { params });
  },

  create: async (
    data: IEventRegistryCreatePayload
  ): Promise<IApiResponse<IEventRegistry>> => {
    return await api.post("/marketing/event-registry", data);
  },

  update: async (
    id: number,
    data: IEventRegistryUpdatePayload
  ): Promise<IApiResponse<IEventRegistry>> => {
    return await api.put(`/marketing/event-registry/${id}`, data);
  },

  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/event-registry/${id}`);
  },
};
