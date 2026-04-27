/** Single comment on an activity log */
export interface IActivityLogComment {
  id: number;
  activity_log_id: number;
  user_id: number;
  body: string;
  user: {
    id: number;
    name: string;
    role: { id: number; name: string };
  };
  created_at: string;
  updated_at: string;
}

/** Payload for creating a new comment */
export interface ICreateCommentPayload {
  body: string;
}
