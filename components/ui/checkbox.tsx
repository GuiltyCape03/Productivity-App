import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded border border-white/20 bg-white/10 text-accent-primary focus:ring-2 focus:ring-accent-primary/80",
        className
      )}
      {...props}
    />
  );
});
