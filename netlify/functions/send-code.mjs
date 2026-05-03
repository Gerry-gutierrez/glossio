/* ─── /api/send-code — Send OTP via Twilio Verify ─────────────────────── */
/*
 * Uses Twilio Verify API (NOT raw SMS).
 *
 * Why:
 *   - Twilio Verify uses A2P-exempt short codes/shared shortcodes for OTP
 *   - No A2P 10DLC registration required (we're still waiting on Sunbiz)
 *   - Twilio handles the code generation, expiry, and storage on their side
 *   - More reliable than raw SMS from a 10DLC number
 *
 * Requires env vars:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_VERIFY_SERVICE_SID  ← the Verify Service in Twilio Console
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (for rate limiting only)
 */

import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

/** Persistent rate limit via Supabase. Returns true if allowed. */
async function checkRateLimit(supabase, key, maxCount, windowSeconds) {
  const { data: existing } = await supabase
    .from("rate_limits")
    .select("id, count, window_start, window_seconds")
    .eq("key", key)
    .single();

  const now = new Date();

  if (existing) {
    const windowEnd = new Date(new Date(existing.window_start).getTime() + existing.window_seconds * 1000);
    if (now > windowEnd) {
      await supabase.from("rate_limits").update({ count: 1, window_start: now.toISOString(), window_seconds: windowSeconds }).eq("id", existing.id);
      return true;
    }
    if (existing.count >= maxCount) return false;
    await supabase.from("rate_limits").update({ count: existing.count + 1 }).eq("id", existing.id);
    return true;
  }

  await supabase.from("rate_limits").upsert({ key, count: 1, window_start: now.toISOString(), window_seconds: windowSeconds }, { onConflict: "key" });
  return true;
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { phone, type } = body;
  if (!phone) {
    return { statusCode: 400, body: JSON.stringify({ error: "Phone number required" }) };
  }

  /* Normalize to E.164 — Twilio Verify is strict about format */
  const digits = String(phone).replace(/\D/g, "");
  let e164;
  if (String(phone).startsWith("+")) {
    e164 = "+" + digits;
  } else if (digits.length === 10) {
    e164 = "+1" + digits;
  } else if (digits.length === 11 && digits.startsWith("1")) {
    e164 = "+" + digits;
  } else {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid phone number format" }) };
  }

  /* ── Rate limit: max 3 OTP requests per phone per 10 min ── */
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const allowed = await checkRateLimit(supabase, `otp:${e164}`, 3, 600);
  if (!allowed) {
    return { statusCode: 429, body: JSON.stringify({ error: "Too many code requests. Please wait a few minutes." }) };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    return { statusCode: 500, body: JSON.stringify({ error: "Twilio Verify not configured. Missing TWILIO_VERIFY_SERVICE_SID." }) };
  }

  try {
    const client = twilio(accountSid, authToken);
    /* Twilio Verify generates the code, sends the SMS, and stores it on their side.
     * No A2P 10DLC registration needed — Verify uses dedicated OTP infrastructure. */
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({ to: e164, channel: "sms" });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Code sent",
        status: verification.status, // typically "pending"
      }),
    };
  } catch (err) {
    console.error("send-code (Twilio Verify) error:", err);
    /* Twilio error codes:
     *   60200 = Invalid parameter (often bad phone format)
     *   60203 = Max send attempts reached for this phone
     *   60205 = SMS not supported by carrier
     *   60212 = Too many concurrent requests
     *   20429 = Too many requests
     */
    const code = err && err.code;
    let msg = "Failed to send verification code. Please try again.";
    if (code === 60200) msg = "Invalid phone number format.";
    else if (code === 60203) msg = "Too many verification attempts. Wait a few minutes and try again.";
    else if (code === 60205) msg = "SMS verification isn't supported by your carrier.";
    else if (code === 60212 || code === 20429) msg = "Too many requests. Please wait a moment.";

    return {
      statusCode: err.status || 500,
      body: JSON.stringify({ error: msg }),
    };
  }
};
