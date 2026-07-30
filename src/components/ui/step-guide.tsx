import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepGuideStep {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Use for safety-critical steps (e.g. lye handling) — renders the badge in red instead of amber. */
  critical?: boolean;
}

interface StepGuideProps {
  title: string;
  steps: StepGuideStep[];
  className?: string;
}

/**
 * Visual step-by-step process guide: a numbered vertical timeline of icon +
 * title + description. Used across calculators to show the artisan exactly
 * how to execute the recipe the calculator just produced, not just its cost.
 */
export function StepGuide({ title, steps, className }: StepGuideProps) {
  if (steps.length === 0) return null;

  return (
    <div className={cn("rounded-xl border border-stone-200 bg-white p-5", className)}>
      <p className="text-sm font-bold text-stone-900 mb-4">{title}</p>
      <div>
        {steps.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === steps.length - 1;
          return (
            <div key={i} className="flex gap-3 relative">
              {!isLast && (
                <div className="absolute left-[19px] top-10 bottom-0 w-px bg-stone-200" aria-hidden="true" />
              )}
              <div
                className={cn(
                  "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2",
                  step.critical
                    ? "bg-red-50 border-red-300 text-red-600"
                    : "bg-amber-50 border-amber-300 text-amber-700"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className={cn("flex-1 min-w-0", isLast ? "pb-1" : "pb-6")}>
                <p className="text-sm font-semibold text-stone-900">
                  {i + 1}. {step.title}
                </p>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
