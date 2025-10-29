"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { buildSnapshot } from "@/lib/ai/snapshot";
import { generateAssistantReply, loadAssistantMemory, type MemoryTurn } from "@/lib/ai/chat";

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function AiCoachPanel() {
  const dashboard = useDashboard();
  const {
    tasks,
    goals,
    projects,
    events,
    preferences,
    pages,
    connectedCalendar,
    snapshot: storedSnapshot,
    activeProjectId,
    setActiveProject,
    refreshSnapshot
  } = dashboard;
  const strings = STRINGS.es.ai;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<MemoryTurn[]>(() => loadAssistantMemory(activeProjectId));
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    setMessages(loadAssistantMemory(activeProjectId));
  }, [activeProjectId]);

  const baseState = useMemo(
    () => ({
      tasks,
      goals,
      projects,
      events,
      preferences,
      pages,
      connectedCalendar,
      snapshot: storedSnapshot,
      activeProjectId
    }),
    [
      tasks,
      goals,
      projects,
      events,
      preferences,
      pages,
      connectedCalendar,
      storedSnapshot,
      activeProjectId
    ]
  );

  const snapshot = useMemo(() => storedSnapshot ?? buildSnapshot(baseState), [storedSnapshot, baseState]);

  const ask = () => {
    if (!question.trim()) return;
    const prompt = question.trim();
    setIsThinking(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt, timestamp: new Date().toISOString() }
    ]);
    setQuestion("");

    requestAnimationFrame(() => {
      generateAssistantReply(baseState, {
        question: prompt,
        userName: "creador",
        projectId: activeProjectId
      });
      setMessages(loadAssistantMemory(activeProjectId));
      setIsThinking(false);
      if (!storedSnapshot) {
        refreshSnapshot();
      }
    });
  };

  const projectOptions = [{ id: "", name: "Todos los proyectos" }, ...projects];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{strings.title}</CardTitle>
          <p className="text-sm text-foreground-muted">
            Diagnóstico diario con memoria breve. Planifica en bloques de 50/10 y obtén feedback contextual de tus proyectos.
          </p>
        </div>
        <Button variant="secondary" onClick={refreshSnapshot} aria-label="Actualizar plan de IA">
          {strings.refresh}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3 rounded-2xl border border-border/60 bg-surface-base/40 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{snapshot.pendingCount} pendientes</Badge>
            <Badge variant="outline">{snapshot.bandwidthEstimateMinutes} min disponibles</Badge>
            {snapshot.nextBlock && <Badge variant="sky">{snapshot.nextBlock}</Badge>}
          </div>
          <p className="text-sm text-foreground">{snapshot.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
            {snapshot.focusChips.map((chip) => (
              <span key={chip} className="rounded-full bg-surface-muted/60 px-3 py-1">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ai-project">Proyecto activo</Label>
            <Select
              id="ai-project"
              value={activeProjectId ?? ""}
              onChange={(event) => setActiveProject(event.target.value || null)}
            >
              {projectOptions.map((project) => (
                <option key={project.id || "all"} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-foreground-muted">El copiloto memoriza hasta 10 turnos por proyecto.</p>
          </div>
          <div className="space-y-2">
            <Label>Hábitos sugeridos</Label>
            <div className="rounded-xl border border-dashed border-border/60 bg-surface-base/30 p-3 text-xs text-foreground-muted">
              {snapshot.suggestedHabits.length ? (
                <ul className="space-y-1">
                  {snapshot.suggestedHabits.map((habit) => (
                    <li key={habit}>{habit}</li>
                  ))}
                </ul>
              ) : (
                <p>Define una meta con fecha para recibir recordatorios aquí.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ai-question">Haz una pregunta</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="ai-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={strings.askPlaceholder}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  ask();
                }
              }}
            />
            <Button onClick={ask} disabled={isThinking} aria-live="polite">
              {isThinking ? "Pensando…" : "Preguntar"}
            </Button>
          </div>
          <p className="text-xs text-foreground-muted">
            Ejemplos: “¿Cómo voy con mi avance?”, “Propón un bloque para investigación”, “Resume mi calendario”.
          </p>
        </div>

        <div className="max-h-72 space-y-3 overflow-y-auto pr-1 scrollbar-thin" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/60 bg-surface-base/30 p-4 text-sm text-foreground-muted">
              El chatbot conoce tus tareas, metas y calendario. Haz una pregunta para iniciar la conversación.
            </p>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.timestamp}-${index}`}
                className={
                  message.role === "assistant"
                    ? "rounded-2xl bg-accent-primary/15 p-3 text-sm text-foreground"
                    : "rounded-2xl border border-border/60 bg-surface-base/40 p-3 text-sm text-foreground"
                }
              >
                <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                  <span>{message.role === "assistant" ? "Copiloto" : "Tú"}</span>
                  <span>{formatTimestamp(message.timestamp)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
