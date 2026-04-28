export interface ILeadsByStatus {
  new: number;
  contacted: number;
  qualified: number;
  proposal: number;
  negotiation: number;
  won: number;
  lost: number;
}

export interface ILeadsByPriority {
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

export interface ISalesLeadsSummary {
  total: number;
  active: number;
  won: number;
  lost: number;
  by_status: ILeadsByStatus;
  by_type: {
    client: number;
    mitra: number;
  };
  by_priority: ILeadsByPriority;
}

export interface IActivitiesByStatus {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ISalesActivitiesSummary {
  total: number;
  this_month: number;
  by_status: IActivitiesByStatus;
}

export interface IRecentActivity {
  id: number;
  title: string;
  type: string;
  status: string;
  lead: {
    id: number;
    name: string;
    lead_id: string;
  } | null;
  created_at: string;
}

export interface IRecentLead {
  id: number;
  lead_id: string;
  name: string;
  type: string;
  status: string;
  priority: string;
  created_at: string;
}

export interface ISalesDashboardData {
  leads: ISalesLeadsSummary;
  activities: ISalesActivitiesSummary;
  recent_activities: IRecentActivity[];
  recent_leads: IRecentLead[];
}
