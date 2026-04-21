const DASHBOARD_SERVICES = {
  dashboard: "/dashboard",
};

const BACKOFFICEMEMBERS_SERVICES = {
  backofficeMembers: "/dashboard/backoffice-members",
  backofficeMembersCreate: "/dashboard/backoffice-members/create",
  backofficeMembersEdit: (id: number) =>
    `/dashboard/backoffice-members/${id}/edit`,
};

export const PATHS = {
  login: "/login",
  ...DASHBOARD_SERVICES,
  ...BACKOFFICEMEMBERS_SERVICES,
};
