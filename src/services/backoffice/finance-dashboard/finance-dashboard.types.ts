export interface IFinanceDepositStats {
  pending: number;
  approved_today: number;
  rejected_today: number;
  volume_this_month: number;
}

export interface IVolumeTrendItem {
  date: string;
  amount: number;
}

export interface IRecentPendingDeposit {
  id: string;
  user_name: string;
  amount: number;
  created_at: string;
}

export interface IFinanceDashboardData {
  deposits: IFinanceDepositStats;
  volume_trend: IVolumeTrendItem[];
  recent_pending: IRecentPendingDeposit[];
}
