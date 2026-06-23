import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";

export default async function LocalePage() {
  const locale = await getLocale();
  redirect(`/${locale}/login`);
}
