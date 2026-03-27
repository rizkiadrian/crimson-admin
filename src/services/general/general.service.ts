import { api } from "@lib/api";
import { IApiResponse, IBackOfficeStatus, IPingResult } from "./general.types";

export const generalService = {
  pingTest: async (): Promise<IApiResponse<IPingResult>> => {
    return await api.get("/wrapper-test");
  },
  backofficeStatus: async (): Promise<IApiResponse<IBackOfficeStatus>> => {
    return await api.get("/backoffice/status");
  },
};
