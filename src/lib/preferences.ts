import { createClient } from "@/lib/supabase/client";

export async function getPreferredCurrency(): Promise<string | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("user_preferences")
    .select("preferred_currency")
    .eq("user_id", user.id)
    .single();
  return data?.preferred_currency ?? null;
}
