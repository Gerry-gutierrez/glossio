/* ─── /api/seed-profile — Seed defaults after signup ──────────────────────── */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { userId, companyName, phone } = JSON.parse(event.body || "{}");
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

    await supabase
      .from("profiles")
      .update({
        company_name: companyName || "",
        phone: phone || "",
        slug: slug,
      })
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
