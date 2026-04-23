import { api } from "@lib/api";
import {
  IBackofficeCreatePayload,
  IBackofficeUpdatePayload,
  IBackofficeUser,
  IBackofficeUserParams,
} from "./backoffice-members.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const backofficeMembersService = {
  backofficeMembers: async (
    params: IBackofficeUserParams = {}
  ): Promise<IApiListResponse<IBackofficeUser>> => {
    return await api.get("/backoffice/backoffice-members", {
      params,
    });
  },
  backofficeMembersCreate: async (
    body: IBackofficeCreatePayload
  ): Promise<IApiResponse<IBackofficeUser>> => {
    return await api.post("/backoffice/backoffice-members", body);
  },
  backofficeMembersDetail: async (
    id: number
  ): Promise<IApiResponse<IBackofficeUser>> => {
    return await api.get(`/backoffice/backoffice-members/${id}`);
  },
  backofficeMembersUpdate: async (
    id: number,
    body: IBackofficeUpdatePayload
  ): Promise<IApiResponse<IBackofficeUser>> => {
    return await api.put(`/backoffice/backoffice-members/${id}`, body);
  },
  backofficeMembersDelete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/backoffice-members/${id}`);
  },
};
