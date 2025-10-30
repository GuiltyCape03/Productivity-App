import { type ReactNode } from "react";
import { cn } from "@/styles/utils";

interface EmptyStateProps {
  emoji: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ emoji, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-white/5 bg-white/5 px-6 py-8 text-center text-sm text-[hsl(var(--muted))]",
        className
      )}
    >
      <span className="text-2xl" role="img" aria-hidden>
        {emoji}
      </span>
      <div className="space-y-1">
        <p className="text-base font-semibold text-[hsl(var(--text))]">{title}</p>
        <p className="text-sm text-[hsl(var(--muted))]">{description}</p>
      </div>
      {action ? <div className="text-sm text-[hsl(var(--text))]">{action}</div> : null}
    </div>
  );
}
