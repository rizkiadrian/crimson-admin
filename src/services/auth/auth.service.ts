import { api } from "@lib/api";
import { IApiResponse } from "../general/general.types";
import { IUserAuth } from "./auth.types";

export const authService = {
  me: async (): Promise<IApiResponse<IUserAuth>> => {
    return await api.get("/auth/me");
  },
};
