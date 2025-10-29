"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { buildSnapshot } from "@/lib/ai/snapshot";
import {
  generateAssistantReply,
  loadAssistantMemory,
  resetAssistantMemory,
  type MemoryTurn
} from "@/lib/ai/chat";

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
  const streamTimeout = useRef<number | null>(null);
  const summaryRef = useRef(storedSnapshot?.summary ?? "");

  useEffect(() => {
    resetAssistantMemory(activeProjectId);
    setMessages([]);
  }, [activeProjectId]);

  useEffect(() => {
    const summary = storedSnapshot?.summary ?? "";
    if (messages.length > 0 && summary && summary !== summaryRef.current) {
      resetAssistantMemory(activeProjectId);
      setMessages([]);
    }
    summaryRef.current = summary;
  }, [activeProjectId, messages.length, storedSnapshot?.summary]);

  useEffect(() => {
    return () => {
      if (streamTimeout.current) {
        window.clearTimeout(streamTimeout.current);
        streamTimeout.current = null;
      }
    };
  }, []);

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

  const chips = snapshot?.focusChips ?? [];
  const summary = snapshot?.summary ?? "Define 1–3 tareas y te armo el primer bloque.";
  const capacity = snapshot?.capacityMin ?? 0;
  const habits = snapshot?.suggestedHabits ?? [];

  const simulateStreaming = (fullText: string) => {
    const chunks = fullText.split(/(?<=[.!?])\s+/).filter(Boolean);
    let current = "";
    const runChunk = (index: number) => {
      if (index >= chunks.length) {
        setIsThinking(false);
        setMessages(loadAssistantMemory(activeProjectId));
        return;
      }
      current = current ? `${current} ${chunks[index]}` : chunks[index];
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.slice();
        const last = next[next.length - 1];
        next[next.length - 1] = { ...last, content: current };
        return next;
      });
      streamTimeout.current = window.setTimeout(() => runChunk(index + 1), 140);
    };
    runChunk(0);
  };

  const ask = () => {
    if (!question.trim()) return;
    const prompt = question.trim();
    setIsThinking(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: prompt, timestamp: new Date().toISOString() }
    ]);
    setQuestion("");

    window.setTimeout(() => {
      const reply = generateAssistantReply(baseState, {
        question: prompt,
        userName: "creador",
        projectId: activeProjectId
      });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", timestamp: new Date().toISOString() }
      ]);
      simulateStreaming(reply);
      if (!storedSnapshot) {
        refreshSnapshot();
      }
    }, 80);
  };

  const projectOptions = [{ id: "", name: "Todos los proyectos" }, ...projects];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-surface-elevated/60 p-6 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Copiloto activo</p>
            <h2 className="text-2xl font-semibold text-foreground">{strings.title}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => { resetAssistantMemory(activeProjectId); setMessages([]); }}>
              Nueva conversación
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetAssistantMemory(activeProjectId);
                setMessages([]);
              }}
            >
              Borrar historial
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={refreshSnapshot}
              aria-label="Actualizar plan de IA"
            >
              {strings.refresh}
            </Button>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-foreground-muted">
          Diagnóstico diario con memoria breve por proyecto. El asistente responde en streaming y propone bloques de trabajo inteligentes.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={snapshot?.sentiment === "overloaded" ? "danger" : snapshot?.sentiment === "stretch" ? "sky" : "default"}>
            Estado IA
          </Badge>
          <Badge variant="muted">Capacidad estimada: {capacity} min</Badge>
          {snapshot?.nextBlock && <Badge variant="outline">Próximo bloque: {snapshot.nextBlock}</Badge>}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
          {chips.length ? (
            chips.map((chip) => (
              <span key={chip} className="rounded-full border border-border/60 bg-surface-muted/40 px-3 py-1">
                {chip}
              </span>
            ))
          ) : (
            <span>Activa proyectos y metas para generar focos sugeridos.</span>
          )}
        </div>
      </div>

      <div className="grid gap-5 rounded-3xl border border-border/40 bg-surface-elevated/70 p-6 shadow-card md:grid-cols-2">
        <div className="space-y-3">
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
          <p className="text-xs text-foreground-muted">El copiloto guarda hasta 10 turnos recientes por proyecto en tu navegador.</p>
        </div>
        <div className="space-y-3">
          <Label>Hábitos sugeridos</Label>
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/50 p-4 text-xs text-foreground-muted">
            {habits.length ? (
              <ul className="space-y-1">
                {habits.map((habit) => (
                  <li key={habit}>{habit}</li>
                ))}
              </ul>
            ) : (
              <p>Define una meta con fecha para recibir recordatorios personalizados aquí.</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-3xl border border-border/40 bg-surface-elevated/70 p-6 shadow-card">
        <Label htmlFor="ai-question">Haz una pregunta</Label>
        <div className="flex flex-col gap-3 md:flex-row">
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
          Ejemplos: “¿Cómo voy con mi avance?”, “Propón un bloque para investigación”, “Resume mi agenda de hoy”.
        </p>
      </div>

      <div
        className="max-h-72 space-y-3 overflow-y-auto rounded-3xl border border-border/40 bg-surface-elevated/70 p-5 pr-2 scrollbar-thin"
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-4 text-sm text-foreground-muted">
            El chatbot conoce tus tareas, metas y calendario. Haz una pregunta para iniciar la conversación.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.timestamp}-${index}`}
              className={
                message.role === "assistant"
                  ? "rounded-2xl bg-accent-primary/18 p-4 text-sm text-foreground"
                  : "rounded-2xl border border-border/60 bg-surface-elevated/50 p-4 text-sm text-foreground"
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
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="h-2 w-2 rounded-full bg-accent-primary" style={{ animation: "typing 1s ease-in-out infinite" }} />
            <span className="h-2 w-2 rounded-full bg-accent-primary/80" style={{ animation: "typing 1s ease-in-out infinite", animationDelay: "0.12s" }} />
            <span className="h-2 w-2 rounded-full bg-accent-primary/60" style={{ animation: "typing 1s ease-in-out infinite", animationDelay: "0.24s" }} />
          </div>
        )}
      </div>
    </div>
  );
}
