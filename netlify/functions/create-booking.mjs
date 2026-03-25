/* ─── /api/create-booking — Public booking endpoint (no auth required) ────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const {
    slug, serviceId, serviceName, servicePrice,
    firstName, lastName, email, phone,
    vehicleYear, vehicleMake, vehicleModel,
    notes, scheduledDate, scheduledTime
  } = body;

  /* ── Validate required fields ── */
  if (!slug || !serviceId || !firstName || !lastName || !phone || !scheduledDate || !scheduledTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields: name, phone, service, date, and time are required." })
    };
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    /* ── Look up profile by slug ── */
    let { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, company_name")
      .eq("slug", slug)
      .single();

    /* Fallback: if slug column is empty, try matching by derived slug from company_name */
    if (profileErr || !profile) {
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, company_name, slug");

      if (allProfiles) {
        profile = allProfiles.find(function(p) {
          var derived = (p.company_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
          return derived === slug;
        });

        /* If found, persist the slug so future lookups are direct */
        if (profile && !profile.slug) {
          await supabase.from("profiles").update({ slug: slug }).eq("id", profile.id);
        }
      }
    }

    if (!profile) {
      return { statusCode: 404, body: JSON.stringify({ error: "Detailer not found", debug_slug: slug }) };
    }

    /* ── Look up the service to get the price ── */
    let service = null;
    const { data: svcData } = await supabase
      .from("services")
      .select("id, name, price")
      .eq("id", serviceId)
      .eq("profile_id", profile.id)
      .single();

    if (svcData) {
      service = svcData;
    } else if (serviceName) {
      /* Service exists in localStorage but not Supabase — sync it to DB first
         (appointments.service_id is NOT NULL with FK constraint) */
      const { data: newSvc, error: svcErr } = await supabase
        .from("services")
        .insert({
          profile_id: profile.id,
          name: serviceName,
          price: parseFloat(servicePrice) || 0,
          is_active: true
        })
        .select("id, name, price")
        .single();

      if (svcErr || !newSvc) {
        console.error("Service sync error:", svcErr);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to sync service" }) };
      }
      service = newSvc;
    } else {
      return { statusCode: 404, body: JSON.stringify({ error: "Service not found" }) };
    }

    /* ── Find existing client (if any) — don't create yet ── */
    /* Clients are only created when the detailer marks "Came Through" */
    let clientId = null;
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("phone", phone)
      .single();

    if (existingClient) {
      clientId = existingClient.id;
    }

    /* ── Create the appointment ── */
    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        profile_id: profile.id,
        client_id: clientId,
        service_id: service.id,
        detailer_username: profile.company_name || slug,
        client_first_name: firstName,
        client_last_name: lastName,
        client_email: email || null,
        client_phone: phone,
        vehicle_year: vehicleYear || null,
        vehicle_make: vehicleMake || null,
        vehicle_model: vehicleModel || null,
        service_name: serviceName || service.name,
        service_price: String(servicePrice || service.price || "0"),
        appt_date: scheduledDate,
        appt_time: scheduledTime,
        status: "pending",
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        notes: notes || null,
        price: service.price
      })
      .select("id")
      .single();

    if (apptErr || !appointment) {
      console.error("Appointment create error:", apptErr);
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create appointment: " + (apptErr ? apptErr.message || apptErr.details || apptErr.code || JSON.stringify(apptErr) : "no data returned") }) };
    }

    /* ── Send notification to detailer (fire and forget) ── */
    try {
      const notifUrl = `${process.env.SUPABASE_URL ? "" : ""}/.netlify/functions/send-booking-notification`;
      /* Call the notification function internally */
      const { data: prof } = await supabase
        .from("profiles").select("phone, company_name").eq("id", profile.id).single();
      const { data: notifSettings } = await supabase
        .from("notification_settings")
        .select("booking_alerts_enabled, booking_alerts_channel")
        .eq("profile_id", profile.id).single();

      if (prof && prof.phone && (!notifSettings || notifSettings.booking_alerts_enabled !== false)) {
        /* Import twilio dynamically to avoid failure if not configured */
        try {
          const twilio = (await import("twilio")).default;
          const accountSid = process.env.TWILIO_ACCOUNT_SID;
          const authToken = process.env.TWILIO_AUTH_TOKEN;
          const fromNumber = process.env.TWILIO_PHONE_NUMBER;
          if (accountSid && authToken && fromNumber) {
            const client = twilio(accountSid, authToken);
            await client.messages.create({
              body: `📋 New booking request!\n\nClient: ${firstName} ${lastName}\nService: ${service.name}\nDate: ${scheduledDate} at ${scheduledTime}\nPhone: ${phone}\n\nLog in to GlossIO to confirm.`,
              from: fromNumber,
              to: prof.phone,
            });
          }
        } catch (smsErr) {
          console.error("SMS notification failed:", smsErr);
        }
      }
    } catch (notifErr) {
      console.error("Notification lookup failed:", notifErr);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        appointmentId: appointment.id,
        message: "Booking request submitted! The detailer will contact you to confirm."
      })
    };
  } catch (err) {
    console.error("create-booking error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Something went wrong. Please try again." }) };
  }
};
