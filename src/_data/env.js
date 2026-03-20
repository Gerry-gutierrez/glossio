/* Expose environment variables to 11ty templates */
/* Load .env.local for local development */
try {
  require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env.local") });
} catch(e) {
  /* dotenv not installed — env vars must be set externally (e.g. hosting platform) */
}

module.exports = {
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  sentryDsn: process.env.SENTRY_DSN || "",
  siteUrl: process.env.URL || "http://localhost:8080"
};
