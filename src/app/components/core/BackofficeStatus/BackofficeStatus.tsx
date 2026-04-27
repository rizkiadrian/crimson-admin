"use client";

import { useEffect } from "react";
import { generalService } from "@services/general";
import { useUserProfile } from "@store/useUserProfile";
import { BUSINESSFLOW } from "@config/env";

interface BackofficeStatusProps {
  roleName: string | null;
}

export function BackofficeStatus({ roleName }: BackofficeStatusProps) {
  const { fetchProfile } = useUserProfile();

  useEffect(() => {
    if (roleName && BUSINESSFLOW.backofficeRoles.includes(roleName)) {
      generalService.backofficeStatus();
    }
  }, [roleName]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return <></>;
}
