export async function exportGuidePDF() {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();

  // ── Brand colors ─────────────────────────────────────────────────────────
  const GOLD      = [201, 163, 71]  as [number, number, number];
  const GOLD_DARK = [168, 134, 42]  as [number, number, number];
  const CREAM     = [245, 240, 234] as [number, number, number];
  const CREAM_D   = [237, 232, 225] as [number, number, number];
  const DARK      = [44,  44,  44]  as [number, number, number];
  const MID       = [120, 113, 108] as [number, number, number];
  const WHITE     = [255, 255, 255] as [number, number, number];
  const WARM_BG   = [255, 251, 235] as [number, number, number];

  let pageNum = 0;

  function newPage() {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    doc.setFillColor(...CREAM);
    doc.rect(0, 0, W, H, "F");
  }

  function pageHeader(section: string) {
    doc.setFillColor(...GOLD_DARK);
    doc.rect(0, 0, W, 18, "F");
    doc.setFillColor(...GOLD);
    doc.rect(0, 18, W, 2, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("DIY CALC PRO", 14, 11);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(section, W - 14, 11, { align: "right" });
    doc.setFontSize(7);
    doc.text(`${pageNum}`, W / 2, 15, { align: "center" });
  }

  function pageFooter() {
    doc.setFillColor(...CREAM_D);
    doc.rect(0, H - 9, W, 9, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...MID);
    doc.text("DIY Calc Pro by Seiton Home  ·  Guía de Usuario Completa", 14, H - 3.5);
    doc.text("© 2025 Seiton Home. Todos los derechos reservados.", W - 14, H - 3.5, { align: "right" });
  }

  function sectionTitle(text: string, y: number): number {
    doc.setFillColor(...GOLD);
    doc.rect(14, y, 4, 8, "F");
    doc.setTextColor(...GOLD_DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(text, 22, y + 6);
    return y + 14;
  }

  function bodyText(text: string, y: number, maxWidth = W - 28): number {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, 14, y);
    return y + (lines as string[]).length * 5 + 2;
  }

  function bullet(text: string, y: number): number {
    doc.setFillColor(...GOLD);
    doc.circle(18, y - 1.2, 1.3, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const lines = doc.splitTextToSize(text, W - 36);
    doc.text(lines, 23, y);
    return y + (lines as string[]).length * 5 + 1.5;
  }

  function numberedStep(num: number, text: string, y: number): number {
    doc.setFillColor(...GOLD);
    doc.circle(18, y - 1.5, 3.5, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(num), 18, y + 0.5, { align: "center" });
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(text, 26, y);
    return y + 8;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 1 — PORTADA
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();

  // Header de portada
  doc.setFillColor(...GOLD_DARK);
  doc.rect(0, 0, W, 82, "F");
  doc.setFillColor(...GOLD);
  doc.rect(0, 82, W, 3, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(38);
  doc.text("DIY CALC PRO", W / 2, 36, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.text("La calculadora completa para artesanos DIY", W / 2, 53, { align: "center" });

  doc.setFontSize(9.5);
  doc.setTextColor(237, 232, 225);
  doc.text("Guía de Usuario  ·  Beneficios  ·  Referencia Técnica", W / 2, 66, { align: "center" });

  // Tarjetas del índice
  let y = 96;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("¿Qué encontrarás en esta guía?", W / 2, y, { align: "center" });
  y += 10;

  const indexCards = [
    { num: "01", title: "¿Qué es DIY Calc Pro?",   desc: "Descripción del producto y para quién es" },
    { num: "02", title: "Beneficios completos",     desc: "Todo lo que incluye y cómo te ayuda" },
    { num: "03", title: "Calculadora de Velas",     desc: "10 tipos de cera con temperaturas exactas" },
    { num: "04", title: "Calculadora de Jabones",   desc: "13 métodos — glicerina, sosa, sal, leche" },
    { num: "05", title: "Calculadora de Resina",    desc: "8 tipos según técnica — geoda, joyería, pisos" },
    { num: "06", title: "Concreto, Yeso y Precios", desc: "Mezclas, hypertufa, microcemento, precio justo" },
  ];

  const cW = (W - 42) / 2;
  let col = 0;
  let rowY = y;

  for (const c of indexCards) {
    const cx = col === 0 ? 14 : 14 + cW + 14;
    doc.setFillColor(...WHITE);
    doc.roundedRect(cx, rowY, cW, 22, 3, 3, "F");
    doc.setFillColor(...GOLD_DARK);
    doc.roundedRect(cx, rowY, 14, 22, 3, 3, "F");
    doc.rect(cx + 11, rowY, 3, 22, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(c.num, cx + 7, rowY + 13, { align: "center" });
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(c.title, cx + 18, rowY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID);
    const dl = doc.splitTextToSize(c.desc, cW - 22);
    doc.text(dl, cx + 18, rowY + 14);
    col++;
    if (col === 2) { col = 0; rowY += 27; }
  }

  // Pie de portada
  doc.setFillColor(...GOLD_DARK);
  doc.rect(0, H - 28, W, 28, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("by Seiton Home", W / 2, H - 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CREAM_D);
  doc.text("© 2025 Seiton Home · Todos los derechos reservados", W / 2, H - 7, { align: "center" });

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 2 — QUÉ ES / PARA QUIÉN ES
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Descripción del producto");

  y = 30;
  y = sectionTitle("¿Qué es DIY Calc Pro?", y);
  y = bodyText(
    "DIY Calc Pro es la herramienta de cálculo especializada para artesanos que producen velas, jabones, " +
    "objetos en resina epóxica, concreto decorativo y yeso. Te da las proporciones exactas de cada ingrediente, " +
    "los parámetros técnicos de cada material, el costo real de producción y el precio de venta con el " +
    "margen que tú eliges — todo en segundos, sin necesidad de conocimientos técnicos avanzados.",
    y
  );

  y += 8;
  y = sectionTitle("¿Para quién es?", y);

  const forWho = [
    "Artesanos que hacen velas y quieren saber cuánta fragancia usar por tipo de cera y a qué temperatura trabajar",
    "Personas que trabajan con glicerina y quieren resultados consistentes y profesionales",
    "Artistas de resina epóxica que necesitan saber qué tipo usar según la técnica (geoda, joyería, pisos, cuadros)",
    "Emprendedores de jabón artesanal que necesitan calcular la sosa exacta para que no sobre",
    "Artesanos que hacen objetos en cemento decorativo, hypertufa, microcemento o yeso",
    "Negocios que necesitan calcular el costo real y el precio de venta correcto antes de lanzar un producto",
  ];
  for (const item of forWho) { y = bullet(item, y); }

  y += 8;
  y = sectionTitle("¿Qué problema resuelve?", y);

  const problems = [
    { title: "Sin proporciones exactas",  desc: "No saber cuánto de cada ingrediente usar lleva a desperdiciar materiales y obtener resultados inconsistentes batch a batch." },
    { title: "Sin costo real",            desc: "Fijar precios sin calcular todos los costos — merma, mano de obra, empaque, comisiones — genera ventas con pérdida real." },
    { title: "Sin referencia técnica",    desc: "No tener acceso a fichas técnicas de materiales obliga a experimentar desde cero cada vez, perdiendo tiempo y dinero." },
  ];

  const pW = (W - 42) / 3;
  for (let i = 0; i < problems.length; i++) {
    const px = 14 + i * (pW + 7);
    doc.setFillColor(...WHITE);
    doc.roundedRect(px, y, pW, 40, 3, 3, "F");
    doc.setFillColor(...GOLD_DARK);
    doc.roundedRect(px, y, pW, 9, 3, 3, "F");
    doc.rect(px, y + 6, pW, 3, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const tl = doc.splitTextToSize(problems[i].title, pW - 6);
    doc.text(tl, px + pW / 2, y + 6, { align: "center" });
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const dl = doc.splitTextToSize(problems[i].desc, pW - 8);
    doc.text(dl, px + 4, y + 16);
  }

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 3 — BENEFICIOS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Beneficios del producto");

  y = 30;
  y = sectionTitle("Beneficios completos de DIY Calc Pro", y);

  const benefits: [string, string][] = [
    ["Proporciones exactas por material",    "Calcula gramos, porcentajes y temperaturas correctas para cada tipo de cera, resina, jabón o mezcla de cemento. Sin adivinar, sin desperdiciar."],
    ["Recomendación de materiales",          "Si estás haciendo una geoda, la app recomienda la resina cristal. Si haces un shampoo bar con sosa, te explica el proceso. No necesitas experiencia previa."],
    ["Cálculo de sosa sin error",            "Para jabón artesanal, calcula la cantidad exacta de NaOH o KOH usando los valores SAP de 12 aceites y mantecas. Incluye tallow, ricino, karité y más."],
    ["Costo real de producción",             "Incluye materia prima, merma, mano de obra, empaque, etiqueta y comisiones de plataforma. Nada se queda por fuera."],
    ["Precio de venta sugerido",             "Calcula el precio de venta según el margen que tú quieres — no el que el mercado te impone. También calcula precio mayorista automáticamente."],
    ["Fichas técnicas en PDF",               "Exporta fichas de costos y producción en formato profesional, listas para imprimir o compartir con tu equipo y clientes."],
    ["Biblioteca de materiales",             "Registra tus proveedores, costos actualizados y stock de cada material. Vincula directamente con las calculadoras."],
    ["Biblioteca de fórmulas",               "Guarda tus mejores recetas con versiones para comparar qué fórmula da el mejor resultado y al mejor costo."],
    ["Comparador de escenarios",             "Compara fórmulas, materiales o estrategias de precio lado a lado en una sola vista."],
    ["Disponible en español e inglés",       "La app completa — calculadoras, exportaciones y panel — funciona en ambos idiomas con un solo clic."],
    ["Pago único — sin suscripción",         "Acceso de por vida con todas las actualizaciones incluidas. Sin cargos mensuales, sin sorpresas."],
  ];

  for (const [title, desc] of benefits) {
    if (y > H - 35) { pageFooter(); newPage(); pageHeader("Beneficios del producto"); y = 30; }
    doc.setFillColor(...CREAM_D);
    doc.roundedRect(14, y - 2, W - 28, 18, 2, 2, "F");
    doc.setFillColor(...GOLD);
    doc.rect(14, y - 2, 3, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(title, 22, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...MID);
    const dl = doc.splitTextToSize(desc, W - 44);
    doc.text(dl, 22, y + 11);
    y += 22;
  }

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 4 — CALCULADORA DE VELAS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Guía — Calculadora de Velas");

  y = 30;
  y = sectionTitle("Calculadora de Velas", y);
  y = bodyText(
    "Calcula la cantidad exacta de cera, fragancia, colorante y aditivos para cualquier tipo de vela. " +
    "Cada vez que seleccionas un tipo de cera aparece automáticamente su ficha técnica con temperaturas " +
    "de fusión, colada y adición de fragancia.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Tipo de cera", "Fusión", "Colada", "FO a", "FO máx", "2ª colada"]],
    body: [
      ["Soja contenedor (464, GB464)", "49°C", "54°C", "57°C", "12%", "No"],
      ["Soja pilar (415, CB-135)",     "58°C", "65°C", "68°C", "8%",  "Sí"],
      ["Coco pura (76°F)",             "45°C", "50°C", "54°C", "10%", "No"],
      ["Coco-Albaricoque (Coconut 83)", "46°C", "52°C", "55°C", "12%", "No"],
      ["Palma pilar",                  "54°C", "82°C", "82°C", "10%", "Sí"],
      ["Parafina estándar (MP 52°C)",  "52°C", "68°C", "72°C", "10%", "Sí"],
      ["Cera de molde (MP 62°C)",      "62°C", "75°C", "78°C", "8%",  "Sí — requiere estearina 5–15%"],
      ["Cera de abeja pura",           "63°C", "74°C", "74°C", "6%",  "No"],
      ["Gel translúcido",              "75°C", "88°C", "88°C", "5%",  "No — solo vidrio"],
      ["Mezcla soya-parafina (50:50)", "51°C", "63°C", "66°C", "10%", "No"],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: 13, halign: "center" },
      2: { cellWidth: 13, halign: "center" },
      3: { cellWidth: 13, halign: "center" },
      4: { cellWidth: 13, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 10;
  y = sectionTitle("Paso a paso — Velas", y);

  const stepsVelas = [
    "Selecciona el tipo de vela (contenedor, molde, pilar, wax melt, tealight...)",
    "Elige el tipo de cera → aparece la ficha técnica con todas las temperaturas automáticamente",
    "Ingresa el volumen del molde en ml (o el peso final deseado en gramos)",
    "Agrega el % de fragancia — la app avisa si superas el máximo recomendado para esa cera",
    "Agrega colorante, estearina (para parafina de molde), Vybar e inhibidor UV si aplica",
    "Presiona Calcular → obtienes los gramos exactos de cada ingrediente",
    "Completa los costos y exporta la ficha en PDF",
  ];
  for (let i = 0; i < stepsVelas.length; i++) { y = numberedStep(i + 1, stepsVelas[i], y); }

  // Tip box
  y += 4;
  doc.setFillColor(...WARM_BG);
  doc.roundedRect(14, y, W - 28, 20, 3, 3, "F");
  doc.setFillColor(...GOLD);
  doc.rect(14, y, 3, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GOLD_DARK);
  doc.text("Aditivos importantes para parafina de molde:", 22, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text("Estearina 5–15% (dureza y opacidad)  ·  Vybar 0.5–1% (retención de fragancia)  ·  Inhibidor UV 0.1–0.5% (evita amarillamiento)", 22, y + 14);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 5 — CALCULADORA DE JABONES
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Guía — Calculadora de Jabones");

  y = 30;
  y = sectionTitle("Calculadora de Jabones — 13 métodos", y);
  y = bodyText(
    "Cubre todos los métodos de elaboración, desde glicerina (sin sosa, fácil) hasta proceso frío, " +
    "caliente, jabón líquido con KOH, jabón de leche, sal marina y champú sólido. " +
    "Para métodos con sosa, calcula la cantidad exacta de NaOH o KOH automáticamente.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Tipo de jabón", "Sosa", "Curado", "Características principales"]],
    body: [
      ["Glicerina en bloque",              "No", "0 días", "Se derrite y vierte — lista en 1–2 horas"],
      ["Glicerina transparente (crystal)", "No", "0 días", "Efecto cristalino para embeds y capas"],
      ["Glicerina leche de cabra",         "No", "0 días", "pH suave — ideal piel sensible y bebés"],
      ["Glicerina con exfoliante",         "No", "0 días", "Avena, café, sal, azúcar, arena volcánica"],
      ["Proceso frío (CP)",                "NaOH", "28 días", "Frío — saponificación natural — máx calidad"],
      ["Proceso caliente (HP)",            "NaOH", "7 días", "Cocinado en olla — listo antes — más rústico"],
      ["Jabón de leche (CP)",              "NaOH", "28 días", "Leche congelada en lugar de agua — muy cremoso"],
      ["Jabón líquido (KOH)",              "KOH",  "7 días", "Sosa potásica — pasta que se diluye en agua"],
      ["Jabón de Castilla",                "NaOH", "180 días", "100% oliva — el más suave — curado largo"],
      ["Jabón de sal marina",              "NaOH", "7 días", "80–100% coco + sal — cortar en 30–60 min"],
      ["Syndet / sin sosa",                "No", "0 días", "pH neutro 5.5–6.5 — SCI, SCS, betaína"],
      ["Champú sólido glicerina",          "No", "0 días", "Para cabello — se derrite y vierte"],
      ["Champú sólido CP",                 "NaOH", "28 días", "Ricino 15–20% — superfat bajo 0–3%"],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 18, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 10;
  y = sectionTitle("Aceites para proceso frío / caliente", y);

  autoTable(doc, {
    startY: y,
    head: [["Aceite / Manteca", "SAP NaOH", "Función en el jabón", "% recomendado"]],
    body: [
      ["Aceite de oliva",       "0.134", "Suavidad, acondicionador, poca espuma",        "30–70%"],
      ["Aceite de coco",        "0.190", "Espuma dura y abundante, dureza",              "20–35%"],
      ["Aceite de ricino ★",    "0.128", "Espuma cremosa y estable — CLAVE",             "5–15%"],
      ["Aceite de palma",       "0.141", "Dureza, estabilidad, espuma cremosa",          "15–30%"],
      ["Manteca de karité",     "0.128", "Acondicionador premium, cremosidad",           "5–15%"],
      ["Manteca de cacao",      "0.137", "Dureza, suavidad",                             "5–15%"],
      ["Manteca de cerdo",      "0.140", "Jabón firme, burbuja cremosa densa",           "20–50%"],
      ["Sebo de vaca",          "0.140", "Dureza extrema, espuma abundante",             "20–50%"],
      ["Aceite de girasol",     "0.134", "Suavidad ligera, acondicionador económico",    "10–20%"],
      ["Aceite de aguacate",    "0.133", "Nutrición profunda para pieles secas",         "5–20%"],
      ["Almendra dulce",        "0.136", "Suavidad suave para pieles delicadas",         "10–20%"],
      ["Salvado de arroz",      "0.128", "Vitamina E, antioxidante",                     "10–25%"],
    ],
    theme: "striped",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 42 },
      1: { cellWidth: 20, halign: "center" },
      3: { cellWidth: 25, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  // Safety note
  y = (doc as any).lastAutoTable?.finalY + 6;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, y, W - 28, 16, 3, 3, "F");
  doc.setFillColor(220, 38, 38);
  doc.rect(14, y, 3, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27);
  doc.text("⚠ SEGURIDAD:", 22, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("NaOH y KOH son corrosivos. Usa guantes y gafas. SIEMPRE agrega la sosa al agua fría (o leche fría), NUNCA al revés.", 22, y + 12);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 6 — RESINA + CONCRETO
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Guía — Resina y Concreto");

  y = 30;
  y = sectionTitle("Calculadora de Resina Epóxica", y);
  y = bodyText(
    "Selecciona la técnica que vas a hacer y la app recomienda automáticamente el tipo de resina ideal. " +
    "Calcula las cantidades exactas de Parte A y Parte B, el volumen del molde y el costo de pigmentos y acabados.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Tipo de resina", "Ratio", "Capa máx", "Curado", "Usos principales"]],
    body: [
      ["Resina cristal",             "1:1", "4 mm",  "36 h", "Geoda, arte decorativo, cuadros — la más usada en LatAm"],
      ["Resina estándar",            "2:1", "6 mm",  "24 h", "Bandejas, encimeras, tables de río, uso general"],
      ["Resina UV",                  "1:1", "3 mm",  "5 min", "Joyería fina, sellos — curado con luz UV"],
      ["Casting / fundición",        "1:1", "10 cm", "48 h", "Piezas gruesas, figuras, letras — capas profundas"],
      ["Resina flexible",            "1:1", "10 mm", "24 h", "Accesorios, tapetes — dobla sin quebrarse"],
      ["Recubrimiento de pisos",     "2:1", "4 mm",  "24 h", "Arte en pisos y superficies — alta resistencia"],
      ["Poliuretano",                "1:1", "5 mm",  "4 h",  "Encapsulado, prototipos, producción rápida"],
      ["Laminado",                   "3:1", "2 mm",  "12 h", "Fibra de vidrio, botes, superficies de alto rendimiento"],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 14, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 10;
  y = sectionTitle("Calculadora de Concreto Decorativo", y);
  y = bodyText(
    "Ingresa las dimensiones del molde y la app calcula el volumen automáticamente. " +
    "Elige el tipo de mezcla y obtén los gramos exactos de cemento, arena y agua.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Tipo de mezcla", "Relación", "Densidad", "Uso ideal"]],
    body: [
      ["Decorativo (cemento:arena)",     "1:2",            "1.80 g/ml", "Macetas, esculturas, arte — sin grava"],
      ["Estándar (cemento:arena:grava)", "1:2:3",          "2.20 g/ml", "Piezas estructurales, encimeras gruesas"],
      ["GFRC — Fibra de vidrio",         "1:1.5 + fibra",  "1.90 g/ml", "Piezas delgadas, fachadas, encimeras resistentes"],
      ["Fino (cemento:arena fina)",      "1:1",            "1.70 g/ml", "Detalles finos, moldes pequeños, azulejos"],
      ["Liviano (cemento + perlita)",    "1:0.75 perlita", "1.20 g/ml", "Macetas grandes, piezas colgantes — muy liviano"],
      ["Cemento blanco decorativo",      "1:2",            "1.75 g/ml", "Piezas coloreadas con pigmentos y óxidos"],
      ["Hypertufa",                      "1:1.5:1.5",      "0.90 g/ml", "Arte de jardín, piedras ornamentales, troncos falsos"],
      ["Microcemento / Microtopping",    "1:0.67",         "1.60 g/ml", "Capas 1–3 mm en paredes, pisos y muebles"],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
    styles: { fontSize: 7.5, cellPadding: 2.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 52 },
      1: { cellWidth: 28, halign: "center" },
      2: { cellWidth: 20, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 7 — YESO + PRECIOS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Guía — Yeso y Cálculo de Precios");

  y = 30;
  y = sectionTitle("Calculadora de Yeso y Escayola", y);
  y = bodyText(
    "Calcula la relación agua/yeso correcta para cada tipo de yeso. " +
    "Ingresa las dimensiones del molde y obtén los gramos exactos de yeso y agua para no desperdiciar material.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Tipo de yeso", "Ratio agua:yeso", "Tiempo fragua", "Uso recomendado"]],
    body: [
      ["Yeso estándar",          "0.65–0.75", "20–30 min", "Figuras decorativas, piezas básicas"],
      ["Escayola / Gypsum",      "0.55–0.65", "15–25 min", "Alta resistencia, blancura superior, detalles finos"],
      ["Yeso cerámico",          "0.70–0.80", "25–35 min", "Alta porosidad para absorción de esmaltes"],
      ["Yeso piedra / Hydrocal", "0.30–0.40", "30–45 min", "Máxima dureza — modelos de alta precisión"],
      ["Yeso dental / Fuerte",   "0.22–0.30", "8–15 min",  "Dureza extrema — detalles ultra finos"],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 50 },
      1: { cellWidth: 28, halign: "center" },
      2: { cellWidth: 25, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 12;
  y = sectionTitle("Cómo calcular el precio de venta correcto", y);
  y = bodyText(
    "DIY Calc Pro calcula el precio basado en TODOS tus costos reales — " +
    "no en una multiplicación simple que deja variables fuera.",
    y
  );

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [["Variable de costo", "¿Qué incluye?", "¿Por qué importa?"]],
    body: [
      ["Costo de materiales",     "Cera, resina, jabón, cemento, fragancia, pigmentos...", "El costo más visible pero no el único"],
      ["Merma estimada",          "Material que se pierde, piezas que no quedan perfectas", "Recomendado 3–8%. No ignorarla."],
      ["Mano de obra",            "Tu costo por hora × horas de producción",               "Lo que más se olvida incluir"],
      ["Empaque",                 "Caja, papel, etiqueta, cinta, bolsas de presentación",  "Puede ser 10–25% del costo total"],
      ["Comisión de plataforma",  "Etsy, MercadoLibre, Instagram, marketplace",            "5–15% que se va si no se calcula"],
      ["Margen deseado",          "Tu ganancia en % sobre el precio de venta",             "Mínimo recomendado: 30–35%"],
    ],
    theme: "striped",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 42 }, 1: { cellWidth: 65 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 8;
  doc.setFillColor(...WARM_BG);
  doc.roundedRect(14, y, W - 28, 22, 3, 3, "F");
  doc.setFillColor(...GOLD);
  doc.rect(14, y, 3, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...GOLD_DARK);
  doc.text("Importante:", 22, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const tip = doc.splitTextToSize(
    "Multiplicar el costo de materiales por 2 o 3 no es suficiente. Si no incluyes mano de obra, merma y comisiones, " +
    "puedes estar vendiendo con pérdida sin saberlo. DIY Calc Pro incluye todas estas variables automáticamente.",
    W - 44
  );
  doc.text(tip, 22, y + 13);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PÁGINA 8 — ACTIVACIÓN + SOPORTE
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader("Activación y soporte");

  y = 30;
  y = sectionTitle("Cómo activar tu licencia", y);

  const activationSteps: [string, string][] = [
    ["1. Compra en Hotmart",    "Recibes un correo de confirmación con tu código de activación con formato XXXX-XXXX-XXXX-XXXX."],
    ["2. Crea tu cuenta",       "Ve a la app, haz clic en Registrarse e ingresa tu correo y contraseña."],
    ["3. Activa tu licencia",   "Ve a la sección Activar licencia, ingresa el código del correo y presiona Activar ahora."],
    ["4. Acceso completo",      "De inmediato tienes acceso a todas las calculadoras, exportaciones y biblioteca de materiales."],
  ];

  for (const [step, desc] of activationSteps) {
    doc.setFillColor(...CREAM_D);
    doc.roundedRect(14, y - 2, W - 28, 18, 2, 2, "F");
    doc.setFillColor(...GOLD_DARK);
    doc.roundedRect(14, y - 2, 22, 18, 2, 2, "F");
    doc.rect(28, y - 2, 8, 18, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...WHITE);
    doc.text(step.split(".")[0] + ".", 25, y + 7, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...DARK);
    doc.text(step.split(". ")[1] ?? "", 40, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...MID);
    const dl = doc.splitTextToSize(desc, W - 58);
    doc.text(dl, 40, y + 10);
    y += 23;
  }

  y += 6;
  y = sectionTitle("Preguntas frecuentes", y);

  autoTable(doc, {
    startY: y,
    head: [["Pregunta", "Respuesta"]],
    body: [
      ["¿Puedo usar la app en varios dispositivos?",    "Sí. Con tu cuenta puedes ingresar desde cualquier computador o celular con internet."],
      ["¿La app funciona sin internet?",               "Requiere conexión para cargar y guardar datos."],
      ["¿Puedo exportar mis cálculos?",                "Sí. Cada calculadora tiene un botón para exportar la ficha en PDF profesional."],
      ["¿Hay actualizaciones incluidas?",              "Sí. Pago único incluye todas las actualizaciones futuras sin costo adicional."],
      ["¿La sosa / KOH se vende en la app?",           "No. La app calcula cuánto necesitas. Los materiales los consigues en tu proveedor local."],
      ["¿Funciona para Colombia y LatAm?",             "Sí. Está optimizada para artesanos de habla hispana. Moneda y unidades ajustables."],
      ["¿Está en inglés?",                             "Sí. La app completa está disponible en español e inglés con un solo clic."],
      ["¿Cómo contacto soporte?",                      "Escribe a soporte@seitonhome.com. Respuesta en 24–48 horas hábiles."],
    ],
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 75 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 12;

  // CTA final
  doc.setFillColor(...GOLD_DARK);
  doc.roundedRect(14, y, W - 28, 32, 5, 5, "F");
  doc.setFillColor(...GOLD);
  doc.roundedRect(14, y, W - 28, 14, 5, 5, "F");
  doc.rect(14, y + 9, W - 28, 5, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...WHITE);
  doc.text("DIY CALC PRO", W / 2, y + 9, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...CREAM_D);
  doc.text("La calculadora completa para artesanos DIY", W / 2, y + 18, { align: "center" });
  doc.setFontSize(8.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text("by Seiton Home  ·  soporte@seitonhome.com  ·  © 2025 Seiton Home", W / 2, y + 27, { align: "center" });

  pageFooter();

  doc.save("DIY-Calc-Pro-Guia-Completa.pdf");
}
