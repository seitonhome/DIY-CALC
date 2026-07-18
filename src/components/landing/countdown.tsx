"use client";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const CYCLE_MS = 15 * 24 * 60 * 60 * 1000;
const CYCLE_ANCHOR = new Date("2026-01-01T00:00:00Z").getTime();

function getTimeLeft() {
  const elapsed = (Date.now() - CYCLE_ANCHOR) % CYCLE_MS;
  const remaining = CYCLE_MS - elapsed;
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
  const hours = Math.floor((remaining / (60 * 60 * 1000)) % 24);
  const minutes = Math.floor((remaining / (60 * 1000)) % 60);
  const seconds = Math.floor((remaining / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-2xl font-black text-white sm:h-20 sm:w-20 sm:text-3xl">
        {String(value).padStart(2, "0")}
      </div>
      <p className="mt-2 text-xs font-medium uppercase tracking-wider text-amber-100">{label}</p>
    </div>
  );
}

export function Countdown() {
  const t = useTranslations("landing.countdown");
  const locale = useLocale();
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof getTimeLeft> | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge className="mb-4 inline-flex items-center gap-1.5 bg-white/10 text-white border-white/20 px-4 py-1.5">
          <Clock className="h-3 w-3" />
          {t("eyebrow")}
        </Badge>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{t("title")}</h2>
        <p className="mt-3 text-amber-100/80">{t("subtitle")}</p>

        <div className="mt-8 flex items-center justify-center gap-3 sm:gap-5">
          <TimeBox value={timeLeft?.days ?? 0} label={t("days")} />
          <span className="text-2xl font-bold text-white/30">:</span>
          <TimeBox value={timeLeft?.hours ?? 0} label={t("hours")} />
          <span className="text-2xl font-bold text-white/30">:</span>
          <TimeBox value={timeLeft?.minutes ?? 0} label={t("minutes")} />
          <span className="text-2xl font-bold text-white/30">:</span>
          <TimeBox value={timeLeft?.seconds ?? 0} label={t("seconds")} />
        </div>

        <Button asChild variant="primary" size="xl" className="mt-10">
          <Link href={`/${locale}/register`}>
            {t("cta")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
