/* ─── /api/check-email — Check if email exists in auth ────────────────────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { email } = body;
  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Email required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* Check profiles table for existing email */
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .limit(1);

    return {
      statusCode: 200,
      body: JSON.stringify({ exists: data && data.length > 0 }),
    };
  } catch (err) {
    console.error("check-email error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Check failed" }),
    };
  }
};
