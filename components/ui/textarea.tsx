import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border/70 bg-surface-elevated/40 px-4 py-3 text-[15px] text-foreground placeholder:text-foreground-muted transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base",
        className
      )}
      {...props}
    />
  );
});
