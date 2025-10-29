import type { DashboardState, Task } from "@/modules/dashboard/types";
import { buildSnapshot } from "./snapshot";

export interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const memoryStore = new Map<string, MemoryTurn[]>();
const lastHashStore = new Map<string, string>();
const chatStore = new Map<string, ChatHistoryTurn[]>();

function normaliseProjectKey(projectId: string | null | undefined) {
  return projectId ?? "inbox";
}

function simpleHash(payload: string) {
  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash << 5) - hash + payload.charCodeAt(index);
    hash |= 0;
  }
  return hash.toString(16);
}

function loadMemory(projectId: string) {
  return memoryStore.get(projectId)?.slice(-10) ?? [];
}

export function loadAssistantMemory(projectId: string | null | undefined) {
  return loadMemory(normaliseProjectKey(projectId));
}

function persistMemory(projectId: string, turns: MemoryTurn[]) {
  memoryStore.set(projectId, turns.slice(-10));
}

export function resetAssistantMemory(projectId: string | null | undefined) {
  memoryStore.delete(normaliseProjectKey(projectId));
}

function getLastHash(projectId: string) {
  const today = new Date().toISOString().slice(0, 10);
  return lastHashStore.get(`${projectId}.${today}`);
}

function persistLastHash(projectId: string, hash: string) {
  const today = new Date().toISOString().slice(0, 10);
  lastHashStore.set(`${projectId}.${today}`, hash);
}

export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function loadChat(projectId: string) {
  return chatStore.get(projectId)?.slice(-10) ?? [];
}

function persistChat(projectId: string, turns: ChatHistoryTurn[]) {
  chatStore.set(projectId, turns.slice(-10));
}

export function loadChatHistory(projectId: string | null | undefined) {
  return loadChat(normaliseProjectKey(projectId));
}

export function persistChatHistory(projectId: string | null | undefined, turns: ChatHistoryTurn[]) {
  persistChat(normaliseProjectKey(projectId), turns);
}

export function resetChatHistory(projectId: string | null | undefined) {
  chatStore.delete(normaliseProjectKey(projectId));
}

export function clearAllChatHistory() {
  chatStore.clear();
  memoryStore.clear();
  lastHashStore.clear();
}

function pickOpener(sentiment: "steady" | "overloaded" | "stretch", index: number) {
  const variants = {
    steady: [
      "Carga equilibrada. Podés seguir avanzando con calma.",
      "El panorama está bajo control; mantén el pulso constante.",
      "Buen balance de pendientes, aprovechemos el momentum."
    ],
    stretch: [
      "Notas de tensión: necesitas foco selectivo.",
      "Hay bastante en el tablero, juguemos a priorizar.",
      "Sensación de estiramiento: recorta ruido y protege bloques profundos."
    ],
    overloaded: [
      "Sobrecarga detectada. Urge simplificar.",
      "Demasiado en curso: hay que reducir antes de agregar.",
      "Estamos excediendo la capacidad; diseñemos un rescate mínimo."
    ]
  };
  const options = variants[sentiment];
  return options[index % options.length];
}

function formatTasks(tasks: Task[]) {
  if (tasks.length === 0) {
    return "• Aún no registras próximas acciones. Define una micro-tarea de 25 min.";
  }
  return tasks
    .slice(0, 4)
    .map((task, index) => {
      const label = `${index + 1}. ${task.title}`;
      const estimate = task.estimateMinutes ? `${task.estimateMinutes} min` : "25 min estimados";
      const priority = task.priority === "high" ? "prioridad alta" : task.priority === "low" ? "prioridad baja" : "prioridad media";
      return `• ${label} — ${estimate}, ${priority}`;
    })
    .join("\n");
}

export function generateAssistantReply(
  state: DashboardState,
  options: { userName?: string; question?: string; projectId?: string | null }
) {
  const snapshot = state.snapshot ?? buildSnapshot(state);
  const activeProject = options.projectId ?? state.activeProjectId ?? null;
  const projectKey = normaliseProjectKey(activeProject);
  const memory = loadMemory(projectKey);
  const userName = options.userName ?? "creador";
  const recommendedTasks = snapshot.recommendedTasks
    .map((id) => state.tasks.find((task) => task.id === id))
    .filter((task): task is Task => Boolean(task));

  const focusNames = snapshot.focusChips.filter((chip) => chip.startsWith("Proyecto:"));
  const contextLine = focusNames.length > 0 ? focusNames.join(", ") : "Sin proyecto activo";
  const habitsLine = snapshot.suggestedHabits.length
    ? snapshot.suggestedHabits.map((habit) => `• ${habit}`).join("\n")
    : "• Define una meta semanal para obtener recordatorios inteligentes.";
  const question = options.question?.trim();

  let attempt = 0;
  let reply = "";
  let hash = "";
  const lastHash = getLastHash(projectKey);

  while (attempt < 3) {
    const opener = pickOpener(snapshot.sentiment, Math.floor(Math.random() * 3) + attempt);
    const header = `Diagnóstico ${new Date().toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short"
    })}`;
    const capacityLine = `Capacidad disponible: ${snapshot.capacityMin} min de ${snapshot.totalEstimateMinutes} min estimados.`;
    const blockLine = `Bloques sugeridos (50/10): ${snapshot.nextBlock ?? "Planifica un bloque inicial de 50 min y una pausa de 10 min."}`;
    const tasksSection = formatTasks(recommendedTasks);
    const answerLine = question
      ? question.match(/avance|progreso/i)
        ? `Avance: ${state.tasks.filter((task) => task.status === "done").length} completadas, ${snapshot.pendingCount} por cerrar.`
        : question.match(/calendario|agenda/i)
          ? `Calendario inmediato: ${state.events
              .slice(0, 3)
              .map((event) => `${event.title} (${new Date(event.start).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })})`)
              .join(", ") || "sin compromisos registrados"}.`
          : `Sobre «${question}»: crea un entregable pequeño hoy y registra hallazgos al cierre.`
      : undefined;

    const narrative = [
      header,
      opener,
      snapshot.summary,
      capacityLine,
      blockLine,
      `Contexto activo: ${contextLine}.`,
      `Metas del día: ${snapshot.dailyGoal ?? "Aún no defines una meta concreta para hoy."}`,
      "Siguientes focos:",
      tasksSection,
      "Hábitos recomendados:",
      habitsLine,
      answerLine,
      `Cierra el día con una nota de progreso y prepara el primer bloque de mañana, ${userName}.`
    ]
      .filter(Boolean)
      .join("\n");

    reply = narrative;
    hash = simpleHash(narrative.replace(/\s+/g, " "));
    if (hash !== lastHash) {
      break;
    }
    attempt += 1;
  }

  persistLastHash(projectKey, hash);

  const updatedMemory: MemoryTurn[] = [
    ...memory,
    ...(question
      ? [{ role: "user", content: question, timestamp: new Date().toISOString() } as MemoryTurn]
      : []),
    { role: "assistant", content: reply, timestamp: new Date().toISOString() }
  ].slice(-10);
  persistMemory(projectKey, updatedMemory);

  return reply;
}
