"use client";

import React from "react";
import { Text } from "@app/components/ui/Text";
import { Button } from "@app/components/ui/Button";
import { useConfirmStore } from "@store/useConfirmStore";
import { useNotificationStore } from "@store/useNotificationStore";
import { Trash2, AlertTriangle, LogOut } from "lucide-react";

export function ConfirmDialogShowcase() {
  const showConfirm = useConfirmStore((s) => s.showConfirm);
  const showNotification = useNotificationStore((s) => s.showNotification);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Delete confirmation */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Delete Action
          </Text>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm text-text-muted text-center max-w-xs">
            Simulates a delete confirmation with a 1s async delay.
          </p>
          <Button
            variant="primary"
            className="gap-2"
            onClick={() =>
              showConfirm({
                title: "Hapus Data Pelanggan?",
                description:
                  "Tindakan ini tidak dapat dibatalkan. Seluruh data transaksi dan profil pelanggan akan dihapus secara permanen dari sistem.",
                onConfirm: async () => {
                  await new Promise((r) => setTimeout(r, 1000));
                  showNotification("Data berhasil dihapus", "success");
                },
              })
            }
          >
            <Trash2 size={16} />
            Delete Item
          </Button>
        </div>
      </div>

      {/* Danger action */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Custom Labels
          </Text>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm text-text-muted text-center max-w-xs">
            Custom confirm/cancel labels for different contexts.
          </p>
          <Button
            variant="outlined"
            className="gap-2"
            onClick={() =>
              showConfirm({
                title: "Reset semua pengaturan?",
                description:
                  "Pengaturan akan dikembalikan ke default. Perubahan yang belum disimpan akan hilang.",
                confirmLabel: "Ya, Reset",
                cancelLabel: "Tidak",
                onConfirm: async () => {
                  await new Promise((r) => setTimeout(r, 500));
                  showNotification("Pengaturan berhasil direset", "info");
                },
              })
            }
          >
            <AlertTriangle size={16} />
            Reset Settings
          </Button>
        </div>
      </div>

      {/* Error simulation */}
      <div className="relative flex flex-col items-center justify-center p-8 h-64 md:h-72 rounded-2xl bg-neutral-50 shadow-sm border border-neutral-200 overflow-hidden">
        <div className="absolute top-6 left-6">
          <Text
            variant="label"
            className="text-secondary-600 uppercase tracking-wider"
          >
            Error Handling
          </Text>
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <p className="text-sm text-text-muted text-center max-w-xs">
            Simulates a failed API call — dialog stays open, error toast shown.
          </p>
          <Button
            variant="outlined"
            className="gap-2"
            onClick={() =>
              showConfirm({
                title: "Logout dari semua perangkat?",
                description:
                  "Semua sesi aktif akan diakhiri. Anda perlu login ulang di setiap perangkat.",
                confirmLabel: "Logout",
                cancelLabel: "Batal",
                onConfirm: async () => {
                  await new Promise((r) => setTimeout(r, 1000));
                  showNotification("Gagal logout: server error", "error");
                  throw new Error("Simulated API error");
                },
              })
            }
          >
            <LogOut size={16} />
            Logout All
          </Button>
        </div>
      </div>
    </div>
  );
}
