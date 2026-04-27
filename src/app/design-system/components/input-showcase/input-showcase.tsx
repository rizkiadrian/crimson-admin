// src/components/design-system/FormInputShowcase.tsx
import React from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Text } from "@app/components/ui/Text";
import { AtSign, Search, Eye } from "lucide-react"; // Pastikan lucide-react sudah terinstall

export function FormInputShowcase() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* --- KARTU 1: STANDARD LAYOUT --- */}
      {/* Persis seperti gambar pertama Anda (Berdampingan di layar besar) */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden lg:col-span-2">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Standard Layout
          </Text>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          <FormInput
            id="full-name"
            label="FULL NAME"
            placeholder="e.g. Alexander Sterling"
            type="text"
          />
          <FormInput
            id="email-address"
            label="EMAIL ADDRESS"
            placeholder="alexander.s@vanguard.com"
            type="email"
          />
        </div>
      </div>

      {/* --- KARTU 2: CORPORATE EMAIL (PILL SHAPE) --- */}
      {/* Persis seperti gambar kedua Anda */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Custom Shape (Pill)
          </Text>
        </div>

        <div className="w-full">
          <FormInput
            id="corporate-email"
            label="CORPORATE EMAIL"
            placeholder="name@crimson-executive.com"
            type="email"
            // Tambahkan ikon di sebelah kiri
            leftIcon={
              <AtSign
                className="w-5 h-5 text-secondary-600"
                strokeWidth={2.5}
              />
            }
            // Timpa wrapper agar berbentuk bulat penuh dan background abu-abu
            containerClassName="rounded-full bg-neutral-100 border-transparent focus-within:bg-white focus-within:border-neutral-300"
          />
        </div>
      </div>

      {/* --- KARTU 3: ICONS RIGHT --- */}
      {/* Bonus: Contoh penggunaan ikon di sebelah kanan */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            With Right Icons
          </Text>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <FormInput
            id="search-query"
            label="SEARCH"
            placeholder="Search documents..."
            type="text"
            rightIcon={<Search className="w-5 h-5" />}
          />

          <FormInput
            id="password"
            label="PASSWORD"
            placeholder="••••••••"
            type="password"
            // Biasanya ikon ini bisa diklik untuk show/hide password
            rightIcon={
              <Eye className="w-5 h-5 cursor-pointer hover:text-secondary-700 transition-colors" />
            }
          />
        </div>
      </div>

      {/* --- KARTU 4: READ-ONLY --- */}
      {/* Auto-populated field yang tidak bisa diedit user */}
      <div className="relative flex flex-col p-8 pt-16 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden lg:col-span-2">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Read-Only (Auto-Populated)
          </Text>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-4xl">
          <FormInput
            id="readonly-sales-id"
            label="SALES MEMBER ID"
            value="SLS-0002"
            readOnly
            className="bg-neutral-100 cursor-not-allowed"
          />
          <FormInput
            id="readonly-empty"
            label="SALES MEMBER ID (EMPTY)"
            value=""
            placeholder="Sales ID tidak tersedia"
            readOnly
            className="bg-neutral-100 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
