import { type HTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "danger" | "sky" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-accent-primary/15 text-accent-primary border border-accent-primary/25",
    outline: "border border-border/70 text-foreground",
    danger: "bg-accent-danger/15 text-accent-danger border border-accent-danger/30",
    sky: "bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30",
    muted: "bg-surface-muted/60 text-foreground-muted border border-border/50"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
