import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/styles/utils";

export interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  as?: "section" | "article" | "div" | "aside";
}

const baseStyles =
  "group relative flex min-h-[120px] flex-col overflow-hidden rounded-2xl border border-white/5 bg-[hsl(var(--panel))] p-[var(--surface-padding)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.16)]";

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(function Surface(
  { as: Component = "div", className, ...props },
  ref
) {
  return <Component ref={ref as never} className={cn(baseStyles, className)} {...props} />;
});

export interface SurfaceHeaderProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const SurfaceHeader = forwardRef<HTMLDivElement, SurfaceHeaderProps>(function SurfaceHeader(
  { glass, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-3 border-b border-white/5 pb-4 text-[hsl(var(--muted))]",
        glass && "backdrop-blur-md bg-white/5",
        className
      )}
      {...props}
    />
  );
});

export const SurfaceTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(function SurfaceTitle(
  { className, ...props },
  ref
) {
  return (
    <h2
      ref={ref}
      className={cn("text-2xl font-semibold tracking-tight text-[hsl(var(--text))]", className)}
      {...props}
    />
  );
});

export const SurfaceDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function SurfaceDescription({ className, ...props }, ref) {
    return (
      <p
        ref={ref}
        className={cn(
          "text-sm text-[hsl(var(--muted))]",
          className
        )}
        {...props}
      />
    );
  }
);

export const SurfaceContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function SurfaceContent(
  { className, ...props },
  ref
) {
  return <div ref={ref} className={cn("flex flex-col gap-[var(--surface-gap)] pt-4", className)} {...props} />;
});
