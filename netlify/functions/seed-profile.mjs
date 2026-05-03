/* ─── /api/seed-profile — Seed defaults after signup ──────────────────────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { userId, companyName, phone, phoneVerified } = body;
  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: "userId required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* Update profile with company name and phone */
    const slug = (companyName || "business")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+$/, "");

    const updates = {
      company_name: companyName || "",
      phone: phone || "",
      slug: slug,
    };

    /* If the phone was verified via Twilio Verify during signup, stamp it.
     * Existing users (created before this column existed) keep NULL — no gating. */
    if (phoneVerified === true) {
      updates.phone_verified_at = new Date().toISOString();
    }

    /* CRITICAL: check for errors. The Supabase JS client returns { data, error }
     * on every call — if we ignore `error` we silently drop signup data.
     * Bug fixed 2026-05-03 after Gerries Auto Spa account was created with
     * NULL phone/company_name because migration 006 hadn't been run yet. */
    const { error: updateErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (updateErr) {
      console.error("seed-profile update error:", updateErr);
      /* Try once more without phone_verified_at, in case that column is the
       * problem — graceful degradation if a migration is pending. */
      if (updates.phone_verified_at) {
        delete updates.phone_verified_at;
        const { error: retryErr } = await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId);
        if (retryErr) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to save profile data: " + retryErr.message, code: retryErr.code }),
          };
        }
        /* Retry succeeded — log so we know to run the migration */
        console.warn("seed-profile: phone_verified_at column missing. Run migration 006.");
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to save profile data: " + updateErr.message, code: updateErr.code }),
        };
      }
    }

    /* Seed business hours, notification settings, availability settings */
    const { error: rpcErr } = await supabase.rpc("seed_profile_defaults", { profile_uuid: userId });
    if (rpcErr) {
      console.error("seed-profile RPC error:", rpcErr);
      /* Non-fatal — profile is saved, defaults can be re-seeded later */
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, slug: slug }),
    };
  } catch (err) {
    console.error("seed-profile error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Seeding failed: " + (err.message || "unknown") }),
    };
  }
};
