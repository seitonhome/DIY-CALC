import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "DIY Calc Pro by Seiton Home",
    description:
      locale === "es"
        ? "La calculadora profesional para creadores DIY. Calcula materiales, costos, precios y márgenes con precisión."
        : "The professional calculator for DIY makers. Calculate materials, costs, prices and margins with precision.",
    openGraph: {
      title: "DIY Calc Pro by Seiton Home",
      siteName: "Seiton Home",
      locale: locale === "es" ? "es_MX" : "en_US",
      type: "website",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        "es": "/es",
        "en": "/en",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "es" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}
