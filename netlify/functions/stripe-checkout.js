/* ─── /api/stripe-checkout — Create Stripe Checkout session ───────────────── */

const stripe = require("stripe");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    return { statusCode: 500, body: JSON.stringify({ error: "Stripe not configured" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body" }) };
  }
  const { priceId, profileId, email, successUrl, cancelUrl } = body;
  if (!priceId || !profileId) {
    return { statusCode: 400, body: JSON.stringify({ error: "priceId and profileId required" }) };
  }

  const stripeClient = stripe(stripeSecret);

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email || undefined,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.URL || "http://localhost:8080"}/dashboard/settings/?billing=success`,
      cancel_url: cancelUrl || `${process.env.URL || "http://localhost:8080"}/dashboard/settings/?billing=cancelled`,
      metadata: { profile_id: profileId },
      subscription_data: {
        trial_period_days: 14,
        metadata: { profile_id: profileId },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id, url: session.url }),
    };
  } catch (err) {
    console.error("stripe-checkout error:", err);
    const msg = err.type === "StripeCardError" ? err.message
      : "Failed to create checkout session. Please try again.";
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: msg }),
    };
  }
};
