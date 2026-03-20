// /api/send-code — Send Twilio SMS OTP
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { phone, type } = await req.json();
  if (!phone) return new Response(JSON.stringify({ error: "Phone required" }), { status: 400, headers: corsHeaders });

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")!;
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")!;
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER")!;

  const code = String(Math.floor(100000 + Math.random() * 900000));

  // Send SMS via Twilio REST API
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const twilioRes = await fetch(twilioUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
    },
    body: new URLSearchParams({
      To: phone,
      From: fromNumber,
      Body: `Your GlossIO verification code is: ${code}. It expires in 10 minutes.`,
    }),
  });

  if (!twilioRes.ok) {
    const err = await twilioRes.text();
    return new Response(JSON.stringify({ error: "Failed to send SMS", detail: err }), { status: 500, headers: corsHeaders });
  }

  // Store code in DB
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  await supabase.from("verification_codes").insert({
    identifier: phone,
    code,
    type: type || "phone_signup",
  });

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
});
