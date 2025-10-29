import type { DashboardState, Task } from "@/modules/dashboard/types";
import { buildSnapshot } from "./snapshot";

export interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const MEMORY_PREFIX = "neuraldesk.ai.memory.";
const LAST_PREFIX = "neuraldesk.ai.last.";
const CHAT_HISTORY_PREFIX = "nd.chat.v1.";

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
  if (typeof window === "undefined") return [] as MemoryTurn[];
  try {
    const raw = window.localStorage.getItem(`${MEMORY_PREFIX}${projectId}`);
    if (!raw) return [] as MemoryTurn[];
    const parsed = JSON.parse(raw) as MemoryTurn[];
    return parsed.slice(-10);
  } catch (error) {
    console.warn("No se pudo leer la memoria de la IA", error);
    return [] as MemoryTurn[];
  }
}

export function loadAssistantMemory(projectId: string | null | undefined) {
  return loadMemory(normaliseProjectKey(projectId));
}

function persistMemory(projectId: string, turns: MemoryTurn[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${MEMORY_PREFIX}${projectId}`, JSON.stringify(turns.slice(-10)));
  } catch (error) {
    console.warn("No se pudo guardar la memoria de la IA", error);
  }
}

function getLastHash(projectId: string) {
  if (typeof window === "undefined") return undefined;
  const today = new Date().toISOString().slice(0, 10);
  return window.localStorage.getItem(`${LAST_PREFIX}${projectId}.${today}`) ?? undefined;
}

function persistLastHash(projectId: string, hash: string) {
  if (typeof window === "undefined") return;
  const today = new Date().toISOString().slice(0, 10);
  window.localStorage.setItem(`${LAST_PREFIX}${projectId}.${today}`, hash);
}

export interface ChatHistoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

function loadChat(projectId: string) {
  if (typeof window === "undefined") return [] as ChatHistoryTurn[];
  try {
    const raw = window.localStorage.getItem(`${CHAT_HISTORY_PREFIX}${projectId}`);
    if (!raw) return [] as ChatHistoryTurn[];
    const parsed = JSON.parse(raw) as ChatHistoryTurn[];
    return Array.isArray(parsed) ? parsed.slice(-50) : [];
  } catch (error) {
    console.warn("No se pudo leer el historial del chat", error);
    return [] as ChatHistoryTurn[];
  }
}

function persistChat(projectId: string, turns: ChatHistoryTurn[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(`${CHAT_HISTORY_PREFIX}${projectId}`, JSON.stringify(turns.slice(-50)));
  } catch (error) {
    console.warn("No se pudo guardar el historial del chat", error);
  }
}

export function loadChatHistory(projectId: string | null | undefined) {
  return loadChat(normaliseProjectKey(projectId));
}

export function persistChatHistory(projectId: string | null | undefined, turns: ChatHistoryTurn[]) {
  persistChat(normaliseProjectKey(projectId), turns);
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
