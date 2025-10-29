"use client";

import { useMemo, useState } from "react";
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

function TaskRow({ task, onToggle, onEdit, onDelete }: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-accent-primary/40">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Checkbox checked={task.status === "done"} onChange={onToggle} />
          <div>
            <p className={cn("text-sm font-medium", task.status === "done" && "text-white/50 line-through")}>{task.title}</p>
            {task.description && <p className="text-xs text-white/60">{task.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={task.priority === "high" ? "danger" : task.priority === "low" ? "outline" : "sky"}>{task.priority}</Badge>
          {task.dueDate && <Badge variant="outline">{new Date(task.dueDate).toLocaleDateString()}</Badge>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/40">
        <span>{task.estimateMinutes ?? 25} min</span>
        {task.projectId && <span>• proyecto #{task.projectId.slice(0, 4)}</span>}
        <button onClick={onEdit} className="text-white/60 hover:text-white">Editar</button>
        <button onClick={onDelete} className="text-accent-danger/70 hover:text-accent-danger">Eliminar</button>
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
    preferences
  } = useDashboard();
  const strings = STRINGS.es.tasks;
  const [form, setForm] = useState<FormState>(defaultForm);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const taskList = useMemo(() => {
    return tasks
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [tasks]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingTask(null);
  };

  const handleProjectChange = (value: string) => {
    if (value === NEW_PROJECT_VALUE) {
      const name = window.prompt("¿Cómo se llama el nuevo proyecto?");
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
        title: form.title,
        description: form.description,
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
  };

  const density = preferences.density;

  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{strings.title}</CardTitle>
        <Badge variant="outline">{tasks.filter((task) => task.status !== "done").length} pendientes</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Tarea</Label>
            <Input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} placeholder={strings.addPlaceholder} />
          </div>
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>{strings.estimateLabel}</Label>
            <Input type="number" min={5} step={5} value={form.estimateMinutes} onChange={(event) => setForm((prev) => ({ ...prev, estimateMinutes: Number(event.target.value) }))} />
          </div>
          <div className="space-y-2">
            <Label>Prioridad</Label>
            <Select value={form.priority} onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value as TaskPriority }))}>
              {PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descripción</Label>
            <Textarea rows={density === "compact" ? 2 : 3} value={form.description} onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Detalla qué debe ocurrir para dar por terminado" />
          </div>
          <div className="space-y-2">
            <Label>Vence</Label>
            <Input type="date" value={form.dueDate ?? ""} onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value || undefined }))} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onSubmit}>{editingTask ? "Actualizar" : strings.createButton}</Button>
          {editingTask && (
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
          )}
        </div>

        <div className="space-y-3">
          {taskList.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60">{strings.empty}</p>
          ) : (
            taskList.map((task) => (
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
