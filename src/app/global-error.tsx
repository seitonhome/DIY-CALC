"use client";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      import("@sentry/nextjs").then((Sentry) => Sentry.captureException(error));
    }
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#F5F0EA",
            fontFamily: "system-ui, sans-serif",
            padding: 24,
          }}
        >
          <div
            style={{
              maxWidth: 420,
              textAlign: "center",
              background: "white",
              borderRadius: 20,
              border: "1px solid #EDE8E1",
              padding: "40px 32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ fontSize: 20, fontWeight: 800, color: "#2C2C2C", margin: "0 0 8px" }}>
              Algo salió mal / Something went wrong
            </h1>
            <p style={{ fontSize: 13, color: "#9E998F", margin: "0 0 24px", lineHeight: 1.6 }}>
              Ocurrió un error inesperado. Intenta de nuevo o contáctanos si persiste.
              <br />
              An unexpected error occurred. Try again, or contact us if it persists.
            </p>
            <button
              onClick={() => reset()}
              style={{
                padding: "12px 24px",
                background: "#C9A347",
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reintentar / Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
