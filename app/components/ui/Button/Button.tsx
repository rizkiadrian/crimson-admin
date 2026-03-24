// src/components/ui/Button.tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Base styles: Fleksibel, transisi halus, dan state focus/disabled
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-bg-app transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        // Varian berdasarkan gambar Crimson Nexus
        primary: "bg-primary-500 text-white hover:bg-primary-600 shadow-sm",
        secondary: "bg-neutral-200 text-secondary-800 hover:bg-neutral-300",
        inverted: "bg-secondary-800 text-white hover:bg-secondary-900 shadow-sm",
        outlined: "border border-neutral-300 bg-transparent text-secondary-800 hover:bg-neutral-100",
        
        // Varian untuk Icon Buttons (Bulat)
        iconPrimary: "bg-primary-500 text-white hover:bg-primary-600 rounded-full shadow-sm",
        iconSecondary: "bg-secondary-500 text-white hover:bg-secondary-600 rounded-full shadow-sm",
        iconTertiary: "bg-tertiary-600 text-white hover:bg-tertiary-700 rounded-full shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10", // Ukuran kotak presisi untuk ikon bulat
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";