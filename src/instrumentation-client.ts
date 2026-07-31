// Client-side error monitoring. Fully optional: does nothing unless
// NEXT_PUBLIC_SENTRY_DSN is set (see .env.local.example). Safe to deploy
// without it — Sentry.init() is simply never called.
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Errors, not performance/session data, are the priority for a fresh setup.
    enabled: process.env.NODE_ENV === "production",
  });
}
