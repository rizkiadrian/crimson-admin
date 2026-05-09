import { api } from "@lib/api";
import type {
  IApiListResponse,
  IApiResponse,
  IPaginationMeta,
} from "@services/general";
import type {
  IVoucher,
  IVoucherAssignPayload,
  IVoucherCreatePayload,
  IVoucherParams,
  IVoucherUpdatePayload,
} from "./vouchers.types";

export const vouchersService = {
  /** GET /marketing/vouchers — paginated list with filters */
  list: async (
    params: IVoucherParams = {}
  ): Promise<IApiListResponse<IVoucher, IPaginationMeta>> => {
    return await api.get("/marketing/vouchers", { params });
  },

  /** GET /marketing/vouchers/:id — single voucher detail */
  detail: async (id: number): Promise<IApiResponse<IVoucher>> => {
    return await api.get(`/marketing/vouchers/${id}`);
  },

  /** POST /marketing/vouchers — create a new voucher */
  create: async (
    data: IVoucherCreatePayload
  ): Promise<IApiResponse<IVoucher>> => {
    return await api.post("/marketing/vouchers", data);
  },

  /** PUT /marketing/vouchers/:id — update voucher */
  update: async (
    id: number,
    data: IVoucherUpdatePayload
  ): Promise<IApiResponse<IVoucher>> => {
    return await api.put(`/marketing/vouchers/${id}`, data);
  },

  /** DELETE /marketing/vouchers/:id — soft delete voucher */
  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/marketing/vouchers/${id}`);
  },

  /** PATCH /marketing/vouchers/:id/toggle-active — toggle active status */
  toggleActive: async (id: number): Promise<IApiResponse<IVoucher>> => {
    return await api.patch(`/marketing/vouchers/${id}/toggle-active`);
  },

  /** POST /marketing/vouchers/:id/assign — assign voucher to users */
  assign: async (
    id: number,
    payload: IVoucherAssignPayload
  ): Promise<IApiResponse<null>> => {
    return await api.post(`/marketing/vouchers/${id}/assign`, payload);
  },
};
