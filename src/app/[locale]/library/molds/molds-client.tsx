"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { calculateVolume } from "@/lib/calculations/geometry";
import type { Mold, MoldShape, Locale } from "@/types";
import { Box, Plus, Pencil, Trash2, X } from "lucide-react";

const SHAPES: MoldShape[] = ["cylinder","cube","rectangular","sphere","hemisphere","cone","pyramid","hexagonal","irregular"];

interface Props { molds: Mold[]; userId: string; }

interface MoldForm {
  name: string;
  shape: MoldShape;
  diameter: number;
  height: number;
  width: number;
  length: number;
  mold_material: string;
  mold_cost: number;
  notes: string;
}

const emptyForm: MoldForm = { name: "", shape: "cylinder", diameter: 0, height: 0, width: 0, length: 0, mold_material: "silicone", mold_cost: 0, notes: "" };

export function MoldsClient({ molds: initialMolds, userId }: Props) {
  const t = useTranslations("library.molds");
  const locale = useLocale() as Locale;
  const [molds, setMolds] = useState<Mold[]>(initialMolds);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Mold | null>(null);
  const [form, setForm] = useState<MoldForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const volume = calculateVolume(form.shape, { diameter: form.diameter, height: form.height, width: form.width, length: form.length });

  async function handleSave() {
    setSaving(true);
    const supabase = createClient();
    const dimensions = { diameter: form.diameter, height: form.height, width: form.width, length: form.length };
    const payload = {
      name: form.name,
      shape: form.shape,
      dimensions,
      volume_ml: volume,
      mold_material: form.mold_material,
      mold_cost: form.mold_cost,
      notes: form.notes || null,
      user_id: userId,
    };
    if (editing) {
      const { data } = await supabase.from("molds").update(payload).eq("id", editing.id).select().single();
      if (data) setMolds(prev => prev.map(m => m.id === data.id ? data : m));
    } else {
      const { data } = await supabase.from("molds").insert(payload).select().single();
      if (data) setMolds(prev => [...prev, data]);
    }
    setSaving(false);
    setShowForm(false);
    setEditing(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("molds").delete().eq("id", id);
    setMolds(prev => prev.filter(m => m.id !== id));
  }

  function handleEdit(m: Mold) {
    setEditing(m);
    const dims = m.dimensions ?? {};
    setForm({
      name: m.name,
      shape: (m.shape as MoldShape) ?? "cylinder",
      diameter: dims.diameter ?? 0,
      height: dims.height ?? 0,
      width: dims.width ?? 0,
      length: dims.length ?? 0,
      mold_material: m.mold_material ?? "silicone",
      mold_cost: m.mold_cost ?? 0,
      notes: m.notes ?? "",
    });
    setShowForm(true);
  }

  const showDiam = ["cylinder","sphere","hemisphere","cone"].includes(form.shape);
  const showWxL = ["rectangular","cube","pyramid","hexagonal"].includes(form.shape);
  const showH = !["sphere"].includes(form.shape);

  return (
    <AppLayout title={t("title")}>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-stone-900">{t("title")}</h1>
          <p className="text-sm text-stone-500">{t("subtitle")}</p>
        </div>
        <Button variant="primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}>
          <Plus className="h-4 w-4" />{t("add")}
        </Button>
      </div>

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
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t("fields.shape")}</label>
                <Select value={form.shape} onValueChange={v => setForm(p => ({ ...p, shape: v as MoldShape }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHAPES.map(s => <SelectItem key={s} value={s}>{t(`shapes.${s}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">{t("fields.material")}</label>
                <Select value={form.mold_material} onValueChange={v => setForm(p => ({ ...p, mold_material: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["silicone","polycarbonate","wood","metal","plastic","other"].map(m => (
                      <SelectItem key={m} value={m}>{t(`materials.${m}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {showDiam && <Input label={t("fields.diameter")} type="number" min="0" step="0.1" value={form.diameter} onChange={e => setForm(p => ({ ...p, diameter: +e.target.value }))} suffix="cm" />}
              {showH && <Input label={t("fields.height")} type="number" min="0" step="0.1" value={form.height} onChange={e => setForm(p => ({ ...p, height: +e.target.value }))} suffix="cm" />}
              {showWxL && (
                <>
                  <Input label={t("fields.width")} type="number" min="0" step="0.1" value={form.width} onChange={e => setForm(p => ({ ...p, width: +e.target.value }))} suffix="cm" />
                  <Input label={t("fields.length")} type="number" min="0" step="0.1" value={form.length} onChange={e => setForm(p => ({ ...p, length: +e.target.value }))} suffix="cm" />
                </>
              )}
              <Input label={t("fields.cost")} type="number" min="0" step="0.01" value={form.mold_cost} onChange={e => setForm(p => ({ ...p, mold_cost: +e.target.value }))} prefix="$" />
            </div>
            {volume > 0 && (
              <div className="mt-3 rounded-lg bg-amber-50 px-4 py-2 text-sm">
                <span className="text-amber-700 font-medium">{t("fields.estimatedVolume")}: </span>
                <span className="font-bold text-amber-900">{volume.toFixed(1)} mL</span>
              </div>
            )}
            <div className="mt-4 flex gap-2">
              <Button variant="primary" onClick={handleSave} loading={saving}>{locale === "es" ? "Guardar" : "Save"}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>{locale === "es" ? "Cancelar" : "Cancel"}</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {molds.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-200 py-16 text-center">
          <Box className="mx-auto h-8 w-8 text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">{t("empty")}</p>
          <Button variant="primary" className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />{t("add")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {molds.map(m => (
            <div key={m.id} className="rounded-xl border border-stone-100 bg-white p-4 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{m.name}</p>
                  <Badge variant="default" className="mt-1 text-[10px]">{t(`shapes.${m.shape ?? "cylinder"}`)}</Badge>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(m)} className="p-1.5 rounded text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => handleDelete(m.id)} className="p-1.5 rounded text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-stone-500">
                <div className="flex justify-between">
                  <span>{t("fields.volume")}</span>
                  <span className="font-medium text-stone-900">{m.volume_ml?.toFixed(1) ?? "—"} mL</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("fields.material")}</span>
                  <span className="font-medium text-stone-700">{m.mold_material ?? "—"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
