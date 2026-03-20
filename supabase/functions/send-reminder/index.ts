// /api/send-reminder — Send 24hr appointment reminders
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (_req) => {
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: appointments } = await supabase
    .from("appointments")
    .select("id, scheduled_time, profile_id, client:clients(first_name, last_name), service:services(name)")
    .eq("status", "confirmed")
    .eq("scheduled_date", tomorrowStr);

  if (!appointments || appointments.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }));
  }

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;
  let sentCount = 0;

  for (const appt of appointments) {
    const { data: notif } = await supabase
      .from("notification_settings")
      .select("reminder_24hr_enabled")
      .eq("profile_id", appt.profile_id)
      .single();

    if (notif && !notif.reminder_24hr_enabled) continue;

    const { data: profile } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", appt.profile_id)
      .single();

    if (!profile?.phone) continue;

    const clientName = appt.client ? `${(appt.client as any).first_name} ${(appt.client as any).last_name}`.trim() : "Client";
    const serviceName = appt.service ? (appt.service as any).name : "service";

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({
        To: profile.phone,
        From: fromNumber,
        Body: `Reminder: ${clientName} is booked for ${serviceName} tomorrow at ${appt.scheduled_time}.\n\n— GlossIO`,
      }),
    });
    sentCount++;
  }

  return new Response(JSON.stringify({ sent: sentCount }));
});
