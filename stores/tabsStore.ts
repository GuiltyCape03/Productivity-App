"use client";

import { create } from "zustand";

export type WorkspaceTab = {
  id: string;
  title: string;
  icon?: string;
  route: string;
  project?: string | null;
};

interface TabsState {
  tabs: WorkspaceTab[];
  activeId: string | null;
  initialised: boolean;
  load: () => void;
  add: (tab: WorkspaceTab) => void;
  close: (id: string) => void;
  rename: (id: string, title: string) => void;
  setActive: (id: string) => void;
  reorder: (from: number, to: number) => void;
  syncRoute: (route: string) => void;
  updateProjectForActive: (projectId: string | null) => void;
}

const STORAGE_KEY = "nd.tabs.v1";

const DEFAULT_TABS: WorkspaceTab[] = [
  { id: "dashboard", title: "Dashboard", icon: "📊", route: "/" },
  { id: "tasks", title: "Tasks", icon: "✅", route: "/tasks" },
  { id: "goals", title: "Goals", icon: "🎯", route: "/goals" },
  { id: "workspace", title: "Workspace", icon: "🗂️", route: "/workspace" },
  { id: "calendar", title: "Calendar", icon: "📆", route: "/calendar" },
  { id: "coach", title: "Coach", icon: "🤖", route: "/coach" },
  { id: "chat", title: "Chat", icon: "💬", route: "/chat" }
];

function persistTabs(tabs: WorkspaceTab[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  } catch (error) {
    console.warn("No fue posible persistir las pestañas", error);
  }
}

function withLeadingSlash(route: string) {
  if (!route) return "/";
  return route.startsWith("/") ? route : `/${route}`;
}

function baseRoute(route: string) {
  const [path] = route.split("?");
  const [clean] = path.split("#");
  if (!clean) return "/";
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeId: null,
  initialised: false,
  load: () => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      let tabs: WorkspaceTab[] | null = null;
      if (raw) {
        const parsed = JSON.parse(raw) as WorkspaceTab[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          tabs = parsed.map((tab) => ({
            ...tab,
            route: withLeadingSlash(tab.route)
          }));
        }
      }
      if (!tabs) {
        tabs = DEFAULT_TABS;
        persistTabs(tabs);
      }
      set({ tabs, activeId: tabs[0]?.id ?? null, initialised: true });
    } catch (error) {
      console.warn("No se pudieron cargar las pestañas", error);
      set({ tabs: DEFAULT_TABS, activeId: DEFAULT_TABS[0]?.id ?? null, initialised: true });
    }
  },
  add: (tab) => {
    const route = withLeadingSlash(tab.route);
    set((state) => {
      const existing = state.tabs.find((item) => baseRoute(item.route) === baseRoute(route));
      if (existing) {
        return { ...state, activeId: existing.id };
      }
      const tabs = [...state.tabs, { ...tab, route }];
      persistTabs(tabs);
      return { ...state, tabs, activeId: tab.id };
    });
  },
  close: (id) => {
    set((state) => {
      if (state.tabs.length <= 1) {
        return state;
      }
      const tabs = state.tabs.filter((tab) => tab.id !== id);
      const activeId = state.activeId === id ? tabs[tabs.length - 1]?.id ?? null : state.activeId;
      persistTabs(tabs);
      return { ...state, tabs, activeId };
    });
  },
  rename: (id, title) => {
    set((state) => {
      const tabs = state.tabs.map((tab) => (tab.id === id ? { ...tab, title } : tab));
      persistTabs(tabs);
      return { ...state, tabs };
    });
  },
  setActive: (id) => {
    set((state) => ({ ...state, activeId: id }));
  },
  reorder: (from, to) => {
    set((state) => {
      const tabs = state.tabs.slice();
      if (from < 0 || to < 0 || from >= tabs.length || to >= tabs.length) {
        return state;
      }
      const [moved] = tabs.splice(from, 1);
      tabs.splice(to, 0, moved);
      persistTabs(tabs);
      return { ...state, tabs };
    });
  },
  syncRoute: (route) => {
    const normalised = baseRoute(route);
    const { tabs } = get();
    const target = tabs.find((tab) => baseRoute(tab.route) === normalised);
    if (target) {
      set({ activeId: target.id });
    }
  },
  updateProjectForActive: (projectId) => {
    set((state) => {
      if (!state.activeId) return state;
      const tabs = state.tabs.map((tab) =>
        tab.id === state.activeId ? { ...tab, project: projectId ?? undefined } : tab
      );
      persistTabs(tabs);
      return { ...state, tabs };
    });
  }
}));

export function getDefaultTabs() {
  return DEFAULT_TABS;
}
