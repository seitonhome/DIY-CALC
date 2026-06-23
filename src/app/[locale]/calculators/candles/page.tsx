"use client";
import { useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { TooltipHelp } from "@/components/ui/tooltip";
import { ResultPanel } from "@/components/ui/result-panel";
import { RecipeCard } from "@/components/ui/recipe-card";
import { Badge } from "@/components/ui/badge";
import { calculateCandles, WAX_TYPES } from "@/lib/calculations/candles";
import { calculateVolume } from "@/lib/calculations/geometry";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { CandleInputs, CalculationResults, Locale, MoldShape } from "@/types";
import { AlertTriangle, Flame, Save, FileDown, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  productName: z.string().min(1),
  candleType: z.string().min(1),
  moldShape: z.string().min(1),
  // Dimensions
  diameter: z.coerce.number().min(0).default(0),
  height: z.coerce.number().min(0).default(0),
  width: z.coerce.number().min(0).default(0),
  length: z.coerce.number().min(0).default(0),
  volumeMl: z.coerce.number().min(0).default(0),
  fillPct: z.coerce.number().min(1).max(100).default(100),
  targetWeightG: z.coerce.number().min(0).default(0),
  densityGml: z.coerce.number().min(0).default(0),
  // Wax
  waxType: z.string().min(1).default("soy"),
  waxCostPerKg: z.coerce.number().min(0).default(0),
  waxMixPct: z.coerce.number().min(0).max(100).default(100),
  wax2Type: z.string().optional(),
  wax2CostPerKg: z.coerce.number().min(0).default(0),
  wax2MixPct: z.coerce.number().min(0).max(100).default(0),
  // Fragrance
  fragranceLoadPct: z.coerce.number().min(0).max(20).default(8),
  fragranceCostPerKg: z.coerce.number().min(0).default(0),
  // Colorant
  colorantAmount: z.coerce.number().min(0).default(0),
  colorantCostPerUnit: z.coerce.number().min(0).default(0),
  // Additives
  stearicAcidAmount: z.coerce.number().min(0).default(0),
  stearicAcidPct: z.coerce.number().min(0).max(30).default(0),
  stearicAcidCost: z.coerce.number().min(0).default(0),
  vybarType: z.string().default("103"),
  vybarAmount: z.coerce.number().min(0).default(0),
  vybarCost: z.coerce.number().min(0).default(0),
  uvInhibitorAmount: z.coerce.number().min(0).default(0),
  uvInhibitorCost: z.coerce.number().min(0).default(0),
  // Wick
  wickType: z.string().default("cotton"),
  wickCostPerUnit: z.coerce.number().min(0).default(0),
  // Production
  units: z.coerce.number().min(1).default(1),
  batchSize: z.coerce.number().min(1).default(1),
  wastePct: z.coerce.number().min(0).max(50).default(5),
  laborCostPerHour: z.coerce.number().min(0).default(0),
  laborHours: z.coerce.number().min(0).default(0),
  energyCost: z.coerce.number().min(0).default(0),
  packagingCost: z.coerce.number().min(0).default(0),
  labelCost: z.coerce.number().min(0).default(0),
  boxCost: z.coerce.number().min(0).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
  taxPct: z.coerce.number().min(0).max(100).default(0),
  platformFeePct: z.coerce.number().min(0).max(100).default(0),
  affiliateFeePct: z.coerce.number().min(0).max(100).default(0),
  desiredMarginPct: z.coerce.number().min(1).max(100).default(35),
  curingTimeHours: z.coerce.number().min(0).default(24),
  productionTimeMin: z.coerce.number().min(0).default(30),
  notes: z.string().default(""),
  currency: z.string().default("USD"),
});

type FormValues = z.infer<typeof schema>;

export default function CandlesCalculatorPage() {
  const t = useTranslations("calculators.candles");
  const tCommon = useTranslations("calculators.common");
  const tRes = useTranslations("calculators.results");
  const tGeo = useTranslations("geometry");
  const locale = useLocale() as Locale;

  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, control, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      candleType: "glass",
      moldShape: "cylinder",
      waxType: "soy",
      wickType: "cotton",
      vybarType: "103",
      fillPct: 100,
      fragranceLoadPct: 8,
      waxMixPct: 100,
      units: 1,
      batchSize: 1,
      wastePct: 5,
      desiredMarginPct: 35,
      curingTimeHours: 24,
      productionTimeMin: 30,
      currency: "USD",
    },
  });

  const moldShape = watch("moldShape") as MoldShape;
  const waxType = watch("waxType");
  const fragranceLoadPct = watch("fragranceLoadPct");
  const stearicAcidPct = watch("stearicAcidPct");
  const stearicAcidAmount = watch("stearicAcidAmount");
  const vybarAmount = watch("vybarAmount");
  const vybarType = watch("vybarType");
  const isMoldWax = waxType === "moldWax";

  const onSubmit = useCallback((data: FormValues) => {
    const dims = {
      diameter: data.diameter,
      height: data.height,
      width: data.width,
      length: data.length,
    };

    const inputs: CandleInputs = {
      ...data,
      dimensions: dims,
    } as unknown as CandleInputs;

    const calc = calculateCandles(inputs);
    setResults(calc);
    setSaved(false);
  }, []);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const values = watch();
      await supabase.from("calculations").insert({
        user_id: user.id,
        product_name: values.productName || null,
        category: "candles",
        units: values.units,
        batch_size: values.batchSize,
        input_data: values,
        results,
        locale,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleExport() {
    if (!results) return;
    const values = watch();
    await exportCalculationPDF({
      results,
      productName: values.productName || "Vela / Candle",
      category: "candles",
      locale,
      currency: values.currency,
    });
  }

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Flame className="h-5 w-5 text-orange-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT: inputs */}
          <div className="lg:col-span-2 space-y-4">
            {/* Product name */}
            <Card>
              <CardContent className="pt-5">
                <Input
                  label={tCommon("productName")}
                  placeholder="Ej: Vela Lavanda 200g"
                  {...register("productName")}
                  error={errors.productName?.message}
                />
              </CardContent>
            </Card>

            <Tabs defaultValue="mold">
              <TabsList className="flex-wrap h-auto">
                <TabsTrigger value="mold">{locale === "es" ? "Molde" : "Mold"}</TabsTrigger>
                <TabsTrigger value="wax">{locale === "es" ? "Cera" : "Wax"}</TabsTrigger>
                <TabsTrigger value="fragrance">{locale === "es" ? "Fragancia" : "Fragrance"}</TabsTrigger>
                <TabsTrigger value="additives">{locale === "es" ? "Aditivos" : "Additives"}</TabsTrigger>
                <TabsTrigger value="production">{locale === "es" ? "Producción" : "Production"}</TabsTrigger>
                <TabsTrigger value="costs">{locale === "es" ? "Costos" : "Costs"}</TabsTrigger>
              </TabsList>

              {/* Mold tab */}
              <TabsContent value="mold">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">{locale === "es" ? "Tipo y molde" : "Type & mold"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Controller
                        control={control}
                        name="candleType"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger label={t("candleType")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries({
                                glass: t("types.glass"), molded: t("types.molded"), decorative: t("types.decorative"),
                                pillar: t("types.pillar"), waxMelt: t("types.waxMelt"), tealight: t("types.tealight"),
                                votive: t("types.votive"), sculptural: t("types.sculptural"), multilayer: t("types.multilayer"),
                                embeds: t("types.embeds"), aromatic: t("types.aromatic"), unscented: t("types.unscented"),
                              }).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />

                      <Controller
                        control={control}
                        name="moldShape"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger label={t("moldShape")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries({
                                cylinder: t("shapes.cylinder"), cube: t("shapes.cube"), rectangular: t("shapes.rectangular"),
                                sphere: t("shapes.sphere"), hemisphere: t("shapes.hemisphere"), pyramid: t("shapes.pyramid"),
                                cone: t("shapes.cone"), hexagonal: t("shapes.hexagonal"), irregular: t("shapes.irregular"),
                                custom: t("shapes.custom"),
                              }).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    {/* Dimensions based on shape */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      {(moldShape === "cylinder" || moldShape === "cone" || moldShape === "sphere" || moldShape === "hemisphere") && (
                        <Input label={t("dimensions.diameter")} type="number" step="0.1" min="0" {...register("diameter")} suffix="cm" />
                      )}
                      {(moldShape === "cylinder" || moldShape === "cone" || moldShape === "pyramid" || moldShape === "hexagonal" || moldShape === "rectangular") && (
                        <Input label={t("dimensions.height")} type="number" step="0.1" min="0" {...register("height")} suffix="cm" />
                      )}
                      {(moldShape === "rectangular" || moldShape === "cube") && (
                        <>
                          <Input label={t("dimensions.width")} type="number" step="0.1" min="0" {...register("width")} suffix="cm" />
                          <Input label={t("dimensions.length")} type="number" step="0.1" min="0" {...register("length")} suffix="cm" />
                        </>
                      )}
                      {moldShape === "irregular" && (
                        <div className="sm:col-span-3">
                          <div className="rounded-lg bg-sky-50 border border-sky-100 p-4 text-xs text-sky-800 space-y-1 mb-3">
                            <p className="font-semibold">{tGeo("irregularMethod.title")}</p>
                            <p>{tGeo("irregularMethod.step1")}</p>
                            <p>{tGeo("irregularMethod.step2")}</p>
                            <p>{tGeo("irregularMethod.step3")}</p>
                          </div>
                          <Input label={tGeo("irregularMethod.waterAmount")} type="number" min="0" {...register("volumeMl")} suffix="ml" />
                        </div>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input label={t("dimensions.capacity")} type="number" min="0" {...register("volumeMl")} suffix="ml" hint={locale === "es" ? "¿No tienes medidas? Llena el molde con agua y mide los ml." : "No dimensions? Fill the mold with water and measure the ml."} />
                      <Input label={t("dimensions.fillPct")} type="number" min="1" max="100" {...register("fillPct")} suffix="%" hint={locale === "es" ? "100% = molde lleno" : "100% = full mold"} />
                      <Input label={t("dimensions.targetWeight")} type="number" min="0" {...register("targetWeightG")} suffix="g" hint={locale === "es" ? "Si sabes el peso final deseado" : "If you know the desired final weight"} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wax tab */}
              <TabsContent value="wax">
                <Card>
                  <CardHeader><CardTitle className="text-base">{t("wax.title")}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <Controller
                        control={control}
                        name="waxType"
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger label={t("wax.type")}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(WAX_TYPES).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{locale === "es" ? v.label_es : v.label_en}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <Input label={t("wax.costPerKg")} type="number" min="0" step="0.01" {...register("waxCostPerKg")} prefix="$" />
                      <Input label={t("wax.mixPct")} type="number" min="0" max="100" {...register("waxMixPct")} suffix="%" />
                    </div>

                    {/* Wax technical data card */}
                    {(() => {
                      const wd = WAX_TYPES[waxType] ?? WAX_TYPES.soy;
                      const isEs = locale === "es";
                      const tags = [
                        isEs ? `Punto fusión: ${wd.meltPointC} °C` : `Melt point: ${wd.meltPointC} °C`,
                        isEs ? `Colar a: ${wd.pourTempC} °C` : `Pour at: ${wd.pourTempC} °C`,
                        isEs ? `Agregar FO a: ${wd.fragranceAddTempC} °C` : `Add FO at: ${wd.fragranceAddTempC} °C`,
                        isEs ? `Fragancia máx: ${wd.maxFragrancePct}%` : `Max fragrance: ${wd.maxFragrancePct}%`,
                        isEs ? `Densidad: ${wd.density} g/ml` : `Density: ${wd.density} g/ml`,
                        wd.needsSecondPour ? (isEs ? "⚠ Necesita 2ª colada" : "⚠ Needs 2nd pour") : (isEs ? "✓ Sin 2ª colada" : "✓ No 2nd pour"),
                        isEs ? (wd.containerType === "container" ? "Para contenedor" : wd.containerType === "pillar" ? "Para pilar/molde" : "Contenedor o pilar") : (wd.containerType === "container" ? "Container" : wd.containerType === "pillar" ? "Pillar/mold" : "Container or pillar"),
                      ];
                      return (
                        <div style={{ background: "#FEF9EC", border: "1.5px solid #C9A34766", borderRadius: 12, padding: "14px 16px" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: "#A8862A", margin: "0 0 5px" }}>🕯️ {isEs ? wd.label_es : wd.label_en}</p>
                          <p style={{ fontSize: 12, color: "#6B6460", margin: "0 0 10px", lineHeight: 1.5 }}>{isEs ? wd.desc_es : wd.desc_en}</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                            {tags.map((tag, i) => (
                              <span key={i} style={{ fontSize: 10, fontWeight: 600, background: "#F5F0EA", color: "#A8862A", borderRadius: 6, padding: "2px 8px", border: "1px solid #EDE8E1" }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Second wax blend */}
                    <div className="rounded-lg border border-dashed border-stone-200 p-4">
                      <p className="text-xs font-medium text-stone-500 mb-3">{locale === "es" ? "Cera secundaria (opcional)" : "Secondary wax (optional)"}</p>
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Controller
                          control={control}
                          name="wax2Type"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value ?? ""}>
                              <SelectTrigger label={t("wax.type")}>
                                <SelectValue placeholder={locale === "es" ? "Ninguna" : "None"} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">—</SelectItem>
                                {Object.entries(WAX_TYPES).filter(([k]) => k !== "custom").map(([k, v]) => (
                                  <SelectItem key={k} value={k}>{locale === "es" ? v.label_es : v.label_en}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Input label={t("wax.costPerKg")} type="number" min="0" step="0.01" {...register("wax2CostPerKg")} prefix="$" />
                        <Input label={t("wax.mixPct")} type="number" min="0" max="100" {...register("wax2MixPct")} suffix="%" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fragrance tab */}
              <TabsContent value="fragrance">
                <Card>
                  <CardHeader><CardTitle className="text-base">{t("fragrance.title")}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-medium text-stone-700">{t("fragrance.loadPct")}</label>
                          <TooltipHelp text={t("fragrance.tooltipLoad")} />
                        </div>
                        <Input type="number" min="0" max="20" step="0.5" {...register("fragranceLoadPct")} suffix="%" />
                      </div>
                      <Input label={t("fragrance.costPerKg")} type="number" min="0" step="0.01" {...register("fragranceCostPerKg")} prefix="$" />
                    </div>

                    {/* Fragrance warning */}
                    {results?.fragranceWarning && (
                      <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{t("warnings.highFragrance")}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Additives tab */}
              <TabsContent value="additives">
                <Card>
                  <CardHeader><CardTitle className="text-base">{t("additives.title")}</CardTitle></CardHeader>
                  <CardContent className="space-y-6">

                    {/* Colorant */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#C4BDB5" }}>{t("colorant.title")}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input label={t("colorant.amount")} type="number" min="0" step="0.1" {...register("colorantAmount")} suffix="g" hint={t("colorant.tooltipAmount")} />
                        <Input label={t("colorant.costPerUnit")} type="number" min="0" step="0.01" {...register("colorantCostPerUnit")} prefix="$" />
                      </div>
                    </div>

                    {/* Stearic acid / Estearina */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#C4BDB5" }}>{t("additives.stearicAcid")}</p>
                        {isMoldWax && (
                          <span style={{ fontSize: 10, fontWeight: 700, background: "#C9A347", color: "white", borderRadius: 5, padding: "1px 6px" }}>
                            {locale === "es" ? "ESENCIAL" : "ESSENTIAL"}
                          </span>
                        )}
                      </div>
                      <p className="text-xs mb-3" style={{ color: "#9E998F" }}>{t("additives.stearicHint")}</p>
                      <div className="grid gap-3 sm:grid-cols-3 mb-3">
                        <Input
                          label={t("additives.stearicPct")}
                          type="number" min="0" max="30" step="1"
                          {...register("stearicAcidPct")}
                          suffix="%"
                          hint={t("additives.stearicPctHint")}
                        />
                        <Input label={locale === "es" ? "O cantidad directa (g)" : "Or direct amount (g)"} type="number" min="0" step="0.1" {...register("stearicAcidAmount")} suffix="g" hint={locale === "es" ? "Sobrescribe el %" : "Overrides %"} />
                        <Input label={t("additives.costPerKg")} type="number" min="0" step="0.01" {...register("stearicAcidCost")} prefix="$" suffix="/kg" />
                      </div>

                      {/* Live % indicator for stearic */}
                      {results && (results as any).waxAmountG > 0 && ((stearicAcidPct || 0) > 0 || (stearicAcidAmount || 0) > 0) && (() => {
                        const pct = (results as any).stearicAcidPct as number;
                        const isNone = pct === 0 && isMoldWax;
                        const isLow = isMoldWax && pct > 0 && pct < 5;
                        const isHigh = pct > 20;
                        const isGood = !isNone && !isLow && !isHigh;
                        return (
                          <div className="flex items-start gap-2 rounded-lg p-3 text-sm" style={{
                            background: isHigh ? "#FEF2F2" : isLow || isNone ? "#FEFCE8" : "#F0FDF4",
                            border: `1px solid ${isHigh ? "#FCA5A5" : isLow || isNone ? "#FDE68A" : "#BBF7D0"}`,
                          }}>
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: isHigh ? "#DC2626" : isLow || isNone ? "#D97706" : "#16A34A" }} />
                            <div>
                              <p className="font-semibold" style={{ color: isHigh ? "#991B1B" : isLow || isNone ? "#92400E" : "#15803D" }}>
                                {pct.toFixed(1)}% {locale === "es" ? "del peso de cera" : "of wax weight"}
                                {isGood && (locale === "es" ? " ✓ rango ideal" : " ✓ ideal range")}
                              </p>
                              {isNone && <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>{t("additives.stearicWarnNone")}</p>}
                              {isLow && <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>{t("additives.stearicWarnLow")}</p>}
                              {isHigh && <p className="text-xs mt-0.5" style={{ color: "#991B1B" }}>{t("additives.stearicWarnHigh")}</p>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Vybar */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#C4BDB5" }}>{t("additives.vybar")}</p>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "#F5F0EA", color: "#A8862A" }}>
                          {locale === "es" ? "Para velas de molde" : "For molded candles"}
                        </span>
                      </div>

                      {/* Type selector with description */}
                      <div className="rounded-xl p-4 mb-3 space-y-3" style={{ background: "#F5F0EA", border: "1px solid #EDE8E1" }}>
                        <Controller
                          control={control}
                          name="vybarType"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger label={t("additives.vybarType")}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="103">{t("additives.vybarTypes.103")}</SelectItem>
                                <SelectItem value="260">{t("additives.vybarTypes.260")}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <p className="text-xs" style={{ color: "#9E998F" }}>
                          {vybarType === "103" ? t("additives.vybar103Desc") : t("additives.vybar260Desc")}
                        </p>
                        <p className="text-xs font-medium" style={{ color: "#A8862A" }}>{t("additives.vybarHint")}</p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 mb-3">
                        <Input label={tCommon("weightUnit")} type="number" min="0" step="0.1" {...register("vybarAmount")} suffix="g" />
                        <Input label={t("additives.costPerKg")} type="number" min="0" step="0.01" {...register("vybarCost")} prefix="$" suffix="/kg" />
                      </div>

                      {/* Live % indicator (shown after first calculation) */}
                      {results && (results as any).waxAmountG > 0 && (vybarAmount || 0) > 0 && (() => {
                        const pct = ((vybarAmount || 0) / (results as any).waxAmountG * 100);
                        const isHigh = pct > 1.5;
                        const isLow = pct < 0.5;
                        const isGood = !isHigh && !isLow;
                        return (
                          <div className={`flex items-start gap-2 rounded-lg p-3 text-sm`} style={{
                            background: isHigh ? "#FEF2F2" : isLow ? "#FEFCE8" : "#F0FDF4",
                            border: `1px solid ${isHigh ? "#FCA5A5" : isLow ? "#FDE68A" : "#BBF7D0"}`,
                          }}>
                            <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: isHigh ? "#DC2626" : isLow ? "#D97706" : "#16A34A" }} />
                            <div>
                              <p className="font-semibold" style={{ color: isHigh ? "#991B1B" : isLow ? "#92400E" : "#15803D" }}>
                                {pct.toFixed(2)}% {locale === "es" ? "del peso de cera" : "of wax weight"}
                                {isGood && (locale === "es" ? " ✓ rango ideal" : " ✓ ideal range")}
                              </p>
                              {isHigh && <p className="text-xs mt-0.5" style={{ color: "#991B1B" }}>{t("additives.vybarWarnHigh")}</p>}
                              {isLow && <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>{t("additives.vybarWarnLow")}</p>}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* UV Inhibitor */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#C4BDB5" }}>{t("additives.uvInhibitor")}</p>
                      <p className="text-xs mb-3" style={{ color: "#9E998F" }}>{t("additives.uvHint")}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input label={tCommon("weightUnit")} type="number" min="0" step="0.01" {...register("uvInhibitorAmount")} suffix="g" />
                        <Input label={t("additives.costPerKg")} type="number" min="0" step="0.01" {...register("uvInhibitorCost")} prefix="$" suffix="/kg" />
                      </div>
                    </div>

                    {/* Wick */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#C4BDB5" }}>{t("wick.title")}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Controller
                          control={control}
                          name="wickType"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger label={t("wick.type")}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cotton">{t("wick.types.cotton")}</SelectItem>
                                <SelectItem value="wood">{t("wick.types.wood")}</SelectItem>
                                <SelectItem value="double">{t("wick.types.double")}</SelectItem>
                                <SelectItem value="triple">{t("wick.types.triple")}</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        <Input label={t("wick.costPerUnit")} type="number" min="0" step="0.01" {...register("wickCostPerUnit")} prefix="$" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Production tab */}
              <TabsContent value="production">
                <Card>
                  <CardHeader><CardTitle className="text-base">{locale === "es" ? "Producción" : "Production"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input label={tCommon("units")} type="number" min="1" {...register("units")} />
                      <Input label={tCommon("batchSize")} type="number" min="1" {...register("batchSize")} />
                      <Input label={t("productionTime")} type="number" min="0" {...register("productionTimeMin")} suffix="min" />
                      <Input label={t("curingTime")} type="number" min="0" {...register("curingTimeHours")} suffix="h" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-medium text-stone-700">{tCommon("wastePct")}</label>
                          <TooltipHelp text={tCommon("tooltips.wastePct")} />
                        </div>
                        <Input type="number" min="0" max="50" {...register("wastePct")} suffix="%" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Costs tab */}
              <TabsContent value="costs">
                <Card>
                  <CardHeader><CardTitle className="text-base">{locale === "es" ? "Costos adicionales" : "Additional costs"}</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-medium text-stone-700">{tCommon("laborCost")}</label>
                          <TooltipHelp text={tCommon("tooltips.laborCost")} />
                        </div>
                        <Input type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" suffix="/h" />
                      </div>
                      <Input label={tCommon("laborHours")} type="number" min="0" step="0.5" {...register("laborHours")} suffix="h" />
                      <Input label={tCommon("energyCost")} type="number" min="0" step="0.01" {...register("energyCost")} prefix="$" />
                      <Input label={tCommon("packagingCost")} type="number" min="0" step="0.01" {...register("packagingCost")} prefix="$" />
                      <Input label={tCommon("labelCost")} type="number" min="0" step="0.01" {...register("labelCost")} prefix="$" />
                      <Input label={tCommon("boxCost")} type="number" min="0" step="0.01" {...register("boxCost")} prefix="$" />
                      <Input label={tCommon("shippingCost")} type="number" min="0" step="0.01" {...register("shippingCost")} prefix="$" />
                      <Input label={tCommon("taxPct")} type="number" min="0" max="100" {...register("taxPct")} suffix="%" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-medium text-stone-700">{tCommon("platformFeePct")}</label>
                          <TooltipHelp text={tCommon("tooltips.platformFeePct")} />
                        </div>
                        <Input type="number" min="0" max="100" {...register("platformFeePct")} suffix="%" />
                      </div>
                      <Input label={tCommon("affiliateFeePct")} type="number" min="0" max="100" {...register("affiliateFeePct")} suffix="%" />
                      <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <label className="text-sm font-medium text-stone-700">{tCommon("desiredMarginPct")}</label>
                          <TooltipHelp text={tCommon("tooltips.desiredMarginPct")} />
                        </div>
                        <Input type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action buttons */}
            <div className="flex gap-3 flex-wrap">
              <Button type="submit" variant="primary" loading={isSubmitting} className="flex-1 sm:flex-none">
                <Flame className="h-4 w-4" />
                {tCommon("calculate")}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); }}>
                <RefreshCw className="h-4 w-4" />
                {tCommon("reset")}
              </Button>
            </div>
          </div>

          {/* RIGHT: results */}
          <div className="space-y-4">
            {results ? (
              <>
                {/* Recipe card — PRIMARY */}
                {(() => {
                  const es = locale === "es";
                  const isMW = watch("waxType") === "moldWax";
                  const isPillar = isMW || watch("candleType") === "molded" || watch("candleType") === "pillar";
                  const waxLabel = isMW
                    ? (es ? "Cera de molde (parafina)" : "Mold wax (paraffin)")
                    : (es ? `Cera (${watch("waxType")})` : `Wax (${watch("waxType")})`);
                  const items: any[] = [
                    { label: es ? "Volumen del molde" : "Mold volume", amount: `${results.totalVolumeML.toFixed(0)} ml` },
                    { separator: true },
                    { label: waxLabel, amount: `${results.waxAmountG.toFixed(1)} g`, highlight: true },
                  ];
                  if (results.stearicAcidG > 0) {
                    items.push({ label: es ? "Estearina (ácido esteárico)" : "Stearin (stearic acid)", amount: `${results.stearicAcidG.toFixed(1)} g`, sub: `${results.stearicAcidPct.toFixed(1)}%`, highlight: isMW });
                  }
                  items.push({ label: es ? "Fragancia" : "Fragrance", amount: `${results.fragranceAmountG.toFixed(1)} g`, sub: `${watch("fragranceLoadPct")}%`, highlight: true });
                  if (results.vybarAmountG > 0) items.push({ label: `Vybar ${watch("vybarType")}`, amount: `${results.vybarAmountG.toFixed(2)} g`, sub: `${results.vybarPct.toFixed(2)}%` });
                  if (results.colorantAmountG > 0) items.push({ label: es ? "Colorante" : "Colorant", amount: `${results.colorantAmountG.toFixed(1)} g` });
                  items.push({ separator: true });
                  items.push({ label: es ? "1 Pabilo" : "1 Wick", amount: "1 pieza" });
                  if (isPillar && results.secondPourG > 0) {
                    items.push({ separator: true });
                    items.push({
                      label: es ? "2ª vertida (relleno del hundimiento)" : "2nd pour (sinkhole fill)",
                      amount: `~${results.secondPourG.toFixed(1)} g`,
                      sub: "15%",
                      highlight: false,
                    });
                  }
                  const note = isPillar
                    ? (es
                        ? "Cera de molde: vierte a 75–80°C. Espera a que solidifique completamente (12–24h). Vierte la 2ª capa para rellenar el hundimiento central. Usa desmoldante antes de verter."
                        : "Mold wax: pour at 75–80°C. Wait until fully solid (12–24h). Pour 2nd layer to fill center sinkhole. Use mold release before pouring.")
                    : (es ? "Derrite la cera, añade fragancia a 75°C, colorante y aditivos. Vierte a 65-70°C." : "Melt wax, add fragrance at 75°C, colorant and additives. Pour at 65-70°C.");
                  return (
                    <RecipeCard
                      title={es ? "Lo que necesitas" : "What you need"}
                      locale={locale}
                      items={items}
                      note={note}
                    />
                  );
                })()}

                <ResultPanel results={results} locale={locale} currency={watch("currency")} />

                {/* Save / Export */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />
                    {saved ? tCommon("saved") : tCommon("save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={handleExport}>
                    <FileDown className="h-4 w-4" />
                    {tCommon("export")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white py-14 text-center">
                <Flame className="mx-auto h-8 w-8 text-stone-200 mb-3" />
                <p className="text-sm text-stone-400">{tCommon("noResults")}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
