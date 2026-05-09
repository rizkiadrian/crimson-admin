import { api } from "@lib/api";
import { IBackofficeDashboardData } from "./backoffice-dashboard.types";
import { IApiResponse } from "@services/general/general.types";

export const backofficeDashboardService = {
  getDashboard: async (): Promise<IApiResponse<IBackofficeDashboardData>> => {
    return await api.get("/backoffice/backoffice-dashboard");
  },
};
