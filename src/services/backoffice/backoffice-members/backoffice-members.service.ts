import { api } from "@lib/api";
import {
  IBackofficeCreatePayload,
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
};
