"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/reset-password`,
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-lg font-bold text-stone-900">DIY CALC PRO</p>
          <p className="text-xs text-stone-400">by Seiton Home</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="mx-auto h-10 w-10 text-emerald-500 mb-3" />
              <h2 className="font-bold text-stone-900 mb-2">{t("forgotPassword.emailSent")}</h2>
              <p className="text-sm text-stone-500">{t("forgotPassword.checkInbox")}</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-stone-900 mb-1">{t("forgotPassword.title")}</h1>
              <p className="text-sm text-stone-500 mb-6">{t("forgotPassword.subtitle")}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t("email")}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" loading={loading}>
                  {t("forgotPassword.send")}
                </Button>
              </form>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Link href="/login" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-amber-700 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
