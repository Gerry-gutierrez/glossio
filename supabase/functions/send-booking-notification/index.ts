// /api/send-booking-notification — SMS notify detailer of new booking
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { profileId, clientName, serviceName, date, time } = await req.json();
  if (!profileId) return new Response(JSON.stringify({ error: "profileId required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  const { data: profile } = await supabase.from("profiles").select("phone, company_name").eq("id", profileId).single();
  const { data: notif } = await supabase.from("notification_settings").select("booking_alerts_enabled, booking_alerts_channel").eq("profile_id", profileId).single();

  if (!profile?.phone) return new Response(JSON.stringify({ skipped: true, reason: "No phone" }), { headers: corsHeaders });
  if (notif && !notif.booking_alerts_enabled) return new Response(JSON.stringify({ skipped: true, reason: "Disabled" }), { headers: corsHeaders });

  const shouldSms = !notif || notif.booking_alerts_channel !== "email";
  if (shouldSms) {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
      },
      body: new URLSearchParams({
        To: profile.phone,
        From: fromNumber,
        Body: `New booking!\nClient: ${clientName || "Unknown"}\nService: ${serviceName || "N/A"}\nDate: ${date || "TBD"} at ${time || "TBD"}\n\nLog in to GlossIO to confirm.`,
      }),
    });
  }

  return new Response(JSON.stringify({ success: true, sent: shouldSms }), { headers: corsHeaders });
});
