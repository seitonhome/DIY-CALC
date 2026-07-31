"use client";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { Shield, Users, BarChart3, FileDown, FileText } from "lucide-react";
import { exportCustomersCSV, exportCustomersPDF } from "@/lib/pdf/export-users";
import type { Locale } from "@/types";

interface Props {
  users: any[];
  calculations: any[];
}

export function AdminClient({ users, calculations }: Props) {
  const t = useTranslations("admin");
  const tDash = useTranslations("dashboard");
  const locale = useLocale() as Locale;

  const totalCalcs = calculations.length;
  const byCategory = calculations.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  const mostUsed = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6 flex items-center gap-2">
        <Shield className="h-5 w-5 text-violet-500" />
        <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
      </div>

      <Tabs defaultValue="stats">
        <TabsList>
          <TabsTrigger value="stats">{t("tabs.stats")}</TabsTrigger>
          <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard title={t("stats.totalUsers")} value={String(users.length)} icon={<Users className="h-4 w-4" />} />
            <StatCard title={t("stats.activeUsers")} value={String(users.filter((u: any) => u.licenses?.[0]?.status === "active").length)} accent="success" icon={<Users className="h-4 w-4" />} />
            <StatCard title={t("stats.totalCalcs")} value={String(totalCalcs)} icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard title={t("stats.mostUsedCalc")} value={mostUsed ? tDash(`quickAccess.${mostUsed[0]}` as any) : "—"} icon={<BarChart3 className="h-4 w-4" />} accent="gold" />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("stats.byCategory")}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(byCategory).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <p className="w-24 text-sm text-stone-600 capitalize">{tDash(`quickAccess.${cat}` as any)}</p>
                    <div className="flex-1 rounded-full bg-stone-100 h-2">
                      <div className="h-2 rounded-full bg-amber-500" style={{ width: `${totalCalcs > 0 ? (count / totalCalcs) * 100 : 0}%` }} />
                    </div>
                    <p className="w-8 text-right text-sm font-medium">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <CardTitle className="text-base">{t("users.title")}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCustomersCSV(users, locale)}
                  disabled={users.length === 0}
                >
                  <FileDown className="h-3.5 w-3.5" />
                  {t("users.exportCsv")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => exportCustomersPDF(users, locale)}
                  disabled={users.length === 0}
                >
                  <FileText className="h-3.5 w-3.5" />
                  {t("users.exportPdf")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("users.name")}</th>
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("users.email")}</th>
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("users.license")}</th>
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("users.language")}</th>
                      <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("users.joinedAt")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-stone-50/50">
                        <td className="py-2.5 font-medium text-stone-900">{u.full_name ?? "—"}</td>
                        <td className="py-2.5 text-stone-600">{u.email}</td>
                        <td className="py-2.5">
                          <Badge variant={u.licenses?.[0]?.status === "active" ? "success" : "warning"}>
                            {u.licenses?.[0]?.status ?? "demo"}
                          </Badge>
                        </td>
                        <td className="py-2.5 text-stone-600">{u.user_preferences?.[0]?.preferred_language ?? "es"}</td>
                        <td className="py-2.5 text-stone-400">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
