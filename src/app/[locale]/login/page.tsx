"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const t      = useTranslations("auth.login");
  const tErr   = useTranslations("auth.errors");
  const locale = useLocale();
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");

  const schema = z.object({
    email:    z.string().email(tErr("invalidEmail")),
    password: z.string().min(1, tErr("required")),
  });
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email, password: data.password,
    });
    if (authError) { setError(tErr("invalidCredentials")); return; }
    router.push("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EA", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Image src="/DIY.png" alt="DIY Calc Pro" width={216} height={216} style={{ borderRadius: 40 }} />
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#2C2C2C", margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
            DIY Calc Pro
          </h1>
          <p style={{ fontSize: 13, color: "#9E998F", margin: 0 }}>{t("subtitle")}</p>
        </div>

        {/* Card */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #EDE8E1", padding: "32px 32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label={t("email")}
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              autoComplete="email"
              {...register("email")}
            />
            <div style={{ position: "relative" }}>
              <Input
                label={t("password")}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                autoComplete="current-password"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 12, top: 32, background: "none", border: "none", cursor: "pointer", color: "#9E998F" }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div style={{ textAlign: "right", marginTop: -8 }}>
              <Link href={`/${locale}/forgot-password`} style={{ fontSize: 12, color: "#C9A347", textDecoration: "none" }}>
                {t("forgot")}
              </Link>
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#991B1B" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%", padding: "13px", background: "#C9A347", color: "white",
                border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
                cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1,
                boxShadow: "0 4px 16px #C9A34755"
              }}
            >
              {isSubmitting ? t("loading") : t("submit")}
            </button>
          </form>

        </div>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "#9E998F" }}>
          {t("noAccount")}{" "}
          <Link href={`/${locale}/register`} style={{ fontWeight: 600, color: "#C9A347", textDecoration: "none" }}>
            {t("register")}
          </Link>
        </p>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
}
