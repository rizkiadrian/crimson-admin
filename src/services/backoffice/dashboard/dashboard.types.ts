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

export interface IDashboardData {
  clients: IClientSummary;
  mitra: IMitraSummary;
  recent_backoffice: IRecentBackoffice[];
}
