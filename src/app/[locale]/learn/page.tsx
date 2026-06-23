"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, ChevronDown, ChevronUp } from "lucide-react";

const ARTICLES = ["grossMargin","netMargin","waste","labor","wholesale","profitability","multiplier","sets","custom"] as const;

export default function LearnPage() {
  const t = useTranslations("learn");
  const locale = useLocale();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <AppLayout title={t("title")}>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="h-5 w-5 text-emerald-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <div className="max-w-3xl space-y-3">
        {ARTICLES.map((key, i) => {
          const isOpen = expanded === key;
          return (
            <div key={key} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : key)}
                className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-stone-900 text-sm">{t(`articles.${key}.title`)}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{t(`articles.${key}.summary`)}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-stone-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-400 flex-shrink-0" />}
              </button>
              {isOpen && (
                <div className="px-6 pb-5 border-t border-stone-100">
                  <p className="pt-4 text-sm text-stone-700 leading-relaxed">{t(`articles.${key}.content`)}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AppLayout>
  );
}
