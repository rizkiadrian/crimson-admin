// src/lib/utils.ts
import { IApiError } from "@services/general";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Tambahkan <T = unknown> di sebelah nama fungsi
export function handleResponseError<T = unknown>({
  message,
  errors,
}: {
  message?: string;
  errors?: T; // Ubah tipe errors menjadi T
}): IApiError<T> {
  // Pastikan return type-nya juga menerima T
  return {
    success: false,
    message: message ?? "Something went wrong",
    errors, // TypeScript akan otomatis tahu ini bertipe T
  };
}

export function getNameInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
