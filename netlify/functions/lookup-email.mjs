/* ─── /api/lookup-email — Find email by phone number ──────────────────────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
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
    /* Strip phone to digits for comparison — DB may store formatted numbers */
    const digits = phone.replace(/\D/g, "");
    const variants = [
      phone,                          /* as-is (e.g. +12398229268) */
      digits,                         /* just digits (12398229268) */
      digits.slice(-10),              /* last 10 digits (2398229268) */
      "(" + digits.slice(-10,-7) + ") " + digits.slice(-7,-4) + "-" + digits.slice(-4), /* (239) 822-9268 */
      "+1" + digits.slice(-10),       /* +1 prefix */
    ];

    const { data } = await supabase
      .from("profiles")
      .select("email")
      .in("phone", variants)
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
