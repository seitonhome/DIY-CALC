import type { Locale } from "@/types";

interface CustomerRow {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
  licenses?: { status: string }[];
  user_preferences?: { preferred_language: string }[];
}

const LABELS: Record<Locale, Record<string, string>> = {
  es: {
    title: "DIY Calc Pro — Clientes registrados",
    brand: "DIY Calc Pro by Seiton Home",
    generatedAt: "Generado el",
    name: "Nombre",
    email: "Correo",
    license: "Licencia",
    language: "Idioma",
    joinedAt: "Registro",
    total: "Total de clientes",
  },
  en: {
    title: "DIY Calc Pro — Registered customers",
    brand: "DIY Calc Pro by Seiton Home",
    generatedAt: "Generated on",
    name: "Name",
    email: "Email",
    license: "License",
    language: "Language",
    joinedAt: "Joined",
    total: "Total customers",
  },
};

function rowsFor(users: CustomerRow[]) {
  return users.map((u) => [
    u.full_name ?? "—",
    u.email,
    u.licenses?.[0]?.status ?? "demo",
    u.user_preferences?.[0]?.preferred_language ?? "es",
    new Date(u.created_at).toLocaleDateString(),
  ]);
}

export function exportCustomersCSV(users: CustomerRow[], locale: Locale) {
  const l = LABELS[locale];
  const header = [l.name, l.email, l.license, l.language, l.joinedAt];
  const escape = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = [header, ...rowsFor(users)]
    .map((r) => r.map((cell) => escape(String(cell))).join(","))
    .join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `diy-calc-pro-clientes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportCustomersPDF(users: CustomerRow[], locale: Locale) {
  const l = LABELS[locale];

  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const AMBER = [146, 64, 14] as [number, number, number];
  const STONE_DARK = [28, 25, 23] as [number, number, number];
  const STONE_LIGHT = [250, 250, 249] as [number, number, number];
  const STONE_MID = [120, 113, 108] as [number, number, number];

  doc.setFillColor(...AMBER);
  doc.rect(0, 0, pageW, 24, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(l.title, 14, 11);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(l.brand, 14, 17);

  doc.setFontSize(8);
  doc.text(`${l.generatedAt}: ${new Date().toLocaleDateString(locale === "es" ? "es-MX" : "en-US")}`, pageW - 14, 11, { align: "right" });
  doc.text(`${l.total}: ${users.length}`, pageW - 14, 17, { align: "right" });

  autoTable(doc, {
    startY: 30,
    head: [[l.name, l.email, l.license, l.language, l.joinedAt]],
    body: rowsFor(users),
    theme: "striped",
    headStyles: { fillColor: AMBER, textColor: [255, 255, 255], fontStyle: "bold" },
    styles: { fontSize: 9, cellPadding: 3, textColor: STONE_DARK },
    alternateRowStyles: { fillColor: STONE_LIGHT },
    margin: { left: 14, right: 14 },
  });

  doc.setFillColor(...STONE_LIGHT);
  doc.rect(0, pageH - 10, pageW, 10, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...STONE_MID);
  doc.text(l.brand, 14, pageH - 4);
  doc.text("www.seitonhome.com/apps/diy-calc-pro", pageW - 14, pageH - 4, { align: "right" });

  doc.save(`diy-calc-pro-clientes-${new Date().toISOString().slice(0, 10)}.pdf`);
}
