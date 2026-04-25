import { api } from "@lib/api";
import {
  ISalesCreatePayload,
  ISalesUpdatePayload,
  ISalesUser,
  ISalesUserParams,
  ISalesListItem,
} from "./sales-members.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const salesMembersService = {
  salesMembers: async (
    params: ISalesUserParams = {}
  ): Promise<IApiListResponse<ISalesUser>> => {
    return await api.get("/backoffice/sales-members", { params });
  },

  salesMembersList: async (): Promise<IApiResponse<ISalesListItem[]>> => {
    return await api.get("/backoffice/sales-members-list");
  },

  salesMembersCreate: async (
    body: ISalesCreatePayload
  ): Promise<IApiResponse<ISalesUser>> => {
    return await api.post("/backoffice/sales-members", body);
  },

  salesMembersDetail: async (id: number): Promise<IApiResponse<ISalesUser>> => {
    return await api.get(`/backoffice/sales-members/${id}`);
  },

  salesMembersUpdate: async (
    id: number,
    body: ISalesUpdatePayload
  ): Promise<IApiResponse<ISalesUser>> => {
    return await api.put(`/backoffice/sales-members/${id}`, body);
  },

  salesMembersDelete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/sales-members/${id}`);
  },
};
