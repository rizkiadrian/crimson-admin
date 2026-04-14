import { api } from "@lib/api";
import { IBackofficeUser } from "./backoffice-members.types";
import { IApiListResponse } from "@services/general/general.types";

export const backofficeMembersService = {
  backofficeMembers: async (): Promise<IApiListResponse<IBackofficeUser>> => {
    return await api.get("/backoffice/backoffice-members");
  },
};
