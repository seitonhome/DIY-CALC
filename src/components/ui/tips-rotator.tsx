"use client";
import { useState, useEffect, useCallback } from "react";
import { TIPS, type Tip } from "@/lib/tips";
import { ChevronLeft, ChevronRight, Lightbulb } from "lucide-react";

interface Props {
  locale: string;
  category?: string;
  intervalMs?: number;
}

export function TipsRotator({ locale, category, intervalMs = 10000 }: Props) {
  const es = locale === "es";
  const [pool] = useState<Tip[]>(() => {
    const relevant = category
      ? TIPS.filter(t => t.category === category || t.category === "general" || t.category === "business")
      : TIPS;
    return [...relevant].sort(() => Math.random() - 0.5);
  });
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  const changeTip = useCallback((next: number) => {
    setVisible(false);
    setTimeout(() => {
      setIdx(next);
      setVisible(true);
    }, 250);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      changeTip((prev => (prev + 1) % pool.length)(idx));
    }, intervalMs);
    return () => clearInterval(id);
  }, [idx, pool.length, intervalMs, changeTip]);

  const tip = pool[idx];
  if (!tip) return null;
  const text = locale === "es" ? tip.es : tip.en;

  return (
    <div style={{
      background: "white",
      border: "1px solid #EDE8E1",
      borderRadius: 14,
      padding: "12px 14px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
        <Lightbulb size={13} style={{ color: "#C9A347", flexShrink: 0 }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: "#C9A347", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {es ? "Consejo del día" : "Pro tip"}
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#C4BDB5" }}>{idx + 1}/{pool.length}</span>
      </div>

      <div style={{
        fontSize: 12,
        color: "#2C2C2C",
        lineHeight: 1.6,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 0.25s, transform 0.25s",
        minHeight: 52,
      }}>
        <span style={{ fontSize: 16, marginRight: 6 }}>{tip.emoji}</span>
        {text}
      </div>

      <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
        <button
          onClick={() => changeTip((idx - 1 + pool.length) % pool.length)}
          style={{ border: "none", background: "#F5F0EA", borderRadius: 6, padding: "3px 6px", cursor: "pointer", color: "#9E998F", display: "flex", alignItems: "center" }}
          aria-label={es ? "Anterior" : "Previous"}
        >
          <ChevronLeft size={13} />
        </button>
        <button
          onClick={() => changeTip((idx + 1) % pool.length)}
          style={{ border: "none", background: "#F5F0EA", borderRadius: 6, padding: "3px 6px", cursor: "pointer", color: "#9E998F", display: "flex", alignItems: "center" }}
          aria-label={es ? "Siguiente" : "Next"}
        >
          <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
}
