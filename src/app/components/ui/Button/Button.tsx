// src/components/ui/Button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";
import { Loader2 } from "lucide-react"; // 1. Import icon spinner

const buttonVariants = cva(
  // Base styles: Fleksibel, transisi halus, dan state focus/disabled
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg-app transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer font-semibold",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        secondary: "bg-neutral-200 text-secondary-800 hover:bg-neutral-300",
        inverted:
          "bg-secondary-800 text-white hover:bg-secondary-900 shadow-sm",
        outlined:
          "border border-neutral-300 bg-transparent text-secondary-800 hover:bg-neutral-100",
        iconPrimary:
          "bg-primary-500 text-white hover:bg-primary-600 rounded-full shadow-sm",
        iconSecondary:
          "bg-secondary-500 text-white hover:bg-secondary-600 rounded-full shadow-sm",
        iconTertiary:
          "bg-tertiary-600 text-white hover:bg-tertiary-700 rounded-full shadow-sm",
        ghost:
          "bg-transparent text-neutral-400 hover:text-text-main hover:bg-neutral-50 border border-transparent hover:border-border-subtle",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean; // 2. Tambahkan prop isLoading
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, disabled, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // 3. Otomatis disable tombol jika sedang loading ATAU jika prop disabled di-set true
        disabled={disabled || isLoading}
        {...props}
      >
        {/* 4. Render spinner jika isLoading true */}
        {isLoading && (
          <Loader2
            className={cn(
              "animate-spin",
              // Beri jarak margin kanan (mr-2) jika tombol memiliki teks/children.
              // Jika tombol hanya icon (tanpa teks), jangan beri margin agar tetap di tengah.
              children ? "mr-2 h-4 w-4" : "h-4 w-4"
            )}
          />
        )}

        {/* Render isi tombol (teks atau ikon lain) */}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
