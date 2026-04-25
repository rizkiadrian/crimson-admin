"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CHART_COLORS } from "./chart-colors";

export interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  /** Data items with name, value, and color. */
  data: DonutChartItem[];
  /** Chart height in px. Defaults to 260. */
  height?: number;
  /** Inner radius of the donut. Defaults to 60. */
  innerRadius?: number;
  /** Outer radius of the donut. Defaults to 100. */
  outerRadius?: number;
}

/**
 * Reusable donut/pie chart component.
 * Colors should come from CHART_COLORS or CHART_SETS.
 */
export function DonutChart({
  data,
  height = 260,
  innerRadius = 60,
  outerRadius = 100,
}: DonutChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={4}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: `1px solid ${CHART_COLORS.grid}`,
            fontSize: "13px",
            fontWeight: 600,
          }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
