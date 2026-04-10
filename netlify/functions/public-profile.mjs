/* ─── /api/public-profile — Get public profile data by slug ───────────────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
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
    /* Get profile by slug */
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, company_name, slug, tagline, bio, instagram_handle, location, avatar_url, is_pro, products_enabled")
      .eq("slug", slug)
      .single();

    /* Fallback: if slug column is empty, match by derived slug from company_name */
    if (profileError || !profile) {
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, company_name, slug, tagline, bio, instagram_handle, location, avatar_url, is_pro, products_enabled");

      if (allProfiles) {
        profile = allProfiles.find(function(p) {
          var derived = (p.company_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
          return derived === slug;
        });

        /* Persist the slug so future lookups are direct */
        if (profile && !profile.slug) {
          await supabase.from("profiles").update({ slug: slug }).eq("id", profile.id);
          profile.slug = slug;
        }
      }
    }

    if (!profile) {
      return { statusCode: 404, body: JSON.stringify({ error: "Profile not found" }) };
    }

    /* Get active services (is_active may be NULL for older services, treat as active) */
    const { data: services } = await supabase
      .from("services")
      .select("id, name, description, price, icon, color, pricing_type, duration_minutes")
      .eq("profile_id", profile.id)
      .neq("is_active", false)
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

    /* Get availability blocks (vacation / date blocks) */
    const today = new Date().toISOString().split("T")[0];
    const { data: blocks } = await supabase
      .from("availability_blocks")
      .select("start_date, end_date, reason")
      .eq("profile_id", profile.id)
      .gte("end_date", today)
      .order("start_date");

    /* Get availability settings (advance booking window, min notice, time blocks) */
    const { data: availSettings } = await supabase
      .from("availability_settings")
      .select("advance_booking_days, minimum_notice_hours, time_blocks_enabled")
      .eq("profile_id", profile.id)
      .single();

    /* Get future appointments for time blocking (only if enabled) */
    let bookedSlots = [];
    if (availSettings && availSettings.time_blocks_enabled) {
      const { data: appts } = await supabase
        .from("appointments")
        .select("appt_date, appt_time, scheduled_time, service_name, service_id")
        .eq("profile_id", profile.id)
        .in("status", ["pending", "confirmed"])
        .gte("appt_date", today);
      if (appts) {
        bookedSlots = appts.map(a => ({
          date: a.appt_date,
          time: a.scheduled_time || a.appt_time,
          service_id: a.service_id,
          service_name: a.service_name,
        }));
      }
    }

    /* Get products if enabled */
    let productsList = [];
    if (profile.products_enabled) {
      const { data: prods } = await supabase
        .from("products")
        .select("id, name, description, price, image_url")
        .eq("profile_id", profile.id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      productsList = prods || [];
    }

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
        blocks: blocks || [],
        availability: availSettings || { advance_booking_days: 30, minimum_notice_hours: 24, time_blocks_enabled: false },
        bookedSlots: bookedSlots,
        products: productsList,
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
