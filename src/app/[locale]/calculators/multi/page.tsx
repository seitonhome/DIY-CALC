"use client";
import { useState, useCallback, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResultPanel } from "@/components/ui/result-panel";
import { StepGuide, type StepGuideStep } from "@/components/ui/step-guide";
import { TipsRotator } from "@/components/ui/tips-rotator";
import { calculateMulti, type MultiCalculationResult } from "@/lib/calculations/multi";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { MultiInputs, Locale } from "@/types";
import { Package, Plus, Trash2, Save, FileDown, RefreshCw, Flame, Droplets, Sparkles, Mountain, Layers3, Info, type LucideIcon } from "lucide-react";
import { TooltipHelp } from "@/components/ui/tooltip";
import { saveFormula } from "@/lib/formulas";
import { getPreferredCurrency } from "@/lib/preferences";
import { CURRENCIES } from "@/lib/currencies";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import { v4 as uuidv4 } from "uuid";

const COMPONENT_TIPS: Record<string, { title_es: string; title_en: string; hint_es: string; hint_en: string }> = {
  candles: { title_es: "Vela: cuidado con la cera caliente", title_en: "Candle: watch for hot wax", hint_es: "Nunca dejes la cera sola en el fuego. Agrega fragancia solo a la temperatura correcta para esa cera." , hint_en: "Never leave wax unattended over heat. Add fragrance only at that wax's correct temperature." },
  resin: { title_es: "Resina: ventila y respeta la proporción", title_en: "Resin: ventilate and respect the ratio", hint_es: "Trabaja en un área ventilada y mide Parte A/B con precisión — es la causa #1 de que la resina no cure." , hint_en: "Work in a ventilated area and measure Part A/B precisely — the #1 cause of resin that never cures." },
  soap: { title_es: "Jabón: si lleva sosa, equípate primero", title_en: "Soap: if it uses lye, gear up first", hint_es: "Guantes y gafas si es un jabón con sosa (proceso frío/caliente) — es corrosiva. La glicerina no la necesita." , hint_en: "Gloves and goggles if it's a lye soap (cold/hot process) — it's corrosive. Glycerin soap doesn't need this." },
  concrete: { title_es: "Concreto: protégete del polvo", title_en: "Concrete: protect yourself from dust", hint_es: "Mascarilla al mezclar cemento y arena en seco — el polvo de sílice es dañino si lo respiras repetidamente." , hint_en: "Mask when mixing dry cement and sand — silica dust is harmful if inhaled repeatedly." },
  plaster: { title_es: "Yeso: va AL AGUA, nunca al revés", title_en: "Plaster: goes INTO water, never the reverse", hint_es: "Mide el agua primero y espolvorea el yeso encima — al revés se hacen grumos." , hint_en: "Measure the water first and sift the plaster on top — doing it backwards causes lumps." },
};

const componentSchema = z.object({
  id: z.string().default(() => uuidv4()),
  type: z.enum(["candles","resin","soap","concrete","plaster","multi"]).default("candles"),
  name: z.string().min(1).default(""),
  costPerUnit: z.coerce.number().min(0).default(0),
  productionTimeMin: z.coerce.number().min(0).default(30),
  wastePct: z.coerce.number().min(0).max(50).default(5),
  notes: z.string().default(""),
});

const schema = z.object({
  productName: z.string().default(""),
  components: z.array(componentSchema).min(1),
  units: z.coerce.number().min(1).default(1),
  batchSize: z.coerce.number().min(1).default(1),
  wastePct: z.coerce.number().min(0).default(3),
  laborCostPerHour: z.coerce.number().min(0).default(0),
  laborHours: z.coerce.number().min(0).default(0),
  energyCost: z.coerce.number().min(0).default(0),
  packagingCost: z.coerce.number().min(0).default(0),
  labelCost: z.coerce.number().min(0).default(0),
  boxCost: z.coerce.number().min(0).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
  taxPct: z.coerce.number().min(0).default(0),
  platformFeePct: z.coerce.number().min(0).default(0),
  affiliateFeePct: z.coerce.number().min(0).default(0),
  desiredMarginPct: z.coerce.number().min(1).default(40),
  productionTimeMin: z.coerce.number().min(0).default(0),
  notes: z.string().default(""),
  currency: z.string().default("USD"),
});

type FormValues = z.infer<typeof schema>;

const TYPE_ICONS: Record<string, LucideIcon> = {
  candles: Flame, resin: Droplets, soap: Sparkles, concrete: Mountain, plaster: Layers3, multi: Package,
};
const TYPE_COLORS: Record<string, string> = {
  candles: "text-orange-500", resin: "text-sky-500", soap: "text-pink-500", concrete: "text-stone-500", plaster: "text-violet-500", multi: "text-emerald-500",
};
const CHART_COLORS = ["#92400e","#d97706","#65a30d","#0891b2","#7c3aed","#db2777"];

export default function MultiCalculatorPage() {
  const t = useTranslations("calculators.multi");
  const tCommon = useTranslations("calculators.common");
  const tDash = useTranslations("dashboard");
  const locale = useLocale() as Locale;
  const [results, setResults] = useState<MultiCalculationResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, control, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      productName: "",
      components: [{ id: uuidv4(), type: "candles", name: "", costPerUnit: 0, productionTimeMin: 30, wastePct: 5, notes: "" }],
      units: 1, batchSize: 1, wastePct: 3, desiredMarginPct: 40, currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "components" });

  // Prefill first component's material from the wizard (?type=<material>).
  // The delay lets the Radix Select mount before we drive its value
  // programmatically — setting it synchronously on mount gets silently
  // overwritten a tick later.
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (!type || !["candles", "resin", "soap", "concrete", "plaster"].includes(type)) return;
    const timer = setTimeout(() => {
      setValue("components.0.type", type as FormValues["components"][number]["type"]);
    }, 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    getPreferredCurrency().then((c) => c && setValue("currency", c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = useCallback((data: FormValues) => {
    const calc = calculateMulti(data as unknown as MultiInputs);
    setResults(calc);
    setSaved(false);
  }, []);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const { ok } = await saveFormula({
      category: "multi",
      productName: watch("productName"),
      units: watch("units"),
      batchSize: watch("batchSize"),
      inputData: watch(),
      results,
      locale,
    });
    if (ok) setSaved(true);
    setSaving(false);
  }

  const currency = watch("currency");

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Package className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
          <Badge variant="primary">{locale === "es" ? "Diferencial" : "Key feature"}</Badge>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
        <p className="text-xs text-stone-400 mt-1">{t("description")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-5">
                <Input label={tCommon("productName")} placeholder={locale === "es" ? "Ej: Set regalo vela + concreto" : "Ex: Gift set candle + concrete"} {...register("productName")} />
              </CardContent>
            </Card>

            {/* What is a component */}
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-emerald-800 mb-1">{t("whatIsComponent.title")}</p>
                  <p className="text-xs text-emerald-800/80 leading-relaxed">{t("whatIsComponent.description")}</p>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">{t("examples.title")}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {(t.raw("examples.items") as string[]).map((ex, i) => (
                  <span key={i} className="inline-flex rounded-full bg-white border border-emerald-200 px-3 py-1 text-xs text-emerald-800">{ex}</span>
                ))}
              </div>
            </div>

            {/* Components */}
            <div className="space-y-3">
              {fields.map((field, index) => {
                const compType = watch(`components.${index}.type`);
                const Icon = TYPE_ICONS[compType] ?? Package;
                const iconClass = TYPE_COLORS[compType] ?? "text-stone-500";

                return (
                  <Card key={field.id} className="border-l-4 border-l-amber-300">
                    <CardHeader className="pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${iconClass}`} />
                          <CardTitle className="text-sm">{t("component")} {index + 1}</CardTitle>
                          <TooltipHelp text={t("whatIsComponent.description")} />
                        </div>
                        {fields.length > 1 && (
                          <button type="button" onClick={() => remove(index)} className="text-stone-400 hover:text-red-500 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Controller control={control} name={`components.${index}.type`} render={({ field: f }) => (
                          <Select onValueChange={f.onChange} value={f.value}>
                            <SelectTrigger label={t("componentType")}><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {(["candles","resin","soap","concrete","plaster"] as const).map(k => {
                                const CIcon = TYPE_ICONS[k];
                                return <SelectItem key={k} value={k}><span className="flex items-center gap-2"><CIcon className="h-3 w-3" />{tDash(`quickAccess.${k}` as any)}</span></SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        )} />
                        <Input label={t("componentName")} placeholder={locale === "es" ? "Nombre" : "Name"} {...register(`components.${index}.name`)} />
                        <Input label={t("componentCost")} type="number" min="0" step="0.01" {...register(`components.${index}.costPerUnit`)} prefix="$" hint={t("componentCostHint")} />
                        <Input label={t("componentTime")} type="number" min="0" {...register(`components.${index}.productionTimeMin`)} suffix="min" />
                        <Input label={t("componentWaste")} type="number" min="0" max="50" {...register(`components.${index}.wastePct`)} suffix="%" />
                      </div>
                      {COMPONENT_TIPS[compType] && (
                        <p className="mt-3 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2 leading-relaxed">
                          💡 {locale === "es" ? COMPONENT_TIPS[compType].hint_es : COMPONENT_TIPS[compType].hint_en}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => append({ id: uuidv4(), type: "candles", name: "", costPerUnit: 0, productionTimeMin: 30, wastePct: 5, notes: "" })}
            >
              <Plus className="h-4 w-4" />
              {t("addComponent")}
            </Button>

            {/* Global costs */}
            <Card>
              <CardHeader><CardTitle className="text-base">{locale === "es" ? "Costos generales del set" : "Set general costs"}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Controller control={control} name="currency" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger label={tCommon("currency")}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c.code} value={c.code}>{c.flag} {c.code} — {locale === "es" ? c.label_es : c.label_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  <Input label={tCommon("units")} type="number" min="1" {...register("units")} />
                  <Input label={tCommon("laborCost")} type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" />
                  <Input label={tCommon("laborHours")} type="number" min="0" step="0.5" {...register("laborHours")} />
                  <Input label={tCommon("packagingCost")} type="number" min="0" step="0.01" {...register("packagingCost")} prefix="$" />
                  <Input label={tCommon("platformFeePct")} type="number" min="0" max="100" {...register("platformFeePct")} suffix="%" />
                  <Input label={tCommon("desiredMarginPct")} type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <Package className="h-4 w-4" />{tCommon("calculate")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); }}>
                <RefreshCw className="h-4 w-4" />{tCommon("reset")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <TipsRotator locale={locale} category="multi" resultsKey={results} />
            {results ? (
              <>
                {/* Before-you-start checklist, one reminder per unique material in this set */}
                {(() => {
                  const uniqueTypes: string[] = Array.from(new Set(results.components.map((c: any) => c.type as string)));
                  const steps: StepGuideStep[] = uniqueTypes
                    .filter((type) => COMPONENT_TIPS[type])
                    .map((type) => ({
                      icon: TYPE_ICONS[type] ?? Package,
                      title: locale === "es" ? COMPONENT_TIPS[type].title_es : COMPONENT_TIPS[type].title_en,
                      description: locale === "es" ? COMPONENT_TIPS[type].hint_es : COMPONENT_TIPS[type].hint_en,
                    }));
                  return steps.length > 0 ? (
                    <StepGuide
                      title={locale === "es" ? "Antes de empezar" : "Before you start"}
                      steps={steps}
                    />
                  ) : null;
                })()}

                {/* Component breakdown */}
                <Card>
                  <CardHeader><CardTitle className="text-sm">{t("analysis.costDistribution")}</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={results.components} cx="50%" cy="50%" outerRadius={60} dataKey="adjustedCost">
                          {results.components.map((_c: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => formatCurrency(Number(v), currency, locale)} contentStyle={{ borderRadius: 8, fontSize: 11 }} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} formatter={(v) => results.components[Number(v)]?.name ?? v} />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="mt-3 space-y-2">
                      {results.components.map((comp: any, i: number) => (
                        <div key={comp.id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-stone-600 truncate max-w-[120px]">{comp.name || `Comp. ${i+1}`}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(comp.adjustedCost, currency, locale)}</span>
                            <Badge variant="default" className="text-[10px]">{comp.costShare.toFixed(1)}%</Badge>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1 pt-3 border-t border-stone-100">
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>{t("analysis.mostExpensive")}</span>
                        <span className="font-medium text-stone-700 truncate">{results.mostExpensiveComponent}</span>
                      </div>
                      <div className="flex justify-between text-xs text-stone-500">
                        <span>{t("analysis.mostTimeConsuming")}</span>
                        <span className="font-medium text-stone-700 truncate">{results.mostTimeConsumingComponent}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ResultPanel results={results} locale={locale} currency={currency} hideCostDistribution />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />{saved ? tCommon("saved") : tCommon("save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => exportCalculationPDF({ results, productName: watch("productName") || "Multi", category: "multi", locale, currency })}>
                    <FileDown className="h-4 w-4" />{tCommon("export")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white py-14 text-center">
                <Package className="mx-auto h-8 w-8 text-stone-200 mb-3" />
                <p className="text-sm text-stone-400">{tCommon("noResults")}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
