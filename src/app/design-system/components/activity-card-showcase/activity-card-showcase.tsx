"use client";

import React from "react";
import { Text } from "@app/components/ui/Text";
import { ActivityCard } from "@app/components/ui/ActivityCard";
import { ActivityCardSkeleton } from "@app/components/ui/ActivityCard";
import { ActivityTimeline } from "@app/(dashboard)/sales-activities/_partials/activity-timeline";
import type { IActivityLog } from "@services/sales/activity-logs";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const now = new Date();

function minutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

const MOCK_ACTIVITIES: IActivityLog[] = [
  {
    id: 1,
    user_id: 5,
    lead_id: 12,
    type: "general_note",
    title: "Follow up call with PT Maju Jaya",
    description:
      "Discussed pricing options and timeline for the new project. Client is interested in the premium package.",
    attachment: null,
    attachment_url: null,
    thumbnail_url: null,
    attachment_type: null,
    status: "approved",
    metadata: null,
    lead: { id: 12, name: "PT Maju Jaya", lead_id: "LD-00012" },
    created_at: minutesAgo(15),
    updated_at: minutesAgo(15),
  },
  {
    id: 2,
    user_id: 5,
    lead_id: 8,
    type: "request_lead_assign",
    title: "Request assign lead CV Teknologi Nusantara",
    description:
      "Requesting assignment of this lead based on regional coverage.",
    attachment: null,
    attachment_url: null,
    thumbnail_url: null,
    attachment_type: null,
    status: "pending",
    metadata: null,
    lead: { id: 8, name: "CV Teknologi Nusantara", lead_id: "LD-00008" },
    created_at: minutesAgo(120),
    updated_at: minutesAgo(120),
  },
  {
    id: 3,
    user_id: 5,
    lead_id: 3,
    type: "request_update_lead_status",
    title: "Update status lead PT Sentosa Abadi ke Qualified",
    description: null,
    attachment: null,
    attachment_url: null,
    thumbnail_url: null,
    attachment_type: null,
    status: "rejected",
    metadata: null,
    lead: { id: 3, name: "PT Sentosa Abadi", lead_id: "LD-00003" },
    created_at: minutesAgo(1440),
    updated_at: minutesAgo(1440),
  },
  {
    id: 4,
    user_id: 5,
    lead_id: null,
    type: "general_note",
    title: "Weekly sales report submitted",
    description:
      "Submitted weekly report covering 5 client meetings and 3 new prospects identified.",
    attachment: "sales/activity-logs/report-week12.pdf",
    attachment_url:
      "http://localhost:8000/storage/sales/activity-logs/report-week12.pdf",
    thumbnail_url: null,
    attachment_type: "file",
    status: "approved",
    metadata: null,
    lead: null,
    created_at: minutesAgo(4320),
    updated_at: minutesAgo(4320),
  },
  {
    id: 5,
    user_id: 5,
    lead_id: 12,
    type: "general_note",
    title: "Site visit photo — PT Maju Jaya warehouse",
    description: "Captured warehouse layout for logistics proposal.",
    attachment: "sales/activity-logs/warehouse-photo.jpg",
    attachment_url:
      "http://localhost:8000/storage/sales/activity-logs/warehouse-photo.jpg",
    thumbnail_url:
      "http://localhost:8000/storage/sales/activity-logs/thumb_warehouse-photo.jpg",
    attachment_type: "image",
    status: "approved",
    metadata: null,
    lead: { id: 12, name: "PT Maju Jaya", lead_id: "LD-00012" },
    created_at: minutesAgo(5760),
    updated_at: minutesAgo(5760),
  },
];

// ─── Showcase ───────────────────────────────────────────────────────────────────

export function ActivityCardShowcase() {
  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Individual Card Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Note */}
        <div className="relative flex flex-col p-6 pt-14 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
          <div className="absolute top-5 left-5">
            <Text
              variant="label"
              className="text-secondary-600 uppercase tracking-wider"
            >
              General Note (Approved)
            </Text>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <ActivityCard activity={MOCK_ACTIVITIES[0]} />
          </div>
        </div>

        {/* Request Lead Assign */}
        <div className="relative flex flex-col p-6 pt-14 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
          <div className="absolute top-5 left-5">
            <Text
              variant="label"
              className="text-secondary-600 uppercase tracking-wider"
            >
              Request Lead Assign (Pending)
            </Text>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <ActivityCard activity={MOCK_ACTIVITIES[1]} />
          </div>
        </div>

        {/* Request Update Status */}
        <div className="relative flex flex-col p-6 pt-14 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
          <div className="absolute top-5 left-5">
            <Text
              variant="label"
              className="text-secondary-600 uppercase tracking-wider"
            >
              Update Status (Rejected)
            </Text>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <ActivityCard activity={MOCK_ACTIVITIES[2]} />
          </div>
        </div>
      </div>

      {/* Attachment Variants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Attachment */}
        <div className="relative flex flex-col p-6 pt-14 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
          <div className="absolute top-5 left-5">
            <Text
              variant="label"
              className="text-secondary-600 uppercase tracking-wider"
            >
              File Attachment (PDF Badge)
            </Text>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <ActivityCard activity={MOCK_ACTIVITIES[3]} />
          </div>
        </div>

        {/* Image Attachment */}
        <div className="relative flex flex-col p-6 pt-14 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
          <div className="absolute top-5 left-5">
            <Text
              variant="label"
              className="text-secondary-600 uppercase tracking-wider"
            >
              Image Attachment (Thumbnail)
            </Text>
          </div>
          <div className="bg-white rounded-xl border border-neutral-200 p-4">
            <ActivityCard activity={MOCK_ACTIVITIES[4]} />
          </div>
        </div>
      </div>

      {/* Skeleton Loading */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Skeleton Loading State
          </Text>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="space-y-0">
            <ActivityCardSkeleton />
            <ActivityCardSkeleton />
          </div>
        </div>
      </div>

      {/* Full Timeline */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Activity Timeline (Full)
          </Text>
        </div>
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <ActivityTimeline items={MOCK_ACTIVITIES} />
        </div>
      </div>
    </div>
  );
}
