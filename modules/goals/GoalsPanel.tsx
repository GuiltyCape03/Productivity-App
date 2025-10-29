"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { Goal } from "@/modules/dashboard/types";

const NEW_PROJECT_VALUE = "__goal_new__";

interface FormState {
  title: string;
  projectId: string | null;
  targetUnits: number;
  unitLabel: string;
  dueDate?: string;
}

const defaultForm: FormState = {
  title: "",
  projectId: null,
  targetUnits: 10,
  unitLabel: "unidades",
  dueDate: undefined
};

function formatProgress(goal: Goal) {
  const ratio = goal.targetUnits === 0 ? 0 : goal.completedUnits / goal.targetUnits;
  return Math.min(100, Math.round(ratio * 100));
}

function GoalRow({ goal, onUpdate, onDelete }: {
  goal: Goal;
  onUpdate: (updates: Partial<Goal>) => void;
  onDelete: () => void;
}) {
  const progress = formatProgress(goal);
  const due = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) : null;
  return (
    <div className="space-y-3 rounded-2xl border border-border/60 bg-surface-base/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{goal.title}</p>
          <p className="text-xs text-foreground-muted">
            {goal.completedUnits}/{goal.targetUnits} {goal.unitLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="sky">{progress}%</Badge>
          {due && <Badge variant="muted">Objetivo {due}</Badge>}
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
        <button
          type="button"
          className="transition hover:text-foreground"
          onClick={() => onUpdate({ completedUnits: Math.min(goal.targetUnits, goal.completedUnits + 1) })}
        >
          +1 progreso
        </button>
        <button
          type="button"
          className="transition hover:text-foreground"
          onClick={() => onUpdate({ completedUnits: Math.max(0, goal.completedUnits - 1) })}
        >
          -1 progreso
        </button>
        {goal.projectId && <span>Proyecto #{goal.projectId.slice(0, 4)}</span>}
      </div>
      <div className="h-2 rounded-full bg-surface-muted/60" aria-hidden>
        <div className="h-full rounded-full bg-accent-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function GoalsPanel() {
  const {
    goals,
    projects,
    addGoal,
    updateGoal,
    removeGoal,
    addProject,
    activeProjectId,
    setActiveProject
  } = useDashboard();
  const strings = STRINGS.es.goals;
  const [form, setForm] = useState<FormState>({ ...defaultForm, projectId: activeProjectId ?? null });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setForm((prev) => ({ ...prev, projectId: activeProjectId ?? null }));
  }, [activeProjectId]);

  const filteredGoals = useMemo(() => {
    if (!activeProjectId) return goals;
    return goals.filter((goal) => goal.projectId === activeProjectId);
  }, [goals, activeProjectId]);

  const ordered = useMemo(
    () => filteredGoals.slice().sort((a, b) => (a.dueDate ?? "") < (b.dueDate ?? "") ? -1 : 1),
    [filteredGoals]
  );

  const handleProjectChange = (value: string) => {
    if (value === NEW_PROJECT_VALUE) {
      const name = window.prompt("Nombre del nuevo proyecto");
      if (!name) return;
      try {
        const project = addProject(name);
        setActiveProject(project.id);
        setForm((prev) => ({ ...prev, projectId: project.id }));
      } catch (error) {
        console.error(error);
      }
      return;
    }
    setForm((prev) => ({ ...prev, projectId: value || null }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Escribe una meta clara.");
      return;
    }
    if (form.targetUnits < 1) {
      setError("Define una meta con al menos una unidad.");
      return;
    }

    addGoal({
      title: form.title.trim(),
      projectId: form.projectId,
      targetUnits: form.targetUnits,
      unitLabel: form.unitLabel.trim() || "unidades",
      dueDate: form.dueDate
    });
    setForm({ ...defaultForm, projectId: activeProjectId ?? null });
    setError(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{strings.title}</CardTitle>
          <p className="text-sm text-foreground-muted">
            Define metas medibles para que el copiloto ajuste su diagnóstico y hábitos sugeridos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{filteredGoals.length} activas</Badge>
          <Select value={activeProjectId ?? ""} onChange={(event) => setActiveProject(event.target.value || null)}>
            <option value="">Todos los proyectos</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Título</Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Ej. Entregar capítulo"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-project">Proyecto</Label>
              <Select
                id="goal-project"
                value={form.projectId ?? ""}
                onChange={(event) => handleProjectChange(event.target.value)}
              >
                <option value="">Sin proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
                <option value={NEW_PROJECT_VALUE}>+ Crear proyecto</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="goal-target">Meta</Label>
              <Input
                id="goal-target"
                type="number"
                min={1}
                value={form.targetUnits}
                onChange={(event) => setForm((prev) => ({ ...prev, targetUnits: Number(event.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-unit">Unidad</Label>
              <Input
                id="goal-unit"
                value={form.unitLabel}
                onChange={(event) => setForm((prev) => ({ ...prev, unitLabel: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-due">Fecha objetivo</Label>
              <Input
                id="goal-due"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
              />
            </div>
          </div>
          {error && <p className="text-sm text-accent-danger">{error}</p>}
          <Button type="submit">{strings.createButton}</Button>
        </form>

        <div className="space-y-3">
          {ordered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-surface-base/40 p-6 text-sm text-foreground-muted">
              <p>{strings.empty}</p>
              <p className="mt-2">Inicia con una meta sencilla para que la IA mida tu progreso.</p>
            </div>
          ) : (
            ordered.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onUpdate={(updates) => updateGoal(goal.id, updates)}
                onDelete={() => removeGoal(goal.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
