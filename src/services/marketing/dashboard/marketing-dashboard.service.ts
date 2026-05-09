import { api } from "@lib/api";
import { IMarketingDashboardData } from "./marketing-dashboard.types";
import { IApiResponse } from "@services/general/general.types";

export const marketingDashboardService = {
  getDashboard: async (): Promise<IApiResponse<IMarketingDashboardData>> => {
    return await api.get("/marketing/dashboard");
  },
};
