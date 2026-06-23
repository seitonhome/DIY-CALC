import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { MaterialsClient } from "./materials-client";

export default async function MaterialsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const { data: materials } = await supabase.from("materials").select("*").eq("user_id", user.id).order("name");
  return <MaterialsClient materials={materials ?? []} userId={user.id} />;
}
