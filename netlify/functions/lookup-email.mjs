/* ─── /api/lookup-email — Find email by phone number ──────────────────── */
/*
 * Used during phone-based sign-in: user types phone + password, we look up
 * the email associated with that phone, then sign them in via email.
 *
 * Uses the find_email_by_phone() Postgres function (migration 007), which
 * compares the LAST 10 DIGITS of both sides — format-agnostic. So any of
 * these stored formats match any of these input formats:
 *   stored "+12397842377", input "(239) 784-2377" → match
 *   stored "(239) 784-2377", input "2397842377"   → match
 *   stored "239-784-2377", input "+1 239 784 2377" → match
 *
 * Falls back to the legacy variant-list match if the RPC isn't deployed
 * yet (e.g. before migration 007 has run in Supabase).
 */

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

  /* Pull the last 10 digits from whatever the user typed.
   * If they typed a non-US country code, this still works for now since
   * GlossIO is US-only. Revisit when international rollout happens. */
  const allDigits = String(phone).replace(/\D/g, "");
  const last10 = allDigits.slice(-10);

  if (last10.length !== 10) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Please enter a valid 10-digit phone number" }),
    };
  }

  try {
    /* Primary path: bulletproof RPC that strips non-digits on both sides */
    const { data: rpcData, error: rpcError } = await supabase.rpc("find_email_by_phone", { input_phone: phone });

    if (!rpcError && rpcData) {
      return { statusCode: 200, body: JSON.stringify({ email: rpcData }) };
    }

    /* If the RPC isn't installed yet (migration 007 not run), fall back to
     * the legacy variant approach so login still works during deploy.
     * Once migration 007 is live this branch should never run. */
    if (rpcError && /function .* does not exist/i.test(rpcError.message || "")) {
      console.warn("lookup-email: RPC missing, falling back to variant match. Run migration 007.");
      const variants = [
        phone,
        allDigits,
        last10,
        "(" + last10.slice(0,3) + ") " + last10.slice(3,6) + "-" + last10.slice(6),
        "+1" + last10,
        "1" + last10,
        last10.slice(0,3) + "-" + last10.slice(3,6) + "-" + last10.slice(6),
      ];
      const { data, error } = await supabase
        .from("profiles")
        .select("email")
        .in("phone", variants)
        .limit(1);
      if (error) {
        console.error("lookup-email fallback supabase error:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Lookup failed" }) };
      }
      if (data && data.length > 0 && data[0].email) {
        return { statusCode: 200, body: JSON.stringify({ email: data[0].email }) };
      }
    } else if (rpcError) {
      console.error("lookup-email RPC error:", rpcError);
      return { statusCode: 500, body: JSON.stringify({ error: "Lookup failed" }) };
    }

    /* No match in either path */
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Couldn't find that phone number. Try signing in with your email instead." }),
    };
  } catch (err) {
    console.error("lookup-email fatal:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Lookup failed" }) };
  }
};
