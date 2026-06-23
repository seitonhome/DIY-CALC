"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Formula, Locale } from "@/types";
import { FlaskConical, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface Props { formulas: (Formula & { formula_materials?: any[] })[]; userId: string; }

const CATEGORIES = ["candles","resin","soap","concrete","plaster","multi"];

export function FormulasClient({ formulas: initialFormulas, userId }: Props) {
  const t = useTranslations("library.formulas");
  const locale = useLocale() as Locale;
  const [formulas, setFormulas] = useState(initialFormulas);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("formulas").delete().eq("id", id);
    setFormulas(prev => prev.filter(f => f.id !== id));
  }

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500">{t("subtitle")}</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 mb-6 text-sm text-amber-800">
        {locale === "es"
          ? "Las fórmulas se guardan automáticamente al completar un cálculo. Puedes gestionarlas aquí."
          : "Formulas are saved automatically when you complete a calculation. Manage them here."}
      </div>

      {formulas.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 py-16 text-center">
          <FlaskConical className="mx-auto h-8 w-8 text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">{t("empty")}</p>
          <p className="text-xs text-stone-400 mt-1">
            {locale === "es" ? "Realiza tu primer cálculo para guardar una fórmula." : "Complete your first calculation to save a formula."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {formulas.map(f => {
            const isOpen = expanded === f.id;
            const materials = f.formula_materials ?? [];
            return (
              <div key={f.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4">
                  <button onClick={() => setExpanded(isOpen ? null : f.id)} className="flex flex-1 items-center gap-3 text-left">
                    <FlaskConical className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-sm">{f.name}</p>
                      <p className="text-xs text-stone-500 truncate">{f.description ?? ""}</p>
                    </div>
                    <Badge variant="default" className="text-[10px] ml-2 flex-shrink-0">{f.category}</Badge>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-stone-300 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-stone-300 flex-shrink-0" />}
                  </button>
                  <button onClick={() => handleDelete(f.id)} className="p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-stone-100">
                    {materials.length > 0 ? (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-stone-500 uppercase mb-2">{t("fields.materials")}</p>
                        <div className="space-y-2">
                          {materials.map((m: any) => (
                            <div key={m.id} className="flex items-center justify-between text-sm">
                              <span className="text-stone-700">{m.material_name ?? m.material_id}</span>
                              <span className="text-stone-500">{m.quantity} {m.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-4 text-xs text-stone-400">{t("noMaterials")}</p>
                    )}
                    {f.notes && (
                      <div className="mt-3 text-xs text-stone-500 bg-stone-50 rounded p-3">{f.notes}</div>
                    )}
                    <p className="mt-3 text-xs text-stone-400">
                      {locale === "es" ? "Creada" : "Created"}: {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
