"use client";

import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
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
  const { snapshot } = useDashboard();
  useSyncPreferences();

  const chips = snapshot?.focusChips ?? [];
  const summary = snapshot?.summary ?? "Define 1–3 tareas concretas para activar recomendaciones inteligentes.";
  const capacity = snapshot?.capacityMin ?? 0;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-16 md:px-12">
      <header className="pt-6 md:pt-10">
        <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface-elevated/60 p-8 shadow-card backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-foreground-muted">NeuralDesk</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Convierte propósito en progreso real.
              </h1>
            </div>
            <Badge variant="outline" className="whitespace-nowrap border-accent-primary/60 text-accent-primary">
              Capacidad disponible: {capacity} min
            </Badge>
          </div>
          <p className="max-w-3xl text-base leading-relaxed text-foreground-muted">
            Prioriza con claridad, mantén foco en tus proyectos clave y recibe diagnósticos diarios del copiloto. Este panel integra tareas, metas, calendario y el espacio colaborativo de tu equipo.
          </p>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-foreground-muted">
            {chips.length > 0 ? (
              chips.map((chip) => (
                <span key={chip} className="rounded-full border border-border/60 bg-surface-muted/40 px-3 py-1">
                  {chip}
                </span>
              ))
            ) : (
              <span>Agrega metas con fecha o tareas críticas para generar focos sugeridos.</span>
            )}
          </div>
        </div>
      </header>

      <p className="text-sm font-medium text-foreground/90">
        {summary}
      </p>

      <div className="layout-grid items-start">
        <section className="col-span-12 space-y-10 xl:col-span-8" aria-label="Panel principal">
          <div className="space-y-10">
            {tasks}
            {workspace}
            {goals}
          </div>
        </section>
        <aside className="col-span-12 space-y-10 xl:col-span-4" aria-label="Seguimiento y copiloto">
          {calendar}
          <div className="glass-panel rounded-3xl border border-border/40 p-1">
            <div className="rounded-[26px] border border-border/40 bg-surface-elevated/70 p-6 shadow-card">
              {ai}
            </div>
          </div>
          {preferences}
        </aside>
      </div>
    </div>
  );
}
