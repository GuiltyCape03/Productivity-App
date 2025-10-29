"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { WorkspacePanel } from "@/modules/workspace/WorkspacePanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { PageLayout } from "@/components/layout/PageLayout";

function WorkspaceContent() {
  useSyncPreferences();
  return (
    <PageLayout
      eyebrow="Workspace vivo"
      title="Páginas y rituales"
      description="Construye vistas tipo Notion, agrupa documentos por proyecto y actualiza rituales sin perder contexto. Las pestañas dinámicas guardan tu última sesión."
    >
      <WorkspacePanel />
    </PageLayout>
  );
}

export default function WorkspacePage() {
  return (
    <DashboardProvider>
      <WorkspaceContent />
    </DashboardProvider>
  );
}
