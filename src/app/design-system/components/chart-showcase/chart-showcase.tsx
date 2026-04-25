"use client";

import React from "react";
import { Text } from "@app/components/ui/Text";
import {
  ChartCard,
  DonutChart,
  BarChartComponent,
  CHART_SETS,
} from "@app/components/ui/Chart";

const donutData = [
  { name: "Verified", value: 96, color: CHART_SETS.verification[0] },
  { name: "Unverified", value: 32, color: CHART_SETS.verification[1] },
];

const barData = [
  { name: "Approved", value: 45, color: CHART_SETS.mitraStatus[0] },
  { name: "Pending", value: 28, color: CHART_SETS.mitraStatus[1] },
  { name: "Rejected", value: 8, color: CHART_SETS.mitraStatus[2] },
  { name: "Suspended", value: 3, color: CHART_SETS.mitraStatus[3] },
];

const categoricalDonut = [
  { name: "Cleaning", value: 35, color: CHART_SETS.categorical[0] },
  { name: "AC Repair", value: 22, color: CHART_SETS.categorical[1] },
  { name: "Plumbing", value: 18, color: CHART_SETS.categorical[2] },
  { name: "Electric", value: 15, color: CHART_SETS.categorical[3] },
  { name: "Other", value: 10, color: CHART_SETS.categorical[4] },
];

export function ChartShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Donut + Bar side by side */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Donut Chart + Bar Chart
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ChartCard
            title="Client Verification"
            description="Verified vs unverified distribution"
          >
            <DonutChart data={donutData} />
          </ChartCard>

          <ChartCard
            title="Mitra Status"
            description="Breakdown by verification status"
          >
            <BarChartComponent data={barData} />
          </ChartCard>
        </div>
      </div>

      {/* Categorical donut */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Categorical Colors
          </Text>
        </div>

        <div className="w-full max-w-md mt-4">
          <ChartCard
            title="Service Categories"
            description="Distribution using the categorical color set"
          >
            <DonutChart
              data={categoricalDonut}
              outerRadius={90}
              innerRadius={50}
            />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
