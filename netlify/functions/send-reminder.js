/* ─── /api/send-reminder — Send 24hr appointment reminders ────────────────── */
/* Designed to be called by a scheduled Netlify Function or cron job          */

const twilio = require("twilio");
const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
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
    /* Find confirmed appointments scheduled for tomorrow */
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: appointments } = await supabase
      .from("appointments")
      .select(`
        id, scheduled_date, scheduled_time, price,
        client:clients(first_name, last_name, phone),
        service:services(name),
        profile:profiles!appointments_profile_id_fkey(phone, company_name)
      `)
      .eq("status", "confirmed")
      .eq("scheduled_date", tomorrowStr);

    if (!appointments || appointments.length === 0) {
      return { statusCode: 200, body: JSON.stringify({ sent: 0 }) };
    }

    const twilioClient = twilio(accountSid, authToken);
    let sentCount = 0;

    for (const appt of appointments) {
      /* Check if detailer has reminders enabled */
      const { data: notif } = await supabase
        .from("notification_settings")
        .select("reminder_24hr_enabled")
        .eq("profile_id", appt.profile_id)
        .single();

      if (notif && !notif.reminder_24hr_enabled) continue;

      /* Send reminder to detailer */
      if (appt.profile && appt.profile.phone) {
        const clientName = appt.client
          ? `${appt.client.first_name} ${appt.client.last_name}`.trim()
          : "Client";

        await twilioClient.messages.create({
          body: `⏰ Reminder: ${clientName} is booked for ${appt.service ? appt.service.name : "service"} tomorrow at ${appt.scheduled_time}.\n\n— GlossIO`,
          from: fromNumber,
          to: appt.profile.phone,
        });
        sentCount++;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ sent: sentCount }),
    };
  } catch (err) {
    console.error("send-reminder error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Reminder sending failed" }),
    };
  }
};
