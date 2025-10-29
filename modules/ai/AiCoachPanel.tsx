"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import { buildSnapshot } from "@/lib/ai/snapshot";
import { generateAssistantReply } from "@/lib/ai/chat";
import { v4 as uuid } from "uuid";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AiCoachPanel() {
  const dashboard = useDashboard();
  const { tasks, goals, projects, events, preferences, pages, connectedCalendar, snapshot: storedSnapshot } = dashboard;
  const strings = STRINGS.es.ai;
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const baseState = useMemo(
    () => ({
      tasks,
      goals,
      projects,
      events,
      preferences,
      pages,
      connectedCalendar,
      snapshot: storedSnapshot
    }),
    [tasks, goals, projects, events, preferences, pages, connectedCalendar, storedSnapshot]
  );

  const snapshot = useMemo(() => storedSnapshot ?? buildSnapshot(baseState), [storedSnapshot, baseState]);

  const ask = () => {
    if (!question.trim()) return;
    const prompt: Message = { id: uuid(), role: "user", content: question.trim() };
    const replyText = generateAssistantReply(baseState, { question: question.trim(), userName: "creador" });
    const response: Message = { id: uuid(), role: "assistant", content: replyText };
    setMessages((prev) => [...prev, prompt, response]);
    setQuestion("");
  };

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{strings.title}</CardTitle>
        <Button variant="ghost" onClick={dashboard.refreshSnapshot}>
          {strings.refresh}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Foco</Badge>
            {snapshot.focusProjects.length === 0 ? (
              <span className="text-sm text-white/60">Registra tareas para descubrir tu foco automático.</span>
            ) : (
              snapshot.focusProjects.map((projectId) => {
                const project = dashboard.projects.find((item) => item.id === projectId);
                return (
                  <Badge key={projectId} variant="sky">
                    {project?.name ?? "Proyecto"}
                  </Badge>
                );
              })
            )}
          </div>
          <p className="mt-3 text-sm text-white/70">{snapshot.summary}</p>
          <div className="mt-4 grid gap-2 text-sm text-white/60">
            <p>
              Capacidad disponible estimada: <span className="font-semibold text-white">{snapshot.bandwidthEstimateMinutes} min</span>
            </p>
            <p>Tareas recomendadas: {snapshot.recommendedTasks.map((id) => dashboard.tasks.find((task) => task.id === id)?.title).filter(Boolean).join(", ") || "Añade tareas"}</p>
            <p>Hábitos sugeridos: {snapshot.suggestedHabits.join(", ") || "Define metas con vencimiento"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={strings.askPlaceholder} onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                ask();
              }
            }} />
            <Button onClick={ask}>Preguntar</Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {messages.length === 0 ? (
              <p className="text-sm text-white/60">
                El chatbot conoce tus tareas, metas y eventos. Pregunta por tu avance, pide estimaciones o solicita un plan de rescate.
              </p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={message.role === "assistant" ? "rounded-2xl bg-accent-primary/10 p-3 text-sm text-white" : "rounded-2xl bg-white/10 p-3 text-sm text-white/80"}>
                  {message.content}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
