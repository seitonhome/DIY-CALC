import type { CalculationResults, CostItem, CommonCalcInputs } from "@/types";

export interface CostBreakdown {
  materialCost: number;
  laborCost: number;
  energyCost: number;
  packagingCost: number;
  shippingCost: number;
  platformFee: number;
  affiliateFee: number;
  taxAmount: number;
  wasteCostImpact: number;
}

/**
 * Core calculation engine shared across all calculator categories.
 * Accepts material cost per unit and common inputs, returns full results.
 */
export function calculateResults(
  materialCostPerUnit: number,
  inputs: CommonCalcInputs,
  costItems: CostItem[],
  productionTimeMin: number
): CalculationResults {
  const {
    units,
    wastePct,
    laborCostPerHour,
    laborHours,
    energyCost,
    packagingCost,
    labelCost,
    boxCost,
    shippingCost,
    taxPct,
    platformFeePct,
    affiliateFeePct,
    desiredMarginPct,
  } = inputs;

  // Apply waste to material cost
  const wasteFactor = 1 + (wastePct || 0) / 100;
  const adjustedMaterialCost = materialCostPerUnit * wasteFactor;

  // Labor per unit
  const laborPerUnit = laborHours > 0
    ? (laborCostPerHour * laborHours) / Math.max(units, 1)
    : 0;

  // Fixed costs per unit
  const packagingPerUnit = (packagingCost || 0) + (labelCost || 0) + (boxCost || 0);
  const energyPerUnit = (energyCost || 0) / Math.max(units, 1);
  const shippingPerUnit = shippingCost || 0;

  // Total production cost per unit (before fees and taxes)
  const productionCostPerUnit =
    adjustedMaterialCost + laborPerUnit + energyPerUnit + packagingPerUnit;

  // Platform and affiliate fees are applied on selling price, so we need to
  // solve for price that gives desired margin after fees.
  // Price = Cost / (1 - margin - platform_fee - affiliate_fee - tax)
  const feesAndMarginPct =
    (desiredMarginPct || 30) / 100 +
    (platformFeePct || 0) / 100 +
    (affiliateFeePct || 0) / 100 +
    (taxPct || 0) / 100;

  const divisor = Math.max(1 - feesAndMarginPct, 0.01);
  const suggestedPrice = (productionCostPerUnit + shippingPerUnit) / divisor;

  // Wholesale: 2x production cost minimum, or cost / (1 - 20% margin)
  const wholesalePrice = Math.max(
    productionCostPerUnit * 2,
    productionCostPerUnit / 0.8
  );

  // Gross margin = (price - material cost) / price
  const grossMargin =
    suggestedPrice > 0
      ? ((suggestedPrice - adjustedMaterialCost) / suggestedPrice) * 100
      : 0;

  // Net margin = (price - total cost) / price
  const totalCostPerUnit =
    productionCostPerUnit +
    shippingPerUnit +
    suggestedPrice * (platformFeePct || 0) / 100 +
    suggestedPrice * (affiliateFeePct || 0) / 100 +
    suggestedPrice * (taxPct || 0) / 100;

  const netMargin =
    suggestedPrice > 0
      ? ((suggestedPrice - totalCostPerUnit) / suggestedPrice) * 100
      : 0;

  const profitPerUnit = suggestedPrice - totalCostPerUnit;
  const profitPerBatch = profitPerUnit * (inputs.batchSize || units);
  const costPerBatch = productionCostPerUnit * (inputs.batchSize || units);

  // Break-even: number of units to recover fixed investment
  const breakEvenUnits =
    profitPerUnit > 0 ? Math.ceil(productionCostPerUnit / profitPerUnit) : 999;

  // Risk level based on net margin
  const riskLevel: "low" | "medium" | "high" =
    netMargin >= 25 ? "low" : netMargin >= 12 ? "medium" : "high";

  // Generate automatic recommendation
  const recommendation = getRecommendation({
    netMargin,
    wastePct: wastePct || 0,
    packagingCostShare: packagingPerUnit / productionCostPerUnit,
    laborIncluded: laborCostPerHour > 0,
    platformFeePct: platformFeePct || 0,
  });

  return {
    totalMaterialCost: adjustedMaterialCost * units,
    totalProductionCost: productionCostPerUnit * units,
    costPerUnit: productionCostPerUnit,
    costPerBatch,
    suggestedPrice,
    wholesalePrice,
    grossMargin,
    netMargin,
    profitPerUnit,
    profitPerBatch,
    breakEvenUnits,
    profitability: netMargin,
    riskLevel,
    recommendation,
    costDistribution: enrichCostItems(costItems, productionCostPerUnit),
    mostExpensiveMaterial: costItems[0]?.name ?? "",
    productionTimeMinutes: productionTimeMin,
  };
}

function enrichCostItems(items: CostItem[], totalCost: number): CostItem[] {
  const sorted = [...items].sort((a, b) => b.cost - a.cost);
  return sorted.map((item, i) => ({
    ...item,
    percentage: totalCost > 0 ? (item.cost / totalCost) * 100 : 0,
    color: CHART_COLORS[i % CHART_COLORS.length],
  }));
}

const CHART_COLORS = [
  "#92400e", "#d97706", "#65a30d", "#0891b2",
  "#7c3aed", "#db2777", "#dc2626", "#059669",
  "#0284c7", "#9333ea",
];

function getRecommendation(params: {
  netMargin: number;
  wastePct: number;
  packagingCostShare: number;
  laborIncluded: boolean;
  platformFeePct: number;
}): string {
  const { netMargin, wastePct, packagingCostShare, laborIncluded, platformFeePct } = params;

  if (!laborIncluded) return "noLabor";
  if (netMargin < 0) return "reviewBeforeSell";
  if (netMargin < 20) return "lowMargin";
  if (wastePct > 15) return "highWaste";
  if (packagingCostShare > 0.3) return "highPackaging";
  if (platformFeePct > 15 && netMargin < 35) return "notMarketplace";
  return "healthyMargin";
}

// Saponification values (NaOH g per g of oil)
export const SAP_VALUES: Record<string, number> = {
  olive: 0.134,        // Aceite de oliva — suavidad, poca espuma
  coconut: 0.190,      // Aceite de coco — espuma dura y abundante
  palm: 0.141,         // Aceite de palma — dureza del jabón
  shea: 0.128,         // Manteca de karité — acondicionador
  cocoa: 0.137,        // Manteca de cacao — dureza y suavidad
  castor: 0.128,       // Aceite de ricino — espuma cremosa y estable (usar 5–15%)
  sunflower: 0.134,    // Aceite de girasol — acondicionador ligero
  avocado: 0.133,      // Aceite de aguacate — nutrición profunda
  riceBran: 0.128,     // Aceite de salvado de arroz — suavidad, antioxidante
  jojoba: 0.069,       // Aceite de jojoba — sérum líquido, supergraso
  hemp: 0.135,         // Aceite de cáñamo — omega 3/6
  sweetAlmond: 0.136,  // Aceite de almendra dulce — suavidad
  lard: 0.140,         // Manteca de cerdo / sebo — burbuja cremosa, dureza
  tallow: 0.140,       // Sebo de vaca — espuma densa, jabón firme
  linseed: 0.135,      // Aceite de linaza — omega 3
  neem: 0.139,         // Aceite de neem — antibacteriano, cosmética
};

export function calculateLye(oils: Record<string, number>, totalOilG: number, superfattPct: number): number {
  let totalSAP = 0;
  for (const [oil, pct] of Object.entries(oils)) {
    const sapVal = SAP_VALUES[oil] ?? 0.134;
    totalSAP += (pct / 100) * sapVal;
  }
  const lyeNeeded = totalOilG * totalSAP;
  const withSuperfat = lyeNeeded * (1 - superfattPct / 100);
  return Math.round(withSuperfat * 100) / 100;
}

export function calculateWaterForLye(lyeG: number, lyeConcentrationPct: number): number {
  const concentration = lyeConcentrationPct / 100;
  return Math.round((lyeG / concentration - lyeG) * 100) / 100;
}
