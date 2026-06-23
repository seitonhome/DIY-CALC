"use client";
import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResultPanel } from "@/components/ui/result-panel";
import { TooltipHelp } from "@/components/ui/tooltip";
import { calculateSoap, SOAP_TYPES, OIL_PROPERTIES } from "@/lib/calculations/soap";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { SoapInputs, CalculationResults, Locale } from "@/types";
import { Sparkles, AlertTriangle, Save, FileDown, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  productName: z.string().default(""),
  soapType: z.string().default("meltPour"),
  baseCostPerKg: z.coerce.number().min(0).default(0),
  baseAmountG: z.coerce.number().min(0).default(500),
  olivePct: z.coerce.number().min(0).max(100).default(40),
  coconutPct: z.coerce.number().min(0).max(100).default(30),
  palmPct: z.coerce.number().min(0).max(100).default(15),
  sheaPct: z.coerce.number().min(0).max(100).default(5),
  cocoaPct: z.coerce.number().min(0).max(100).default(5),
  castorPct: z.coerce.number().min(0).max(30).default(5),
  lardPct: z.coerce.number().min(0).max(100).default(0),
  sunflowerPct: z.coerce.number().min(0).max(100).default(0),
  avocadoPct: z.coerce.number().min(0).max(100).default(0),
  riceBranPct: z.coerce.number().min(0).max(100).default(0),
  sweetAlmondPct: z.coerce.number().min(0).max(100).default(0),
  tallowPct: z.coerce.number().min(0).max(100).default(0),
  otherOilsPct: z.coerce.number().min(0).max(100).default(0),
  oilsCostPerKg: z.coerce.number().min(0).default(0),
  superfattPct: z.coerce.number().min(0).max(15).default(5),
  lyeConcentrationPct: z.coerce.number().min(20).max(50).default(38),
  fragrancePct: z.coerce.number().min(0).max(5).default(3),
  fragranceCostPerKg: z.coerce.number().min(0).default(0),
  essentialOilPct: z.coerce.number().min(0).max(5).default(0),
  essentialOilCostPerKg: z.coerce.number().min(0).default(0),
  colorantCost: z.coerce.number().min(0).default(0),
  exfoliantCost: z.coerce.number().min(0).default(0),
  additivesCost: z.coerce.number().min(0).default(0),
  curingTimeDays: z.coerce.number().min(0).default(28),
  targetWeightG: z.coerce.number().min(0).default(100),
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
  desiredMarginPct: z.coerce.number().min(1).default(35),
  productionTimeMin: z.coerce.number().min(0).default(45),
  notes: z.string().default(""),
  currency: z.string().default("USD"),
});

type FormValues = z.infer<typeof schema>;

export default function SoapCalculatorPage() {
  const t = useTranslations("calculators.soap");
  const tCommon = useTranslations("calculators.common");
  const locale = useLocale() as Locale;
  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, control, watch, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { soapType: "meltPour", olivePct: 40, coconutPct: 30, palmPct: 15, sheaPct: 5, cocoaPct: 5, castorPct: 5, lardPct: 0, tallowPct: 0, sunflowerPct: 0, avocadoPct: 0, riceBranPct: 0, sweetAlmondPct: 0, superfattPct: 5, lyeConcentrationPct: 38, fragrancePct: 3, curingTimeDays: 28, targetWeightG: 100, units: 1, batchSize: 1, wastePct: 3, desiredMarginPct: 35, currency: "USD" },
  });

  const soapType = watch("soapType");
  const soapData = SOAP_TYPES[soapType] ?? SOAP_TYPES.meltPour;
  const isSaponified = soapData.isSaponified;

  const onSubmit = useCallback((data: FormValues) => {
    const calc = calculateSoap(data as unknown as SoapInputs);
    setResults(calc);
    setSaved(false);
  }, []);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("calculations").insert({ user_id: user.id, product_name: watch("productName") || null, category: "soap", units: watch("units"), batch_size: watch("batchSize"), input_data: watch(), results, locale });
      setSaved(true);
    }
    setSaving(false);
  }

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="pt-5 space-y-4">
                <Input label={tCommon("productName")} placeholder="Ej: Jabón lavanda" {...register("productName")} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Controller control={control} name="soapType" render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger label={locale === "es" ? "Tipo de jabón / método" : "Soap type / method"}><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(SOAP_TYPES).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{locale === "es" ? v.label_es : v.label_en}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  <Input label={locale === "es" ? "Peso por unidad (g)" : "Weight per unit (g)"} type="number" min="0" {...register("targetWeightG")} suffix="g" />
                </div>

                {/* Soap type info card */}
                <div style={{ borderRadius: 12, border: "2px solid #C9A34744", background: "linear-gradient(135deg, #F5F0EA 0%, #FFF9EE 100%)", padding: "14px 18px", display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>🧼</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#A8862A", margin: "0 0 4px" }}>
                      {locale === "es" ? soapData.label_es : soapData.label_en}
                    </p>
                    <p style={{ fontSize: 12, color: "#6B6460", margin: "0 0 6px", lineHeight: 1.5 }}>
                      {locale === "es" ? soapData.desc_es : soapData.desc_en}
                    </p>
                    {soapData.curingDays > 0 && (
                      <p style={{ fontSize: 11, color: "#9E998F", margin: 0 }}>
                        ⏱ {locale === "es" ? `Curado: ${soapData.curingDays} días` : `Curing: ${soapData.curingDays} days`}
                        {" · "}
                        {locale === "es" ? `Fragancia máx: ${soapData.maxFragrancePct}%` : `Max fragrance: ${soapData.maxFragrancePct}%`}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {isSaponified ? (
              <Card>
                <CardHeader><CardTitle className="text-base">{t("saponification.title")}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {/* Safety warning */}
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{t("saponification.safetyWarning")}</span>
                  </div>

                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{t("saponification.oils")}</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                      { field: "olivePct",      label_es: "Aceite de oliva",       label_en: "Olive oil",        hint_es: "Suavidad — 30–70%", hint_en: "Softness — 30–70%" },
                      { field: "coconutPct",    label_es: "Aceite de coco",        label_en: "Coconut oil",      hint_es: "Espuma — 20–35%",   hint_en: "Lather — 20–35%" },
                      { field: "castorPct",     label_es: "Aceite de ricino ★",    label_en: "Castor oil ★",     hint_es: "Espuma cremosa — 5–15%", hint_en: "Creamy lather — 5–15%" },
                      { field: "palmPct",       label_es: "Aceite de palma",       label_en: "Palm oil",         hint_es: "Dureza — 15–30%",   hint_en: "Hardness — 15–30%" },
                      { field: "sheaPct",       label_es: "Manteca de karité",     label_en: "Shea butter",      hint_es: "Acondicionador — 5–15%", hint_en: "Conditioning — 5–15%" },
                      { field: "cocoaPct",      label_es: "Manteca de cacao",      label_en: "Cocoa butter",     hint_es: "Dureza — 5–15%",    hint_en: "Hardness — 5–15%" },
                      { field: "lardPct",       label_es: "Manteca de cerdo",      label_en: "Lard",             hint_es: "Jabón firme — 20–50%", hint_en: "Firm bar — 20–50%" },
                      { field: "tallowPct",     label_es: "Sebo de vaca / Tallow", label_en: "Tallow (beef)",    hint_es: "Dureza extrema — 20–50%", hint_en: "Extreme hardness — 20–50%" },
                      { field: "sunflowerPct",  label_es: "Aceite de girasol",     label_en: "Sunflower oil",    hint_es: "Suavidad — 10–20%", hint_en: "Softness — 10–20%" },
                      { field: "avocadoPct",    label_es: "Aceite de aguacate",    label_en: "Avocado oil",      hint_es: "Nutrición — 5–20%", hint_en: "Nourishing — 5–20%" },
                      { field: "riceBranPct",   label_es: "Salvado de arroz",      label_en: "Rice bran oil",    hint_es: "Vitamina E — 10–25%", hint_en: "Vitamin E — 10–25%" },
                      { field: "sweetAlmondPct",label_es: "Almendra dulce",        label_en: "Sweet almond",     hint_es: "Delicado — 10–20%", hint_en: "Delicate — 10–20%" },
                      { field: "otherOilsPct",  label_es: "Otros aceites",         label_en: "Other oils",       hint_es: "Resto hasta 100%",  hint_en: "Rest up to 100%" },
                    ].map(({ field, label_es, label_en, hint_es, hint_en }) => (
                      <Input
                        key={field}
                        label={locale === "es" ? label_es : label_en}
                        type="number" min="0" max="100"
                        {...register(field as any)}
                        suffix="%"
                        hint={locale === "es" ? hint_es : hint_en}
                      />
                    ))}
                  </div>
                  {/* Oil total indicator */}
                  {(() => {
                    const total = (watch("olivePct")||0)+(watch("coconutPct")||0)+(watch("palmPct")||0)+(watch("sheaPct")||0)+(watch("cocoaPct")||0)+(watch("castorPct")||0)+(watch("lardPct")||0)+(watch("tallowPct")||0)+(watch("sunflowerPct")||0)+(watch("avocadoPct")||0)+(watch("riceBranPct")||0)+(watch("sweetAlmondPct")||0)+(watch("otherOilsPct")||0);
                    const ok = total >= 99 && total <= 101;
                    return (
                      <div style={{ borderRadius: 8, padding: "8px 12px", background: ok ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${ok ? "#A7F3D0" : "#FCA5A5"}`, fontSize: 12, color: ok ? "#065F46" : "#991B1B", fontWeight: 600 }}>
                        {locale === "es" ? `Total aceites: ${total}%` : `Total oils: ${total}%`}
                        {" — "}{ok ? (locale === "es" ? "✓ correcto" : "✓ correct") : (locale === "es" ? "⚠ debe sumar 100%" : "⚠ must sum to 100%")}
                      </div>
                    );
                  })()}
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Input label={locale === "es" ? "Costo aceites ($/kg)" : "Oil cost ($/kg)"} type="number" min="0" step="0.01" {...register("oilsCostPerKg")} prefix="$" />
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5"><label className="text-sm font-medium text-stone-700">{t("saponification.superfattPct")}</label><TooltipHelp text={t("saponification.tooltipSuperfat")} /></div>
                      <Input type="number" min="0" max="15" {...register("superfattPct")} suffix="%" />
                    </div>
                    <Input label={t("saponification.lyeConcentration")} type="number" min="20" max="50" {...register("lyeConcentrationPct")} suffix="%" />
                  </div>

                  {results?.isSaponified && (
                    <div className="rounded-lg bg-sky-50 border border-sky-100 p-4 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-stone-400">{t("saponification.calculatedLye")}</p>
                        <p className="font-bold text-stone-900">{results.lyeAmountG.toFixed(1)} g {soapType === "liquid" ? "KOH" : "NaOH"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-stone-400">{t("saponification.waterAmount")}</p>
                        <p className="font-bold text-stone-900">{results.waterAmountG.toFixed(1)} g</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle className="text-base">{t("base.title")}</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label={t("base.costPerKg")} type="number" min="0" step="0.01" {...register("baseCostPerKg")} prefix="$" />
                    <Input label={t("base.amount")} type="number" min="0" {...register("baseAmountG")} suffix="g" />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader><CardTitle className="text-base">{t("additives.title")}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={t("additives.fragrance")} type="number" min="0" max="5" step="0.1" {...register("fragrancePct")} suffix="%" />
                  <Input label={locale === "es" ? "Costo fragancia ($/kg)" : "Fragrance cost ($/kg)"} type="number" min="0" step="0.01" {...register("fragranceCostPerKg")} prefix="$" />
                  <Input label={t("additives.colorants")} type="number" min="0" step="0.01" {...register("colorantCost")} prefix="$" />
                  <Input label={t("additives.exfoliants")} type="number" min="0" step="0.01" {...register("exfoliantCost")} prefix="$" />
                  <Input label={locale === "es" ? "Tiempo de curado" : "Curing time"} type="number" min="0" {...register("curingTimeDays")} suffix={locale === "es" ? "días" : "days"} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label={tCommon("units")} type="number" min="1" {...register("units")} />
                  <Input label={tCommon("laborCost")} type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" />
                  <Input label={tCommon("desiredMarginPct")} type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                  <Input label={tCommon("packagingCost")} type="number" min="0" step="0.01" {...register("packagingCost")} prefix="$" />
                  <Input label={tCommon("platformFeePct")} type="number" min="0" max="100" {...register("platformFeePct")} suffix="%" />
                  <Input label={tCommon("wastePct")} type="number" min="0" max="50" {...register("wastePct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <Sparkles className="h-4 w-4" />{tCommon("calculate")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); }}>
                <RefreshCw className="h-4 w-4" />{tCommon("reset")}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {results ? (
              <>
                <ResultPanel results={results} locale={locale} currency={watch("currency")} />
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />{saved ? tCommon("saved") : tCommon("save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => exportCalculationPDF({ results, productName: watch("productName") || "Soap", category: "soap", locale, currency: watch("currency") })}>
                    <FileDown className="h-4 w-4" />{tCommon("export")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white py-14 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-stone-200 mb-3" />
                <p className="text-sm text-stone-400">{tCommon("noResults")}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
