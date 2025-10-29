"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { CalendarPanel } from "@/modules/calendar/CalendarPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function CalendarContent() {
  useSyncPreferences();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 md:px-8">
      <header className="pt-6 md:pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Calendario</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Compromisos reales</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Visualiza tus eventos, sincroniza Google Calendar y organiza bloques profundos sin perder el foco.
        </p>
      </header>
      <section>
        <CalendarPanel />
      </section>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <DashboardProvider>
      <CalendarContent />
    </DashboardProvider>
  );
}
