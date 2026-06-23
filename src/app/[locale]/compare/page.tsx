"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateResults } from "@/lib/calculations/core";
import { formatCurrency, formatPct } from "@/lib/utils/format";
import type { Locale, CommonCalcInputs, CostItem } from "@/types";
import { GitCompare, Plus, Trash2, RefreshCw, Trophy } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const scenarioSchema = z.object({
  name: z.string().default("Scenario"),
  directCosts: z.coerce.number().min(0).default(0),
  laborCostPerHour: z.coerce.number().min(0).default(0),
  laborHours: z.coerce.number().min(0).default(0),
  packagingCost: z.coerce.number().min(0).default(0),
  wastePct: z.coerce.number().min(0).default(5),
  platformFeePct: z.coerce.number().min(0).default(0),
  taxPct: z.coerce.number().min(0).default(0),
  desiredMarginPct: z.coerce.number().min(1).default(40),
  units: z.coerce.number().min(1).default(1),
  salePrice: z.coerce.number().min(0).default(0),
});

type Scenario = z.infer<typeof scenarioSchema>;

const emptyScenario = (name: string): Scenario => ({
  name, directCosts: 0, laborCostPerHour: 0, laborHours: 0, packagingCost: 0,
  wastePct: 5, platformFeePct: 0, taxPct: 0, desiredMarginPct: 40, units: 1, salePrice: 0,
});

export default function ComparePage() {
  const t = useTranslations("compare");
  const locale = useLocale() as Locale;
  const [scenarios, setScenarios] = useState<Scenario[]>([
    emptyScenario(locale === "es" ? "Escenario A" : "Scenario A"),
    emptyScenario(locale === "es" ? "Escenario B" : "Scenario B"),
  ]);
  const [results, setResults] = useState<any[]>([]);
  const [hasResults, setHasResults] = useState(false);

  function updateField(index: number, field: keyof Scenario, value: string | number) {
    setScenarios(prev => prev.map((s, i) => i === index ? { ...s, [field]: typeof value === "string" ? value : Number(value) } : s));
  }

  function addScenario() {
    const letters = ["A","B","C","D","E"];
    const label = locale === "es" ? `Escenario ${letters[scenarios.length]}` : `Scenario ${letters[scenarios.length]}`;
    setScenarios(prev => [...prev, emptyScenario(label)]);
  }

  function removeScenario(i: number) {
    setScenarios(prev => prev.filter((_, idx) => idx !== i));
  }

  function calculate() {
    const res = scenarios.map(s => {
      const laborHoursTotal = s.laborHours;
      const inputs: CommonCalcInputs = {
        productName: s.name,
        units: s.units,
        batchSize: s.units,
        wastePct: s.wastePct,
        laborCostPerHour: s.laborCostPerHour,
        laborHours: laborHoursTotal,
        energyCost: 0,
        packagingCost: s.packagingCost,
        labelCost: 0,
        boxCost: 0,
        shippingCost: 0,
        taxPct: 0,
        platformFeePct: s.platformFeePct,
        affiliateFeePct: 0,
        desiredMarginPct: s.desiredMarginPct,
        notes: "",
        currency: "USD",
      };
      const costItems: CostItem[] = [
        { name: locale === "es" ? "Materiales" : "Materials", cost: s.directCosts, percentage: 100 },
      ];
      const r = calculateResults(s.directCosts, inputs, costItems, laborHoursTotal * 60);
      return { name: s.name, ...r };
    });
    setResults(res);
    setHasResults(true);
  }

  const bestNetMargin = hasResults ? Math.max(...results.map(r => r.netMarginPct)) : 0;
  const bestProfit = hasResults ? Math.max(...results.map(r => r.profitPerUnit)) : 0;

  const COLORS = ["#d97706","#0891b2","#65a30d","#7c3aed","#db2777"];

  const chartData = hasResults ? [
    { metric: locale === "es" ? "Costo" : "Cost", ...Object.fromEntries(results.map(r => [r.name, r.totalCostPerUnit])) },
    { metric: locale === "es" ? "Precio sugerido" : "Suggested price", ...Object.fromEntries(results.map(r => [r.name, r.suggestedPrice])) },
    { metric: locale === "es" ? "Ganancia/ud." : "Profit/unit", ...Object.fromEntries(results.map(r => [r.name, r.profitPerUnit])) },
  ] : [];

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare className="h-5 w-5 text-sky-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      {/* Scenarios grid */}
      <div className={`grid gap-4 mb-4 ${scenarios.length === 2 ? "md:grid-cols-2" : scenarios.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-4"}`}>
        {scenarios.map((s, i) => (
          <Card key={i} className="border-t-4" style={{ borderTopColor: COLORS[i % COLORS.length] }}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <input
                  value={s.name}
                  onChange={e => updateField(i, "name", e.target.value)}
                  className="font-bold text-stone-900 text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-amber-400 rounded px-1 w-full"
                />
                {scenarios.length > 2 && (
                  <button onClick={() => removeScenario(i)} className="text-stone-400 hover:text-red-500 ml-1 flex-shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5 text-sm">
              <Input label={t("fields.directCosts")} type="number" min="0" step="0.01" value={s.directCosts} onChange={e => updateField(i, "directCosts", e.target.value)} prefix="$" />
              <Input label={t("fields.laborHours")} type="number" min="0" step="0.5" value={s.laborHours} onChange={e => updateField(i, "laborHours", e.target.value)} />
              <Input label={t("fields.laborCostPerHour")} type="number" min="0" step="0.01" value={s.laborCostPerHour} onChange={e => updateField(i, "laborCostPerHour", e.target.value)} prefix="$" />
              <Input label={t("fields.packagingCost")} type="number" min="0" step="0.01" value={s.packagingCost} onChange={e => updateField(i, "packagingCost", e.target.value)} prefix="$" />
              <Input label={t("fields.wastePct")} type="number" min="0" max="50" value={s.wastePct} onChange={e => updateField(i, "wastePct", e.target.value)} suffix="%" />
              <Input label={t("fields.platformFeePct")} type="number" min="0" max="100" value={s.platformFeePct} onChange={e => updateField(i, "platformFeePct", e.target.value)} suffix="%" />
              <Input label={t("fields.margin")} type="number" min="1" max="100" value={s.desiredMarginPct} onChange={e => updateField(i, "desiredMarginPct", e.target.value)} suffix="%" />
              <Input label={t("fields.units")} type="number" min="1" value={s.units} onChange={e => updateField(i, "units", e.target.value)} />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {scenarios.length < 5 && (
          <Button variant="outline" onClick={addScenario} className="border-dashed">
            <Plus className="h-4 w-4" />{t("addScenario")}
          </Button>
        )}
        <Button variant="primary" onClick={calculate}>
          <GitCompare className="h-4 w-4" />{t("compare")}
        </Button>
        <Button variant="outline" onClick={() => { setHasResults(false); setResults([]); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {hasResults && (
        <div className="space-y-6">
          {/* Winner banner */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3">
            <Trophy className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-amber-900 text-sm">
                {locale === "es" ? "Mejor margen neto" : "Best net margin"}:{" "}
                {results.find(r => r.netMarginPct === bestNetMargin)?.name}
              </p>
              <p className="text-xs text-amber-700">
                {locale === "es" ? "Mayor ganancia por unidad" : "Highest profit per unit"}:{" "}
                {results.find(r => r.profitPerUnit === bestProfit)?.name}
              </p>
            </div>
          </div>

          {/* Comparison table */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t("results.table")}</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("results.metric")}</th>
                      {results.map((r, i) => (
                        <th key={i} className="pb-2 text-right font-medium text-xs" style={{ color: COLORS[i % COLORS.length] }}>{r.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {[
                      { label: locale === "es" ? "Costo total/ud." : "Total cost/unit", key: "totalCostPerUnit", fmt: (v: number) => formatCurrency(v, "USD", locale) },
                      { label: locale === "es" ? "Precio sugerido" : "Suggested price", key: "suggestedPrice", fmt: (v: number) => formatCurrency(v, "USD", locale) },
                      { label: locale === "es" ? "Ganancia/ud." : "Profit/unit", key: "profitPerUnit", fmt: (v: number) => formatCurrency(v, "USD", locale) },
                      { label: locale === "es" ? "Margen bruto" : "Gross margin", key: "grossMarginPct", fmt: (v: number) => formatPct(v, locale) },
                      { label: locale === "es" ? "Margen neto" : "Net margin", key: "netMarginPct", fmt: (v: number) => formatPct(v, locale) },
                      { label: locale === "es" ? "Break-even" : "Break-even", key: "breakEvenUnits", fmt: (v: number) => `${Math.ceil(v)} uds.` },
                    ].map(({ label, key, fmt }) => (
                      <tr key={key} className="hover:bg-stone-50/50">
                        <td className="py-2.5 text-stone-600">{label}</td>
                        {results.map((r, i) => {
                          const val = r[key as keyof typeof r] as number;
                          const isBest = key === "netMarginPct" ? val === bestNetMargin : key === "profitPerUnit" ? val === bestProfit : false;
                          return (
                            <td key={i} className={`py-2.5 text-right font-medium ${isBest ? "text-emerald-600" : "text-stone-900"}`}>
                              {fmt(val)}
                              {isBest && <span className="ml-1 text-emerald-500">★</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Bar chart */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t("results.chart")}</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                  <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v) => formatCurrency(Number(v), "USD", locale)} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {results.map((r, i) => (
                    <Bar key={r.name} dataKey={r.name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
