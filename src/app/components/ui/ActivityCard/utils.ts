import { FileText, UserPlus, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  ActivityLogType,
  ActivityLogStatus,
} from "@services/sales/activity-logs";

// ─── Relative Time ──────────────────────────────────────────────────────────────

/**
 * Konversi ISO 8601 timestamp ke format waktu relatif Bahasa Indonesia.
 *
 * - < 1 menit  → "Baru saja"
 * - < 60 menit → "X menit lalu"
 * - < 24 jam   → "X jam lalu"
 * - < 7 hari   → "X hari lalu"
 * - < 30 hari  → "X minggu lalu"
 * - ≥ 30 hari  → "X bulan lalu"
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMinutes < 1) return "Baru saja";
  if (diffMinutes < 60) return `${diffMinutes} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${diffWeeks} minggu lalu`;
  return `${diffMonths} bulan lalu`;
}

// ─── Activity Type Config ───────────────────────────────────────────────────────

interface ActivityTypeConfig {
  icon: LucideIcon;
  label: string;
  bgColor: string;
  iconColor: string;
}

const ACTIVITY_TYPE_MAP: Record<ActivityLogType, ActivityTypeConfig> = {
  general_note: {
    icon: FileText,
    label: "General Note",
    bgColor: "bg-tertiary-50",
    iconColor: "text-tertiary-600",
  },
  request_lead_assign: {
    icon: UserPlus,
    label: "Request Lead Assign",
    bgColor: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  request_update_lead_status: {
    icon: RefreshCw,
    label: "Request Update Status",
    bgColor: "bg-warning-50",
    iconColor: "text-warning-600",
  },
};

/** Return icon, label, and color config for a given activity log type. */
export function getActivityTypeConfig(
  type: ActivityLogType
): ActivityTypeConfig {
  return ACTIVITY_TYPE_MAP[type];
}

// ─── Status Badge Config ────────────────────────────────────────────────────────

interface StatusBadgeConfig {
  label: string;
  variant: "warning" | "success" | "error";
}

const STATUS_BADGE_MAP: Record<ActivityLogStatus, StatusBadgeConfig> = {
  pending: { label: "Pending", variant: "warning" },
  approved: { label: "Approved", variant: "success" },
  rejected: { label: "Rejected", variant: "error" },
};

/** Return label and Badge variant for a given activity log status. */
export function getStatusBadgeConfig(
  status: ActivityLogStatus
): StatusBadgeConfig {
  return STATUS_BADGE_MAP[status];
}
