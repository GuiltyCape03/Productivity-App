"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { buildSnapshot } from "@/lib/ai/snapshot";

const variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * index, duration: 0.35, ease: [0.22, 1, 0.36, 1] }
  })
};

export function DailyDiagnostic() {
  const {
    tasks,
    goals,
    projects,
    events,
    preferences,
    pages,
    activeProjectId,
    connectedCalendar,
    snapshot,
    refreshSnapshot
  } = useDashboard();

  const computed = useMemo(
    () =>
      snapshot ??
      buildSnapshot({
        tasks,
        goals,
        projects,
        events,
        preferences,
        pages,
        activeProjectId,
        connectedCalendar
      }),
    [activeProjectId, connectedCalendar, events, goals, pages, preferences, projects, snapshot, tasks]
  );

  const progress = computed.totalEstimateMinutes === 0
    ? 0
    : Math.min(100, Math.round(((computed.totalEstimateMinutes - computed.capacityMin) / computed.totalEstimateMinutes) * 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      className="glass-panel overflow-hidden p-1"
    >
      <div className="rounded-[28px] border border-border/50 bg-surface-elevated/90 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-foreground-subtle">Diagnóstico diario</p>
            <h2 className="text-2xl font-semibold text-foreground">Nivel de carga actual</h2>
            <p className="text-sm text-foreground-muted">
              {computed.summary ?? "Activa proyectos y metas para que el copiloto sugiera bloques enfocados."}
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={refreshSnapshot}>
            Actualizar diagnóstico
          </Button>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/40 bg-surface-elevated/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground-subtle">Capacidad disponible</p>
            <p className="mt-1 text-3xl font-semibold text-foreground">{computed.capacityMin} min</p>
            <p className="mt-2 text-xs text-foreground-muted">Reserva bloques de 50/10 para proteger tu energía.</p>
            <div className="mt-4 h-2 rounded-full bg-surface-muted/60" aria-hidden>
              <div className="h-full rounded-full bg-accent-primary" style={{ width: `${Math.max(8, progress)}%` }} />
            </div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-surface-elevated/80 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-foreground-subtle">Siguiente bloque sugerido</p>
            <p className="mt-1 text-lg font-medium text-foreground">
              {computed.nextBlock ?? "Define una meta o tarea importante y generaré el primer bloque."}
            </p>
            <p className="mt-2 text-xs text-foreground-muted">
              Diagnóstico generado según tus tareas, metas y agenda registrada.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="border-accent-primary/50 text-accent-primary">
                Estado: {computed.sentiment === "overloaded" ? "Sobrecarga" : computed.sentiment === "stretch" ? "Con presión" : "Equilibrado"}
              </Badge>
              <Badge variant="muted">Pendientes: {computed.pendingCount}</Badge>
            </div>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-[0.18em] text-foreground-subtle">Focos recomendados</p>
          <div className="flex flex-wrap gap-2">
            {computed.focusChips.length > 0 ? (
              computed.focusChips.map((chip, index) => (
                <motion.span
                  key={chip}
                  className="rounded-full border border-border/40 bg-surface-muted/50 px-3 py-1 text-xs text-foreground"
                  variants={variants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  {chip}
                </motion.span>
              ))
            ) : (
              <span className="text-sm text-foreground-muted">
                Sin focos todavía. Marca una tarea como prioritaria o define metas con fecha.
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
