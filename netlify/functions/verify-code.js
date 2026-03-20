/* ─── /api/verify-code — Verify OTP ───────────────────────────────────────── */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { phone, code, type } = body;
  if (!phone || !code) {
    return { statusCode: 400, body: JSON.stringify({ error: "Phone and code required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* Find valid, unused code */
    const { data, error } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("identifier", phone)
      .eq("code", code)
      .eq("type", type || "phone_signup")
      .is("used_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or expired code" }),
      };
    }

    /* Mark as used */
    await supabase
      .from("verification_codes")
      .update({ used_at: new Date().toISOString() })
      .eq("id", data.id);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, verified: true }),
    };
  } catch (err) {
    console.error("verify-code error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Verification failed" }),
    };
  }
};
