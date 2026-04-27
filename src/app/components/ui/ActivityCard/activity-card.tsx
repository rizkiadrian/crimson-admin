"use client";

import { useState } from "react";
import Link from "next/link";
import type { IActivityLog } from "@services/sales/activity-logs";
import { Badge } from "@app/components/ui/Table";
import {
  formatRelativeTime,
  getActivityTypeConfig,
  getStatusBadgeConfig,
} from "./utils";
import { getFileIconConfig } from "./activity-card-file-icons";

// ─── ActivityCard ───────────────────────────────────────────────────────────────

interface ActivityCardProps {
  activity: IActivityLog;
  /** If true, wraps the card in a Link to the detail page. Defaults to false. */
  linkToDetail?: boolean;
  /** Base path for the detail link. Defaults to "/sales-activities". */
  detailBasePath?: string;
}

/**
 * Single activity item card for timeline views.
 *
 * Displays a type icon, title, status badge, optional lead name,
 * truncated description, attachment preview, and relative timestamp.
 */
export function ActivityCard({
  activity,
  linkToDetail = false,
  detailBasePath = "/sales-activities",
}: ActivityCardProps) {
  const typeConfig = getActivityTypeConfig(activity.type);
  const statusConfig = getStatusBadgeConfig(activity.status);
  const Icon = typeConfig.icon;

  const content = (
    <div className="flex gap-3">
      {/* Type Icon */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center ${typeConfig.bgColor}`}
        >
          <Icon size={18} className={typeConfig.iconColor} />
        </div>
        {/* Vertical connector line */}
        <div className="w-px flex-1 bg-border-subtle mt-2" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-6">
        {/* Title */}
        <p className="text-sm font-semibold text-text-main leading-snug">
          {activity.title}
        </p>

        {/* Status Badge + Lead Name */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {activity.lead && (
            <span className="text-xs text-text-muted">
              Lead: {activity.lead.name}
            </span>
          )}
        </div>

        {/* Description (truncated) */}
        {activity.description && (
          <p className="text-xs text-text-muted mt-1.5 line-clamp-2">
            {activity.description}
          </p>
        )}

        {/* Attachment Preview */}
        <AttachmentPreview activity={activity} isInsideLink={linkToDetail} />

        {/* Relative Time */}
        <p className="text-xs text-text-muted/70 mt-1.5">
          {formatRelativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  );

  if (linkToDetail) {
    return (
      <Link
        href={`${detailBasePath}/${activity.id}`}
        className="block hover:bg-neutral-50/50 rounded-lg transition-colors -mx-2 px-2 py-1"
      >
        {content}
      </Link>
    );
  }

  return content;
}

// ─── Attachment Preview ─────────────────────────────────────────────────────────

function AttachmentPreview({
  activity,
  isInsideLink = false,
}: {
  activity: IActivityLog;
  isInsideLink?: boolean;
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // No attachment — render nothing
  if (!activity.attachment_type) return null;

  /**
   * When the card is wrapped in a Link, we can't nest <a> tags.
   * Use a <span> with onClick + stopPropagation to open in new tab instead.
   */
  const handleAttachmentClick = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // Image attachment with thumbnail
  if (
    activity.attachment_type === "image" &&
    activity.thumbnail_url &&
    !hasError
  ) {
    const url = activity.attachment_url ?? "#";

    if (isInsideLink) {
      return (
        <div className="mt-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => handleAttachmentClick(e, url)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                window.open(url, "_blank", "noopener,noreferrer");
              }
            }}
            className="cursor-pointer inline-block"
          >
            {isLoading && (
              <div className="w-[120px] h-[80px] rounded-lg bg-gray-200 animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activity.thumbnail_url}
              alt={activity.title}
              className={`max-w-[120px] h-auto rounded-lg object-cover ${
                isLoading ? "hidden" : "block"
              }`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </span>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <a href={url} target="_blank" rel="noopener noreferrer">
          {isLoading && (
            <div className="w-[120px] h-[80px] rounded-lg bg-gray-200 animate-pulse" />
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activity.thumbnail_url}
            alt={activity.title}
            className={`max-w-[120px] h-auto rounded-lg object-cover ${
              isLoading ? "hidden" : "block"
            }`}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </a>
      </div>
    );
  }

  // File attachment (non-image, or image with error/no thumbnail)
  if (activity.attachment_url) {
    return (
      <FileIconBadge
        attachmentUrl={activity.attachment_url}
        isInsideLink={isInsideLink}
      />
    );
  }

  return null;
}

// ─── File Icon Badge ────────────────────────────────────────────────────────────

function FileIconBadge({
  attachmentUrl,
  isInsideLink = false,
}: {
  attachmentUrl: string;
  isInsideLink?: boolean;
}) {
  const config = getFileIconConfig(attachmentUrl);
  const FileIcon = config.icon;

  const content = (
    <>
      <div
        className={`w-7 h-7 rounded flex items-center justify-center ${config.bgColor}`}
      >
        <FileIcon size={14} className={config.iconColor} />
      </div>
      <span className="text-xs font-medium text-text-muted">
        {config.label}
      </span>
    </>
  );

  if (isInsideLink) {
    return (
      <div className="mt-2">
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(attachmentUrl, "_blank", "noopener,noreferrer");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              window.open(attachmentUrl, "_blank", "noopener,noreferrer");
            }
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-subtle hover:bg-gray-50 transition-colors"
      >
        {content}
      </a>
    </div>
  );
}
