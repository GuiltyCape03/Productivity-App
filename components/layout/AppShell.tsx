"use client";

import { useEffect, useMemo } from "react";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
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
        return "from-violet-500/35 via-indigo-400/10 to-purple-900/0";
      case "sky":
        return "from-sky-400/35 via-cyan-300/10 to-blue-900/0";
      case "amber":
        return "from-amber-300/35 via-orange-200/10 to-amber-900/0";
      default:
        return "from-emerald-400/35 via-teal-300/10 to-emerald-900/0";
    }
  }, [prefs.accent]);

  return (
    <div className="relative isolate min-h-screen pb-16">
      <div className={cn("pointer-events-none absolute inset-x-0 top-[-320px] h-[520px] blur-3xl", `bg-gradient-to-b ${accentClass}`)} />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-12 sm:px-8">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-foreground-muted">Workspace Inteligente</p>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              NeuralDesk — Convierte propósito en progreso con un copiloto que entiende tus proyectos.
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground-muted">
              Prioriza lo que importa hoy, mantén sincronizados tus proyectos y obtén diagnósticos diarios para avanzar sin
              fricción.
            </p>
          </div>
          {snapshot && (
            <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface-elevated/90 p-5 shadow-soft backdrop-blur">
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant={snapshot.sentiment === "overloaded" ? "danger" : snapshot.sentiment === "stretch" ? "sky" : "default"}>
                  Copiloto IA
                </Badge>
                <Badge variant="muted">Capacidad estimada: {snapshot.bandwidthEstimateMinutes} min</Badge>
                {snapshot.nextBlock && <Badge variant="outline">Próximo bloque: {snapshot.nextBlock}</Badge>}
              </div>
              <p className="text-sm font-medium text-foreground">{snapshot.summary}</p>
              <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
                {(snapshot.focusChips ?? []).map((chip) => (
                  <span key={chip} className="rounded-full bg-surface-muted/70 px-3 py-1">
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <main className="lg:col-span-8 space-y-6">{tasks}{workspace}</main>
          <aside className="lg:col-span-4 space-y-6">{goals}{calendar}{ai}{preferences}</aside>
        </div>
      </div>
    </div>
  );
}
