import { type LabelHTMLAttributes } from "react";
import { cn } from "@/styles/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-medium uppercase tracking-[0.2em] text-white/60", className)} {...props} />;
}
