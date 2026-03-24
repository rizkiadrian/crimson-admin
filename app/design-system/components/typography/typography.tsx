// src/components/design-system/TypographyShowcase.tsx
import React from "react";
import { Text } from "@/components/ui/Text"; // Pastikan path import ini sesuai

// Kita buat array yang mereferensikan varian dari komponen Text Anda
const typographyTokens = [
  { name: "Headline", variant: "headline" },
  { name: "Body", variant: "body" },
  { name: "Label", variant: "label" },
] as const;

export function TypographyShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {typographyTokens.map((type) => (
        <div
          key={type.name}
          className="relative flex flex-col items-center justify-center h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden"
        >
          {/* Label di pojok kiri atas */}
          <div className="absolute top-6 left-6">
            <Text variant="label" className="text-secondary-400 uppercase tracking-wider">
              {type.name}
            </Text>
          </div>

          {/* Teks "Aa" di tengah.
            Kita panggil komponen Text dengan varian masing-masing.
            Lalu kita timpa ukurannya menjadi sangat besar (text-[7rem]) khusus untuk display ini.
            Ketebalan (bold/normal/medium) dan warna akan tetap bawaan dari variannya!
          */}
          <Text 
            variant={type.variant} 
            className="text-[6rem] md:text-[8rem] leading-none select-none"
          >
            Aa
          </Text>
        </div>
      ))}
    </div>
  );
}