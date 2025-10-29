export type TaskStatus = "pending" | "in-progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string | null;
  dueDate?: string;
  estimateMinutes?: number;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  title: string;
  projectId: string | null;
  targetUnits: number;
  completedUnits: number;
  unitLabel: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface WorkspacePage {
  id: string;
  title: string;
  icon: string;
  blocks: Array<{
    id: string;
    type: "heading" | "text" | "checklist" | "divider" | "callout";
    content: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  projectId: string | null;
  source: "google" | "manual";
  metadata?: Record<string, string>;
}

export interface AiSnapshot {
  focusProjects: string[];
  recommendedTasks: string[];
  suggestedHabits: string[];
  bandwidthEstimateMinutes: number;
  sentiment: "steady" | "overloaded" | "stretch";
  summary: string;
  focusChips: string[];
  pendingCount: number;
  totalEstimateMinutes: number;
  dailyGoal?: string;
  nextBlock?: string;
}

export type DialogTone = "glass" | "solid" | "gradient";
export type CardShadow = "off" | "soft" | "strong";
export type FieldShape = "outlined" | "filled" | "underline";

export interface DashboardPreferences {
  theme: "dark" | "light";
  cardTone: DialogTone;
  cardShadow: CardShadow;
  fieldShape: FieldShape;
  density: "compact" | "cozy" | "comfortable";
  accent: "emerald" | "violet" | "sky" | "amber";
}

export interface DashboardState {
  tasks: Task[];
  goals: Goal[];
  projects: Project[];
  pages: WorkspacePage[];
  events: CalendarEvent[];
  snapshot?: AiSnapshot;
  preferences: DashboardPreferences;
  activeProjectId: string | null;
  connectedCalendar?: {
    accountEmail: string;
    lastSynced?: string;
    status: "connected" | "error" | "connecting";
    error?: string;
  };
}
