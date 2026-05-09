export interface IMarketingCampaignStats {
  active: number;
  total_referrals: number;
}

export interface IMarketingVoucherStats {
  active: number;
  redeemed_this_month: number;
}

export interface IMarketingArticleStats {
  published: number;
  draft: number;
}

export interface IFunnelSummary {
  registered: number;
  verified: number;
  funded: number;
  active: number;
}

export interface ITopReferrer {
  name: string;
  referral_count: number;
}

export interface IMarketingDashboardData {
  campaigns: IMarketingCampaignStats;
  vouchers: IMarketingVoucherStats;
  articles: IMarketingArticleStats;
  funnel_summary: IFunnelSummary;
  top_referrers: ITopReferrer[];
}
