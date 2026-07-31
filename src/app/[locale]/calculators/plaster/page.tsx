"use client";
import { useState, useCallback, useEffect } from "react";
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
import { StepGuide, type StepGuideStep } from "@/components/ui/step-guide";
import { TipsRotator } from "@/components/ui/tips-rotator";
import { calculatePlaster, PLASTER_TYPES } from "@/lib/calculations/plaster";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { Locale } from "@/types";
import { Layers3, Save, FileDown, RefreshCw, AlertTriangle, ShieldAlert, Scale, Waves, Droplets, Clock } from "lucide-react";
import { saveFormula } from "@/lib/formulas";

function getPlasterSteps(locale: Locale, typeProps: (typeof PLASTER_TYPES)[string], results: any): StepGuideStep[] {
  const es = locale === "es";
  const workTime = Math.max(typeProps.cureTimeMin - 5, 5);
  return [
    { icon: ShieldAlert, critical: true, title: es ? "Protégete del polvo" : "Protect yourself from dust", description: es ? "Usa mascarilla al manipular yeso en polvo — respirarlo repetidamente irrita las vías respiratorias." : "Wear a mask when handling plaster powder — breathing it in repeatedly irritates the airways." },
    { icon: Scale, title: es ? "Mide el agua primero, luego el yeso" : "Measure the water first, then the plaster", description: results?.waterG
        ? (es ? `${results.waterG.toFixed(0)} g de agua en un recipiente, ${results.plasterG.toFixed(0)} g de yeso listo para espolvorear encima.` : `${results.waterG.toFixed(0)} g of water in a bowl, ${results.plasterG.toFixed(0)} g of plaster ready to sift on top.`)
        : (es ? "Pesa el agua y el yeso por separado — a ojo la proporción sale mal." : "Weigh the water and plaster separately — eyeballing the ratio comes out wrong.") },
    { icon: Waves, title: es ? "Espolvorea el yeso AL AGUA — nunca al revés" : "Sift the plaster INTO the water — never the reverse", description: es ? "Deja que se hunda solo unos segundos antes de mezclar, así evitas grumos." : "Let it sink on its own for a few seconds before mixing — this avoids lumps." },
    { icon: Droplets, title: es ? "Mezcla suave, sin batir" : "Mix gently, without whipping", description: es ? "Remueve con movimientos suaves 2-3 minutos. Batir fuerte mete burbujas de aire que debilitan la pieza." : "Stir gently for 2-3 minutes. Whipping hard traps air bubbles that weaken the piece." },
    { icon: Droplets, title: es ? `Vierte rápido — tienes ~${workTime} min` : `Pour quickly — you have ~${workTime} min`, description: es ? "El yeso fragua solo, no puedes reutilizar lo que sobre. Vierte todo lo que necesites de una vez." : "Plaster sets on its own — you can't reuse leftovers. Pour everything you need in one go." },
    { icon: Clock, title: es ? `Deja fraguar ${typeProps.cureTimeMin} min y desmolda` : `Let it set ${typeProps.cureTimeMin} min and demold`, description: es ? "Desmolda cuando esté firme al tacto pero puede seguir endureciendo unos días más." : "Demold once firm to the touch — it can keep hardening for a few more days." },
  ];
}

const schema = z.object({
  productName:      z.string().default(""),
  plasterType:      z.string().default("standard"),
  plasterCostPerKg: z.coerce.number().min(0).default(0),
  waterPlasterRatio:z.coerce.number().min(0).default(0),
  pigmentCost:      z.coerce.number().min(0).default(0),
  fragranceCost:    z.coerce.number().min(0).default(0),
  sealantCost:      z.coerce.number().min(0).default(0),
  paintCost:        z.coerce.number().min(0).default(0),
  varnishCost:      z.coerce.number().min(0).default(0),
  moldCost:         z.coerce.number().min(0).default(0),
  releaseAgentCost: z.coerce.number().min(0).default(0),
  sandpaperCost:    z.coerce.number().min(0).default(0),
  laborCostPerHour: z.coerce.number().min(0).default(0),
  laborHours:       z.coerce.number().min(0).default(0),
  desiredMarginPct: z.coerce.number().min(1).default(40),
  units:            z.coerce.number().min(1).default(1),
  batchSize:        z.coerce.number().min(1).default(1),
  wastePct:         z.coerce.number().min(0).default(5),
  productionTimeMin:z.coerce.number().min(0).default(30),
  currency:         z.string().default("USD"),
  notes:            z.string().default(""),
  // Legacy fallback
  plasterAmountG:   z.coerce.number().min(0).default(0),
  finalWeightG:     z.coerce.number().min(0).default(0),
  projectType:      z.string().default("figure"),
  dryingTimeMin:    z.coerce.number().min(0).default(30),
  fragrancePct:     z.coerce.number().min(0).default(0),
  taxPct:           z.coerce.number().min(0).default(0),
  platformFeePct:   z.coerce.number().min(0).default(0),
  affiliateFeePct:  z.coerce.number().min(0).default(0),
  labelCost:        z.coerce.number().min(0).default(0),
  boxCost:          z.coerce.number().min(0).default(0),
  shippingCost:     z.coerce.number().min(0).default(0),
  energyCost:       z.coerce.number().min(0).default(0),
});
type FormValues = z.infer<typeof schema>;

export default function PlasterCalculatorPage() {
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
      plasterType: "standard", waterPlasterRatio: 0,
      units: 1, batchSize: 1, wastePct: 5, desiredMarginPct: 40, currency: "USD",
    },
  });

  // Prefill from the wizard (?type=<plasterType>)
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type && PLASTER_TYPES[type]) setValue("plasterType", type);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const plasterType = watch("plasterType");
  const typeProps = PLASTER_TYPES[plasterType] ?? PLASTER_TYPES.standard;

  function handleMoldVolume(vol: number, shape: string, dims: Record<string, number>) {
    setMoldVolume(vol);
    setMoldShape(shape);
    setMoldDims(dims);
  }

  const onSubmit = useCallback((data: FormValues) => {
    const calc = calculatePlaster({
      ...data,
      moldShape: moldShape || "manual",
      moldDimensions: moldDims,
    } as any);
    setResults(calc);
    setSaved(false);
  }, [moldShape, moldDims]);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const { ok } = await saveFormula({
      category: "plaster",
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

  function buildRecipe() {
    if (!results) return [];
    const items: any[] = [];
    if (results.volumeMl > 0) {
      items.push({ label: es ? "Volumen del molde" : "Mold volume", amount: `${(results.volumeMl / results.wasteFactor).toFixed(0)} ml`, sub: `(+15% ${es ? "extra" : "extra"})` });
      items.push({ separator: true });
    }
    items.push({ label: es ? `Yeso (${plasterType === "standard" ? "Yeso París" : typeProps.label_es})` : `Plaster (${typeProps.label_en})`, amount: `${results.plasterG.toFixed(0)} g  (${(results.plasterG / 1000).toFixed(2)} kg)`, highlight: true });
    items.push({ label: es ? "Agua" : "Water", amount: `${results.waterG.toFixed(0)} ml`, sub: `w:p ${results.waterPlasterRatioActual}`, highlight: true });
    items.push({ separator: true });
    items.push({ label: es ? "Mezcla total" : "Total mix", amount: `${results.totalMixG.toFixed(0)} g` });
    return items;
  }

  const TYPES = Object.entries(PLASTER_TYPES);

  return (
    <AppLayout title={es ? "Calculadora de Yeso" : "Plaster Calculator"}>
      <div className="mb-6 flex items-center gap-2">
        <Layers3 className="h-5 w-5 text-violet-500" />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2C2C2C" }}>
            {es ? "Calculadora de Yeso" : "Plaster Calculator"}
          </h1>
          <p className="text-sm" style={{ color: "#9E998F" }}>
            {es ? "¿Cuánto yeso y agua necesitas? Elige el tipo y el molde." : "How much plaster and water? Choose the type and the mold."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 1: Plaster type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "1. Tipo de yeso" : "1. Plaster type"}</CardTitle>
              </CardHeader>
              <CardContent>
                <Input label={es ? "Nombre del proyecto" : "Project name"} placeholder={es ? "Ej: Figura decorativa flor" : "E.g: Flower decorative figure"} {...register("productName")} style={{ marginBottom: 16 }} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 10 }}>
                  {TYPES.map(([key, tp]) => {
                    const active = plasterType === key;
                    return (
                      <label key={key} style={{
                        border: `2px solid ${active ? "#C9A347" : "#EDE8E1"}`,
                        borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                        background: active ? "#F5F0EA" : "white", transition: "all 0.15s",
                      }}>
                        <input type="radio" value={key} {...register("plasterType")} style={{ display: "none" }} />
                        <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#A8862A" : "#2C2C2C", margin: "0 0 4px" }}>
                          {es ? tp.label_es : tp.label_en}
                        </p>
                        <p style={{ fontSize: 11, color: "#9E998F", margin: "0 0 6px", lineHeight: 1.4 }}>
                          {es ? tp.use_es : tp.use_en}
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "#A8862A", fontWeight: 600 }}>w:p {tp.wpr}</span>
                          <span style={{ fontSize: 10, color: "#9E998F" }}>• {tp.cureTimeMin} min</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
                <div style={{ marginTop: 14, background: "#F5F0EA", borderRadius: 10, padding: "10px 14px" }}>
                  <p style={{ fontSize: 12, color: "#6B6460", margin: 0 }}>
                    {es
                      ? `Relación agua:yeso para ${typeProps.label_es}: ${typeProps.wpr} partes de agua por 1 parte de yeso (en peso). Tiempo de fraguado: ~${typeProps.cureTimeMin} min.`
                      : `Water:plaster ratio for ${typeProps.label_en}: ${typeProps.wpr} parts water per 1 part plaster (by weight). Setting time: ~${typeProps.cureTimeMin} min.`}
                  </p>
                </div>
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
                    ? "Mide o calcula el volumen de tu molde. Se añade 15% extra porque el yeso fragua rápido y siempre se necesita un poco más."
                    : "Measure or calculate your mold volume. 15% extra is added because plaster sets fast and you always need a bit more."}
                </p>
                <MoldCalculator locale={locale} onVolume={handleMoldVolume} />
              </CardContent>
            </Card>

            {/* STEP 3: Costs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{es ? "3. Costos (opcional)" : "3. Costs (optional)"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={es ? "Yeso ($/kg)" : "Plaster ($/kg)"} type="number" min="0" step="0.01" {...register("plasterCostPerKg")} prefix="$" />
                  <Input label={es ? "Pintura / acabado" : "Paint / finish"} type="number" min="0" step="0.01" {...register("paintCost")} prefix="$" />
                  <Input label={es ? "Barniz / sellador" : "Varnish / sealant"} type="number" min="0" step="0.01" {...register("varnishCost")} prefix="$" />
                  <Input label={es ? "Pigmento" : "Pigment"} type="number" min="0" step="0.01" {...register("pigmentCost")} prefix="$" />
                  <Input label={es ? "Desmoldante" : "Release agent"} type="number" min="0" step="0.01" {...register("releaseAgentCost")} prefix="$" hint={es ? "Spray o aceite para que la pieza no se pegue al molde" : "Spray or oil so the piece doesn't stick to the mold"} />
                  <Input label={es ? "Mano de obra $/h" : "Labor $/h"} type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" />
                  <Input label={es ? "Horas" : "Hours"} type="number" min="0" step="0.5" {...register("laborHours")} />
                  <Input label={es ? "Margen deseado %" : "Desired margin %"} type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <Layers3 className="h-4 w-4" />
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
            <TipsRotator locale={locale} category="plaster" resultsKey={results} />
            {results ? (
              <>
                {results.warnings?.includes("offWaterRatio") && (
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle size={16} style={{ color: "#B45309", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", margin: "0 0 2px" }}>
                        {es ? "Relación agua:yeso fuera de rango" : "Water:plaster ratio off"}
                      </p>
                      <p style={{ fontSize: 12, color: "#92400E", margin: 0 }}>
                        {es
                          ? `Lo recomendado para ${typeProps.label_es} es ${typeProps.wpr} partes de agua por 1 de yeso. Mucha agua debilita la pieza; muy poca fragua demasiado rápido para trabajarla.`
                          : `The recommended ratio for ${typeProps.label_en} is ${typeProps.wpr} parts water per 1 part plaster. Too much water weakens the piece; too little sets before you can work it.`}
                      </p>
                    </div>
                  </div>
                )}

                <RecipeCard
                  title={es ? "Lo que necesitas" : "What you need"}
                  locale={locale}
                  items={buildRecipe()}
                  note={es
                    ? `Siempre agrega el yeso AL AGUA (no al revés). Mezcla suavemente sin batir para evitar burbujas. Vierte rápido — tiempo de trabajo: ~${Math.max(typeProps.cureTimeMin - 5, 5)} min.`
                    : `Always add plaster TO WATER (not the other way). Mix gently without whipping to avoid bubbles. Pour quickly — working time: ~${Math.max(typeProps.cureTimeMin - 5, 5)} min.`}
                />

                <StepGuide
                  title={es ? "Cómo hacerlo, paso a paso" : "How to make it, step by step"}
                  steps={getPlasterSteps(locale, typeProps, results)}
                />

                <ResultPanel results={results} locale={locale} currency={watch("currency")} />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />{saved ? (es ? "Guardado" : "Saved") : (es ? "Guardar" : "Save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => exportCalculationPDF({ results, productName: watch("productName") || "Plaster", category: "plaster", locale, currency: watch("currency") })}>
                    <FileDown className="h-4 w-4" />{es ? "PDF" : "PDF"}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ borderRadius: 16, border: "2px dashed #EDE8E1", background: "white", padding: "48px 24px", textAlign: "center" }}>
                <Layers3 style={{ margin: "0 auto 12px", display: "block", color: "#EDE8E1" }} size={32} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#C4BDB5", margin: "0 0 4px" }}>
                  {es ? "Selecciona el tipo y el molde" : "Select type and mold"}
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
