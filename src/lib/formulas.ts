import { createClient } from "@/lib/supabase/client";
import type { CalculationResults, Locale } from "@/types";

export type FormulaCategory = "candles" | "resin" | "soap" | "concrete" | "plaster" | "multi";

interface SaveFormulaParams {
  category: FormulaCategory;
  productName: string | null | undefined;
  units: number;
  batchSize: number;
  inputData: unknown;
  results: CalculationResults;
  locale: Locale;
}

/**
 * Saves a calculator's "Guardar fórmula" action: creates a row in `formulas`
 * (with its cost breakdown in `formula_materials`) and links it from a new
 * `calculations` row, so the result shows up both in the Formulas library and
 * in the dashboard's recent-calculations feed.
 */
export async function saveFormula({
  category, productName, units, batchSize, inputData, results, locale,
}: SaveFormulaParams): Promise<{ ok: true } | { ok: false }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: formula, error: formulaError } = await supabase
    .from("formulas")
    .insert({
      user_id: user.id,
      name: productName || category,
      category,
    })
    .select()
    .single();

  if (formulaError || !formula) return { ok: false };

  if (results.costDistribution.length > 0) {
    await supabase.from("formula_materials").insert(
      results.costDistribution.map((item) => ({
        formula_id: formula.id,
        material_name: item.name,
        amount: item.percentage,
        unit: "%",
        cost: item.cost,
      }))
    );
  }

  await supabase.from("calculations").insert({
    user_id: user.id,
    formula_id: formula.id,
    product_name: productName || null,
    category,
    units,
    batch_size: batchSize,
    input_data: inputData,
    results,
    locale,
  });

  return { ok: true };
}
