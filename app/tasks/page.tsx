"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { TasksPanel } from "@/modules/tasks/TasksPanel";
import { PageLayout } from "@/components/layout/PageLayout";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function TasksContent() {
  useSyncPreferences();
  return (
    <PageLayout
      eyebrow="Gestión diaria"
      title="Acciones priorizadas"
      description="Define objetivos mínimos, agrupa por proyecto y registra avances estimados. Cada bloque está pensado para darte claridad y foco inmediato."
    >
      <TasksPanel />
    </PageLayout>
  );
}

export default function TasksPage() {
  return (
    <DashboardProvider>
      <TasksContent />
    </DashboardProvider>
  );
}
