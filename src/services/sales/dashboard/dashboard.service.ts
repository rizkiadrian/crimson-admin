import { api } from "@lib/api";
import { ISalesDashboardData } from "./dashboard.types";
import { IApiResponse } from "@services/general/general.types";

export const salesDashboardService = {
  getDashboard: async (): Promise<IApiResponse<ISalesDashboardData>> => {
    return await api.get("/sales/dashboard");
  },
};
