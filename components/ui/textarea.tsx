import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-white/10 bg-[hsl(var(--panel))] px-4 py-3 text-sm text-[hsl(var(--text))] placeholder:text-[hsl(var(--muted))] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/60 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  );
});
