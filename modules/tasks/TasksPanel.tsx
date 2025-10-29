"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { Task, TaskPriority } from "@/modules/dashboard/types";
import { cn } from "@/styles/utils";

const PRIORITIES: Array<{ value: TaskPriority; label: string }> = [
  { value: "high", label: "Alta" },
  { value: "medium", label: "Media" },
  { value: "low", label: "Baja" }
];

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  high: "bg-rose-500/15 text-rose-400",
  medium: "bg-amber-500/15 text-amber-400",
  low: "bg-emerald-500/15 text-emerald-400"
};

const NEW_PROJECT_VALUE = "__new__";

interface FormState {
  title: string;
  description: string;
  estimateMinutes: number;
  projectId: string | null;
  dueDate?: string;
  priority: TaskPriority;
}

const defaultForm: FormState = {
  title: "",
  description: "",
  estimateMinutes: 50,
  projectId: null,
  dueDate: undefined,
  priority: "medium"
};

function formatDueDate(date?: string) {
  if (!date) return null;
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
}

function TaskRow({ task, onToggle, onEdit, onDelete }: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const due = formatDueDate(task.dueDate);
  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggle();
  };
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface-base/40 p-4 transition hover:border-accent-primary/40">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.status === "done"} onChange={handleToggle} aria-label={`Cambiar estado de ${task.title}`} />
          <div className="space-y-1">
            <p className={cn("text-sm font-medium text-foreground", task.status === "done" && "text-foreground-muted line-through")}>{task.title}</p>
            {task.description && <p className="text-xs leading-relaxed text-foreground-muted">{task.description}</p>}
            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
              <span>{task.estimateMinutes ?? 25} min</span>
              <span>• {task.priority}</span>
              {task.projectId && <span>• Proyecto #{task.projectId.slice(0, 4)}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
          {due && <Badge variant="muted">Vence {due}</Badge>}
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TasksPanel() {
  const {
    tasks,
    projects,
    addTask,
    updateTask,
    removeTask,
    toggleTaskStatus,
    addProject,
    preferences,
    activeProjectId,
    setActiveProject
  } = useDashboard();
  const strings = STRINGS.es.tasks;
  const [form, setForm] = useState<FormState>({ ...defaultForm, projectId: activeProjectId ?? null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingTask) {
      setForm((prev) => ({ ...prev, projectId: activeProjectId ?? null }));
    }
  }, [activeProjectId, editingTask]);

  const filteredTasks = useMemo(() => {
    if (!activeProjectId) return tasks;
    return tasks.filter((task) => task.projectId === activeProjectId);
  }, [tasks, activeProjectId]);

  const sortedTasks = useMemo(() => {
    return filteredTasks
      .slice()
      .sort((a, b) => {
        if (a.status === "done" && b.status !== "done") return 1;
        if (a.status !== "done" && b.status === "done") return -1;
        const dueA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dueB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        return dueA - dueB;
      });
  }, [filteredTasks]);

  const resetForm = () => {
    setForm({ ...defaultForm, projectId: activeProjectId ?? null });
    setEditingTask(null);
    setError(null);
  };

  const handleTaskProjectChange = (value: string) => {
    if (value === NEW_PROJECT_VALUE) {
      const name = window.prompt("¿Cómo se llama el nuevo proyecto?");
      if (!name) return;
      try {
        const project = addProject(name);
        setActiveProject(project.id);
        setForm((prev) => ({ ...prev, projectId: project.id }));
      } catch (err) {
        console.error(err);
      }
      return;
    }

    setForm((prev) => ({ ...prev, projectId: value || null }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Describe una acción clara antes de guardar.");
      return;
    }
    if (form.title.trim().length > 120) {
      setError("La tarea es demasiado larga, intenta acotarla a 120 caracteres.");
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        projectId: form.projectId,
        estimateMinutes: form.estimateMinutes,
        dueDate: form.dueDate,
        priority: form.priority
      });
    } else {
      addTask({
        title: form.title.trim(),
        description: form.description.trim(),
        projectId: form.projectId,
        dueDate: form.dueDate,
        estimateMinutes: form.estimateMinutes,
        priority: form.priority
      });
    }
    resetForm();
  };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      estimateMinutes: task.estimateMinutes ?? 50,
      projectId: task.projectId,
      dueDate: task.dueDate,
      priority: task.priority
    });
    setError(null);
  };

  const pendingCount = filteredTasks.filter((task) => task.status !== "done").length;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>{strings.title}</CardTitle>
          <p className="text-sm text-foreground-muted">
            Define acciones concretas. Presiona Enter para guardar rápido y usa proyectos para agrupar tu enfoque diario.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{pendingCount} pendientes</Badge>
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Tarea</Label>
              <Input
                id="task-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder={strings.addPlaceholder}
                maxLength={120}
                required
              />
              <p className="text-xs text-foreground-muted">Describe la siguiente acción mínima que desbloquea avance.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-project">Proyecto</Label>
              <Select
                id="task-project"
                value={form.projectId ?? ""}
                onChange={(event) => handleTaskProjectChange(event.target.value)}
              >
                <option value="">Sin proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
                <option value={NEW_PROJECT_VALUE}>+ Crear proyecto</option>
              </Select>
              <p className="text-xs text-foreground-muted">Los proyectos guardan tus preferencias y memoria de IA.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-estimate">{strings.estimateLabel}</Label>
              <Input
                id="task-estimate"
                type="number"
                min={5}
                step={5}
                value={form.estimateMinutes}
                onChange={(event) => setForm((prev) => ({ ...prev, estimateMinutes: Number(event.target.value) }))}
              />
              <p className="text-xs text-foreground-muted">Bloques recomendados de 50 minutos de enfoque.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-priority">Prioridad</Label>
              <Select
                id="task-priority"
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
              >
                {PRIORITIES.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-foreground-muted">Usa alta solo para tareas críticas del día.</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-description">Descripción</Label>
            <Textarea
              id="task-description"
              rows={preferences.density === "compact" ? 2 : 3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Detalla qué debe ocurrir para dar por terminado"
            />
          </div>
          <div className="space-y-2 md:w-1/3">
            <Label htmlFor="task-due">Vence</Label>
            <Input
              id="task-due"
              type="date"
              value={form.dueDate ?? ""}
              onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
            />
          </div>
          {error && <p className="text-sm text-accent-danger">{error}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit">{editingTask ? "Actualizar" : strings.createButton}</Button>
            {editingTask && (
              <Button type="button" variant="ghost" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>

        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-surface-base/40 p-6 text-sm text-foreground-muted">
              <p>{strings.empty}</p>
              <Button className="mt-4" onClick={() => document.getElementById("task-title")?.focus()}>
                Escribe tu primer paso
              </Button>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTaskStatus(task.id)}
                onEdit={() => startEdit(task)}
                onDelete={() => removeTask(task.id)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
