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

    await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    /* Seed business hours, notification settings, availability settings */
    await supabase.rpc("seed_profile_defaults", { profile_uuid: userId });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, slug: slug }),
    };
  } catch (err) {
    console.error("seed-profile error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Seeding failed" }),
    };
  }
};
