"use client";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");

  function toggle() {
    const next = locale === "es" ? "en" : "es";
    router.replace(pathname, { locale: next });
  }

  const label = locale === "es" ? "ES" : "EN";
  const switchLabel = locale === "es" ? "Cambiar a English" : "Switch to Español";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="gap-1.5 font-semibold"
      title={switchLabel}
    >
      <Globe className="h-3.5 w-3.5" />
      {label}
    </Button>
  );
}
