import type { SimulatorInputs, SimulatorResults } from "@/types";

export function calculateSimulator(inputs: SimulatorInputs): SimulatorResults {
  const {
    baseCostPerUnit,
    gatewayFeePct,
    affiliateFeePct,
    taxesPct,
    shippingCost,
    premiumPackagingCost,
    marketplaceFeePct,
    minDesiredMarginPct,
  } = inputs;

  const totalCost = baseCostPerUnit + (premiumPackagingCost || 0) + (shippingCost || 0);

  // Fees as decimals
  const gatewayFee = (gatewayFeePct || 0) / 100;
  const affiliateFee = (affiliateFeePct || 0) / 100;
  const taxes = (taxesPct || 0) / 100;
  const marketplaceFee = (marketplaceFeePct || 0) / 100;
  const minMargin = (minDesiredMarginPct || 20) / 100;

  // Minimum price: no fees, no marketplace
  const minProfitablePrice = totalCost / (1 - minMargin - gatewayFee - taxes);

  // Recommended price: includes all direct fees
  const recommendedPrice = totalCost / (1 - minMargin - gatewayFee - affiliateFee - taxes);

  // Premium price: 50% margin
  const premiumPrice = totalCost / (1 - 0.5 - gatewayFee - taxes);

  // Safe wholesale: 20% margin
  const safeWholesalePrice = totalCost / 0.8;

  // Marketplace price: includes marketplace fee
  const promoPrice = totalCost / (1 - minMargin - marketplaceFee - gatewayFee - taxes);

  // Units to recover investment (assuming fixed overhead = 10× base cost)
  const fixedOverhead = baseCostPerUnit * 10;
  const profitPerUnit = recommendedPrice * minMargin;
  const minUnitsToRecover = profitPerUnit > 0 ? Math.ceil(fixedOverhead / profitPerUnit) : 999;

  // Margins per channel
  const directMargin = recommendedPrice > 0
    ? ((recommendedPrice - totalCost - recommendedPrice * (gatewayFee + affiliateFee + taxes)) / recommendedPrice) * 100
    : 0;

  const marketplaceMargin = recommendedPrice > 0
    ? ((recommendedPrice - totalCost - recommendedPrice * (marketplaceFee + gatewayFee + taxes)) / recommendedPrice) * 100
    : 0;

  const wholesaleMargin = safeWholesalePrice > 0
    ? ((safeWholesalePrice - totalCost) / safeWholesalePrice) * 100
    : 0;

  return {
    minProfitablePrice,
    recommendedPrice,
    premiumPrice,
    safeWholesalePrice,
    promoPrice,
    minUnitsToRecover,
    directMargin,
    marketplaceMargin,
    wholesaleMargin,
  };
}
