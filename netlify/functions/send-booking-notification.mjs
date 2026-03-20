/* ─── /api/send-booking-notification — SMS notify detailer of new booking ─── */

import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { profileId, clientName, serviceName, date, time, clientEmail } = body;
  if (!profileId) {
    return { statusCode: 400, body: JSON.stringify({ error: "profileId required" }) };
  }

  /* ── Persistent rate limit: max 5 booking notifications per IP per hour ── */
  const clientIp = (event.headers["x-forwarded-for"] || event.headers["client-ip"] || "unknown").split(",")[0].trim();

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const rlAllowed = await (async () => {
    const key = `booking:${clientIp}`;
    const { data: existing } = await supabase
      .from("rate_limits").select("id, count, window_start, window_seconds").eq("key", key).single();
    const now = new Date();
    if (existing) {
      const windowEnd = new Date(new Date(existing.window_start).getTime() + existing.window_seconds * 1000);
      if (now > windowEnd) {
        await supabase.from("rate_limits").update({ count: 1, window_start: now.toISOString(), window_seconds: 3600 }).eq("id", existing.id);
        return true;
      }
      if (existing.count >= 5) return false;
      await supabase.from("rate_limits").update({ count: existing.count + 1 }).eq("id", existing.id);
      return true;
    }
    await supabase.from("rate_limits").upsert({ key, count: 1, window_start: now.toISOString(), window_seconds: 3600 }, { onConflict: "key" });
    return true;
  })();

  if (!rlAllowed) {
    return { statusCode: 429, body: JSON.stringify({ error: "Too many booking requests. Please try again later." }) };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { statusCode: 500, body: JSON.stringify({ error: "Twilio not configured" }) };
  }

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
    /* Don't fail the booking if notification fails — just log it */
    return {
      statusCode: 200,
      body: JSON.stringify({ success: false, warning: "Booking saved but notification failed to send" }),
    };
  }
};
