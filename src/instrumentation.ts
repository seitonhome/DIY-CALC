// Server & edge-runtime error monitoring. Fully optional: does nothing
// unless NEXT_PUBLIC_SENTRY_DSN is set (see .env.local.example). Safe to
// deploy without it — this just returns early and Sentry.init() never runs.
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  const enabled = process.env.NODE_ENV === "production";

  if (process.env.NEXT_RUNTIME === "nodejs") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn, tracesSampleRate: 0.1, enabled });
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    const Sentry = await import("@sentry/nextjs");
    Sentry.init({ dsn, tracesSampleRate: 0.1, enabled });
  }
}
