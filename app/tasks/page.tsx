"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { TasksPanel } from "@/modules/tasks/TasksPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function TasksContent() {
  useSyncPreferences();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 md:px-8">
      <header className="pt-6 md:pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Tareas</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Acciones priorizadas</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Define objetivos mínimos, agrupa por proyecto y registra avances en minutos estimados.
        </p>
      </header>
      <section>
        <TasksPanel />
      </section>
    </div>
  );
}

export default function TasksPage() {
  return (
    <DashboardProvider>
      <TasksContent />
    </DashboardProvider>
  );
}
