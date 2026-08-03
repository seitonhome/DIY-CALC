import type { ResinInputs, CalculationResults, CostItem } from "@/types";
import { calculateResults } from "./core";
import { calculateVolume } from "./geometry";

// ─── Resin types: density, max single-pour depth, cure time ───────────────
export const RESIN_TYPES: Record<string, {
  density: number; maxPourMm: number; cureTimeH: number;
  defaultRatioA: number; defaultRatioB: number; label_es: string; label_en: string;
}> = {
  deepPour: {
    density: 1.05, maxPourMm: 50, cureTimeH: 48,
    defaultRatioA: 67, defaultRatioB: 33,
    label_es: "Epoxy colada profunda (Deep Pour)",
    label_en: "Deep Pour Epoxy",
  },
  tableTop: {
    density: 1.10, maxPourMm: 6, cureTimeH: 24,
    defaultRatioA: 50, defaultRatioB: 50,
    label_es: "Epoxy mesa / sellante (Table Top)",
    label_en: "Table Top / Coating Epoxy",
  },
  uv: {
    density: 1.10, maxPourMm: 5, cureTimeH: 0.05,
    defaultRatioA: 100, defaultRatioB: 0,
    label_es: "Resina UV (un componente)",
    label_en: "UV Resin (single component)",
  },
  polyurethane: {
    density: 1.05, maxPourMm: 150, cureTimeH: 1,
    defaultRatioA: 50, defaultRatioB: 50,
    label_es: "Poliuretano",
    label_en: "Polyurethane",
  },
  polyester: {
    density: 1.13, maxPourMm: 30, cureTimeH: 6,
    defaultRatioA: 98, defaultRatioB: 2,
    label_es: "Resina de poliéster (necesita catalizador)",
    label_en: "Polyester Resin (needs a catalyst)",
  },
  // Ultra-clear 1:1 epoxy popular in LatAm craft market ("resina cristal")
  cristal: {
    density: 1.05, maxPourMm: 4, cureTimeH: 36,
    defaultRatioA: 50, defaultRatioB: 50,
    label_es: "Resina cristal / acrílica",
    label_en: "Crystal / Acrylic Resin",
  },
  // Flexible when cured (Shore A ~60) — phone cases, soft jewelry, charms
  flexible: {
    density: 1.05, maxPourMm: 10, cureTimeH: 24,
    defaultRatioA: 50, defaultRatioB: 50,
    label_es: "Resina flexible (se dobla sin romperse)",
    label_en: "Flexible Resin (bends without breaking)",
  },
  // High-solids floor coating — decorative floors with metallic pigments
  floorCoating: {
    density: 1.15, maxPourMm: 4, cureTimeH: 24,
    defaultRatioA: 67, defaultRatioB: 33,
    label_es: "Epoxy para pisos decorativos",
    label_en: "Decorative Floor Epoxy",
  },
};

// ─── Project techniques: what the user wants to make ───────────────────────
// Shared between the resin calculator (step 1) and the app-wide wizard.
export const RESIN_TECHNIQUES = [
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
] as const;

// ─── Technique waste factors ───────────────────────────────────────────────
const TECHNIQUE_WASTE: Record<string, number> = {
  casting:    0.10,
  riverTable: 0.15,
  coating:    0.08,
  jewelry:    0.15,
  geode:      0.20,
  countertop: 0.10,
  floorArt:   0.08,
  flexItems:  0.12,
};

export interface ResinCalculationResult extends CalculationResults {
  volumeMl: number;
  totalResinG: number;
  totalResinMl: number;
  partAg: number;
  partBg: number;
  partAml: number;
  partBml: number;
  resinPerLayerG: number;
  resinPerLayerMl: number;
  recommendedPours: number;
  pourDepthMm: number;
  density: number;
  warnings: string[];
}

export function calculateResin(inputs: ResinInputs): ResinCalculationResult {
  const {
    resinCategory,        // technique: casting | riverTable | coating | jewelry | geode | countertop
    resinType: rType,    // deepPour | tableTop | uv | polyurethane | polyester
    partAPct,
    partBPct,
    costPerKgA,
    costPerKgB,
    densityGml,
    moldVolumeMl,
    coverageAreaCm2,
    thicknessMm,
    layers,
    mixLossPct,
    pigmentsCost,
    micasCost,
    alcoholInksCost,
    glitterCost,
    goldLeafCost,
    inclusionsCost,
    sealantCost,
    sandpaperCost,
    polishCost,
    heatGunCost,
    productionTimeMin,
    units,
    // Shape-based volume
    moldShape,
    moldDimensions,
  } = inputs as ResinInputs & {
    resinCategory?: string;
    moldShape?: string;
    moldDimensions?: Record<string, number>;
  };

  const typeProps = RESIN_TYPES[rType] ?? RESIN_TYPES.deepPour;
  const density = densityGml > 0 ? densityGml : typeProps.density;

  // ── Volume calculation ─────────────────────────────────────────────────
  let volumeMl = moldVolumeMl || 0;

  // If shape + dimensions provided, calculate volume
  if (!volumeMl && moldShape && moldShape !== "manual" && moldDimensions) {
    volumeMl = calculateVolume(moldShape as any, moldDimensions as any);
  }

  // Coating mode: area × thickness
  if (!volumeMl && coverageAreaCm2 > 0 && thicknessMm > 0) {
    volumeMl = coverageAreaCm2 * (thicknessMm / 10);
  }

  const numLayers = layers || 1;
  const totalVolumeMl = volumeMl * numLayers;

  // ── Waste / technique factor ────────────────────────────────────────────
  const techniqueWaste = TECHNIQUE_WASTE[resinCategory || "casting"] ?? 0.10;
  const lossFactor = 1 + Math.max((mixLossPct || 5) / 100, techniqueWaste);

  const baseResinG = totalVolumeMl * density;
  const totalResinG = baseResinG * lossFactor;
  const totalResinMl = totalResinG / density;

  // ── Part A / Part B ────────────────────────────────────────────────────
  const aPct = (partAPct || typeProps.defaultRatioA) / 100;
  const bPct = (partBPct || typeProps.defaultRatioB) / 100;
  const totalRatioPct = aPct + bPct || 1;
  const partAg = totalResinG * (aPct / totalRatioPct);
  const partBg = totalResinG * (bPct / totalRatioPct);
  const partAml = partAg / density;
  const partBml = partBg / density;

  // ── Pour depth & recommended number of pours ──────────────────────────
  // pour depth = volume / area (assume area from coverage or mold footprint)
  const pourDepthMm = volumeMl > 0 && coverageAreaCm2 > 0
    ? (volumeMl / coverageAreaCm2) * 10        // cm³/cm² = cm → mm
    : thicknessMm || 0;
  const maxPourMm = typeProps.maxPourMm;
  const recommendedPours = pourDepthMm > maxPourMm && maxPourMm > 0
    ? Math.ceil(pourDepthMm / maxPourMm)
    : numLayers;

  // ── Costs ──────────────────────────────────────────────────────────────
  const costA = partAg * ((costPerKgA || 0) / 1000);
  const costB = partBg * ((costPerKgB || 0) / 1000);
  const additivesAndAccessories =
    (pigmentsCost || 0) + (micasCost || 0) + (alcoholInksCost || 0) +
    (glitterCost || 0) + (goldLeafCost || 0) + (inclusionsCost || 0);
  const finishingCost =
    (sealantCost || 0) + (sandpaperCost || 0) + (polishCost || 0) + (heatGunCost || 0);
  const materialCostPerUnit = costA + costB + additivesAndAccessories + finishingCost;

  const costItems: CostItem[] = [
    { name: "Resina Parte A / Resin Part A", cost: costA, percentage: 0 },
    { name: "Resina Parte B / Resin Part B", cost: costB, percentage: 0 },
    { name: "Pigmentos / Pigments", cost: additivesAndAccessories, percentage: 0 },
    { name: "Acabado / Finishing", cost: finishingCost, percentage: 0 },
  ].filter((i) => i.cost > 0);

  // ── Warnings ───────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (pourDepthMm > maxPourMm && maxPourMm > 0) warnings.push("tooDeep");
  if ((mixLossPct || 5) > 15) warnings.push("highWaste");
  // Off-ratio mixes are the #1 cause of resin that never cures (sticky/tacky surface)
  if (rType !== "uv" && Math.abs((partAPct || typeProps.defaultRatioA) - typeProps.defaultRatioA) > 3) {
    warnings.push("offRatio");
  }

  const results = calculateResults(
    materialCostPerUnit, inputs, costItems,
    (productionTimeMin || 60) * units
  );

  return {
    ...results,
    volumeMl: totalVolumeMl,
    totalResinG,
    totalResinMl,
    partAg,
    partBg,
    partAml,
    partBml,
    resinPerLayerG: totalResinG / Math.max(recommendedPours, 1),
    resinPerLayerMl: totalResinMl / Math.max(recommendedPours, 1),
    recommendedPours,
    pourDepthMm,
    density,
    warnings,
  };
}
