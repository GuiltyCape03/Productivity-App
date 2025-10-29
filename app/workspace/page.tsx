"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { WorkspacePanel } from "@/modules/workspace/WorkspacePanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";

function WorkspaceContent() {
  useSyncPreferences();
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 pb-16 md:px-8">
      <header className="pt-6 md:pt-8">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Workspace</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Páginas y rituales</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Construye páginas estilo Notion, conecta proyectos y abre tus documentos en pestañas independientes.
        </p>
      </header>
      <section>
        <WorkspacePanel />
      </section>
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <DashboardProvider>
      <WorkspaceContent />
    </DashboardProvider>
  );
}
