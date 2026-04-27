/** Lightweight lead item returned by GET /sales/active-leads */
export interface IActiveLead {
  id: number;
  name: string;
  lead_id: string;
  type: string;
  status: string;
}

export interface IActiveLeadParams {
  search?: string;
}
