"use client";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { Bell, User, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { useAppStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { user, setSidebarOpen, sidebarOpen, reset } = useAppStore();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    reset();
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between bg-white/95 backdrop-blur-sm px-4 lg:px-6" style={{ borderBottom: "1px solid #EDE8E1" }}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && <h1 className="text-base font-semibold text-stone-900 truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-2">
        <LanguageSwitcher compact />
        <button className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold" style={{ background: "#F5F0EA", color: "#A8862A" }}>
            {user?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title={t("logout")}
            className="h-8 w-8"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
