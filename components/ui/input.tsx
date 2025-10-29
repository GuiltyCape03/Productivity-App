import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/80",
        className
      )}
      {...props}
    />
  );
});
