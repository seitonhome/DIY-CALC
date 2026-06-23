import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-stone-100 text-stone-700",
        primary: "bg-amber-100 text-amber-800",
        success: "bg-emerald-100 text-emerald-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-700",
        info: "bg-sky-100 text-sky-800",
        outline: "border border-stone-200 text-stone-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
