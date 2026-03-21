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
    const last10 = digits.slice(-10);
    const variants = [
      phone,                                                                        /* as-is */
      digits,                                                                       /* just digits */
      last10,                                                                       /* last 10 digits */
      "(" + last10.slice(0,3) + ") " + last10.slice(3,6) + "-" + last10.slice(6),  /* (239) 822-9268 */
      "+1" + last10,                                                                /* +1 prefix */
      "1" + last10,                                                                 /* 1 prefix */
      last10.slice(0,3) + "-" + last10.slice(3,6) + "-" + last10.slice(6),         /* 239-822-9268 */
    ];

    console.log("lookup-email: searching for phone variants:", variants);

    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .in("phone", variants)
      .limit(1);

    console.log("lookup-email: query result:", { data, error });

    if (error) {
      console.error("lookup-email supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Lookup failed" }),
      };
    }

    if (!data || data.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No account found with that phone number" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ email: data[0].email }),
    };
  } catch (err) {
    console.error("lookup-email error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Lookup failed" }),
    };
  }
};
