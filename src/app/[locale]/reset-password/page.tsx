"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const tErr = useTranslations("auth.errors");
  const locale = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const schema = z.object({
    password: z.string().min(8, tErr("minPassword")),
    confirm: z.string().min(1, tErr("required")),
  }).refine((d) => d.password === d.confirm, {
    message: tErr("passwordMatch"),
    path: ["confirm"],
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setValidLink(true);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidLink(!!session);
      setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function onSubmit(data: FormData) {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.updateUser({ password: data.password });
    if (authError) {
      setError(tErr("genericError"));
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 2000);
  }

  if (!ready) return null;

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">{t("success")}</h2>
          <p className="text-sm text-stone-500">{t("goToLogin")}...</p>
        </div>
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
          <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">{t("invalidLink")}</h2>
          <Button asChild variant="primary" className="mt-6 w-full">
            <Link href={`/${locale}/forgot-password`}>{t("requestNewLink")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-lg font-bold text-stone-900">DIY CALC PRO</p>
          <p className="text-xs text-stone-400">by Seiton Home</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-xl font-bold text-stone-900 mb-1">{t("title")}</h1>
          <p className="text-sm text-stone-500 mb-6">{t("subtitle")}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("password")}
              type="password"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              label={t("confirm")}
              type="password"
              autoComplete="new-password"
              error={errors.confirm?.message}
              {...register("confirm")}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
              {isSubmitting ? t("loading") : t("submit")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
