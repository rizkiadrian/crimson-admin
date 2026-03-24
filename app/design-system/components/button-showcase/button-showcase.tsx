// src/components/design-system/ButtonShowcase.tsx
import React from "react";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { PenSquare, Home, Trash2, Tag } from "lucide-react";

export function ButtonShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {/* --- KARTU 1: STANDARD VARIANTS (2x2 Grid) --- */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text variant="label" className="text-secondary-400 uppercase tracking-wider">
            Standard
          </Text>
        </div>
        
        {/* Grid 2x2 sesuai gambar desain */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-70 mt-6">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="inverted">Inverted</Button>
          <Button variant="outlined">Outlined</Button>
        </div>
      </div>

      {/* --- KARTU 2: ICON BUTTONS (Circular) --- */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text variant="label" className="text-secondary-400 uppercase tracking-wider">
            Icon Only
          </Text>
        </div>
        
        {/* Row flex sesuai gambar desain */}
        <div className="flex gap-4 mt-6">
          <Button variant="iconPrimary" size="icon">
            <PenSquare className="w-4 h-4" />
          </Button>
          <Button variant="iconSecondary" size="icon">
            <Home className="w-4 h-4" />
          </Button>
          <Button variant="iconTertiary" size="icon">
            <Tag className="w-4 h-4" />
          </Button>
          {/* Anda bisa menambahkan utility class langsung untuk menimpa warna spesifik jika butuh */}
          <Button variant="iconPrimary" size="icon" className="bg-primary-700 hover:bg-primary-800">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* --- KARTU 3: WITH ICON & SIZES --- */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text variant="label" className="text-secondary-400 uppercase tracking-wider">
            With Icon & Sizes
          </Text>
        </div>
        
        <div className="flex flex-col items-center gap-4 mt-6">
          {/* Sesuai dengan tombol "Label" dengan ikon pensil di gambar */}
          <Button variant="primary" className="gap-2">
            <PenSquare className="w-4 h-4" />
            <span>Label</span>
          </Button>

          {/* Menunjukkan fitur size yang ada di cva Anda */}
          <div className="flex items-center gap-3 mt-4 border-t border-neutral-200 pt-6">
            <Button variant="secondary" size="sm">Small</Button>
            <Button variant="primary" size="lg">Large Button</Button>
          </div>
        </div>
      </div>

    </div>
  );
}