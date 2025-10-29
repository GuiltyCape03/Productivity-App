"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { STRINGS } from "@/i18n/strings";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";
import type { WorkspacePage } from "@/modules/dashboard/types";
import { cn } from "@/styles/utils";

function createId() {
  return Math.random().toString(36).slice(2, 10);
}

const BLOCK_TYPES = [
  { value: "heading", label: "Encabezado" },
  { value: "text", label: "Texto" },
  { value: "checklist", label: "Checklist" },
  { value: "callout", label: "Callout" },
  { value: "divider", label: "Divisor" }
] as const;

type BlockType = WorkspacePage["blocks"][number]["type"];

type DraftBlock = WorkspacePage["blocks"][number];

function createBlock(type: BlockType): DraftBlock {
  if (type === "divider") {
    return { id: createId(), type, content: "---" };
  }
  if (type === "heading") {
    return { id: createId(), type, content: "Nuevo encabezado" };
  }
  if (type === "checklist") {
    return { id: createId(), type, content: "[ ] Primer paso" };
  }
  if (type === "callout") {
    return { id: createId(), type, content: "💡 Idea clave" };
  }
  return { id: createId(), type, content: "Escribe algo poderoso" };
}

export function WorkspacePanel() {
  const { pages, upsertPage, deletePage } = useDashboard();
  const strings = STRINGS.es.workspace;
  const [activePageId, setActivePageId] = useState<string | null>(null);

  useEffect(() => {
    if (pages.length === 0) {
      setActivePageId(null);
      return;
    }
    if (!activePageId || !pages.some((page) => page.id === activePageId)) {
      setActivePageId(pages[0].id);
    }
  }, [pages, activePageId]);

  const activePage = pages.find((page) => page.id === activePageId) ?? null;

  const addPage = () => {
    const title = window.prompt("Título de la página");
    if (!title) return;
    const page: WorkspacePage = {
      id: createId(),
      title,
      icon: "📘",
      blocks: [createBlock("heading"), createBlock("text")],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    upsertPage(page);
    setActivePageId(page.id);
  };

  const updatePage = (updates: Partial<WorkspacePage>) => {
    if (!activePage) return;
    upsertPage({ ...activePage, ...updates });
  };

  const addBlock = (type: BlockType) => {
    if (!activePage) return;
    updatePage({ blocks: [...activePage.blocks, createBlock(type)] });
  };

  const updateBlock = (blockId: string, content: string) => {
    if (!activePage) return;
    updatePage({
      blocks: activePage.blocks.map((block) => (block.id === blockId ? { ...block, content } : block))
    });
  };

  const removeBlock = (blockId: string) => {
    if (!activePage) return;
    updatePage({ blocks: activePage.blocks.filter((block) => block.id !== blockId) });
  };

  const orderedPages = useMemo(() => pages.slice().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [pages]);

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>{strings.title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={addPage}>
            Nueva página
          </Button>
          {activePage && (
            <Button variant="ghost" className="text-accent-danger" onClick={() => deletePage(activePage.id)}>
              Borrar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col gap-2 lg:w-56">
          {orderedPages.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-surface-base/40 p-4 text-sm text-foreground-muted">{strings.empty}</p>
          ) : (
            orderedPages.map((page) => (
              <button
                key={page.id}
                onClick={() => setActivePageId(page.id)}
                className={cn(
                  "flex items-center justify-between rounded-2xl border border-transparent bg-surface-base/40 px-4 py-3 text-left transition hover:border-accent-primary/40",
                  activePageId === page.id && "border-accent-primary/50 bg-accent-primary/10"
                )}
              >
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <span>{page.icon}</span>
                  {page.title}
                </span>
                <Badge variant="outline">{new Date(page.updatedAt).toLocaleDateString()}</Badge>
              </button>
            ))
          )}
        </aside>
        <div className="flex-1 space-y-4">
          {activePage ? (
            <div className="space-y-4">
              <Input
                value={activePage.title}
                onChange={(event) => updatePage({ title: event.target.value })}
                className="text-lg font-semibold"
              />
              <div className="flex flex-wrap gap-2">
                {BLOCK_TYPES.map((block) => (
                  <Button key={block.value} variant="ghost" onClick={() => addBlock(block.value)}>
                    + {block.label}
                  </Button>
                ))}
              </div>
              <div className="space-y-4">
                {activePage.blocks.map((block) => (
                  <div key={block.id} className="rounded-2xl border border-border/60 bg-surface-base/40 p-4">
                    <div className="flex items-center justify-between pb-2">
                      <Badge variant="outline">{block.type}</Badge>
                      <button className="text-accent-danger/70 hover:text-accent-danger" onClick={() => removeBlock(block.id)}>
                        Quitar
                      </button>
                    </div>
                    {block.type === "divider" ? (
                      <div className="h-px bg-surface-muted/70" />
                    ) : block.type === "text" ? (
                      <Textarea value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} rows={3} />
                    ) : block.type === "checklist" ? (
                      <Textarea value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} rows={3} />
                    ) : block.type === "heading" ? (
                      <Input value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} className="text-xl font-semibold" />
                    ) : (
                      <Textarea value={block.content} onChange={(event) => updateBlock(block.id, event.target.value)} rows={2} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-3xl border border-dashed border-border/60 bg-surface-base/40 p-6 text-sm text-foreground-muted">
              {strings.empty}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
