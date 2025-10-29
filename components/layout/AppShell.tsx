"use client";

import { useEffect, useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { STRINGS } from "@/i18n/strings";
import { cn } from "@/styles/utils";
import { Badge } from "@/components/ui/badge";

interface AppShellProps {
  tasks: React.ReactNode;
  goals: React.ReactNode;
  workspace: React.ReactNode;
  calendar: React.ReactNode;
  ai: React.ReactNode;
  preferences: React.ReactNode;
}

export function AppShell({ tasks, goals, workspace, calendar, ai, preferences }: AppShellProps) {
  const { preferences: prefs, snapshot } = useDashboard();

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = prefs.theme;
    }
  }, [prefs.theme]);

  const accentClass = useMemo(() => {
    switch (prefs.accent) {
      case "violet":
        return "from-violet-500/60 to-purple-600/20";
      case "sky":
        return "from-sky-400/60 to-blue-600/20";
      case "amber":
        return "from-amber-400/60 to-orange-500/20";
      default:
        return "from-emerald-400/60 to-lime-500/20";
    }
  }, [prefs.accent]);

  const strings = STRINGS.es;

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <div className={cn("pointer-events-none absolute inset-x-0 top-[-240px] h-[480px] blur-3xl", `bg-gradient-to-b ${accentClass}`)} />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-white">{strings.dashboardTitle}</h1>
            <p className="text-sm text-white/60">Convierte propósito en progreso con un copiloto que entiende tus proyectos.</p>
          </div>
          {snapshot && (
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <Badge variant={snapshot.sentiment === "overloaded" ? "danger" : snapshot.sentiment === "stretch" ? "sky" : "default"}>
                IA
              </Badge>
              <div>
                <p className="text-sm font-medium text-white">{snapshot.summary}</p>
                <p className="text-xs text-white/60">Capacidad estimada: {snapshot.bandwidthEstimateMinutes} min</p>
              </div>
            </div>
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-8">
            {tasks}
            {workspace}
          </div>
          <div className="lg:col-span-4 space-y-8">
            {goals}
            {calendar}
            {ai}
            {preferences}
          </div>
        </div>
      </div>
    </div>
  );
}
