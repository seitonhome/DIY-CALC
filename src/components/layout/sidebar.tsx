"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard, Flame, Droplets, Sparkles, Mountain, Layers3,
  Package, Cylinder, BookMarked, BarChart3, GitCompare, GraduationCap,
  LifeBuoy, Settings, Shield, ChevronLeft, Menu
} from "lucide-react";
import { useAppStore } from "@/store";
import { LanguageSwitcher } from "./language-switcher";
import { TipsRotator } from "@/components/ui/tips-rotator";

const NAV_SECTIONS = [
  {
    key: "main",
    items: [
      { href: "/dashboard", icon: LayoutDashboard, labelKey: "dashboard" },
    ],
  },
  {
    key: "calculators",
    labelKey: "calculators",
    items: [
      { href: "/calculators/candles", icon: Flame, labelKey: "candles" },
      { href: "/calculators/resin", icon: Droplets, labelKey: "resin" },
      { href: "/calculators/soap", icon: Sparkles, labelKey: "soap" },
      { href: "/calculators/concrete", icon: Mountain, labelKey: "concrete" },
      { href: "/calculators/plaster", icon: Layers3, labelKey: "plaster" },
      { href: "/calculators/multi", icon: Package, labelKey: "multi" },
    ],
  },
  {
    key: "library",
    labelKey: "library",
    items: [
      { href: "/library/materials", icon: Package, labelKey: "library" },
      { href: "/library/molds", icon: Cylinder, labelKey: "library" },
      { href: "/library/formulas", icon: BookMarked, labelKey: "library" },
    ],
  },
  {
    key: "tools",
    items: [
      { href: "/simulator", icon: BarChart3, labelKey: "simulator" },
      { href: "/compare", icon: GitCompare, labelKey: "compare" },
      { href: "/learn", icon: GraduationCap, labelKey: "learn" },
      { href: "/support", icon: LifeBuoy, labelKey: "support" },
    ],
  },
  {
    key: "bottom",
    items: [
      { href: "/settings", icon: Settings, labelKey: "settings" },
      { href: "/admin", icon: Shield, labelKey: "admin" },
    ],
  },
];

export function Sidebar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tDash = useTranslations("dashboard");
  const tLib = useTranslations("library");
  const tSim = useTranslations("simulator");
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  function getLabel(href: string): string {
    if (href === "/dashboard") return t("dashboard");
    if (href.startsWith("/calculators/")) {
      const key = href.split("/").pop() as string;
      return (tDash as any)(`quickAccess.${key}`) ?? href;
    }
    if (href === "/library/materials") return (tLib as any)("materials.title");
    if (href === "/library/molds") return (tLib as any)("molds.title");
    if (href === "/library/formulas") return (tLib as any)("formulas.title");
    if (href === "/simulator") return tSim("title");
    if (href === "/compare") return t("compare");
    if (href === "/learn") return t("learn");
    if (href === "/support") return t("support");
    if (href === "/settings") return t("settings");
    if (href === "/admin") return t("admin");
    return href;
  }

  const isActive = (href: string) => pathname.includes(href);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col bg-white border-r transition-all duration-200",
          sidebarOpen ? "w-60" : "w-16",
          "lg:sticky lg:translate-x-0"
        )}
        style={{ borderColor: "#EDE8E1" }}
      >
        {/* Logo area */}
        <div
          className={cn("flex items-center p-4", sidebarOpen ? "justify-between" : "justify-center")}
          style={{ borderBottom: "1px solid #EDE8E1" }}
        >
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <Image src="/DIY.png" alt="DIY Calc Pro" width={34} height={34} style={{ borderRadius: 10 }} />
              <div>
                <p className="text-sm font-bold leading-none" style={{ color: "#2C2C2C", fontFamily: "Georgia, serif" }}>DIY Calc Pro</p>
                <p className="text-[10px] leading-none mt-0.5" style={{ color: "#C9A347" }}>by Seiton Home</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <Image src="/DIY.png" alt="DIY Calc Pro" width={28} height={28} style={{ borderRadius: 8 }} />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "#9E998F" }}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_SECTIONS.map((section) => (
            <div key={section.key} className="mb-4">
              {section.labelKey && sidebarOpen && (
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "#C4BDB5" }}>
                  {t(section.labelKey as any)}
                </p>
              )}
              {section.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      !sidebarOpen && "justify-center px-2"
                    )}
                    style={active
                      ? { background: "#F5F0EA", color: "#A8862A" }
                      : { color: "#6B6460" }
                    }
                    title={!sidebarOpen ? getLabel(item.href) : undefined}
                  >
                    <item.icon
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: active ? "#C9A347" : undefined }}
                    />
                    {sidebarOpen && <span className="truncate">{getLabel(item.href)}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Tips rotator — only when expanded */}
        {sidebarOpen && (
          <div className="px-3 pb-2 pt-1">
            <TipsRotator locale={locale} intervalMs={9000} />
          </div>
        )}

        {/* Bottom: language switcher */}
        {sidebarOpen && (
          <div className="p-3" style={{ borderTop: "1px solid #EDE8E1" }}>
            <LanguageSwitcher />
          </div>
        )}
      </aside>
    </>
  );
}
