"use client";

import { useState } from "react";
import { Badge } from "@app/components/ui/Table";
import { Button } from "@app/components/ui/Button";
import { FormInput } from "@app/components/ui/FormInput";
import { Send, MessageSquare } from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

interface MockComment {
  id: number;
  user: { name: string; role: string };
  body: string;
  isCurrentUser: boolean;
  timeAgo: string;
}

const MOCK_COMMENTS: MockComment[] = [
  {
    id: 1,
    user: { name: "Admin Lingkar", role: "admin" },
    body: "Tolong lengkapi data lead sebelum request assign.",
    isCurrentUser: false,
    timeAgo: "2 jam lalu",
  },
  {
    id: 2,
    user: { name: "Sales User", role: "sales" },
    body: "Sudah saya update datanya. Mohon dicek kembali.",
    isCurrentUser: true,
    timeAgo: "1 jam lalu",
  },
  {
    id: 3,
    user: { name: "Backoffice Staff", role: "backoffice" },
    body: "Data sudah lengkap, akan segera diproses.",
    isCurrentUser: false,
    timeAgo: "30 menit lalu",
  },
];

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

// ─── Showcase ───────────────────────────────────────────────────────────────────

/**
 * Showcase for the CommentThread component.
 * Uses mock data to demonstrate the comment list, role badges, and input form.
 */
export function CommentThreadShowcase() {
  const [comments, setComments] = useState<MockComment[]>(MOCK_COMMENTS);
  const [body, setBody] = useState("");

  const handleSubmit = () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    setComments((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        user: { name: "You (Demo)", role: "sales" },
        body: trimmed,
        isCurrentUser: true,
        timeAgo: "Baru saja",
      },
    ]);
    setBody("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* With Comments */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
          With Comments (Interactive)
        </p>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-text-muted" />
            <h3 className="text-sm font-semibold text-text-main">Komentar</h3>
            <span className="text-xs text-text-muted">({comments.length})</span>
          </div>

          {/* Comment List */}
          <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    comment.isCurrentUser
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {comment.user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-text-main">
                      {comment.user.name}
                    </span>
                    <Badge
                      variant={getRoleBadgeVariant(comment.user.role)}
                      showDot={false}
                    >
                      {comment.user.role}
                    </Badge>
                    <span className="text-xs text-text-muted">
                      {comment.timeAgo}
                    </span>
                  </div>
                  <p className="text-sm text-text-main mt-1 whitespace-pre-wrap">
                    {comment.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <FormInput
                as="textarea"
                label=""
                id="showcase-comment"
                placeholder="Tulis komentar..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                hideLabel
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
              disabled={!body.trim()}
              className="shrink-0 gap-1.5 mb-1"
            >
              <Send size={14} />
              Kirim
            </Button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
          Empty State
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-text-muted" />
            <h3 className="text-sm font-semibold text-text-main">Komentar</h3>
          </div>
          <p className="text-sm text-text-muted py-4 text-center">
            Belum ada komentar.
          </p>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <FormInput
                as="textarea"
                label=""
                id="showcase-comment-empty"
                placeholder="Tulis komentar..."
                value=""
                onChange={() => {}}
                hideLabel
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              disabled
              className="shrink-0 gap-1.5 mb-1"
            >
              <Send size={14} />
              Kirim
            </Button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
          Loading State
        </p>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-text-muted" />
            <h3 className="text-sm font-semibold text-text-main">Komentar</h3>
          </div>
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
        </div>
      </div>

      {/* Role Badge Variants */}
      <div className="bg-bg-card rounded-2xl border border-border-subtle p-6">
        <p className="text-xs text-neutral-500 uppercase font-bold tracking-widest mb-4">
          Role Badge Variants
        </p>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="primary" showDot={false}>
              admin
            </Badge>
            <span className="text-sm text-text-muted">
              → Primary (red) badge
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="tertiary" showDot={false}>
              backoffice
            </Badge>
            <span className="text-sm text-text-muted">
              → Tertiary (blue) badge
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="neutral" showDot={false}>
              sales
            </Badge>
            <span className="text-sm text-text-muted">
              → Neutral (gray) badge
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
