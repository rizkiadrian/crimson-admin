// src/lib/utils.ts
import { Dispatch, SetStateAction } from "react";
import { IApiError } from "@services/general";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { CustomApiError, IFieldErrors } from "./api";

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

// src/lib/utils.ts

/**
 * Mengubah object error API (array strings) menjadi flat object (string tunggal)
 * Contoh Input: { email: ["Invalid format", "Required"] }
 * Contoh Output: { email: "Invalid format" }
 */
export const extractFormErrors = (
  apiErrors: IFieldErrors
): Record<string, string> => {
  // Jika tidak ada error atau format tidak sesuai, kembalikan object kosong
  if (!apiErrors || typeof apiErrors !== "object") return {};

  const formattedErrors: Record<string, string> = {};

  for (const [key, value] of Object.entries(apiErrors)) {
    // Ambil string pertama dari array error
    if (Array.isArray(value) && value.length > 0) {
      formattedErrors[key] = value[0];
    }
    // Jaga-jaga jika backend mengembalikan string langsung
    else if (typeof value === "string") {
      formattedErrors[key] = value;
    }
  }

  return formattedErrors;
};

const isApiError = (err: unknown): err is CustomApiError => {
  return typeof err === "object" && err !== null && "message" in err;
};

export const handleFormError = (
  err: unknown,
  setFormErrors: Dispatch<SetStateAction<Record<string, string>>>
) => {
  // Reset error state (opsional, tergantung kebutuhan)
  setFormErrors({});

  if (isApiError(err)) {
    const backendErrors = err?.errors;
    const backendMessage = err?.message;

    if (backendErrors) {
      // Ekstrak array error menjadi string tunggal
      const formattedErrors: Record<string, string> = {};
      for (const [key, value] of Object.entries(backendErrors)) {
        if (Array.isArray(value) && value.length > 0) {
          formattedErrors[key] = value[0];
        } else if (typeof value === "string") {
          formattedErrors[key] = value;
        }
      }

      // Update state di komponen
      setFormErrors(formattedErrors);
    } else if (backendMessage) {
      console.error("Backend Error:", backendMessage);
      // Opsional: Kamu bisa melempar toast notification di sini
    }
  } else if (err instanceof Error) {
    console.error("Aplikasi bermasalah:", err.message);
  } else {
    console.error("Terjadi error tak terduga:", err);
  }
};
