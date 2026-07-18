type GuideLocale = "es" | "en" | "fr";

interface GuideContent {
  filename: string;
  footerTag: string;
  footerCopy: string;
  cover: {
    subtitle: string;
    tagline: string;
    indexHeading: string;
    indexCards: { num: string; title: string; desc: string }[];
    footerCopy: string;
  };
  page2: {
    header: string;
    whatIsTitle: string;
    whatIsBody: string;
    forWhoTitle: string;
    forWho: string[];
    problemTitle: string;
    problems: { title: string; desc: string }[];
  };
  page3: {
    header: string;
    title: string;
    benefits: [string, string][];
  };
  page4: {
    header: string;
    title: string;
    body: string;
    tableHead: string[];
    tableBody: string[][];
    stepsTitle: string;
    steps: string[];
    tipTitle: string;
    tipBody: string;
  };
  page5: {
    header: string;
    title: string;
    body: string;
    soapTableHead: string[];
    soapTableBody: string[][];
    oilsTitle: string;
    oilsTableHead: string[];
    oilsTableBody: string[][];
    safetyLabel: string;
    safetyBody: string;
  };
  page6: {
    header: string;
    resinTitle: string;
    resinBody: string;
    resinTableHead: string[];
    resinTableBody: string[][];
    concreteTitle: string;
    concreteBody: string;
    concreteTableHead: string[];
    concreteTableBody: string[][];
  };
  page7: {
    header: string;
    plasterTitle: string;
    plasterBody: string;
    plasterTableHead: string[];
    plasterTableBody: string[][];
    pricingTitle: string;
    pricingBody: string;
    pricingTableHead: string[];
    pricingTableBody: string[][];
    tipTitle: string;
    tipBody: string;
  };
  page8: {
    header: string;
    activationTitle: string;
    activationSteps: [string, string][];
    faqTitle: string;
    faqTableHead: string[];
    faqRows: string[][];
    ctaSubtitle: string;
    ctaFooter: string;
  };
}

const CONTENT: Record<GuideLocale, GuideContent> = {
  es: {
    filename: "DIY-Calc-Pro-Guia-Completa.pdf",
    footerTag: "Guía de Usuario Completa",
    footerCopy: "© 2025 Seiton Home. Todos los derechos reservados.",
    cover: {
      subtitle: "La calculadora completa para artesanos DIY",
      tagline: "Guía de Usuario  ·  Beneficios  ·  Referencia Técnica",
      indexHeading: "¿Qué encontrarás en esta guía?",
      indexCards: [
        { num: "01", title: "¿Qué es DIY Calc Pro?", desc: "Descripción del producto y para quién es" },
        { num: "02", title: "Beneficios completos", desc: "Todo lo que incluye y cómo te ayuda" },
        { num: "03", title: "Calculadora de Velas", desc: "10 tipos de cera con temperaturas exactas" },
        { num: "04", title: "Calculadora de Jabones", desc: "13 métodos — glicerina, sosa, sal, leche" },
        { num: "05", title: "Calculadora de Resina", desc: "8 tipos según técnica — geoda, joyería, pisos" },
        { num: "06", title: "Concreto, Yeso y Precios", desc: "Mezclas, hypertufa, microcemento, precio justo" },
      ],
      footerCopy: "© 2025 Seiton Home · Todos los derechos reservados",
    },
    page2: {
      header: "Descripción del producto",
      whatIsTitle: "¿Qué es DIY Calc Pro?",
      whatIsBody:
        "DIY Calc Pro es la herramienta de cálculo especializada para artesanos que producen velas, jabones, " +
        "objetos en resina epóxica, concreto decorativo y yeso. Te da las proporciones exactas de cada ingrediente, " +
        "los parámetros técnicos de cada material, el costo real de producción y el precio de venta con el " +
        "margen que tú eliges — todo en segundos, sin necesidad de conocimientos técnicos avanzados.",
      forWhoTitle: "¿Para quién es?",
      forWho: [
        "Artesanos que hacen velas y quieren saber cuánta fragancia usar por tipo de cera y a qué temperatura trabajar",
        "Personas que trabajan con glicerina y quieren resultados consistentes y profesionales",
        "Artistas de resina epóxica que necesitan saber qué tipo usar según la técnica (geoda, joyería, pisos, cuadros)",
        "Emprendedores de jabón artesanal que necesitan calcular la sosa exacta para que no sobre",
        "Artesanos que hacen objetos en cemento decorativo, hypertufa, microcemento o yeso",
        "Negocios que necesitan calcular el costo real y el precio de venta correcto antes de lanzar un producto",
      ],
      problemTitle: "¿Qué problema resuelve?",
      problems: [
        { title: "Sin proporciones exactas", desc: "No saber cuánto de cada ingrediente usar lleva a desperdiciar materiales y obtener resultados inconsistentes batch a batch." },
        { title: "Sin costo real", desc: "Fijar precios sin calcular todos los costos — merma, mano de obra, empaque, comisiones — genera ventas con pérdida real." },
        { title: "Sin referencia técnica", desc: "No tener acceso a fichas técnicas de materiales obliga a experimentar desde cero cada vez, perdiendo tiempo y dinero." },
      ],
    },
    page3: {
      header: "Beneficios del producto",
      title: "Beneficios completos de DIY Calc Pro",
      benefits: [
        ["Proporciones exactas por material", "Calcula gramos, porcentajes y temperaturas correctas para cada tipo de cera, resina, jabón o mezcla de cemento. Sin adivinar, sin desperdiciar."],
        ["Recomendación de materiales", "Si estás haciendo una geoda, la app recomienda la resina cristal. Si haces un shampoo bar con sosa, te explica el proceso. No necesitas experiencia previa."],
        ["Cálculo de sosa sin error", "Para jabón artesanal, calcula la cantidad exacta de NaOH o KOH usando los valores SAP de 12 aceites y mantecas. Incluye tallow, ricino, karité y más."],
        ["Costo real de producción", "Incluye materia prima, merma, mano de obra, empaque, etiqueta y comisiones de plataforma. Nada se queda por fuera."],
        ["Precio de venta sugerido", "Calcula el precio de venta según el margen que tú quieres — no el que el mercado te impone. También calcula precio mayorista automáticamente."],
        ["Fichas técnicas en PDF", "Exporta fichas de costos y producción en formato profesional, listas para imprimir o compartir con tu equipo y clientes."],
        ["Biblioteca de materiales", "Registra tus proveedores, costos actualizados y stock de cada material. Vincula directamente con las calculadoras."],
        ["Biblioteca de fórmulas", "Guarda tus mejores recetas con versiones para comparar qué fórmula da el mejor resultado y al mejor costo."],
        ["Comparador de escenarios", "Compara fórmulas, materiales o estrategias de precio lado a lado en una sola vista."],
        ["Disponible en español e inglés", "La app completa — calculadoras, exportaciones y panel — funciona en ambos idiomas con un solo clic."],
        ["Pago único — sin suscripción", "Acceso de por vida con todas las actualizaciones incluidas. Sin cargos mensuales, sin sorpresas."],
      ],
    },
    page4: {
      header: "Guía — Calculadora de Velas",
      title: "Calculadora de Velas",
      body:
        "Calcula la cantidad exacta de cera, fragancia, colorante y aditivos para cualquier tipo de vela. " +
        "Cada vez que seleccionas un tipo de cera aparece automáticamente su ficha técnica con temperaturas " +
        "de fusión, colada y adición de fragancia.",
      tableHead: ["Tipo de cera", "Fusión", "Colada", "FO a", "FO máx", "2ª colada"],
      tableBody: [
        ["Soja contenedor (464, GB464)", "49°C", "54°C", "57°C", "12%", "No"],
        ["Soja pilar (415, CB-135)", "58°C", "65°C", "68°C", "8%", "Sí"],
        ["Coco pura (76°F)", "45°C", "50°C", "54°C", "10%", "No"],
        ["Coco-Albaricoque (Coconut 83)", "46°C", "52°C", "55°C", "12%", "No"],
        ["Palma pilar", "54°C", "82°C", "82°C", "10%", "Sí"],
        ["Parafina estándar (MP 52°C)", "52°C", "68°C", "72°C", "10%", "Sí"],
        ["Cera de molde (MP 62°C)", "62°C", "75°C", "78°C", "8%", "Sí — requiere estearina 5–15%"],
        ["Cera de abeja pura", "63°C", "74°C", "74°C", "6%", "No"],
        ["Gel translúcido", "75°C", "88°C", "88°C", "5%", "No — solo vidrio"],
        ["Mezcla soya-parafina (50:50)", "51°C", "63°C", "66°C", "10%", "No"],
      ],
      stepsTitle: "Paso a paso — Velas",
      steps: [
        "Selecciona el tipo de vela (contenedor, molde, pilar, wax melt, tealight...)",
        "Elige el tipo de cera → aparece la ficha técnica con todas las temperaturas automáticamente",
        "Ingresa el volumen del molde en ml (o el peso final deseado en gramos)",
        "Agrega el % de fragancia — la app avisa si superas el máximo recomendado para esa cera",
        "Agrega colorante, estearina (para parafina de molde), Vybar e inhibidor UV si aplica",
        "Presiona Calcular → obtienes los gramos exactos de cada ingrediente",
        "Completa los costos y exporta la ficha en PDF",
      ],
      tipTitle: "Aditivos importantes para parafina de molde:",
      tipBody: "Estearina 5–15% (dureza y opacidad)  ·  Vybar 0.5–1% (retención de fragancia)  ·  Inhibidor UV 0.1–0.5% (evita amarillamiento)",
    },
    page5: {
      header: "Guía — Calculadora de Jabones",
      title: "Calculadora de Jabones — 13 métodos",
      body:
        "Cubre todos los métodos de elaboración, desde glicerina (sin sosa, fácil) hasta proceso frío, " +
        "caliente, jabón líquido con KOH, jabón de leche, sal marina y champú sólido. " +
        "Para métodos con sosa, calcula la cantidad exacta de NaOH o KOH automáticamente.",
      soapTableHead: ["Tipo de jabón", "Sosa", "Curado", "Características principales"],
      soapTableBody: [
        ["Glicerina en bloque", "No", "0 días", "Se derrite y vierte — lista en 1–2 horas"],
        ["Glicerina transparente (crystal)", "No", "0 días", "Efecto cristalino para embeds y capas"],
        ["Glicerina leche de cabra", "No", "0 días", "pH suave — ideal piel sensible y bebés"],
        ["Glicerina con exfoliante", "No", "0 días", "Avena, café, sal, azúcar, arena volcánica"],
        ["Proceso frío (CP)", "NaOH", "28 días", "Frío — saponificación natural — máx calidad"],
        ["Proceso caliente (HP)", "NaOH", "7 días", "Cocinado en olla — listo antes — más rústico"],
        ["Jabón de leche (CP)", "NaOH", "28 días", "Leche congelada en lugar de agua — muy cremoso"],
        ["Jabón líquido (KOH)", "KOH", "7 días", "Sosa potásica — pasta que se diluye en agua"],
        ["Jabón de Castilla", "NaOH", "180 días", "100% oliva — el más suave — curado largo"],
        ["Jabón de sal marina", "NaOH", "7 días", "80–100% coco + sal — cortar en 30–60 min"],
        ["Syndet / sin sosa", "No", "0 días", "pH neutro 5.5–6.5 — SCI, SCS, betaína"],
        ["Champú sólido glicerina", "No", "0 días", "Para cabello — se derrite y vierte"],
        ["Champú sólido CP", "NaOH", "28 días", "Ricino 15–20% — superfat bajo 0–3%"],
      ],
      oilsTitle: "Aceites para proceso frío / caliente",
      oilsTableHead: ["Aceite / Manteca", "SAP NaOH", "Función en el jabón", "% recomendado"],
      oilsTableBody: [
        ["Aceite de oliva", "0.134", "Suavidad, acondicionador, poca espuma", "30–70%"],
        ["Aceite de coco", "0.190", "Espuma dura y abundante, dureza", "20–35%"],
        ["Aceite de ricino ★", "0.128", "Espuma cremosa y estable — CLAVE", "5–15%"],
        ["Aceite de palma", "0.141", "Dureza, estabilidad, espuma cremosa", "15–30%"],
        ["Manteca de karité", "0.128", "Acondicionador premium, cremosidad", "5–15%"],
        ["Manteca de cacao", "0.137", "Dureza, suavidad", "5–15%"],
        ["Manteca de cerdo", "0.140", "Jabón firme, burbuja cremosa densa", "20–50%"],
        ["Sebo de vaca", "0.140", "Dureza extrema, espuma abundante", "20–50%"],
        ["Aceite de girasol", "0.134", "Suavidad ligera, acondicionador económico", "10–20%"],
        ["Aceite de aguacate", "0.133", "Nutrición profunda para pieles secas", "5–20%"],
        ["Almendra dulce", "0.136", "Suavidad suave para pieles delicadas", "10–20%"],
        ["Salvado de arroz", "0.128", "Vitamina E, antioxidante", "10–25%"],
      ],
      safetyLabel: "⚠ SEGURIDAD:",
      safetyBody: "NaOH y KOH son corrosivos. Usa guantes y gafas. SIEMPRE agrega la sosa al agua fría (o leche fría), NUNCA al revés.",
    },
    page6: {
      header: "Guía — Resina y Concreto",
      resinTitle: "Calculadora de Resina Epóxica",
      resinBody:
        "Selecciona la técnica que vas a hacer y la app recomienda automáticamente el tipo de resina ideal. " +
        "Calcula las cantidades exactas de Parte A y Parte B, el volumen del molde y el costo de pigmentos y acabados.",
      resinTableHead: ["Tipo de resina", "Ratio", "Capa máx", "Curado", "Usos principales"],
      resinTableBody: [
        ["Resina cristal", "1:1", "4 mm", "36 h", "Geoda, arte decorativo, cuadros — la más usada en LatAm"],
        ["Resina estándar", "2:1", "6 mm", "24 h", "Bandejas, encimeras, tables de río, uso general"],
        ["Resina UV", "1:1", "3 mm", "5 min", "Joyería fina, sellos — curado con luz UV"],
        ["Casting / fundición", "1:1", "10 cm", "48 h", "Piezas gruesas, figuras, letras — capas profundas"],
        ["Resina flexible", "1:1", "10 mm", "24 h", "Accesorios, tapetes — dobla sin quebrarse"],
        ["Recubrimiento de pisos", "2:1", "4 mm", "24 h", "Arte en pisos y superficies — alta resistencia"],
        ["Poliuretano", "1:1", "5 mm", "4 h", "Encapsulado, prototipos, producción rápida"],
        ["Laminado", "3:1", "2 mm", "12 h", "Fibra de vidrio, botes, superficies de alto rendimiento"],
      ],
      concreteTitle: "Calculadora de Concreto Decorativo",
      concreteBody:
        "Ingresa las dimensiones del molde y la app calcula el volumen automáticamente. " +
        "Elige el tipo de mezcla y obtén los gramos exactos de cemento, arena y agua.",
      concreteTableHead: ["Tipo de mezcla", "Relación", "Densidad", "Uso ideal"],
      concreteTableBody: [
        ["Decorativo (cemento:arena)", "1:2", "1.80 g/ml", "Macetas, esculturas, arte — sin grava"],
        ["Estándar (cemento:arena:grava)", "1:2:3", "2.20 g/ml", "Piezas estructurales, encimeras gruesas"],
        ["GFRC — Fibra de vidrio", "1:1.5 + fibra", "1.90 g/ml", "Piezas delgadas, fachadas, encimeras resistentes"],
        ["Fino (cemento:arena fina)", "1:1", "1.70 g/ml", "Detalles finos, moldes pequeños, azulejos"],
        ["Liviano (cemento + perlita)", "1:0.75 perlita", "1.20 g/ml", "Macetas grandes, piezas colgantes — muy liviano"],
        ["Cemento blanco decorativo", "1:2", "1.75 g/ml", "Piezas coloreadas con pigmentos y óxidos"],
        ["Hypertufa", "1:1.5:1.5", "0.90 g/ml", "Arte de jardín, piedras ornamentales, troncos falsos"],
        ["Microcemento / Microtopping", "1:0.67", "1.60 g/ml", "Capas 1–3 mm en paredes, pisos y muebles"],
      ],
    },
    page7: {
      header: "Guía — Yeso y Cálculo de Precios",
      plasterTitle: "Calculadora de Yeso y Escayola",
      plasterBody:
        "Calcula la relación agua/yeso correcta para cada tipo de yeso. " +
        "Ingresa las dimensiones del molde y obtén los gramos exactos de yeso y agua para no desperdiciar material.",
      plasterTableHead: ["Tipo de yeso", "Ratio agua:yeso", "Tiempo fragua", "Uso recomendado"],
      plasterTableBody: [
        ["Yeso estándar", "0.65–0.75", "20–30 min", "Figuras decorativas, piezas básicas"],
        ["Escayola / Gypsum", "0.55–0.65", "15–25 min", "Alta resistencia, blancura superior, detalles finos"],
        ["Yeso cerámico", "0.70–0.80", "25–35 min", "Alta porosidad para absorción de esmaltes"],
        ["Yeso piedra / Hydrocal", "0.30–0.40", "30–45 min", "Máxima dureza — modelos de alta precisión"],
        ["Yeso dental / Fuerte", "0.22–0.30", "8–15 min", "Dureza extrema — detalles ultra finos"],
      ],
      pricingTitle: "Cómo calcular el precio de venta correcto",
      pricingBody: "DIY Calc Pro calcula el precio basado en TODOS tus costos reales — no en una multiplicación simple que deja variables fuera.",
      pricingTableHead: ["Variable de costo", "¿Qué incluye?", "¿Por qué importa?"],
      pricingTableBody: [
        ["Costo de materiales", "Cera, resina, jabón, cemento, fragancia, pigmentos...", "El costo más visible pero no el único"],
        ["Merma estimada", "Material que se pierde, piezas que no quedan perfectas", "Recomendado 3–8%. No ignorarla."],
        ["Mano de obra", "Tu costo por hora × horas de producción", "Lo que más se olvida incluir"],
        ["Empaque", "Caja, papel, etiqueta, cinta, bolsas de presentación", "Puede ser 10–25% del costo total"],
        ["Comisión de plataforma", "Etsy, MercadoLibre, Instagram, marketplace", "5–15% que se va si no se calcula"],
        ["Margen deseado", "Tu ganancia en % sobre el precio de venta", "Mínimo recomendado: 30–35%"],
      ],
      tipTitle: "Importante:",
      tipBody:
        "Multiplicar el costo de materiales por 2 o 3 no es suficiente. Si no incluyes mano de obra, merma y comisiones, " +
        "puedes estar vendiendo con pérdida sin saberlo. DIY Calc Pro incluye todas estas variables automáticamente.",
    },
    page8: {
      header: "Activación y soporte",
      activationTitle: "Cómo activar tu licencia",
      activationSteps: [
        ["1. Compra en Hotmart", "Recibes un correo de confirmación con tu código de compra con formato XXXX-XXXX-XXXX-XXXX."],
        ["2. Crea tu cuenta", "Ve a la app, haz clic en Registrarse e ingresa tu correo, contraseña y el código del correo."],
        ["3. Acceso completo", "Tu licencia queda activada de inmediato — sin pasos adicionales — con acceso a todas las calculadoras, exportaciones y biblioteca de materiales."],
      ],
      faqTitle: "Preguntas frecuentes",
      faqTableHead: ["Pregunta", "Respuesta"],
      faqRows: [
        ["¿Puedo usar la app en varios dispositivos?", "Sí. Con tu cuenta puedes ingresar desde cualquier computador o celular con internet."],
        ["¿La app funciona sin internet?", "Requiere conexión para cargar y guardar datos."],
        ["¿Puedo exportar mis cálculos?", "Sí. Cada calculadora tiene un botón para exportar la ficha en PDF profesional."],
        ["¿Hay actualizaciones incluidas?", "Sí. Pago único incluye todas las actualizaciones futuras sin costo adicional."],
        ["¿La sosa / KOH se vende en la app?", "No. La app calcula cuánto necesitas. Los materiales los consigues en tu proveedor local."],
        ["¿Funciona para Colombia y LatAm?", "Sí. Está optimizada para artesanos de habla hispana. Moneda y unidades ajustables."],
        ["¿Está en inglés?", "Sí. La app completa está disponible en español e inglés con un solo clic."],
        ["¿Cómo contacto soporte?", "Escribe a soporte@seitonhome.com. Respuesta en 24–48 horas hábiles."],
      ],
      ctaSubtitle: "La calculadora completa para artesanos DIY",
      ctaFooter: "by Seiton Home  ·  soporte@seitonhome.com  ·  © 2025 Seiton Home",
    },
  },

  en: {
    filename: "DIY-Calc-Pro-Complete-Guide.pdf",
    footerTag: "Complete User Guide",
    footerCopy: "© 2025 Seiton Home. All rights reserved.",
    cover: {
      subtitle: "The complete calculator for DIY makers",
      tagline: "User Guide  ·  Benefits  ·  Technical Reference",
      indexHeading: "What will you find in this guide?",
      indexCards: [
        { num: "01", title: "What is DIY Calc Pro?", desc: "Product description and who it's for" },
        { num: "02", title: "Full benefits", desc: "Everything it includes and how it helps you" },
        { num: "03", title: "Candle Calculator", desc: "10 wax types with exact temperatures" },
        { num: "04", title: "Soap Calculator", desc: "13 methods — melt & pour, lye, salt, milk" },
        { num: "05", title: "Resin Calculator", desc: "8 types by technique — geode, jewelry, floors" },
        { num: "06", title: "Concrete, Plaster & Pricing", desc: "Mixes, hypertufa, microcement, fair pricing" },
      ],
      footerCopy: "© 2025 Seiton Home · All rights reserved",
    },
    page2: {
      header: "Product description",
      whatIsTitle: "What is DIY Calc Pro?",
      whatIsBody:
        "DIY Calc Pro is the specialized calculation tool for makers who produce candles, soaps, epoxy resin " +
        "pieces, decorative concrete, and plaster. It gives you the exact proportions for every ingredient, " +
        "the technical parameters of each material, the real production cost, and the selling price with the " +
        "margin you choose — all in seconds, with no advanced technical knowledge required.",
      forWhoTitle: "Who is it for?",
      forWho: [
        "Candle makers who want to know how much fragrance to use per wax type and at what temperature to work",
        "People who work with melt-and-pour glycerin soap and want consistent, professional results",
        "Epoxy resin artists who need to know which type to use depending on the technique (geode, jewelry, floors, art pieces)",
        "Handmade soap entrepreneurs who need to calculate the exact lye amount so nothing is wasted",
        "Makers who create pieces in decorative concrete, hypertufa, microcement, or plaster",
        "Businesses that need to calculate the real cost and correct selling price before launching a product",
      ],
      problemTitle: "What problem does it solve?",
      problems: [
        { title: "No exact proportions", desc: "Not knowing how much of each ingredient to use leads to wasted materials and inconsistent results batch after batch." },
        { title: "No real cost", desc: "Setting prices without calculating all the costs — waste, labor, packaging, fees — results in sales at a real loss." },
        { title: "No technical reference", desc: "Not having access to material technical sheets forces you to experiment from scratch every time, wasting time and money." },
      ],
    },
    page3: {
      header: "Product benefits",
      title: "Full benefits of DIY Calc Pro",
      benefits: [
        ["Exact proportions per material", "Calculates the correct grams, percentages, and temperatures for every type of wax, resin, soap, or concrete mix. No guessing, no waste."],
        ["Material recommendations", "If you're making a geode, the app recommends crystal resin. If you're making a lye-based shampoo bar, it explains the process. No prior experience needed."],
        ["Error-free lye calculation", "For handmade soap, it calculates the exact amount of NaOH or KOH using the SAP values of 12 oils and butters. Includes tallow, castor, shea, and more."],
        ["Real production cost", "Includes raw materials, waste, labor, packaging, labels, and platform fees. Nothing is left out."],
        ["Suggested selling price", "Calculates the selling price based on the margin you want — not the one the market imposes. Also calculates the wholesale price automatically."],
        ["Technical sheets in PDF", "Export cost and production sheets in a professional format, ready to print or share with your team and clients."],
        ["Materials library", "Track your suppliers, updated costs, and stock for each material. Links directly to the calculators."],
        ["Formula library", "Save your best recipes with versions to compare which formula gives the best result at the best cost."],
        ["Scenario comparator", "Compare formulas, materials, or pricing strategies side by side in a single view."],
        ["Available in Spanish and English", "The full app — calculators, exports, and dashboard — works in both languages with a single click."],
        ["One-time payment — no subscription", "Lifetime access with all updates included. No monthly fees, no surprises."],
      ],
    },
    page4: {
      header: "Guide — Candle Calculator",
      title: "Candle Calculator",
      body:
        "Calculates the exact amount of wax, fragrance, dye, and additives for any type of candle. " +
        "Every time you select a wax type, its technical sheet appears automatically with melting, " +
        "pouring, and fragrance-adding temperatures.",
      tableHead: ["Wax type", "Melt", "Pour", "Fragrance at", "Max fragrance", "2nd pour"],
      tableBody: [
        ["Container soy (464, GB464)", "49°C", "54°C", "57°C", "12%", "No"],
        ["Pillar soy (415, CB-135)", "58°C", "65°C", "68°C", "8%", "Yes"],
        ["Pure coconut (76°F)", "45°C", "50°C", "54°C", "10%", "No"],
        ["Coconut-Apricot (Coconut 83)", "46°C", "52°C", "55°C", "12%", "No"],
        ["Pillar palm", "54°C", "82°C", "82°C", "10%", "Yes"],
        ["Standard paraffin (MP 52°C)", "52°C", "68°C", "72°C", "10%", "Yes"],
        ["Molding wax (MP 62°C)", "62°C", "75°C", "78°C", "8%", "Yes — requires 5–15% stearic acid"],
        ["Pure beeswax", "63°C", "74°C", "74°C", "6%", "No"],
        ["Translucent gel", "75°C", "88°C", "88°C", "5%", "No — glass only"],
        ["Soy-paraffin blend (50:50)", "51°C", "63°C", "66°C", "10%", "No"],
      ],
      stepsTitle: "Step by step — Candles",
      steps: [
        "Select the candle type (container, mold, pillar, wax melt, tealight...)",
        "Choose the wax type → the technical sheet with all temperatures appears automatically",
        "Enter the mold volume in ml (or the desired final weight in grams)",
        "Add the fragrance % — the app warns you if you exceed the recommended maximum for that wax",
        "Add dye, stearic acid (for molding paraffin), Vybar, and UV inhibitor if applicable",
        "Press Calculate → get the exact grams of each ingredient",
        "Fill in the costs and export the sheet as a PDF",
      ],
      tipTitle: "Important additives for molding paraffin:",
      tipBody: "Stearic acid 5–15% (hardness and opacity)  ·  Vybar 0.5–1% (fragrance retention)  ·  UV inhibitor 0.1–0.5% (prevents yellowing)",
    },
    page5: {
      header: "Guide — Soap Calculator",
      title: "Soap Calculator — 13 methods",
      body:
        "Covers every soapmaking method, from glycerin (no lye, easy) to cold process, hot process, " +
        "liquid soap with KOH, milk soap, sea salt soap, and solid shampoo. " +
        "For lye-based methods, it automatically calculates the exact amount of NaOH or KOH.",
      soapTableHead: ["Soap type", "Lye", "Cure time", "Main characteristics"],
      soapTableBody: [
        ["Melt & pour block", "No", "0 days", "Melt and pour — ready in 1–2 hours"],
        ["Clear glycerin (crystal)", "No", "0 days", "Crystal-clear effect for embeds and layers"],
        ["Goat milk glycerin", "No", "0 days", "Gentle pH — ideal for sensitive skin and babies"],
        ["Glycerin with exfoliant", "No", "0 days", "Oatmeal, coffee, salt, sugar, volcanic sand"],
        ["Cold process (CP)", "NaOH", "28 days", "Cold — natural saponification — top quality"],
        ["Hot process (HP)", "NaOH", "7 days", "Cooked in a pot — ready sooner — more rustic"],
        ["Milk soap (CP)", "NaOH", "28 days", "Frozen milk instead of water — very creamy"],
        ["Liquid soap (KOH)", "KOH", "7 days", "Potassium hydroxide — a paste diluted in water"],
        ["Castile soap", "NaOH", "180 days", "100% olive oil — the gentlest — long cure"],
        ["Sea salt soap", "NaOH", "7 days", "80–100% coconut + salt — cut within 30–60 min"],
        ["Syndet / no lye", "No", "0 days", "Neutral pH 5.5–6.5 — SCI, SCS, betaine"],
        ["Glycerin solid shampoo", "No", "0 days", "For hair — melt and pour"],
        ["Cold process solid shampoo", "NaOH", "28 days", "Castor oil 15–20% — low superfat 0–3%"],
      ],
      oilsTitle: "Oils for cold / hot process",
      oilsTableHead: ["Oil / Butter", "SAP NaOH", "Role in the soap", "Recommended %"],
      oilsTableBody: [
        ["Olive oil", "0.134", "Gentleness, conditioning, low lather", "30–70%"],
        ["Coconut oil", "0.190", "Big, fluffy lather, hardness", "20–35%"],
        ["Castor oil ★", "0.128", "Creamy, stable lather — KEY", "5–15%"],
        ["Palm oil", "0.141", "Hardness, stability, creamy lather", "15–30%"],
        ["Shea butter", "0.128", "Premium conditioning, creaminess", "5–15%"],
        ["Cocoa butter", "0.137", "Hardness, softness", "5–15%"],
        ["Lard", "0.140", "Firm bar, dense creamy bubbles", "20–50%"],
        ["Beef tallow", "0.140", "Extreme hardness, abundant lather", "20–50%"],
        ["Sunflower oil", "0.134", "Light gentleness, budget conditioning", "10–20%"],
        ["Avocado oil", "0.133", "Deep nourishment for dry skin", "5–20%"],
        ["Sweet almond oil", "0.136", "Gentle softness for delicate skin", "10–20%"],
        ["Rice bran oil", "0.128", "Vitamin E, antioxidant", "10–25%"],
      ],
      safetyLabel: "⚠ SAFETY:",
      safetyBody: "NaOH and KOH are corrosive. Wear gloves and goggles. ALWAYS add the lye to cold water (or cold milk), NEVER the other way around.",
    },
    page6: {
      header: "Guide — Resin and Concrete",
      resinTitle: "Epoxy Resin Calculator",
      resinBody:
        "Select the technique you're going to do and the app automatically recommends the ideal resin type. " +
        "Calculates the exact amounts of Part A and Part B, the mold volume, and the cost of pigments and finishes.",
      resinTableHead: ["Resin type", "Ratio", "Max layer", "Cure time", "Main uses"],
      resinTableBody: [
        ["Crystal resin", "1:1", "4 mm", "36 h", "Geode, decorative art, canvases — the most used in Latin America"],
        ["Standard resin", "2:1", "6 mm", "24 h", "Trays, countertops, river tables, general use"],
        ["UV resin", "1:1", "3 mm", "5 min", "Fine jewelry, seals — cured with UV light"],
        ["Casting", "1:1", "10 cm", "48 h", "Thick pieces, figures, letters — deep pours"],
        ["Flexible resin", "1:1", "10 mm", "24 h", "Accessories, mats — bends without cracking"],
        ["Floor coating", "2:1", "4 mm", "24 h", "Floor and surface art — high durability"],
        ["Polyurethane", "1:1", "5 mm", "4 h", "Encapsulation, prototypes, fast production"],
        ["Laminating", "3:1", "2 mm", "12 h", "Fiberglass, boats, high-performance surfaces"],
      ],
      concreteTitle: "Decorative Concrete Calculator",
      concreteBody:
        "Enter the mold dimensions and the app calculates the volume automatically. " +
        "Choose the mix type and get the exact grams of cement, sand, and water.",
      concreteTableHead: ["Mix type", "Ratio", "Density", "Ideal use"],
      concreteTableBody: [
        ["Decorative (cement:sand)", "1:2", "1.80 g/ml", "Planters, sculptures, art — no gravel"],
        ["Standard (cement:sand:gravel)", "1:2:3", "2.20 g/ml", "Structural pieces, thick countertops"],
        ["GFRC — Fiberglass", "1:1.5 + fiber", "1.90 g/ml", "Thin pieces, facades, durable countertops"],
        ["Fine (cement:fine sand)", "1:1", "1.70 g/ml", "Fine details, small molds, tiles"],
        ["Lightweight (cement + perlite)", "1:0.75 perlite", "1.20 g/ml", "Large planters, hanging pieces — very light"],
        ["White decorative cement", "1:2", "1.75 g/ml", "Pieces colored with pigments and oxides"],
        ["Hypertufa", "1:1.5:1.5", "0.90 g/ml", "Garden art, ornamental stones, faux logs"],
        ["Microcement / Microtopping", "1:0.67", "1.60 g/ml", "1–3 mm coats on walls, floors, and furniture"],
      ],
    },
    page7: {
      header: "Guide — Plaster and Price Calculation",
      plasterTitle: "Plaster Calculator",
      plasterBody:
        "Calculates the correct water/plaster ratio for each type of plaster. " +
        "Enter the mold dimensions and get the exact grams of plaster and water so no material is wasted.",
      plasterTableHead: ["Plaster type", "Water:plaster ratio", "Setting time", "Recommended use"],
      plasterTableBody: [
        ["Standard plaster", "0.65–0.75", "20–30 min", "Decorative figures, basic pieces"],
        ["Gypsum plaster", "0.55–0.65", "15–25 min", "High strength, superior whiteness, fine details"],
        ["Ceramic plaster", "0.70–0.80", "25–35 min", "High porosity for glaze absorption"],
        ["Stone plaster / Hydrocal", "0.30–0.40", "30–45 min", "Maximum hardness — high-precision models"],
        ["Dental / high-strength plaster", "0.22–0.30", "8–15 min", "Extreme hardness — ultra-fine details"],
      ],
      pricingTitle: "How to calculate the correct selling price",
      pricingBody: "DIY Calc Pro calculates the price based on ALL your real costs — not a simple multiplication that leaves variables out.",
      pricingTableHead: ["Cost variable", "What does it include?", "Why does it matter?"],
      pricingTableBody: [
        ["Material cost", "Wax, resin, soap, cement, fragrance, pigments...", "The most visible cost, but not the only one"],
        ["Estimated waste", "Material lost, pieces that don't turn out perfect", "Recommended 3–8%. Don't ignore it."],
        ["Labor", "Your hourly cost × production hours", "The most commonly forgotten cost"],
        ["Packaging", "Box, paper, label, tape, presentation bags", "Can be 10–25% of the total cost"],
        ["Platform fee", "Etsy, Amazon, Instagram, marketplaces", "5–15% lost if not calculated"],
        ["Desired margin", "Your profit % on the selling price", "Recommended minimum: 30–35%"],
      ],
      tipTitle: "Important:",
      tipBody:
        "Multiplying material cost by 2 or 3 is not enough. If you don't include labor, waste, and fees, " +
        "you might be selling at a loss without knowing it. DIY Calc Pro automatically includes all these variables.",
    },
    page8: {
      header: "Activation and support",
      activationTitle: "How to activate your license",
      activationSteps: [
        ["1. Purchase on Hotmart", "You receive a confirmation email with your purchase code in the format XXXX-XXXX-XXXX-XXXX."],
        ["2. Create your account", "Go to the app, click Register, and enter your email, password, and the code from the email."],
        ["3. Full access", "Your license is activated immediately — no extra steps — with access to all calculators, exports, and the materials library."],
      ],
      faqTitle: "Frequently asked questions",
      faqTableHead: ["Question", "Answer"],
      faqRows: [
        ["Can I use the app on multiple devices?", "Yes. With your account you can log in from any computer or phone with internet access."],
        ["Does the app work offline?", "It requires a connection to load and save data."],
        ["Can I export my calculations?", "Yes. Every calculator has a button to export the sheet as a professional PDF."],
        ["Are updates included?", "Yes. The one-time payment includes all future updates at no extra cost."],
        ["Does the app sell lye / KOH?", "No. The app calculates how much you need. You get the materials from your local supplier."],
        ["Does it work for Latin America?", "Yes. It's optimized for Spanish-speaking makers too. Currency and units are adjustable."],
        ["Is it available in Spanish?", "Yes. The full app is available in Spanish and English with a single click."],
        ["How do I contact support?", "Email soporte@seitonhome.com. Response within 24–48 business hours."],
      ],
      ctaSubtitle: "The complete calculator for DIY makers",
      ctaFooter: "by Seiton Home  ·  soporte@seitonhome.com  ·  © 2025 Seiton Home",
    },
  },

  fr: {
    filename: "DIY-Calc-Pro-Guide-Complet.pdf",
    footerTag: "Guide d'utilisation complet",
    footerCopy: "© 2025 Seiton Home. Tous droits réservés.",
    cover: {
      subtitle: "Le calculateur complet pour les créateurs DIY",
      tagline: "Guide d'utilisation  ·  Avantages  ·  Référence technique",
      indexHeading: "Que trouverez-vous dans ce guide ?",
      indexCards: [
        { num: "01", title: "Qu'est-ce que DIY Calc Pro ?", desc: "Description du produit et à qui il s'adresse" },
        { num: "02", title: "Avantages complets", desc: "Tout ce qu'il inclut et comment il vous aide" },
        { num: "03", title: "Calculateur de Bougies", desc: "10 types de cire avec températures exactes" },
        { num: "04", title: "Calculateur de Savons", desc: "13 méthodes — glycérine, soude, sel, lait" },
        { num: "05", title: "Calculateur de Résine", desc: "8 types selon la technique — géode, bijoux, sols" },
        { num: "06", title: "Béton, Plâtre et Prix", desc: "Mélanges, hypertufa, microciment, juste prix" },
      ],
      footerCopy: "© 2025 Seiton Home · Tous droits réservés",
    },
    page2: {
      header: "Description du produit",
      whatIsTitle: "Qu'est-ce que DIY Calc Pro ?",
      whatIsBody:
        "DIY Calc Pro est l'outil de calcul spécialisé pour les artisans qui fabriquent des bougies, des savons, " +
        "des objets en résine époxy, du béton décoratif et du plâtre. Il vous donne les proportions exactes de " +
        "chaque ingrédient, les paramètres techniques de chaque matériau, le coût réel de production et le prix " +
        "de vente avec la marge que vous choisissez — le tout en quelques secondes, sans connaissances techniques avancées.",
      forWhoTitle: "À qui s'adresse-t-il ?",
      forWho: [
        "Les artisans qui fabriquent des bougies et veulent savoir quelle quantité de parfum utiliser selon le type de cire et à quelle température travailler",
        "Les personnes qui travaillent avec la glycérine et veulent des résultats cohérents et professionnels",
        "Les artistes de résine époxy qui doivent savoir quel type utiliser selon la technique (géode, bijoux, sols, tableaux)",
        "Les entrepreneurs de savon artisanal qui doivent calculer la soude exacte pour ne rien gaspiller",
        "Les artisans qui créent des objets en béton décoratif, hypertufa, microciment ou plâtre",
        "Les entreprises qui doivent calculer le coût réel et le juste prix de vente avant de lancer un produit",
      ],
      problemTitle: "Quel problème résout-il ?",
      problems: [
        { title: "Sans proportions exactes", desc: "Ne pas savoir quelle quantité de chaque ingrédient utiliser entraîne du gaspillage de matériaux et des résultats incohérents d'un lot à l'autre." },
        { title: "Sans coût réel", desc: "Fixer les prix sans calculer tous les coûts — pertes, main-d'œuvre, emballage, commissions — génère des ventes à perte réelle." },
        { title: "Sans référence technique", desc: "Ne pas avoir accès aux fiches techniques des matériaux oblige à expérimenter à chaque fois depuis le début, ce qui fait perdre du temps et de l'argent." },
      ],
    },
    page3: {
      header: "Avantages du produit",
      title: "Tous les avantages de DIY Calc Pro",
      benefits: [
        ["Proportions exactes par matériau", "Calcule les grammes, pourcentages et températures corrects pour chaque type de cire, résine, savon ou mélange de béton. Sans deviner, sans gaspiller."],
        ["Recommandation de matériaux", "Si vous faites une géode, l'application recommande la résine cristal. Si vous faites un shampoing solide à la soude, elle vous explique le processus. Aucune expérience préalable requise."],
        ["Calcul de soude sans erreur", "Pour le savon artisanal, calcule la quantité exacte de NaOH ou KOH en utilisant les valeurs SAP de 12 huiles et beurres. Inclut le suif, le ricin, le karité et plus."],
        ["Coût réel de production", "Inclut matières premières, pertes, main-d'œuvre, emballage, étiquette et commissions de plateforme. Rien n'est laissé de côté."],
        ["Prix de vente suggéré", "Calcule le prix de vente selon la marge que vous voulez — pas celle imposée par le marché. Calcule aussi automatiquement le prix de gros."],
        ["Fiches techniques en PDF", "Exportez des fiches de coûts et de production dans un format professionnel, prêtes à imprimer ou à partager avec votre équipe et vos clients."],
        ["Bibliothèque de matériaux", "Enregistrez vos fournisseurs, coûts actualisés et stock de chaque matériau. Se relie directement aux calculateurs."],
        ["Bibliothèque de formules", "Enregistrez vos meilleures recettes avec des versions pour comparer quelle formule donne le meilleur résultat au meilleur coût."],
        ["Comparateur de scénarios", "Comparez formules, matériaux ou stratégies de prix côte à côte en une seule vue."],
        ["Disponible en espagnol et en anglais", "L'application complète — calculateurs, exports et tableau de bord — fonctionne dans les deux langues en un clic."],
        ["Paiement unique — sans abonnement", "Accès à vie avec toutes les mises à jour incluses. Pas de frais mensuels, pas de surprises."],
      ],
    },
    page4: {
      header: "Guide — Calculateur de Bougies",
      title: "Calculateur de Bougies",
      body:
        "Calcule la quantité exacte de cire, parfum, colorant et additifs pour tout type de bougie. " +
        "Chaque fois que vous sélectionnez un type de cire, sa fiche technique apparaît automatiquement " +
        "avec les températures de fusion, de coulée et d'ajout du parfum.",
      tableHead: ["Type de cire", "Fusion", "Coulée", "Parfum à", "Parfum max", "2e coulée"],
      tableBody: [
        ["Soja pour contenant (464, GB464)", "49°C", "54°C", "57°C", "12%", "Non"],
        ["Soja pour pilier (415, CB-135)", "58°C", "65°C", "68°C", "8%", "Oui"],
        ["Coco pure (76°F)", "45°C", "50°C", "54°C", "10%", "Non"],
        ["Coco-Abricot (Coconut 83)", "46°C", "52°C", "55°C", "12%", "Non"],
        ["Palme pour pilier", "54°C", "82°C", "82°C", "10%", "Oui"],
        ["Paraffine standard (PF 52°C)", "52°C", "68°C", "72°C", "10%", "Oui"],
        ["Cire à moule (PF 62°C)", "62°C", "75°C", "78°C", "8%", "Oui — nécessite 5–15% d'acide stéarique"],
        ["Cire d'abeille pure", "63°C", "74°C", "74°C", "6%", "Non"],
        ["Gel translucide", "75°C", "88°C", "88°C", "5%", "Non — verre uniquement"],
        ["Mélange soja-paraffine (50:50)", "51°C", "63°C", "66°C", "10%", "Non"],
      ],
      stepsTitle: "Étape par étape — Bougies",
      steps: [
        "Sélectionnez le type de bougie (contenant, moule, pilier, fondant, chauffe-plat...)",
        "Choisissez le type de cire → la fiche technique avec toutes les températures apparaît automatiquement",
        "Saisissez le volume du moule en ml (ou le poids final souhaité en grammes)",
        "Ajoutez le % de parfum — l'application vous avertit si vous dépassez le maximum recommandé pour cette cire",
        "Ajoutez colorant, acide stéarique (pour la paraffine à moule), Vybar et inhibiteur UV si applicable",
        "Appuyez sur Calculer → obtenez les grammes exacts de chaque ingrédient",
        "Complétez les coûts et exportez la fiche en PDF",
      ],
      tipTitle: "Additifs importants pour la paraffine à moule :",
      tipBody: "Acide stéarique 5–15% (dureté et opacité)  ·  Vybar 0.5–1% (rétention du parfum)  ·  Inhibiteur UV 0.1–0.5% (évite le jaunissement)",
    },
    page5: {
      header: "Guide — Calculateur de Savons",
      title: "Calculateur de Savons — 13 méthodes",
      body:
        "Couvre toutes les méthodes de fabrication, de la glycérine (sans soude, facile) au procédé à froid, " +
        "à chaud, au savon liquide au KOH, au savon au lait, au sel marin et au shampoing solide. " +
        "Pour les méthodes à la soude, calcule automatiquement la quantité exacte de NaOH ou KOH.",
      soapTableHead: ["Type de savon", "Soude", "Cure", "Caractéristiques principales"],
      soapTableBody: [
        ["Glycérine en bloc", "Non", "0 jour", "Fond et se verse — prêt en 1–2 heures"],
        ["Glycérine transparente (crystal)", "Non", "0 jour", "Effet cristallin pour inclusions et couches"],
        ["Glycérine au lait de chèvre", "Non", "0 jour", "pH doux — idéal peau sensible et bébés"],
        ["Glycérine avec exfoliant", "Non", "0 jour", "Avoine, café, sel, sucre, sable volcanique"],
        ["Procédé à froid (CP)", "NaOH", "28 jours", "À froid — saponification naturelle — qualité max"],
        ["Procédé à chaud (HP)", "NaOH", "7 jours", "Cuit à la marmite — prêt plus tôt — plus rustique"],
        ["Savon au lait (CP)", "NaOH", "28 jours", "Lait congelé à la place de l'eau — très crémeux"],
        ["Savon liquide (KOH)", "KOH", "7 jours", "Potasse caustique — pâte diluée dans l'eau"],
        ["Savon de Castille", "NaOH", "180 jours", "100% olive — le plus doux — longue cure"],
        ["Savon au sel marin", "NaOH", "7 jours", "80–100% coco + sel — à couper en 30–60 min"],
        ["Syndet / sans soude", "Non", "0 jour", "pH neutre 5,5–6,5 — SCI, SCS, bétaïne"],
        ["Shampoing solide glycérine", "Non", "0 jour", "Pour cheveux — fond et se verse"],
        ["Shampoing solide CP", "NaOH", "28 jours", "Ricin 15–20% — surgraissage bas 0–3%"],
      ],
      oilsTitle: "Huiles pour procédé à froid / à chaud",
      oilsTableHead: ["Huile / Beurre", "SAP NaOH", "Rôle dans le savon", "% recommandé"],
      oilsTableBody: [
        ["Huile d'olive", "0.134", "Douceur, soin, peu de mousse", "30–70%"],
        ["Huile de coco", "0.190", "Mousse abondante et ferme, dureté", "20–35%"],
        ["Huile de ricin ★", "0.128", "Mousse crémeuse et stable — CLÉ", "5–15%"],
        ["Huile de palme", "0.141", "Dureté, stabilité, mousse crémeuse", "15–30%"],
        ["Beurre de karité", "0.128", "Soin premium, onctuosité", "5–15%"],
        ["Beurre de cacao", "0.137", "Dureté, douceur", "5–15%"],
        ["Saindoux", "0.140", "Savon ferme, mousse crémeuse dense", "20–50%"],
        ["Suif de bœuf", "0.140", "Dureté extrême, mousse abondante", "20–50%"],
        ["Huile de tournesol", "0.134", "Douceur légère, soin économique", "10–20%"],
        ["Huile d'avocat", "0.133", "Nutrition profonde pour peaux sèches", "5–20%"],
        ["Amande douce", "0.136", "Douceur délicate pour peaux sensibles", "10–20%"],
        ["Son de riz", "0.128", "Vitamine E, antioxydant", "10–25%"],
      ],
      safetyLabel: "⚠ SÉCURITÉ :",
      safetyBody: "NaOH et KOH sont corrosifs. Portez des gants et des lunettes. Ajoutez TOUJOURS la soude à l'eau froide (ou au lait froid), JAMAIS l'inverse.",
    },
    page6: {
      header: "Guide — Résine et Béton",
      resinTitle: "Calculateur de Résine Époxy",
      resinBody:
        "Sélectionnez la technique que vous allez réaliser et l'application recommande automatiquement le type " +
        "de résine idéal. Calcule les quantités exactes de Partie A et Partie B, le volume du moule et le coût " +
        "des pigments et finitions.",
      resinTableHead: ["Type de résine", "Ratio", "Couche max", "Durcissement", "Utilisations principales"],
      resinTableBody: [
        ["Résine cristal", "1:1", "4 mm", "36 h", "Géode, art décoratif, tableaux — la plus utilisée en Amérique latine"],
        ["Résine standard", "2:1", "6 mm", "24 h", "Plateaux, plans de travail, tables rivière, usage général"],
        ["Résine UV", "1:1", "3 mm", "5 min", "Bijouterie fine, sceaux — durcissement par lumière UV"],
        ["Coulage / moulage", "1:1", "10 cm", "48 h", "Pièces épaisses, figurines, lettres — coulées profondes"],
        ["Résine flexible", "1:1", "10 mm", "24 h", "Accessoires, tapis — se plie sans se casser"],
        ["Revêtement de sol", "2:1", "4 mm", "24 h", "Art sur sols et surfaces — haute résistance"],
        ["Polyuréthane", "1:1", "5 mm", "4 h", "Encapsulation, prototypes, production rapide"],
        ["Stratification", "3:1", "2 mm", "12 h", "Fibre de verre, bateaux, surfaces haute performance"],
      ],
      concreteTitle: "Calculateur de Béton Décoratif",
      concreteBody:
        "Entrez les dimensions du moule et l'application calcule le volume automatiquement. " +
        "Choisissez le type de mélange et obtenez les grammes exacts de ciment, sable et eau.",
      concreteTableHead: ["Type de mélange", "Ratio", "Densité", "Usage idéal"],
      concreteTableBody: [
        ["Décoratif (ciment:sable)", "1:2", "1,80 g/ml", "Pots, sculptures, art — sans gravier"],
        ["Standard (ciment:sable:gravier)", "1:2:3", "2,20 g/ml", "Pièces structurelles, plans de travail épais"],
        ["GFRC — Fibre de verre", "1:1.5 + fibre", "1,90 g/ml", "Pièces fines, façades, plans de travail résistants"],
        ["Fin (ciment:sable fin)", "1:1", "1,70 g/ml", "Détails fins, petits moules, carreaux"],
        ["Léger (ciment + perlite)", "1:0,75 perlite", "1,20 g/ml", "Grands pots, pièces suspendues — très léger"],
        ["Ciment blanc décoratif", "1:2", "1,75 g/ml", "Pièces colorées avec pigments et oxydes"],
        ["Hypertufa", "1:1.5:1.5", "0,90 g/ml", "Art de jardin, pierres ornementales, faux troncs"],
        ["Microciment / Microtopping", "1:0.67", "1,60 g/ml", "Couches 1–3 mm sur murs, sols et meubles"],
      ],
    },
    page7: {
      header: "Guide — Plâtre et Calcul des Prix",
      plasterTitle: "Calculateur de Plâtre",
      plasterBody:
        "Calcule le rapport eau/plâtre correct pour chaque type de plâtre. " +
        "Entrez les dimensions du moule et obtenez les grammes exacts de plâtre et d'eau pour ne pas gaspiller de matériau.",
      plasterTableHead: ["Type de plâtre", "Ratio eau:plâtre", "Temps de prise", "Usage recommandé"],
      plasterTableBody: [
        ["Plâtre standard", "0,65–0,75", "20–30 min", "Figurines décoratives, pièces de base"],
        ["Plâtre de moulage / Gypse", "0,55–0,65", "15–25 min", "Haute résistance, blancheur supérieure, détails fins"],
        ["Plâtre céramique", "0,70–0,80", "25–35 min", "Haute porosité pour l'absorption des émaux"],
        ["Plâtre pierre / Hydrocal", "0,30–0,40", "30–45 min", "Dureté maximale — modèles de haute précision"],
        ["Plâtre dentaire / dur", "0,22–0,30", "8–15 min", "Dureté extrême — détails ultra-fins"],
      ],
      pricingTitle: "Comment calculer le juste prix de vente",
      pricingBody: "DIY Calc Pro calcule le prix en se basant sur TOUS vos coûts réels — pas sur une simple multiplication qui laisse des variables de côté.",
      pricingTableHead: ["Variable de coût", "Qu'est-ce que ça inclut ?", "Pourquoi est-ce important ?"],
      pricingTableBody: [
        ["Coût des matériaux", "Cire, résine, savon, ciment, parfum, pigments...", "Le coût le plus visible, mais pas le seul"],
        ["Pertes estimées", "Matériau perdu, pièces imparfaites", "Recommandé 3–8%. Ne pas l'ignorer."],
        ["Main-d'œuvre", "Votre coût horaire × heures de production", "Ce qu'on oublie le plus souvent d'inclure"],
        ["Emballage", "Boîte, papier, étiquette, ruban, sacs de présentation", "Peut représenter 10–25% du coût total"],
        ["Commission de plateforme", "Etsy, Amazon, Instagram, marketplaces", "5–15% perdus si non calculés"],
        ["Marge souhaitée", "Votre profit en % sur le prix de vente", "Minimum recommandé : 30–35%"],
      ],
      tipTitle: "Important :",
      tipBody:
        "Multiplier le coût des matériaux par 2 ou 3 ne suffit pas. Si vous n'incluez pas la main-d'œuvre, les pertes " +
        "et les commissions, vous pourriez vendre à perte sans le savoir. DIY Calc Pro inclut automatiquement toutes ces variables.",
    },
    page8: {
      header: "Activation et assistance",
      activationTitle: "Comment activer votre licence",
      activationSteps: [
        ["1. Achat sur Hotmart", "Vous recevez un e-mail de confirmation avec votre code d'achat au format XXXX-XXXX-XXXX-XXXX."],
        ["2. Créez votre compte", "Allez sur l'application, cliquez sur S'inscrire et entrez votre e-mail, mot de passe et le code reçu."],
        ["3. Accès complet", "Votre licence est activée immédiatement — sans étape supplémentaire — avec accès à tous les calculateurs, exports et à la bibliothèque de matériaux."],
      ],
      faqTitle: "Questions fréquentes",
      faqTableHead: ["Question", "Réponse"],
      faqRows: [
        ["Puis-je utiliser l'application sur plusieurs appareils ?", "Oui. Avec votre compte, vous pouvez vous connecter depuis n'importe quel ordinateur ou téléphone avec internet."],
        ["L'application fonctionne-t-elle sans internet ?", "Elle nécessite une connexion pour charger et enregistrer les données."],
        ["Puis-je exporter mes calculs ?", "Oui. Chaque calculateur dispose d'un bouton pour exporter la fiche en PDF professionnel."],
        ["Les mises à jour sont-elles incluses ?", "Oui. Le paiement unique inclut toutes les futures mises à jour sans frais supplémentaires."],
        ["La soude / le KOH est-il vendu dans l'application ?", "Non. L'application calcule la quantité dont vous avez besoin. Vous vous procurez les matériaux chez votre fournisseur local."],
        ["Fonctionne-t-elle pour l'Amérique latine ?", "Oui. Elle est aussi optimisée pour les artisans hispanophones. Devise et unités ajustables."],
        ["Est-elle disponible en espagnol ?", "Oui. L'application complète est disponible en espagnol et en anglais en un clic."],
        ["Comment contacter le support ?", "Écrivez à soporte@seitonhome.com. Réponse sous 24 à 48 heures ouvrables."],
      ],
      ctaSubtitle: "Le calculateur complet pour les créateurs DIY",
      ctaFooter: "by Seiton Home  ·  soporte@seitonhome.com  ·  © 2025 Seiton Home",
    },
  },
};

export async function exportGuidePDF(locale: GuideLocale = "es") {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const c = CONTENT[locale];

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
    doc.text(`DIY Calc Pro by Seiton Home  ·  ${c.footerTag}`, 14, H - 3.5);
    doc.text(c.footerCopy, W - 14, H - 3.5, { align: "right" });
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
  // PAGE 1 — COVER
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();

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
  doc.text(c.cover.subtitle, W / 2, 53, { align: "center" });

  doc.setFontSize(9.5);
  doc.setTextColor(237, 232, 225);
  doc.text(c.cover.tagline, W / 2, 66, { align: "center" });

  let y = 96;
  doc.setTextColor(...DARK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(c.cover.indexHeading, W / 2, y, { align: "center" });
  y += 10;

  const cW = (W - 42) / 2;
  let col = 0;
  let rowY = y;

  for (const card of c.cover.indexCards) {
    const cx = col === 0 ? 14 : 14 + cW + 14;
    doc.setFillColor(...WHITE);
    doc.roundedRect(cx, rowY, cW, 22, 3, 3, "F");
    doc.setFillColor(...GOLD_DARK);
    doc.roundedRect(cx, rowY, 14, 22, 3, 3, "F");
    doc.rect(cx + 11, rowY, 3, 22, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.text(card.num, cx + 7, rowY + 13, { align: "center" });
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(card.title, cx + 18, rowY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...MID);
    const dl = doc.splitTextToSize(card.desc, cW - 22);
    doc.text(dl, cx + 18, rowY + 14);
    col++;
    if (col === 2) { col = 0; rowY += 27; }
  }

  doc.setFillColor(...GOLD_DARK);
  doc.rect(0, H - 28, W, 28, "F");
  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("by Seiton Home", W / 2, H - 16, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...CREAM_D);
  doc.text(c.cover.footerCopy, W / 2, H - 7, { align: "center" });

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 2 — WHAT IS IT / WHO IS IT FOR
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page2.header);

  y = 30;
  y = sectionTitle(c.page2.whatIsTitle, y);
  y = bodyText(c.page2.whatIsBody, y);

  y += 8;
  y = sectionTitle(c.page2.forWhoTitle, y);
  for (const item of c.page2.forWho) { y = bullet(item, y); }

  y += 8;
  y = sectionTitle(c.page2.problemTitle, y);

  const pW = (W - 42) / 3;
  for (let i = 0; i < c.page2.problems.length; i++) {
    const px = 14 + i * (pW + 7);
    const p = c.page2.problems[i];
    doc.setFillColor(...WHITE);
    doc.roundedRect(px, y, pW, 40, 3, 3, "F");
    doc.setFillColor(...GOLD_DARK);
    doc.roundedRect(px, y, pW, 9, 3, 3, "F");
    doc.rect(px, y + 6, pW, 3, "F");
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    const tl = doc.splitTextToSize(p.title, pW - 6);
    doc.text(tl, px + pW / 2, y + 6, { align: "center" });
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const dl = doc.splitTextToSize(p.desc, pW - 8);
    doc.text(dl, px + 4, y + 16);
  }

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 3 — BENEFITS
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page3.header);

  y = 30;
  y = sectionTitle(c.page3.title, y);

  for (const [title, desc] of c.page3.benefits) {
    if (y > H - 35) { pageFooter(); newPage(); pageHeader(c.page3.header); y = 30; }
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
  // PAGE 4 — CANDLE CALCULATOR
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page4.header);

  y = 30;
  y = sectionTitle(c.page4.title, y);
  y = bodyText(c.page4.body, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page4.tableHead],
    body: c.page4.tableBody,
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
  y = sectionTitle(c.page4.stepsTitle, y);

  for (let i = 0; i < c.page4.steps.length; i++) { y = numberedStep(i + 1, c.page4.steps[i], y); }

  y += 4;
  doc.setFillColor(...WARM_BG);
  doc.roundedRect(14, y, W - 28, 20, 3, 3, "F");
  doc.setFillColor(...GOLD);
  doc.rect(14, y, 3, 20, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...GOLD_DARK);
  doc.text(c.page4.tipTitle, 22, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...DARK);
  doc.text(c.page4.tipBody, 22, y + 14);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 5 — SOAP CALCULATOR
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page5.header);

  y = 30;
  y = sectionTitle(c.page5.title, y);
  y = bodyText(c.page5.body, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page5.soapTableHead],
    body: c.page5.soapTableBody,
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
  y = sectionTitle(c.page5.oilsTitle, y);

  autoTable(doc, {
    startY: y,
    head: [c.page5.oilsTableHead],
    body: c.page5.oilsTableBody,
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

  y = (doc as any).lastAutoTable?.finalY + 6;
  doc.setFillColor(254, 242, 242);
  doc.roundedRect(14, y, W - 28, 16, 3, 3, "F");
  doc.setFillColor(220, 38, 38);
  doc.rect(14, y, 3, 16, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(153, 27, 27);
  doc.text(c.page5.safetyLabel, 22, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(c.page5.safetyBody, 22, y + 12);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 6 — RESIN + CONCRETE
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page6.header);

  y = 30;
  y = sectionTitle(c.page6.resinTitle, y);
  y = bodyText(c.page6.resinBody, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page6.resinTableHead],
    body: c.page6.resinTableBody,
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
  y = sectionTitle(c.page6.concreteTitle, y);
  y = bodyText(c.page6.concreteBody, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page6.concreteTableHead],
    body: c.page6.concreteTableBody,
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
  // PAGE 7 — PLASTER + PRICING
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page7.header);

  y = 30;
  y = sectionTitle(c.page7.plasterTitle, y);
  y = bodyText(c.page7.plasterBody, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page7.plasterTableHead],
    body: c.page7.plasterTableBody,
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
  y = sectionTitle(c.page7.pricingTitle, y);
  y = bodyText(c.page7.pricingBody, y);

  y += 6;
  autoTable(doc, {
    startY: y,
    head: [c.page7.pricingTableHead],
    body: c.page7.pricingTableBody,
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
  doc.text(c.page7.tipTitle, 22, y + 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const tip = doc.splitTextToSize(c.page7.tipBody, W - 44);
  doc.text(tip, 22, y + 13);

  pageFooter();

  // ═══════════════════════════════════════════════════════════════════════════
  // PAGE 8 — ACTIVATION + SUPPORT
  // ═══════════════════════════════════════════════════════════════════════════
  newPage();
  pageHeader(c.page8.header);

  y = 30;
  y = sectionTitle(c.page8.activationTitle, y);

  for (const [step, desc] of c.page8.activationSteps) {
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
  y = sectionTitle(c.page8.faqTitle, y);

  autoTable(doc, {
    startY: y,
    head: [c.page8.faqTableHead],
    body: c.page8.faqRows,
    theme: "grid",
    headStyles: { fillColor: GOLD_DARK, textColor: WHITE, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 75 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable?.finalY + 12;

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
  doc.text(c.page8.ctaSubtitle, W / 2, y + 18, { align: "center" });
  doc.setFontSize(8.5);
  doc.setTextColor(GOLD[0], GOLD[1], GOLD[2]);
  doc.text(c.page8.ctaFooter, W / 2, y + 27, { align: "center" });

  pageFooter();

  doc.save(c.filename);
}
