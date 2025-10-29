"use client";

import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { DailyDiagnostic } from "@/modules/dashboard/DailyDiagnostic";
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
  const summary =
    snapshot?.summary ?? "Comparte tus prioridades y el copiloto armará bloques realistas para tu energía.";
  const capacity = snapshot?.capacityMin ?? 0;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24 sm:px-10">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
        className="rounded-[32px] border border-border/50 bg-surface-elevated/90 p-8 shadow-card backdrop-blur-2xl"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-foreground-subtle">NeuralDesk Copiloto</p>
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">
                Convierte intención en progreso tangible.
              </h1>
            </div>
            <p className="max-w-2xl text-sm leading-relaxed text-foreground-muted">
              Prioriza, crea tareas y metas al vuelo y deja que el copiloto se encargue del foco. Cada bloque responde a tu
              energía disponible y al contexto del proyecto activo.
            </p>
          </div>
          <Badge variant="outline" className="h-fit rounded-2xl border-accent-primary/60 px-4 py-2 text-accent-primary">
            Capacidad disponible: {capacity} min
          </Badge>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-xs text-foreground-muted">
          {chips.length > 0 ? (
            chips.map((chip) => (
              <span key={chip} className="rounded-full border border-border/40 bg-surface-muted/40 px-3 py-1">
                {chip}
              </span>
            ))
          ) : (
            <span>Activa un proyecto o crea la primera meta para recibir focos sugeridos.</span>
          )}
        </div>
      </motion.header>

      <DailyDiagnostic />

      <motion.p
        className="text-sm font-medium text-foreground-muted"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      >
        {summary}
      </motion.p>

      <div className="layout-grid items-start gap-8">
        <section className="col-span-12 space-y-6 xl:col-span-8" aria-label="Panel principal">
          <div className="space-y-6">
            {tasks}
            {workspace}
            {goals}
          </div>
        </section>
        <aside className="col-span-12 space-y-6 xl:col-span-4" aria-label="Seguimiento y copiloto">
          {calendar}
          <div className="glass-panel p-1">
            <div className="rounded-[26px] border border-border/50 bg-surface-elevated/80 p-6 shadow-card">
              {ai}
            </div>
          </div>
          {preferences}
        </aside>
      </div>
    </div>
  );
}
