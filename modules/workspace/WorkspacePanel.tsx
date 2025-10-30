"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next"; // 👈 IMPORTANTE
import { Surface, SurfaceContent, SurfaceHeader, SurfaceTitle } from "@/components/ui/Surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { WorkspacePage } from "@/modules/dashboard/types";
import { PageList } from "./PageList";
import { useTabsStore } from "@/stores/tabsStore";

const BLOCK_TYPES = [
  { value: "heading" as const, label: "Encabezado" },
  { value: "text" as const, label: "Texto" },
  { value: "checklist" as const, label: "Checklist" },
  { value: "callout" as const, label: "Callout" },
  { value: "divider" as const, label: "Divisor" }
];

type BlockType = WorkspacePage["blocks"][number]["type"];
type DraftBlock = WorkspacePage["blocks"][number];

const EMOJI_SUGGESTIONS = ["✨", "🚀", "🧠", "📚", "🗂️", "🧭", "🎯", "🛠️"];

const TEMPLATES: Array<{
  id: string;
  label: string;
  description: string;
  blocks: DraftBlock[];
}> = [
  {
    id: "blank",
    label: "Página en blanco",
    description: "Empieza desde cero con bloques personalizables.",
    blocks: []
  },
  {
    id: "daily",
    label: "Plan diario",
    description: "Objetivo, checklist y bloque de notas rápidas.",
    blocks: [
      { id: "heading", type: "heading", content: "Objetivo del día" },
      { id: "text", type: "text", content: "Describe tu progreso ideal." },
      { id: "checklist", type: "checklist", content: "[ ] Bloque profundo\n[ ] Seguimiento rápido" }
    ]
  },
  {
    id: "research",
    label: "Bitácora de investigación",
    description: "Hipótesis, hallazgos y próximos pasos.",
    blocks: [
      { id: "heading", type: "heading", content: "Hipótesis" },
      { id: "text", type: "text", content: "¿Qué quieres validar hoy?" },
      { id: "divider", type: "divider", content: "---" },
      { id: "callout", type: "callout", content: "💡 Insight principal" },
      { id: "checklist", type: "checklist", content: "[ ] Próximo paso" }
    ]
  }
];

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

function createBlock(type: BlockType): DraftBlock {
  if (type === "divider") return { id: createId(), type, content: "---" };
  if (type === "heading") return { id: createId(), type, content: "Nuevo encabezado" };
  if (type === "checklist") return { id: createId(), type, content: "[ ] Primer paso" };
  if (type === "callout") return { id: createId(), type, content: "💡 Idea clave" };
  return { id: createId(), type, content: "Escribe algo poderoso" };
}

function cloneBlocks(blocks: DraftBlock[]): DraftBlock[] {
  return blocks.map((block) => ({ ...block, id: createId() }));
}

export function WorkspacePanel() {
  const { pages, upsertPage, deletePage, projects } = useDashboard();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTab, setActiveTab, tabs } = useTabsStore((state) => ({
    addTab: state.add,
    setActiveTab: state.setActive,
    tabs: state.tabs
  }));
  const strings = STRINGS.es.workspace;
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [draftPage, setDraftPage] = useState<WorkspacePage | null>(null);
  const [createTemplateId, setCreateTemplateId] = useState(TEMPLATES[0]?.id ?? "blank");
  const [createTitle, setCreateTitle] = useState("Nueva página");
  const [createEmoji, setCreateEmoji] = useState("✨");
  const [createProject, setCreateProject] = useState<string>("");

  const orderedPages = useMemo(
    () =>
      pages
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [pages]
  );

  useEffect(() => {
    if (orderedPages.length === 0) {
      setActivePageId(null);
      return;
    }
    if (!activePageId || !orderedPages.some((page) => page.id === activePageId)) {
      setActivePageId(orderedPages[0].id);
    }
  }, [orderedPages, activePageId]);

  useEffect(() => {
    if (searchParams?.get("newPage") === "1") {
      setCreateOpen(true);
      router.replace("/workspace");
    }
  }, [router, searchParams]);

  const activePage = orderedPages.find((page) => page.id === activePageId) ?? null;

  const handleOpenEditor = (page: WorkspacePage) => {
    setDraftPage({ ...page, blocks: page.blocks.map((block) => ({ ...block })) });
    setEditorOpen(true);
  };

  const handleCreatePage = () => {
    const title = createTitle.trim() || "Página sin título";
    const icon = createEmoji || "🗂️";
    const template = TEMPLATES.find((item) => item.id === createTemplateId) ?? TEMPLATES[0];
    const now = new Date().toISOString();
    const newPage: WorkspacePage = {
      id: createId(),
      title,
      icon,
      projectId: createProject || null,
      blocks: template ? cloneBlocks(template.blocks) : [],
      createdAt: now,
      updatedAt: now
    };
    upsertPage(newPage);
    setActivePageId(newPage.id);
    setDraftPage(newPage);
    setEditorOpen(true);
    setCreateOpen(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("¿Seguro que quieres eliminar esta página?")) return;
    deletePage(id);
    if (activePageId === id) {
      setActivePageId(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const base = pages.find((page) => page.id === id);
    if (!base) return;
    const now = new Date().toISOString();
    const duplicate: WorkspacePage = {
      ...base,
      id: createId(),
      title: `${base.title} (copia)`,
      blocks: base.blocks.map((block) => ({ ...block, id: createId() })),
      createdAt: now,
      updatedAt: now
    };
    upsertPage(duplicate);
    setActivePageId(duplicate.id);
  };

  const handleRename = (id: string) => {
    const page = pages.find((item) => item.id === id);
    if (!page) return;
    const name = window.prompt("Nuevo título", page.title);
    if (!name) return;
    upsertPage({ ...page, title: name.trim() || page.title });
  };

  const handleChangeIcon = (id: string) => {
    const page = pages.find((item) => item.id === id);
    if (!page) return;
    const icon = window.prompt("Nuevo emoji (pega uno de tu teclado)", page.icon);
    if (!icon) return;
    upsertPage({ ...page, icon: icon.trim() || page.icon });
  };

  const handleOpenNewTab = (id: string) => {
    const page = pages.find((item) => item.id === id);
    if (!page) return;

    const existing = tabs.find((tab) => tab.route === `/workspace/${id}`);
    if (existing) {
      setActiveTab(existing.id);
      router.push(existing.route as Route); // 👈 cast para typedRoutes
      return;
    }

    const tabId = `workspace-${id}`;
    const route = `/workspace/${id}` as Route; // 👈 tipa la ruta
    addTab({
      id: tabId,
      title: page.title,
      icon: page.icon,
      route,
      project: page.projectId ?? undefined
    });
    setActiveTab(tabId);
    router.push(route); // 👈 route ya es Route
  };

  const updateDraft = (updater: (prev: WorkspacePage) => WorkspacePage) => {
    setDraftPage((prev) => (prev ? updater(prev) : prev));
  };

  const persistDraft = () => {
    if (!draftPage) return;
    upsertPage({ ...draftPage, updatedAt: new Date().toISOString() });
    setEditorOpen(false);
  };

  const addDraftBlock = (type: BlockType) => {
    updateDraft((prev) => ({ ...prev, blocks: [...prev.blocks, createBlock(type)] }));
  };

  const updateDraftBlock = (blockId: string, content: string) => {
    updateDraft((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) => (block.id === blockId ? { ...block, content } : block))
    }));
  };

  const removeDraftBlock = (blockId: string) => {
    updateDraft((prev) => ({ ...prev, blocks: prev.blocks.filter((block) => block.id !== blockId) }));
  };

  const updateDraftHeader = (updates: Partial<Pick<WorkspacePage, "title" | "icon" | "projectId">>) => {
    updateDraft((prev) => ({ ...prev, ...updates }));
  };

  return (
    <Surface as="section">
      <SurfaceHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-0 pb-0">
        <div>
          <SurfaceTitle>{strings.title}</SurfaceTitle>
          <p className="mt-1 text-sm text-foreground-muted">
            Organiza documentos con estilo tipo Notion y conviértelos en acciones.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setCreateOpen(true)}>
            + Nueva página
          </Button>
          {activePage && (
            <Button variant="ghost" onClick={() => handleOpenEditor(activePage)}>
              Editar página
            </Button>
          )}
        </div>
      </SurfaceHeader>
      <SurfaceContent className="pt-6">
        <div className="grid gap-6 md:grid-cols-[minmax(0,260px)_1fr] md:gap-8">
          <aside className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-foreground-muted">Workspace</p>
            </div>
            <PageList
              pages={orderedPages}
              activePageId={activePageId}
              onSelect={setActivePageId}
              onOpen={(id) => {
                const page = pages.find((item) => item.id === id);
                if (page) handleOpenEditor(page);
              }}
              onOpenNewTab={handleOpenNewTab}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onRename={handleRename}
              onChangeIcon={handleChangeIcon}
            />
          </aside>
          <section className="space-y-4">
            {activePage ? (
              <div className="rounded-2xl border border-border/60 bg-surface-elevated/60 p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="emoji text-3xl" aria-hidden>
                      {activePage.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{activePage.title}</h3>
                      <p className="text-sm text-foreground-muted">
                        {activePage.projectId
                          ? `Vinculado al proyecto ${activePage.projectId}`
                          : "Sin proyecto asignado"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{activePage.blocks.length} bloques</Badge>
                    <Button variant="outline" onClick={() => handleOpenNewTab(activePage.id)}>
                      Abrir como página
                    </Button>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {activePage.blocks.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/50 p-4 text-sm text-foreground-muted">
                      Agrega bloques desde el editor para construir esta página.
                    </p>
                  ) : (
                    activePage.blocks.slice(0, 4).map((block) => (
                      <article
                        key={block.id}
                        className="rounded-xl border border-border/50 bg-surface-elevated/80 p-4 text-sm text-foreground"
                      >
                        <span className="mb-2 inline-flex rounded-full bg-surface-muted/60 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-foreground-muted">
                          {block.type}
                        </span>
                        <p className="whitespace-pre-line leading-relaxed">{block.content}</p>
                      </article>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-6 text-sm text-foreground-muted">
                {strings.empty}
              </p>
            )}
          </section>
        </div>
      </SurfaceContent>

      <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea una nueva página</DialogTitle>
            <p className="text-sm text-foreground-muted">
              Elige un emoji, un título y una plantilla base. Podrás editarla después.
            </p>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Emoji</Label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCreateEmoji(item)}
                    className={`emoji flex h-10 w-10 items-center justify-center rounded-xl border ${createEmoji === item ? "border-accent-primary bg-accent-primary/10" : "border-border/60 bg-surface-elevated/50"}`}
                    aria-label={`Seleccionar ${item}`}
                  >
                    <span className="text-xl">{item}</span>
                  </button>
                ))}
                <Input
                  value={createEmoji}
                  onChange={(event) => setCreateEmoji(event.target.value)}
                  className="h-10 w-16 text-center"
                  aria-label="Emoji personalizado"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-title">Título</Label>
              <Input
                id="create-title"
                value={createTitle}
                onChange={(event) => setCreateTitle(event.target.value)}
                placeholder="Página sin título"
              />
              <p className="text-xs text-foreground-muted">Puedes cambiarlo más tarde desde el editor.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-project">Proyecto</Label>
              <Select
                id="create-project"
                value={createProject}
                onChange={(event) => setCreateProject(event.target.value)}
              >
                <option value="">Sin proyecto</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-template">Plantilla</Label>
              <Select
                id="create-template"
                value={createTemplateId}
                onChange={(event) => setCreateTemplateId(event.target.value)}
              >
                {TEMPLATES.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.label}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-foreground-muted">
                {TEMPLATES.find((template) => template.id === createTemplateId)?.description}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreatePage}>Crear y editar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          {draftPage && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>Editar página</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Input
                  value={draftPage.icon}
                  onChange={(event) => updateDraftHeader({ icon: event.target.value })}
                  className="md:w-24 text-center"
                  aria-label="Emoji de la página"
                />
                <div className="flex-1 space-y-2">
                  <Label htmlFor="edit-title" className="text-xs text-foreground-muted uppercase tracking-[0.2em]">
                    Título
                  </Label>
                  <Input
                    id="edit-title"
                    value={draftPage.title}
                    onChange={(event) => updateDraftHeader({ title: event.target.value })}
                  />
                </div>
                <div className="md:w-64 space-y-2">
                  <Label htmlFor="edit-project" className="text-xs text-foreground-muted uppercase tracking-[0.2em]">
                    Proyecto vinculado
                  </Label>
                  <Select
                    id="edit-project"
                    value={draftPage.projectId ?? ""}
                    onChange={(event) => updateDraftHeader({ projectId: event.target.value || null })}
                  >
                    <option value="">Sin proyecto</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Bloques</Label>
                <div className="flex flex-wrap gap-2">
                  {BLOCK_TYPES.map((block) => (
                    <Button key={block.value} variant="secondary" size="sm" onClick={() => addDraftBlock(block.value)}>
                      + {block.label}
                    </Button>
                  ))}
                </div>
                <div className="space-y-4">
                  {draftPage.blocks.length === 0 && (
                    <p className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/50 p-4 text-sm text-foreground-muted">
                      Añade un bloque para comenzar.
                    </p>
                  )}
                  {draftPage.blocks.map((block) => (
                    <div key={block.id} className="space-y-3 rounded-2xl border border-border/60 bg-surface-elevated/70 p-4">
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-foreground-muted">
                        <span>{block.type}</span>
                        <button
                          type="button"
                          onClick={() => removeDraftBlock(block.id)}
                          className="text-accent-danger hover:underline"
                        >
                          Quitar
                        </button>
                      </div>
                      {block.type === "divider" ? (
                        <div className="h-px bg-surface-muted/70" />
                      ) : block.type === "heading" ? (
                        <Input
                          value={block.content}
                          onChange={(event) => updateDraftBlock(block.id, event.target.value)}
                          className="text-lg font-semibold"
                        />
                      ) : (
                        <Textarea
                          rows={block.type === "text" ? 4 : 3}
                          value={block.content}
                          onChange={(event) => updateDraftBlock(block.id, event.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditorOpen(false)}>
                  Cerrar
                </Button>
                <Button onClick={persistDraft}>Guardar cambios</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Surface>
  );
}
