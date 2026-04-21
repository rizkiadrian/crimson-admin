import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";

/**
 * Tailwind class variants for the Text component.
 * Each variant maps to a specific typographic role in the design system.
 */
const textVariants = cva("text-secondary-800", {
  variants: {
    variant: {
      headline:
        "text-4xl md:text-5xl font-bold tracking-tight text-secondary-900",
      body: "text-base md:text-lg font-normal text-secondary-600 leading-relaxed",
      label: "text-sm font-medium text-secondary-500",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

export interface TextProps
  extends
    React.HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof textVariants> {
  /** HTML element to render (e.g. "h1", "span", "p"). Defaults to "p". */
  as?: React.ElementType;
}

/**
 * Polymorphic typography component.
 * Renders text with a consistent design-system variant while allowing
 * the underlying HTML element to be changed via the `as` prop.
 *
 * @example
 * ```tsx
 * <Text variant="headline" as="h1">Page Title</Text>
 * <Text variant="label">FIELD LABEL</Text>
 * ```
 */
export function Text({
  className,
  variant,
  as: Component = "p",
  ...props
}: TextProps) {
  return (
    <Component
      className={cn(textVariants({ variant, className }))}
      {...props}
    />
  );
}
