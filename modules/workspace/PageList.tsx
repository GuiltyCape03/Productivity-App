"use client";

import { type WorkspacePage } from "@/modules/dashboard/types";
import { PageItem } from "./PageItem";

interface PageListProps {
  pages: WorkspacePage[];
  activePageId: string | null;
  onSelect: (id: string) => void;
  onOpen: (id: string) => void;
  onOpenNewTab: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string) => void;
  onChangeIcon: (id: string) => void;
}

export function PageList({
  pages,
  activePageId,
  onSelect,
  onOpen,
  onOpenNewTab,
  onDuplicate,
  onDelete,
  onRename,
  onChangeIcon
}: PageListProps) {
  if (pages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-5 text-sm text-foreground-muted">
        Aún no tienes páginas. Crea una para convertir tus notas en acciones.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pages.map((page) => (
        <PageItem
          key={page.id}
          page={page}
          isActive={page.id === activePageId}
          onSelect={() => onSelect(page.id)}
          onOpen={() => onOpen(page.id)}
          onOpenNewTab={() => onOpenNewTab(page.id)}
          onDuplicate={() => onDuplicate(page.id)}
          onDelete={() => onDelete(page.id)}
          onRename={() => onRename(page.id)}
          onChangeIcon={() => onChangeIcon(page.id)}
        />
      ))}
    </div>
  );
}
