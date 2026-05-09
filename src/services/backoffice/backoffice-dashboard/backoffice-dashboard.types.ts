export interface IBackofficeClientSummary {
  total: number;
  verified: number;
  unverified: number;
}

export interface IBackofficeMitraSummary {
  total: number;
  pending_verification: number;
}

export interface IBackofficeLeadsByStatus {
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  negotiation: number;
  won: number;
  lost: number;
}

export interface IBackofficeLeadsSummary {
  total: number;
  by_status: IBackofficeLeadsByStatus;
}

export interface IPendingActivityLog {
  id: number;
  type: string;
  sales_name: string;
  created_at: string;
}

export interface IPendingVerification {
  id: number;
  name: string;
  type: string;
  created_at: string;
}

export interface IBackofficeDashboardData {
  clients: IBackofficeClientSummary;
  mitra: IBackofficeMitraSummary;
  leads: IBackofficeLeadsSummary;
  pending_activity_logs: IPendingActivityLog[];
  pending_verifications: IPendingVerification[];
}
