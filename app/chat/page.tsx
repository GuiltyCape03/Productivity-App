"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DashboardProvider, useDashboard } from "@/modules/dashboard/DashboardProvider";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { loadChatHistory, persistChatHistory, type ChatHistoryTurn } from "@/lib/ai/chat";

function ChatView() {
  const { activeProjectId, setActiveProject, projects, snapshot, refreshSnapshot } = useDashboard();
  useSyncPreferences();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatHistoryTurn[]>(() => loadChatHistory(activeProjectId));
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const projectRef = useRef<string | null | undefined>(activeProjectId);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    projectRef.current = activeProjectId;
    setMessages(loadChatHistory(activeProjectId));
  }, [activeProjectId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  const chips = snapshot?.focusChips ?? [];
  const summary = snapshot?.summary ?? "Define tus objetivos del día y te propongo el primer bloque.";
  const capacity = snapshot?.capacityMin ?? 0;

  const persist = useCallback(
    (next: ChatHistoryTurn[]) => {
      persistChatHistory(projectRef.current ?? null, next);
    },
    []
  );

  const appendMessage = useCallback(
    (message: ChatHistoryTurn) => {
      setMessages((prev) => {
        const next = [...prev, message];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const updateAssistantMessage = useCallback(
    (content: string) => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const next = prev.slice();
        const lastIndex = next.length - 1;
        next[lastIndex] = { ...next[lastIndex], content };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const handleSend = useCallback(async () => {
    const prompt = input.trim();
    if (!prompt || isStreaming) return;
    setError(null);
    setInput("");
    const timestamp = new Date().toISOString();
    appendMessage({ role: "user", content: prompt, timestamp });
    setIsStreaming(true);

    const controller = new AbortController();
    controllerRef.current = controller;

    let received = false;
    let assistantText = "";
    let hadError = false;
    try {
      const history = [...messages, { role: "user", content: prompt, timestamp }].slice(-10);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: projectRef.current ?? null,
          messages: history.map(({ role, content }) => ({ role, content }))
        }),
        signal: controller.signal
      });

      if (!response.body) {
        throw new Error("La API no entregó datos");
      }

      appendMessage({ role: "assistant", content: "", timestamp: new Date().toISOString() });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;

      while (!finished) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const events = chunk.split("\n\n").filter(Boolean);
        for (const event of events) {
          if (!event.startsWith("data:")) continue;
          const data = event.replace(/^data:\s*/, "").trim();
          if (!data) continue;
          if (data === "[DONE]") {
            finished = true;
            break;
          }
          try {
            const parsed = JSON.parse(data) as { type?: string; delta?: string; error?: { message?: string } };
            if (parsed.error?.message) {
              setError(parsed.error.message);
              hadError = true;
              finished = true;
              break;
            }
            if (parsed.type === "response.output_text.delta" && parsed.delta) {
              assistantText += parsed.delta;
              received = true;
              updateAssistantMessage(assistantText);
            }
            if (parsed.type === "response.completed") {
              finished = true;
              break;
            }
          } catch (error) {
            console.warn("No se pudo parsear el evento SSE", error);
          }
        }
      }

      if (!received && !hadError) {
        updateAssistantMessage("No se generó respuesta. Inténtalo nuevamente en unos segundos.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar la solicitud.";
      hadError = true;
      setError(message);
    } finally {
      controllerRef.current = null;
      setIsStreaming(false);
      refreshSnapshot();
    }
  }, [appendMessage, input, isStreaming, messages, refreshSnapshot, updateAssistantMessage]);

  const handleClear = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setIsStreaming(false);
    setError(null);
    setMessages(() => {
      persist([]);
      return [];
    });
  }, [persist]);

  const canSend = input.trim().length > 0 && !isStreaming;
  const projectOptions = useMemo(() => [{ id: "", name: "Todos los proyectos" }, ...projects], [projects]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-16 md:px-8">
      <div className="pt-4 md:pt-6">
        <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Copiloto en vivo</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">Chat inteligente</h1>
        <p className="mt-3 max-w-2xl text-[15.5px] leading-7 text-foreground-muted">
          Sigue la conversación con tu asistente. Memoria breve por proyecto y respuestas en streaming.
        </p>
      </div>

      <Card className="border border-border/60 bg-surface-elevated/70">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle>Contexto diario</CardTitle>
            <p className="text-sm text-foreground">{summary}</p>
            <p className="text-sm text-foreground-muted">
              Capacidad estimada: {capacity} min. Ajusta tus metas y tareas para aprovechar el día.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
              {chips.length ? (
                chips.map((chip) => (
                  <span key={chip} className="rounded-full bg-surface-muted/60 px-3 py-1">
                    {chip}
                  </span>
                ))
              ) : (
                <span>Registra tareas y metas para obtener focos sugeridos.</span>
              )}
            </div>
          </div>
          <Button variant="secondary" onClick={refreshSnapshot} disabled={isStreaming}>
            Actualizar snapshot
          </Button>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-foreground-muted" htmlFor="chat-project">
                Proyecto activo
              </label>
              <Select
                id="chat-project"
                value={activeProjectId ?? ""}
                onChange={(event) => setActiveProject(event.target.value || null)}
              >
                {projectOptions.map((project) => (
                  <option key={project.id || "all"} value={project.id}>
                    {project.id ? project.name : "Todos los proyectos"}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-foreground-muted">
                El historial se guarda localmente por proyecto. Cambia el proyecto para alternar conversaciones.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-foreground-muted" htmlFor="chat-message">
                Pregunta o instrucción
              </label>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  id="chat-message"
                  placeholder="Pide un plan o un resumen del avance…"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                />
                <Button onClick={handleSend} disabled={!canSend}>
                  {isStreaming ? "Generando…" : "Enviar"}
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                  Borrar historial
                </Button>
                {error && <Badge variant="danger">{error}</Badge>}
              </div>
            </div>
          </div>
          <div className="flex min-h-[440px] flex-col gap-3 rounded-2xl border border-border/60 bg-surface-elevated/40 p-4">
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin" role="log" aria-live="polite">
              {messages.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border/50 bg-surface-elevated/30 p-4 text-sm text-foreground-muted">
                  Todavía no hay mensajes. Comparte en qué quieres avanzar hoy y recibirás un plan al instante.
                </p>
              ) : (
                messages.map((message, index) => (
                  <article
                    key={`${message.timestamp}-${index}`}
                    className={
                      message.role === "assistant"
                        ? "rounded-2xl bg-accent-primary/15 p-3 text-sm text-foreground"
                        : "rounded-2xl border border-border/60 bg-surface-elevated/45 p-3 text-sm text-foreground"
                    }
                  >
                    <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                      <span>{message.role === "assistant" ? "Copiloto" : "Tú"}</span>
                      <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{message.content || "…"}</p>
                  </article>
                ))
              )}
              <div ref={endRef} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ChatPage() {
  return (
    <DashboardProvider>
      <ChatView />
    </DashboardProvider>
  );
}
