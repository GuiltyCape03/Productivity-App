import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/styles/utils";

type ButtonElement = HTMLButtonElement;

type ButtonProps = ButtonHTMLAttributes<ButtonElement> & VariantProps<typeof styles>;

const styles = cva(
  "inline-flex min-w-[2.75rem] items-center justify-center gap-2 rounded-xl border border-white/10 bg-[hsl(var(--panel))] px-5 text-sm font-medium text-[hsl(var(--text))] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))]/60 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-[hsl(var(--accent))] text-[hsl(var(--bg))] hover:bg-[hsl(var(--accent-2))]",
        secondary: "bg-white/5 text-[hsl(var(--text))] hover:bg-white/10",
        ghost: "border-transparent bg-transparent text-[hsl(var(--muted))] hover:bg-white/5 hover:text-[hsl(var(--text))]",
        outline: "bg-transparent text-[hsl(var(--text))] hover:bg-white/5"
      },
      size: {
        sm: "h-[calc(var(--input-height)-0.25rem)] px-4 text-xs",
        md: "h-[var(--input-height)] px-5 text-sm",
        lg: "h-[calc(var(--input-height)+0.25rem)] px-6 text-base"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export const Button = forwardRef<ButtonElement, ButtonProps>(function Button({ className, variant, size, ...props }, ref) {
  return <button ref={ref} className={cn(styles({ variant, size }), className)} {...props} />;
});
