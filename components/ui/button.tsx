import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/styles/utils";

type ButtonElement = HTMLButtonElement;

type ButtonProps = ButtonHTMLAttributes<ButtonElement> & VariantProps<typeof styles>;

const styles = cva(
  "inline-flex items-center justify-center rounded-xl font-medium transition-transform transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-accent-primary text-black hover:brightness-110 focus:ring-accent-primary focus:ring-offset-surface-base",
        ghost: "bg-transparent hover:bg-white/10 text-white",
        secondary: "bg-surface-muted text-zinc-100 hover:bg-surface-muted/70"
      },
      size: {
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-2.5 text-base",
        sm: "px-3 py-1.5 text-xs"
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
