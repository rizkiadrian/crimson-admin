// src/components/ui/FormInput.tsx
"use client";

import React, { useState } from "react";
import { cn } from "@lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  format?: "phone" | "default";
  error?: string;
}

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
      value, // Kita ekstrak value untuk diformat secara visual
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

    // --- HELPER UNTUK VISUAL DISPLAY (+62 8XX-XXXX) ---
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

    // --- HELPER UNTUK DATABASE RAW VALUE (628XX) ---
    const getRawValue = (val: string) => {
      let cleaned = val.replace(/[^\d+]/g, "");
      if (cleaned.startsWith("0")) cleaned = "62" + cleaned.slice(1);
      else if (cleaned.startsWith("8")) cleaned = "628" + cleaned.slice(1);
      else if (cleaned.startsWith("+62")) cleaned = "62" + cleaned.substring(3);
      return cleaned.replace(/\D/g, ""); // Kembalikan hanya angka
    };

    // --- INTERCEPTOR ONCHANGE ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (format === "phone") {
        const rawValue = getRawValue(e.target.value);

        if (onChange) {
          // Membuat event tiruan (synthetic clone) agar state parent menerima angka mentah
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
            value={getDisplayValue(value)} // Gunakan formatter visual di sini
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
