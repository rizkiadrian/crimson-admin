"use client";

import React from "react";
import { cn } from "@lib/utils";
import { Check } from "lucide-react";

// ─── Single Checkbox ────────────────────────────────────────────────────────────

export interface FormCheckboxProps {
  /** Unique identifier for the checkbox. */
  id: string;
  /** Label text displayed next to the checkbox. */
  label: string;
  /** Whether the checkbox is checked. */
  checked: boolean;
  /** Change handler. */
  onChange: (checked: boolean) => void;
  /** Disable the checkbox. */
  disabled?: boolean;
  /** Additional className for the outer wrapper. */
  className?: string;
}

/**
 * Custom-styled checkbox matching the CRM design system.
 * Uses a hidden native `<input>` for accessibility with a visual indicator
 * built from design-system tokens (primary-500, neutral-200, rounded-md, etc.).
 *
 * ```tsx
 * <FormCheckbox
 *   id="is_active"
 *   label="Active"
 *   checked={isActive}
 *   onChange={setIsActive}
 * />
 * ```
 */
export function FormCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled = false,
  className,
}: FormCheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {/* Hidden native checkbox for accessibility & form semantics */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />

      {/* Custom visual checkbox */}
      <span
        className={cn(
          "flex items-center justify-center w-[18px] h-[18px] rounded-md border-2 transition-all duration-150 shrink-0",
          // Unchecked
          !checked &&
            "border-neutral-300 bg-neutral-50 group-hover:border-neutral-400",
          // Checked
          checked &&
            "border-primary-500 bg-primary-500 group-hover:border-primary-600 group-hover:bg-primary-600",
          // Focus ring (via peer)
          "peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/30 peer-focus-visible:ring-offset-1",
          // Disabled overrides
          disabled &&
            "group-hover:border-neutral-300 group-hover:bg-neutral-50",
          disabled &&
            checked &&
            "group-hover:border-primary-500 group-hover:bg-primary-500"
        )}
        aria-hidden="true"
      >
        {checked && <Check size={12} strokeWidth={3} className="text-white" />}
      </span>

      <span
        className={cn(
          "text-sm font-medium transition-colors",
          checked ? "text-secondary-900" : "text-secondary-600",
          !disabled && "group-hover:text-secondary-900"
        )}
      >
        {label}
      </span>
    </label>
  );
}

// ─── Checkbox Group ─────────────────────────────────────────────────────────────

export interface CheckboxOption<T extends string = string> {
  /** Display label. */
  label: string;
  /** Value emitted when selected. */
  value: T;
}

export interface FormCheckboxGroupProps<T extends string = string> {
  /** Group label displayed above the checkboxes. */
  label: string;
  /** Available options. */
  options: CheckboxOption<T>[];
  /** Currently selected values. */
  value: T[];
  /** Called with the updated array when selection changes. */
  onChange: (value: T[]) => void;
  /** Error message displayed below the group. */
  error?: string;
  /** Disable all checkboxes. */
  disabled?: boolean;
  /** Layout direction. Defaults to "horizontal". */
  direction?: "horizontal" | "vertical";
  /** Additional className for the outer wrapper. */
  className?: string;
}

/**
 * Checkbox group with label, error state, and horizontal/vertical layout.
 * Best for small, fixed option sets (≤6 options).
 *
 * ```tsx
 * <FormCheckboxGroup
 *   label="Types"
 *   options={[
 *     { label: "General", value: "general" },
 *     { label: "Daily", value: "daily" },
 *     { label: "Monthly", value: "monthly" },
 *     { label: "Popular", value: "popular" },
 *   ]}
 *   value={selectedTypes}
 *   onChange={setSelectedTypes}
 *   error={formErrors.types}
 * />
 * ```
 */
export function FormCheckboxGroup<T extends string = string>({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  direction = "horizontal",
  className,
}: FormCheckboxGroupProps<T>) {
  const handleToggle = (optionValue: T) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className={className}>
      <p className="text-xs text-secondary-500 uppercase font-medium mb-3 tracking-wide">
        {label}
      </p>
      <div
        className={cn(
          "flex flex-wrap",
          direction === "horizontal" ? "gap-x-5 gap-y-3" : "flex-col gap-2.5"
        )}
      >
        {options.map((option) => (
          <FormCheckbox
            key={option.value}
            id={`${label.toLowerCase().replace(/\s+/g, "-")}-${option.value}`}
            label={option.label}
            checked={value.includes(option.value)}
            onChange={() => handleToggle(option.value)}
            disabled={disabled}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs font-medium text-error-600">{error}</p>
      )}
    </div>
  );
}
