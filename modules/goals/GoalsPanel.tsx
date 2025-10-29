"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { Goal } from "@/modules/dashboard/types";
import { MoreHorizontal } from "lucide-react";

const NEW_PROJECT_VALUE = "__goal_new__";

interface FormState {
  title: string;
  projectId: string | null;
  targetUnits: number;
  completedUnits: number;
  unitLabel: string;
  dueDate?: string;
}

const defaultForm: FormState = {
  title: "",
  projectId: null,
  targetUnits: 10,
  completedUnits: 0,
  unitLabel: "unidades",
  dueDate: undefined
};

function formatProgress(goal: Goal) {
  const ratio = goal.targetUnits === 0 ? 0 : goal.completedUnits / goal.targetUnits;
  return Math.min(100, Math.round(ratio * 100));
}

function GoalRow({ goal, onUpdate, onDelete, onEdit }: { goal: Goal; onUpdate: (updates: Partial<Goal>) => void; onDelete: () => void; onEdit: () => void; }) {
  const progress = formatProgress(goal);
  const due = goal.dueDate ? new Date(goal.dueDate).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }) : null;
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-elevated/60 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{goal.title}</p>
          <p className="text-xs text-foreground-muted">
            {goal.completedUnits}/{goal.targetUnits} {goal.unitLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="sky">{progress}%</Badge>
          {due && <Badge variant="muted">Objetivo {due}</Badge>}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground" aria-label={`Acciones para ${goal.title}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onUpdate({ completedUnits: Math.min(goal.targetUnits, goal.completedUnits + 1) })}>
                Registrar +1
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onUpdate({ completedUnits: Math.max(0, goal.completedUnits - 1) })}>
                Restar -1
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-accent-danger" onSelect={onDelete}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="mt-4 h-2 rounded-full bg-surface-muted/60" aria-hidden>
        <div className="h-full rounded-full bg-accent-primary" style={{ width: `${progress}%` }} />
      </div>
      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
        {goal.projectId ? `Proyecto ${goal.projectId.slice(0, 4)}` : "Sin proyecto asignado"}
      </p>
    </div>
  );
}

export function GoalsPanel() {
  const { goals, projects, addGoal, updateGoal, removeGoal, addProject, activeProjectId, setActiveProject } = useDashboard();
  const strings = STRINGS.es.goals;
  const [form, setForm] = useState<FormState>({ ...defaultForm, projectId: activeProjectId ?? null });
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!editingGoal) {
      setForm((prev) => ({ ...prev, projectId: activeProjectId ?? null }));
    }
  }, [activeProjectId, editingGoal]);

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

  const validate = () => {
    if (!form.title.trim()) {
      setError("Escribe una meta clara.");
      return false;
    }
    if (form.targetUnits < 1) {
      setError("Define al menos una unidad para completar.");
      return false;
    }
    setError(null);
    return true;
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    if (editingGoal) {
      updateGoal(editingGoal.id, {
        title: form.title.trim(),
        projectId: form.projectId,
        targetUnits: Math.max(1, Math.round(form.targetUnits)),
        completedUnits: Math.max(0, Math.min(form.completedUnits, form.targetUnits)),
        unitLabel: form.unitLabel.trim() || "unidades",
        dueDate: form.dueDate
      });
    } else {
      addGoal({
        title: form.title.trim(),
        projectId: form.projectId,
        targetUnits: Math.max(1, Math.round(form.targetUnits)),
        unitLabel: form.unitLabel.trim() || "unidades",
        dueDate: form.dueDate
      });
    }

    setDialogOpen(false);
    setForm({ ...defaultForm, projectId: activeProjectId ?? null });
    setEditingGoal(null);
    setError(null);
  };

  const startEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      projectId: goal.projectId,
      targetUnits: goal.targetUnits,
      completedUnits: goal.completedUnits,
      unitLabel: goal.unitLabel,
      dueDate: goal.dueDate
    });
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{strings.title}</CardTitle>
            <p className="mt-1 text-sm text-foreground-muted">
              Alinea tus métricas clave para que el copiloto mida progreso real.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-foreground-muted uppercase tracking-[0.2em]">Proyecto activo</Label>
            <Select value={activeProjectId ?? ""} onChange={(event) => setActiveProject(event.target.value || null)}>
              <option value="">Todos</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => { setEditingGoal(null); setForm({ ...defaultForm, projectId: activeProjectId ?? null }); setDialogOpen(true); }}>
              + Crear meta
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {ordered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-6 text-sm text-foreground-muted">
            Crea una meta para guiar tus bloques profundos y los recordatorios del copiloto.
          </div>
        ) : (
          <div className="space-y-3">
            {ordered.map((goal) => (
              <GoalRow
                key={goal.id}
                goal={goal}
                onUpdate={(updates) => updateGoal(goal.id, updates)}
                onDelete={() => removeGoal(goal.id)}
                onEdit={() => startEdit(goal)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Editar meta" : "Nueva meta"}</DialogTitle>
            <DialogDescription>
              Describe qué significa avance real y cuándo consideras esta meta cumplida.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-title">Título</Label>
              <Input
                id="goal-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Publicar versión 0.1"
              />
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="goal-target">Unidades objetivo</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min={1}
                  value={form.targetUnits}
                  onChange={(event) => setForm((prev) => ({ ...prev, targetUnits: Number.parseInt(event.target.value, 10) || 1 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-completed">Progreso actual</Label>
                <Input
                  id="goal-completed"
                  type="number"
                  min={0}
                  value={form.completedUnits}
                  onChange={(event) => setForm((prev) => ({ ...prev, completedUnits: Math.max(0, Number.parseInt(event.target.value, 10) || 0) }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-unit">Etiqueta</Label>
                <Input
                  id="goal-unit"
                  value={form.unitLabel}
                  onChange={(event) => setForm((prev) => ({ ...prev, unitLabel: event.target.value }))}
                  placeholder="entregables"
                />
              </div>
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
                <option value={NEW_PROJECT_VALUE}>+ Nuevo proyecto</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-due">Fecha límite</Label>
              <Input
                id="goal-due"
                type="date"
                value={form.dueDate ?? ""}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
              />
            </div>
            {error && <p className="text-sm text-accent-danger">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDialogOpen(false);
                  setEditingGoal(null);
                  setForm({ ...defaultForm, projectId: activeProjectId ?? null });
                  setError(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">{editingGoal ? "Guardar cambios" : "Crear meta"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
