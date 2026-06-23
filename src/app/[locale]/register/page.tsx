"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  }).refine((d) => d.password === d.confirm, {
    message: tErr("passwordMatch"),
    path: ["confirm"],
  });

  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.name } },
    });
    if (authError) {
      setError(tErr("genericError"));
      return;
    }
    setSuccess(true);
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
