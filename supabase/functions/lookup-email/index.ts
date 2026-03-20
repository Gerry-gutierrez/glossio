// /api/lookup-email — Find email by phone number
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { phone } = await req.json();
  if (!phone) return new Response(JSON.stringify({ error: "Phone required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data } = await supabase
    .from("profiles")
    .select("email")
    .eq("phone", phone)
    .limit(1)
    .single();

  if (!data) return new Response(JSON.stringify({ error: "No account found" }), { status: 404, headers: corsHeaders });

  return new Response(JSON.stringify({ email: data.email }), { headers: corsHeaders });
});
