export interface CurrencyOption {
  code: string;
  flag: string;
  label_es: string;
  label_en: string;
}

// USD/EUR first (common for export sales), then Latin American currencies
// ordered roughly by number of app users' likely markets.
export const CURRENCIES: CurrencyOption[] = [
  { code: "USD", flag: "🇺🇸", label_es: "Dólar estadounidense", label_en: "US Dollar" },
  { code: "COP", flag: "🇨🇴", label_es: "Peso colombiano", label_en: "Colombian Peso" },
  { code: "MXN", flag: "🇲🇽", label_es: "Peso mexicano", label_en: "Mexican Peso" },
  { code: "ARS", flag: "🇦🇷", label_es: "Peso argentino", label_en: "Argentine Peso" },
  { code: "CLP", flag: "🇨🇱", label_es: "Peso chileno", label_en: "Chilean Peso" },
  { code: "PEN", flag: "🇵🇪", label_es: "Sol peruano", label_en: "Peruvian Sol" },
  { code: "BRL", flag: "🇧🇷", label_es: "Real brasileño", label_en: "Brazilian Real" },
  { code: "UYU", flag: "🇺🇾", label_es: "Peso uruguayo", label_en: "Uruguayan Peso" },
  { code: "BOB", flag: "🇧🇴", label_es: "Boliviano", label_en: "Bolivian Boliviano" },
  { code: "PYG", flag: "🇵🇾", label_es: "Guaraní paraguayo", label_en: "Paraguayan Guaraní" },
  { code: "GTQ", flag: "🇬🇹", label_es: "Quetzal guatemalteco", label_en: "Guatemalan Quetzal" },
  { code: "CRC", flag: "🇨🇷", label_es: "Colón costarricense", label_en: "Costa Rican Colón" },
  { code: "DOP", flag: "🇩🇴", label_es: "Peso dominicano", label_en: "Dominican Peso" },
  { code: "PAB", flag: "🇵🇦", label_es: "Balboa panameño", label_en: "Panamanian Balboa" },
  { code: "EUR", flag: "🇪🇺", label_es: "Euro", label_en: "Euro" },
];

export function currencyLabel(code: string, locale: "es" | "en"): string {
  const c = CURRENCIES.find((c) => c.code === code);
  if (!c) return code;
  return `${c.flag} ${code} — ${locale === "es" ? c.label_es : c.label_en}`;
}
