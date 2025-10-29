import { addMinutes, format, formatISO } from "date-fns";
import type { AiSnapshot, DashboardState, Task } from "@/modules/dashboard/types";

function pickTopTasks(tasks: Task[]): string[] {
  return tasks
    .filter((task) => task.status !== "done")
    .sort((a, b) => {
      const priorityMap: Record<string, number> = { high: 2, medium: 1, low: 0 };
      const priorityDiff = priorityMap[b.priority] - priorityMap[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dueA - dueB;
    })
    .slice(0, 5)
    .map((task) => task.id);
}

function deriveSentiment(backlogMinutes: number, capacityMinutes: number): AiSnapshot["sentiment"] {
  if (backlogMinutes === 0) return "steady";
  if (backlogMinutes <= capacityMinutes * 1.1) return "steady";
  if (backlogMinutes <= capacityMinutes * 1.6) return "stretch";
  return "overloaded";
}

export function buildSnapshot(state: DashboardState): AiSnapshot {
  const incompleteTasks = state.tasks.filter((task) => task.status !== "done");
  const totalMinutes = incompleteTasks.reduce((sum, task) => sum + (task.estimateMinutes ?? 50), 0);
  const focusProjects = Array.from(new Set(incompleteTasks.map((task) => task.projectId).filter(Boolean))) as string[];

  const recommendedTasks = pickTopTasks(state.tasks);
  const habits = state.goals
    .filter((goal) => goal.dueDate)
    .sort((a, b) => (a.dueDate ?? "") < (b.dueDate ?? "") ? -1 : 1)
    .slice(0, 3)
    .map((goal) => `Revisa ${goal.title}`);

  const capacityMinutes = 240;
  const sentiment = deriveSentiment(totalMinutes, capacityMinutes);
  const summary =
    sentiment === "overloaded"
      ? "Tu bandeja supera la capacidad estimada; elige máximo tres tareas clave."
      : sentiment === "stretch"
        ? "Hay bastante en curso, prioriza bloques profundos y delega tareas ligeras."
        : "Tu plan luce balanceado, mantén el ritmo y agenda descansos activos.";

  const focusNames = focusProjects
    .map((id) => state.projects.find((project) => project.id === id)?.name)
    .filter((name): name is string => Boolean(name));

  const dailyGoalCandidate = state.goals
    .filter((goal) => goal.projectId ? focusProjects.includes(goal.projectId) : true)
    .sort((a, b) => {
      const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return dueA - dueB;
    })[0];

  const dailyGoal = dailyGoalCandidate
    ? `${dailyGoalCandidate.title} (${dailyGoalCandidate.completedUnits}/${dailyGoalCandidate.targetUnits} ${dailyGoalCandidate.unitLabel})`
    : undefined;

  const now = new Date();
  const blockEnd = addMinutes(now, 50);
  const breakEnd = addMinutes(blockEnd, 10);
  const nextBlock = `${format(now, "HH:mm")}–${format(blockEnd, "HH:mm")} foco · descanso ${format(blockEnd, "HH:mm")}-${format(breakEnd, "HH:mm")}`;

  const focusChips = [
    `${incompleteTasks.length} tareas activas`,
    `${Math.min(totalMinutes, capacityMinutes)} min estimados`,
    dailyGoal ? `Meta: ${dailyGoal}` : undefined,
    ...focusNames.map((name) => `Proyecto: ${name}`)
  ].filter((chip): chip is string => Boolean(chip));

  return {
    focusProjects,
    recommendedTasks,
    suggestedHabits: habits,
    bandwidthEstimateMinutes: Math.min(totalMinutes, capacityMinutes),
    sentiment,
    summary,
    focusChips,
    pendingCount: incompleteTasks.length,
    totalEstimateMinutes: totalMinutes,
    dailyGoal,
    nextBlock
  };
}

export function simulateChatPlan(state: DashboardState) {
  const now = formatISO(new Date(), { representation: "date" });
  return {
    headline: `Agenda inteligente para ${now}`,
    focus: state.snapshot?.focusProjects ?? [],
    payload: state.snapshot ?? buildSnapshot(state)
  };
}
