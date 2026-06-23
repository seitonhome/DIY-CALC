"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/format";
import { createClient } from "@/lib/supabase/client";
import type { Material, Locale } from "@/types";
import { Package, Plus, Pencil, Trash2, Search, X } from "lucide-react";

interface Props { materials: Material[]; userId: string; }

const CATEGORIES = ["waxes","fragrances","colorants","additives","resins","hardeners","pigments","micas","soapBases","oils","butters","cement","plaster","sand","sealants","packaging","labels","accessories","tools","other"];

export function MaterialsClient({ materials: initialMaterials, userId }: Props) {
  const t = useTranslations("library.materials");
  const locale = useLocale() as Locale;
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState({ name: "", category: "waxes", purchase_unit: "kg", purchase_qty: 1, price_paid: 0, supplier: "", waste_pct: 0, notes: "" });
  const [saving, setSaving] = useState(false);

  const filtered = materials.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "all" || m.category === filterCat;
    return matchSearch && matchCat;
  });

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    if (editing) {
      const { data } = await supabase.from("materials").update(form).eq("id", editing.id).select().single();
      if (data) setMaterials(prev => prev.map(m => m.id === data.id ? data : m));
    } else {
      const { data } = await supabase.from("materials").insert({ ...form, user_id: userId }).select().single();
      if (data) setMaterials(prev => [...prev, data]);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm({ name: "", category: "waxes", purchase_unit: "kg", purchase_qty: 1, price_paid: 0, supplier: "", waste_pct: 0, notes: "" });
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("materials").delete().eq("id", id);
    setMaterials(prev => prev.filter(m => m.id !== id));
  }

  function handleEdit(m: Material) {
    setEditing(m);
    setForm({ name: m.name, category: m.category, purchase_unit: m.purchase_unit, purchase_qty: m.purchase_qty, price_paid: m.price_paid, supplier: m.supplier ?? "", waste_pct: m.waste_pct, notes: m.notes ?? "" });
    setShowForm(true);
  }

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500">{t("subtitle")}</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus className="h-4 w-4" />{t("add")}
        </Button>
      </div>

      {/* Form modal-like */}
      {showForm && (
        <Card className="mb-6 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              {editing ? t("edit") : t("add")}
              <button onClick={() => setShowForm(false)} className="text-stone-400 hover:text-stone-700"><X className="h-4 w-4" /></button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Input label={t("fields.name")} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t("fields.category")}</label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(`categories.${c}` as any)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Input label={t("fields.purchaseUnit")} value={form.purchase_unit} onChange={e => setForm(p => ({ ...p, purchase_unit: e.target.value }))} />
              <Input label={t("fields.purchaseQty")} type="number" min="0" value={form.purchase_qty} onChange={e => setForm(p => ({ ...p, purchase_qty: +e.target.value }))} />
              <Input label={t("fields.pricePaid")} type="number" min="0" step="0.01" value={form.price_paid} onChange={e => setForm(p => ({ ...p, price_paid: +e.target.value }))} prefix="$" />
              <Input label={t("fields.supplier")} value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} />
              <Input label={t("fields.wastePct")} type="number" min="0" max="50" value={form.waste_pct} onChange={e => setForm(p => ({ ...p, waste_pct: +e.target.value }))} suffix="%" />
              <div className="sm:col-span-2">
                <Input label={t("fields.notes")} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" onClick={handleSave} loading={saving}>{saving ? "..." : locale === "es" ? "Guardar" : "Save"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>{locale === "es" ? "Cancelar" : "Cancel"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="mb-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("search")} className="w-full h-10 pl-9 pr-3 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t("filter")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === "es" ? "Todas las categorías" : "All categories"}</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{t(`categories.${c}` as any)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Materials grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 py-16 text-center">
          <Package className="mx-auto h-8 w-8 text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">{t("empty")}</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />{t("add")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <div key={m.id} className="rounded-xl border border-stone-100 bg-white p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{m.name}</p>
                  <Badge variant="default" className="mt-1 text-[10px]">{t(`categories.${m.category}` as any)}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(m)} className="p-1.5 rounded text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>{t("fields.costPerGram")}</span>
                  <span className="font-medium text-stone-900">{formatCurrency(m.cost_per_gram, "USD", locale)}/g</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("fields.supplier")}</span>
                  <span className="font-medium text-stone-700 truncate max-w-[120px]">{m.supplier ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("fields.wastePct")}</span>
                  <span className="font-medium">{m.waste_pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
