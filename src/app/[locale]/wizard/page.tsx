"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { ArrowLeft, Flame, Droplets, Sparkles, Mountain, Layers3, Package } from "lucide-react";
import { RESIN_TECHNIQUES } from "@/lib/calculations/resin";
import { CONCRETE_MIX_TYPES } from "@/lib/calculations/concrete";
import { PLASTER_TYPES } from "@/lib/calculations/plaster";
import { SOAP_TYPES } from "@/lib/calculations/soap";
import type { Locale } from "@/types";

const MATERIALS = [
  { key: "candles", icon: Flame, className: "border-orange-100 bg-orange-50 text-orange-600" },
  { key: "resin", icon: Droplets, className: "border-sky-100 bg-sky-50 text-sky-600" },
  { key: "soap", icon: Sparkles, className: "border-pink-100 bg-pink-50 text-pink-600" },
  { key: "concrete", icon: Mountain, className: "border-stone-200 bg-stone-50 text-stone-600" },
  { key: "plaster", icon: Layers3, className: "border-violet-100 bg-violet-50 text-violet-600" },
  { key: "multi", icon: Package, className: "border-emerald-100 bg-emerald-50 text-emerald-600" },
] as const;

type MaterialKey = (typeof MATERIALS)[number]["key"];

interface ProjectOption {
  value: string;
  label: string;
  description: string;
  icon?: string;
}

const CANDLE_TYPE_KEYS = [
  "glass", "molded", "decorative", "pillar", "waxMelt", "tealight",
  "votive", "sculptural", "multilayer", "embeds", "aromatic", "unscented",
];

const MULTI_BASE_MATERIALS = ["candles", "resin", "soap", "concrete", "plaster"] as const;

export default function WizardPage() {
  const t = useTranslations("wizard");
  const tDash = useTranslations("dashboard");
  const tCandles = useTranslations("calculators.candles");
  const locale = useLocale() as Locale;
  const es = locale === "es";
  const router = useRouter();
  const [material, setMaterial] = useState<MaterialKey | null>(null);

  function getOptions(): ProjectOption[] {
    switch (material) {
      case "resin":
        return RESIN_TECHNIQUES.map((tech) => ({
          value: tech.value,
          label: es ? tech.label_es : tech.label_en,
          description: es ? tech.desc_es : tech.desc_en,
          icon: tech.icon,
        }));
      case "concrete":
        return Object.entries(CONCRETE_MIX_TYPES).map(([value, v]) => ({
          value,
          label: es ? v.label_es : v.label_en,
          description: es ? v.use_es : v.use_en,
        }));
      case "plaster":
        return Object.entries(PLASTER_TYPES).map(([value, v]) => ({
          value,
          label: es ? v.label_es : v.label_en,
          description: es ? v.use_es : v.use_en,
        }));
      case "soap":
        return Object.entries(SOAP_TYPES).map(([value, v]) => ({
          value,
          label: es ? v.label_es : v.label_en,
          description: es ? v.desc_es : v.desc_en,
        }));
      case "candles":
        return CANDLE_TYPE_KEYS.map((key) => ({
          value: key,
          label: tCandles(`types.${key}` as any),
          description: tCandles(`typeDescriptions.${key}` as any),
        }));
      case "multi":
        return MULTI_BASE_MATERIALS.map((key) => ({
          value: key,
          label: tDash(`quickAccess.${key}` as any),
          description: "",
        }));
      default:
        return [];
    }
  }

  function goToCalculator(value: string) {
    if (!material) return;
    router.push(`/calculators/${material}?type=${value}`);
  }

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      {!material ? (
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {t("step1Title")}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MATERIALS.map(({ key, icon: Icon, className }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMaterial(key)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-transform hover:scale-[1.02] ${className}`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-semibold">{tDash(`quickAccess.${key}` as any)}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => setMaterial(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </button>

          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-stone-400">
            {material === "multi" ? t("multiQuestion") : t("step2Title")}
          </p>
          {material === "multi" && (
            <p className="mb-4 text-sm text-stone-500">{t("multiSubtitle")}</p>
          )}

          <div
            className="grid gap-3 mt-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
          >
            {getOptions().map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => goToCalculator(opt.value)}
                className="rounded-xl border border-stone-100 bg-white p-4 text-left transition-colors hover:border-amber-300 hover:bg-amber-50/40"
              >
                {opt.icon && <div className="mb-1 text-xl">{opt.icon}</div>}
                <p className="text-sm font-semibold text-stone-900">{opt.label}</p>
                {opt.description && (
                  <p className="mt-1 text-xs leading-relaxed text-stone-500">{opt.description}</p>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
