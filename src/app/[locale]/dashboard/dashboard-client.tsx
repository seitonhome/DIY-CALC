"use client";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPct } from "@/lib/utils/format";
import { isPremium, isAdmin } from "@/store";
import {
  Flame, Droplets, Sparkles, Mountain, Layers3, Package,
  Plus, AlertTriangle, TrendingUp, BarChart3, Clock, FileDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { UserProfile, License, Calculation, Formula, Material, Product, Locale } from "@/types";

interface Props {
  profile: UserProfile | null;
  license: License | null;
  calculations: Calculation[];
  formulas: Formula[];
  materials: Material[];
  products: Product[];
  demoMode?: boolean;
}

const CALC_ICONS: Record<string, React.ElementType> = {
  candles: Flame,
  resin: Droplets,
  soap: Sparkles,
  concrete: Mountain,
  plaster: Layers3,
  multi: Package,
};

const CALC_COLORS: Record<string, string> = {
  candles: "text-orange-500",
  resin: "text-sky-500",
  soap: "text-pink-500",
  concrete: "text-stone-500",
  plaster: "text-violet-500",
  multi: "text-emerald-500",
};

export function DashboardClient({ profile, license, calculations, formulas, materials, products, demoMode }: Props) {
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;
  const premium = isPremium(license) || isAdmin(profile);

  const userName = profile?.full_name?.split(" ")[0] ?? "👋";

  // Stats
  const avgCost = products.length > 0
    ? products.reduce((s, p) => s + p.cost_per_unit, 0) / products.length
    : 0;

  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + p.net_margin, 0) / products.length
    : 0;

  const mostProfitable = [...products].sort((a, b) => b.net_margin - a.net_margin)[0];
  const leastProfitable = [...products].sort((a, b) => a.net_margin - b.net_margin)[0];

  // Chart data: calculations by category
  const calcsByCategory = calculations.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(calcsByCategory).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count,
  }));

  // Low margin alert
  const lowMarginProducts = products.filter((p) => p.net_margin < 20 && p.is_active);

  const QUICK_CALCS = [
    { href: "/calculators/candles", icon: Flame, label: t("quickAccess.candles"), color: "bg-orange-50 text-orange-600 hover:bg-orange-100" },
    { href: "/calculators/resin", icon: Droplets, label: t("quickAccess.resin"), color: "bg-sky-50 text-sky-600 hover:bg-sky-100" },
    { href: "/calculators/soap", icon: Sparkles, label: t("quickAccess.soap"), color: "bg-pink-50 text-pink-600 hover:bg-pink-100" },
    { href: "/calculators/concrete", icon: Mountain, label: t("quickAccess.concrete"), color: "bg-stone-50 text-stone-600 hover:bg-stone-100" },
    { href: "/calculators/plaster", icon: Layers3, label: t("quickAccess.plaster"), color: "bg-violet-50 text-violet-600 hover:bg-violet-100" },
    { href: "/calculators/multi", icon: Package, label: t("quickAccess.multi"), color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  ];

  return (
    <AppLayout title={t("greeting", { name: userName })}>
      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title={t("stats.products")}
          value={String(products.length)}
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title={t("stats.formulas")}
          value={String(formulas.length)}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          title={t("stats.avgCost")}
          value={formatCurrency(avgCost, "USD", locale)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent="gold"
        />
        <StatCard
          title={t("stats.avgMargin")}
          value={formatPct(avgMargin, locale)}
          icon={<TrendingUp className="h-4 w-4" />}
          accent={avgMargin >= 20 ? "success" : avgMargin >= 0 ? "warning" : "danger"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t("quickAccess.title")}
                <Button asChild variant="primary" size="sm">
                  <Link href={`/${locale}/calculators/candles`}>
                    <Plus className="h-3.5 w-3.5" />
                    {t("quickAccess.newCalc")}
                  </Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {QUICK_CALCS.map((calc) => (
                  <Link
                    key={calc.href}
                    href={`/${locale}${calc.href}`}
                    className={`flex items-center gap-2.5 rounded-lg border border-transparent p-3 transition-all hover:shadow-sm ${calc.color}`}
                  >
                    <calc.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{calc.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent calculations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {t("recentCalcs.title")}
                {calculations.length > 0 && (
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/${locale}/calculators`}>{t("recentCalcs.viewAll")}</Link>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculations.length === 0 ? (
                <div className="rounded-xl bg-stone-50 border border-dashed border-stone-200 py-10 text-center">
                  <BarChart3 className="mx-auto h-8 w-8 text-stone-300 mb-3" />
                  <p className="text-sm text-stone-500 mb-4">{t("recentCalcs.empty")}</p>
                  <Button asChild variant="primary" size="sm">
                    <Link href={`/${locale}/calculators/candles`}>{t("recentCalcs.startCalc")}</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase tracking-wider">{t("recentCalcs.product")}</th>
                        <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase tracking-wider">{t("recentCalcs.type")}</th>
                        <th className="pb-2 text-right font-medium text-stone-400 text-xs uppercase tracking-wider">{t("recentCalcs.cost")}</th>
                        <th className="pb-2 text-right font-medium text-stone-400 text-xs uppercase tracking-wider">{t("recentCalcs.margin")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {calculations.slice(0, 6).map((calc) => {
                        const Icon = CALC_ICONS[calc.category] ?? Package;
                        const iconClass = CALC_COLORS[calc.category] ?? "text-stone-500";
                        const res = calc.results as any;
                        return (
                          <tr key={calc.id} className="hover:bg-stone-50/50 transition-colors">
                            <td className="py-2.5 font-medium text-stone-900 truncate max-w-[150px]">
                              {calc.product_name ?? "—"}
                            </td>
                            <td className="py-2.5">
                              <span className={`inline-flex items-center gap-1 text-xs ${iconClass}`}>
                                <Icon className="h-3 w-3" />
                                {calc.category}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-medium text-stone-900">
                              {res?.costPerUnit ? formatCurrency(res.costPerUnit, "USD", locale) : "—"}
                            </td>
                            <td className="py-2.5 text-right">
                              {res?.netMargin != null ? (
                                <Badge variant={res.netMargin >= 20 ? "success" : res.netMargin >= 0 ? "warning" : "danger"}>
                                  {formatPct(res.netMargin, locale)}
                                </Badge>
                              ) : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Guide download */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-600/10 p-2 flex-shrink-0">
                  <FileDown className="h-4 w-4 text-amber-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 mb-0.5">
                    {locale === "es" ? "Guía completa en PDF" : "Complete Guide PDF"}
                  </p>
                  <p className="text-xs text-stone-500 mb-3">
                    {locale === "es"
                      ? "Velas, jabones, resina, concreto, yeso — todo el contenido técnico"
                      : "Candles, soaps, resin, concrete, plaster — all technical reference"}
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full"
                    onClick={async () => {
                      const { exportGuidePDF } = await import("@/lib/pdf/guide");
                      await exportGuidePDF(locale as "es" | "en");
                    }}
                  >
                    <FileDown className="h-3.5 w-3.5" />
                    {locale === "es" ? "Descargar guía" : "Download guide"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>{t("alerts.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lowMarginProducts.length > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{t("alerts.lowMargin", { count: lowMarginProducts.length })}</span>
                  </div>
                )}
                {materials.length === 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-sky-50 border border-sky-100 p-3 text-xs text-sky-800">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{t("alerts.noMaterials")}</span>
                  </div>
                )}
                {formulas.length === 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-stone-50 border border-stone-200 p-3 text-xs text-stone-600">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                    <span>{t("alerts.noFormulas")}</span>
                  </div>
                )}
                {lowMarginProducts.length === 0 && materials.length > 0 && formulas.length > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-800">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Todo en orden. Tu margen promedio es {formatPct(avgMargin, locale)}.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profitability chart */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t("profitChart.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e7e5e4", fontSize: 12 }} />
                    <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Most/Least profitable */}
          {mostProfitable && (
            <Card>
              <CardContent className="pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">{t("stats.mostProfitable")}</span>
                  <Badge variant="success">{formatPct(mostProfitable.net_margin, locale)}</Badge>
                </div>
                <p className="text-sm font-semibold text-stone-900 truncate">{mostProfitable.name}</p>
                {leastProfitable && leastProfitable.id !== mostProfitable.id && (
                  <>
                    <div className="h-px bg-stone-100" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">{t("stats.leastProfitable")}</span>
                      <Badge variant={leastProfitable.net_margin >= 0 ? "warning" : "danger"}>
                        {formatPct(leastProfitable.net_margin, locale)}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold text-stone-900 truncate">{leastProfitable.name}</p>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
