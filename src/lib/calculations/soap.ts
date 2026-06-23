import type { SoapInputs, CalculationResults, CostItem } from "@/types";
import { calculateResults, calculateLye, calculateWaterForLye, SAP_VALUES } from "./core";

// ─── Soap type catalog ─────────────────────────────────────────────────────
export const SOAP_TYPES: Record<string, {
  label_es: string; label_en: string;
  desc_es: string; desc_en: string;
  isSaponified: boolean;
  curingDays: number;
  maxFragrancePct: number;
}> = {
  meltPour: {
    label_es: "Glicerina en bloque (sin sosa, fácil)",
    label_en: "Glycerin Block (no lye, easy)",
    desc_es: "La forma más fácil de hacer jabón. Compras la base ya lista, la derrites a 60–70 °C, agregas color y olor, y la viertes en el molde. Sin sosa ni químicos peligrosos. Lista en 1–2 horas.",
    desc_en: "Easiest way to make soap. Buy a ready base, melt at 60–70 °C, add color and fragrance, pour into mold. No lye or hazardous chemicals. Ready in 1–2 hours.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 3,
  },
  clearGlycerin: {
    label_es: "Glicerina transparente (cristal / jelly)",
    label_en: "Clear Glycerin (crystal / jelly)",
    desc_es: "Base glicerina que queda transparente como vidrio. Perfecta para meter flores, confeti, figuras o capas de colores. Se derrite a 60–70 °C igual que la glicerina normal. Usa colorantes transparentes para no opacarla.",
    desc_en: "Glycerin base that stays crystal clear. Perfect for embedding flowers, confetti, figures or color layers. Melts at 60–70 °C like regular glycerin. Use transparent colorants to keep it clear.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 3,
  },
  goatMilk: {
    label_es: "Glicerina leche de cabra",
    label_en: "Goat Milk Glycerin Base",
    desc_es: "Base glicerina con leche de cabra incorporada. Queda de color crema, muy suave para piel sensible y bebés. Se trabaja igual que la glicerina normal: derrite a 60–70 °C, agrega olor y color, vierte en molde.",
    desc_en: "Glycerin base with goat milk already in it. Cream colored, very gentle for sensitive skin and babies. Works just like regular glycerin: melt at 60–70 °C, add fragrance and color, pour into mold.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 3,
  },
  exfoliating: {
    label_es: "Glicerina con exfoliante (avena, café, sal…)",
    label_en: "Glycerin with Exfoliant (oats, coffee, salt…)",
    desc_es: "Base glicerina a la que se le agregan exfoliantes: avena, café molido, sal de mar, azúcar, arena volcánica, semillas de amapola. Hasta 30–40% de exfoliante en peso. Grano fino (avena, azúcar) = suave; grano grueso (sal, café) = intenso.",
    desc_en: "Glycerin base with added exfoliants: oats, ground coffee, sea salt, sugar, volcanic sand, poppy seeds. Up to 30–40% exfoliant by weight. Fine grain (oats, sugar) = gentle; coarse (salt, coffee) = intense.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 3,
  },
  coldProcess: {
    label_es: "Jabón artesanal con sosa (proceso frío)",
    label_en: "Handmade Soap with Lye (cold process)",
    desc_es: "Mezclas aceites con sosa cáustica (NaOH) a temperatura ambiente. La reacción genera su propio calor. Necesita cálculo exacto de sosa para que no sobre. Curado: 4–6 semanas antes de usar.",
    desc_en: "Mix oils with lye (NaOH) at room temperature. The reaction generates its own heat. Requires exact lye calculation. Curing: 4–6 weeks before use.",
    isSaponified: true, curingDays: 28, maxFragrancePct: 3,
  },
  hotProcess: {
    label_es: "Jabón artesanal cocinado (proceso caliente)",
    label_en: "Cooked Handmade Soap (hot process)",
    desc_es: "Igual que el proceso frío pero la masa se cocina en olla o en slow cooker hasta que ya no queda sosa sin reaccionar. Se puede usar en 1–7 días. Textura más rústica, como masa de plastilina.",
    desc_en: "Same as cold process but the batter is cooked in a pot or slow cooker until no unreacted lye remains. Can be used in 1–7 days. More rustic, clay-like texture.",
    isSaponified: true, curingDays: 7, maxFragrancePct: 3,
  },
  milkSoap: {
    label_es: "Jabón de leche (leche de cabra, coco o avena)",
    label_en: "Milk Soap (goat, coconut or oat milk)",
    desc_es: "Proceso frío pero usando leche congelada en lugar de agua para disolver la sosa. La leche le da cremosidad, proteínas y suavidad extra. La mezcla calienta más — usar la leche muy fría o congelada. La sosa siempre se agrega a la leche, nunca al revés.",
    desc_en: "Cold process but using frozen milk instead of water to dissolve the lye. Milk adds creaminess, proteins and extra softness. Mix heats more — use very cold or frozen milk. Always add lye to milk, never the reverse.",
    isSaponified: true, curingDays: 28, maxFragrancePct: 3,
  },
  liquid: {
    label_es: "Jabón líquido (con sosa potásica KOH)",
    label_en: "Liquid Soap (with KOH potassium lye)",
    desc_es: "En lugar de sosa normal (NaOH) se usa sosa potásica (KOH). El resultado es una pasta espesa que se diluye con agua hasta conseguir la consistencia de jabón líquido. El aceite de ricino (15–30%) es clave para que espume bien.",
    desc_en: "Instead of regular lye (NaOH), potassium hydroxide (KOH) is used. Result is a thick paste diluted with water to liquid soap consistency. Castor oil (15–30%) is key for good lather.",
    isSaponified: true, curingDays: 7, maxFragrancePct: 2,
  },
  castile: {
    label_es: "Jabón de Castilla (solo aceite de oliva)",
    label_en: "Castile Soap (100% olive oil)",
    desc_es: "Solo aceite de oliva + sosa + agua. El jabón más suave que existe, ideal para piel sensible y bebés. Espuma poca pero muy cremosa. Necesita curado largo: mínimo 6 meses para que quede perfecto.",
    desc_en: "Only olive oil + lye + water. The gentlest soap that exists, ideal for sensitive skin and babies. Low but very creamy lather. Needs long cure: minimum 6 months for best quality.",
    isSaponified: true, curingDays: 180, maxFragrancePct: 3,
  },
  saltBar: {
    label_es: "Jabón de sal marina (con sosa)",
    label_en: "Sea Salt Bar (with lye)",
    desc_es: "80–100% aceite de coco + sal marina gruesa (igual peso que los aceites o más). Sin supergrasa o máximo 2%. OJO: endurece en 30–60 minutos — hay que cortar antes de que se endurezca. Deja la piel sedosa. Solo 1 semana de curado.",
    desc_en: "80–100% coconut oil + coarse sea salt (same weight as oils or more). No superfat or max 2%. NOTE: hardens in 30–60 min — must cut before it sets. Leaves skin silky. Only 1 week cure.",
    isSaponified: true, curingDays: 7, maxFragrancePct: 2,
  },
  syndet: {
    label_es: "Champú sólido / barra sin sosa (syndet)",
    label_en: "Solid Shampoo / No-lye Bar (syndet)",
    desc_es: "Base sintética de pH neutro (5.5–6.5), sin sosa. Ideal para cabello y piel sensible. Se trabaja igual que la glicerina: derrite y vierte. Ingredientes activos: SCI, SCS, betaína de coco.",
    desc_en: "Synthetic pH-neutral base (5.5–6.5), no lye. Ideal for hair and sensitive skin. Works like glycerin: melt and pour. Active ingredients: SCI, SCS, cocamidopropyl betaine.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 2,
  },
  shampooBar: {
    label_es: "Champú sólido glicerina (sin sosa)",
    label_en: "Solid Shampoo Glycerin (no lye)",
    desc_es: "Base syndet o glicerina especial para cabello. Sin sosa. pH controlado para no dañar el cuero cabelludo. Se derrite y vierte en molde igual que la glicerina. Puede incluir pantenol, proteínas de trigo o aceite de argán.",
    desc_en: "Syndet or glycerin base specially for hair. No lye. pH controlled to protect the scalp. Melt and pour like glycerin. Can include panthenol, wheat proteins or argan oil.",
    isSaponified: false, curingDays: 0, maxFragrancePct: 2,
  },
  shampooBarCP: {
    label_es: "Champú sólido con sosa (proceso frío)",
    label_en: "Solid Shampoo with Lye (cold process)",
    desc_es: "Proceso frío con bastante aceite de ricino (15–20%) y coco (40–50%) para lavar el cabello. La supergrasa debe ser baja (0–3%) — si queda mucho aceite sin saponificar, el cabello queda pesado. Curado 4 semanas mínimo.",
    desc_en: "Cold process with high castor oil (15–20%) and coconut (40–50%) for hair washing. Superfat must be low (0–3%) — excess unsaponified oil weighs hair down. Minimum 4 weeks cure.",
    isSaponified: true, curingDays: 28, maxFragrancePct: 2,
  },
};

// ─── Oil property reference (for artisans) ────────────────────────────────
export const OIL_PROPERTIES: Record<string, {
  label_es: string; label_en: string;
  role_es: string; role_en: string;
  recommendedPct: string;
}> = {
  olive:      { label_es: "Aceite de oliva",    label_en: "Olive oil",       role_es: "Suavidad, acondicionador, poca espuma",          role_en: "Softness, conditioning, low lather",        recommendedPct: "30–70%" },
  coconut:    { label_es: "Aceite de coco",     label_en: "Coconut oil",     role_es: "Espuma dura y abundante, dureza del jabón",      role_en: "Hard abundant lather, bar hardness",        recommendedPct: "20–35%" },
  palm:       { label_es: "Aceite de palma",    label_en: "Palm oil",        role_es: "Dureza, estabilidad, espuma cremosa",            role_en: "Hardness, stability, creamy lather",        recommendedPct: "15–30%" },
  castor:     { label_es: "Aceite de ricino",   label_en: "Castor oil",      role_es: "Espuma cremosa y estable — CLAVE para espumar",  role_en: "Creamy stable lather — KEY for bubbles",   recommendedPct: "5–15%" },
  shea:       { label_es: "Manteca de karité",  label_en: "Shea butter",     role_es: "Acondicionador premium, cremosidad",             role_en: "Premium conditioning, creaminess",          recommendedPct: "5–15%" },
  cocoa:      { label_es: "Manteca de cacao",   label_en: "Cocoa butter",    role_es: "Dureza, suavidad, leve aroma a chocolate",       role_en: "Hardness, smoothness, slight cocoa scent",  recommendedPct: "5–15%" },
  lard:       { label_es: "Manteca de cerdo",   label_en: "Lard",            role_es: "Espuma cremosa densa, jabón duro y blanco",      role_en: "Dense creamy lather, hard white bar",       recommendedPct: "20–50%" },
  tallow:     { label_es: "Sebo de vaca",       label_en: "Tallow",          role_es: "Espuma abundante, dureza extrema — tradicional", role_en: "Abundant lather, extreme hardness — traditional", recommendedPct: "20–50%" },
  sunflower:  { label_es: "Aceite de girasol",  label_en: "Sunflower oil",   role_es: "Acondicionador ligero, económico",               role_en: "Light conditioning, economical",            recommendedPct: "10–20%" },
  avocado:    { label_es: "Aceite de aguacate", label_en: "Avocado oil",     role_es: "Nutrición profunda para pieles secas",           role_en: "Deep nourishment for dry skin",             recommendedPct: "5–20%" },
  riceBran:   { label_es: "Aceite salvado arroz", label_en: "Rice bran oil", role_es: "Suavidad, vitamina E, antioxidante",             role_en: "Softness, vitamin E, antioxidant",          recommendedPct: "10–25%" },
  sweetAlmond:{ label_es: "Aceite almendra dulce", label_en: "Sweet almond", role_es: "Suavidad suave, para pieles delicadas",          role_en: "Gentle softness, for delicate skin",        recommendedPct: "10–20%" },
};

export interface SoapCalculationResult extends CalculationResults {
  lyeAmountG: number;
  waterAmountG: number;
  totalOilsG: number;
  warnings: string[];
  isSaponified: boolean;
}

const SAPONIFIED_TYPES = ["coldProcess", "hotProcess", "liquid", "castile", "shampooBarCP", "saltBar", "milkSoap"];

export function calculateSoap(inputs: SoapInputs & {
  castorPct?: number; lardPct?: number; tallowPct?: number;
  sunflowerPct?: number; avocadoPct?: number; riceBranPct?: number; sweetAlmondPct?: number;
}): SoapCalculationResult {
  const {
    soapType,
    baseCostPerKg,
    baseAmountG,
    olivePct,
    coconutPct,
    palmPct,
    sheaPct,
    cocoaPct,
    otherOilsPct,
    oilsCostPerKg,
    superfattPct,
    lyeConcentrationPct,
    fragrancePct,
    fragranceCostPerKg,
    essentialOilPct,
    essentialOilCostPerKg,
    colorantCost,
    exfoliantCost,
    additivesCost,
    targetWeightG,
    units,
    productionTimeMin,
    castorPct,
    lardPct,
    tallowPct,
    sunflowerPct,
    avocadoPct,
    riceBranPct,
    sweetAlmondPct,
  } = inputs;

  const isSaponified = SAPONIFIED_TYPES.includes(soapType);
  const targetG = targetWeightG || baseAmountG || 500;

  let materialCostPerUnit = 0;
  let lyeAmountG = 0;
  let waterAmountG = 0;
  let totalOilsG = 0;
  const warnings: string[] = [];
  const costItems: CostItem[] = [];

  if (isSaponified) {
    totalOilsG = targetG;
    const oilBlend: Record<string, number> = {
      olive:      olivePct      || 0,
      coconut:    coconutPct    || 0,
      palm:       palmPct       || 0,
      shea:       sheaPct       || 0,
      cocoa:      cocoaPct      || 0,
      castor:     castorPct     || 0,
      lard:       lardPct       || 0,
      tallow:     tallowPct     || 0,
      sunflower:  sunflowerPct  || 0,
      avocado:    avocadoPct    || 0,
      riceBran:   riceBranPct   || 0,
      sweetAlmond:sweetAlmondPct|| 0,
      other:      otherOilsPct  || 0,
    };

    // KOH adjustment for liquid soap (KOH purity ~90%, NaOH purity ~99%)
    const isLiquid = soapType === "liquid";
    lyeAmountG = calculateLye(oilBlend, totalOilsG, superfattPct || 5);
    if (isLiquid) lyeAmountG = lyeAmountG * (0.134 / 0.090) * 1.40; // NaOH→KOH conversion × purity

    waterAmountG = calculateWaterForLye(lyeAmountG, lyeConcentrationPct || 38);

    const totalOilPct = Object.values(oilBlend).reduce((s, v) => s + v, 0);
    if (totalOilPct > 101) warnings.push("oilPctOver100");
    if (totalOilPct < 99 && totalOilPct > 0) warnings.push("oilPctUnder100");
    if ((castorPct || 0) > 15) warnings.push("castorHigh");
    if (superfattPct > 10) warnings.push("highSuperfat");
    if (isLiquid && (superfattPct || 0) > 3) warnings.push("liquidSoapHighSuperfat");

    const oilsCost = totalOilsG * ((oilsCostPerKg || 0) / 1000);
    const lyeCost = lyeAmountG * 0.003;
    materialCostPerUnit = oilsCost + lyeCost;
    costItems.push(
      { name: "Aceites / Oils", cost: oilsCost, percentage: 0 },
      { name: "Sosa / Lye", cost: lyeCost, percentage: 0 }
    );
  } else {
    const baseCost = targetG * ((baseCostPerKg || 0) / 1000);
    materialCostPerUnit = baseCost;
    costItems.push({ name: "Base de jabón / Soap base", cost: baseCost, percentage: 0 });
  }

  const fragranceCost = targetG * ((fragrancePct || 0) / 100) * ((fragranceCostPerKg || 0) / 1000);
  const eoCost = targetG * ((essentialOilPct || 0) / 100) * ((essentialOilCostPerKg || 0) / 1000);
  materialCostPerUnit += fragranceCost + eoCost + (colorantCost || 0) + (exfoliantCost || 0) + (additivesCost || 0);

  if (fragranceCost > 0) costItems.push({ name: "Fragancia / Fragrance", cost: fragranceCost, percentage: 0 });
  if (eoCost > 0) costItems.push({ name: "Aceite esencial / EO", cost: eoCost, percentage: 0 });
  if ((colorantCost || 0) > 0) costItems.push({ name: "Colorante / Colorant", cost: colorantCost, percentage: 0 });

  const results = calculateResults(
    materialCostPerUnit,
    inputs,
    costItems,
    (productionTimeMin || 45) * units
  );

  return { ...results, lyeAmountG, waterAmountG, totalOilsG, warnings, isSaponified };
}
