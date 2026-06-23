"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateSimulator } from "@/lib/calculations/simulator";
import { formatCurrency, formatPct } from "@/lib/utils/format";
import type { SimulatorInputs, SimulatorResults, Locale } from "@/types";
import { BarChart3, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const schema = z.object({
  baseCostPerUnit: z.coerce.number().min(0).default(0),
  salePrice: z.coerce.number().min(0).default(0),
  discountPct: z.coerce.number().min(0).max(100).default(0),
  wholesalePrice: z.coerce.number().min(0).default(0),
  marketplaceFeePct: z.coerce.number().min(0).max(100).default(0),
  hotmartFeePct: z.coerce.number().min(0).max(100).default(0),
  gatewayFeePct: z.coerce.number().min(0).max(100).default(2.9),
  affiliateFeePct: z.coerce.number().min(0).max(100).default(0),
  shippingCost: z.coerce.number().min(0).default(0),
  taxesPct: z.coerce.number().min(0).max(100).default(0),
  premiumPackagingCost: z.coerce.number().min(0).default(0),
  volumeDiscountPct: z.coerce.number().min(0).max(100).default(0),
  minDesiredMarginPct: z.coerce.number().min(1).max(100).default(20),
});
type FormValues = z.infer<typeof schema>;

export default function SimulatorPage() {
  const t = useTranslations("simulator");
  const locale = useLocale() as Locale;
  const [results, setResults] = useState<SimulatorResults | null>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { gatewayFeePct: 2.9, minDesiredMarginPct: 20 },
  });

  function onSubmit(data: FormValues) {
    setResults(calculateSimulator(data as SimulatorInputs));
  }

  const fmt = (v: number) => formatCurrency(v, "USD", locale);

  const chartData = results ? [
    { name: locale === "es" ? "Mín. rentable" : "Min. profitable", price: results.minProfitablePrice },
    { name: locale === "es" ? "Recomendado" : "Recommended", price: results.recommendedPrice },
    { name: locale === "es" ? "Premium" : "Premium", price: results.premiumPrice },
    { name: locale === "es" ? "Mayorista" : "Wholesale", price: results.safeWholesalePrice },
  ] : [];

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-5 w-5 text-violet-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{locale === "es" ? "Datos de costo y precio" : "Cost & price data"}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={t("baseCost")} type="number" min="0" step="0.01" {...register("baseCostPerUnit")} prefix="$" />
                  <Input label={t("salePrice")} type="number" min="0" step="0.01" {...register("salePrice")} prefix="$" />
                  <Input label={t("shippingCost")} type="number" min="0" step="0.01" {...register("shippingCost")} prefix="$" />
                  <Input label={t("premiumPackaging")} type="number" min="0" step="0.01" {...register("premiumPackagingCost")} prefix="$" />
                  <Input label={t("minMargin")} type="number" min="1" max="100" {...register("minDesiredMarginPct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{locale === "es" ? "Comisiones y fees" : "Commissions & fees"}</CardTitle></CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label={t("marketplaceFee")} type="number" min="0" max="100" {...register("marketplaceFeePct")} suffix="%" />
                  <Input label={t("hotmartFee")} type="number" min="0" max="100" {...register("hotmartFeePct")} suffix="%" />
                  <Input label={t("gatewayFee")} type="number" min="0" max="100" step="0.1" {...register("gatewayFeePct")} suffix="%" />
                  <Input label={t("affiliateFee")} type="number" min="0" max="100" {...register("affiliateFeePct")} suffix="%" />
                  <Input label={t("taxes")} type="number" min="0" max="100" {...register("taxesPct")} suffix="%" />
                  <Input label={t("discount")} type="number" min="0" max="100" {...register("discountPct")} suffix="%" />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button type="submit" variant="primary" className="flex-1 sm:flex-none">
                <BarChart3 className="h-4 w-4" />{locale === "es" ? "Simular" : "Simulate"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { reset(); setResults(null); }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {results ? (
              <>
                <Card>
                  <CardHeader><CardTitle className="text-base">{locale === "es" ? "Precios sugeridos" : "Suggested prices"}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: t("results.minProfitable"), value: fmt(results.minProfitablePrice), accent: "warning" as const },
                      { label: t("results.recommended"), value: fmt(results.recommendedPrice), accent: "success" as const },
                      { label: t("results.premium"), value: fmt(results.premiumPrice), accent: "primary" as const },
                      { label: t("results.safeWholesale"), value: fmt(results.safeWholesalePrice), accent: "default" as const },
                      { label: t("results.promoWithoutLoss"), value: fmt(results.promoPrice), accent: "default" as const },
                    ].map(({ label, value, accent }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-stone-600">{label}</span>
                        <Badge variant={accent}>{value}</Badge>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-sm text-stone-600">{t("results.minUnitsToRecover")}</span>
                      <Badge variant="outline">{results.minUnitsToRecover} uds.</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader><CardTitle className="text-base">{locale === "es" ? "Márgenes por canal" : "Margins by channel"}</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {[
                      { label: locale === "es" ? "Venta directa" : "Direct sales", value: results.directMargin },
                      { label: locale === "es" ? "Marketplace" : "Marketplace", value: results.marketplaceMargin },
                      { label: locale === "es" ? "Mayorista" : "Wholesale", value: results.wholesaleMargin },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-sm text-stone-600">{label}</span>
                        <div className="flex items-center gap-1">
                          {value >= 20 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-red-500" />}
                          <span className={`text-sm font-semibold ${value >= 20 ? "text-emerald-600" : value >= 0 ? "text-amber-600" : "text-red-500"}`}>
                            {formatPct(value, locale)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {chartData.length > 0 && (
                  <Card>
                    <CardContent className="pt-4">
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                          <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                          <YAxis tick={{ fontSize: 9 }} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 11 }} formatter={(v) => fmt(Number(v))} />
                          <Bar dataKey="price" fill="#d97706" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white py-14 text-center">
                <BarChart3 className="mx-auto h-8 w-8 text-stone-200 mb-3" />
                <p className="text-sm text-stone-400">{locale === "es" ? "Ingresa los datos para simular precios" : "Enter data to simulate prices"}</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </AppLayout>
  );
}
