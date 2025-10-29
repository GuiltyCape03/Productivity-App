import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/styles/utils";

type ButtonElement = HTMLButtonElement;

type ButtonProps = ButtonHTMLAttributes<ButtonElement> & VariantProps<typeof styles>;

const styles = cva(
  "inline-flex h-11 min-w-[2.75rem] items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-accent-primary text-white shadow-card hover:brightness-105",
        secondary: "bg-surface-muted/50 text-foreground hover:bg-surface-muted/70",
        ghost: "text-foreground-muted hover:text-foreground hover:bg-surface-muted/40",
        outline: "border border-border/70 bg-transparent text-foreground hover:border-border hover:bg-surface-muted/40"
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base"
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
