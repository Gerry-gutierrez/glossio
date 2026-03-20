/* ─── /api/lookup-email — Find email by phone number ──────────────────────── */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { phone } = body;
  if (!phone) {
    return { statusCode: 400, body: JSON.stringify({ error: "Phone required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data } = await supabase
      .from("profiles")
      .select("email")
      .eq("phone", phone)
      .limit(1)
      .single();

    if (!data) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No account found with that phone number" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ email: data.email }),
    };
  } catch (err) {
    console.error("lookup-email error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Lookup failed" }),
    };
  }
};
