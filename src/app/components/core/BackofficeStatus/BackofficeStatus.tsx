"use client";

import { useEffect } from "react";
import { generalService } from "@services/general";
import { useUserProfile } from "@store/useUserProfile";
import { ROLE_NOTIFICATION_ENDPOINT } from "@config/env";

interface BackofficeStatusProps {
  roleName: string | null;
}

export function BackofficeStatus({ roleName }: BackofficeStatusProps) {
  const { fetchProfile } = useUserProfile();

  useEffect(() => {
    if (
      roleName &&
      ROLE_NOTIFICATION_ENDPOINT[roleName] &&
      roleName !== "Sales"
    ) {
      generalService.backofficeStatus();
    }
  }, [roleName]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <></>;
}
