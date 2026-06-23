import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import { MoldsClient } from "./molds-client";

export default async function MoldsPage() {
  const supabase = await createClient();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const { data: molds } = await supabase.from("molds").select("*").eq("user_id", user.id).order("name");
  return <MoldsClient molds={molds ?? []} userId={user.id} />;
}
