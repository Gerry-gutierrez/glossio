/* ─── /api/send-code — Send Twilio SMS OTP ────────────────────────────────── */

const twilio = require("twilio");

exports.handler = async (event) => {
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

  /* ── Rate limit: max 3 OTP requests per phone per 10 minutes ── */
  const now = Date.now();
  if (!global._otpLimits) global._otpLimits = {};
  const rl = global._otpLimits[phone] || { count: 0, reset: now + 600000 };
  if (now > rl.reset) { rl.count = 0; rl.reset = now + 600000; }
  rl.count++;
  global._otpLimits[phone] = rl;
  if (rl.count > 3) {
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
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

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
