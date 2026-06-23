import type { MultiInputs, MultiMaterialComponent, CalculationResults, CostItem } from "@/types";
import { calculateResults } from "./core";

export interface MultiCalculationResult extends CalculationResults {
  components: ComponentAnalysis[];
  mostExpensiveComponent: string;
  mostTimeConsumingComponent: string;
}

export interface ComponentAnalysis {
  id: string;
  name: string;
  type: string;
  costPerUnit: number;
  adjustedCost: number; // after waste
  costShare: number; // percentage of total
  productionTimeMin: number;
  wastePct: number;
}

export function calculateMulti(inputs: MultiInputs): MultiCalculationResult {
  const { components, units } = inputs;

  if (!components || components.length === 0) {
    return {
      totalMaterialCost: 0,
      totalProductionCost: 0,
      costPerUnit: 0,
      costPerBatch: 0,
      suggestedPrice: 0,
      wholesalePrice: 0,
      grossMargin: 0,
      netMargin: 0,
      profitPerUnit: 0,
      profitPerBatch: 0,
      breakEvenUnits: 0,
      profitability: 0,
      riskLevel: "high",
      recommendation: "reviewBeforeSell",
      costDistribution: [],
      mostExpensiveMaterial: "",
      productionTimeMinutes: 0,
      components: [],
      mostExpensiveComponent: "",
      mostTimeConsumingComponent: "",
    };
  }

  const componentAnalysis: ComponentAnalysis[] = components.map((comp) => {
    const wasteFactor = 1 + (comp.wastePct || 0) / 100;
    const adjustedCost = comp.costPerUnit * wasteFactor;
    return {
      id: comp.id,
      name: comp.name,
      type: comp.type,
      costPerUnit: comp.costPerUnit,
      adjustedCost,
      costShare: 0,
      productionTimeMin: comp.productionTimeMin,
      wastePct: comp.wastePct,
    };
  });

  const totalAdjustedCost = componentAnalysis.reduce((s, c) => s + c.adjustedCost, 0);
  const totalProductionTime = componentAnalysis.reduce((s, c) => s + c.productionTimeMin, 0);

  // Calculate cost share percentages
  componentAnalysis.forEach((c) => {
    c.costShare = totalAdjustedCost > 0 ? (c.adjustedCost / totalAdjustedCost) * 100 : 0;
  });

  const costItems: CostItem[] = componentAnalysis.map((c) => ({
    name: c.name,
    cost: c.adjustedCost,
    percentage: c.costShare,
  }));

  const mostExpensive = componentAnalysis.reduce((a, b) => a.adjustedCost > b.adjustedCost ? a : b);
  const mostTimely = componentAnalysis.reduce((a, b) => a.productionTimeMin > b.productionTimeMin ? a : b);

  const results = calculateResults(
    totalAdjustedCost,
    inputs,
    costItems,
    totalProductionTime * (units || 1)
  );

  return {
    ...results,
    components: componentAnalysis,
    mostExpensiveComponent: mostExpensive.name,
    mostTimeConsumingComponent: mostTimely.name,
  };
}
