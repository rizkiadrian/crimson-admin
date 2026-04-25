import React from "react";
import { Text } from "@app/components/ui/Text";
import { StatCard } from "@app/components/ui/StatCard";
import { Users, ShieldCheck, Wrench, Wifi } from "lucide-react";

export function StatCardShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Stat Cards (All Variants)
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <StatCard
            title="Total Clients"
            value={128}
            description="12 verified"
            icon={Users}
            iconVariant="primary"
          />
          <StatCard
            title="Verified"
            value={96}
            description="32 pending"
            icon={ShieldCheck}
            iconVariant="success"
          />
          <StatCard
            title="Total Mitra"
            value={45}
            description="8 online"
            icon={Wrench}
            iconVariant="tertiary"
          />
          <StatCard
            title="Online Now"
            value={8}
            description="5 approved"
            icon={Wifi}
            iconVariant="warning"
          />
        </div>
      </div>
    </div>
  );
}
