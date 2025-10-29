"use client";

import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, CalendarRange, CheckSquare, MessageSquareText, Settings, Target, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/styles/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  emoji: string;
}

const ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Panel", icon: BarChart3, emoji: "📊" },
  { href: "/tasks", label: "Tareas", icon: CheckSquare, emoji: "✅" },
  { href: "/goals", label: "Metas", icon: Target, emoji: "🎯" },
  { href: "/workspace", label: "Workspace", icon: Workflow, emoji: "🗂️" },
  { href: "/calendar", label: "Agenda", icon: CalendarRange, emoji: "📅" },
  { href: "/chat", label: "Chat IA", icon: MessageSquareText, emoji: "💬" },
  { href: "/preferences", label: "Preferencias", icon: Settings, emoji: "⚙️" }
];

export function SidebarNavigation() {
  const pathname = usePathname();
  const router = useRouter();

  const activePath = useMemo(() => {
    if (!pathname) return "/dashboard";
    if (pathname === "/") return "/dashboard";
    const [, segment] = pathname.split("/");
    return segment ? `/${segment}` : pathname;
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={200}>
      <nav className="flex flex-col gap-2" aria-label="Secciones principales">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activePath === item.href;
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className={cn(
                    "group relative h-12 w-12 rounded-2xl border border-transparent p-0 text-foreground-muted transition",
                    isActive
                      ? "border-accent-primary/60 bg-accent-primary/15 text-accent-primary shadow-card"
                      : "hover:border-border/50 hover:bg-surface-muted/60"
                  )}
                  onClick={() => router.push(item.href)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sr-only">{item.label}</span>
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="pointer-events-none absolute -bottom-2 left-1/2 hidden -translate-x-1/2 text-xs text-foreground-muted group-hover:block">
                    {item.emoji}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="rounded-xl border border-border/40 bg-surface-elevated/80 px-3 py-2 text-sm">
                {item.emoji} {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
