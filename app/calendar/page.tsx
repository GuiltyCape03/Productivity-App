"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { CalendarPanel } from "@/modules/calendar/CalendarPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { PageLayout } from "@/components/layout/PageLayout";

function CalendarContent() {
  useSyncPreferences();
  return (
    <PageLayout
      eyebrow="Calendario"
      title="Compromisos reales"
      description="Visualiza tus eventos, sincroniza calendarios externos y protege tus bloques profundos. Reordena agenda, bloquea tiempos y comparte disponibilidad en segundos."
    >
      <CalendarPanel />
    </PageLayout>
  );
}

export default function CalendarPage() {
  return (
    <DashboardProvider>
      <CalendarContent />
    </DashboardProvider>
  );
}
