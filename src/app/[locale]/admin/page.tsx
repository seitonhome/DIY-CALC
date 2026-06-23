import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { AdminClient } from "./admin-client";

export default async function AdminPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const { data: profile } = await supabase.from("users_profile").select("role").eq("user_id", user.id).single();
  if (profile?.role !== "admin") redirect(`/${locale}/dashboard`);

  const [
    { data: users },
    { data: codes },
    { data: calculations },
  ] = await Promise.all([
    supabase.from("users_profile").select("*, licenses(*), user_preferences(preferred_language)").order("created_at", { ascending: false }),
    supabase.from("activation_codes").select("*").order("created_at", { ascending: false }),
    supabase.from("calculations").select("category, created_at"),
  ]);

  return <AdminClient users={users ?? []} codes={codes ?? []} calculations={calculations ?? []} />;
}
