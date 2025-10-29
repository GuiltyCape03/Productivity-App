"use client";

import { type ReactNode, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { SidebarNavigation } from "@/components/layout/SidebarNavigation";
import { TabBar } from "@/components/layout/TabBar";

const TRANSITION = { duration: 0.32, ease: [0.22, 1, 0.36, 1] };

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();

  const key = useMemo(() => pathname ?? "app", [pathname]);
  const isDark = (resolvedTheme ?? "dark") === "dark";

  return (
    <div className="relative flex min-h-screen w-full bg-surface-base/95">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid" aria-hidden />
      <aside className="sticky top-0 hidden h-screen w-[84px] flex-col justify-between border-r border-border/50 bg-surface-base/70 px-4 py-6 backdrop-blur-xl md:flex">
        <div className="flex flex-col items-center gap-6">
          <div className="rounded-2xl border border-border/40 bg-surface-elevated/80 px-3 py-2 text-sm font-semibold text-foreground">
            ND
          </div>
          <SidebarNavigation />
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-11 w-11 rounded-2xl border border-border/40 text-foreground"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        >
          {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <MoonStar className="h-5 w-5" aria-hidden />}
        </Button>
      </aside>
      <div className="relative flex min-h-screen flex-1 flex-col">
        <div className="border-b border-border/40 bg-surface-base/70 px-4 py-4 backdrop-blur-xl md:hidden">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-2xl border border-border/40 bg-surface-elevated/80 px-3 py-2 text-sm font-semibold text-foreground">
              ND
            </div>
            <Button
              type="button"
              variant="ghost"
              className="h-10 w-10 rounded-2xl border border-border/40 text-foreground"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {isDark ? <Sun className="h-5 w-5" aria-hidden /> : <MoonStar className="h-5 w-5" aria-hidden />}
            </Button>
          </div>
        </div>
        <TabBar />
        <div className="relative flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: TRANSITION }}
              exit={{ opacity: 0, y: -12, transition: TRANSITION }}
              className="pb-20 pt-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
