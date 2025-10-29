import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border/70 bg-surface-elevated/40 px-4 text-[15px] text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
