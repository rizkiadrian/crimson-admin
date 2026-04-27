"use client";

import { useEffect } from "react";
import { generalService } from "@services/general";
import { useUserProfile } from "@store/useUserProfile";
import { BUSINESSFLOW } from "@config/env";

export function BackofficeStatus() {
  const { fetchProfile, profile } = useUserProfile();

  useEffect(() => {
    const handler = async () => {
      if (profile) {
        if (BUSINESSFLOW.backofficeRoles.includes(profile.role_name)) {
          const resp = await generalService.backofficeStatus();
          return resp;
        }
      }
    };
    handler();
  }, [profile]);

  useEffect(() => {
    const handler = async () => {
      fetchProfile();
    };
    handler();
  }, [fetchProfile]);

  return <></>;
}
