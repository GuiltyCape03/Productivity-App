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
      document.body.dataset.density = prefs.density;
    }
  }, [prefs.theme, prefs.density]);

  const accentClass = useMemo(() => {
    switch (prefs.accent) {
      case "violet":
        return "from-violet-400/35 via-indigo-400/10 to-transparent";
      case "sky":
        return "from-sky-400/35 via-cyan-300/10 to-transparent";
      case "amber":
        return "from-amber-300/40 via-orange-200/15 to-transparent";
      default:
        return "from-emerald-400/40 via-teal-300/15 to-transparent";
    }
  }, [prefs.accent]);

  const chips = snapshot?.focusChips ?? [];
  const summary = snapshot?.summary ?? "Define 1–3 tareas para generar el primer bloque inteligente.";
  const capacity = snapshot?.capacityMin ?? 0;

  return (
    <div className="relative isolate min-h-screen">
      <div className={cn("pointer-events-none absolute inset-x-0 top-[-320px] h-[520px] blur-3xl", `bg-gradient-to-b ${accentClass}`)} />
      <header className="max-w-7xl mx-auto px-6 md:px-8 pt-10 md:pt-14">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Workspace inteligente</p>
        <h1 className="mt-2 text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
          NeuralDesk — Convierte propósito en progreso.
        </h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Prioriza lo que importa hoy, sincroniza proyectos y recibe diagnósticos diarios sin fricción.
        </p>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface-elevated/90 p-5 shadow-card backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={snapshot?.sentiment === "overloaded" ? "danger" : snapshot?.sentiment === "stretch" ? "sky" : "default"}>
              Copiloto IA
            </Badge>
            <Badge variant="muted">Capacidad estimada: {capacity} min</Badge>
            {snapshot?.nextBlock && <Badge variant="outline">Próximo bloque: {snapshot.nextBlock}</Badge>}
          </div>
          <p className="text-sm font-medium text-foreground" aria-live="polite">
            {summary}
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
            {chips.length > 0 ? (
              chips.map((chip) => (
                <span key={chip} className="rounded-full bg-surface-muted/70 px-3 py-1">
                  {chip}
                </span>
              ))
            ) : (
              <span className="text-xs text-foreground-muted/80">Registra una meta con fecha para ver focos sugeridos.</span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-8 pb-16">
        <div className="mt-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <section id="workspace" className="md:col-span-7 space-y-6 md:space-y-8" aria-label="Planeación diaria">
            {tasks}
            {workspace}
          </section>
          <aside className="md:col-span-5 space-y-6 md:space-y-8" aria-label="Seguimiento y copiloto">
            {goals}
            {calendar}
            {ai}
            {preferences}
          </aside>
        </div>
      </main>
    </div>
  );
}
