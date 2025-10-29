"use client";

import { format } from "date-fns";
import es from "date-fns/locale/es";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { WorkspacePage } from "@/modules/dashboard/types";
import { cn } from "@/styles/utils";

interface PageItemProps {
  page: WorkspacePage;
  isActive: boolean;
  onSelect: () => void;
  onOpen: () => void;
  onOpenNewTab: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onChangeIcon: () => void;
}

export function PageItem({
  page,
  isActive,
  onSelect,
  onOpen,
  onOpenNewTab,
  onDuplicate,
  onDelete,
  onRename,
  onChangeIcon
}: PageItemProps) {
  const updatedLabel = format(new Date(page.updatedAt), "dd MMM", { locale: es });

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center justify-between rounded-2xl border border-transparent bg-surface-elevated/50 px-4 py-3 text-left transition",
        "hover:border-accent-primary/40 hover:bg-surface-elevated/70",
        isActive && "border-accent-primary/60 bg-accent-primary/10"
      )}
      aria-pressed={isActive}
    >
      <span className="flex items-center gap-3 text-sm text-foreground">
        <span aria-hidden className="text-xl leading-none">
          {page.icon}
        </span>
        <span className="truncate font-medium">{page.title}</span>
      </span>
      <span className="flex items-center gap-2">
        <Badge variant="muted" className="uppercase tracking-[0.2em]">
          {updatedLabel}
        </Badge>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-foreground-muted hover:text-foreground"
              aria-label={`Acciones para ${page.title}`}
              onClick={(event) => event.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(event) => event.preventDefault()}>
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            <DropdownMenuItem onSelect={onOpen}>Abrir</DropdownMenuItem>
            <DropdownMenuItem onSelect={onOpenNewTab}>Abrir en nueva pestaña</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onRename}>Renombrar</DropdownMenuItem>
            <DropdownMenuItem onSelect={onChangeIcon}>Cambiar icono</DropdownMenuItem>
            <DropdownMenuItem onSelect={onDuplicate}>Duplicar</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-accent-danger" onSelect={onDelete}>
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </span>
    </button>
  );
}
