import type { Locale } from "@/types";

export function formatCurrency(
  value: number,
  currency = "USD",
  locale: Locale = "es"
): string {
  const localeStr = locale === "es" ? "es-MX" : "en-US";
  return new Intl.NumberFormat(localeStr, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number, locale: Locale = "es", decimals = 2): string {
  const localeStr = locale === "es" ? "es-MX" : "en-US";
  return new Intl.NumberFormat(localeStr, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPct(value: number, locale: Locale = "es"): string {
  return `${formatNumber(value, locale, 1)}%`;
}

export function formatWeight(value: number, unit: "g" | "kg" | "oz" | "lb", locale: Locale = "es"): string {
  return `${formatNumber(value, locale, 2)} ${unit}`;
}

export function formatVolume(value: number, unit: "ml" | "l" | "oz", locale: Locale = "es"): string {
  return `${formatNumber(value, locale, 2)} ${unit}`;
}

export function gToKg(g: number): number { return g / 1000; }
export function kgToG(kg: number): number { return kg * 1000; }
export function mlToL(ml: number): number { return ml / 1000; }
export function lToMl(l: number): number { return l * 1000; }
export function gToOz(g: number): number { return g * 0.035274; }
export function ozToG(oz: number): number { return oz * 28.3495; }
export function cmToIn(cm: number): number { return cm * 0.393701; }
export function inToCm(inch: number): number { return inch * 2.54; }
