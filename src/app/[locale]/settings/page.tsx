"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/store";
import type { Locale } from "@/types";
import { Settings, Globe, Key, Check } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { license, setLocale } = useAppStore();
  const [name, setName] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Locale>(locale);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("users_profile").select("full_name").eq("user_id", user.id).single();
      if (profile) setName(profile.full_name ?? "");
    }
    load();
  }, []);

  async function handleSave() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("users_profile").update({ full_name: name }).eq("user_id", user.id);
    await supabase.from("user_preferences").upsert({ user_id: user.id, preferred_language: selectedLang }, { onConflict: "user_id" });
    setLocale(selectedLang);
    localStorage.setItem("diy-calc-locale", selectedLang);
    if (selectedLang !== locale) {
      router.replace("/settings", { locale: selectedLang });
    }
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  }

  const licenseStatus = license?.status ?? "demo";

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="h-5 w-5 text-stone-500" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
      </div>

      <div className="max-w-2xl space-y-4">
        {/* Profile */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("profile")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input label={t("name")} value={name} onChange={e => setName(e.target.value)} />
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t("language")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedLang} onValueChange={(v) => setSelectedLang(v as Locale)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="en">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* License */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("license.title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-600">{t("license.status")}</span>
              <Badge variant={licenseStatus === "active" ? "success" : licenseStatus === "demo" ? "warning" : "danger"}>
                {t(`license.${licenseStatus}` as any)}
              </Badge>
            </div>
            {license?.activated_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">{t("license.activatedAt")}</span>
                <span className="text-sm font-medium">{new Date(license.activated_at).toLocaleDateString()}</span>
              </div>
            )}
            {licenseStatus !== "active" && (
              <Button asChild variant="primary" size="sm" className="w-full">
                <a href={`/${locale}/activate`}>{t("license.upgrade")}</a>
              </Button>
            )}
          </CardContent>
        </Card>

        <Button variant="primary" onClick={handleSave} className="w-full sm:w-auto">
          {savedMsg ? (
            <><Check className="h-4 w-4" />{t("saved")}</>
          ) : t("save")}
        </Button>
      </div>
    </AppLayout>
  );
}
