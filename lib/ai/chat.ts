import type { DashboardState, Task } from "@/modules/dashboard/types";
import { buildSnapshot } from "./snapshot";

const RESPONSE_TEMPLATES = {
  steady: (
    name: string,
    focus: string,
    tasks: Task[]
  ) =>
    `Hola ${name}, tus prioridades lucen equilibradas. Te sugiero empezar por ${tasks
      .slice(0, 2)
      .map((task) => `"${task.title}"`)
      .join(" y ")} y reservar bloques profundos para ${focus}.`,
  stretch: (
    name: string,
    focus: string,
    tasks: Task[]
  ) =>
    `${name}, percibo mucha energía invertida. Para recuperar control enfócate en ${focus} y completa ${tasks
      .slice(0, 1)
      .map((task) => `"${task.title}"`)
      .join(" y ")} antes del mediodía.`,
  overloaded: (
    name: string,
    focus: string,
    tasks: Task[]
  ) =>
    `${name}, la carga supera la capacidad estimada. Elige solo una tarea clave (${tasks
      .slice(0, 1)
      .map((task) => `"${task.title}"`)
      .join(" y ")}), pospone o delega el resto y programa una revisión con tu mentor.`
};

export function generateAssistantReply(
  state: DashboardState,
  options: { userName?: string; question?: string }
) {
  const snapshot = state.snapshot ?? buildSnapshot(state);
  const focus = snapshot.focusProjects
    .map((id) => state.projects.find((project) => project.id === id)?.name ?? "proyecto clave")
    .join(", ") || "tu objetivo principal";
  const recommendedTasks = snapshot.recommendedTasks
    .map((id) => state.tasks.find((task) => task.id === id))
    .filter((task): task is Task => Boolean(task));

  const base = RESPONSE_TEMPLATES[snapshot.sentiment](options.userName ?? "creador", focus, recommendedTasks);

  const question = options.question?.trim();
  if (!question) {
    return base;
  }

  if (/avance|progreso/i.test(question)) {
    const doneTasks = state.tasks.filter((task) => task.status === "done");
    return `${base}\n\nHas completado ${doneTasks.length} tareas y quedan ${state.tasks.length - doneTasks.length}. Marca una reflexión de 5 minutos para celebrar lo logrado.`;
  }

  if (/calendario|agenda/i.test(question)) {
    return `${base}\n\nRecuerda revisar tus próximos eventos: ${state.events
      .slice(0, 3)
      .map((event) => `${event.title} (${new Date(event.start).toLocaleString()})`)
      .join(", ") || "no hay compromisos en la agenda"}.`;
  }

  return `${base}\n\nSobre tu pregunta «${question}», mi recomendación es dividirla en un entregable pequeño hoy y reservar un repaso nocturno para documentar aprendizajes.`;
}
