"use client";

import dynamic from 'next/dynamic';
import { AppShell } from "@/components/layout/AppShell";
import { TasksPanel } from "@/modules/tasks/TasksPanel";
import { GoalsPanel } from "@/modules/goals/GoalsPanel";
import { WorkspacePanel } from "@/modules/workspace/WorkspacePanel";
import { CalendarPanel } from "@/modules/calendar/CalendarPanel";

import { PreferencesPanel } from "@/modules/preferences/PreferencesPanel";

export default function DashboardPage() {
  return (
    <AppShell
      tasks={<TasksPanel />}
      goals={<GoalsPanel />}
      workspace={<WorkspacePanel />}
      calendar={<CalendarPanel />}
      preferences={<PreferencesPanel />}
    />
  );
}
