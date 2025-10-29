"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { buildSnapshot } from "@/lib/ai/snapshot";
import type {
  CalendarEvent,
  DashboardPreferences,
  DashboardState,
  Goal,
  Project,
  Task,
  TaskStatus,
  WorkspacePage
} from "./types";

interface DashboardContextValue extends DashboardState {
  addTask: (input: Pick<Task, "title" | "description" | "projectId" | "dueDate" | "estimateMinutes" | "priority">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  toggleTaskStatus: (id: string, status?: TaskStatus) => void;
  addGoal: (input: Pick<Goal, "title" | "projectId" | "targetUnits" | "unitLabel" | "dueDate">) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  addProject: (name: string) => Project;
  removeProject: (id: string) => void;
  setActiveProject: (id: string | null) => void;
  upsertPage: (page: WorkspacePage) => void;
  deletePage: (id: string) => void;
  addEvent: (event: Omit<CalendarEvent, "id">) => void;
  updatePreferences: (updates: Partial<DashboardPreferences>) => void;
  refreshSnapshot: () => void;
  recordCalendarState: (payload: DashboardState["connectedCalendar"] | undefined) => void;
}

const STORAGE_KEY = "neuraldesk.dashboard.v1";
const TASK_STORAGE_PREFIX = "neuraldesk.tasks.";
const GOAL_STORAGE_PREFIX = "neuraldesk.goals.";
const ACTIVE_PROJECT_KEY = "neuraldesk.dashboard.active-project";

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

const initialState: DashboardState = {
  tasks: [],
  goals: [],
  projects: [],
  pages: [],
  events: [],
  preferences: {
    theme: "dark",
    cardTone: "glass",
    cardShadow: "soft",
    fieldShape: "filled",
    density: "comfortable",
    accent: "emerald"
  },
  activeProjectId: null
};

function loadState(): DashboardState {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as DashboardState) : initialState;
    const base: DashboardState = {
      ...initialState,
      ...parsed,
      preferences: { ...initialState.preferences, ...parsed.preferences },
      activeProjectId:
        parsed.activeProjectId ?? window.localStorage.getItem(ACTIVE_PROJECT_KEY) ?? initialState.activeProjectId
    };

    const taskMap = new Map<string, Task>();
    const goalMap = new Map<string, Goal>();

    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key) continue;
      try {
        if (key.startsWith(TASK_STORAGE_PREFIX)) {
          const payload = window.localStorage.getItem(key);
          if (payload) {
            const items = JSON.parse(payload) as Task[];
            items.forEach((item) => taskMap.set(item.id, item));
          }
        }
        if (key.startsWith(GOAL_STORAGE_PREFIX)) {
          const payload = window.localStorage.getItem(key);
          if (payload) {
            const items = JSON.parse(payload) as Goal[];
            items.forEach((item) => goalMap.set(item.id, item));
          }
        }
      } catch (error) {
        console.warn("No se pudo leer la colección almacenada", { key, error });
      }
    }

    const mergedTasks = base.tasks.slice();
    taskMap.forEach((value) => {
      if (!mergedTasks.some((task) => task.id === value.id)) {
        mergedTasks.push(value);
      }
    });

    const mergedGoals = base.goals.slice();
    goalMap.forEach((value) => {
      if (!mergedGoals.some((goal) => goal.id === value.id)) {
        mergedGoals.push(value);
      }
    });

    return {
      ...base,
      tasks: mergedTasks,
      goals: mergedGoals
    };
  } catch (error) {
    console.warn("No se pudo cargar el estado almacenado", error);
    return initialState;
  }
}

type Action =
  | { type: "hydrate"; payload: DashboardState }
  | { type: "set"; payload: (prev: DashboardState) => DashboardState };

function reducer(state: DashboardState, action: Action): DashboardState {
  switch (action.type) {
    case "hydrate":
      return action.payload;
    case "set":
      return action.payload(state);
    default:
      return state;
  }
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    dispatch({ type: "hydrate", payload: loadState() });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;

    const taskBuckets = new Map<string, Task[]>();
    state.tasks.forEach((task) => {
      const key = `${TASK_STORAGE_PREFIX}${task.projectId ?? "inbox"}`;
      const list = taskBuckets.get(key) ?? [];
      taskBuckets.set(key, [...list, task]);
    });

    const goalBuckets = new Map<string, Goal[]>();
    state.goals.forEach((goal) => {
      const key = `${GOAL_STORAGE_PREFIX}${goal.projectId ?? "inbox"}`;
      const list = goalBuckets.get(key) ?? [];
      goalBuckets.set(key, [...list, goal]);
    });

    const storage = window.localStorage;

    for (const [key, list] of taskBuckets.entries()) {
      storage.setItem(key, JSON.stringify(list));
    }
    for (const [key, list] of goalBuckets.entries()) {
      storage.setItem(key, JSON.stringify(list));
    }

    const seenTaskKeys = new Set(taskBuckets.keys());
    const seenGoalKeys = new Set(goalBuckets.keys());
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (!key) continue;
      if (key.startsWith(TASK_STORAGE_PREFIX) && !seenTaskKeys.has(key)) {
        keysToRemove.push(key);
      }
      if (key.startsWith(GOAL_STORAGE_PREFIX) && !seenGoalKeys.has(key)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  }, [state.tasks, state.goals, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined" || !hydrated) return;
    if (state.activeProjectId) {
      window.localStorage.setItem(ACTIVE_PROJECT_KEY, state.activeProjectId);
    } else {
      window.localStorage.removeItem(ACTIVE_PROJECT_KEY);
    }
  }, [state.activeProjectId, hydrated]);

  const setState = useCallback((updater: (prev: DashboardState) => DashboardState) => {
    dispatch({ type: "set", payload: updater });
  }, []);

  const addProject = useCallback<DashboardContextValue["addProject"]>((name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error("El nombre del proyecto es obligatorio");
    }

    const project: Project = {
      id: createId(),
      name: trimmed,
      color: `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0")}`,
      createdAt: new Date().toISOString()
    };

    setState((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
      activeProjectId: project.id
    }));

    return project;
  }, [setState]);

  const addTask = useCallback<DashboardContextValue["addTask"]>((input) => {
    const now = new Date().toISOString();
    const projectId = input.projectId ?? null;

    const task: Task = {
      id: createId(),
      title: input.title.trim(),
      description: input.description?.trim() || undefined,
      projectId,
      dueDate: input.dueDate,
      estimateMinutes: input.estimateMinutes,
      priority: input.priority,
      status: "pending",
      createdAt: now,
      updatedAt: now
    };

    setState((prev) => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));
  }, [setState]);

  const updateTask = useCallback<DashboardContextValue["updateTask"]>((id, updates) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
    }));
  }, [setState]);

  const removeTask = useCallback<DashboardContextValue["removeTask"]>((id) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id)
    }));
  }, [setState]);

  const toggleTaskStatus = useCallback<DashboardContextValue["toggleTaskStatus"]>((id, status) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: status ?? (task.status === "done" ? "pending" : "done"),
              updatedAt: new Date().toISOString()
            }
          : task
      )
    }));
  }, [setState]);

  const addGoal = useCallback<DashboardContextValue["addGoal"]>((input) => {
    const now = new Date().toISOString();
    const goal: Goal = {
      id: createId(),
      title: input.title.trim(),
      projectId: input.projectId ?? null,
      targetUnits: Math.max(1, Math.round(input.targetUnits)),
      completedUnits: 0,
      unitLabel: input.unitLabel.trim(),
      dueDate: input.dueDate,
      createdAt: now,
      updatedAt: now
    };

    setState((prev) => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));
  }, [setState]);

  const updateGoal = useCallback<DashboardContextValue["updateGoal"]>((id, updates) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((goal) =>
        goal.id === id
          ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
          : goal
      )
    }));
  }, [setState]);

  const removeGoal = useCallback<DashboardContextValue["removeGoal"]>((id) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((goal) => goal.id !== id)
    }));
  }, [setState]);

  const removeProject = useCallback<DashboardContextValue["removeProject"]>((id) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
      tasks: prev.tasks.map((task) => (task.projectId === id ? { ...task, projectId: null } : task)),
      goals: prev.goals.map((goal) => (goal.projectId === id ? { ...goal, projectId: null } : goal)),
      events: prev.events.map((event) => (event.projectId === id ? { ...event, projectId: null } : event)),
      activeProjectId: prev.activeProjectId === id ? null : prev.activeProjectId
    }));
  }, [setState]);

  const setActiveProject = useCallback<DashboardContextValue["setActiveProject"]>((id) => {
    setState((prev) => ({
      ...prev,
      activeProjectId: id
    }));
  }, [setState]);

  const upsertPage = useCallback<DashboardContextValue["upsertPage"]>((page) => {
    setState((prev) => {
      const exists = prev.pages.some((existing) => existing.id === page.id);
      const now = new Date().toISOString();
      const payload: WorkspacePage = {
        ...page,
        updatedAt: now,
        createdAt: exists ? page.createdAt : now
      };

      return {
        ...prev,
        pages: exists
          ? prev.pages.map((existing) => (existing.id === page.id ? payload : existing))
          : [...prev.pages, payload]
      };
    });
  }, [setState]);

  const deletePage = useCallback<DashboardContextValue["deletePage"]>((id) => {
    setState((prev) => ({
      ...prev,
      pages: prev.pages.filter((page) => page.id !== id)
    }));
  }, [setState]);

  const addEvent = useCallback<DashboardContextValue["addEvent"]>((event) => {
    const now = new Date().toISOString();
    const payload: CalendarEvent = {
      ...event,
      id: createId(),
      metadata: event.metadata ?? {},
      start: event.start,
      end: event.end
    };

    setState((prev) => ({
      ...prev,
      events: [...prev.events, { ...payload, metadata: { ...payload.metadata, createdAt: now } }]
    }));
  }, [setState]);

  const updatePreferences = useCallback<DashboardContextValue["updatePreferences"]>((updates) => {
    setState((prev) => ({
      ...prev,
      preferences: { ...prev.preferences, ...updates }
    }));
  }, [setState]);

  const refreshSnapshot = useCallback(() => {
    setState((prev) => ({
      ...prev,
      snapshot: buildSnapshot(prev)
    }));
  }, [setState]);

  const recordCalendarState = useCallback<DashboardContextValue["recordCalendarState"]>((payload) => {
    setState((prev) => ({
      ...prev,
      connectedCalendar: payload
    }));
  }, [setState]);

  const value = useMemo<DashboardContextValue>(() => ({
    ...state,
    addTask,
    updateTask,
    removeTask,
    toggleTaskStatus,
    addGoal,
    updateGoal,
    removeGoal,
    addProject,
    removeProject,
    setActiveProject,
    upsertPage,
    deletePage,
    addEvent,
    updatePreferences,
    refreshSnapshot,
    recordCalendarState
  }), [
    state,
    addTask,
    updateTask,
    removeTask,
    toggleTaskStatus,
    addGoal,
    updateGoal,
    removeGoal,
    addProject,
    removeProject,
    setActiveProject,
    upsertPage,
    deletePage,
    addEvent,
    updatePreferences,
    refreshSnapshot,
    recordCalendarState
  ]);

  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard solo puede usarse dentro de DashboardProvider");
  }
  return context;
}
