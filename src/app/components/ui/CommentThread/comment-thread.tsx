"use client";

import { useEffect, useReducer, useCallback, useRef } from "react";
import { Badge } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import { commentsService } from "@services/shared/comments";
import type { IActivityLogComment } from "@services/shared/comments";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Send, MessageSquare } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface CommentThreadProps {
  activityLogId: number;
  currentUserId: number;
  hasAccess: boolean;
}

interface State {
  comments: IActivityLogComment[];
  isLoading: boolean;
  isSubmitting: boolean;
  body: string;
  error: string | null;
}

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; comments: IActivityLogComment[] }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "SET_BODY"; body: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_SUCCESS"; comment: IActivityLogComment }
  | { type: "SUBMIT_ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, isLoading: false, comments: action.comments };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.error };
    case "SET_BODY":
      return { ...state, body: action.body };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        isSubmitting: false,
        body: "",
        comments: [...state.comments, action.comment],
      };
    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false, error: action.error };
    default:
      return state;
  }
}

const initialState: State = {
  comments: [],
  isLoading: true,
  isSubmitting: false,
  body: "",
  error: null,
};

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getRoleBadgeVariant(
  roleName: string
): "primary" | "tertiary" | "neutral" {
  switch (roleName) {
    case "admin":
      return "primary";
    case "backoffice":
      return "tertiary";
    default:
      return "neutral";
  }
}

function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), {
    addSuffix: true,
    locale: idLocale,
  });
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function CommentThread({
  activityLogId,
  currentUserId,
  hasAccess,
}: CommentThreadProps) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchComments = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const res = await commentsService.list(activityLogId);
      queueMicrotask(() => {
        dispatch({ type: "FETCH_SUCCESS", comments: res.data });
      });
    } catch {
      queueMicrotask(() => {
        dispatch({
          type: "FETCH_ERROR",
          error: "Gagal memuat komentar.",
        });
      });
    }
  }, [activityLogId]);

  useEffect(() => {
    if (hasAccess) {
      fetchComments();
    }
  }, [hasAccess, fetchComments]);

  // Scroll to bottom when new comments arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.comments.length]);

  const handleSubmit = async () => {
    const trimmed = state.body.trim();
    if (!trimmed || state.isSubmitting) return;

    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await commentsService.create(activityLogId, {
        body: trimmed,
      });
      queueMicrotask(() => {
        dispatch({ type: "SUBMIT_SUCCESS", comment: res.data });
      });
    } catch {
      queueMicrotask(() => {
        dispatch({
          type: "SUBMIT_ERROR",
          error: "Gagal mengirim komentar.",
        });
      });
    }
  };

  if (!hasAccess) return null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-text-muted" />
        <h3 className="text-sm font-semibold text-text-main">Komentar</h3>
        {state.comments.length > 0 && (
          <span className="text-xs text-text-muted">
            ({state.comments.length})
          </span>
        )}
      </div>

      {/* Comment List */}
      {state.isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-neutral-200 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-neutral-200 rounded" />
                <div className="h-4 w-full bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : state.comments.length === 0 ? (
        <p className="text-sm text-text-muted py-4 text-center">
          Belum ada komentar.
        </p>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {state.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isCurrentUser={comment.user_id === currentUserId}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Error */}
      {state.error && <p className="text-xs text-error-600">{state.error}</p>}

      {/* Input Form */}
      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <FormInput
            as="textarea"
            label=""
            id="comment-body"
            placeholder="Tulis komentar..."
            value={state.body}
            onChange={(e) =>
              dispatch({ type: "SET_BODY", body: e.target.value })
            }
          />
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!state.body.trim() || state.isSubmitting}
          className="shrink-0 gap-1.5 mb-1"
        >
          <Send size={14} />
          {state.isSubmitting ? "Mengirim..." : "Kirim"}
        </Button>
      </div>
    </div>
  );
}

// ─── Comment Item ───────────────────────────────────────────────────────────────

function CommentItem({
  comment,
  isCurrentUser,
}: {
  comment: IActivityLogComment;
  isCurrentUser: boolean;
}) {
  const initial = comment.user.name.charAt(0).toUpperCase();
  const roleName = comment.user.role?.name ?? "user";

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
          isCurrentUser
            ? "bg-primary-100 text-primary-700"
            : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-text-main">
            {comment.user.name}
          </span>
          <Badge variant={getRoleBadgeVariant(roleName)} showDot={false}>
            {roleName}
          </Badge>
          <span className="text-xs text-text-muted">
            {formatRelative(comment.created_at)}
          </span>
        </div>
        <p className="text-sm text-text-main mt-1 whitespace-pre-wrap">
          {comment.body}
        </p>
      </div>
    </div>
  );
}
