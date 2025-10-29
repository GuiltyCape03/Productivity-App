"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/styles/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ className, side = "top", align = "center", ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Content
      side={side}
      align={align}
      sideOffset={8}
      className={cn(
        "z-50 max-w-xs rounded-lg border border-border/60 bg-surface-elevated px-3 py-2 text-xs text-foreground shadow-badge",
        className
      )}
      {...props}
    />
  );
}
