import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const locale  = await getLocale();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [
    { data: profile },
    { data: license },
    { data: calculations },
    { data: formulas },
    { data: materials },
    { data: products },
  ] = await Promise.all([
    supabase.from("users_profile").select("*").eq("user_id", user.id).single(),
    supabase.from("licenses").select("*").eq("user_id", user.id).single(),
    supabase.from("calculations").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("formulas").select("*").eq("user_id", user.id),
    supabase.from("materials").select("*").eq("user_id", user.id),
    supabase.from("products").select("*").eq("user_id", user.id),
  ]);

  return (
    <DashboardClient
      profile={profile}
      license={license}
      calculations={calculations ?? []}
      formulas={formulas ?? []}
      materials={materials ?? []}
      products={products ?? []}
    />
  );
}
