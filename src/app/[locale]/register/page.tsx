"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const tErr = useTranslations("auth.errors");
  const locale = useLocale();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const schema = z.object({
    name: z.string().min(1, tErr("required")),
    email: z.string().email(tErr("invalidEmail")),
    password: z.string().min(8, tErr("minPassword")),
    confirm: z.string().min(1, tErr("required")),
    code: z.string().min(1, tErr("required")),
    agreeToTerms: z.boolean().refine((v) => v === true, {
      message: locale === "es" ? "Debes aceptar los Términos y la Política de Privacidad" : "You must accept the Terms of Service and Privacy Policy",
    }),
  }).refine((d) => d.password === d.confirm, {
    message: tErr("passwordMatch"),
    path: ["confirm"],
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { agreeToTerms: false },
  });

  async function onSubmit(data: FormData) {
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.name, email: data.email, password: data.password, code: data.code }),
    });
    const result = await res.json();
    if (!result.ok) {
      setError(result.error === "email_taken" ? tErr("emailTaken") : tErr("invalidCode"));
      return;
    }

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (loginError) {
      setSuccess(true);
      return;
    }

    router.push("/dashboard");
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">{t("success")}</h2>
          <Button asChild variant="primary" className="mt-6 w-full">
            <Link href={`/${locale}/login`}>{useTranslations("auth.login")("submit")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700 text-white font-black text-xl">D</div>
          <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label={t("name")} placeholder="María García" error={errors.name?.message} {...register("name")} />
            <Input label={t("email")} type="email" placeholder="tu@email.com" error={errors.email?.message} {...register("email")} />
            <Input label={t("password")} type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            <Input label={t("confirm")} type="password" placeholder="••••••••" error={errors.confirm?.message} {...register("confirm")} />
            <Input
              label={t("activationCode")}
              placeholder={t("activationCodePlaceholder")}
              className="tracking-widest font-mono text-center uppercase"
              error={errors.code?.message}
              {...register("code")}
              onChange={(e) => {
                const formatted = e.target.value
                  .toUpperCase()
                  .replace(/[^A-Z0-9]/g, "")
                  .replace(/(.{4})/g, "$1-")
                  .slice(0, 19);
                e.target.value = formatted;
              }}
            />

            <div>
              <div className="flex items-start gap-2.5">
                <Controller
                  control={control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <Checkbox
                      id="agreeToTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      error={errors.agreeToTerms?.message}
                      className="mt-0.5"
                    />
                  )}
                />
                <label htmlFor="agreeToTerms" className="text-sm leading-snug text-stone-600">
                  {locale === "es" ? "Acepto los " : "I agree to the "}
                  <Link href={`/${locale}/terms`} target="_blank" className="font-medium text-amber-700 hover:underline">
                    {locale === "es" ? "Términos de Servicio" : "Terms of Service"}
                  </Link>
                  {locale === "es" ? " y la " : " and "}
                  <Link href={`/${locale}/privacy`} target="_blank" className="font-medium text-amber-700 hover:underline">
                    {locale === "es" ? "Política de Privacidad" : "Privacy Policy"}
                  </Link>
                  .
                </label>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-xs text-red-500">{errors.agreeToTerms.message}</p>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
              {isSubmitting ? t("loading") : t("submit")}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          {t("hasAccount")}{" "}
          <Link href={`/${locale}/login`} className="font-medium text-amber-700 hover:underline">
            {t("login")}
          </Link>
        </p>
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
