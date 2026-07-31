import Link from "next/link";
import Image from "next/image";
import { getLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const LAST_UPDATED = "2026-07-31";
const SUPPORT_EMAIL = "servicioalcliente@seitonhome.com";

export default async function TermsPage() {
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
            {es ? "Términos de Servicio" : "Terms of Service"}
          </h1>
          <p className="text-xs text-stone-400 mb-8">
            {es ? `Última actualización: ${LAST_UPDATED}` : `Last updated: ${LAST_UPDATED}`}
          </p>

          <div className="space-y-7 text-sm leading-relaxed text-stone-700">
            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "1. Qué es DIY Calc Pro" : "1. What DIY Calc Pro is"}
              </h2>
              <p>
                {es
                  ? "DIY Calc Pro es una herramienta de cálculo y planificación para creadores artesanales (velas, resina, jabón, concreto, yeso y productos multimaterial), operada por Seiton Home. La app calcula costos, precios y cantidades de materiales, y ofrece guías de proceso para ayudarte a ejecutar tus mezclas y recetas. No es un sistema de inventario, contabilidad ni facturación, y no reemplaza el criterio profesional ni las fichas técnicas de seguridad de tus materiales."
                  : "DIY Calc Pro is a calculation and planning tool for artisan creators (candles, resin, soap, concrete, plaster, and multi-material products), operated by Seiton Home. The app calculates costs, prices, and material quantities, and offers process guidance to help you execute your mixes and recipes. It is not an inventory, accounting, or invoicing system, and it does not replace professional judgment or your materials' own safety data sheets."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "2. Cuenta y licencia" : "2. Account and license"}
              </h2>
              <p className="mb-2">
                {es
                  ? "DIY Calc Pro es un producto pago de acceso único, con activación por código. El código de activación se adquiere en seitonhome.com y se valida contra el sistema de licencias de Seiton Home al registrarte. Eres responsable de mantener la confidencialidad de tu contraseña y de toda la actividad que ocurra en tu cuenta."
                  : "DIY Calc Pro is a paid, one-time-access product activated by code. The activation code is purchased on seitonhome.com and validated against Seiton Home's licensing system when you register. You're responsible for keeping your password confidential and for all activity that happens under your account."}
              </p>
              <p>
                {es
                  ? "La licencia es personal e intransferible, para tu propio uso como creador o pequeño negocio. No está permitido revender el acceso, compartir credenciales públicamente, ni usar la app para construir un producto competidor."
                  : "The license is personal and non-transferable, for your own use as a creator or small business. Reselling access, publicly sharing credentials, or using the app to build a competing product is not allowed."}
              </p>
            </section>

            <section
              style={{ background: "#FEF2F2", border: "1px solid #FCA5A5", borderRadius: 12, padding: "16px 18px" }}
            >
              <h2 className="flex items-center gap-2 text-base font-semibold text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {es ? "3. Aviso de seguridad importante" : "3. Important safety notice"}
              </h2>
              <p className="text-red-900">
                {es
                  ? "Varias de las técnicas que la app describe involucran materiales peligrosos si se manejan mal: sosa cáustica (hidróxido de sodio/potasio) en jabonería, cera y resina calientes, y polvo de cemento o yeso. Toda la información de proceso, temperaturas, proporciones y consejos es orientativa y de carácter general — no sustituye la ficha de seguridad (SDS) de tus materiales específicos ni el sentido común. Usa siempre el equipo de protección adecuado (guantes, gafas, ventilación), sigue las instrucciones del fabricante de cada material, y mantén estos productos fuera del alcance de niños y mascotas. Tú eres el único responsable de tu seguridad y la de tu espacio de trabajo; Seiton Home no se hace responsable por lesiones, daños o pérdidas derivadas del uso de la información de la app."
                  : "Several of the techniques the app describes involve materials that are dangerous if mishandled: caustic lye (sodium/potassium hydroxide) in soapmaking, hot wax and resin, and cement or plaster dust. All process information, temperatures, ratios, and tips are general guidance only — they do not replace the safety data sheet (SDS) for your specific materials or your own common sense. Always use appropriate protective equipment (gloves, goggles, ventilation), follow each material manufacturer's instructions, and keep these products away from children and pets. You are solely responsible for your safety and your workspace; Seiton Home is not liable for injuries, damages, or losses resulting from use of the app's information."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "4. Precisión de los cálculos" : "4. Accuracy of calculations"}
              </h2>
              <p>
                {es
                  ? "Los resultados de costos, cantidades de materiales y precios sugeridos son estimaciones basadas en los datos que ingresas y en fórmulas estándar de la industria. Los materiales reales varían por marca, densidad y condiciones de trabajo — te recomendamos calibrar con una pieza de prueba antes de producir en lote. Seiton Home no garantiza que los resultados sean exactos para tu caso particular."
                  : "Cost results, material quantities, and suggested prices are estimates based on the data you enter and standard industry formulas. Real materials vary by brand, density, and working conditions — we recommend calibrating with a test piece before batch production. Seiton Home does not guarantee results will be exact for your particular case."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "5. Contenido y datos que guardas" : "5. Content and data you save"}
              </h2>
              <p>
                {es
                  ? "Tus cálculos, fórmulas, materiales y moldes guardados en la app te pertenecen. Nos das permiso para almacenarlos y procesarlos únicamente con el fin de operar el servicio (por ejemplo, mostrártelos en tu panel o generar tus exportaciones en PDF)."
                  : "Your saved calculations, formulas, materials, and molds belong to you. You grant us permission to store and process them solely to operate the service (for example, to display them in your dashboard or generate your PDF exports)."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "6. Disponibilidad del servicio" : "6. Service availability"}
              </h2>
              <p>
                {es
                  ? "Hacemos un esfuerzo razonable por mantener la app disponible, pero no garantizamos un servicio ininterrumpido o libre de errores. Podemos actualizar, modificar o suspender funciones con el fin de mejorar el producto."
                  : "We make a reasonable effort to keep the app available, but we don't guarantee uninterrupted or error-free service. We may update, change, or suspend features in order to improve the product."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "7. Cambios a estos términos" : "7. Changes to these terms"}
              </h2>
              <p>
                {es
                  ? "Podemos actualizar estos términos ocasionalmente. Si el cambio es importante, te avisaremos dentro de la app o por correo. Seguir usando DIY Calc Pro después de un cambio implica que lo aceptas."
                  : "We may update these terms from time to time. If a change is material, we'll let you know inside the app or by email. Continuing to use DIY Calc Pro after a change means you accept it."}
              </p>
            </section>

            <section>
              <h2 className="text-base font-semibold text-stone-900 mb-2">
                {es ? "8. Contacto" : "8. Contact"}
              </h2>
              <p>
                {es ? "¿Preguntas sobre estos términos? Escríbenos a " : "Questions about these terms? Write to us at "}
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
