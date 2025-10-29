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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { Task, TaskPriority } from "@/modules/dashboard/types";
import { cn } from "@/styles/utils";
import { MoreHorizontal } from "lucide-react";

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

function TaskRow({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: () => void; onEdit: () => void; onDelete: () => void; }) {
  const due = formatDueDate(task.dueDate);
  const handleToggle = (event: ChangeEvent<HTMLInputElement>) => {
    event.stopPropagation();
    onToggle();
  };
  return (
    <div className="rounded-2xl border border-border/60 bg-surface-elevated/60 p-5 transition hover:border-accent-primary/50">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.status === "done"} onChange={handleToggle} aria-label={`Cambiar estado de ${task.title}`} />
          <div className="space-y-2">
            <div>
              <p className={cn("text-sm font-medium text-foreground", task.status === "done" && "text-foreground-muted line-through")}>{task.title}</p>
              {task.description && <p className="mt-1 text-xs leading-relaxed text-foreground-muted">{task.description}</p>}
            </div>
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-foreground-muted hover:text-foreground" aria-label={`Acciones para ${task.title}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onEdit}>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-accent-danger" onSelect={onDelete}>
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    activeProjectId,
    setActiveProject
  } = useDashboard();
  const strings = STRINGS.es.tasks;
  const [form, setForm] = useState<FormState>({ ...defaultForm, projectId: activeProjectId ?? null });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDetailsOpen, setDetailsOpen] = useState(false);

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

  const validateForm = () => {
    if (!form.title.trim()) {
      setError("Describe una acción clara antes de guardar.");
      return false;
    }
    if (form.title.trim().length > 120) {
      setError("La tarea es demasiado larga, intenta acotarla a 120 caracteres.");
      return false;
    }
    setError(null);
    return true;
  };

  const submitTask = () => {
    if (!validateForm()) return;

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
    setDetailsOpen(false);
    resetForm();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitTask();
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
    setDetailsOpen(true);
  };

  const projectOptions = [{ id: "", name: "Todos los proyectos" }, ...projects];

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>{strings.title}</CardTitle>
            <p className="mt-1 text-sm text-foreground-muted">
              Define el mínimo viable de hoy. Usa Enter para registrar en caliente.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-xs text-foreground-muted uppercase tracking-[0.2em]">Proyecto activo</Label>
            <Select value={activeProjectId ?? ""} onChange={(event) => setActiveProject(event.target.value || null)}>
              {projectOptions.map((project) => (
                <option key={project.id || "all"} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-surface-elevated/50 p-4" aria-label="Añadir tarea">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Escribe la tarea mínima a completar"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  submitTask();
                }
              }}
              aria-label="Título de la tarea"
            />
            <Select
              value={form.projectId ?? ""}
              onChange={(event) => handleTaskProjectChange(event.target.value)}
              aria-label="Proyecto de la tarea"
            >
              <option value="">Sin proyecto</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
              <option value={NEW_PROJECT_VALUE}>+ Nuevo proyecto</option>
            </Select>
            <Select
              value={form.priority}
              onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}
              aria-label="Prioridad"
            >
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
            <Button type="button" variant="secondary" onClick={() => setDetailsOpen(true)}>
              Detalles
            </Button>
            <Button type="submit">{editingTask ? "Guardar" : "Añadir"}</Button>
          </div>
          {error && <p className="text-sm text-accent-danger">{error}</p>}
        </form>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-6 text-sm text-foreground-muted">
            No hay tareas aún. Empieza creando tu objetivo mínimo viable de hoy.
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTaskStatus(task.id)}
                onEdit={() => startEdit(task)}
                onDelete={() => removeTask(task.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isDetailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTask ? "Editar tarea" : "Detalles de la tarea"}</DialogTitle>
            <DialogDescription>
              Ajusta duración, fecha y notas. Se guardará junto con la tarea rápida.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="task-notes">Notas o contexto</Label>
              <Textarea
                id="task-notes"
                rows={4}
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Escribe los puntos clave que no puedes olvidar."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="task-due">Fecha límite</Label>
                <Input
                  id="task-due"
                  type="date"
                  value={form.dueDate ?? ""}
                  onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-estimate">Minutos estimados</Label>
                <Input
                  id="task-estimate"
                  type="number"
                  min={5}
                  step={5}
                  value={form.estimateMinutes}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, estimateMinutes: Number.parseInt(event.target.value, 10) || 25 }))
                  }
                />
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
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => { setDetailsOpen(false); if (!editingTask) resetForm(); }}>
                Cancelar
              </Button>
              <Button onClick={submitTask}>{editingTask ? "Guardar cambios" : "Guardar tarea"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
