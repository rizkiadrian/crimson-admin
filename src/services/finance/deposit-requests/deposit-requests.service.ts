import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IDepositRequest,
  IDepositRequestParams,
  IUpdateDepositStatusPayload,
} from "./deposit-requests.types";

export const depositRequestsService = {
  /** GET /finance/deposit-requests — paginated list of deposit requests */
  list: async (
    params: IDepositRequestParams = {}
  ): Promise<IApiListResponse<IDepositRequest, IPaginationMeta>> => {
    return await api.get("/finance/deposit-requests", { params });
  },

  /** GET /finance/deposit-requests/:id — single deposit request detail */
  detail: async (id: string): Promise<IApiResponse<IDepositRequest>> => {
    return await api.get(`/finance/deposit-requests/${id}`);
  },

  /** PATCH /finance/deposit-requests/:id/status — update deposit status */
  updateStatus: async (
    id: string,
    payload: IUpdateDepositStatusPayload
  ): Promise<IApiResponse<IDepositRequest>> => {
    return await api.patch(`/finance/deposit-requests/${id}/status`, payload);
  },
};
