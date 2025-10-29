import { type ReactNode } from "react";
import { cn } from "@/styles/utils";

interface PageLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
  mainClassName?: string;
}

export function PageLayout({
  eyebrow,
  title,
  description,
  actions,
  children,
  aside,
  mainClassName
}: PageLayoutProps) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-10 px-6 pb-16 md:px-12">
      <header className="pt-6 md:pt-10">
        <div className="flex flex-col gap-6 rounded-3xl border border-border/40 bg-surface-elevated/60 p-8 shadow-card backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              {eyebrow && <p className="text-xs uppercase tracking-[0.22em] text-foreground-muted">{eyebrow}</p>}
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{title}</h1>
              {description && <p className="max-w-3xl text-base leading-relaxed text-foreground-muted">{description}</p>}
            </div>
            {actions && <div className="flex shrink-0 items-start gap-3">{actions}</div>}
          </div>
        </div>
      </header>

      {aside ? (
        <div className="layout-grid items-start">
          <div className={cn("col-span-12 space-y-10 xl:col-span-8", mainClassName)}>{children}</div>
          <aside className="col-span-12 space-y-10 xl:col-span-4">{aside}</aside>
        </div>
      ) : (
        <div className={cn("space-y-10", mainClassName)}>{children}</div>
      )}
    </div>
  );
}
