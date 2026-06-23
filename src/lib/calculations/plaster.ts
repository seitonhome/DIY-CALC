import type { PlasterInputs, CalculationResults, CostItem } from "@/types";
import { calculateResults } from "./core";
import { calculateVolume } from "./geometry";

// ─── Plaster types: water:plaster ratio and mix density ───────────────────
export const PLASTER_TYPES: Record<string, {
  wpr: number; mixDensityGml: number; cureTimeMin: number;
  label_es: string; label_en: string; use_es: string; use_en: string;
}> = {
  standard: {
    wpr: 0.70, mixDensityGml: 1.35, cureTimeMin: 30,
    label_es: "Yeso común / Yeso París",
    label_en: "Standard Plaster / Plaster of Paris",
    use_es: "Moldes de yeso, piezas decorativas básicas, negativos",
    use_en: "Plaster molds, basic decorative pieces, negatives",
  },
  escayola: {
    wpr: 0.60, mixDensityGml: 1.50, cureTimeMin: 20,
    label_es: "Escayola (más dura)",
    label_en: "Casting Plaster (harder)",
    use_es: "Piezas más duras y detalladas, moldería fina",
    use_en: "Harder detailed pieces, fine moldmaking",
  },
  ceramic: {
    wpr: 0.65, mixDensityGml: 1.45, cureTimeMin: 25,
    label_es: "Yeso cerámico",
    label_en: "Pottery Plaster",
    use_es: "Moldes para cerámica y alfarería",
    use_en: "Molds for ceramics and pottery",
  },
  stone: {
    wpr: 0.38, mixDensityGml: 1.80, cureTimeMin: 45,
    label_es: "Hydrocal / Ultracal 30 (muy duro)",
    label_en: "Hydrocal / Ultracal 30 (very hard)",
    use_es: "Piezas de alta resistencia, bases y soportes",
    use_en: "High-strength pieces, bases and supports",
  },
  dental: {
    wpr: 0.28, mixDensityGml: 1.90, cureTimeMin: 15,
    label_es: "Yeso dental (máxima dureza)",
    label_en: "Dental Plaster (maximum hardness)",
    use_es: "Piezas muy precisas y duras, protésico artesanal",
    use_en: "Very precise and hard pieces",
  },
};

export interface PlasterCalculationResult extends CalculationResults {
  volumeMl: number;
  plasterG: number;
  waterG: number;
  totalMixG: number;
  totalMixMl: number;
  waterPlasterRatioActual: number;
  wasteFactor: number;
  warnings: string[];
}

export function calculatePlaster(inputs: PlasterInputs): PlasterCalculationResult {
  const {
    plasterType,
    plasterCostPerKg,
    waterPlasterRatio,
    pigmentCost,
    fragranceCost,
    sealantCost,
    paintCost,
    varnishCost,
    moldCost,
    releaseAgentCost,
    sandpaperCost,
    productionTimeMin,
    units,
    // Shape-based inputs
    moldShape,
    moldDimensions,
    plasterAmountG,
    finalWeightG,
  } = inputs as PlasterInputs & {
    moldShape?: string;
    moldDimensions?: Record<string, number>;
  };

  const typeProps = PLASTER_TYPES[plasterType] ?? PLASTER_TYPES.standard;
  const wpr = waterPlasterRatio > 0 ? waterPlasterRatio : typeProps.wpr;
  const mixDensity = typeProps.mixDensityGml;

  // ── Volume calculation ─────────────────────────────────────────────────
  let volumeMl = 0;
  if (moldShape && moldShape !== "manual" && moldDimensions) {
    volumeMl = calculateVolume(moldShape as any, moldDimensions as any);
  }

  // Waste factor: always mix 15% more plaster — it sets fast and you can't reuse leftovers
  const wasteFactor = 1.15;
  const totalMixMl = volumeMl > 0 ? volumeMl * wasteFactor : 0;

  // ── Material calculation ───────────────────────────────────────────────
  // From volume → total mix weight (using mix density)
  // Then split into plaster + water using the w:p ratio
  let totalMixG: number;
  let plasterG: number;
  let waterG: number;

  if (totalMixMl > 0) {
    totalMixG = totalMixMl * mixDensity;
    // totalMix = plaster + water = plaster × (1 + wpr)
    plasterG = totalMixG / (1 + wpr);
    waterG = plasterG * wpr;
  } else {
    // Fallback: use manual inputs
    const targetG = finalWeightG || plasterAmountG || 300;
    plasterG = targetG / (1 + wpr);
    waterG = plasterG * wpr;
    totalMixG = plasterG + waterG;
  }

  // ── Costs ──────────────────────────────────────────────────────────────
  const plasterCost = plasterG * ((plasterCostPerKg || 0) / 1000);
  const additivesCost =
    (pigmentCost || 0) + (fragranceCost || 0) + (sealantCost || 0) +
    (paintCost || 0) + (varnishCost || 0) + (moldCost || 0) +
    (releaseAgentCost || 0) + (sandpaperCost || 0);
  const materialCostPerUnit = plasterCost + additivesCost;

  const costItems: CostItem[] = [
    { name: "Yeso / Plaster", cost: plasterCost, percentage: 0 },
    { name: "Aditivos / Additives", cost: additivesCost, percentage: 0 },
  ].filter((i) => i.cost > 0);

  const warnings: string[] = [];
  if (!volumeMl && !plasterAmountG && !finalWeightG) warnings.push("noVolume");

  const results = calculateResults(
    materialCostPerUnit, inputs, costItems,
    (productionTimeMin || 30) * units
  );

  return {
    ...results,
    volumeMl: totalMixMl,
    plasterG,
    waterG,
    totalMixG,
    totalMixMl,
    waterPlasterRatioActual: wpr,
    wasteFactor,
    warnings,
  };
}
