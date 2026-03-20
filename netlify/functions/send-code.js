/* ─── /api/send-code — Send Twilio SMS OTP ────────────────────────────────── */

const twilio = require("twilio");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { phone, type } = JSON.parse(event.body || "{}");
  if (!phone) {
    return { statusCode: 400, body: JSON.stringify({ error: "Phone number required" }) };
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
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send code" }),
    };
  }
};
