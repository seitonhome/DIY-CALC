import type { MoldShape, GeometryDimensions } from "@/types";

// All dimensions in cm, result in cm³ = ml
export function calculateVolume(shape: MoldShape, dims: GeometryDimensions): number {
  const { diameter, radius, height, width, length, side, waterAmountMl } = dims;
  const r = radius ?? (diameter ? diameter / 2 : 0);

  switch (shape) {
    case "cylinder":
      return Math.PI * r * r * (height ?? 0);

    case "cube":
      return Math.pow(side ?? 0, 3);

    case "rectangular":
      return (width ?? 0) * (length ?? 0) * (height ?? 0);

    case "sphere":
      return (4 / 3) * Math.PI * r * r * r;

    case "hemisphere":
      return (2 / 3) * Math.PI * r * r * r;

    case "cone":
      return (1 / 3) * Math.PI * r * r * (height ?? 0);

    case "pyramid":
      // Square base pyramid
      return (1 / 3) * Math.pow(side ?? 0, 2) * (height ?? 0);

    case "hexagonal":
      // Regular hexagonal prism
      return (3 * Math.sqrt(3)) / 2 * Math.pow(side ?? 0, 2) * (height ?? 0);

    case "irregular":
      // Water displacement: 1ml water = 1cm³
      return waterAmountMl ?? 0;

    default:
      return 0;
  }
}

// Calculate required material given volume and density
export function calculateMaterialFromVolume(
  volumeMl: number,
  densityGml: number,
  fillPct = 100
): number {
  return volumeMl * (fillPct / 100) * densityGml;
}

// Calculate area of a surface (for coatings)
export function calculateArea(width: number, length: number): number {
  return width * length;
}

// Round to given decimal places
export function round(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
