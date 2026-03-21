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
    slug, serviceId,
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
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id")
      .eq("slug", slug)
      .single();

    if (profileErr || !profile) {
      return { statusCode: 404, body: JSON.stringify({ error: "Detailer not found" }) };
    }

    /* ── Look up the service to get the price ── */
    const { data: service, error: svcErr } = await supabase
      .from("services")
      .select("id, name, price")
      .eq("id", serviceId)
      .eq("profile_id", profile.id)
      .single();

    if (svcErr || !service) {
      return { statusCode: 404, body: JSON.stringify({ error: "Service not found" }) };
    }

    /* ── Create or find client ── */
    /* Check if client already exists (by phone + profile_id) */
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("phone", phone)
      .single();

    let clientId;
    if (existingClient) {
      clientId = existingClient.id;
      /* Update client info in case it changed */
      await supabase.from("clients").update({
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        vehicle_year: vehicleYear || null,
        vehicle_make: vehicleMake || null,
        vehicle_model: vehicleModel || null,
        source: "booking_link"
      }).eq("id", clientId);
    } else {
      const { data: newClient, error: clientErr } = await supabase
        .from("clients")
        .insert({
          profile_id: profile.id,
          first_name: firstName,
          last_name: lastName,
          email: email || null,
          phone: phone,
          vehicle_year: vehicleYear || null,
          vehicle_make: vehicleMake || null,
          vehicle_model: vehicleModel || null,
          source: "booking_link",
          notes: notes || null
        })
        .select("id")
        .single();

      if (clientErr || !newClient) {
        console.error("Client create error:", clientErr);
        return { statusCode: 500, body: JSON.stringify({ error: "Failed to create client record" }) };
      }
      clientId = newClient.id;
    }

    /* ── Create the appointment ── */
    const { data: appointment, error: apptErr } = await supabase
      .from("appointments")
      .insert({
        profile_id: profile.id,
        client_id: clientId,
        service_id: serviceId,
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
      return { statusCode: 500, body: JSON.stringify({ error: "Failed to create appointment" }) };
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
