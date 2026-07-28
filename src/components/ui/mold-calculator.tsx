"use client";
import { useState, useEffect, type ReactNode } from "react";
import { calculateVolume } from "@/lib/calculations/geometry";

const SHAPES = [
  { value: "rectangular", label_es: "Caja / Rectángulo", label_en: "Box / Rectangle", dims: ["width", "length", "height"] },
  { value: "cylinder", label_es: "Cilindro / Círculo", label_en: "Cylinder / Circle", dims: ["diameter", "height"] },
  { value: "sphere", label_es: "Esfera", label_en: "Sphere", dims: ["diameter"] },
  { value: "hemisphere", label_es: "Media esfera / Domo", label_en: "Hemisphere / Dome", dims: ["diameter"] },
  { value: "cone", label_es: "Cono", label_en: "Cone", dims: ["diameter", "height"] },
  { value: "irregular", label_es: "Forma irregular (desplazamiento de agua)", label_en: "Irregular (water displacement)", dims: ["waterAmountMl"] },
];

const DIM_LABELS: Record<string, { es: string; en: string; suffix: string }> = {
  width:        { es: "Ancho",         en: "Width",         suffix: "cm" },
  length:       { es: "Largo",         en: "Length",        suffix: "cm" },
  height:       { es: "Alto / Profundidad", en: "Height / Depth", suffix: "cm" },
  diameter:     { es: "Diámetro",      en: "Diameter",      suffix: "cm" },
  waterAmountMl:{ es: "Agua desplazada", en: "Water displaced", suffix: "ml" },
};

// Simple line-art diagrams showing which measurement is which per shape.
// Deliberately language-agnostic (no text) — the input labels next to it carry the words.
function ShapeDiagram({ shape }: { shape: string }) {
  const stroke = "#A8862A";
  const dim = "#C9A347";
  const fill = "#FFFFFF";
  const common = { fill, stroke, strokeWidth: 1.5 } as const;

  const Arrow = ({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={dim} strokeWidth={1.5} strokeDasharray="3 2" markerStart="url(#dot)" markerEnd="url(#dot)" />
  );

  const defs = (
    <defs>
      <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
        <circle cx="3" cy="3" r="2" fill={dim} />
      </marker>
    </defs>
  );

  let content: ReactNode;
  switch (shape) {
    case "rectangular":
      content = (
        <>
          {/* back face */}
          <rect x="34" y="14" width="52" height="40" {...common} opacity={0.5} />
          {/* front face */}
          <rect x="20" y="28" width="52" height="40" {...common} />
          {/* connecting edges */}
          <line x1="34" y1="14" x2="20" y2="28" stroke={stroke} strokeWidth={1.5} />
          <line x1="86" y1="14" x2="72" y2="28" stroke={stroke} strokeWidth={1.5} />
          <line x1="86" y1="54" x2="72" y2="68" stroke={stroke} strokeWidth={1.5} />
          <Arrow x1={20} y1={74} x2={72} y2={74} />
          <Arrow x1={12} y1={28} x2={12} y2={68} />
          <Arrow x1={34} y1={8} x2={86} y2={8} />
        </>
      );
      break;
    case "cylinder":
      content = (
        <>
          <ellipse cx="52" cy="18" rx="26" ry="9" {...common} />
          <line x1="26" y1="18" x2="26" y2="58" stroke={stroke} strokeWidth={1.5} />
          <line x1="78" y1="18" x2="78" y2="58" stroke={stroke} strokeWidth={1.5} />
          <path d="M26 58 A26 9 0 0 0 78 58" fill="none" stroke={stroke} strokeWidth={1.5} />
          <Arrow x1={26} y1={8} x2={78} y2={8} />
          <Arrow x1={90} y1={18} x2={90} y2={58} />
        </>
      );
      break;
    case "sphere":
      content = (
        <>
          <circle cx="52" cy="40" r="28" {...common} />
          <ellipse cx="52" cy="40" rx="28" ry="8" fill="none" stroke={stroke} strokeWidth={1} opacity={0.4} />
          <Arrow x1={24} y1={40} x2={80} y2={40} />
        </>
      );
      break;
    case "hemisphere":
      content = (
        <>
          <path d="M24 54 A28 28 0 0 1 80 54" {...common} />
          <line x1="24" y1="54" x2="80" y2="54" stroke={stroke} strokeWidth={1.5} />
          <Arrow x1={24} y1={64} x2={80} y2={64} />
        </>
      );
      break;
    case "cone":
      content = (
        <>
          <path d="M52 8 L78 58 A26 7 0 0 1 26 58 Z" {...common} />
          <ellipse cx="52" cy="58" rx="26" ry="7" fill="none" stroke={stroke} strokeWidth={1} opacity={0.5} />
          <Arrow x1={26} y1={68} x2={78} y2={68} />
          <Arrow x1={14} y1={8} x2={14} y2={58} />
        </>
      );
      break;
    case "irregular":
    default:
      content = (
        <>
          {/* mold/cup */}
          <path d="M30 20 L26 62 Q52 70 78 62 L74 20 Z" {...common} />
          {/* water wavy line */}
          <path d="M30 44 Q40 40 52 44 T74 44" fill="none" stroke={dim} strokeWidth={1.5} />
          {/* measuring cup on the right */}
          <path d="M86 46 L84 66 Q92 70 100 66 L98 46 Z" fill={fill} stroke={stroke} strokeWidth={1.2} />
          <line x1="85" y1="56" x2="99" y2="56" stroke={dim} strokeWidth={1} strokeDasharray="2 2" />
          {/* arrow from mold to cup */}
          <path d="M78 34 Q84 30 88 38" fill="none" stroke={dim} strokeWidth={1.5} markerEnd="url(#dot)" />
        </>
      );
      break;
  }

  return (
    <svg viewBox="0 0 104 78" width="104" height="78" style={{ display: "block", margin: "0 auto" }}>
      {defs}
      {content}
    </svg>
  );
}

interface Props {
  locale: string;
  onVolume: (volumeMl: number, shape: string, dims: Record<string, number>) => void;
}

export function MoldCalculator({ locale, onVolume }: Props) {
  const [shape, setShape] = useState("rectangular");
  const [dims, setDims] = useState<Record<string, number>>({});
  const [volume, setVolume] = useState<number | null>(null);
  const es = locale === "es";

  const selectedShape = SHAPES.find(s => s.value === shape)!;

  useEffect(() => {
    const vol = calculateVolume(shape as any, dims as any);
    setVolume(vol > 0 ? vol : null);
    if (vol > 0) onVolume(vol, shape, dims);
  }, [shape, dims]);

  function setDim(key: string, val: string) {
    const n = parseFloat(val);
    setDims(prev => ({ ...prev, [key]: isNaN(n) ? 0 : n }));
  }

  const inputStyle = {
    border: "1px solid #EDE8E1",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    color: "#2C2C2C",
    background: "white",
    width: "100%",
    outline: "none",
  } as const;

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#6B6460",
    display: "block",
    marginBottom: 4,
  } as const;

  return (
    <div style={{ background: "#F5F0EA", borderRadius: 12, padding: 16, border: "1px solid #EDE8E1" }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: "#A8862A", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {es ? "Calculadora de volumen del molde" : "Mold volume calculator"}
      </p>

      {/* Shape selector + diagram */}
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{es ? "Forma del molde" : "Mold shape"}</label>
          <select
            value={shape}
            onChange={e => { setShape(e.target.value); setDims({}); setVolume(null); }}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            {SHAPES.map(s => (
              <option key={s.value} value={s.value}>
                {es ? s.label_es : s.label_en}
              </option>
            ))}
          </select>
        </div>
        <div style={{ background: "white", border: "1px solid #EDE8E1", borderRadius: 8, padding: "4px 8px", flexShrink: 0 }}>
          <ShapeDiagram shape={shape} />
        </div>
      </div>

      {/* Dimension inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10, marginBottom: 12 }}>
        {selectedShape.dims.map(dim => {
          const meta = DIM_LABELS[dim];
          return (
            <div key={dim}>
              <label style={labelStyle}>{es ? meta.es : meta.en}</label>
              <div style={{ position: "relative" }}>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dims[dim] || ""}
                  onChange={e => setDim(dim, e.target.value)}
                  style={{ ...inputStyle, paddingRight: 32 }}
                  placeholder="0"
                />
                <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#C4BDB5", pointerEvents: "none" }}>
                  {meta.suffix}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Special instruction for irregular */}
      {shape === "irregular" && (
        <div style={{ background: "white", border: "1px solid #EDE8E1", borderRadius: 8, padding: "8px 12px", marginBottom: 12 }}>
          <p style={{ fontSize: 11, color: "#6B6460", margin: 0, lineHeight: 1.5 }}>
            {es
              ? "Llena el molde con agua hasta el tope. Mide cuántos ml de agua usaste. Ese es el volumen del molde."
              : "Fill the mold with water to the top. Measure how many ml of water you used. That is the mold volume."}
          </p>
        </div>
      )}

      {/* Result */}
      {volume !== null && volume > 0 ? (
        <div style={{ background: "white", borderRadius: 10, padding: "10px 14px", border: "1.5px solid #C9A347", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, color: "#6B6460" }}>{es ? "Volumen del molde" : "Mold volume"}</span>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#A8862A" }}>{volume.toFixed(0)} ml</span>
            <span style={{ fontSize: 11, color: "#C4BDB5", display: "block" }}>{(volume / 1000).toFixed(3)} L</span>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <p style={{ fontSize: 12, color: "#C4BDB5", margin: 0 }}>
            {es ? "Ingresa las dimensiones para calcular el volumen" : "Enter dimensions to calculate volume"}
          </p>
        </div>
      )}
    </div>
  );
}
