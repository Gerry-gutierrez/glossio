// /api/confirm-email — Admin confirm user email
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const { userId } = await req.json();
  if (!userId) return new Response(JSON.stringify({ error: "userId required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { error } = await supabase.auth.admin.updateUserById(userId, { email_confirm: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: corsHeaders });

  return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
});
