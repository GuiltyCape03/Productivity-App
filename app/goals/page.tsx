"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { GoalsPanel } from "@/modules/goals/GoalsPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { PageLayout } from "@/components/layout/PageLayout";

function GoalsContent() {
  useSyncPreferences();
  return (
    <PageLayout
      eyebrow="Objetivos"
      title="Resultados medibles"
      description="Diseña metas con unidades claras, fechas límite y planes de seguimiento accesibles. Actualiza el avance en minutos para que el copiloto anticipe bloqueos."
    >
      <GoalsPanel />
    </PageLayout>
  );
}

export default function GoalsPage() {
  return (
    <DashboardProvider>
      <GoalsContent />
    </DashboardProvider>
  );
}
