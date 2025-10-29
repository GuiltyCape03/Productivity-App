import { type SelectHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full appearance-none rounded-xl border border-border/70 bg-surface-base/40 px-4 py-2 text-sm text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
