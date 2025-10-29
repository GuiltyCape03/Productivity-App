import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/styles/utils";

type ButtonElement = HTMLButtonElement;

type ButtonProps = ButtonHTMLAttributes<ButtonElement> & VariantProps<typeof styles>;

const styles = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base disabled:cursor-not-allowed disabled:opacity-55",
  {
    variants: {
      variant: {
        primary: "bg-accent-primary text-white shadow-soft hover:shadow-hard hover:brightness-105",
        secondary: "bg-surface-muted text-foreground hover:bg-surface-muted/80",
        ghost: "text-foreground hover:bg-surface-muted/50",
        outline: "border border-border/70 bg-transparent text-foreground hover:bg-surface-muted/40"
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base"
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
