/* ─── /api/send-code — Send Twilio SMS OTP ────────────────────────────────── */

import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

/** Check/increment rate limit in Supabase. Returns true if allowed, false if blocked. */
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
      /* Window expired — reset */
      await supabase.from("rate_limits").update({ count: 1, window_start: now.toISOString(), window_seconds: windowSeconds }).eq("id", existing.id);
      return true;
    }
    if (existing.count >= maxCount) return false;
    await supabase.from("rate_limits").update({ count: existing.count + 1 }).eq("id", existing.id);
    return true;
  }

  /* First request — create entry */
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

  /* ── Persistent rate limit: max 3 OTP requests per phone per 10 minutes ── */
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const allowed = await checkRateLimit(supabase, `otp:${phone}`, 3, 600);
  if (!allowed) {
    return { statusCode: 429, body: JSON.stringify({ error: "Too many code requests. Please wait a few minutes." }) };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { statusCode: 500, body: JSON.stringify({ error: "Twilio not configured" }) };
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));

  try {
    const client = twilio(accountSid, authToken);
    await client.messages.create({
      body: `Your GlossIO verification code is: ${code}. It expires in 10 minutes.`,
      from: fromNumber,
      to: phone,
    });

    /* Store code in Supabase */
    await supabase.from("verification_codes").insert({
      identifier: phone,
      code: code,
      type: type || "phone_signup",
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Code sent" }),
    };
  } catch (err) {
    console.error("send-code error:", err);
    const msg = err.code === 21211 ? "Invalid phone number format"
      : err.code === 21608 ? "SMS not supported for this number"
      : "Failed to send verification code. Please try again.";
    return {
      statusCode: err.status || 500,
      body: JSON.stringify({ error: msg }),
    };
  }
};
