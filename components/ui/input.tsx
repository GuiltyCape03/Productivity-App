import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border/70 bg-surface-elevated/40 px-4 text-[15px] text-foreground placeholder:text-foreground-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        className
      )}
      {...props}
    />
  );
});
