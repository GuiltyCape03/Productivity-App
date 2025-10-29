"use client";

import { PreferencesPanel } from "@/modules/preferences/PreferencesPanel";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { PageLayout } from "@/components/layout/PageLayout";

export default function PreferencesPage() {
  useSyncPreferences();
  return (
    <PageLayout
      eyebrow="Configuración"
      title="Preferencias de la experiencia"
      description="Ajusta tono visual, densidad y acentos de NeuralDesk. Los cambios son instantáneos y se guardan en tu navegador."
    >
      <PreferencesPanel />
    </PageLayout>
  );
}
