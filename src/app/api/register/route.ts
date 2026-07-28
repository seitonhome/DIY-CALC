import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkLicenseCode } from "@/lib/licensing";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name = body?.name as string | undefined;
  const email = body?.email as string | undefined;
  const password = body?.password as string | undefined;
  const code = body?.code as string | undefined;

  if (!name || !email || !password || !code) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const licenseCheck = await checkLicenseCode(code, email);
  if (!licenseCheck.ok) {
    return NextResponse.json(licenseCheck, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (createError || !created.user) {
    const isDuplicate = createError?.message?.toLowerCase().includes("already");
    return NextResponse.json(
      { ok: false, error: isDuplicate ? "email_taken" : "signup_failed" },
      { status: 400 }
    );
  }

  const { error: licenseError } = await supabaseAdmin
    .from("licenses")
    .update({ status: "active", plan: "premium", activated_at: new Date().toISOString() })
    .eq("user_id", created.user.id);

  if (licenseError) {
    return NextResponse.json({ ok: false, error: "license_update_failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
