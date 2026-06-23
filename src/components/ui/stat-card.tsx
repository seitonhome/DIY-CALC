import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ReactNode;
  className?: string;
  accent?: "default" | "success" | "danger" | "warning" | "gold";
}

const accentMap = {
  default: "bg-stone-50 border-stone-100",
  success: "bg-emerald-50 border-emerald-100",
  danger: "bg-red-50 border-red-100",
  warning: "bg-amber-50 border-amber-100",
  gold: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
};

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  icon,
  className,
  accent = "default",
}: StatCardProps) {
  return (
    <div className={cn("rounded-xl border p-5 transition-all hover:shadow-sm", accentMap[accent], className)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wider truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-stone-900 truncate">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-stone-500 truncate">{subtitle}</p>}
          {trend && trendValue && (
            <div
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 text-xs font-medium",
                trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-stone-400"
              )}
            >
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className="ml-3 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/60 text-stone-500">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
