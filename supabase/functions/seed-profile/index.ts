// /api/seed-profile — Seed defaults after signup
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { userId, companyName, phone } = await req.json();
  if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const slug = (companyName || "business")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+$/, "");

  await supabase
    .from("profiles")
    .update({ company_name: companyName || "", phone: phone || "", slug })
    .eq("id", userId);

  await supabase.rpc("seed_profile_defaults", { profile_uuid: userId });

  return new Response(JSON.stringify({ success: true, slug }), { headers: corsHeaders });
});
