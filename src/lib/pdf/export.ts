import type { CalculationResults, Locale } from "@/types";

interface ExportOptions {
  results: CalculationResults;
  productName: string;
  category: string;
  locale: Locale;
  currency?: string;
  notes?: string;
}

const LABELS: Record<Locale, Record<string, string>> = {
  es: {
    title: "DIY Calc Pro — Ficha de Costos",
    brand: "DIY Calc Pro by Seiton Home",
    product: "Producto",
    category: "Categoría",
    generatedAt: "Generado el",
    costPerUnit: "Costo por unidad",
    totalProductionCost: "Costo total de producción",
    suggestedPrice: "Precio sugerido",
    wholesalePrice: "Precio mayorista",
    grossMargin: "Margen bruto",
    netMargin: "Margen neto",
    profitPerUnit: "Ganancia por unidad",
    breakEvenUnits: "Punto de equilibrio",
    riskLevel: "Nivel de riesgo",
    costDistribution: "Distribución de costos",
    material: "Material",
    cost: "Costo",
    percentage: "Porcentaje",
    notes: "Notas",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
  },
  en: {
    title: "DIY Calc Pro — Cost Sheet",
    brand: "DIY Calc Pro by Seiton Home",
    product: "Product",
    category: "Category",
    generatedAt: "Generated on",
    costPerUnit: "Cost per unit",
    totalProductionCost: "Total production cost",
    suggestedPrice: "Suggested price",
    wholesalePrice: "Wholesale price",
    grossMargin: "Gross margin",
    netMargin: "Net margin",
    profitPerUnit: "Profit per unit",
    breakEvenUnits: "Break-even units",
    riskLevel: "Risk level",
    costDistribution: "Cost distribution",
    material: "Material",
    cost: "Cost",
    percentage: "Percentage",
    notes: "Notes",
    low: "Low",
    medium: "Medium",
    high: "Alto",
  },
};

function fmt(value: number, currency: string, locale: Locale): string {
  const localeStr = locale === "es" ? "es-MX" : "en-US";
  return new Intl.NumberFormat(localeStr, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function fmtPct(value: number, locale: Locale): string {
  return `${value.toFixed(1)}%`;
}

export async function exportCalculationPDF(options: ExportOptions) {
  const { results, productName, category, locale, currency = "USD", notes } = options;
  const l = LABELS[locale];

  // Dynamic import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Colors
  const AMBER = [146, 64, 14] as [number, number, number];
  const STONE_DARK = [28, 25, 23] as [number, number, number];
  const STONE_LIGHT = [250, 250, 249] as [number, number, number];
  const STONE_MID = [120, 113, 108] as [number, number, number];

  // Header background
  doc.setFillColor(...AMBER);
  doc.rect(0, 0, pageW, 40, "F");

  // Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("DIY CALC PRO", 14, 16);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("by Seiton Home", 14, 22);

  // Title right
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(l.title, pageW - 14, 16, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(`${l.generatedAt}: ${new Date().toLocaleDateString(locale === "es" ? "es-MX" : "en-US")}`, pageW - 14, 22, { align: "right" });

  // Product info section
  doc.setFillColor(...STONE_LIGHT);
  doc.rect(0, 40, pageW, 20, "F");
  doc.setTextColor(...STONE_DARK);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(productName, 14, 53);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...STONE_MID);
  doc.text(`${l.category}: ${category}`, pageW - 14, 53, { align: "right" });

  // Main metrics
  let y = 70;
  doc.setTextColor(...STONE_DARK);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(locale === "es" ? "Resultados del cálculo" : "Calculation results", 14, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [],
    body: [
      [l.costPerUnit, fmt(results.costPerUnit, currency, locale)],
      [l.totalProductionCost, fmt(results.totalProductionCost, currency, locale)],
      [l.suggestedPrice, fmt(results.suggestedPrice, currency, locale)],
      [l.wholesalePrice, fmt(results.wholesalePrice, currency, locale)],
      [l.grossMargin, fmtPct(results.grossMargin, locale)],
      [l.netMargin, fmtPct(results.netMargin, locale)],
      [l.profitPerUnit, fmt(results.profitPerUnit, currency, locale)],
      [l.breakEvenUnits, `${results.breakEvenUnits} uds.`],
      [l.riskLevel, l[results.riskLevel]],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", fillColor: [250, 250, 249], textColor: STONE_MID },
      1: { textColor: STONE_DARK, fontStyle: "bold" },
    },
    margin: { left: 14, right: 14 },
  });

  // Cost distribution
  const finalY = (doc as any).lastAutoTable?.finalY ?? 150;
  y = finalY + 10;

  if (results.costDistribution.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(l.costDistribution, 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [[l.material, l.cost, l.percentage]],
      body: results.costDistribution.map((item) => [
        item.name,
        fmt(item.cost, currency, locale),
        fmtPct(item.percentage, locale),
      ]),
      theme: "striped",
      headStyles: { fillColor: AMBER, textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 14, right: 14 },
    });
  }

  // Notes
  if (notes) {
    const notesY = (doc as any).lastAutoTable?.finalY ?? finalY + 80;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(l.notes, 14, notesY + 10);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...STONE_MID);
    doc.text(notes, 14, notesY + 16, { maxWidth: pageW - 28 });
  }

  // Footer
  doc.setFillColor(...STONE_LIGHT);
  doc.rect(0, pageH - 12, pageW, 12, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...STONE_MID);
  doc.text(l.brand, 14, pageH - 5);
  doc.text("www.seitonhome.com/apps/diy-calc-pro", pageW - 14, pageH - 5, { align: "right" });

  const filename = `diy-calc-pro-${productName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`;
  doc.save(filename);
}

export async function exportCalculationCSV(
  results: CalculationResults,
  productName: string,
  locale: Locale,
  currency = "USD"
) {
  const l = LABELS[locale];
  const rows = [
    [l.product, productName],
    [l.costPerUnit, results.costPerUnit.toFixed(2)],
    [l.totalProductionCost, results.totalProductionCost.toFixed(2)],
    [l.suggestedPrice, results.suggestedPrice.toFixed(2)],
    [l.wholesalePrice, results.wholesalePrice.toFixed(2)],
    [l.grossMargin, `${results.grossMargin.toFixed(1)}%`],
    [l.netMargin, `${results.netMargin.toFixed(1)}%`],
    [l.profitPerUnit, results.profitPerUnit.toFixed(2)],
    [l.breakEvenUnits, String(results.breakEvenUnits)],
    [],
    [l.material, l.cost, l.percentage],
    ...results.costDistribution.map((i) => [i.name, i.cost.toFixed(2), `${i.percentage.toFixed(1)}%`]),
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diy-calc-pro-${productName.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
