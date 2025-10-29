"use client";

import { useCallback, useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Wand2, X } from "lucide-react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/styles/utils";
import { getDefaultTabs, useTabsStore, type WorkspaceTab } from "@/stores/tabsStore";

const PRESET_OPTIONS = getDefaultTabs();
const SUGGESTED_EMOJIS = ["🧠", "📓", "🚀", "📌", "✅", "🎯", "📅", "💡", "🗂️", "💬"];

interface TabTriggerProps {
  tab: WorkspaceTab;
  isActive: boolean;
  isRenaming: boolean;
  onClose: () => void;
  onRename: (title: string) => void;
  onRenameStart: () => void;
  onRenameCancel: () => void;
  onOpen: () => void;
  onContextMenu: (event: ReactMouseEvent<HTMLDivElement>) => void;
}

function SortableTabTrigger({
  tab,
  isActive,
  isRenaming,
  onClose,
  onRename,
  onRenameStart,
  onRenameCancel,
  onOpen,
  onContextMenu
}: TabTriggerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
  const [value, setValue] = useState(tab.title);

  useEffect(() => {
    setValue(tab.title);
  }, [tab.title]);

  useEffect(() => {
    if (!isRenaming) {
      setValue(tab.title);
    }
  }, [isRenaming, tab.title]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  };

  const submit = useCallback(() => {
    const title = value.trim() || "Página";
    onRename(title);
  }, [value, onRename]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex h-11 min-w-[142px] max-w-[280px] items-center gap-2 rounded-2xl border px-3 text-sm text-foreground transition-all",
        isActive
          ? "border-accent-primary/60 bg-accent-primary/15 shadow-card"
          : "border-border/60 bg-surface-elevated/70 hover:bg-surface-elevated/90"
      )}
      onDoubleClick={onRenameStart}
      onContextMenu={onContextMenu}
      role="tab"
      aria-selected={isActive}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center gap-2 truncate text-left outline-none"
        aria-label={`Abrir ${tab.title}`}
      >
        <span className="text-lg leading-none">
          {tab.icon || "🗂️"}
        </span>
        {isRenaming ? (
          <Input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => {
              submit();
              onRenameCancel();
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submit();
                onRenameCancel();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setValue(tab.title);
                onRenameCancel();
              }
            }}
            className="h-8 w-full border-transparent bg-transparent px-1 text-sm"
          />
        ) : (
          <span className="truncate font-medium tracking-tight">{tab.title}</span>
        )}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label={`Cerrar ${tab.title}`}
        className="ml-1 hidden h-7 w-7 items-center justify-center rounded-xl text-foreground-muted transition hover:bg-surface-muted/40 hover:text-foreground group-hover:flex"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

interface ContextMenuState {
  tabId: string;
  x: number;
  y: number;
}

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    tabs,
    activeId,
    load,
    initialised,
    setActive,
    add,
    close,
    rename,
    reorder,
    syncRoute,
    updateIcon
  } = useTabsStore((state) => ({
    tabs: state.tabs,
    activeId: state.activeId,
    load: state.load,
    initialised: state.initialised,
    setActive: state.setActive,
    add: state.add,
    close: state.close,
    rename: state.rename,
    reorder: state.reorder,
    syncRoute: state.syncRoute,
    updateIcon: state.updateIcon
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTitle, setComposerTitle] = useState("Página sin título");
  const [composerEmoji, setComposerEmoji] = useState("🗒️");

  useEffect(() => {
    if (!initialised) {
      load();
    }
  }, [initialised, load]);

  const currentRoute = useMemo(() => {
    const base = pathname ?? "/dashboard";
    const query = searchParams?.toString();
    return query ? `${base}?${query}` : base;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (initialised) {
      syncRoute(currentRoute);
    }
  }, [initialised, currentRoute, syncRoute]);

  useEffect(() => {
    if (!activeId) return;
    const activeTab = tabs.find((tab) => tab.id === activeId);
    if (activeTab && currentRoute !== activeTab.route) {
      router.replace(activeTab.route);
    }
  }, [activeId, tabs, router, currentRoute]);

  useEffect(() => {
    if (!contextMenu) return;
    const handleDismiss = () => setContextMenu(null);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(null);
      }
    };
    window.addEventListener("click", handleDismiss, true);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("click", handleDismiss, true);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  const handleAddTab = useCallback(
    (preset: WorkspaceTab) => {
      const existing = tabs.find((tab) => tab.route === preset.route);
      if (existing) {
        setActive(existing.id);
        router.push(existing.route);
        return;
      }
      add({ ...preset, id: preset.id });
      setActive(preset.id);
      router.push(preset.route);
    },
    [add, router, setActive, tabs]
  );

  const handleCreateCustom = useCallback(() => {
    const title = composerTitle.trim() || "Nueva página";
    const icon = composerEmoji.trim() || "🗂️";
    const id = `tab-${Date.now().toString(36)}`;
    const route = `/workspace?tab=${id}`;
    const tab: WorkspaceTab = { id, title, icon, route };
    add(tab);
    setActive(id);
    router.push(route);
    setComposerOpen(false);
    setComposerTitle("Página sin título");
    setComposerEmoji("🗒️");
  }, [add, composerEmoji, composerTitle, router, setActive]);

  const openContextMenu = useCallback((tabId: string, event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const estimatedWidth = 220;
    const estimatedHeight = 160;
    const maxX = window.innerWidth - estimatedWidth - 12;
    const maxY = window.innerHeight - estimatedHeight - 12;
    const x = Math.min(event.clientX, Math.max(12, maxX));
    const y = Math.min(event.clientY, Math.max(12, maxY));
    setContextMenu({ tabId, x, y });
  }, []);

  const handleChangeIcon = useCallback(
    (tabId: string) => {
      const icon = window.prompt("Introduce un emoji o ícono corto para esta pestaña");
      if (icon === null) return;
      const value = icon.trim();
      updateIcon(tabId, value ? value.slice(0, 4) : null);
    },
    [updateIcon]
  );

  const handleRename = useCallback((tabId: string) => {
    setRenamingId(tabId);
  }, []);

  useEffect(() => {
    if (composerOpen) {
      setComposerTitle("Página sin título");
      setComposerEmoji("🗒️");
    }
  }, [composerOpen]);

  const items = useMemo(() => tabs.map((tab) => tab.id), [tabs]);

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!active || !over || active.id === over.id) return;
      const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
      const newIndex = tabs.findIndex((tab) => tab.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      reorder(oldIndex, newIndex);
    },
    [tabs, reorder]
  );

  if (!initialised) {
    return null;
  }

  return (
    <header className="sticky top-[72px] z-30 border-b border-border/40 bg-surface-base/80 backdrop-blur-xl md:top-0">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-4 sm:px-8">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <SortableTabTrigger
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeId}
                  isRenaming={renamingId === tab.id}
                  onClose={() => close(tab.id)}
                  onRename={(title) => {
                    rename(tab.id, title);
                    setRenamingId(null);
                  }}
                  onRenameStart={() => setRenamingId(tab.id)}
                  onRenameCancel={() => setRenamingId(null)}
                  onOpen={() => {
                    setActive(tab.id);
                    router.push(tab.route);
                  }}
                  onContextMenu={(event) => openContextMenu(tab.id, event)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-10 w-10 rounded-2xl border border-border/60">
              <Plus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Crear pestaña</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Pestañas rápidas</DropdownMenuLabel>
            {PRESET_OPTIONS.map((preset) => (
              <DropdownMenuItem key={preset.id} onSelect={() => handleAddTab(preset)}>
                <span className="mr-2 text-lg" aria-hidden>
                  {preset.icon ?? "🗂️"}
                </span>
                {preset.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setComposerOpen(true)}>
              <span className="mr-2 text-lg" aria-hidden>
                <Wand2 className="h-4 w-4" />
              </span>
              Nueva pestaña personalizada…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {contextMenu && (
        <div
          className="fixed z-50 min-w-[200px] rounded-xl border border-border/50 bg-surface-elevated/90 p-2 shadow-card"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          role="menu"
        >
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted/40"
            onClick={() => {
              handleRename(contextMenu.tabId);
              setContextMenu(null);
            }}
          >
            Renombrar pestaña
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted/40"
            onClick={() => {
              handleChangeIcon(contextMenu.tabId);
              setContextMenu(null);
            }}
          >
            Cambiar icono
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-surface-muted/40"
            onClick={() => {
              close(contextMenu.tabId);
              setContextMenu(null);
            }}
          >
            Cerrar pestaña
          </button>
        </div>
      )}

      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear nueva pestaña</DialogTitle>
            <DialogDescription>
              Personaliza un espacio para tus notas rápidas. Podrás cambiar el icono y el título cuando quieras.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              handleCreateCustom();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="tab-title">Título</Label>
              <Input
                id="tab-title"
                value={composerTitle}
                onChange={(event) => setComposerTitle(event.target.value)}
                placeholder="Daily log, roadmap, notas personales…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tab-icon">Icono</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="tab-icon"
                  value={composerEmoji}
                  onChange={(event) => setComposerEmoji(event.target.value)}
                  className="max-w-[120px]"
                />
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className={cn(
                        "h-8 w-8 rounded-xl border border-transparent text-lg transition",
                        composerEmoji === emoji ? "border-accent-primary bg-accent-primary/20" : "bg-surface-muted/40"
                      )}
                      onClick={() => setComposerEmoji(emoji)}
                      aria-label={`Usar ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setComposerOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar pestaña
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
}
