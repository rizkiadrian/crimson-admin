import { api } from "@lib/api";
import { IDashboardData } from "./dashboard.types";
import { IApiResponse } from "@services/general/general.types";

export const dashboardService = {
  getDashboard: async (): Promise<IApiResponse<IDashboardData>> => {
    return await api.get("/admin/dashboard");
  },
};
