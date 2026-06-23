"use client";
import { useState, useCallback } from "react";
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
import { calculateMulti } from "@/lib/calculations/multi";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { MultiInputs, Locale } from "@/types";
import { Package, Plus, Trash2, Save, FileDown, RefreshCw, Flame, Droplets, Sparkles, Mountain, Layers3 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils/format";
import { v4 as uuidv4 } from "uuid";

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

const TYPE_ICONS: Record<string, React.ElementType> = {
  candles: Flame, resin: Droplets, soap: Sparkles, concrete: Mountain, plaster: Layers3, multi: Package,
};
const TYPE_COLORS: Record<string, string> = {
  candles: "text-orange-500", resin: "text-sky-500", soap: "text-pink-500", concrete: "text-stone-500", plaster: "text-violet-500", multi: "text-emerald-500",
};
const CHART_COLORS = ["#92400e","#d97706","#65a30d","#0891b2","#7c3aed","#db2777"];

export default function MultiCalculatorPage() {
  const t = useTranslations("calculators.multi");
  const tCommon = useTranslations("calculators.common");
  const locale = useLocale() as Locale;
  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, control, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      productName: "",
      components: [{ id: uuidv4(), type: "candles", name: "", costPerUnit: 0, productionTimeMin: 30, wastePct: 5, notes: "" }],
      units: 1, batchSize: 1, wastePct: 3, desiredMarginPct: 40, currency: "USD",
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "components" });

  const onSubmit = useCallback((data: FormValues) => {
    const calc = calculateMulti(data as unknown as MultiInputs);
    setResults(calc);
    setSaved(false);
  }, []);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("calculations").insert({ user_id: user.id, product_name: watch("productName") || null, category: "multi", units: watch("units"), batch_size: watch("batchSize"), input_data: watch(), results, locale });
      setSaved(true);
    }
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
                                return <SelectItem key={k} value={k}><span className="flex items-center gap-2"><CIcon className="h-3 w-3" />{k}</span></SelectItem>;
                              })}
                            </SelectContent>
                          </Select>
                        )} />
                        <Input label={t("componentName")} placeholder={locale === "es" ? "Nombre" : "Name"} {...register(`components.${index}.name`)} />
                        <Input label={t("componentCost")} type="number" min="0" step="0.01" {...register(`components.${index}.costPerUnit`)} prefix="$" />
                        <Input label={t("componentTime")} type="number" min="0" {...register(`components.${index}.productionTimeMin`)} suffix="min" />
                        <Input label={t("componentWaste")} type="number" min="0" max="50" {...register(`components.${index}.wastePct`)} suffix="%" />
                      </div>
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

            {/* Examples */}
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs font-semibold text-amber-800 mb-2">{t("examples.title")}</p>
              <div className="flex flex-wrap gap-2">
                {(t.raw("examples.items") as string[]).map((ex, i) => (
                  <span key={i} className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs text-amber-800">{ex}</span>
                ))}
              </div>
            </div>

            {/* Global costs */}
            <Card>
              <CardHeader><CardTitle className="text-base">{locale === "es" ? "Costos generales del set" : "Set general costs"}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-3">
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
            {results ? (
              <>
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

                <ResultPanel results={results} locale={locale} currency={currency} />

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
