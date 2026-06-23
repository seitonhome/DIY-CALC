"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LifeBuoy, Mail, ExternalLink, ChevronDown, ChevronUp, Clock } from "lucide-react";

const SUPPORT_EMAIL = "servicioalcliente@seitonhome.com";
const TICKET_URL = "https://www.seitonhome.com/apps";

export default function SupportPage() {
  const t = useTranslations("support");
  const [expanded, setExpanded] = useState<number | null>(null);

  const faqItems = t.raw("faq.items") as { q: string; a: string }[];

  return (
    <AppLayout title={t("title")}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <LifeBuoy className="h-5 w-5 text-amber-600" />
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
        </div>
        <p className="text-sm text-stone-500 max-w-xl">{t("subtitle")}</p>
      </div>

      <div className="max-w-3xl space-y-8">
        {/* Contact channels */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
            {t("contact.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Email card */}
            <Card className="border-amber-200 bg-amber-50/40">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-amber-100 p-2 flex-shrink-0">
                    <Mail className="h-4 w-4 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{t("contact.emailLabel")}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{t("contact.emailDesc")}</p>
                  </div>
                </div>
                <p className="text-sm font-mono font-medium text-amber-800 bg-amber-100 rounded-lg px-3 py-2 mb-3 break-all">
                  {SUPPORT_EMAIL}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`, "_blank")}
                >
                  <Mail className="h-3.5 w-3.5" />
                  {t("contact.emailAction")}
                </Button>
              </CardContent>
            </Card>

            {/* Ticket card */}
            <Card className="border-stone-200">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="rounded-lg bg-stone-100 p-2 flex-shrink-0">
                    <LifeBuoy className="h-4 w-4 text-stone-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{t("contact.ticketLabel")}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{t("contact.ticketDesc")}</p>
                  </div>
                </div>
                <p className="text-sm font-mono text-stone-500 bg-stone-50 rounded-lg px-3 py-2 mb-3 truncate border border-stone-200">
                  seitonhome.com/apps
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(TICKET_URL, "_blank")}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  {t("contact.ticketAction")}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Response time note */}
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
            <Clock className="h-4 w-4 text-stone-400 flex-shrink-0" />
            <p className="text-xs text-stone-500">{t("contact.responseTime")}</p>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-400 mb-4">
            {t("faq.title")}
          </h2>
          <div className="space-y-2">
            {faqItems.map((item, i) => {
              const isOpen = expanded === i;
              return (
                <div key={i} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                  <button
                    onClick={() => setExpanded(isOpen ? null : i)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-stone-900">{item.q}</p>
                    </div>
                    {isOpen
                      ? <ChevronUp className="h-4 w-4 text-stone-400 flex-shrink-0 ml-3" />
                      : <ChevronDown className="h-4 w-4 text-stone-400 flex-shrink-0 ml-3" />
                    }
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-stone-100">
                      <p className="pt-4 text-sm text-stone-600 leading-relaxed">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/30 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-stone-900 mb-0.5">
              {t("contact.emailLabel")}
            </p>
            <p className="text-xs text-stone-500">{SUPPORT_EMAIL}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => window.open(`mailto:${SUPPORT_EMAIL}`, "_blank")}
          >
            <Mail className="h-3.5 w-3.5" />
            {t("contact.emailAction")}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
