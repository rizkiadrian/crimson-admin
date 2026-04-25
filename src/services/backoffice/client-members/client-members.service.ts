import { api } from "@lib/api";
import {
  IClientCreatePayload,
  IClientUpdatePayload,
  IClientUser,
  IClientUserParams,
} from "./client-members.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const clientMembersService = {
  clientMembers: async (
    params: IClientUserParams = {}
  ): Promise<IApiListResponse<IClientUser>> => {
    return await api.get("/backoffice/client-members", { params });
  },
  clientMembersCreate: async (
    body: IClientCreatePayload
  ): Promise<IApiResponse<IClientUser>> => {
    return await api.post("/backoffice/client-members", body);
  },
  clientMembersDetail: async (
    id: number
  ): Promise<IApiResponse<IClientUser>> => {
    return await api.get(`/backoffice/client-members/${id}`);
  },
  clientMembersUpdate: async (
    id: number,
    body: IClientUpdatePayload
  ): Promise<IApiResponse<IClientUser>> => {
    return await api.put(`/backoffice/client-members/${id}`, body);
  },
  clientMembersDelete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/client-members/${id}`);
  },
};
