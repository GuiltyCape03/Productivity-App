"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { AiCoachPanel } from "@/modules/ai/AiCoachPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function CoachContent() {
  useSyncPreferences();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 md:px-8">
      <header className="pt-6 md:pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Copiloto</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Diagnóstico y foco</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Analiza tu carga actual, recibe focos sugeridos y consulta la memoria breve por proyecto.
        </p>
      </header>
      <section>
        <AiCoachPanel />
      </section>
    </div>
  );
}

export default function CoachPage() {
  return (
    <DashboardProvider>
      <CoachContent />
    </DashboardProvider>
  );
}
