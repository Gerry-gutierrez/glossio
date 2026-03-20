/* ─── /api/webhooks/stripe — Stripe webhook handler ───────────────────────── */

import { createClient } from "@supabase/supabase-js";
import stripe from "stripe";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecret || !webhookSecret) {
    return { statusCode: 500, body: "Stripe not configured" };
  }

  const stripeClient = stripe(stripeSecret);
  let stripeEvent;

  try {
    stripeEvent = stripeClient.webhooks.constructEvent(
      event.body,
      event.headers["stripe-signature"],
      webhookSecret
    );
  } catch (err) {
    console.error("Stripe signature verification failed:", err.message);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    switch (stripeEvent.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = stripeEvent.data.object;
        await supabase
          .from("profiles")
          .update({
            subscription_status: sub.status === "active" ? "active" : sub.status,
            stripe_subscription_id: sub.id,
            is_pro: sub.status === "active",
          })
          .eq("stripe_customer_id", sub.customer);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object;
        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            is_pro: false,
          })
          .eq("stripe_customer_id", sub.customer);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = stripeEvent.data.object;
        await supabase
          .from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("stripe_customer_id", invoice.customer);
        break;
      }

      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        /* Link Stripe customer to profile if not already linked */
        if (session.metadata && session.metadata.profile_id) {
          await supabase
            .from("profiles")
            .update({
              stripe_customer_id: session.customer,
            })
            .eq("id", session.metadata.profile_id);
        }
        break;
      }

      default:
        /* Unhandled event type */
        break;
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("Stripe webhook processing error:", err);
    return { statusCode: 500, body: "Webhook processing failed" };
  }
};
