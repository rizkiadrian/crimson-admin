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
  format?: "phone" | "default"; // Props baru untuk menentukan format input
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
      format = "default", // Default tidak ada format khusus
      onChange, // Ekstrak onChange bawaan parent
      ...props // Sisa props seperti value, placeholder, required, dll
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

    // --- INTERCEPTOR ONCHANGE ---
    // Fungsi ini mencegat ketikan user, memformatnya, baru mengirimnya ke parent
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (format === "phone") {
        const value = e.target.value;

        // Jika tidak kosong, jalankan formatter
        if (value) {
          let cleaned = value.replace(/[^\d+]/g, "");

          if (cleaned.startsWith("0")) cleaned = "+62" + cleaned.slice(1);
          else if (cleaned.startsWith("8")) cleaned = "+628" + cleaned.slice(1);
          else if (cleaned.startsWith("62")) cleaned = "+" + cleaned;

          const digits = cleaned.replace(/\D/g, "");
          if (digits.startsWith("62")) {
            let formatted = "+62";
            if (digits.length > 2) formatted += " " + digits.substring(2, 5);
            if (digits.length > 5) formatted += "-" + digits.substring(5, 9);
            if (digits.length > 9) formatted += "-" + digits.substring(9, 15);

            // Timpa value event dengan value yang sudah rapi
            e.target.value = formatted;
          } else {
            e.target.value = cleaned;
          }
        }
      }

      // Lempar event yang sudah dimodifikasi (atau tidak dimodifikasi) ke parent
      if (onChange) {
        onChange(e);
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
            "flex items-center w-full overflow-hidden transition-colors border",
            "bg-neutral-50 border-neutral-200 rounded-xl",
            "focus-within:ring-2 focus-within:ring-secondary-900/10 focus-within:border-secondary-900 focus-within:bg-white",
            containerClassName
          )}
        >
          {leftIcon && (
            <div className="flex items-center justify-center pl-4 text-secondary-500">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            ref={ref}
            type={currentType}
            onChange={handleInputChange} // Gunakan fungsi interceptor di sini
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
              className="flex items-center justify-center pr-4 text-secondary-400 hover:text-secondary-700 transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          ) : rightIcon ? (
            <div className="flex items-center justify-center pr-4 text-secondary-400 pointer-events-none">
              {rightIcon}
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);

FormInput.displayName = "FormInput";
