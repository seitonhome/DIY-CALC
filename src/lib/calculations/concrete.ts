import type { ConcreteInputs, CalculationResults, CostItem } from "@/types";
import { calculateResults } from "./core";
import { calculateVolume } from "./geometry";

// ─── Mix types: ratios and fresh density ──────────────────────────────────
export const CONCRETE_MIX_TYPES: Record<string, {
  cementPct: number; sandPct: number; aggregatePct: number;
  densityGml: number; glassFiberPct: number;
  label_es: string; label_en: string; use_es: string; use_en: string;
}> = {
  decorative: {
    cementPct: 33, sandPct: 67, aggregatePct: 0, densityGml: 1.80, glassFiberPct: 0,
    label_es: "Decorativo (1:2 cemento:arena)",
    label_en: "Decorative (1:2 cement:sand)",
    use_es: "Macetas, esculturas, arte — mezcla liviana sin agregado grueso",
    use_en: "Pots, sculptures, art — lightweight mix without coarse aggregate",
  },
  standard: {
    cementPct: 17, sandPct: 33, aggregatePct: 50, densityGml: 2.20, glassFiberPct: 0,
    label_es: "Estándar (1:2:3 cemento:arena:grava)",
    label_en: "Standard (1:2:3 cement:sand:gravel)",
    use_es: "Piezas estructurales, encimeras gruesas",
    use_en: "Structural pieces, thick countertops",
  },
  gfrc: {
    cementPct: 40, sandPct: 60, aggregatePct: 0, densityGml: 1.90, glassFiberPct: 5,
    label_es: "GFRC — Concreto reforzado con fibra de vidrio",
    label_en: "GFRC — Glass Fiber Reinforced Concrete",
    use_es: "Piezas delgadas resistentes, encimeras, fachadas",
    use_en: "Thin durable pieces, countertops, facades",
  },
  fine: {
    cementPct: 50, sandPct: 50, aggregatePct: 0, densityGml: 1.70, glassFiberPct: 0,
    label_es: "Fino (1:1 cemento:arena fina)",
    label_en: "Fine (1:1 cement:fine sand)",
    use_es: "Detalles finos, moldes pequeños, azulejos decorativos",
    use_en: "Fine details, small molds, decorative tiles",
  },
  lightweight: {
    cementPct: 40, sandPct: 30, aggregatePct: 0, densityGml: 1.20, glassFiberPct: 0,
    label_es: "Liviano (cemento + perlita)",
    label_en: "Lightweight (cement + perlite)",
    use_es: "Macetas grandes, piezas colgantes — muy liviano",
    use_en: "Large planters, hanging pieces — very lightweight",
  },
  whiteCement: {
    cementPct: 33, sandPct: 67, aggregatePct: 0, densityGml: 1.75, glassFiberPct: 0,
    label_es: "Cemento blanco decorativo",
    label_en: "White Decorative Cement",
    use_es: "Macetas y esculturas blancas o coloreadas. Base perfecta para pigmentos y óxidos. Misma mezcla (1:2) pero con cemento blanco Portland.",
    use_en: "White or colored planters and sculptures. Perfect base for pigments and oxides. Same 1:2 mix as decorative but with white Portland cement.",
  },
  hypertufa: {
    cementPct: 25, sandPct: 0, aggregatePct: 0, densityGml: 0.90, glassFiberPct: 0,
    label_es: "Hypertufa (cemento + turba + perlita)",
    label_en: "Hypertufa (cement + peat + perlite)",
    use_es: "Arte de jardín rústico: macetas, piedras ornamentales, troncos falsos. Textura porosa y muy liviana. Mezcla: 1 parte cemento + 1.5 turba + 1.5 perlita en volumen.",
    use_en: "Rustic garden art: planters, stepping stones, fake logs. Porous, very lightweight texture. Mix: 1 part cement + 1.5 peat + 1.5 perlite by volume.",
  },
  microcement: {
    cementPct: 60, sandPct: 40, aggregatePct: 0, densityGml: 1.60, glassFiberPct: 0,
    label_es: "Microcemento / Microtopping",
    label_en: "Microcement / Microtopping",
    use_es: "Capa ultra-delgada (1–3 mm) sobre paredes, pisos o muebles. Arena finísima (malla 200+). Requiere imprimante y sellador epóxico. Decoración de interiores premium.",
    use_en: "Ultra-thin layer (1–3 mm) on walls, floors or furniture. Very fine sand (200+ mesh). Requires primer and epoxy sealer. Premium interior decoration.",
  },
};

export interface ConcreteCalculationResult extends CalculationResults {
  volumeMl: number;
  totalWetG: number;
  totalDryG: number;
  cementG: number;
  sandG: number;
  aggregateG: number;
  glassFiberG: number;
  waterG: number;
  waterCementRatioActual: number;
  wasteFactor: number;
  warnings: string[];
}

export function calculateConcrete(inputs: ConcreteInputs): ConcreteCalculationResult {
  const {
    concreteType: cType,
    cementCostPerKg,
    sandCostPerKg,
    waterCementRatio,
    pigmentCostPerKg,
    pigmentPct,
    sealantCost,
    fibersCost,
    plasticizerCost,
    waterproofingCost,
    moldCost,
    releaseAgentCost,
    sandpaperCost,
    polishCost,
    productionTimeMin,
    units,
    // Shape-based inputs
    moldShape,
    moldDimensions,
    totalDryMixG,
  } = inputs as ConcreteInputs & {
    concreteType?: string;
    moldShape?: string;
    moldDimensions?: Record<string, number>;
  };

  const mix = CONCRETE_MIX_TYPES[cType || "decorative"] ?? CONCRETE_MIX_TYPES.decorative;

  // ── Volume calculation ─────────────────────────────────────────────────
  let volumeMl = 0;
  if (moldShape && moldShape !== "manual" && moldDimensions) {
    volumeMl = calculateVolume(moldShape as any, moldDimensions as any);
  }

  // Waste/overflow factor: concrete needs extra (15% for most pieces)
  const wasteFactor = 1.15;
  const totalVolumeMl = volumeMl > 0 ? volumeMl * wasteFactor : 0;

  // ── Material calculation from volume ──────────────────────────────────
  // Fresh concrete density → total wet weight
  const totalWetG = totalVolumeMl > 0
    ? totalVolumeMl * mix.densityGml
    : (totalDryMixG || 1000) * wasteFactor;

  // water/cement ratio → water + cement + sand + aggregate
  const wcr = waterCementRatio > 0 ? waterCementRatio : 0.45;

  // In 1:2 (cement:sand): totalDry = cement + sand = cement × 3
  // water = cement × wcr
  // totalWet = cement + sand + water = cement × (1 + sand_ratio + wcr)
  // Let r_c = cPct, r_s = sPct, r_a = aggregatePct (as fractions summing to 1)
  const rc = mix.cementPct / (mix.cementPct + mix.sandPct + mix.aggregatePct);
  const rs = mix.sandPct / (mix.cementPct + mix.sandPct + mix.aggregatePct);
  const ra = mix.aggregatePct / (mix.cementPct + mix.sandPct + mix.aggregatePct);

  // totalWet = totalDry + water = totalDry + cement × wcr = totalDry × (1 + rc × wcr)
  const totalDryG = totalWetG / (1 + rc * wcr);
  const cementG = totalDryG * rc;
  const sandG = totalDryG * rs;
  const aggregateG = totalDryG * ra;
  const glassFiberG = mix.glassFiberPct > 0 ? cementG * (mix.glassFiberPct / 100) : 0;
  const waterG = cementG * wcr;

  // ── Pigment ────────────────────────────────────────────────────────────
  const pigmentG = totalDryG * ((pigmentPct || 0) / 100);
  const pigmentCostTotal = pigmentG * ((pigmentCostPerKg || 0) / 1000);

  // ── Costs ──────────────────────────────────────────────────────────────
  const cementCost = cementG * ((cementCostPerKg || 0) / 1000);
  const sandCost = sandG * ((sandCostPerKg || 0) / 1000);
  const accessoriesCost =
    (sealantCost || 0) + (fibersCost || 0) + (plasticizerCost || 0) +
    (waterproofingCost || 0) + (moldCost || 0) + (releaseAgentCost || 0) +
    (sandpaperCost || 0) + (polishCost || 0);
  const materialCostPerUnit = cementCost + sandCost + pigmentCostTotal + accessoriesCost;

  const costItems: CostItem[] = [
    { name: "Cemento / Cement", cost: cementCost, percentage: 0 },
    { name: "Arena / Sand", cost: sandCost, percentage: 0 },
    { name: "Pigmento / Pigment", cost: pigmentCostTotal, percentage: 0 },
    { name: "Accesorios / Accessories", cost: accessoriesCost, percentage: 0 },
  ].filter((i) => i.cost > 0);

  // ── Warnings ───────────────────────────────────────────────────────────
  const warnings: string[] = [];
  if (wcr > 0.65) warnings.push("tooMuchWater");
  if (wcr < 0.3) warnings.push("tooLittleWater");
  if (!volumeMl && !totalDryMixG) warnings.push("noVolume");

  const results = calculateResults(
    materialCostPerUnit, inputs, costItems,
    (productionTimeMin || 60) * units
  );

  return {
    ...results,
    volumeMl: totalVolumeMl,
    totalWetG,
    totalDryG,
    cementG,
    sandG,
    aggregateG,
    glassFiberG,
    waterG,
    waterCementRatioActual: wcr,
    wasteFactor,
    warnings,
  };
}
