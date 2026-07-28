const SEITON_ACTIVATE_URL = "https://www.seitonhome.com/api/activate-code";
const PRODUCT_SLUG = "diy-calc-pro";

export type LicenseCheckResult =
  | { ok: true }
  | { ok: false; error: string };

export async function checkLicenseCode(code: string, email: string): Promise<LicenseCheckResult> {
  let res: Response;
  try {
    res = await fetch(SEITON_ACTIVATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activation_code: code, buyer_email: email, product_slug: PRODUCT_SLUG }),
      cache: "no-store",
    });
  } catch {
    return { ok: false, error: "network_error" };
  }

  const data = await res.json().catch(() => null);
  if (!data?.ok) {
    return { ok: false, error: data?.error ?? "invalid_code" };
  }
  return { ok: true };
}
