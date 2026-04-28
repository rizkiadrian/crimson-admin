export interface IClientSummary {
  total: number;
  verified: number;
  unverified: number;
}

export interface IMitraSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
  online: number;
}

export interface IRecentBackoffice {
  id: number;
  name: string;
  email: string;
  role_name: string;
  updated_at: string;
}

export interface ILeadsByStatus {
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  negotiation: number;
  won: number;
  lost: number;
}

export interface ILeadsSummary {
  total: number;
  by_type: {
    client: number;
    mitra: number;
  };
  by_status: ILeadsByStatus;
}

export interface IDepositsSummary {
  total: number;
  pending: number;
}

export interface IDashboardData {
  clients: IClientSummary;
  mitra: IMitraSummary;
  leads: ILeadsSummary;
  deposits: IDepositsSummary;
  recent_backoffice: IRecentBackoffice[];
}
