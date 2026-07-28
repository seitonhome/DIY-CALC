import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkLicenseCode } from "@/lib/licensing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = body?.code as string | undefined;
  if (!code) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "not_authenticated" }, { status: 401 });
  }

  const result = await checkLicenseCode(code, user.email);
  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("licenses")
    .update({ status: "active", plan: "premium", activated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    return NextResponse.json({ ok: false, error: "license_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
