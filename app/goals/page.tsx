"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { GoalsPanel } from "@/modules/goals/GoalsPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function GoalsContent() {
  useSyncPreferences();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 md:px-8">
      <header className="pt-6 md:pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Metas</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Resultados medibles</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Diseña metas con unidades de avance, fechas claras y planes de seguimiento accesibles.
        </p>
      </header>
      <section>
        <GoalsPanel />
      </section>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <DashboardProvider>
      <GoalsContent />
    </DashboardProvider>
  );
}
