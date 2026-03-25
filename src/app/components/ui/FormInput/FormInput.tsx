// src/components/ui/FormInput.tsx
"use client"; // Wajib ditambahkan karena kita menggunakan useState

import React, { useState } from "react";
import { cn } from "@lib/utils";
import { Eye, EyeOff } from "lucide-react"; // Import icon mata

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
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
      ...props
    },
    ref
  ) => {
    // State lokal khusus untuk mengatur visibilitas password
    const [showPassword, setShowPassword] = useState(false);

    // Cek apakah input ini adalah input password
    const isPassword = type === "password";

    // Tentukan tipe input yang sedang aktif (teks biasa atau password yang disensor)
    const currentType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;

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
            type={currentType} // Gunakan tipe yang sudah dikalkulasi di atas
            className={cn(
              "flex-1 bg-transparent py-3.5 px-4 outline-none text-secondary-900 placeholder:text-secondary-400 text-base",
              className
            )}
            {...props}
          />

          {/* LOGIKA IKON KANAN / PASSWORD TOGGLE */}
          {isPassword ? (
            // Jika ini input password, otomatis render tombol mata
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
            // Jika bukan password, tapi ada rightIcon yang dikirim, render icon tersebut
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
