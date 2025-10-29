"use client";

import { useEffect } from "react";
import { useDashboard } from "./DashboardProvider";

export function useSyncPreferences() {
  const { preferences } = useDashboard();

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = preferences.theme;
    document.body.dataset.density = preferences.density;
  }, [preferences.theme, preferences.density]);

  return preferences;
}
