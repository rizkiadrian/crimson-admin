"use client";

import React, { useState } from "react";
import { FormInput } from "@app/components/ui/FormInput";
import { Button } from "@app/components/ui/Button";
import {
  backofficeMembersService,
  IBackofficeCreatePayload,
} from "@services/backoffice/backoffice-members";
import { handleFormError } from "@lib/utils";
import { useNotificationStore } from "@store/useNotificationStore";
import { useRouter } from "next/navigation";
import { PATHS } from "@config/routing";

export default function BackofficeMemberCreatePage() {
  const router = useRouter();
  const showNotification = useNotificationStore(
    (state) => state.showNotification
  );
  const [formData, setFormData] = useState<IBackofficeCreatePayload>({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      setSubmitting(true);
      const resp =
        await backofficeMembersService.backofficeMembersCreate(formData);
      showNotification(resp.message, "success");
      router.push(PATHS.backofficeMembers);
    } catch (err: unknown) {
      handleFormError(err, setFormErrors);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      {/* Container Utama Form (Card Putih).
        Sesuai dengan gaya MemberTable sebelumnya: bg-bg-card, rounded-4xl, shadow subtle 
      */}
      <div className="bg-bg-card rounded-4xl shadow-[0_2px_20px_-10px_rgba(0,0,0,0.05)] border border-border-subtle overflow-hidden">
        {/* === 1. FORM HEADER === */}
        <div className="px-8 pt-8 pb-6 border-b border-border-subtle flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-text-main mb-1">
              Backoffice Registration
            </h2>
            <p className="text-[13px] font-medium text-text-muted">
              Add a new backoffice profile to the Lingkar member. Fill in all
              required information below.
            </p>
          </div>
          {/* Badge "Admin Interface" sesuai gambar */}
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-neutral-100 text-text-muted">
            Authorized only
          </span>
        </div>

        {/* === 2. FORM BODY === */}
        <form onSubmit={handleSubmit}>
          <div className="p-8 space-y-8">
            {/* Grid Layout untuk Input Fields
              Di desktop (md+) menjadi 2 kolom, di mobile 1 kolom.
              Gap/jarak diatur besar (gap-x-8 gap-y-6) agar lega seperti desain.
            */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Kolom 1: Full Name */}
              <FormInput
                id="name"
                label="Full Name"
                placeholder="e.g. Alexander Sterling"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
              />

              {/* Kolom 2: Email Address */}
              <FormInput
                id="email"
                type="email"
                label="Email Address"
                placeholder="alexander.s@vanguard.com"
                value={formData.email}
                onChange={handleChange}
                error={formErrors.email}
              />

              {/* Kolom 3: Phone Number (Sesuai request prompt) */}
              <FormInput
                id="phone"
                type="tel"
                label="Phone Number"
                placeholder="+62 818 2012 4123"
                format="phone"
                value={formData.phone}
                onChange={handleChange}
                error={formErrors.phone}
              />

              {/* Kolom 4: Password (Sesuai request prompt) */}
              <FormInput
                id="password"
                type="password"
                label="Password"
                placeholder="Set initial password"
                value={formData.password}
                onChange={handleChange}
                error={formErrors.password}
              />
            </div>

            {/* Area kosong di bawah form sebagai ruang bernapas (spacing) */}
            <div className="pt-16"></div>
          </div>

          {/* === 3. FORM FOOTER (ACTION BUTTONS) === */}
          {/* Posisi tombol di kanan, dengan background abu-abu sangat tipis jika mau, tapi di gambar terlihat nyatu dengan putih */}
          <div className="px-8 py-6 flex items-center justify-end gap-4 border-t border-border-subtle bg-white">
            <Button
              type="button"
              variant="ghost"
              href={PATHS.backofficeMembers}
              className="text-text-muted hover:text-text-main hover:bg-neutral-100 px-6 font-medium"
            >
              Cancel Change
            </Button>

            {/* Menggunakan Crimson Red Button */}
            <Button
              type="submit"
              variant="primary"
              className="px-8 shadow-md shadow-primary-200/60"
              isLoading={submitting}
            >
              {/* Tambahkan Ikon Check di kiri jika diinginkan */}
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Finalize Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
