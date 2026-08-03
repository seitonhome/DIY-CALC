import type { CandleInputs, CalculationResults, CostItem } from "@/types";
import { calculateVolume, calculateMaterialFromVolume } from "./geometry";
import { calculateResults } from "./core";

// ─── Complete wax type catalog ─────────────────────────────────────────────
export const WAX_TYPES: Record<string, {
  density: number;
  maxFragrancePct: number;
  meltPointC: number;
  pourTempC: number;
  fragranceAddTempC: number;
  needsSecondPour: boolean;
  containerType: "container" | "pillar" | "both";
  label_es: string; label_en: string;
  desc_es: string; desc_en: string;
}> = {
  // ── Soy ──────────────────────────────────────────────────────────────────
  soy: {
    density: 0.86, maxFragrancePct: 12,
    meltPointC: 49, pourTempC: 54, fragranceAddTempC: 57,
    needsSecondPour: false, containerType: "container",
    label_es: "Cera de soja — vela en vaso (la más fácil para empezar)",
    label_en: "Soy Wax — container candle (easiest to start with)",
    desc_es: "Conocida comercialmente como 464 o GB464. La más popular para velas en vaso. Superficie mate natural, excelente retención de fragancia. Derrite entre 49–54 °C. Agrega la fragancia a 57 °C.",
    desc_en: "Commercially known as 464 or GB464. Most popular for container candles. Natural matte surface, excellent fragrance retention. Melts 49–54 °C. Add fragrance at 57 °C.",
  },
  soyPillar: {
    density: 0.88, maxFragrancePct: 8,
    meltPointC: 58, pourTempC: 65, fragranceAddTempC: 68,
    needsSecondPour: true, containerType: "pillar",
    label_es: "Cera de soja — vela sin envase (se sostiene sola)",
    label_en: "Soy Wax — freestanding candle (holds its own shape)",
    desc_es: "Conocida comercialmente como 415 o CB-135. Mayor punto de fusión para velas sin envase. Se sostiene sola. Necesita segunda colada para rellenar hundimiento. Agrega fragancia a 68 °C.",
    desc_en: "Commercially known as 415 or CB-135. Higher melt point for freestanding candles. Holds its shape. Needs second pour for sinkholes. Add fragrance at 68 °C.",
  },
  // ── Coconut ──────────────────────────────────────────────────────────────
  coconut: {
    density: 0.89, maxFragrancePct: 10,
    meltPointC: 45, pourTempC: 50, fragranceAddTempC: 54,
    needsSecondPour: false, containerType: "container",
    label_es: "Cera de coco pura — vela en vaso (acabado cremoso)",
    label_en: "Pure Coconut Wax — container candle (creamy finish)",
    desc_es: "Conocida comercialmente como cera de coco 76°F (por su nombre de producto, no la temperatura de fusión real). Superficie cremosa, excelente hot throw. Punto de fusión bajo (45 °C). Puede presentar separación — usar a temperatura controlada. Ideal 50–60 °C de colada.",
    desc_en: "Commercially known as 76°F coconut wax (product name, not the actual melt temperature). Creamy surface, excellent hot throw. Low melt point (45 °C). May show separation — use at controlled temp. Ideal pour 50–60 °C.",
  },
  coconutApricot: {
    density: 0.88, maxFragrancePct: 12,
    meltPointC: 46, pourTempC: 52, fragranceAddTempC: 55,
    needsSecondPour: false, containerType: "container",
    label_es: "Mezcla coco-albaricoque — vela en vaso (acabado brillante)",
    label_en: "Coconut-Apricot Blend — container candle (glossy finish)",
    desc_es: "Conocida comercialmente como Coconut 83 o CX. Mezcla premium muy popular. Acabado suave y brillante, alta carga de fragancia (hasta 12%). Tiempo de curado 48 h. Colar a 52 °C.",
    desc_en: "Commercially known as Coconut 83 or CX. Very popular premium blend. Smooth glossy finish, high fragrance load (up to 12%). Cure time 48 h. Pour at 52 °C.",
  },
  // ── Palm ─────────────────────────────────────────────────────────────────
  palm: {
    density: 0.91, maxFragrancePct: 10,
    meltPointC: 54, pourTempC: 82, fragranceAddTempC: 82,
    needsSecondPour: true, containerType: "pillar",
    label_es: "Cera de palma — vela sin envase (patrón cristalino único)",
    label_en: "Palm Wax — freestanding candle (unique crystalline pattern)",
    desc_es: "Patrón cristalino o plumado único al solidificar. Para pillar y votive. Temperatura de trabajo alta (82 °C). Siempre necesita segunda colada. Sostenible: buscar certificación RSPO.",
    desc_en: "Unique crystalline or feathered pattern on solidifying. For pillar and votive. High working temp (82 °C). Always needs second pour. Sustainable: look for RSPO certification.",
  },
  // ── Paraffin ─────────────────────────────────────────────────────────────
  paraffin: {
    density: 0.93, maxFragrancePct: 10,
    meltPointC: 52, pourTempC: 68, fragranceAddTempC: 72,
    needsSecondPour: true, containerType: "both",
    label_es: "Parafina estándar — vela en vaso o sin envase (la más usada)",
    label_en: "Standard Paraffin — container or freestanding (most common)",
    desc_es: "Punto de fusión 52–54 °C. La más usada industrialmente. Resultado cristalino, excelente throw de fragancia. Temperatura óptima de mezcla: 72 °C. Siempre necesita segunda colada por contracción.",
    desc_en: "Melt point 52–54 °C. Most widely used industrially. Crystal clear result, excellent fragrance throw. Optimal mixing temp: 72 °C. Always needs second pour due to shrinkage.",
  },
  moldWax: {
    density: 0.92, maxFragrancePct: 8,
    meltPointC: 62, pourTempC: 75, fragranceAddTempC: 78,
    needsSecondPour: true, containerType: "pillar",
    label_es: "Cera de molde — vela sin envase (necesita ácido esteárico)",
    label_en: "Mold Wax — freestanding candle (needs stearic acid)",
    desc_es: "Punto de fusión 60–68 °C. Parafina de alto punto de fusión para velas en molde. Se contrae y se desmolda sola. NECESITA ácido esteárico (5–15%) para dureza y opacidad. Segunda colada obligatoria.",
    desc_en: "Melt point 60–68 °C. High-MP paraffin for molded candles. Contracts and self-releases from mold. NEEDS stearic acid (5–15%) for hardness and opacity. Second pour mandatory.",
  },
  // ── Beeswax ──────────────────────────────────────────────────────────────
  beeswax: {
    density: 0.96, maxFragrancePct: 6,
    meltPointC: 63, pourTempC: 74, fragranceAddTempC: 74,
    needsSecondPour: false, containerType: "both",
    label_es: "Cera de abeja pura — vela en vaso o sin envase (100% natural)",
    label_en: "Pure Beeswax — container or freestanding (100% natural)",
    desc_es: "La más premium y natural. Quema muy lenta y limpia. Aroma natural a miel. Sin aditivos necesarios. Colar entre 70–80 °C. Poca carga de fragancia — no competirá con el aroma natural.",
    desc_en: "The most premium and natural. Burns very slowly and cleanly. Natural honey scent. No additives needed. Pour 70–80 °C. Low fragrance load — won't compete with natural scent.",
  },
  // ── Gel ──────────────────────────────────────────────────────────────────
  gel: {
    density: 0.87, maxFragrancePct: 5,
    meltPointC: 75, pourTempC: 88, fragranceAddTempC: 88,
    needsSecondPour: false, containerType: "container",
    label_es: "Gel translúcido — vela en vaso (efecto vidrio transparente)",
    label_en: "Translucent Gel Wax — container candle (glass-clear effect)",
    desc_es: "Efecto vidrio transparente con inclusiones (flores, conchas, objetos). SOLO fragancias no polares — las polares enturbian el gel. Temperatura alta de trabajo (88 °C). Solo en vidrio.",
    desc_en: "Crystal-clear glass effect with inclusions (flowers, shells, objects). ONLY non-polar fragrances — polar ones cloud the gel. High working temp (88 °C). Glass containers only.",
  },
  // ── Blends ───────────────────────────────────────────────────────────────
  soyParaffin: {
    density: 0.90, maxFragrancePct: 10,
    meltPointC: 51, pourTempC: 63, fragranceAddTempC: 66,
    needsSecondPour: false, containerType: "container",
    label_es: "Mezcla soya-parafina — vela en vaso (buena para empezar)",
    label_en: "Soy-Paraffin Blend — container candle (good for beginners)",
    desc_es: "Proporción típica 50:50 o 60:40. Combina el aspecto natural de la soya con la resistencia y throw de la parafina. Resultado más liso que la soya pura. Muy popular para empezar. Colar a 63 °C.",
    desc_en: "Typical ratio 50:50 or 60:40. Combines soy's natural look with paraffin's performance and throw. Smoother result than pure soy. Very popular for beginners. Pour at 63 °C.",
  },
  // ── Custom ───────────────────────────────────────────────────────────────
  custom: {
    density: 0.88, maxFragrancePct: 10,
    meltPointC: 52, pourTempC: 65, fragranceAddTempC: 68,
    needsSecondPour: false, containerType: "both",
    label_es: "Cera personalizada / Mezcla propia",
    label_en: "Custom Wax / Own blend",
    desc_es: "Ingresa tus propios parámetros. Consulta la ficha técnica de tu fabricante.",
    desc_en: "Enter your own parameters. Check your supplier's technical data sheet.",
  },
};

export interface CandleCalculationResult extends CalculationResults {
  waxAmountG: number;
  fragranceAmountG: number;
  colorantAmountG: number;
  stearicAcidG: number;
  stearicAcidPct: number;
  vybarAmountG: number;
  vybarPct: number;
  secondPourG: number;
  totalVolumeML: number;
  fragranceWarning: boolean;
  fragranceMaxPct: number;
  warnings: string[];
}

export function calculateCandles(inputs: CandleInputs): CandleCalculationResult {
  const {
    moldShape,
    dimensions,
    volumeMl,
    fillPct,
    targetWeightG,
    densityGml,
    waxType,
    waxCostPerKg,
    waxMixPct,
    wax2Type,
    wax2CostPerKg,
    wax2MixPct,
    fragranceLoadPct,
    fragranceCostPerKg,
    colorantAmount,
    colorantCostPerUnit,
    stearicAcidAmount,
    stearicAcidPct,
    stearicAcidCost,
    vybarAmount,
    vybarCost,
    uvInhibitorAmount,
    uvInhibitorCost,
    wickCostPerUnit,
    productionTimeMin,
    units,
  } = inputs;

  const waxData = WAX_TYPES[waxType] ?? WAX_TYPES.soy;

  // 1. Calculate volume
  const calculatedVolumeMl =
    volumeMl > 0
      ? volumeMl
      : moldShape !== "cylinder" || Object.values(dimensions).some((v) => v > 0)
      ? calculateVolume(moldShape as any, dimensions)
      : 0;

  const effectiveVolume = calculatedVolumeMl * ((fillPct || 100) / 100);

  // 2. Calculate wax needed
  const primaryDensity = densityGml > 0 ? densityGml : waxData.density;
  const waxAmountG =
    targetWeightG > 0
      ? targetWeightG
      : calculateMaterialFromVolume(effectiveVolume, primaryDensity, 100);

  // 3. Fragrance amount
  const fragranceAmountG = waxAmountG * ((fragranceLoadPct || 0) / 100);

  // 4. Stearic acid
  const stearicPctVal = stearicAcidPct || 0;
  const stearicAcidG = stearicPctVal > 0
    ? waxAmountG * stearicPctVal / 100
    : stearicAcidAmount || 0;
  const stearicAcidPctCalc = waxAmountG > 0 ? (stearicAcidG / waxAmountG) * 100 : 0;

  // Second pour for pillar/mold wax types
  const needsSecondPour = waxData.needsSecondPour || (inputs as any).candleType === "molded";
  const secondPourG = needsSecondPour ? waxAmountG * 0.15 : 0;

  // 5. Costs per unit
  const waxCostPerG = (waxCostPerKg || 0) / 1000;
  const wax2CostPerG = (wax2CostPerKg || 0) / 1000;
  const fragranceCostPerG = (fragranceCostPerKg || 0) / 1000;

  const primaryWaxPct = (waxMixPct || 100) / 100;
  const secondaryWaxPct = (wax2MixPct || 0) / 100;

  const waxCost =
    waxAmountG * primaryWaxPct * waxCostPerG +
    waxAmountG * secondaryWaxPct * wax2CostPerG;

  const fragranceCost = fragranceAmountG * fragranceCostPerG;
  const colorantCost = (colorantAmount || 0) * (colorantCostPerUnit || 0);
  const stearicCost = stearicAcidG * (stearicAcidCost || 0) / 1000;
  const vybarCostTotal = (vybarAmount || 0) * (vybarCost || 0) / 1000;
  const uvCost = (uvInhibitorAmount || 0) * (uvInhibitorCost || 0) / 1000;
  const wickCost = wickCostPerUnit || 0;

  const materialCostPerUnit =
    waxCost + fragranceCost + colorantCost + stearicCost + vybarCostTotal + uvCost + wickCost;

  const costItems: CostItem[] = [
    { name: "Cera / Wax", cost: waxCost, percentage: 0 },
    { name: "Fragancia / Fragrance", cost: fragranceCost, percentage: 0 },
    { name: "Colorante / Colorant", cost: colorantCost, percentage: 0 },
    { name: "Pabilo / Wick", cost: wickCost, percentage: 0 },
    { name: "Aditivos / Additives", cost: stearicCost + vybarCostTotal + uvCost, percentage: 0 },
  ].filter((i) => i.cost > 0);

  // Warnings
  const warnings: string[] = [];
  const maxFragrance = waxData.maxFragrancePct;
  const fragranceWarning = fragranceLoadPct > maxFragrance;
  if (fragranceWarning) warnings.push("highFragrance");
  if ((inputs.wastePct || 0) > 15) warnings.push("highWaste");
  if ((waxType === "moldWax" || waxType === "soyPillar") && stearicAcidPctCalc === 0 && waxType === "moldWax") warnings.push("noStearicMoldWax");
  if (waxType === "moldWax" && stearicAcidPctCalc > 0 && stearicAcidPctCalc < 5) warnings.push("stearicLow");
  if (stearicAcidPctCalc > 20) warnings.push("stearicHigh");

  const vybarPct = waxAmountG > 0 ? ((vybarAmount || 0) / waxAmountG) * 100 : 0;
  if (vybarPct > 1.5) warnings.push("vybarHigh");
  if (vybarPct > 0 && vybarPct < 0.5) warnings.push("vybarLow");

  if (waxType === "gel" && (fragranceLoadPct || 0) > 3) warnings.push("gelFragrance");

  const results = calculateResults(
    materialCostPerUnit,
    inputs,
    costItems,
    (productionTimeMin || 30) * units
  );

  return {
    ...results,
    waxAmountG,
    fragranceAmountG,
    colorantAmountG: colorantAmount || 0,
    stearicAcidG,
    stearicAcidPct: stearicAcidPctCalc,
    vybarAmountG: vybarAmount || 0,
    vybarPct,
    secondPourG,
    totalVolumeML: effectiveVolume,
    fragranceWarning,
    fragranceMaxPct: maxFragrance,
    warnings,
  };
}
