"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { DashboardProvider, useDashboard } from "@/modules/dashboard/DashboardProvider";
import { useSyncPreferences } from "@/modules/dashboard/useSyncPreferences";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { loadChatHistory, persistChatHistory, resetChatHistory, type ChatHistoryTurn } from "@/lib/ai/chat";

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-3 rounded-2xl border border-border/40 bg-surface-elevated/60 px-4 py-2 text-xs font-medium text-foreground">
      <span className="uppercase tracking-[0.18em] text-foreground-muted">Copiloto</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-accent-primary/80"
            style={{ animation: "typing 1.2s ease-in-out infinite", animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-3 rounded-2xl border border-border/40 bg-surface-elevated/60 px-4 py-2 text-xs font-medium text-foreground">
      <span className="uppercase tracking-[0.18em] text-foreground-muted">Copiloto</span>
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-accent-primary/80"
            style={{ animation: "typing 1.2s ease-in-out infinite", animationDelay: `${index * 0.12}s` }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatView() {
  const { activeProjectId, setActiveProject, projects, snapshot, refreshSnapshot } = useDashboard();
  useSyncPreferences();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatHistoryTurn[]>(() => loadChatHistory(activeProjectId));
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const projectRef = useRef<string | null | undefined>(activeProjectId);
  const lastSummaryRef = useRef(snapshot?.summary ?? "");

  useEffect(() => {
    projectRef.current = activeProjectId;
    resetChatHistory(activeProjectId);
    setMessages([]);
  }, [activeProjectId]);

  useEffect(() => {
    const summary = snapshot?.summary ?? "";
    if (messages.length > 0 && summary && summary !== lastSummaryRef.current) {
      setMessages([]);
      resetChatHistory(projectRef.current ?? null);
    }
    lastSummaryRef.current = summary;
  }, [messages.length, snapshot?.summary]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chips = snapshot?.focusChips ?? [];
  const summary = snapshot?.summary ?? "Comparte tus prioridades de hoy y te sugeriré el siguiente bloque de trabajo.";
  const capacity = snapshot?.capacityMin ?? 0;

  const persist = useCallback((next: ChatHistoryTurn[]) => {
    persistChatHistory(projectRef.current ?? null, next);
  }, []);

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
      const history = [...messages, { role: "user", content: prompt, timestamp }].slice(-12);
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
        throw new Error("La API no entregó datos.");
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
      resetChatHistory(projectRef.current ?? null);
      persist([]);
      return [];
    });
  }, [persist]);

  const handleNewConversation = useCallback(() => {
    handleClear();
    setInput("");
  }, [handleClear]);

  const canSend = input.trim().length > 0 && !isStreaming;
  const projectOptions = useMemo(() => [{ id: "", name: "Todos los proyectos" }, ...projects], [projects]);
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
      controllerRef.current = null;
    };
  }, []);

  return (
    <PageLayout
      eyebrow="Copiloto en vivo"
      title="Chat inteligente"
      description="Conversación con memoria breve por proyecto, respuestas en streaming y recomendaciones accionables."
      aside={
        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-border/40 bg-surface-elevated/70 p-6 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-foreground">Contexto diario</h2>
              <Button variant="secondary" size="sm" onClick={refreshSnapshot} disabled={isStreaming}>
                Actualizar
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-foreground-muted">{summary}</p>
            <div className="flex flex-wrap gap-2 text-xs text-foreground-muted">
              {chips.length ? (
                chips.map((chip) => (
                  <span key={chip} className="rounded-full border border-border/40 bg-surface-muted/40 px-3 py-1">
                    {chip}
                  </span>
                ))
              ) : (
                <span>Registra metas o tareas clave para generar focos sugeridos.</span>
              )}
            </div>
            <Badge variant="outline" className="w-fit border-accent-primary/50 text-accent-primary">
              Capacidad estimada: {capacity} min
            </Badge>
          </div>

          <div className="space-y-3 rounded-3xl border border-border/40 bg-surface-elevated/70 p-6 shadow-card">
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
              El historial se mantiene solo durante la sesión actual y se reinicia al cambiar de proyecto o actualizar el panel.
            </p>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-surface-elevated/70 p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-foreground-muted">Sesión en curso</p>
            <h2 className="text-2xl font-semibold text-foreground">Memoria breve activa</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleNewConversation} disabled={isStreaming}>
              Nueva conversación
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} disabled={messages.length === 0 && !isStreaming}>
              Borrar historial
            </Button>
          </div>
        </div>

        <div className="relative flex h-[480px] flex-col gap-4 overflow-hidden rounded-2xl border border-border/40 bg-surface-elevated/60 p-4">
          <div className="flex-1 space-y-4 overflow-y-auto pr-3 scrollbar-thin" role="log" aria-live="polite">
            {messages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border/50 bg-surface-elevated/40 p-6 text-sm text-foreground-muted">
                Comparte qué quieres lograr y recibirás un plan paso a paso. También puedes pegar contenido para resumirlo.
              </p>
            ) : (
              messages.map((message, index) => (
                <article
                  key={`${message.timestamp}-${index}`}
                  className={
                    message.role === "assistant"
                      ? "flex w-full flex-col gap-2 text-sm"
                      : "flex w-full flex-col items-end gap-2 text-sm"
                  }
                >
                  <div
                    className={
                      message.role === "assistant"
                        ? "w-fit max-w-2xl rounded-2xl border border-border/40 bg-surface-elevated/80 px-5 py-4 text-foreground shadow-card"
                        : "w-fit max-w-2xl rounded-2xl bg-accent-primary/90 px-5 py-4 text-white shadow-card"
                    }
                  >
                    <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-foreground-muted/80">
                      <span className={message.role === "assistant" ? "text-foreground-muted" : "text-white/70"}>
                        {message.role === "assistant" ? "Copiloto" : "Tú"}
                      </span>
                      <span className={message.role === "assistant" ? "text-foreground-muted" : "text-white/70"}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap leading-relaxed">{message.content || "…"}</p>
                  </div>
                </article>
              ))
            )}
            {isStreaming && <TypingIndicator />}
            <div ref={endRef} />
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-[0.18em] text-foreground-muted" htmlFor="chat-message">
              Pregunta o instrucción
            </label>
            <Textarea
              id="chat-message"
              placeholder="Solicita un plan, un resumen o un borrador de mensaje…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              rows={3}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-xs text-foreground-muted">
              <span>Presiona Enter para enviar · Shift + Enter para salto de línea</span>
              {error && <Badge variant="danger">{error}</Badge>}
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={!canSend}>
                {isStreaming ? "Generando…" : "Enviar"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}

export default function ChatPage() {
  return (
    <DashboardProvider>
      <ChatView />
    </DashboardProvider>
  );
}
