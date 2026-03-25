import { api } from "@lib/api";
import { IApiResponse, IPingResult } from "./general.types";

export const generalService = {
  pingTest: async (): Promise<IApiResponse<IPingResult>> => {
    return await api.get("/wrapper-test");
  },
};
