"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CHART_COLORS } from "./chart-colors";

export interface BarChartItem {
  name: string;
  value: number;
  color: string;
}

export interface BarChartCardProps {
  /** Data items with name, value, and color. */
  data: BarChartItem[];
  /** Chart height in px. Defaults to 260. */
  height?: number;
}

/**
 * Reusable vertical bar chart component.
 * Each bar can have its own color from the design system palette.
 */
export function BarChartComponent({ data, height = 260 }: BarChartCardProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fontWeight: 600, fill: CHART_COLORS.label }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: CHART_COLORS.axis }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${CHART_COLORS.grid}`,
            fontSize: "13px",
            fontWeight: 600,
          }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
