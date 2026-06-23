export type Locale = "es" | "en";
export type Theme = "light" | "dark" | "system";
export type Units = "metric" | "imperial";
export type LicenseStatus = "active" | "expired" | "blocked" | "demo";
export type LicensePlan = "free" | "premium" | "admin";
export type UserRole = "user" | "admin";
export type CalculatorCategory =
  | "candles"
  | "resin"
  | "soap"
  | "concrete"
  | "plaster"
  | "multi";
export type ExportType = "pdf" | "csv" | "excel";
export type CodeStatus = "unused" | "used" | "blocked" | "expired";

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  preferred_language: Locale;
  preferred_currency: string;
  preferred_units: Units;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  user_id: string;
  activation_code_id: string | null;
  status: LicenseStatus;
  plan: LicensePlan;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ActivationCode {
  id: string;
  code: string;
  status: CodeStatus;
  used_by: string | null;
  used_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  user_id: string;
  name: string;
  category: string;
  purchase_unit: string;
  purchase_qty: number;
  price_paid: number;
  supplier: string | null;
  purchase_date: string | null;
  cost_per_gram: number;
  cost_per_ml: number | null;
  cost_per_unit: number | null;
  stock_qty: number;
  waste_pct: number;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Mold {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  shape: string | null;
  dimensions: Record<string, number>;
  volume_ml: number | null;
  capacity: string | null;
  mold_material: string | null;
  cavities: number;
  mold_cost: number;
  estimated_uses: number;
  amortized_cost_per_use: number;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Formula {
  id: string;
  user_id: string;
  name: string;
  category: CalculatorCategory;
  version: string;
  description: string | null;
  notes: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  formula_materials?: FormulaMaterial[];
}

export interface FormulaMaterial {
  id: string;
  formula_id: string;
  material_id: string | null;
  material_name: string;
  amount: number;
  unit: string;
  percentage: number | null;
  cost: number;
  notes: string | null;
  created_at: string;
}

export interface Calculation {
  id: string;
  user_id: string;
  formula_id: string | null;
  product_name: string | null;
  category: CalculatorCategory;
  units: number;
  batch_size: number;
  input_data: Record<string, unknown>;
  results: CalculationResults;
  locale: Locale;
  created_at: string;
  updated_at: string;
}

export interface CalculationResults {
  totalMaterialCost: number;
  totalProductionCost: number;
  costPerUnit: number;
  costPerBatch: number;
  suggestedPrice: number;
  wholesalePrice: number;
  grossMargin: number;
  netMargin: number;
  profitPerUnit: number;
  profitPerBatch: number;
  breakEvenUnits: number;
  profitability: number;
  riskLevel: "low" | "medium" | "high";
  recommendation: string;
  costDistribution: CostItem[];
  mostExpensiveMaterial: string;
  productionTimeMinutes: number;
}

export interface CostItem {
  name: string;
  cost: number;
  percentage: number;
  color?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string | null;
  formula_id: string | null;
  cost_per_unit: number;
  suggested_price: number;
  wholesale_price: number;
  gross_margin: number;
  net_margin: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ── Calculator input types ──────────────────────────────────

export interface CommonCalcInputs {
  productName: string;
  units: number;
  batchSize: number;
  wastePct: number;
  laborCostPerHour: number;
  laborHours: number;
  energyCost: number;
  packagingCost: number;
  labelCost: number;
  boxCost: number;
  shippingCost: number;
  taxPct: number;
  platformFeePct: number;
  affiliateFeePct: number;
  desiredMarginPct: number;
  productionTimeMin?: number;
  notes: string;
  currency: string;
}

export interface CandleInputs extends CommonCalcInputs {
  candleType: string;
  moldShape: string;
  dimensions: Record<string, number>;
  volumeMl: number;
  fillPct: number;
  targetWeightG: number;
  densityGml: number;
  waxType: string;
  waxCostPerKg: number;
  waxMixPct: number;
  wax2Type?: string;
  wax2CostPerKg?: number;
  wax2MixPct?: number;
  fragranceLoadPct: number;
  fragranceCostPerKg: number;
  colorantAmount: number;
  colorantCostPerUnit: number;
  stearicAcidAmount: number;
  stearicAcidPct: number;
  stearicAcidCost: number;
  vybarType: string;
  vybarAmount: number;
  vybarCost: number;
  uvInhibitorAmount: number;
  uvInhibitorCost: number;
  wickType: string;
  wickCostPerUnit: number;
  curingTimeHours: number;
  productionTimeMin: number;
}

export interface ResinInputs extends CommonCalcInputs {
  projectType: string;
  resinType: string;
  mixRatio: string;
  partAPct: number;
  partBPct: number;
  costPerKgA: number;
  costPerKgB: number;
  densityGml: number;
  moldVolumeMl: number;
  coverageAreaCm2: number;
  thicknessMm: number;
  layers: number;
  timeBetweenLayersH: number;
  pigmentsCost: number;
  micasCost: number;
  alcoholInksCost: number;
  glitterCost: number;
  goldLeafCost: number;
  inclusionsCost: number;
  sealantCost: number;
  sandpaperCost: number;
  polishCost: number;
  heatGunCost: number;
  curingTimeHours: number;
  mixLossPct: number;
}

export interface SoapInputs extends CommonCalcInputs {
  soapType: string;
  baseCostPerKg: number;
  baseAmountG: number;
  olivePct: number;
  coconutPct: number;
  palmPct: number;
  sheaPct: number;
  cocoaPct: number;
  otherOilsPct: number;
  oilsCostPerKg: number;
  superfattPct: number;
  lyeConcentrationPct: number;
  fragrancePct: number;
  fragranceCostPerKg: number;
  essentialOilPct: number;
  essentialOilCostPerKg: number;
  colorantCost: number;
  exfoliantCost: number;
  additivesCost: number;
  curingTimeDays: number;
  targetWeightG: number;
}

export interface ConcreteInputs extends CommonCalcInputs {
  projectType: string;
  mixType: string;
  cementCostPerKg: number;
  sandCostPerKg: number;
  cementRatioPct: number;
  sandRatioPct: number;
  waterCementRatio: number;
  totalDryMixG: number;
  pigmentCostPerKg: number;
  pigmentPct: number;
  sealantCost: number;
  fibersCost: number;
  plasticizerCost: number;
  waterproofingCost: number;
  moldCost: number;
  releaseAgentCost: number;
  sandpaperCost: number;
  polishCost: number;
  dryingTimeH: number;
  finalWeightKg: number;
}

export interface PlasterInputs extends CommonCalcInputs {
  projectType: string;
  plasterType: string;
  plasterCostPerKg: number;
  plasterAmountG: number;
  waterPlasterRatio: number;
  pigmentCost: number;
  fragranceCost: number;
  sealantCost: number;
  paintCost: number;
  varnishCost: number;
  moldCost: number;
  releaseAgentCost: number;
  sandpaperCost: number;
  dryingTimeMin: number;
  finalWeightG: number;
}

export interface MultiMaterialComponent {
  id: string;
  type: CalculatorCategory;
  name: string;
  costPerUnit: number;
  productionTimeMin: number;
  wastePct: number;
  notes: string;
}

export interface MultiInputs extends CommonCalcInputs {
  components: MultiMaterialComponent[];
}

// ── Simulator types ─────────────────────────────────────────

export interface SimulatorInputs {
  baseCostPerUnit: number;
  salePrice: number;
  discountPct: number;
  wholesalePrice: number;
  marketplaceFeePct: number;
  hotmartFeePct: number;
  gatewayFeePct: number;
  affiliateFeePct: number;
  shippingCost: number;
  taxesPct: number;
  premiumPackagingCost: number;
  volumeDiscountPct: number;
  minDesiredMarginPct: number;
}

export interface SimulatorResults {
  minProfitablePrice: number;
  recommendedPrice: number;
  premiumPrice: number;
  safeWholesalePrice: number;
  promoPrice: number;
  minUnitsToRecover: number;
  directMargin: number;
  marketplaceMargin: number;
  wholesaleMargin: number;
}

// ── Geometry types ──────────────────────────────────────────

export type MoldShape =
  | "cylinder"
  | "cube"
  | "rectangular"
  | "sphere"
  | "hemisphere"
  | "cone"
  | "pyramid"
  | "hexagonal"
  | "irregular";

export interface GeometryDimensions {
  diameter?: number;
  radius?: number;
  height?: number;
  width?: number;
  length?: number;
  side?: number;
  waterAmountMl?: number;
}
