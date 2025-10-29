"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, X } from "lucide-react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useTabsStore, type WorkspaceTab, getDefaultTabs } from "@/stores/tabsStore";

interface TabTriggerProps {
  tab: WorkspaceTab;
  isActive: boolean;
  onClose: () => void;
  onRename: (title: string) => void;
  onOpen: () => void;
}

function SortableTabTrigger({ tab, isActive, onClose, onRename, onOpen }: TabTriggerProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tab.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1
  };
  const [isEditing, setEditing] = useState(false);
  const [value, setValue] = useState(tab.title);

  useEffect(() => {
    setValue(tab.title);
  }, [tab.title]);

  const handleSubmit = useCallback(() => {
    const title = value.trim() || "Página";
    onRename(title);
    setEditing(false);
  }, [onRename, value]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex h-10 min-w-[132px] max-w-[240px] items-center rounded-xl border ${
        isActive ? "border-accent-primary/80 bg-accent-primary/15" : "border-border/60 bg-surface-elevated/60"
      } px-3 text-sm text-foreground transition-colors`}
      {...attributes}
      {...listeners}
    >
      <button
        type="button"
        onClick={onOpen}
        onDoubleClick={() => setEditing(true)}
        className="flex w-full items-center gap-2 truncate text-left outline-none"
      >
        <span className="emoji" aria-hidden>
          {tab.icon ?? "🗂️"}
        </span>
        {isEditing ? (
          <Input
            autoFocus
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onBlur={handleSubmit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setEditing(false);
                setValue(tab.title);
              }
            }}
            className="h-8 w-full border-transparent bg-transparent px-1 text-sm"
          />
        ) : (
          <span className="truncate font-medium">{tab.title}</span>
        )}
      </button>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        aria-label={`Cerrar ${tab.title}`}
        className="ml-2 hidden h-6 w-6 items-center justify-center rounded-md text-foreground-muted transition hover:bg-surface-muted hover:text-foreground group-hover:flex"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

const PRESET_OPTIONS = getDefaultTabs();

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { tabs, activeId, load, initialised, setActive, add, close, rename, reorder, syncRoute } = useTabsStore((state) => ({
    tabs: state.tabs,
    activeId: state.activeId,
    load: state.load,
    initialised: state.initialised,
    setActive: state.setActive,
    add: state.add,
    close: state.close,
    rename: state.rename,
    reorder: state.reorder,
    syncRoute: state.syncRoute
  }));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  useEffect(() => {
    if (!initialised) {
      load();
    }
  }, [initialised, load]);

  useEffect(() => {
    if (initialised) {
      syncRoute(pathname ?? "/");
    }
  }, [initialised, pathname, syncRoute]);

  useEffect(() => {
    if (!activeId) return;
    const activeTab = tabs.find((tab) => tab.id === activeId);
    if (activeTab && pathname !== activeTab.route) {
      router.replace(activeTab.route);
    }
  }, [activeId, tabs, router, pathname]);

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

  const handleCreateWorkspace = useCallback(() => {
    const workspaceTab = tabs.find((tab) => tab.route === "/workspace");
    if (workspaceTab) {
      setActive(workspaceTab.id);
    } else {
      const id = `workspace-${Date.now().toString(36)}`;
      add({ id, title: "Workspace", icon: "🗂️", route: "/workspace" });
      setActive(id);
    }
    router.push("/workspace?newPage=1");
  }, [add, router, setActive, tabs]);

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
    <div className="sticky top-0 z-40 border-b border-border/50 bg-surface-base/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 md:px-6">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={items} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {tabs.map((tab) => (
                <SortableTabTrigger
                  key={tab.id}
                  tab={tab}
                  isActive={tab.id === activeId}
                  onClose={() => close(tab.id)}
                  onRename={(title) => rename(tab.id, title)}
                  onOpen={() => {
                    setActive(tab.id);
                    router.push(tab.route);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="ml-auto h-9 w-9 rounded-full">
              <Plus className="h-4 w-4" aria-hidden />
              <span className="sr-only">Añadir pestaña</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Pestañas rápidas</DropdownMenuLabel>
            {PRESET_OPTIONS.map((preset) => (
              <DropdownMenuItem key={preset.id} onSelect={() => handleAddTab(preset)}>
                <span className="emoji mr-2 text-lg" aria-hidden>
                  {preset.icon ?? "🗂️"}
                </span>
                {preset.title}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleCreateWorkspace}>
              <span className="emoji mr-2 text-lg" aria-hidden>
                📝
              </span>
              Nueva página de Workspace…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
