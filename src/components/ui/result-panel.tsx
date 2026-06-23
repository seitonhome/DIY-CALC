"use client";
import * as React from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { formatCurrency, formatPct } from "@/lib/utils/format";
import type { CalculationResults, Locale } from "@/types";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ResultPanelProps {
  results: CalculationResults;
  locale: Locale;
  currency?: string;
  className?: string;
}

export function ResultPanel({ results, locale, currency = "USD", className }: ResultPanelProps) {
  const t = useTranslations("calculators.results");
  const tRec = useTranslations("calculators.recommendations");

  const isHealthy = results.netMargin >= 20;
  const isDanger = results.netMargin < 0;

  const riskColors = {
    low: "text-emerald-600 bg-emerald-50 border-emerald-100",
    medium: "text-amber-600 bg-amber-50 border-amber-100",
    high: "text-red-600 bg-red-50 border-red-100",
  };

  const riskIcons = {
    low: <CheckCircle className="h-4 w-4" />,
    medium: <AlertTriangle className="h-4 w-4" />,
    high: <AlertTriangle className="h-4 w-4" />,
  };

  const fmt = (v: number) => formatCurrency(v, currency, locale);
  const fmtPct = (v: number) => formatPct(v, locale);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <MetricBox
          label={t("costPerUnit")}
          value={fmt(results.costPerUnit)}
          accent="default"
        />
        <MetricBox
          label={t("suggestedPrice")}
          value={fmt(results.suggestedPrice)}
          accent="gold"
        />
        <MetricBox
          label={t("wholesalePrice")}
          value={fmt(results.wholesalePrice)}
          accent="default"
        />
        <MetricBox
          label={t("grossMargin")}
          value={fmtPct(results.grossMargin)}
          accent={results.grossMargin >= 30 ? "success" : "warning"}
        />
        <MetricBox
          label={t("netMargin")}
          value={fmtPct(results.netMargin)}
          accent={isHealthy ? "success" : isDanger ? "danger" : "warning"}
          icon={isHealthy ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        />
        <MetricBox
          label={t("profitPerUnit")}
          value={fmt(results.profitPerUnit)}
          accent={results.profitPerUnit >= 0 ? "success" : "danger"}
        />
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-3">
        <MetricBox label={t("totalProductionCost")} value={fmt(results.totalProductionCost)} />
        <MetricBox label={t("profitPerBatch")} value={fmt(results.profitPerBatch)} />
        <MetricBox label={t("breakEvenUnits")} value={`${results.breakEvenUnits} uds.`} />
        <MetricBox label={t("productionTime")} value={`${results.productionTimeMinutes} min`} />
      </div>

      {/* Risk level */}
      <div className={cn("flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium", riskColors[results.riskLevel])}>
        {riskIcons[results.riskLevel]}
        <span>{t("riskLevel")}: {t(`risk${results.riskLevel.charAt(0).toUpperCase() + results.riskLevel.slice(1)}` as any)}</span>
      </div>

      {/* Recommendation */}
      <div className="rounded-lg bg-stone-50 border border-stone-100 px-4 py-3">
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{t("recommendation")}</p>
        <p className="text-sm text-stone-700">{tRec(results.recommendation as any)}</p>
      </div>

      {/* Cost distribution chart */}
      {results.costDistribution.length > 0 && (
        <div className="rounded-xl border border-stone-100 bg-white p-4">
          <p className="text-sm font-semibold text-stone-700 mb-3">{t("costDistribution")}</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={results.costDistribution}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="cost"
              >
                {results.costDistribution.map((entry, index) => (
                  <Cell key={index} fill={entry.color ?? "#92400e"} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [fmt(Number(value)), ""]}
                contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

// ── Local helper ────────────────────────────────────────────

type MetricAccent = "default" | "gold" | "success" | "warning" | "danger";

const metricAccentStyles: Record<MetricAccent, string> = {
  default: "bg-stone-50 border-stone-100",
  gold: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
  success: "bg-emerald-50 border-emerald-100",
  warning: "bg-amber-50 border-amber-100",
  danger: "bg-red-50 border-red-100",
};

function MetricBox({
  label,
  value,
  accent = "default",
  icon,
}: {
  label: string;
  value: string;
  accent?: MetricAccent;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-lg border p-3", metricAccentStyles[accent])}>
      <p className="text-xs font-medium text-stone-500 truncate">{label}</p>
      <div className="mt-1 flex items-center gap-1">
        {icon}
        <p className="text-base font-bold text-stone-900 truncate">{value}</p>
      </div>
    </div>
  );
}
