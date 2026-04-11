const DASHBOARD_SERVICES = {
  dashboard: "/dashboard",
};

const BACKOFFICEMEMBERS_SERVICES = {
  backofficeMembers: "/dashboard/backoffice-members",
};

export const PATHS = {
  login: "/login",
  ...DASHBOARD_SERVICES,
  ...BACKOFFICEMEMBERS_SERVICES,
};
