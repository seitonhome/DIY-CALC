"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  Flame, Droplets, Sparkles, Mountain, Layers3, Package,
  TrendingUp, Shield, BookMarked, GitCompare, FileDown, BarChart3,
  ChevronDown, ChevronUp, ArrowRight, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const CATEGORY_ICONS = {
  0: Flame,
  1: Droplets,
  2: Sparkles,
  3: Mountain,
  4: Layers3,
  5: Package,
};

const BENEFIT_ICONS = [TrendingUp, Shield, BarChart3, BookMarked, GitCompare, FileDown, Package, Package];

export function ProblemSection() {
  const t = useTranslations("landing.problem");
  const items = t.raw("items") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 bg-stone-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-stone-400 text-lg">{t("subtitle")}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl bg-stone-800 border border-stone-700 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-900/50 text-red-400 text-lg font-bold mb-4">
                {i + 1}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SolutionSection() {
  const t = useTranslations("landing.solution");
  const items = t.raw("items") as string[];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <Badge variant="primary" className="mb-4">
              {useTranslations("landing.hero")("badge")}
            </Badge>
            <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl mb-4">{t("title")}</h2>
            <p className="text-stone-500 text-lg mb-8">{t("subtitle")}</p>
            <ul className="space-y-3">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 mt-0.5">
                    <Check className="h-3 w-3 text-emerald-600" />
                  </div>
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-8 text-center">
            <div className="text-6xl font-black text-amber-700 mb-2">DIY</div>
            <div className="text-6xl font-black text-stone-900 mb-4">CALC PRO</div>
            <div className="h-1 w-24 mx-auto rounded-full accent-line mb-6" />
            <p className="text-stone-600 text-sm">by Seiton Home</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  const t = useTranslations("landing.categories");
  const items = t.raw("items") as Array<{ name: string; desc: string }>;

  return (
    <section className="py-20 bg-stone-50">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t("title")}</h2>
          <p className="mt-3 text-stone-500 text-lg">{t("subtitle")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = CATEGORY_ICONS[i as keyof typeof CATEGORY_ICONS];
            return (
              <div
                key={i}
                className="group rounded-xl border border-stone-200 bg-white p-6 transition-all hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700 mb-4 group-hover:bg-amber-100 transition-colors">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1">{item.name}</h3>
                <p className="text-sm text-stone-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BenefitsSection() {
  const t = useTranslations("landing.benefits");
  const items = t.raw("items") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t("title")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = BENEFIT_ICONS[i];
            return (
              <div key={i} className="rounded-xl bg-stone-50 border border-stone-100 p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-3">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="font-semibold text-stone-900 mb-1.5 text-sm">{item.title}</h3>
                <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const t = useTranslations("landing.howItWorks");
  const steps = t.raw("steps") as Array<{ step: string; title: string; desc: string }>;

  return (
    <section className="py-20 bg-stone-900">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{t("title")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-full w-full h-px bg-stone-700 hidden lg:block" style={{ width: "calc(100% - 3rem)", left: "calc(50% + 1.5rem)" }} />
              )}
              <div className="rounded-xl bg-stone-800 border border-stone-700 p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-700 text-white font-bold text-sm mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-stone-400">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ForWhoSection() {
  const t = useTranslations("landing.forWho");
  const items = t.raw("items") as Array<{ title: string; desc: string }>;

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t("title")}</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-stone-200 p-6 text-center hover:border-amber-200 hover:shadow-sm transition-all">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-2xl">
                {["🧑‍🎨", "🏪", "📱", "🛒"][i]}
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">{item.title}</h3>
              <p className="text-sm text-stone-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PricingSection() {
  const t = useTranslations("landing.pricing");
  const locale = useLocale();
  const features = t.raw("features") as string[];

  return (
    <section className="py-20 bg-stone-50" id="pricing">
      <div className="mx-auto max-w-lg px-6">
        <div className="rounded-2xl border border-amber-200 bg-white shadow-lg overflow-hidden">
          <div className="bg-gradient-to-br from-amber-700 to-orange-600 px-8 py-8 text-center text-white">
            <Badge className="mb-4 bg-white/20 text-white border-white/20">{t("badge")}</Badge>
            <h2 className="text-2xl font-bold mb-1">{t("title")}</h2>
            <p className="text-amber-100 text-sm mb-6">{t("subtitle")}</p>
            <div className="text-5xl font-black">{t("price")}</div>
            <p className="text-amber-100 text-sm mt-1">{t("priceSub")}</p>
          </div>
          <div className="p-8">
            <ul className="space-y-3 mb-8">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-stone-700">
                  <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href={`/${locale}/register`}>
                {t("cta")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-stone-400 mt-3">{t("guarantee")}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const t = useTranslations("landing.faq");
  const items = t.raw("items") as Array<{ q: string; a: string }>;
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-stone-900 sm:text-4xl">{t("title")}</h2>
        </div>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="rounded-xl border border-stone-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium text-stone-900 hover:bg-stone-50 transition-colors"
              >
                {item.q}
                {openIndex === i ? <ChevronUp className="h-4 w-4 text-stone-400" /> : <ChevronDown className="h-4 w-4 text-stone-400" />}
              </button>
              {openIndex === i && (
                <div className="px-5 pb-4 text-sm text-stone-600 leading-relaxed border-t border-stone-100">
                  <p className="pt-3">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FinalCTASection() {
  const t = useTranslations("landing.finalCta");
  const locale = useLocale();

  return (
    <section className="py-20 bg-gradient-to-br from-amber-700 to-orange-600">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">{t("title")}</h2>
        <p className="text-amber-100 text-lg mb-10">{t("subtitle")}</p>
        <Button asChild size="xl" className="bg-white text-amber-800 hover:bg-amber-50 font-bold">
          <Link href={`/${locale}/register`}>
            {t("cta")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <p className="text-amber-200 text-sm mt-4">{t("sub")}</p>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const t = useTranslations("landing.footer");
  const links = t.raw("links") as Record<string, string>;

  return (
    <footer className="bg-stone-900 py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-bold text-white">{t("brand")}</p>
            <p className="text-xs text-stone-500 mt-1">{t("copy")}</p>
          </div>
          <div className="flex gap-6">
            {Object.entries(links).map(([key, label]) => (
              <a key={key} href="#" className="text-sm text-stone-400 hover:text-white transition-colors">
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
