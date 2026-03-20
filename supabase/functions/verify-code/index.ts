// /api/verify-code — Verify OTP
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { phone, code, type } = await req.json();
  if (!phone || !code) return new Response(JSON.stringify({ error: "Phone and code required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data, error } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("identifier", phone)
    .eq("code", code)
    .eq("type", type || "phone_signup")
    .is("used_at", null)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Invalid or expired code" }), { status: 400, headers: corsHeaders });
  }

  await supabase
    .from("verification_codes")
    .update({ used_at: new Date().toISOString() })
    .eq("id", data.id);

  return new Response(JSON.stringify({ success: true, verified: true }), { headers: corsHeaders });
});
