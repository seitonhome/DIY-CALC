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
import { calculateResin, RESIN_TYPES } from "@/lib/calculations/resin";
import { exportCalculationPDF } from "@/lib/pdf/export";
import type { Locale } from "@/types";
import { Droplets, Save, FileDown, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Techniques ───────────────────────────────────────────────────────────
const TECHNIQUES = [
  {
    value: "casting",
    label_es: "Vaciado en molde",
    label_en: "Mold casting",
    desc_es: "Llenas un molde con resina. Para figuras, coasters, placas, joyería.",
    desc_en: "Fill a mold with resin. For figures, coasters, plaques, jewelry.",
    icon: "🧊",
    recommendedResin: "deepPour",
    altResin: "cristal",
    reason_es: "La Deep Pour genera poco calor al curar, lo que evita burbujas y deformaciones en moldes profundos. Permite hasta 50 mm por colada.",
    reason_en: "Deep Pour generates low heat during curing, preventing bubbles and warping in deep molds. Allows up to 50 mm per pour.",
    altReason_es: "Resina cristal para moldes poco profundos (≤4 mm) como coasters o fotos encapsuladas.",
    altReason_en: "Crystal resin for shallow molds (≤4 mm) like coasters or encapsulated photos.",
  },
  {
    value: "riverTable",
    label_es: "Mesa río (River Table)",
    label_en: "River Table",
    desc_es: "Resina entre dos tablas de madera formando un 'río'. Proyecto estrella.",
    desc_en: "Resin between two wood slabs forming a 'river'. Flagship project.",
    icon: "🏔️",
    recommendedResin: "deepPour",
    altResin: null,
    reason_es: "Las mesas río requieren coladas de 3–5 cm de profundidad. La Deep Pour es la única que aguanta ese espesor sin sobrecalentarse ni agrietarse.",
    reason_en: "River tables require 3–5 cm deep pours. Deep Pour is the only type that handles that thickness without overheating or cracking.",
    altReason_es: null,
    altReason_en: null,
  },
  {
    value: "coating",
    label_es: "Capa sellante / Encimera",
    label_en: "Coating / Countertop seal",
    desc_es: "Capa fina sobre una superficie plana. Para mesas, barras, cuadros.",
    desc_en: "Thin layer over a flat surface. For tables, bars, artwork.",
    icon: "🪵",
    recommendedResin: "tableTop",
    altResin: "deepPour",
    reason_es: "La Table Top se nivela sola y crea una superficie ultradura y brillante en capas de 6 mm. Es autonivelante: no necesitas extenderla.",
    reason_en: "Table Top self-levels and creates an ultra-hard, glossy surface in 6 mm layers. It's self-leveling: no need to spread it.",
    altReason_es: "Deep Pour en capas muy finas si buscas mayor profundidad en el acabado.",
    altReason_en: "Deep Pour in very thin layers if you want greater depth in the finish.",
  },
  {
    value: "jewelry",
    label_es: "Joyería y bisutería",
    label_en: "Jewelry & accessories",
    desc_es: "Moldes pequeños de silicona. Aretes, colgantes, anillos.",
    desc_en: "Small silicone molds. Earrings, pendants, rings.",
    icon: "💎",
    recommendedResin: "uv",
    altResin: "deepPour",
    reason_es: "La resina UV cura en 2–5 minutos bajo lámpara, sin mezclar partes A/B. Ideal para piezas pequeñas y producción en serie de joyería.",
    reason_en: "UV resin cures in 2–5 minutes under a lamp, no A/B mixing needed. Ideal for small pieces and jewelry batch production.",
    altReason_es: "Deep Pour si no tienes lámpara UV o para piezas más grandes.",
    altReason_en: "Deep Pour if you don't have a UV lamp or for larger pieces.",
  },
  {
    value: "geode",
    label_es: "Geoda / Arte en resina",
    label_en: "Geode / Resin art",
    desc_es: "Cuadros, geodes, arte abstracto. Múltiples capas y técnicas.",
    desc_en: "Paintings, geodes, abstract art. Multiple layers and techniques.",
    icon: "🎨",
    recommendedResin: "cristal",
    altResin: "tableTop",
    reason_es: "La resina cristal/acrílica es la más usada para geodes en LatAm: ultratransparente, no amarilla con el tiempo y tiene tiempo abierto largo para trabajar los pigmentos y micas.",
    reason_en: "Crystal/acrylic resin is the most used for geodes in LatAm: ultra-transparent, non-yellowing, and has a long open time for working with pigments and micas.",
    altReason_es: "Table Top si buscas acabado más duro o necesitas nivelado automático.",
    altReason_en: "Table Top if you want a harder finish or need self-leveling.",
  },
  {
    value: "countertop",
    label_es: "Encimera gruesa",
    label_en: "Thick countertop",
    desc_es: "Capa gruesa (>6 mm) sobre cocina o baño. Requiere múltiples capas.",
    desc_en: "Thick layer (>6mm) on kitchen or bathroom. Multiple layers needed.",
    icon: "🍽️",
    recommendedResin: "tableTop",
    altResin: null,
    reason_es: "La Table Top crea la superficie más dura y resistente al calor. Para encimeras >6 mm, aplica en capas de 6 mm esperando 24 h entre cada una.",
    reason_en: "Table Top creates the hardest and most heat-resistant surface. For countertops >6 mm, apply in 6 mm layers waiting 24 h between each.",
    altReason_es: null,
    altReason_en: null,
  },
  {
    value: "floorArt",
    label_es: "Piso decorativo / Metálico",
    label_en: "Decorative / Metallic floor",
    desc_es: "Pisos con efecto metálico, mármol o flakes. Autoaplicable, muy durable.",
    desc_en: "Metallic, marble or flake floors. Self-leveling, extremely durable.",
    icon: "✨",
    recommendedResin: "floorCoating",
    altResin: "tableTop",
    reason_es: "El Epoxy para pisos tiene alta densidad (1.15 g/ml) y dureza extrema (Shore D 80+). Se aplica en capas de 3–4 mm y aguanta tráfico pesado y temperatura.",
    reason_en: "Floor epoxy has high density (1.15 g/ml) and extreme hardness (Shore D 80+). Applied in 3–4 mm layers and withstands heavy traffic and temperature.",
    altReason_es: "Table Top si el área es pequeña o decorativa (menos de 5 m²).",
    altReason_en: "Table Top if the area is small or purely decorative (under 5 m²).",
  },
  {
    value: "flexItems",
    label_es: "Artículos flexibles",
    label_en: "Flexible items",
    desc_es: "Fundas de celular, pulseras, charms y piezas que deben doblar sin romperse.",
    desc_en: "Phone cases, bracelets, charms — pieces that need to flex without breaking.",
    icon: "🫱",
    recommendedResin: "flexible",
    altResin: "uv",
    reason_es: "La resina flexible cura con dureza Shore A ~60, lo que la hace blanda y elástica. Las resinas rígidas se parten al doblar y no sirven para estos usos.",
    reason_en: "Flexible resin cures at Shore A ~60 hardness, making it soft and elastic. Rigid resins crack when bent and are not suitable for these applications.",
    altReason_es: "Resina UV flexible si trabajas piezas muy pequeñas y necesitas rapidez.",
    altReason_en: "UV flexible resin if you work with very small pieces and need speed.",
  },
];

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("calculations").insert({
        user_id: user.id, product_name: watch("productName") || null,
        category: "resin", units: watch("units"), batch_size: watch("batchSize"),
        input_data: watch(), results, locale,
      });
      setSaved(true);
    }
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
                      <Input label={es ? "Parte A %" : "Part A %"} type="number" min="0" max="100" {...register("partAPct")} suffix="%" />
                      <Input label={es ? "Parte B %" : "Part B %"} type="number" min="0" max="100" {...register("partBPct")} suffix="%" />
                      <Input label={es ? "Densidad g/ml" : "Density g/ml"} type="number" min="0" step="0.01" {...register("densityGml")} suffix="g/ml" />
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
