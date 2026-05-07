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
  /** GET /backoffice/vouchers — paginated list with filters */
  list: async (
    params: IVoucherParams = {}
  ): Promise<IApiListResponse<IVoucher, IPaginationMeta>> => {
    return await api.get("/backoffice/vouchers", { params });
  },

  /** GET /backoffice/vouchers/:id — single voucher detail */
  detail: async (id: number): Promise<IApiResponse<IVoucher>> => {
    return await api.get(`/backoffice/vouchers/${id}`);
  },

  /** POST /backoffice/vouchers — create a new voucher */
  create: async (
    data: IVoucherCreatePayload
  ): Promise<IApiResponse<IVoucher>> => {
    return await api.post("/backoffice/vouchers", data);
  },

  /** PUT /backoffice/vouchers/:id — update voucher */
  update: async (
    id: number,
    data: IVoucherUpdatePayload
  ): Promise<IApiResponse<IVoucher>> => {
    return await api.put(`/backoffice/vouchers/${id}`, data);
  },

  /** DELETE /backoffice/vouchers/:id — soft delete voucher */
  delete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/vouchers/${id}`);
  },

  /** PATCH /backoffice/vouchers/:id/toggle-active — toggle active status */
  toggleActive: async (id: number): Promise<IApiResponse<IVoucher>> => {
    return await api.patch(`/backoffice/vouchers/${id}/toggle-active`);
  },

  /** POST /backoffice/vouchers/:id/assign — assign voucher to users */
  assign: async (
    id: number,
    payload: IVoucherAssignPayload
  ): Promise<IApiResponse<null>> => {
    return await api.post(`/backoffice/vouchers/${id}/assign`, payload);
  },
};
