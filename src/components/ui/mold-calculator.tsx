"use client";
import { useState, useEffect } from "react";
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

      {/* Shape selector */}
      <div style={{ marginBottom: 12 }}>
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
