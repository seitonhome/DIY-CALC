"use client";
import { useState, useCallback, useEffect } from "react";
import { useLocale } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ResultPanel } from "@/components/ui/result-panel";
import { RecipeCard } from "@/components/ui/recipe-card";
import { MoldCalculator } from "@/components/ui/mold-calculator";
import { StepGuide, type StepGuideStep } from "@/components/ui/step-guide";
import { calculateResin, RESIN_TYPES, RESIN_TECHNIQUES as TECHNIQUES } from "@/lib/calculations/resin";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { Locale } from "@/types";
import { Droplets, Save, FileDown, RefreshCw, AlertTriangle, Info, ShieldAlert, Scale, Beaker, Flame, Clock } from "lucide-react";
import { saveFormula } from "@/lib/formulas";

function getResinSteps(locale: Locale, typeProps: (typeof RESIN_TYPES)[string], partAPct: number, partBPct: number, results: any): StepGuideStep[] {
  const es = locale === "es";
  const cureStr = typeProps.cureTimeH < 1 ? `${typeProps.cureTimeH * 60} min` : `${typeProps.cureTimeH}h`;
  const steps: StepGuideStep[] = [
    { icon: ShieldAlert, critical: true, title: es ? "Prepara tu espacio de trabajo" : "Prepare your workspace", description: es ? "Cubre la superficie, ponte guantes y trabaja en un área ventilada — los vapores de la resina sin curar pueden irritar." : "Cover your surface, wear gloves, and work in a ventilated area — uncured resin fumes can irritate." },
    { icon: Scale, title: es ? "Mide Parte A y B con precisión" : "Measure Part A and B precisely", description: results?.partAg
        ? (es ? `Báscula digital: ${results.partAg.toFixed(1)} g de Parte A y ${results.partBg.toFixed(1)} g de Parte B (proporción ${partAPct}:${partBPct}). Es la causa #1 de que la resina no cure bien.` : `Digital scale: ${results.partAg.toFixed(1)} g of Part A and ${results.partBg.toFixed(1)} g of Part B (${partAPct}:${partBPct} ratio). The #1 cause of resin that never fully cures.`)
        : (es ? `Respeta la proporción ${partAPct}:${partBPct} (A:B) al gramo — es la causa #1 de que la resina no cure bien.` : `Stick to the ${partAPct}:${partBPct} (A:B) ratio to the gram — the #1 cause of resin that never fully cures.`) },
    { icon: Beaker, title: es ? "Mezcla lento, 3-4 minutos" : "Mix slowly, 3-4 minutes", description: es ? "Remueve raspando bien el fondo y las paredes del recipiente — la resina que quede sin mezclar ahí se queda pegajosa para siempre." : "Scrape the bottom and sides of the container well as you stir — any unmixed resin left there stays tacky forever." },
    { icon: Flame, title: es ? "Elimina las burbujas" : "Pop the air bubbles", description: es ? "Pasa un soplete o encendedor rápidamente sobre la superficie después de verter, sin acercarte demasiado." : "Quickly pass a torch or lighter over the surface after pouring, without lingering too close." },
    { icon: Droplets, title: es ? "Vierte en el molde" : "Pour into the mold", description: results?.recommendedPours > 1
        ? (es ? `Divide en ${results.recommendedPours} coladas de ~${results.resinPerLayerG?.toFixed(0)}g cada una, esperando ${cureStr} de curado entre cada una.` : `Split into ${results.recommendedPours} pours of ~${results.resinPerLayerG?.toFixed(0)}g each, waiting ${cureStr} of cure time between pours.`)
        : (es ? "Vierte despacio y por el centro del molde para evitar burbujas." : "Pour slowly through the center of the mold to avoid bubbles.") },
    { icon: Clock, title: es ? `Cura ${cureStr} antes de desmoldar` : `Cure for ${cureStr} before demolding`, description: es ? "No lo muevas ni lo destapes mientras cura — el polvo y las vibraciones arruinan el acabado." : "Don't move it or uncover it while curing — dust and vibration ruin the finish." },
  ];
  return steps;
}

const schema = z.object({
  productName:     z.string().default(""),
  resinCategory:   z.string().default("casting"),
  resinType:       z.string().default("deepPour"),
  moldVolumeMl:    z.coerce.number().min(0).default(0),
  coverageAreaCm2: z.coerce.number().min(0).default(0),
  thicknessMm:     z.coerce.number().min(0).default(3),
  layers:          z.coerce.number().min(1).default(1),
  partAPct:        z.coerce.number().min(0).max(100).default(67),
  partBPct:        z.coerce.number().min(0).max(100).default(33),
  costPerKgA:      z.coerce.number().min(0).default(0),
  costPerKgB:      z.coerce.number().min(0).default(0),
  densityGml:      z.coerce.number().min(0).default(0),
  mixLossPct:      z.coerce.number().min(0).max(30).default(5),
  pigmentsCost:    z.coerce.number().min(0).default(0),
  micasCost:       z.coerce.number().min(0).default(0),
  alcoholInksCost: z.coerce.number().min(0).default(0),
  glitterCost:     z.coerce.number().min(0).default(0),
  goldLeafCost:    z.coerce.number().min(0).default(0),
  inclusionsCost:  z.coerce.number().min(0).default(0),
  sealantCost:     z.coerce.number().min(0).default(0),
  sandpaperCost:   z.coerce.number().min(0).default(0),
  polishCost:      z.coerce.number().min(0).default(0),
  heatGunCost:     z.coerce.number().min(0).default(0),
  laborCostPerHour:z.coerce.number().min(0).default(0),
  laborHours:      z.coerce.number().min(0).default(0),
  packagingCost:   z.coerce.number().min(0).default(0),
  platformFeePct:  z.coerce.number().min(0).default(0),
  desiredMarginPct:z.coerce.number().min(1).default(40),
  units:           z.coerce.number().min(1).default(1),
  batchSize:       z.coerce.number().min(1).default(1),
  wastePct:        z.coerce.number().min(0).default(5),
  productionTimeMin:z.coerce.number().min(0).default(60),
  currency:        z.string().default("USD"),
  notes:           z.string().default(""),
  curingTimeHours: z.coerce.number().min(0).default(24),
  timeBetweenLayersH: z.coerce.number().min(0).default(4),
});

type FormValues = z.infer<typeof schema>;

export default function ResinCalculatorPage() {
  const locale = useLocale() as Locale;
  const es = locale === "es";
  const [results, setResults] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [moldVolFromShape, setMoldVolFromShape] = useState(0);

  const { register, handleSubmit, control, watch, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      resinCategory: "casting", resinType: "deepPour",
      partAPct: 67, partBPct: 33, densityGml: 0,
      layers: 1, thicknessMm: 3, mixLossPct: 5,
      units: 1, batchSize: 1, wastePct: 5, desiredMarginPct: 40, currency: "USD",
    },
  });

  // Prefill from the wizard (?type=<technique>)
  useEffect(() => {
    const type = new URLSearchParams(window.location.search).get("type");
    if (type && TECHNIQUES.some(t => t.value === type)) {
      setValue("resinCategory", type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resinCategory = watch("resinCategory");
  const resinType = watch("resinType");
  const technique = TECHNIQUES.find(t => t.value === resinCategory) ?? TECHNIQUES[0];
  const typeProps = RESIN_TYPES[resinType] ?? RESIN_TYPES.deepPour;
  const isUV = resinType === "uv";
  const isCoating = resinCategory === "coating" || resinCategory === "countertop";

  // Auto-set ratio when resin type changes
  function handleResinTypeChange(val: string) {
    const props = RESIN_TYPES[val];
    if (props) {
      setValue("partAPct", props.defaultRatioA);
      setValue("partBPct", props.defaultRatioB);
      setValue("densityGml", props.density);
    }
  }

  // Auto-select recommended resin when technique changes
  useEffect(() => {
    const rec = technique.recommendedResin;
    if (rec && RESIN_TYPES[rec]) {
      setValue("resinType", rec);
      handleResinTypeChange(rec);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resinCategory]);

  const onSubmit = useCallback((data: FormValues) => {
    const volumeToUse = data.moldVolumeMl || moldVolFromShape;
    const calc = calculateResin({
      ...data,
      moldVolumeMl: volumeToUse,
      resinCategory: data.resinCategory,
    } as any);
    setResults(calc);
    setSaved(false);
  }, [moldVolFromShape]);

  async function handleSave() {
    if (!results) return;
    setSaving(true);
    const { ok } = await saveFormula({
      category: "resin",
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

  // Build recipe items from results
  function buildRecipe() {
    if (!results) return [];
    const items: any[] = [];
    items.push({ label: es ? "Volumen total" : "Total volume", amount: `${results.volumeMl.toFixed(0)} ml`, highlight: false });
    items.push({ separator: true });

    if (!isUV) {
      items.push({
        label: es ? `Resina — Parte A (${watch("partAPct")}%)` : `Resin — Part A (${watch("partAPct")}%)`,
        amount: `${results.partAg.toFixed(1)} g  /  ${results.partAml.toFixed(0)} ml`,
        highlight: true,
      });
      items.push({
        label: es ? `Endurecedor — Parte B (${watch("partBPct")}%)` : `Hardener — Part B (${watch("partBPct")}%)`,
        amount: `${results.partBg.toFixed(1)} g  /  ${results.partBml.toFixed(0)} ml`,
        highlight: true,
      });
    } else {
      items.push({ label: es ? "Resina UV (un componente)" : "UV Resin (single component)", amount: `${results.totalResinG.toFixed(1)} g`, highlight: true });
    }

    items.push({ separator: true });
    items.push({
      label: es ? "Total de resina (incluye merma)" : "Total resin (waste included)",
      amount: `${results.totalResinG.toFixed(1)} g`,
    });

    if (results.recommendedPours > 1) {
      items.push({ separator: true });
      items.push({
        label: es ? `Coladas recomendadas` : `Recommended pours`,
        amount: `${results.recommendedPours}`,
        sub: es ? `~${results.resinPerLayerG.toFixed(0)} g c/u` : `~${results.resinPerLayerG.toFixed(0)} g each`,
        highlight: true,
      });
    }

    return items;
  }

  const sectionLabel = { fontSize: 11, fontWeight: 700, color: "#C4BDB5", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8 };

  return (
    <AppLayout title={es ? "Calculadora de Resina" : "Resin Calculator"}>
      <div className="mb-6 flex items-center gap-2">
        <Droplets className="h-5 w-5 text-sky-500" />
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#2C2C2C" }}>{es ? "Calculadora de Resina Epóxica" : "Epoxy Resin Calculator"}</h1>
          <p className="text-sm" style={{ color: "#9E998F" }}>
            {es ? "¿Cuánta resina necesitas? Elige tu técnica y calcula." : "How much resin do you need? Choose your technique and calculate."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">

            {/* STEP 1: Technique */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#2C2C2C" }}>
                  {es ? "1. ¿Qué quieres hacer?" : "1. What are you making?"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input label={es ? "Nombre del proyecto" : "Project name"} placeholder={es ? "Ej: Mesa río nogal" : "E.g: Walnut river table"} {...register("productName")} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10, marginTop: 14 }}>
                  {TECHNIQUES.map(tech => {
                    const active = resinCategory === tech.value;
                    return (
                      <label key={tech.value} style={{
                        border: `2px solid ${active ? "#C9A347" : "#EDE8E1"}`,
                        borderRadius: 12,
                        padding: "12px 14px",
                        cursor: "pointer",
                        background: active ? "#F5F0EA" : "white",
                        transition: "all 0.15s",
                      }}>
                        <input type="radio" value={tech.value} {...register("resinCategory")} style={{ display: "none" }} />
                        <div style={{ fontSize: 22, marginBottom: 6 }}>{tech.icon}</div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: active ? "#A8862A" : "#2C2C2C", margin: "0 0 4px" }}>
                          {es ? tech.label_es : tech.label_en}
                        </p>
                        <p style={{ fontSize: 11, color: "#9E998F", margin: 0, lineHeight: 1.4 }}>
                          {es ? tech.desc_es : tech.desc_en}
                        </p>
                      </label>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recommendation card */}
            <div style={{
              borderRadius: 14, border: "2px solid #C9A34755", background: "linear-gradient(135deg, #F5F0EA 0%, #FFF9EE 100%)",
              padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#A8862A", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {es ? `Para "${technique.label_es}" te recomendamos:` : `For "${technique.label_en}" we recommend:`}
                </p>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#2C2C2C", margin: "0 0 6px" }}>
                  {es ? RESIN_TYPES[technique.recommendedResin]?.label_es : RESIN_TYPES[technique.recommendedResin]?.label_en}
                </p>
                <p style={{ fontSize: 12, color: "#6B6460", margin: 0, lineHeight: 1.5 }}>
                  {es ? technique.reason_es : technique.reason_en}
                </p>
                {technique.altResin && (
                  <p style={{ fontSize: 11, color: "#9E998F", margin: "8px 0 0", fontStyle: "italic" }}>
                    {es ? `Alternativa: ${technique.altReason_es}` : `Alternative: ${technique.altReason_en}`}
                  </p>
                )}
              </div>
            </div>

            {/* STEP 2: Resin type */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#2C2C2C" }}>
                  {es ? "2. Tipo de resina" : "2. Resin type"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8 }}>
                  {Object.entries(RESIN_TYPES).map(([key, props]) => {
                    const active = resinType === key;
                    const isRec = technique.recommendedResin === key;
                    return (
                      <label key={key} style={{
                        border: `2px solid ${active ? "#C9A347" : isRec ? "#C9A34744" : "#EDE8E1"}`,
                        borderRadius: 10, padding: "10px 12px", cursor: "pointer",
                        background: active ? "#F5F0EA" : "white", transition: "all 0.15s",
                        position: "relative",
                      }}>
                        <input
                          type="radio" value={key}
                          {...register("resinType")}
                          onChange={e => { register("resinType").onChange(e); handleResinTypeChange(e.target.value); }}
                          style={{ display: "none" }}
                        />
                        {isRec && (
                          <span style={{
                            position: "absolute", top: -9, right: 8,
                            background: "#C9A347", color: "white", fontSize: 9, fontWeight: 800,
                            padding: "2px 7px", borderRadius: 99, letterSpacing: "0.05em",
                          }}>
                            ★ {es ? "RECOMENDADO" : "RECOMMENDED"}
                          </span>
                        )}
                        <p style={{ fontSize: 12, fontWeight: 700, color: active ? "#A8862A" : "#2C2C2C", margin: "0 0 4px" }}>
                          {es ? props.label_es : props.label_en}
                        </p>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, color: "#9E998F" }}>Max {props.maxPourMm} mm</span>
                          <span style={{ fontSize: 10, color: "#9E998F" }}>•</span>
                          <span style={{ fontSize: 10, color: "#9E998F" }}>{props.density} g/ml</span>
                          {!isUV && <span style={{ fontSize: 10, color: "#9E998F" }}>• {props.defaultRatioA}:{props.defaultRatioB}</span>}
                        </div>
                      </label>
                    );
                  })}
                </div>

                {/* Ratio */}
                {!isUV && (
                  <div>
                    <p style={sectionLabel}>{es ? "Proporción de mezcla" : "Mix ratio"}</p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input label={es ? "Parte A %" : "Part A %"} type="number" min="0" max="100" {...register("partAPct")} suffix="%" hint={es ? "Cuánta resina (parte A) por cada 100% de mezcla" : "How much resin (part A) per 100% of the mix"} />
                      <Input label={es ? "Parte B %" : "Part B %"} type="number" min="0" max="100" {...register("partBPct")} suffix="%" hint={es ? "Cuánto endurecedor (parte B). A+B debe sumar 100%" : "How much hardener (part B). A+B should add up to 100%"} />
                      <Input label={es ? "Densidad g/ml" : "Density g/ml"} type="number" min="0" step="0.01" {...register("densityGml")} suffix="g/ml" hint={es ? "Densidad típica de resina epóxica: 1.1 g/ml" : "Typical epoxy resin density: 1.1 g/ml"} />
                    </div>
                    <p style={{ fontSize: 11, color: "#9E998F", marginTop: 6 }}>
                      {es
                        ? "⚠️ Siempre revisa la ficha técnica de tu resina — el ratio puede ser en volumen o en peso."
                        : "⚠️ Always check your resin's data sheet — ratio may be by volume or by weight."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* STEP 3: Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#2C2C2C" }}>
                  {es ? "3. Dimensiones del proyecto" : "3. Project dimensions"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isCoating ? (
                  <>
                    <p style={{ fontSize: 13, color: "#6B6460" }}>
                      {es
                        ? "Calcula el volumen de tu molde, o ingrésalo directamente si ya lo sabes."
                        : "Calculate your mold volume, or enter it directly if you already know it."}
                    </p>
                    <MoldCalculator locale={locale} onVolume={(vol) => setMoldVolFromShape(vol)} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        label={es ? "O ingresar volumen directo" : "Or enter volume directly"}
                        type="number" min="0"
                        {...register("moldVolumeMl")}
                        suffix="ml"
                        hint={moldVolFromShape > 0 ? `${es ? "Calculado:" : "Calculated:"} ${moldVolFromShape.toFixed(0)} ml` : undefined}
                      />
                      <Input label={es ? "Número de capas" : "Number of layers"} type="number" min="1" {...register("layers")} />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: 13, color: "#6B6460" }}>
                      {es
                        ? "Para capa sellante: ingresa el área de la superficie y el grosor deseado."
                        : "For coating: enter the surface area and desired thickness."}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input label={es ? "Largo (cm)" : "Length (cm)"} type="number" min="0" id="coat_l" suffix="cm" />
                      <Input label={es ? "Ancho (cm)" : "Width (cm)"} type="number" min="0" id="coat_w" suffix="cm" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <Input label={es ? "Área total (cm²)" : "Total area (cm²)"} type="number" min="0" {...register("coverageAreaCm2")} suffix="cm²"
                        hint={es ? "Largo × Ancho = cm²" : "Length × Width = cm²"} />
                      <Input label={es ? "Grosor por capa (mm)" : "Thickness per layer (mm)"} type="number" min="0" step="0.5" {...register("thicknessMm")} suffix="mm"
                        hint={`Max: ${typeProps.maxPourMm} mm`} />
                      <Input label={es ? "Número de capas" : "Layers"} type="number" min="1" {...register("layers")} />
                    </div>
                  </>
                )}
                <Input label={es ? "Merma por mezcla %" : "Mix waste %"} type="number" min="0" max="30" {...register("mixLossPct")} suffix="%" hint={es ? "Lo que queda en el recipiente al mezclar" : "Amount left in mixing container"} />
              </CardContent>
            </Card>

            {/* STEP 4: Costs (optional) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base" style={{ color: "#2C2C2C" }}>
                  {es ? "4. Costos (opcional)" : "4. Costs (optional)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isUV && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label={es ? "Costo Parte A ($/kg)" : "Part A cost ($/kg)"} type="number" min="0" step="0.01" {...register("costPerKgA")} prefix="$" />
                    <Input label={es ? "Costo Parte B ($/kg)" : "Part B cost ($/kg)"} type="number" min="0" step="0.01" {...register("costPerKgB")} prefix="$" />
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label={es ? "Micas / pigmentos" : "Micas / pigments"} type="number" min="0" step="0.01" {...register("micasCost")} prefix="$" />
                  <Input label={es ? "Tintas de alcohol" : "Alcohol inks"} type="number" min="0" step="0.01" {...register("alcoholInksCost")} prefix="$" />
                  <Input label="Glitter" type="number" min="0" step="0.01" {...register("glitterCost")} prefix="$" />
                  <Input label={es ? "Pan de oro" : "Gold leaf"} type="number" min="0" step="0.01" {...register("goldLeafCost")} prefix="$" />
                  <Input label={es ? "Inclusiones" : "Inclusions"} type="number" min="0" step="0.01" {...register("inclusionsCost")} prefix="$" />
                  <Input label={es ? "Sellador final" : "Top coat sealant"} type="number" min="0" step="0.01" {...register("sealantCost")} prefix="$" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Input label={es ? "Mano de obra $/h" : "Labor $/h"} type="number" min="0" step="0.01" {...register("laborCostPerHour")} prefix="$" />
                  <Input label={es ? "Horas de trabajo" : "Labor hours"} type="number" min="0" step="0.5" {...register("laborHours")} />
                  <Input label={es ? "Margen deseado %" : "Desired margin %"} type="number" min="1" max="100" {...register("desiredMarginPct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <Droplets className="h-4 w-4" />
                {es ? "Calcular" : "Calculate"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); setMoldVolFromShape(0); }}>
                <RefreshCw className="h-4 w-4" />
                {es ? "Reiniciar" : "Reset"}
              </Button>
            </div>
          </div>

          {/* RIGHT: Results */}
          <div className="space-y-4">
            {results ? (
              <>
                {/* Warnings */}
                {results.warnings?.includes("tooDeep") && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle size={16} style={{ color: "#DC2626", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#991B1B", margin: "0 0 2px" }}>
                        {es ? "Profundidad excede el límite" : "Depth exceeds pour limit"}
                      </p>
                      <p style={{ fontSize: 12, color: "#991B1B", margin: 0 }}>
                        {es
                          ? `Esta resina permite máx. ${typeProps.maxPourMm} mm por colada. Divide en ${results.recommendedPours} coladas de ${results.resinPerLayerMl.toFixed(0)} ml cada una.`
                          : `This resin allows max. ${typeProps.maxPourMm} mm per pour. Split into ${results.recommendedPours} pours of ${results.resinPerLayerMl.toFixed(0)} ml each.`}
                      </p>
                    </div>
                  </div>
                )}

                {results.warnings?.includes("offRatio") && (
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 10 }}>
                    <AlertTriangle size={16} style={{ color: "#B45309", flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#92400E", margin: "0 0 2px" }}>
                        {es ? "Mezcla fuera de proporción" : "Mix ratio off"}
                      </p>
                      <p style={{ fontSize: 12, color: "#92400E", margin: 0 }}>
                        {es
                          ? `La proporción recomendada para esta resina es ${typeProps.defaultRatioA}:${typeProps.defaultRatioB} (A:B). Fuera de esa proporción puede quedar pegajosa y no curar bien.`
                          : `The recommended ratio for this resin is ${typeProps.defaultRatioA}:${typeProps.defaultRatioB} (A:B). Off that ratio it may stay tacky and never fully cure.`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Recipe card — PRIMARY output */}
                <RecipeCard
                  title={es ? "Lo que necesitas" : "What you need"}
                  locale={locale}
                  items={buildRecipe()}
                  note={results.recommendedPours > 1
                    ? (es ? `Divide la resina en ${results.recommendedPours} coladas con ${typeProps.cureTimeH}h entre cada una` : `Split into ${results.recommendedPours} pours with ${typeProps.cureTimeH}h cure time between each`)
                    : undefined}
                />

                {/* Cure time info */}
                <div style={{ background: "white", border: "1px solid #EDE8E1", borderRadius: 12, padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Info size={14} style={{ color: "#C9A347" }} />
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#2C2C2C", margin: 0 }}>
                      {es ? "Información del proceso" : "Process info"}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {[
                      { label: es ? "Tiempo de curado" : "Cure time", value: `${typeProps.cureTimeH < 1 ? `${typeProps.cureTimeH * 60} min` : `${typeProps.cureTimeH}h`}` },
                      { label: es ? "Densidad resina" : "Resin density", value: `${results.density} g/ml` },
                      { label: es ? "Coladas necesarias" : "Pours needed", value: `${results.recommendedPours}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: "#9E998F" }}>{label}</span>
                        <span style={{ fontWeight: 600, color: "#2C2C2C" }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <StepGuide
                  title={es ? "Cómo hacerlo, paso a paso" : "How to make it, step by step"}
                  steps={getResinSteps(locale, typeProps, watch("partAPct"), watch("partBPct"), results)}
                />

                {/* Cost breakdown — SECONDARY */}
                <ResultPanel results={results} locale={locale} currency={watch("currency")} />

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleSave} loading={saving} disabled={saved}>
                    <Save className="h-4 w-4" />{saved ? (es ? "Guardado" : "Saved") : (es ? "Guardar" : "Save")}
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => exportCalculationPDF({ results, productName: watch("productName") || "Resin", category: "resin", locale, currency: watch("currency") })}>
                    <FileDown className="h-4 w-4" />{es ? "Exportar PDF" : "Export PDF"}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ borderRadius: 16, border: "2px dashed #EDE8E1", background: "white", padding: "48px 24px", textAlign: "center" }}>
                <Droplets style={{ margin: "0 auto 12px", display: "block", color: "#EDE8E1" }} size={32} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "#C4BDB5", margin: "0 0 4px" }}>
                  {es ? "Configura tu proyecto y calcula" : "Set up your project and calculate"}
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
