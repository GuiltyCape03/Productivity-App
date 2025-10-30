import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-[var(--input-height)] w-full rounded-xl border border-white/10 bg-[hsl(var(--panel))] px-4 text-sm text-[hsl(var(--text))] placeholder:text-[hsl(var(--muted))] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/60 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
});
