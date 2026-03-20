/* ─── Sentry Error Monitoring ─────────────────────────────────────────────── */
/* Initialized only when SENTRY_DSN is configured via env.js                  */

(function() {
  "use strict";

  var dsn = window.__GLOSSIO_SENTRY_DSN || "";

  if (!dsn || !window.Sentry) return;

  window.Sentry.init({
    dsn: dsn,
    environment: window.location.hostname === "localhost" ? "development" : "production",
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    beforeSend: function(event) {
      /* Strip any PII from error reports */
      if (event.request && event.request.cookies) {
        delete event.request.cookies;
      }
      return event;
    }
  });

  /* Tag with user ID if logged in */
  if (window.sbAuth) {
    window.sbAuth.getUser().then(function(user) {
      if (user) {
        window.Sentry.setUser({ id: user.id, email: user.email });
      }
    });
  }
})();
