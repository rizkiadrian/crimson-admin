# Requirements Document: User Journey Funnel

## Introduction

User Journey Funnel is an in-house analytics system for the Lingkar ID platform that tracks user lifecycle events, manages user journey stages via a state machine, and provides backoffice CRM pages for funnel visualization, user segmentation, and event log browsing. The system enables backoffice operators to understand user conversion rates, identify drop-off points, and segment users by their lifecycle stage.

The feature spans two workspaces: the Laravel backend (`lingkar-id-backend`) for event tracking, journey stage management, and analytics API endpoints; and the Next.js CRM (`lingkar-crm`) for the backoffice analytics dashboard pages. The mobile app (`LingkarIdApp`) is explicitly out of scope for this spec — only a future-use event ingestion endpoint is provided.

## Glossary

- **Event_Tracking_Service**: The Laravel service class responsible for recording user lifecycle events and triggering journey stage transitions. Provides two methods: `trackEvent()` for synchronous direct writes (lifecycle events) and `trackEventAsync()` for queue-based writes via Redis (high-frequency mobile events)
- **TrackUserEvent_Job**: A Laravel queue job dispatched by `trackEventAsync()` to the Redis queue, processed by the existing worker container (`laravel-worker` running `php artisan queue:work redis`). Calls `trackEvent()` internally when processed
- **User_Event**: A database record representing a single tracked user action (e.g., user_registered, email_verified, first_deposit) with user_id, event_type, timestamp, and metadata (JSON)
- **Journey_Stage**: A denormalized column on the users table representing the user's current lifecycle stage (registered, verified, funded, active, dormant, churned)
- **Journey_Stage_Machine**: The logic within Event_Tracking_Service that determines stage transitions based on incoming events and time-based rules
- **Analytics_API**: The set of Laravel backoffice API endpoints for funnel stats, trends, segments, and event logs
- **Funnel_Overview_Page**: The Next.js CRM page displaying funnel visualization, conversion rates, period comparison, and trend lines
- **User_Segments_Page**: The Next.js CRM page displaying users grouped by journey stage with drill-down and CSV export
- **Event_Log_Page**: The Next.js CRM page displaying a raw event browser for debugging and analysis
- **Event_Ingestion_Endpoint**: A public API endpoint for the mobile app to send tracked events (future use). Uses `trackEventAsync()` to dispatch events to Redis queue
- **Dormancy_Scheduler**: A scheduled Laravel command that transitions users to dormant (30 days inactive) or churned (90 days inactive) stages
- **Backoffice_User**: A user with role Admin or Backoffice who has access to the analytics endpoints

## Requirements

### Requirement 1: User Events Table and Model

**User Story:** As a developer, I want a user_events table and model to persist tracked lifecycle events, so that the system has a complete audit trail of user actions.

#### Acceptance Criteria

1. THE database migration SHALL create a user_events table with columns: id (bigIncrements), user_id (foreignId constrained to users, cascadeOnDelete), event_type (string, indexed), metadata (json, nullable), created_at (timestamp, indexed)
2. THE User_Event model SHALL define fillable fields: user_id, event_type, metadata
3. THE User_Event model SHALL define a belongsTo relationship to User
4. THE User_Event model SHALL define constants for core event types: TYPE_USER_REGISTERED, TYPE_EMAIL_VERIFIED, TYPE_FIRST_DEPOSIT, TYPE_FIRST_TRANSACTION, TYPE_APP_OPENED, TYPE_BANNER_CLICKED, TYPE_SERVICE_VIEWED
5. THE User_Event model SHALL define a scopeOfType query scope that filters by event_type
6. THE User_Event model SHALL define a scopeForUser query scope that filters by user_id
7. THE User_Event model SHALL define a scopeInDateRange query scope that filters by created_at between two dates

### Requirement 2: Journey Stage on Users Table

**User Story:** As a developer, I want a journey_stage column on the users table for query performance, so that user segmentation queries do not require event aggregation.

#### Acceptance Criteria

1. THE database migration SHALL add a journey_stage column (string, nullable, default "registered", indexed) to the users table
2. THE User model SHALL include journey_stage in the fillable array
3. THE User model SHALL define a scopeInStage query scope that filters users by journey_stage value
4. THE journey_stage column SHALL accept only valid stage values: registered, verified, funded, active, dormant, churned

### Requirement 3: Event Tracking Service

**User Story:** As a developer, I want a centralized service for recording events and triggering stage transitions, so that all event tracking logic is encapsulated in one place.

#### Acceptance Criteria

1. THE Event_Tracking_Service SHALL provide a `trackEvent` method (synchronous direct write) that accepts user_id, event_type, and optional metadata, creates a User_Event record, and evaluates stage transitions. This method is used for lifecycle events (user_registered, email_verified, first_deposit, first_transaction) that are low-volume and must be transactional with the triggering action
2. THE Event_Tracking_Service SHALL provide a `trackEventAsync` method (queue-based write) that accepts user_id, event_type, and optional metadata, and dispatches a TrackUserEvent_Job to the Redis queue. This method is used for high-frequency events from mobile (app_opened, banner_clicked, service_viewed)
3. THE TrackUserEvent_Job SHALL implement ShouldQueue, explicitly use the Redis queue connection (`$connection = 'redis'`), and call `trackEvent()` internally when processed by the existing worker container
4. WHEN a user_registered event is tracked, THE Journey_Stage_Machine SHALL set the user journey_stage to "registered"
5. WHEN an email_verified event is tracked, THE Journey_Stage_Machine SHALL transition the user journey_stage from "registered" to "verified"
6. WHEN a first_deposit event is tracked, THE Journey_Stage_Machine SHALL transition the user journey_stage from "verified" to "funded"
7. WHEN a first_transaction event is tracked, THE Journey_Stage_Machine SHALL transition the user journey_stage from "funded" to "active"
8. THE Event_Tracking_Service SHALL only advance the journey_stage forward (registered → verified → funded → active) and never regress it due to a lifecycle event
9. WHEN a lifecycle event is tracked for a user in "dormant" or "churned" stage, THE Journey_Stage_Machine SHALL transition the user journey_stage back to "active"

### Requirement 4: Auto-Tracking from Existing System Events

**User Story:** As a developer, I want existing system actions (registration, email verification, deposit approval) to automatically track events, so that no manual integration is needed for core lifecycle events.

#### Acceptance Criteria

1. WHEN a new client user is registered via the AuthController register endpoint, THE Event_Tracking_Service SHALL automatically track a user_registered event
2. WHEN a new mitra user is registered via the MitraController register endpoint, THE Event_Tracking_Service SHALL automatically track a user_registered event
3. WHEN a user completes email verification via the AuthController verify endpoint, THE Event_Tracking_Service SHALL automatically track an email_verified event
4. WHEN a deposit request is approved via the BackofficeDepositService, THE Event_Tracking_Service SHALL automatically track a first_deposit event if the user has no prior first_deposit event
5. THE auto-tracking integration SHALL use service method calls (`trackEvent()` synchronous direct write) within existing service classes without modifying controller logic. Lifecycle events use direct write to maintain transactional consistency with the triggering action

### Requirement 5: Dormancy and Churn Scheduler

**User Story:** As a platform operator, I want users to be automatically marked as dormant after 30 days of inactivity and churned after 90 days, so that user segments reflect actual engagement.

#### Acceptance Criteria

1. THE Dormancy_Scheduler SHALL run daily as a scheduled Laravel command
2. WHEN a user in "active" or "funded" or "verified" stage has no User_Event records in the last 30 days, THE Dormancy_Scheduler SHALL transition the user journey_stage to "dormant"
3. WHEN a user in "dormant" stage has no User_Event records in the last 90 days (from their most recent event), THE Dormancy_Scheduler SHALL transition the user journey_stage to "churned"
4. THE Dormancy_Scheduler SHALL only evaluate users with role Client or Mitra (not Admin, Backoffice, or Sales users)
5. THE Dormancy_Scheduler SHALL log the number of users transitioned in each run

### Requirement 6: Event Ingestion API Endpoint

**User Story:** As a mobile app developer, I want an API endpoint to send tracked events from the mobile app, so that client-side actions can be recorded in the analytics system.

#### Acceptance Criteria

1. THE Event_Ingestion_Endpoint SHALL accept POST requests at /api/v1/events/track with body: event_type (required string), metadata (optional JSON object)
2. THE Event_Ingestion_Endpoint SHALL require authentication via auth:sanctum middleware
3. THE Event_Ingestion_Endpoint SHALL use the authenticated user's ID as the user_id and call `trackEventAsync()` (queue-based write via Redis) since mobile events are high-frequency
4. THE Event_Ingestion_Endpoint SHALL validate that event_type is a non-empty string with max 50 characters
5. THE Event_Ingestion_Endpoint SHALL return a standard ApiResponse success response with the created event data
6. IF the event_type is not in the allowed list of trackable event types, THEN THE Event_Ingestion_Endpoint SHALL return a 422 validation error

### Requirement 7: Funnel Analytics API

**User Story:** As a backoffice user, I want API endpoints that return funnel statistics and trend data, so that the CRM dashboard can visualize conversion rates and stage progression.

#### Acceptance Criteria

1. THE Analytics_API SHALL provide a GET /backoffice/analytics/funnel endpoint that returns user counts per journey stage and conversion rates between consecutive stages
2. WHEN a period filter parameter is provided (7d, 30d, 90d, or custom date range), THE Analytics_API SHALL calculate funnel stats based on users who entered each stage within the specified period
3. THE Analytics_API SHALL calculate conversion rates as the percentage of users who progressed from one stage to the next (e.g., verified_count / registered_count)
4. THE Analytics_API SHALL provide a GET /backoffice/analytics/funnel/trends endpoint that returns daily or weekly user counts per stage over the specified period
5. THE Analytics_API SHALL include average time spent in each stage (in hours) before converting to the next stage
6. THE Analytics_API SHALL require authentication and the role:admin,backoffice middleware
7. THE Analytics_API SHALL return responses in the standard ApiResponse format

### Requirement 8: User Segments API

**User Story:** As a backoffice user, I want API endpoints to retrieve users grouped by journey stage with filtering and export capabilities, so that I can analyze and act on user segments.

#### Acceptance Criteria

1. THE Analytics_API SHALL provide a GET /backoffice/analytics/segments endpoint that returns user counts per journey stage
2. THE Analytics_API SHALL provide a GET /backoffice/analytics/segments/{stage} endpoint that returns a paginated list of users in the specified stage
3. WHEN filter parameters are provided (registration_date_from, registration_date_to, last_active_from, last_active_to), THE Analytics_API SHALL filter the user list accordingly
4. THE Analytics_API SHALL provide a GET /backoffice/analytics/segments/export endpoint that returns a CSV file of users filtered by stage and optional date filters
5. THE paginated user list SHALL include: user id, name, email, phone, journey_stage, created_at (registration date), and last event timestamp
6. IF an invalid stage value is provided, THEN THE Analytics_API SHALL return a 422 validation error

### Requirement 9: Event Log API

**User Story:** As a backoffice user, I want an API endpoint to browse raw tracked events with filtering, so that I can debug user journeys and perform deep analysis.

#### Acceptance Criteria

1. THE Analytics_API SHALL provide a GET /backoffice/analytics/events endpoint that returns a paginated list of user events ordered by created_at descending
2. WHEN an event_type filter parameter is provided, THE Analytics_API SHALL return only events matching the specified type
3. WHEN a user_id filter parameter is provided, THE Analytics_API SHALL return only events for the specified user
4. WHEN date range filter parameters are provided (date_from, date_to), THE Analytics_API SHALL return only events within the specified range
5. WHEN a search parameter is provided, THE Analytics_API SHALL filter events by user name or email using case-insensitive matching
6. THE event list response SHALL include: event id, user (id, name, email), event_type, metadata, created_at
7. THE Analytics_API SHALL use the standard ApiResponse format with pagination metadata

### Requirement 10: Funnel Overview Page (Frontend)

**User Story:** As a backoffice user, I want a CRM page that visualizes the user journey funnel with conversion rates and trends, so that I can monitor user progression and identify drop-off points.

#### Acceptance Criteria

1. THE Funnel_Overview_Page SHALL display a funnel visualization chart showing the stages: Registration → Verified → Funded → Active, with user counts per stage and conversion rate percentages between stages
2. THE Funnel_Overview_Page SHALL provide period filter controls (7d, 30d, 90d, custom date range) that update the funnel data
3. THE Funnel_Overview_Page SHALL display trend lines showing user counts per stage over time using the ChartCard and line chart components with CHART_COLORS from chart-colors.ts
4. THE Funnel_Overview_Page SHALL display average time spent in each stage before converting (formatted in human-readable units)
5. THE Funnel_Overview_Page SHALL synchronize the selected period filter with URL query parameters
6. THE Funnel_Overview_Page SHALL be accessible at the route /dashboard/analytics/funnel
7. THE Funnel_Overview_Page SHALL use the service layer pattern with typed service functions (no direct API calls from components)

### Requirement 11: Dashboard Funnel Widget

**User Story:** As a backoffice user, I want a summary widget on the main dashboard showing key funnel metrics, so that I can see conversion health at a glance.

#### Acceptance Criteria

1. THE Dashboard_Widget SHALL display a StatCard on the backoffice dashboard page showing total active users count
2. THE Dashboard_Widget SHALL include a description showing the overall registration-to-active conversion rate percentage
3. THE DashboardService SHALL include a journey summary in the dashboard response containing total users per stage and the overall conversion rate

### Requirement 12: User Segments Page (Frontend)

**User Story:** As a backoffice user, I want a CRM page that shows users grouped by journey stage with drill-down capability and CSV export, so that I can analyze and target specific user segments.

#### Acceptance Criteria

1. THE User_Segments_Page SHALL display a summary view showing user counts per journey stage as clickable cards or segments
2. WHEN a stage is clicked, THE User_Segments_Page SHALL display a paginated table of users in that stage using the TableCard component
3. THE user table SHALL display columns: Name, Email, Phone, Registration Date, Last Active (last event timestamp)
4. THE User_Segments_Page SHALL provide filter controls: registration date range, last active date range
5. THE User_Segments_Page SHALL provide a CSV export button that downloads the filtered user list
6. THE User_Segments_Page SHALL synchronize pagination, selected stage, and filters with URL query parameters
7. THE User_Segments_Page SHALL be accessible at the route /dashboard/analytics/segments
8. THE User_Segments_Page SHALL use the service layer pattern with typed service functions

### Requirement 13: Event Log Page (Frontend)

**User Story:** As a backoffice user, I want a CRM page that displays raw tracked events in a searchable, filterable table, so that I can debug user journeys and perform deep analysis.

#### Acceptance Criteria

1. THE Event_Log_Page SHALL display a paginated table using the TableCard component with columns: User (name), Event Type (badge), Timestamp, Metadata (truncated JSON preview)
2. THE Event_Log_Page SHALL provide a SearchInput for searching by user name or email
3. THE Event_Log_Page SHALL provide filter controls: event type dropdown, date range picker
4. THE Event_Log_Page SHALL synchronize pagination, search, and filters with URL query parameters using the useTableData hook
5. THE Event_Log_Page SHALL be accessible at the route /dashboard/analytics/events
6. THE Event_Log_Page SHALL use the service layer pattern with typed service functions

### Requirement 14: Analytics Sidebar Navigation

**User Story:** As a backoffice user, I want an "Analytics" navigation group in the sidebar, so that I can access funnel, segments, and event log pages.

#### Acceptance Criteria

1. THE sidebar navigation SHALL include a new "Analytics" accordion group for backoffice users
2. THE Analytics group SHALL contain menu items: "Funnel Overview" (linking to /dashboard/analytics/funnel), "User Segments" (linking to /dashboard/analytics/segments), "Event Log" (linking to /dashboard/analytics/events)
3. THE Analytics group SHALL use an appropriate icon from lucide-react (e.g., BarChart3 or TrendingUp)
4. THE routing configuration SHALL define paths for analyticsFunnel, analyticsSegments, and analyticsEvents in the centralized PATHS object

### Requirement 15: Frontend Service Layer for Analytics

**User Story:** As a developer, I want typed service functions and interfaces for the analytics API endpoints, so that frontend components have type-safe API access.

#### Acceptance Criteria

1. THE service layer SHALL define TypeScript interfaces for: IFunnelStats (stage counts, conversion rates, average time per stage), IFunnelTrends (daily/weekly stage counts over time), ISegmentSummary (counts per stage), ISegmentUser (user with last_event_at), IUserEvent (with user relation), and parameter interfaces for each endpoint
2. THE service layer SHALL provide functions for: getFunnelStats(params), getFunnelTrends(params), getSegmentSummary(), getSegmentUsers(stage, params), exportSegmentCsv(params), getEventLog(params)
3. THE service layer SHALL follow the existing service pattern with barrel exports from an index.ts file
4. THE service layer SHALL be located at src/services/backoffice/analytics/

### Requirement 16: Event Tracking Integration Points

**User Story:** As a developer, I want clear integration points in existing services where event tracking is triggered, so that the system automatically captures lifecycle events without modifying controllers.

#### Acceptance Criteria

1. THE RegisterService SHALL call Event_Tracking_Service.trackEvent after successful user creation with event_type "user_registered" and metadata containing the registration source (client or mitra)
2. THE VerifyEmailService SHALL call Event_Tracking_Service.trackEvent after successful email verification with event_type "email_verified"
3. THE BackofficeDepositService SHALL call Event_Tracking_Service.trackEvent after successful deposit approval with event_type "first_deposit" (only if user has no prior first_deposit event) and metadata containing the deposit amount
4. THE Event_Tracking_Service.trackEvent method SHALL be called within the same database transaction as the triggering action when applicable (e.g., deposit approval)
