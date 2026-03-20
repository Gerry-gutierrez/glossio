// /api/public-profile — Get public profile data by slug
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  if (!slug) return new Response(JSON.stringify({ error: "Slug required" }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, company_name, slug, tagline, bio, instagram_handle, location, avatar_url, is_pro")
    .eq("slug", slug)
    .single();

  if (error || !profile) return new Response(JSON.stringify({ error: "Profile not found" }), { status: 404, headers: corsHeaders });

  const [{ data: services }, { data: photos }, { data: hours }] = await Promise.all([
    supabase.from("services").select("id, name, description, price, icon, color").eq("profile_id", profile.id).eq("is_active", true).order("sort_order"),
    supabase.from("work_photos").select("id, url, sort_order").eq("profile_id", profile.id).order("sort_order"),
    supabase.from("business_hours").select("day_of_week, is_open, open_time, close_time").eq("profile_id", profile.id).order("day_of_week"),
  ]);

  return new Response(JSON.stringify({ profile, services: services || [], photos: photos || [], hours: hours || [] }), {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
  });
});
