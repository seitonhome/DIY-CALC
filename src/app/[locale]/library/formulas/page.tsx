import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { FormulasClient } from "./formulas-client";

export default async function FormulasPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const { data: formulas } = await supabase.from("formulas").select("*, formula_materials(*)").eq("user_id", user.id).order("name");
  return <FormulasClient formulas={formulas ?? []} userId={user.id} />;
}
