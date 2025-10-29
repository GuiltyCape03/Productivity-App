"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/modules/dashboard/DashboardProvider";

interface PageViewProps {
  id: string;
}

export function PageView({ id }: PageViewProps) {
  const { pages, projects } = useDashboard();
  const page = useMemo(() => pages.find((item) => item.id === id) ?? null, [pages, id]);

  if (!page) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl font-semibold text-foreground">Página no encontrada</p>
        <p className="text-sm text-foreground-muted">Regresa al workspace para crear o seleccionar otra página.</p>
        <Button asChild>
          <Link href="/">Volver al dashboard</Link>
        </Button>
      </div>
    );
  }

  const projectName = page.projectId
    ? projects.find((project) => project.id === page.projectId)?.name ?? page.projectId
    : "Sin proyecto";

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-12">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground-muted">
        <Link href="/" className="hover:text-foreground">
          NeuralDesk
        </Link>
        <span>/</span>
        <Link href="/#workspace" className="hover:text-foreground">
          Workspace
        </Link>
        <span>/</span>
        <span className="text-foreground">{page.title}</span>
      </nav>
      <header className="mt-8 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="emoji text-4xl" aria-hidden>
            {page.icon}
          </span>
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">{page.title}</h1>
            <p className="text-sm text-foreground-muted">Proyecto: {projectName}</p>
          </div>
        </div>
      </header>
      <Separator className="my-8" />
      <section className="space-y-6">
        {page.blocks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-surface-elevated/40 p-6 text-sm text-foreground-muted">
            Esta página está vacía. Edítala desde el dashboard para agregar contenido.
          </p>
        ) : (
          page.blocks.map((block) => (
            <article key={block.id} className="rounded-2xl border border-border/60 bg-surface-elevated/70 p-5">
              {block.type === "divider" ? (
                <Separator />
              ) : block.type === "heading" ? (
                <h2 className="text-2xl font-semibold text-foreground">{block.content}</h2>
              ) : block.type === "checklist" ? (
                <div className="space-y-2">
                  {block.content.split("\n").map((line, index) => (
                    <p key={`${block.id}-${index}`} className="text-sm text-foreground">
                      {line || ""}
                    </p>
                  ))}
                </div>
              ) : block.type === "callout" ? (
                <div className="rounded-xl border border-accent-secondary/40 bg-accent-secondary/10 p-4 text-sm text-foreground">
                  {block.content}
                </div>
              ) : (
                <p className="whitespace-pre-line text-[15.5px] leading-7 text-foreground">{block.content}</p>
              )}
            </article>
          ))
        )}
      </section>
    </div>
  );
}
