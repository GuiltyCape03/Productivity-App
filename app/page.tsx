"use client";

import { DashboardProvider } from "@/modules/dashboard/DashboardProvider";
import { AppShell } from "@/components/layout/AppShell";
import { TasksPanel } from "@/modules/tasks/TasksPanel";
import { GoalsPanel } from "@/modules/goals/GoalsPanel";
import { WorkspacePanel } from "@/modules/workspace/WorkspacePanel";
import { CalendarPanel } from "@/modules/calendar/CalendarPanel";
import { AiCoachPanel } from "@/modules/ai/AiCoachPanel";
import { PreferencesPanel } from "@/modules/preferences/PreferencesPanel";

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <AppShell
        tasks={<TasksPanel />}
        goals={<GoalsPanel />}
        workspace={<WorkspacePanel />}
        calendar={<CalendarPanel />}
        ai={<AiCoachPanel />}
        preferences={<PreferencesPanel />}
      />
    </DashboardProvider>
  );
}
