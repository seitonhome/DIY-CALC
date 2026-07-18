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
import { CheckCircle, Key } from "lucide-react";

export default function ActivatePage() {
  const t = useTranslations("auth.activate");
  const tErr = useTranslations("auth.errors");
  const locale = useLocale();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const schema = z.object({
    code: z.string().min(1, tErr("required")),
  });
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    const supabase = createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // Check code validity
    const { data: codeData, error: codeError } = await supabase
      .from("activation_codes")
      .select("*")
      .eq("code", data.code.toUpperCase().trim())
      .eq("status", "unused")
      .single();

    if (codeError || !codeData) {
      setError(tErr("invalidCode"));
      return;
    }

    // Check expiry
    if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
      setError(tErr("expiredCode"));
      return;
    }

    // Mark code as used
    await supabase
      .from("activation_codes")
      .update({ status: "used", used_by: user.id, used_at: new Date().toISOString() })
      .eq("id", codeData.id);

    // Update license
    await supabase
      .from("licenses")
      .update({
        status: "active",
        plan: "premium",
        activation_code_id: codeData.id,
        activated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-md text-center rounded-2xl border border-stone-200 bg-white p-10 shadow-sm">
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-stone-900 mb-2">{t("success")}</h2>
          <p className="text-sm text-stone-500">Redirigiendo al panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-700 text-white">
            <Key className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-stone-500">{t("subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label={t("code")}
              placeholder={t("codePlaceholder")}
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

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>
            )}

            <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
              {isSubmitting ? t("loading") : t("submit")}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          {t("noCode")}{" "}
          <Link href={`/${locale}/`} className="font-medium text-amber-700 hover:underline">
            {t("buy")}
          </Link>
        </p>
      </div>
    </div>
  );
}
