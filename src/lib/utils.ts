// src/lib/utils.ts
import { IApiError } from "@services/general";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function handleResponseError({
  message,
  errors,
}: {
  message?: string;
  errors?: Record<string, string[]> | unknown;
}): IApiError {
  return {
    success: false,
    message: message ?? "Something went wrong",
    errors,
  };
}
