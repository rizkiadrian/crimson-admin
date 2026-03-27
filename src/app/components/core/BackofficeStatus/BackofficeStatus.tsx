"use client";

import { useEffect } from "react";
import { generalService } from "@services/general";

export function BackofficeStatus() {
  useEffect(() => {
    const handler = async () => {
      const resp = await generalService.backofficeStatus();
      return resp;
    };
    handler();
  }, []);

  return <></>;
}
