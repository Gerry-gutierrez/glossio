/* ─── /api/public-profile — Get public profile data by slug ───────────────── */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  /* Slug comes as query param: /api/public-profile?slug=carlos-detail-co */
  const slug = event.queryStringParameters && event.queryStringParameters.slug;
  if (!slug) {
    return { statusCode: 400, body: JSON.stringify({ error: "Slug required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* Get profile */
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, company_name, slug, tagline, bio, instagram_handle, location, avatar_url, is_pro")
      .eq("slug", slug)
      .single();

    if (profileError || !profile) {
      return { statusCode: 404, body: JSON.stringify({ error: "Profile not found" }) };
    }

    /* Get active services */
    const { data: services } = await supabase
      .from("services")
      .select("id, name, description, price, icon, color")
      .eq("profile_id", profile.id)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    /* Get work photos */
    const { data: photos } = await supabase
      .from("work_photos")
      .select("id, url, sort_order")
      .eq("profile_id", profile.id)
      .order("sort_order", { ascending: true });

    /* Get business hours */
    const { data: hours } = await supabase
      .from("business_hours")
      .select("day_of_week, is_open, open_time, close_time")
      .eq("profile_id", profile.id)
      .order("day_of_week");

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
      body: JSON.stringify({
        profile: profile,
        services: services || [],
        photos: photos || [],
        hours: hours || [],
      }),
    };
  } catch (err) {
    console.error("public-profile error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to load profile" }),
    };
  }
};
