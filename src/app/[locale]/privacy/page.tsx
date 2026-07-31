import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ArrowLeft } from "lucide-react";

const LAST_UPDATED = "2026-07-31";
const SUPPORT_EMAIL = "servicioalcliente@seitonhome.com";

export default async function PrivacyPage() {
  const locale = await getLocale();
  const es = locale === "es";

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0EA" }}>
      <div className="mx-auto max-w-3xl px-5 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700">
            <ArrowLeft className="h-4 w-4" />
            {es ? "Volver" : "Back"}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="mb-8 flex items-center gap-3">
          <Image src="/DIY.png" alt="DIY Calc Pro" width={44} height={44} style={{ borderRadius: 10 }} />
          <div>
            <p className="text-lg font-bold text-stone-900" style={{ fontFamily: "Georgia, serif" }}>DIY Calc Pro</p>
            <p className="text-xs text-stone-400">by Seiton Home</p>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-stone-900 mb-1">
            {es ? "Política de Privacidad" : "Privacy Policy"}
          </h1>
          <p className="text-xs text-stone-400 mb-8">
            {es ? `Última actualización: ${LAST_UPDATED}` : `Last updated: ${LAST_UPDATED}`}
          </p>

          <div className="space-y-7 text-sm leading-relaxed text-stone-700">
            <section>
              <p>
                {es
                  ? "Esta política explica qué datos recopila DIY Calc Pro, para qué los usamos y qué opciones tienes. Al usar la app, aceptas las prácticas descritas aquí."
                  : "This policy explains what data DIY Calc Pro collects, what we use it for, and what choices you have. By using the app, you agree to the practices described here."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "1. Qué datos recopilamos" : "1. What data we collect"}
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  {es
                    ? "Datos de cuenta: nombre, correo electrónico y contraseña (la contraseña se almacena de forma cifrada por nuestro proveedor de autenticación, nunca en texto plano)."
                    : "Account data: name, email address, and password (your password is stored encrypted by our authentication provider, never in plain text)."}
                </li>
                <li>
                  {es
                    ? "Código de activación y estado de tu licencia (activa, demo, etc.)."
                    : "Activation code and your license status (active, demo, etc.)."}
                </li>
                <li>
                  {es
                    ? "Contenido que guardas voluntariamente: cálculos, fórmulas, materiales y moldes."
                    : "Content you voluntarily save: calculations, formulas, materials, and molds."}
                </li>
                <li>
                  {es
                    ? "Preferencia de idioma, guardada en tu navegador (localStorage) para recordar tu elección entre sesiones."
                    : "Language preference, stored in your browser (localStorage) to remember your choice between sessions."}
                </li>
                <li>
                  {es
                    ? "Datos técnicos básicos (por ejemplo, tipo de error si algo falla) para poder diagnosticar y corregir problemas del servicio."
                    : "Basic technical data (for example, error details if something breaks) so we can diagnose and fix service issues."}
                </li>
              </ul>
              <p className="mt-2">
                {es
                  ? "No recopilamos ni almacenamos datos de tarjetas de pago: la compra de tu código de activación se procesa por completo en seitonhome.com, fuera de esta app."
                  : "We do not collect or store payment card data: your activation code purchase is processed entirely on seitonhome.com, outside of this app."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "2. Para qué usamos tus datos" : "2. What we use your data for"}
              </h2>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>{es ? "Crear y proteger tu cuenta, y darte acceso a la app." : "Create and secure your account, and give you access to the app."}</li>
                <li>{es ? "Validar tu código de activación con el sistema de licencias de Seiton Home." : "Validate your activation code with Seiton Home's licensing system."}</li>
                <li>{es ? "Guardar y mostrarte tus cálculos, fórmulas y materiales." : "Save and display your calculations, formulas, and materials."}</li>
                <li>{es ? "Generar tus exportaciones en PDF." : "Generate your PDF exports."}</li>
                <li>{es ? "Responder tus solicitudes de soporte." : "Respond to your support requests."}</li>
                <li>{es ? "Detectar y corregir errores técnicos del servicio." : "Detect and fix technical service errors."}</li>
              </ul>
              <p className="mt-2">
                {es
                  ? "No vendemos tus datos personales ni los usamos con fines publicitarios."
                  : "We do not sell your personal data or use it for advertising purposes."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "3. Con quién compartimos datos" : "3. Who we share data with"}
              </h2>
              <p className="mb-2">
                {es
                  ? "Usamos proveedores externos para operar el servicio, quienes procesan datos en nuestro nombre bajo sus propios compromisos de seguridad:"
                  : "We use external providers to operate the service, who process data on our behalf under their own security commitments:"}
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                <li>
                  <strong>Supabase</strong> — {es ? "aloja nuestra base de datos y gestiona la autenticación de cuentas." : "hosts our database and manages account authentication."}
                </li>
                <li>
                  {es
                    ? "Sistema de licencias de Seiton Home — recibe tu correo y código de activación únicamente para validar tu compra."
                    : "Seiton Home's licensing system — receives your email and activation code solely to validate your purchase."}
                </li>
              </ul>
              <p className="mt-2">
                {es
                  ? "No compartimos tus datos con terceros para fines de marketing. Podemos divulgar información si la ley lo exige."
                  : "We don't share your data with third parties for marketing purposes. We may disclose information if required by law."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "4. Cuánto tiempo guardamos tus datos" : "4. How long we keep your data"}
              </h2>
              <p>
                {es
                  ? "Guardamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu cuenta, borramos tus datos personales y contenido guardado en un plazo razonable, salvo que debamos conservar algo por obligación legal."
                  : "We keep your data while your account is active. If you request account deletion, we remove your personal data and saved content within a reasonable timeframe, unless we're required to retain something by law."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "5. Tus derechos" : "5. Your rights"}
              </h2>
              <p>
                {es
                  ? "Puedes acceder, corregir o eliminar tus datos personales en cualquier momento desde Ajustes, o escribiéndonos. También puedes pedirnos una copia de tus datos guardados."
                  : "You can access, correct, or delete your personal data at any time from Settings, or by writing to us. You can also ask us for a copy of your saved data."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "6. Cookies y almacenamiento local" : "6. Cookies and local storage"}
              </h2>
              <p>
                {es
                  ? "Usamos cookies estrictamente necesarias para mantener tu sesión iniciada, y almacenamiento local del navegador para recordar tu idioma preferido. No usamos cookies de seguimiento publicitario."
                  : "We use strictly necessary cookies to keep you signed in, and browser local storage to remember your preferred language. We don't use advertising tracking cookies."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "7. Menores de edad" : "7. Children"}
              </h2>
              <p>
                {es
                  ? "DIY Calc Pro está dirigido a adultos que gestionan un negocio o pasatiempo artesanal. No está diseñado para ni dirigido a menores de edad."
                  : "DIY Calc Pro is intended for adults running a craft business or hobby. It is not designed for or directed at children."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "8. Cambios a esta política" : "8. Changes to this policy"}
              </h2>
              <p>
                {es
                  ? "Podemos actualizar esta política ocasionalmente. Si el cambio es importante, te avisaremos dentro de la app o por correo."
                  : "We may update this policy from time to time. If a change is material, we'll let you know inside the app or by email."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "9. Contacto" : "9. Contact"}
              </h2>
              <p>
                {es ? "¿Preguntas sobre tus datos? Escríbenos a " : "Questions about your data? Write to us at "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-amber-700 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          © {new Date().getFullYear()} Seiton Home. {es ? "Todos los derechos reservados." : "All rights reserved."}
        </p>
      </div>
    </div>
  );
}
