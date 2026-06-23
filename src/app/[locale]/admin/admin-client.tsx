"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatCard } from "@/components/ui/stat-card";
import { createClient } from "@/lib/supabase/client";
import { Shield, Users, Key, BarChart3, Plus, Copy, Lock } from "lucide-react";

function generateCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment()}-${segment()}-${segment()}-${segment()}`;
}

interface Props {
  users: any[];
  codes: any[];
  calculations: any[];
}

export function AdminClient({ users, codes: initialCodes, calculations }: Props) {
  const t = useTranslations("admin");
  const locale = useLocale();
  const [codes, setCodes] = useState(initialCodes);
  const [genQty, setGenQty] = useState(1);
  const [generating, setGenerating] = useState(false);

  const totalCalcs = calculations.length;
  const byCategory = calculations.reduce<Record<string, number>>((acc, c) => {
    acc[c.category] = (acc[c.category] ?? 0) + 1;
    return acc;
  }, {});
  const mostUsed = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  async function handleGenerate() {
    setGenerating(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newCodes = Array.from({ length: genQty }, () => ({
      code: generateCode(),
      status: "unused",
      created_by: user.id,
    }));

    const { data } = await supabase.from("activation_codes").insert(newCodes).select();
    if (data) setCodes(prev => [...data, ...prev]);
    setGenerating(false);
  }

  async function handleBlock(id: string) {
    const supabase = createClient();
    await supabase.from("activation_codes").update({ status: "blocked" }).eq("id", id);
    setCodes(prev => prev.map(c => c.id === id ? { ...c, status: "blocked" } : c));
  }

  function copyAll() {
    const unused = codes.filter(c => c.status === "unused").map(c => c.code).join("\n");
    navigator.clipboard.writeText(unused);
  }

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
          <TabsTrigger value="codes">{t("tabs.codes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard title={t("stats.totalUsers")} value={String(users.length)} icon={<Users className="h-4 w-4" />} />
            <StatCard title={t("stats.activeUsers")} value={String(users.filter((u: any) => u.licenses?.[0]?.status === "active").length)} accent="success" icon={<Users className="h-4 w-4" />} />
            <StatCard title={t("stats.totalCalcs")} value={String(totalCalcs)} icon={<BarChart3 className="h-4 w-4" />} />
            <StatCard title={t("stats.mostUsedCalc")} value={mostUsed?.[0] ?? "—"} icon={<BarChart3 className="h-4 w-4" />} accent="gold" />
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">{t("stats.byCategory")}</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(byCategory).sort((a,b) => b[1]-a[1]).map(([cat, count]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <p className="w-24 text-sm text-stone-600 capitalize">{cat}</p>
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
            <CardHeader><CardTitle className="text-base">{t("users.title")}</CardTitle></CardHeader>
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

        <TabsContent value="codes">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("codes.generate")}</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-3 flex-wrap items-end">
                  <Input label={t("codes.quantity")} type="number" min="1" max="100" value={genQty} onChange={e => setGenQty(+e.target.value)} className="w-28" />
                  <Button variant="primary" onClick={handleGenerate} loading={generating}>
                    <Plus className="h-4 w-4" />{t("codes.generate")}
                  </Button>
                  <Button variant="outline" onClick={copyAll}>
                    <Copy className="h-4 w-4" />{t("codes.copyAll")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("codes.title")}</CardTitle></CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("codes.code")}</th>
                        <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("codes.status")}</th>
                        <th className="pb-2 text-left font-medium text-stone-400 text-xs uppercase">{t("codes.usedAt")}</th>
                        <th className="pb-2 text-right font-medium text-stone-400 text-xs uppercase"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      {codes.map((c: any) => (
                        <tr key={c.id} className="hover:bg-stone-50/50">
                          <td className="py-2.5 font-mono text-xs font-semibold text-stone-900">{c.code}</td>
                          <td className="py-2.5">
                            <Badge variant={c.status === "unused" ? "success" : c.status === "used" ? "default" : "danger"}>
                              {t(`codes.${c.status}` as any)}
                            </Badge>
                          </td>
                          <td className="py-2.5 text-stone-400 text-xs">{c.used_at ? new Date(c.used_at).toLocaleDateString() : "—"}</td>
                          <td className="py-2.5 text-right">
                            {c.status === "unused" && (
                              <button onClick={() => handleBlock(c.id)} className="text-xs text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 ml-auto">
                                <Lock className="h-3 w-3" />{t("codes.block")}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
