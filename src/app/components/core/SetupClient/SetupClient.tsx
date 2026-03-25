"use client";

import { generalService } from "@services/general";
import { useEffect } from "react";

export const SetupClient = () => {
  useEffect(() => {
    const handler = async () => {
      const resp = await generalService.pingTest();
      return resp;
    };
    handler();
  }, []);

  return <></>;
};
