import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch({ className, ...props }, ref) {
  return (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input ref={ref} type="checkbox" className="peer sr-only" {...props} />
      <div className="h-5 w-9 rounded-full bg-white/20 transition-colors peer-checked:bg-accent-primary/70" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
    </label>
  );
});
