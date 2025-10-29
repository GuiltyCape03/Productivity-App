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
    <div className="mx-auto w-full max-w-7xl space-y-8 px-6 pb-24 sm:px-10">
      <header className="rounded-[32px] border border-border/40 bg-surface-elevated/80 p-8 shadow-card backdrop-blur-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <div className="space-y-2">
              {eyebrow && <p className="text-xs uppercase tracking-[0.22em] text-foreground-subtle">{eyebrow}</p>}
              <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">{title}</h1>
            </div>
            {description && <p className="max-w-3xl text-sm leading-relaxed text-foreground-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-start gap-3">{actions}</div>}
        </div>
      </header>

      {aside ? (
        <div className="layout-grid items-start gap-8">
          <div className={cn("col-span-12 space-y-6 xl:col-span-8", mainClassName)}>{children}</div>
          <aside className="col-span-12 space-y-6 xl:col-span-4">{aside}</aside>
        </div>
      ) : (
        <div className={cn("space-y-6", mainClassName)}>{children}</div>
      )}
    </div>
  );
}
