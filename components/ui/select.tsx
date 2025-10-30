import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-[var(--input-height)] w-full rounded-xl border border-white/10 bg-[hsl(var(--panel))] px-4 text-sm text-[hsl(var(--text))] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/60 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
