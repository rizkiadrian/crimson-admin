"use client";

import React from "react";
import { Text } from "@app/components/ui/Text";
import {
  ChartCard,
  DonutChart,
  BarChartComponent,
  CHART_SETS,
  CHART_COLORS,
} from "@app/components/ui/Chart";

const donutData = [
  { name: "Approved", value: 64, color: CHART_SETS.mitraStatus[0] },
  { name: "Pending", value: 23, color: CHART_SETS.mitraStatus[1] },
  { name: "Rejected", value: 8, color: CHART_SETS.mitraStatus[2] },
  { name: "Suspended", value: 5, color: CHART_SETS.mitraStatus[3] },
];

const barData = [
  { name: "Jan", value: 32, color: CHART_COLORS.primary },
  { name: "Feb", value: 45, color: CHART_COLORS.primary },
  { name: "Mar", value: 28, color: CHART_COLORS.primary },
  { name: "Apr", value: 56, color: CHART_COLORS.tertiary },
  { name: "May", value: 41, color: CHART_COLORS.tertiary },
];

export function ChartCardShowcase() {
  return (
    <div className="grid grid-cols-1 gap-6">
      {/* ChartCard with DonutChart */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Chart Card — Donut Chart
          </Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ChartCard
            title="Mitra Status"
            description="Breakdown of mitra verification statuses"
          >
            <DonutChart data={donutData} />
          </ChartCard>

          <ChartCard title="Verification (No Description)">
            <DonutChart
              data={[
                {
                  name: "Verified",
                  value: 96,
                  color: CHART_SETS.verification[0],
                },
                {
                  name: "Unverified",
                  value: 32,
                  color: CHART_SETS.verification[1],
                },
              ]}
              innerRadius={50}
              outerRadius={90}
            />
          </ChartCard>
        </div>
      </div>

      {/* ChartCard with BarChart */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Chart Card — Bar Chart
          </Text>
        </div>

        <div className="mt-4">
          <ChartCard
            title="Monthly Registrations"
            description="New user sign-ups per month"
          >
            <BarChartComponent data={barData} height={280} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
