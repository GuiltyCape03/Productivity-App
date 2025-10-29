import { type LabelHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-xs font-medium uppercase tracking-[0.18em] text-foreground-muted", className)}
      {...props}
    />
  );
}
