import { type HTMLAttributes } from "react";
import { cn } from "@/styles/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "danger" | "sky";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-accent-primary/15 text-accent-primary border border-accent-primary/30",
    outline: "border border-white/20 text-white",
    danger: "bg-accent-danger/15 text-accent-danger border border-accent-danger/30",
    sky: "bg-accent-secondary/15 text-accent-secondary border border-accent-secondary/30"
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
