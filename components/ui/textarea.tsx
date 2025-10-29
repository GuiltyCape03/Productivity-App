import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/80",
        className
      )}
      {...props}
    />
  );
});
