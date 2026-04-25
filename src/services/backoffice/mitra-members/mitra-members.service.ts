import { api } from "@lib/api";
import {
  IMitraUpdatePayload,
  IMitraUser,
  IMitraUserParams,
} from "./mitra-members.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const mitraMembersService = {
  mitraMembers: async (
    params: IMitraUserParams = {}
  ): Promise<IApiListResponse<IMitraUser>> => {
    return await api.get("/backoffice/mitra-members", { params });
  },
  mitraMembersDetail: async (id: number): Promise<IApiResponse<IMitraUser>> => {
    return await api.get(`/backoffice/mitra-members/${id}`);
  },
  mitraMembersUpdate: async (
    id: number,
    body: IMitraUpdatePayload
  ): Promise<IApiResponse<IMitraUser>> => {
    return await api.put(`/backoffice/mitra-members/${id}`, body);
  },
  mitraMembersDelete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/mitra-members/${id}`);
  },
};
