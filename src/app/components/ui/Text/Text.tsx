// src/components/ui/Text.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@lib/utils";

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
  as?: React.ElementType; // Memungkinkan kita mengganti tag HTML (h1, p, span)
}

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
