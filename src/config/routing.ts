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

export const PATHS = {
  login: "/login",
  ...DASHBOARD_SERVICES,
  ...BACKOFFICEMEMBERS_SERVICES,
  ...CLIENTMEMBERS_SERVICES,
  ...MITRAMEMBERS_SERVICES,
  ...LEADS_SERVICES,
};
