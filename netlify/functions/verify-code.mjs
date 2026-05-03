/* ─── /api/verify-code — Verify OTP via Twilio Verify ──────────────────── */
/*
 * Uses Twilio Verify API to check the code. Twilio stores and validates
 * the code on their side — no Supabase verification_codes lookup needed.
 *
 * Returns { success: true, verified: true } on a valid code.
 */

import twilio from "twilio";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { phone, code } = body;
  if (!phone || !code) {
    return { statusCode: 400, body: JSON.stringify({ error: "Phone and code required" }) };
  }

  /* Normalize to E.164 — must match exactly what was sent to */
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

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (!accountSid || !authToken || !verifyServiceSid) {
    return { statusCode: 500, body: JSON.stringify({ error: "Twilio Verify not configured" }) };
  }

  try {
    const client = twilio(accountSid, authToken);
    const check = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({ to: e164, code: String(code) });

    if (check.status === "approved") {
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, verified: true }),
      };
    }

    /* status === "pending" means wrong code; "canceled" means expired */
    const msg = check.status === "canceled"
      ? "Code expired. Please request a new one."
      : "Invalid code. Double-check and try again.";
    return {
      statusCode: 400,
      body: JSON.stringify({ error: msg, status: check.status }),
    };
  } catch (err) {
    console.error("verify-code (Twilio Verify) error:", err);
    /* Twilio error codes:
     *   60200 = invalid parameter
     *   60202 = max check attempts reached
     *   20404 = verification not found (likely expired or never sent)
     */
    const code = err && err.code;
    let msg = "Verification failed. Please try again.";
    let status = err.status || 500;
    if (code === 60200) { msg = "Invalid code format."; status = 400; }
    else if (code === 60202) { msg = "Too many wrong attempts. Request a new code."; status = 400; }
    else if (code === 20404) { msg = "Code expired or not found. Request a new one."; status = 400; }

    return {
      statusCode: status,
      body: JSON.stringify({ error: msg }),
    };
  }
};
