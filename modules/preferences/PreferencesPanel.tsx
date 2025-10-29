"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { DashboardPreferences } from "@/modules/dashboard/types";

const THEMES: Array<{ value: DashboardPreferences["theme"]; label: string }> = [
  { value: "dark", label: "Oscuro" },
  { value: "light", label: "Claro" }
];

const TONES: Array<{ value: DashboardPreferences["cardTone"]; label: string }> = [
  { value: "glass", label: "Glassmorphism" },
  { value: "solid", label: "Sólido" },
  { value: "gradient", label: "Gradiente" }
];

const SHADOWS: Array<{ value: DashboardPreferences["cardShadow"]; label: string }> = [
  { value: "off", label: "Sin sombras" },
  { value: "soft", label: "Suave" },
  { value: "strong", label: "Marcada" }
];

const FIELDS: Array<{ value: DashboardPreferences["fieldShape"]; label: string }> = [
  { value: "filled", label: "Relleno" },
  { value: "outlined", label: "Contorno" },
  { value: "underline", label: "Subrayado" }
];

const DENSITIES: Array<{ value: DashboardPreferences["density"]; label: string }> = [
  { value: "compact", label: "Compacta" },
  { value: "cozy", label: "Acogedora" },
  { value: "comfortable", label: "Amplia" }
];

const ACCENTS: Array<{ value: DashboardPreferences["accent"]; label: string }> = [
  { value: "emerald", label: "Esmeralda" },
  { value: "violet", label: "Violeta" },
  { value: "sky", label: "Celeste" },
  { value: "amber", label: "Ámbar" }
];

export function PreferencesPanel() {
  const { preferences, updatePreferences } = useDashboard();
  const strings = STRINGS.es.preferences;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{strings.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>{strings.theme}</Label>
            <Select value={preferences.theme} onChange={(event) => updatePreferences({ theme: event.target.value as DashboardPreferences["theme"] })}>
              {THEMES.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{strings.tone}</Label>
            <Select value={preferences.cardTone} onChange={(event) => updatePreferences({ cardTone: event.target.value as DashboardPreferences["cardTone"] })}>
              {TONES.map((tone) => (
                <option key={tone.value} value={tone.value}>
                  {tone.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{strings.shadow}</Label>
            <Select value={preferences.cardShadow} onChange={(event) => updatePreferences({ cardShadow: event.target.value as DashboardPreferences["cardShadow"] })}>
              {SHADOWS.map((shadow) => (
                <option key={shadow.value} value={shadow.value}>
                  {shadow.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{strings.fields}</Label>
            <Select value={preferences.fieldShape} onChange={(event) => updatePreferences({ fieldShape: event.target.value as DashboardPreferences["fieldShape"] })}>
              {FIELDS.map((field) => (
                <option key={field.value} value={field.value}>
                  {field.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{strings.density}</Label>
            <Select value={preferences.density} onChange={(event) => updatePreferences({ density: event.target.value as DashboardPreferences["density"] })}>
              {DENSITIES.map((density) => (
                <option key={density.value} value={density.value}>
                  {density.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{strings.accent}</Label>
            <Select value={preferences.accent} onChange={(event) => updatePreferences({ accent: event.target.value as DashboardPreferences["accent"] })}>
              {ACCENTS.map((accent) => (
                <option key={accent.value} value={accent.value}>
                  {accent.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
