// src/components/design-system/ColorPalette.tsx
"use client";

import React, { useEffect, useState } from "react";

const colorTokens = [
  { name: "Primary", prefix: "primary" },
  { name: "Secondary", prefix: "secondary" },
  { name: "Tertiary", prefix: "tertiary" },
  { name: "Neutral", prefix: "neutral" },
];

const shades = ["950", "900", "800", "700", "600", "500", "400", "300", "200", "100", "50"];

export function ColorPalette() {
  const [baseColors, setBaseColors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Bungkus dengan setTimeout untuk menghindari sinkronisasi yang memicu peringatan
    const timer = setTimeout(() => {
      const rootStyles = getComputedStyle(document.documentElement);
      const extractedColors: Record<string, string> = {};

      colorTokens.forEach((color) => {
        const cssValue = rootStyles.getPropertyValue(`--color-${color.prefix}-500`).trim();
        extractedColors[color.prefix] = cssValue || "N/A";
      });

      setBaseColors(extractedColors);
    }, 0); // Jeda 0 milidetik sudah cukup untuk melepaskannya dari thread utama efek

    // Selalu bersihkan timer jika komponen di-unmount agar tidak ada memory leak
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {colorTokens.map((color) => {
        const textColor = color.prefix === "neutral" ? "text-secondary-900" : "text-white";

        return (
          <div 
            key={color.name} 
            className="flex flex-col h-48 rounded-2xl overflow-hidden shadow-sm border border-neutral-200"
          >
            <div 
              className={`flex-1 p-4 flex justify-between items-start font-medium text-sm ${textColor}`}
              style={{ backgroundColor: `var(--color-${color.prefix}-500)` }}
            >
              <span>{color.name}</span>
              {/* Tampilkan nilai atau state loading sementara "..." */}
              <span className="uppercase tracking-wider opacity-90">
                {baseColors[color.prefix] || "..."}
              </span>
            </div>

            <div className="flex h-12 w-full">
              {shades.map((shade) => (
                <div
                  key={`${color.prefix}-${shade}`}
                  className="flex-1 h-full"
                  style={{ backgroundColor: `var(--color-${color.prefix}-${shade})` }}
                  title={`${color.name} ${shade}`}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}