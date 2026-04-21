import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";

/**
 * Tailwind class variants for the Button component.
 * Managed by `class-variance-authority` to keep variant logic declarative.
 */
const buttonVariants = cva(
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
  /** Shows a spinner and disables interaction. */
  isLoading?: boolean;
  /** When provided, renders as a Next.js Link instead of a native button. */
  href?: string;
}

/**
 * Polymorphic button component.
 *
 * - Renders as a `<button>` by default.
 * - Renders as a Next.js `<Link>` when `href` is provided, preserving
 *   client-side navigation while keeping the same visual styling.
 * - Shows a loading spinner when `isLoading` is true and disables interaction.
 *
 * Supports `ref` forwarding for the native button element.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, disabled, href, children, ...props },
    ref
  ) => {
    const content = (
      <>
        {isLoading && (
          <Loader2
            className={cn(
              "animate-spin",
              children ? "mr-2 h-4 w-4" : "h-4 w-4"
            )}
          />
        )}
        {children}
      </>
    );

    // Render as Next.js Link when href is provided
    if (href) {
      return (
        <Link
          href={href}
          className={cn(
            buttonVariants({ variant, size, className }),
            (disabled || isLoading) && "pointer-events-none opacity-50"
          )}
        >
          {content}
        </Link>
      );
    }

    // Default: render as native button
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {content}
      </button>
    );
  }
);
Button.displayName = "Button";
