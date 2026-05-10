const DASHBOARD_SERVICES = {
  dashboard: "/dashboard",
};

const BACKOFFICE_DASHBOARD_SERVICES = {
  backofficeDashboard: "/backoffice-dashboard",
};

const FINANCE_DASHBOARD_SERVICES = {
  financeDashboard: "/finance-dashboard",
};

const MARKETING_DASHBOARD_SERVICES = {
  marketingDashboard: "/marketing-dashboard",
};

const BACKOFFICEMEMBERS_SERVICES = {
  backofficeMembers: "/dashboard/backoffice-members",
  backofficeMembersCreate: "/dashboard/backoffice-members/create",
  backofficeMembersEdit: (id: number) =>
    `/dashboard/backoffice-members/${id}/edit`,
};

const CLIENTMEMBERS_SERVICES = {
  clientMembers: "/dashboard/client-members",
  clientMembersCreate: "/dashboard/client-members/create",
  clientMembersEdit: (id: number) => `/dashboard/client-members/${id}/edit`,
};

const MITRAMEMBERS_SERVICES = {
  mitraMembers: "/dashboard/mitra-members",
  mitraMembersShow: (id: number) => `/dashboard/mitra-members/${id}`,
  mitraMembersEdit: (id: number) => `/dashboard/mitra-members/${id}/edit`,
};

const LEADS_SERVICES = {
  leads: "/dashboard/leads",
  leadsCreate: "/dashboard/leads/create",
  leadsEdit: (id: number) => `/dashboard/leads/${id}/edit`,
};

const SALESMEMBERS_SERVICES = {
  salesMembers: "/dashboard/sales-members",
  salesMembersCreate: "/dashboard/sales-members/create",
  salesMembersEdit: (id: number) => `/dashboard/sales-members/${id}/edit`,
};

const NOTIFICATIONS_SERVICES = {
  notifications: "/dashboard/notifications",
};

const SALES_ACTIVITIES_SERVICES = {
  salesActivities: "/sales-activities",
  salesActivitiesCreate: "/sales-activities/create",
  salesActivityDetail: (id: number) => `/sales-activities/${id}`,
};

const ACTIVITY_LOGS_SERVICES = {
  activityLogs: "/dashboard/activity-logs",
  activityLogDetail: (id: number) => `/dashboard/activity-logs/${id}`,
};

const DEPOSIT_REQUESTS_SERVICES = {
  depositRequests: "/dashboard/deposit-requests",
  depositRequestDetail: (id: string) => `/dashboard/deposit-requests/${id}`,
};

const BANNER_SERVICES = {
  banners: "/dashboard/banners",
  bannerCreate: "/dashboard/banners/create",
  bannerEdit: (id: string) => `/dashboard/banners/${id}/edit`,
};

const SERVICE_CATEGORIES_SERVICES = {
  serviceCategories: "/dashboard/service-categories",
  serviceCategoryCreate: "/dashboard/service-categories/create",
  serviceCategoryEdit: (id: number) =>
    `/dashboard/service-categories/${id}/edit`,
};

const VOUCHER_SERVICES = {
  vouchers: "/dashboard/vouchers",
  voucherCreate: "/dashboard/vouchers/create",
  voucherEdit: (id: number) => `/dashboard/vouchers/${id}/edit`,
  voucherDetail: (id: number) => `/dashboard/vouchers/${id}`,
};

const REFERRAL_SERVICES = {
  referralCampaigns: "/dashboard/referral-campaigns",
  referralCampaignCreate: "/dashboard/referral-campaigns/create",
  referralCampaignEdit: (id: number) =>
    `/dashboard/referral-campaigns/${id}/edit`,
  referralCampaignDetail: (id: number) => `/dashboard/referral-campaigns/${id}`,
  referrals: "/dashboard/referrals",
  referralDetail: (id: number) => `/dashboard/referrals/${id}`,
};

const ANALYTICS_SERVICES = {
  analyticsFunnel: "/dashboard/analytics/funnel",
  analyticsSegments: "/dashboard/analytics/segments",
  analyticsEvents: "/dashboard/analytics/events",
};

const EVENT_REGISTRY_SERVICES = {
  eventRegistry: "/dashboard/event-registry",
  eventRegistryCreate: "/dashboard/event-registry/create",
  eventRegistryEdit: (id: number) => `/dashboard/event-registry/${id}/edit`,
};

const POPUP_PROMOTION_SERVICES = {
  popupPromotions: "/dashboard/popup-promotions",
  popupPromotionCreate: "/dashboard/popup-promotions/create",
  popupPromotionEdit: (id: string) => `/dashboard/popup-promotions/${id}/edit`,
  popupPromotionDetail: (id: string) => `/dashboard/popup-promotions/${id}`,
  popupPromotionCompare: (id: string) =>
    `/dashboard/popup-promotions/${id}/compare`,
};

const ARTICLE_SERVICES = {
  articles: "/dashboard/articles",
  articleCreate: "/dashboard/articles/create",
  articleEdit: (id: number) => `/dashboard/articles/${id}/edit`,
  authors: "/dashboard/authors",
  authorCreate: "/dashboard/authors/create",
  authorEdit: (id: number) => `/dashboard/authors/${id}/edit`,
  articleCategories: "/dashboard/article-categories",
  articleCategoryCreate: "/dashboard/article-categories/create",
  articleCategoryEdit: (id: number) =>
    `/dashboard/article-categories/${id}/edit`,
  articleTags: "/dashboard/article-tags",
  articleTagCreate: "/dashboard/article-tags/create",
  articleTagEdit: (id: number) => `/dashboard/article-tags/${id}/edit`,
};

const SALES_DASHBOARD_SERVICES = {
  salesDashboard: "/sales-dashboard",
};

export const PATHS = {
  login: "/login",
  ...DASHBOARD_SERVICES,
  ...BACKOFFICE_DASHBOARD_SERVICES,
  ...FINANCE_DASHBOARD_SERVICES,
  ...MARKETING_DASHBOARD_SERVICES,
  ...SALES_DASHBOARD_SERVICES,
  ...BACKOFFICEMEMBERS_SERVICES,
  ...CLIENTMEMBERS_SERVICES,
  ...MITRAMEMBERS_SERVICES,
  ...LEADS_SERVICES,
  ...SALESMEMBERS_SERVICES,
  ...NOTIFICATIONS_SERVICES,
  ...SALES_ACTIVITIES_SERVICES,
  ...ACTIVITY_LOGS_SERVICES,
  ...DEPOSIT_REQUESTS_SERVICES,
  ...BANNER_SERVICES,
  ...VOUCHER_SERVICES,
  ...REFERRAL_SERVICES,
  ...SERVICE_CATEGORIES_SERVICES,
  ...ANALYTICS_SERVICES,
  ...EVENT_REGISTRY_SERVICES,
  ...POPUP_PROMOTION_SERVICES,
  ...ARTICLE_SERVICES,
};
