import React from "react";
import { Text } from "@app/components/ui/Text";
import { Badge } from "@app/components/ui/Table";

const variants = [
  "primary",
  "tertiary",
  "success",
  "warning",
  "error",
  "neutral",
] as const;

export function BadgeShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* With dot */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            With Dot
          </Text>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {variants.map((v) => (
            <Badge key={v} variant={v}>
              {v}
            </Badge>
          ))}
        </div>
      </div>

      {/* Without dot */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Without Dot
          </Text>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {variants.map((v) => (
            <Badge key={v} variant={v} showDot={false}>
              {v}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
