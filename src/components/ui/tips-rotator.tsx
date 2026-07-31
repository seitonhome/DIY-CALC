"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { TIPS, type Tip } from "@/lib/tips";
import {
  ChevronLeft, ChevronRight, Shuffle, Flame, Droplets, Sparkles,
  Mountain, Layers3, Package, Lightbulb, type LucideIcon,
} from "lucide-react";

type PageCategory = "candles" | "resin" | "soap" | "concrete" | "plaster" | "multi";

interface Theme {
  accent: string;
  soft: string;
  border: string;
  icon: LucideIcon;
}

const THEME: Record<PageCategory, Theme> = {
  candles:  { accent: "#EA580C", soft: "#FFF4EC", border: "#FED7AA", icon: Flame },
  resin:    { accent: "#0284C7", soft: "#EFF9FF", border: "#BAE6FD", icon: Droplets },
  soap:     { accent: "#DB2777", soft: "#FDF1F7", border: "#FBCFE8", icon: Sparkles },
  concrete: { accent: "#78716C", soft: "#F7F6F5", border: "#E7E5E4", icon: Mountain },
  plaster:  { accent: "#7C3AED", soft: "#F6F3FF", border: "#DDD6FE", icon: Layers3 },
  multi:    { accent: "#059669", soft: "#ECFDF5", border: "#A7F3D0", icon: Package },
};

const GENERAL_THEME: Theme = { accent: "#C9A347", soft: "#FFF9EE", border: "#EDE0C0", icon: Lightbulb };

interface Props {
  locale: string;
  /** Omit for an app-wide random tip (any category). Pass a calculator's
   * category to theme the card and pull technique/material/safety tips
   * specific to that material, plus the shared general/business pool. */
  category?: PageCategory;
  /** Rotation interval while idle, in ms. */
  intervalMs?: number;
  /**
   * Pass a value that changes identity every time the user runs a new
   * calculation (e.g. the `results` object from `setResults(calc)`). Each
   * change jumps to a fresh tip, so tips feel tied to "as you calculate"
   * rather than just a passive background timer.
   */
  resultsKey?: unknown;
  /** Tighter layout for narrow spots like the sidebar. */
  compact?: boolean;
}

/**
 * Eye-catching, per-calculator-themed rotating tip card. Shows technique,
 * material, temperature and safety advice pulled from a shared bank
 * (src/lib/tips.ts), pre-shuffled per mount so tips don't repeat until the
 * whole pool has been seen once.
 */
export function TipsRotator({ locale, category, intervalMs = 11000, resultsKey, compact = false }: Props) {
  const es = locale === "es";
  const theme = category ? THEME[category] : GENERAL_THEME;
  const Icon = theme.icon;

  // Shuffling with Math.random() must happen client-only: doing it inside a
  // useState initializer runs during SSR too, and the server's shuffle order
  // will differ from the client's, causing a hydration mismatch. Start empty
  // (renders nothing on both server and first client pass) and shuffle once
  // mounted.
  const [pool, setPool] = useState<Tip[]>([]);
  useEffect(() => {
    const relevant = category
      ? TIPS.filter((t) => t.category === category || t.category === "general" || t.category === "business")
      : TIPS;
    setPool([...relevant].sort(() => Math.random() - 0.5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const advance = useCallback(
    (direction: 1 | -1 = 1) => {
      setVisible(false);
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      fadeTimer.current = setTimeout(() => {
        setIdx((prev) => (prev + direction + pool.length) % pool.length);
        setVisible(true);
      }, 220);
    },
    [pool.length]
  );

  const shuffleToNew = useCallback(() => {
    setVisible(false);
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => {
      setIdx((prev) => {
        if (pool.length <= 1) return prev;
        let next = Math.floor(Math.random() * pool.length);
        if (next === prev) next = (next + 1) % pool.length;
        return next;
      });
      setVisible(true);
    }, 220);
  }, [pool.length]);

  // Idle auto-rotation.
  useEffect(() => {
    const id = setInterval(() => advance(1), intervalMs);
    return () => clearInterval(id);
  }, [advance, intervalMs]);

  // Fresh tip whenever a new calculation result comes in.
  const prevResultsKey = useRef(resultsKey);
  useEffect(() => {
    if (resultsKey !== undefined && resultsKey !== prevResultsKey.current) {
      prevResultsKey.current = resultsKey;
      shuffleToNew();
    }
  }, [resultsKey, shuffleToNew]);

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    };
  }, []);

  const tip = pool[idx];
  if (!tip) return null;
  const text = es ? tip.es : tip.en;

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm" style={{ border: `1.5px solid ${theme.border}` }}>
      {/* Header */}
      <div className={compact ? "flex items-center gap-1.5 px-2.5 py-1.5" : "flex items-center gap-2 px-4 py-2.5"} style={{ background: theme.accent }}>
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-white" />
        <p className="m-0 text-[11px] font-bold uppercase tracking-wide text-white">
          {es ? "Consejo" : "Tip"}
        </p>
        {!compact && (
          <span className="ml-auto text-[10px] font-semibold text-white/75">
            {idx + 1}/{pool.length}
          </span>
        )}
        <button
          type="button"
          onClick={shuffleToNew}
          className={compact ? "flex items-center justify-center rounded-full p-0.5 text-white/80 transition hover:bg-white/20 hover:text-white" : "ml-1 flex items-center justify-center rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"}
          aria-label={es ? "Otro consejo" : "Another tip"}
          title={es ? "Otro consejo" : "Another tip"}
        >
          <Shuffle className="h-3 w-3" />
        </button>
      </div>

      {/* Body */}
      <div style={{ background: theme.soft }} className={compact ? "px-2.5 py-2" : "px-4 py-3.5"}>
        <div
          className="flex items-start gap-3 transition-all duration-200"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(6px)",
            minHeight: compact ? 36 : 50,
          }}
        >
          <span className={compact ? "flex-shrink-0 select-none text-lg leading-none" : "flex-shrink-0 select-none text-2xl leading-none"}>{tip.emoji}</span>
          <p className={compact ? "m-0 text-[11px] leading-relaxed text-stone-700" : "m-0 text-[13px] leading-relaxed text-stone-700"}>{text}</p>
        </div>

        {!compact && (
          <div className="mt-3 flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => advance(-1)}
              aria-label={es ? "Anterior" : "Previous"}
              className="flex items-center justify-center rounded-full p-1 text-stone-400 transition hover:bg-white hover:text-stone-600"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => advance(1)}
              aria-label={es ? "Siguiente" : "Next"}
              className="flex items-center justify-center rounded-full p-1 text-stone-400 transition hover:bg-white hover:text-stone-600"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
