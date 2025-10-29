"use client";

import { type ReactNode } from "react";
import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";

export function DashboardProviderWrapper({ children }: { children: ReactNode }) {
  return <DashboardProvider>{children}</DashboardProvider>;
}