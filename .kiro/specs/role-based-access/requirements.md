# Requirements: Role-Based Access Control & Per-Role Dashboards

## 1. Functional Requirements

### 1.1 New Roles

- The system must support 5 backoffice-type roles: Admin, Backoffice, Finance, Marketing, Sales
- Finance and Marketing are new roles added to the backend Role model and database seeder

### 1.2 Backend Route Protection

- Backend API routes must be split into domain-specific sub-groups with per-role middleware
- Each sub-group only allows access to the roles specified in its middleware
- Admin has access to all backoffice sub-groups
- Sales routes remain fully isolated (role:sales only, admin cannot access)

### 1.3 Per-Role Dashboards

- Each role has a dedicated dashboard URL:
  - Admin: `/dashboard` (existing, unchanged)
  - Backoffice: `/backoffice-dashboard` (new)
  - Finance: `/finance-dashboard` (new)
  - Marketing: `/marketing-dashboard` (new)
  - Sales: `/sales-dashboard` (existing, unchanged)
- Each dashboard displays data relevant to that role's responsibilities

### 1.4 Sidebar Navigation

- Each role sees only the nav groups relevant to their modules
- Admin sees all groups
- Backoffice sees: User Management, Sales Management, Master Data
- Finance sees: Finance
- Marketing sees: Marketing, Analytics
- Sales sees: Sales Dashboard, Activity Report (unchanged)

### 1.5 Middleware Routing

- Frontend middleware redirects users to their default dashboard on login
- Users cannot access dashboards or pages outside their allowed paths
- Unauthorized page access redirects to the user's default dashboard (no error page)
- Admin can access all dashboards except Sales

## 2. Non-Functional Requirements

### 2.1 Backward Compatibility

- Existing Admin dashboard content must not change
- Existing Sales dashboard and routes must not change
- All existing feature pages continue to work — only access restrictions change

### 2.2 Security

- Backend must return 403 for unauthorized API access (existing CheckRole middleware behavior)
- Frontend middleware provides UX-level protection (redirect), backend provides security-level protection (403)

### 2.3 Performance

- No additional API calls for role checking — role is already in cookie from login flow
- Dashboard APIs should be lightweight aggregation queries
