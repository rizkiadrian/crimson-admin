/**
 * Chart color palette mapped to the design system CSS variables.
 * Use these constants in Recharts components instead of hardcoded hex values.
 *
 * Each color references the exact value from globals.css root variables.
 */
export const CHART_COLORS = {
  // Core palette
  primary: "#d32f2f", // --color-primary-500
  secondary: "#6d6d6d", // --color-secondary-500
  tertiary: "#00799c", // --color-tertiary-600

  // State palette
  success: "#10b981", // --color-success-500
  warning: "#f59e0b", // --color-warning-500
  error: "#d32f2f", // --color-primary-500 (error = primary in this design system)

  // Neutral
  neutral: "#adb5bd", // --color-neutral-500
  grid: "#e9ecef", // --color-neutral-200
  axis: "#adb5bd", // --color-neutral-500
  label: "#6d6d6d", // --color-secondary-500
} as const;

/**
 * Semantic chart color sets for common chart types.
 */
export const CHART_SETS = {
  /** For verified/unverified binary charts. */
  verification: [CHART_COLORS.success, CHART_COLORS.warning],

  /** For mitra status breakdown (approved, pending, rejected, suspended). */
  mitraStatus: [
    CHART_COLORS.success, // approved
    CHART_COLORS.warning, // pending
    CHART_COLORS.error, // rejected
    CHART_COLORS.neutral, // suspended
  ],

  /** General purpose multi-color set. */
  categorical: [
    CHART_COLORS.primary,
    CHART_COLORS.tertiary,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.secondary,
  ],
} as const;
