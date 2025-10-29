import { type SelectHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/80",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
