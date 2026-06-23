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
    label_es: "Poliéster + catalizador MEKP",
    label_en: "Polyester + MEKP catalyst",
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
    label_es: "Resina flexible (Shore A ~60)",
    label_en: "Flexible Resin (Shore A ~60)",
  },
  // High-solids floor coating — decorative floors with metallic pigments
  floorCoating: {
    density: 1.15, maxPourMm: 4, cureTimeH: 24,
    defaultRatioA: 67, defaultRatioB: 33,
    label_es: "Epoxy para pisos decorativos",
    label_en: "Decorative Floor Epoxy",
  },
};

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
