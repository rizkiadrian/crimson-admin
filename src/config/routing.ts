const DASHBOARD_SERVICES = {
  dashboard: "/dashboard",
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

const SALES_DASHBOARD_SERVICES = {
  salesDashboard: "/sales-dashboard",
};

export const PATHS = {
  login: "/login",
  ...DASHBOARD_SERVICES,
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
};
