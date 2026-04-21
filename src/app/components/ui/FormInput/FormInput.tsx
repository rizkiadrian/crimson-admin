"use client";

import React, { useState } from "react";
import { cn } from "@lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input. */
  label: string;
  /** HTML id attribute, also used for the label's `htmlFor`. */
  id: string;
  /** Icon rendered inside the input on the left side. */
  leftIcon?: React.ReactNode;
  /** Icon rendered inside the input on the right side. */
  rightIcon?: React.ReactNode;
  /** Additional className applied to the outer input container. */
  containerClassName?: string;
  /** When set to "phone", auto-formats the display as +62 XXX-XXXX-XXXX. */
  format?: "phone" | "default";
  /** Error message string. When present, triggers error border and shows the message below. */
  error?: string;
}

/**
 * Form input with built-in label, error state, icon slots, password toggle,
 * and Indonesian phone number formatting.
 *
 * When `format="phone"`:
 * - The displayed value is formatted as `+62 XXX-XXXX-XXXX` for readability.
 * - The value emitted via `onChange` is the raw digit string (e.g. "6281234567890"),
 *   ready for API submission without extra parsing.
 *
 * When `type="password"`:
 * - A show/hide toggle button replaces the right icon slot.
 *
 * Supports `ref` forwarding for integration with form libraries (e.g. React Hook Form).
 */
export const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      id,
      className,
      leftIcon,
      rightIcon,
      containerClassName,
      type = "text",
      format = "default",
      error,
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const currentType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;

    /**
     * Converts a raw phone number into a human-readable format: +62 XXX-XXXX-XXXX.
     * Normalizes common Indonesian prefixes (0, 8, +62) to the "62" country code.
     * Only applied when `format="phone"`.
     */
    const getDisplayValue = (
      val: string | number | readonly string[] | undefined
    ) => {
      if (format !== "phone" || typeof val !== "string") return val;

      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
      else if (cleaned.startsWith("8")) cleaned = "628" + cleaned.slice(1);
      else if (cleaned.startsWith("+62")) cleaned = "62" + cleaned.substring(3);

      const digits = cleaned.replace(/\D/g, "");
      if (digits.startsWith("62")) {
        let formatted = "+62";
        if (digits.length > 2) formatted += " " + digits.substring(2, 5);
        if (digits.length > 5) formatted += "-" + digits.substring(5, 9);
        if (digits.length > 9) formatted += "-" + digits.substring(9, 15);
        return formatted;
      }
      return cleaned;
    };

    /**
     * Strips all non-digit characters and normalizes the prefix to "62".
     * Returns a digits-only string suitable for database storage.
     */
    const getRawValue = (val: string) => {
      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
      else if (cleaned.startsWith("8")) cleaned = "628" + cleaned.slice(1);
      else if (cleaned.startsWith("+62")) cleaned = "62" + cleaned.substring(3);
      return cleaned.replace(/\D/g, "");
    };

    /**
     * Intercepts onChange for phone inputs to emit the raw digit value
     * instead of the formatted display value. For other formats, passes
     * the event through unchanged.
     */
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (format === "phone") {
        const rawValue = getRawValue(e.target.value);

        if (onChange) {
          // Clone the event with the raw value so the parent state receives digits only
          const clonedEvent = {
            ...e,
            target: {
              ...e.target,
              id: e.target.id,
              name: e.target.name,
              value: rawValue,
            },
          } as React.ChangeEvent<HTMLInputElement>;

          onChange(clonedEvent);
        }
      } else {
        if (onChange) {
          onChange(e);
        }
      }
    };

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-xs text-secondary-500 uppercase font-medium mb-2 tracking-wide select-none"
        >
          {label}
        </label>

        <div
          className={cn(
            "flex items-center w-full overflow-hidden transition-colors border rounded-xl",
            !error &&
              "bg-neutral-50 border-neutral-200 focus-within:ring-2 focus-within:ring-secondary-900/10 focus-within:border-secondary-900 focus-within:bg-white",
            error &&
              "bg-white border-error-500 focus-within:ring-2 focus-within:ring-error-500/20 focus-within:border-error-500",
            containerClassName
          )}
        >
          {leftIcon && (
            <div
              className={cn(
                "flex items-center justify-center pl-4",
                error ? "text-error-500" : "text-secondary-500"
              )}
            >
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            type={currentType}
            onChange={handleInputChange}
            value={getDisplayValue(value)}
            className={cn(
              "flex-1 bg-transparent py-3.5 px-4 outline-none text-secondary-900 placeholder:text-secondary-400 text-base",
              className
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                "flex items-center justify-center pr-4 transition-colors focus:outline-none",
                error
                  ? "text-error-400 hover:text-error-600"
                  : "text-secondary-400 hover:text-secondary-700"
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          ) : rightIcon ? (
            <div
              className={cn(
                "flex items-center justify-center pr-4 pointer-events-none",
                error ? "text-error-400" : "text-secondary-400"
              )}
            >
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error && (
          <p className="mt-1.5 text-xs font-medium text-error-600">{error}</p>
        )}
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
