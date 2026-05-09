import { api } from "@lib/api";
import { IFinanceDashboardData } from "./finance-dashboard.types";
import { IApiResponse } from "@services/general/general.types";

export const financeDashboardService = {
  getDashboard: async (): Promise<IApiResponse<IFinanceDashboardData>> => {
    return await api.get("/finance/dashboard");
  },
};
