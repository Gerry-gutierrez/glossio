/* ─── /api/stripe-cancel — Cancel Stripe subscription ──────────────────── */

import stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Stripe not configured" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { customerId } = body;
  if (!customerId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "customerId required" }) };
  }

  const stripeClient = stripe(stripeSecret);

  try {
    /* Find the customer's active subscription */
    const subs = await stripeClient.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 5,
    });

    const activeSub = subs.data.find(
      (s) => s.status === "active" || s.status === "trialing"
    );

    if (!activeSub) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "No active subscription found" }),
      };
    }

    /* Cancel at period end so user keeps access until billing cycle ends */
    const cancelled = await stripeClient.subscriptions.update(activeSub.id, {
      cancel_at_period_end: true,
    });

    /* Update Supabase profile */
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase
      .from("profiles")
      .update({ subscription_status: "canceled" })
      .eq("stripe_customer_id", customerId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        cancelAt: cancelled.current_period_end
          ? new Date(cancelled.current_period_end * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : null,
      }),
    };
  } catch (err) {
    console.error("stripe-cancel error:", err);
    return {
      statusCode: err.statusCode || 500,
      headers,
      body: JSON.stringify({ error: "Failed to cancel subscription. Please try again." }),
    };
  }
};
