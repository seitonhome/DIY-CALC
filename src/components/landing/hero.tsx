"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowRight, Play, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function Hero() {
  const t = useTranslations("landing.hero");
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden hero-gradient">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-amber-100/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-orange-100/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <Badge variant="primary" className="mb-6 inline-flex items-center gap-1.5 px-4 py-1.5">
            <Sparkles className="h-3 w-3" />
            {t("badge")}
          </Badge>

          {/* Title */}
          <h1 className="text-5xl font-black tracking-tight text-stone-900 sm:text-6xl lg:text-7xl">
            <span className="block">DIY CALC</span>
            <span className="block bg-gradient-to-r from-amber-700 to-orange-600 bg-clip-text text-transparent">PRO</span>
          </h1>

          {/* Gold accent line */}
          <div className="mx-auto my-6 h-1 w-24 rounded-full accent-line" />

          {/* Subtitle */}
          <p className="text-lg text-stone-600 sm:text-xl lg:text-2xl leading-relaxed">
            {t("subtitle")}
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild variant="primary" size="xl" className="w-full sm:w-auto">
              <Link href={`/${locale}/login`}>
                {t("cta")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl" className="w-full sm:w-auto gap-2">
              <Link href={`/${locale}/login?demo=true`}>
                <Play className="h-4 w-4" />
                {t("ctaDemo")}
              </Link>
            </Button>
          </div>

          {/* Social proof */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-stone-500">{t("ctaSub")}</p>
          </div>
        </div>

        {/* App preview mockup */}
        <div className="mt-16 mx-auto max-w-4xl">
          <div className="relative rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-yellow-400" />
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-md bg-white border border-stone-200 px-4 py-1 text-xs text-stone-400">
                diy-calc.seitonhome.com
              </div>
            </div>

            {/* App preview content */}
            <div className="p-6 bg-stone-50 min-h-[300px]">
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: locale === "es" ? "Costo/unidad" : "Cost/unit", value: "$2.45", color: "bg-amber-50 border-amber-100" },
                  { label: locale === "es" ? "Precio sugerido" : "Suggested price", value: "$7.90", color: "bg-emerald-50 border-emerald-100" },
                  { label: locale === "es" ? "Margen neto" : "Net margin", value: "42%", color: "bg-sky-50 border-sky-100" },
                ].map((item) => (
                  <div key={item.label} className={`rounded-lg border p-3 ${item.color}`}>
                    <p className="text-xs text-stone-500">{item.label}</p>
                    <p className="text-xl font-bold text-stone-900 mt-1">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <div className="flex-1 rounded-lg bg-white border border-stone-200 p-4">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                    {locale === "es" ? "Distribución de costos" : "Cost distribution"}
                  </p>
                  <div className="space-y-2">
                    {[
                      { label: locale === "es" ? "Cera de soya" : "Soy wax", pct: 45, color: "bg-amber-400" },
                      { label: locale === "es" ? "Fragancia" : "Fragrance", pct: 28, color: "bg-orange-400" },
                      { label: locale === "es" ? "Empaque" : "Packaging", pct: 15, color: "bg-stone-400" },
                      { label: locale === "es" ? "Pabilo" : "Wick", pct: 8, color: "bg-yellow-400" },
                      { label: locale === "es" ? "Otros" : "Other", pct: 4, color: "bg-red-300" },
                    ].map((bar) => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <p className="w-28 text-xs text-stone-600 truncate">{bar.label}</p>
                        <div className="flex-1 rounded-full bg-stone-100 h-2">
                          <div className={`h-2 rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                        </div>
                        <p className="w-8 text-right text-xs font-medium text-stone-700">{bar.pct}%</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-40 rounded-lg bg-white border border-stone-200 p-4 flex flex-col gap-2">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    {locale === "es" ? "Análisis" : "Analysis"}
                  </p>
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-black text-emerald-600">42%</p>
                      <p className="text-xs text-stone-500 mt-1">{locale === "es" ? "Margen neto" : "Net margin"}</p>
                      <div className="mt-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 font-medium">
                        ✓ {locale === "es" ? "Saludable" : "Healthy"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
