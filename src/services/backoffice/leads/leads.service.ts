import { api } from "@lib/api";
import {
  ILead,
  ILeadCreatePayload,
  ILeadUpdatePayload,
  ILeadUpdateStatusPayload,
  ILeadConvertPayload,
  ILeadParams,
} from "./leads.types";
import {
  IApiListResponse,
  IApiResponse,
} from "@services/general/general.types";

export const leadsService = {
  /** GET /backoffice/leads — paginated list with optional filters */
  leads: async (params: ILeadParams = {}): Promise<IApiListResponse<ILead>> => {
    return await api.get("/backoffice/leads", { params });
  },

  /** POST /backoffice/leads — create a new lead */
  leadsCreate: async (
    body: ILeadCreatePayload
  ): Promise<IApiResponse<ILead>> => {
    return await api.post("/backoffice/leads", body);
  },

  /** GET /backoffice/leads/{id} — fetch lead detail */
  leadsDetail: async (id: number): Promise<IApiResponse<ILead>> => {
    return await api.get(`/backoffice/leads/${id}`);
  },

  /** PUT /backoffice/leads/{id} — update lead data */
  leadsUpdate: async (
    id: number,
    body: ILeadUpdatePayload
  ): Promise<IApiResponse<ILead>> => {
    return await api.put(`/backoffice/leads/${id}`, body);
  },

  /** DELETE /backoffice/leads/{id} — delete lead */
  leadsDelete: async (id: number): Promise<IApiResponse<null>> => {
    return await api.delete(`/backoffice/leads/${id}`);
  },

  /** PATCH /backoffice/leads/{id}/status — update pipeline status */
  leadsUpdateStatus: async (
    id: number,
    body: ILeadUpdateStatusPayload
  ): Promise<IApiResponse<ILead>> => {
    return await api.patch(`/backoffice/leads/${id}/status`, body);
  },

  /** PATCH /backoffice/leads/{id}/convert — convert lead to a user */
  leadsConvert: async (
    id: number,
    body: ILeadConvertPayload
  ): Promise<IApiResponse<ILead>> => {
    return await api.patch(`/backoffice/leads/${id}/convert`, body);
  },
};
