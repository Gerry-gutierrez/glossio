/* ─── /api/send-booking-notification — SMS notify detailer of new booking ─── */

const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { profileId, clientName, serviceName, date, time } = JSON.parse(event.body || "{}");
  if (!profileId) {
    return { statusCode: 400, body: JSON.stringify({ error: "profileId required" }) };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { statusCode: 500, body: JSON.stringify({ error: "Twilio not configured" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* Get detailer's phone and notification prefs */
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone, company_name")
      .eq("id", profileId)
      .single();

    const { data: notifSettings } = await supabase
      .from("notification_settings")
      .select("booking_alerts_enabled, booking_alerts_channel")
      .eq("profile_id", profileId)
      .single();

    if (!profile || !profile.phone) {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: "No phone number" }) };
    }

    if (notifSettings && !notifSettings.booking_alerts_enabled) {
      return { statusCode: 200, body: JSON.stringify({ skipped: true, reason: "Alerts disabled" }) };
    }

    const shouldSms = !notifSettings || notifSettings.booking_alerts_channel !== "email";

    if (shouldSms) {
      const client = twilio(accountSid, authToken);
      await client.messages.create({
        body: `📋 New booking!\n\nClient: ${clientName || "Unknown"}\nService: ${serviceName || "N/A"}\nDate: ${date || "TBD"} at ${time || "TBD"}\n\nLog in to GlossIO to confirm.`,
        from: fromNumber,
        to: profile.phone,
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, sent: shouldSms }),
    };
  } catch (err) {
    console.error("send-booking-notification error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Notification failed" }),
    };
  }
};
