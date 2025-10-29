import { type HTMLAttributes, type HTMLHeadingElement } from "react";
import { cn } from "@/styles/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/60 bg-surface-elevated shadow-card backdrop-blur-sm transition-colors",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-[var(--card-padding-x)] pt-[var(--card-padding-y)]", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-[var(--card-padding-x)] pb-[var(--card-padding-y)]", className)} {...props} />;
}
