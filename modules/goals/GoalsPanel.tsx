"use client";

import { useMemo, useState } from "react";
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

function GoalRow({ goal, onUpdate, onDelete }: {
  goal: Goal;
  onUpdate: (updates: Partial<Goal>) => void;
  onDelete: () => void;
}) {
  const progress = Math.min(100, Math.round((goal.completedUnits / goal.targetUnits) * 100));
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-white">{goal.title}</p>
          <p className="text-xs text-white/60">
            {goal.completedUnits}/{goal.targetUnits} {goal.unitLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="sky">{progress}%</Badge>
          {goal.dueDate && <Badge variant="outline">{new Date(goal.dueDate).toLocaleDateString()}</Badge>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
        <button onClick={() => onUpdate({ completedUnits: Math.min(goal.targetUnits, goal.completedUnits + 1) })} className="text-white/60 hover:text-white">
          +1 progreso
        </button>
        <button onClick={() => onUpdate({ completedUnits: Math.max(0, goal.completedUnits - 1) })} className="text-white/60 hover:text-white">
          -1 progreso
        </button>
        <button onClick={onDelete} className="text-accent-danger/70 hover:text-accent-danger">
          Eliminar
        </button>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div className="h-full rounded-full bg-accent-primary" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function GoalsPanel() {
  const { goals, projects, addGoal, updateGoal, removeGoal, addProject } = useDashboard();
  const strings = STRINGS.es.goals;
  const [form, setForm] = useState<FormState>(defaultForm);

  const handleProjectChange = (value: string) => {
    if (value === NEW_PROJECT_VALUE) {
      const name = window.prompt("Nombre del nuevo proyecto");
      if (!name) return;
      try {
        const project = addProject(name);
        setForm((prev) => ({ ...prev, projectId: project.id }));
      } catch (error) {
        console.error(error);
      }
      return;
    }
    setForm((prev) => ({ ...prev, projectId: value || null }));
  };

  const onSubmit = () => {
    if (!form.title.trim()) return;
    addGoal({
      title: form.title,
      projectId: form.projectId,
      targetUnits: form.targetUnits,
      unitLabel: form.unitLabel,
      dueDate: form.dueDate
    });
    setForm(defaultForm);
  };

  const ordered = useMemo(() => goals.slice().sort((a, b) => (a.dueDate ?? "") < (b.dueDate ?? "") ? -1 : 1), [goals]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{strings.title}</CardTitle>
        <Badge variant="outline">{goals.length} activas</Badge>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3">
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Ej. Entregar capítulo" />
          </div>
          <div className="space-y-1.5">
            <Label>Proyecto</Label>
            <Select value={form.projectId ?? ""} onChange={(event) => handleProjectChange(event.target.value)}>
              <option value="">Sin proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
              <option value={NEW_PROJECT_VALUE}>+ Crear proyecto</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Meta</Label>
              <Input type="number" min={1} value={form.targetUnits} onChange={(event) => setForm((prev) => ({ ...prev, targetUnits: Number(event.target.value) }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Unidad</Label>
              <Input value={form.unitLabel} onChange={(event) => setForm((prev) => ({ ...prev, unitLabel: event.target.value }))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha objetivo</Label>
            <Input type="date" value={form.dueDate ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))} />
          </div>
        </div>
        <Button onClick={onSubmit}>{strings.createButton}</Button>
        <div className="space-y-3">
          {ordered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-5 text-sm text-white/60">{strings.empty}</p>
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
