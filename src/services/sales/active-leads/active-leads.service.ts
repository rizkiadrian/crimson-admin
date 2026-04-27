import { api } from "@lib/api";
import { IApiResponse } from "@services/general/general.types";
import { IActiveLead, IActiveLeadParams } from "./active-leads.types";

export const activeLeadsService = {
  /** GET /sales/active-leads — lightweight list for dropdown (max 50) */
  getActiveLeads: async (
    params: IActiveLeadParams = {}
  ): Promise<IApiResponse<IActiveLead[]>> => {
    return await api.get("/sales/active-leads", { params });
  },
};
