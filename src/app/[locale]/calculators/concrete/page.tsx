"use client";
import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResultPanel } from "@/components/ui/result-panel";
import { RecipeCard } from "@/components/ui/recipe-card";
import { MoldCalculator } from "@/components/ui/mold-calculator";
import { calculateConcrete, CONCRETE_MIX_TYPES } from "@/lib/calculations/concrete";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { Locale } from "@/types";
import { Mountain, AlertTriangle, Save, FileDown, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  productName:       z.string().default(""),
  concreteType:      z.string().default("decorative"),
  waterCementRatio:  z.coerce.number().min(0.2).max(1).default(0.45),
  cementCostPerKg:   z.coerce.number().min(0).default(0),
  sandCostPerKg:     z.coerce.number().min(0).default(0),
  pigmentCostPerKg:  z.coerce.number().min(0).default(0),
  pigmentPct:        z.coerce.number().min(0).max(10).default(0),
  sealantCost:       z.coerce.number().min(0).default(0),
  fibersCost:        z.coerce.number().min(0).default(0),
  moldCost:          z.coerce.number().min(0).default(0),
  releaseAgentCost:  z.coerce.number().min(0).default(0),
  sandpaperCost:     z.coerce.number().min(0).default(0),
  polishCost:        z.coerce.number().min(0).default(0),
  laborCostPerHour:  z.coerce.number().min(0).default(0),
  laborHours:        z.coerce.number().min(0).default(0),
  desiredMarginPct:  z.coerce.number().min(1).default(40),
  units:             z.coerce.number().min(1).default(1),
  batchSize:         z.coerce.number().min(1).default(1),
  wastePct:          z.coerce.number().min(0).default(8),
  productionTimeMin: z.coerce.number().min(0).default(60),
  currency:          z.string().default("USD"),
  notes:             z.string().default(""),
  // Legacy fallback
  totalDryMixG:      z.coerce.number().min(0).default(0),
  cementRatioPct:    z.coerce.number().min(0).default(33),
  sandRatioPct:      z.coerce.number().min(0).default(67),
  plasticizerCost:   z.coerce.number().min(0).default(0),
  waterproofingCost: z.coerce.number().min(0).default(0),
  dryingTimeH:       z.coerce.number().min(0).default(24),
  finalWeightKg:     z.coerce.number().min(0).default(0),
  taxPct:            z.coerce.number().min(0).default(0),
  platformFeePct:    z.coerce.number().min(0).default(0),
  affiliateFeePct:   z.coerce.number().min(0).default(0),
  labelCost:         z.coerce.number().min(0).default(0),
  boxCost:           z.coerce.number().min(0).default(0),
  shippingCost:      z.coerce.number().min(0).default(0),
  energyCost:        z.coerce.number().min(0).default(0),
  projectType:       z.string().default("planter"),
  mixType:           z.string().default("cement"),
});
type FormValues = z.infer<typeof schema>;

export default function ConcreteCalculatorPage() {
  const locale = useLocale() as Locale;
  const es = locale === "es";
  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [moldShape, setMoldShape] = useState("");
  const [moldDims, setMoldDims] = useState<Record<string, number>>({});
  const [moldVolume, setMoldVolume] = useState(0);

  const { register, handleSubmit, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      concreteType: "decorative", waterCementRatio: 0.45,
      units: 1, batchSize: 1, wastePct: 8, desiredMarginPct: 40, currency: "USD",
    },
  });

  const concreteType = watch("concreteType");
  const mix = CONCRETE_MIX_TYPES[concreteType] ?? CONCRETE_MIX_TYPES.decorative;

  function handleMoldVolume(vol: number, shape: string, dims: Record<string, number>) {
    setMoldVolume(vol);
    setMoldShape(shape);
    setMoldDims(dims);
  }

  const onSubmit = useCallback((data: FormValues) => {
    const calc = calculateConcrete({
      ...data,
      concreteType: data.concreteType,
      moldShape: moldShape || "manual",
      moldDimensions: moldDims,
    } as any);
    setResults(calc);
    setSaved(false);
  }, [moldShape, moldDims]);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("calculations").insert({
        user_id: user.id, product_name: watch("productName") || null,
        category: "concrete", units: watch("units"), batch_size: watch("batchSize"),
        input_data: watch(), results, locale,
      });
      setSaved(true);
    }
    setSaving(false);
  }

  function buildRecipe() {
    if (!results) return [];
    const hasAggregate = results.aggregateG > 0;
    const hasGlassFiber = results.glassFiberG > 0;
    const items: any[] = [];
    if (results.volumeMl > 0) {
      items.push({ label: es ? "Volumen del molde" : "Mold volume", amount: `${results.volumeMl.toFixed(0)} ml`, sub: `(+15% ${es ? "desperdicio" : "waste"})` });
      items.push({ separator: true });
    }
    items.push({ label: es ? "Cemento Portland" : "Portland Cement", amount: `${results.cementG.toFixed(0)} g  (${(results.cementG / 1000).toFixed(2)} kg)`, highlight: true });
    items.push({ label: es ? "Arena fina" : "Fine Sand", amount: `${results.sandG.toFixed(0)} g  (${(results.sandG / 1000).toFixed(2)} kg)`, highlight: true });
    if (hasAggregate) items.push({ label: es ? "Grava / Agregado" : "Gravel / Aggregate", amount: `${results.aggregateG.toFixed(0)} g`, highlight: true });
    if (hasGlassFiber) items.push({ label: es ? "Fibra de vidrio (GFRC)" : "Glass fiber (GFRC)", amount: `${results.glassFiberG.toFixed(1)} g`, sub: "~5% del cemento" });
    items.push({ separator: true });
    items.push({ label: es ? "Agua" : "Water", amount: `${results.waterG.toFixed(0)} ml`, sub: `w/c ${results.waterCementRatioActual}` });
    items.push({ separator: true });
    items.push({ label: es ? "Mezcla seca total" : "Total dry mix", amount: `${(results.totalDryG / 1000).toFixed(2)} kg`, highlight: false });
    items.push({ label: es ? "Mezcla húmeda total" : "Total wet mix", amount: `${(results.totalWetG / 1000).toFixed(2)} kg`, highlight: false });
    return items;
  }

  const MIX_TYPES = Object.entries(CONCRETE_MIX_TYPES);

  return (
    <AppLayout title={es ? "Calculadora de Concreto" : "Concrete Calculator"}>
      <div className="mb-6 flex items-center gap-2">
        <Mountain className="h-5 w-5 text-stone-500" />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2C2C2C" }}>
            {es ? "Calculadora de Concreto Decorativo" : "Decorative Concrete Calculator"}
          </h1>
          <p className="text-sm" style={{ color: "#9E998F" }}>
            {es ? "¿Cuánto cemento y arena necesitas? Elige el molde y la mezcla." : "How much cement and sand do you need? Choose the mold and mix."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 1: Mix type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "1. Tipo de mezcla" : "1. Mix type"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Input label={es ? "Nombre del proyecto" : "Project name"} placeholder={es ? "Ej: Maceta cilíndrica grande" : "E.g: Large cylindrical planter"} {...register("productName")} style={{ marginBottom: 16 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                  {MIX_TYPES.map(([key, mx]) => {
                    const active = concreteType === key;
                    return (
                      <label key={key} style={{
                        border: `2px solid ${active ? "#C9A347" : "#EDE8E1"}`,
                        borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                        background: active ? "#F5F0EA" : "white", transition: "all 0.15s",
                      }}>
                        <input type="radio" value={key} {...register("concreteType")} style={{ display: "none" }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#A8862A" : "#2C2C2C", margin: "0 0 4px" }}>
                          {es ? mx.label_es : mx.label_en}
                        </p>
                        <p style={{ fontSize: 11, color: "#9E998F", margin: "0 0 6px", lineHeight: 1.4 }}>
                          {es ? mx.use_es : mx.use_en}
                        </p>
                        <p style={{ fontSize: 11, color: "#A8862A", margin: 0, fontWeight: 600 }}>
                          {es ? "Densidad:" : "Density:"} {mx.densityGml} g/ml
                        </p>
                      </label>
                    );
                  })}
                </div>
                {/* Show ratio info */}
                {mix && (
                  <div style={{ marginTop: 14, background: "#F5F0EA", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#6B6460" }}>
                      <strong>{es ? "Cemento:" : "Cement:"}</strong> {mix.cementPct}%
                    </span>
                    <span style={{ fontSize: 12, color: "#6B6460" }}>
                      <strong>{es ? "Arena:" : "Sand:"}</strong> {mix.sandPct}%
                    </span>
                    {mix.aggregatePct > 0 && <span style={{ fontSize: 12, color: "#6B6460" }}><strong>{es ? "Grava:" : "Gravel:"}</strong> {mix.aggregatePct}%</span>}
                    {mix.glassFiberPct > 0 && <span style={{ fontSize: 12, color: "#A8862A" }}><strong>GFRC:</strong> +{mix.glassFiberPct}% {es ? "fibra" : "fiber"}</span>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* STEP 2: Mold volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "2. Dimensiones del molde" : "2. Mold dimensions"}</CardTitle>
              </CardHeader>
              <CardContent>
                <p style={{ fontSize: 13, color: "#6B6460", marginBottom: 14 }}>
                  {es
                    ? "Mide o calcula el volumen de tu molde. El concreto incluye 15% extra por desperdicio y rebosamiento."
                    : "Measure or calculate your mold volume. Concrete includes 15% extra for waste and overflow."}
                </p>
                <MoldCalculator locale={locale} onVolume={handleMoldVolume} />
              </CardContent>
            </Card>

            {/* STEP 3: Water/cement ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "3. Relación agua/cemento" : "3. Water/cement ratio"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label={es ? "Relación agua:cemento (w/c)" : "Water:cement ratio (w/c)"}
                  type="number" min="0.25" max="0.80" step="0.01"
                  {...register("waterCementRatio")}
                  hint={es ? "0.40–0.50 = óptimo para piezas decorativas. Más agua = más débil." : "0.40–0.50 = optimal for decorative pieces. More water = weaker."}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {[
                    { val: 0.40, label_es: "Duro (0.40)", label_en: "Hard (0.40)" },
                    { val: 0.45, label_es: "Estándar (0.45)", label_en: "Standard (0.45)" },
                    { val: 0.50, label_es: "Trabajable (0.50)", label_en: "Workable (0.50)" },
                  ].map(p => (
                    <button key={p.val} type="button"
                      onClick={() => setValue("waterCementRatio", p.val)}
                      style={{ fontSize: 11, padding: "4px 10px", border: "1px solid #EDE8E1", borderRadius: 8, cursor: "pointer", background: watch("waterCementRatio") === p.val ? "#C9A347" : "white", color: watch("waterCementRatio") === p.val ? "white" : "#6B6460" }}>
                      {es ? p.label_es : p.label_en}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* STEP 4: Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "4. Costos (opcional)" : "4. Costs (optional)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={es ? "Cemento ($/kg)" : "Cement ($/kg)"} type="number" min="0" step="0.01" {...register("cementCostPerKg")} prefix="$" />
                  <Input label={es ? "Arena ($/kg)" : "Sand ($/kg)"} type="number" min="0" step="0.01" {...register("sandCostPerKg")} prefix="$" />
                  <Input label={es ? "Pigmento ($/kg)" : "Pigment ($/kg)"} type="number" min="0" step="0.01" {...register("pigmentCostPerKg")} prefix="$" />
                  <Input label={es ? "% pigmento" : "Pigment %" } type="number" min="0" max="10" {...register("pigmentPct")} suffix="%" />
                  <Input label={es ? "Sellador" : "Sealant"} type="number" min="0" step="0.01" {...register("sealantCost")} prefix="$" />
                  <Input label={es ? "Desmoldante" : "Release agent"} type="number" min="0" step="0.01" {...register("releaseAgentCost")} prefix="$" />
                  <Input label={es ? "Mano de obra $/h" : "Labor $/h"} type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" />
                  <Input label={es ? "Horas" : "Hours"} type="number" min="0" step="0.5" {...register("laborHours")} />
                  <Input label={es ? "Margen deseado %" : "Desired margin %"} type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                  <Input label={es ? "Unidades" : "Units"} type="number" min="1" {...register("units")} />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <Mountain className="h-4 w-4" />
                {es ? "Calcular" : "Calculate"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); setMoldVolume(0); }}>
                <RefreshCw className="h-4 w-4" />
                {es ? "Reiniciar" : "Reset"}
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-4">
            {results ? (
              <>
                {results.warnings?.includes("tooMuchWater") && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle size={16} style={{ color: "#DC2626", flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "#991B1B", margin: 0 }}>
                      {es ? "Relación agua/cemento muy alta (>0.65). El concreto quedará débil y poroso." : "Water/cement ratio too high (>0.65). Concrete will be weak and porous."}
                    </p>
                  </div>
                )}

                <RecipeCard
                  title={es ? "Lo que necesitas" : "What you need"}
                  locale={locale}
                  items={buildRecipe()}
                  note={es
                    ? `Mezcla seca primero, agrega agua poco a poco. Tiempo de fraguado: 24–48h. Desmolda a las 24h.`
                    : `Mix dry first, add water gradually. Setting time: 24–48h. Demold after 24h.`}
                />

                <ResultPanel results={results} locale={locale} currency={watch("currency")} />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />{saved ? (es ? "Guardado" : "Saved") : (es ? "Guardar" : "Save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => exportCalculationPDF({ results, productName: watch("productName") || "Concrete", category: "concrete", locale, currency: watch("currency") })}>
                    <FileDown className="h-4 w-4" />{es ? "PDF" : "PDF"}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ borderRadius: 16, border: "2px dashed #EDE8E1", background: "white", padding: "48px 24px", textAlign: "center" }}>
                <Mountain style={{ margin: "0 auto 12px", display: "block", color: "#EDE8E1" }} size={32} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#C4BDB5", margin: "0 0 4px" }}>
                  {es ? "Selecciona la mezcla y el molde" : "Select mix type and mold"}
                </p>
                <p style={{ fontSize: 12, color: "#C4BDB5", margin: 0 }}>
                  {es ? "La receta de materiales aparecerá aquí" : "Materials recipe will appear here"}
                </p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
