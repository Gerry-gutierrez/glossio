/* ─── /api/stripe-portal — Create Stripe Billing Portal session ───────────── */

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
  const { customerId } = body;
  if (!customerId) {
    return { statusCode: 400, body: JSON.stringify({ error: "customerId required" }) };
  }

  const stripeClient = stripe(stripeSecret);

  try {
    const session = await stripeClient.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.URL || "http://localhost:8080"}/dashboard/settings/`,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error("stripe-portal error:", err);
    const msg = err.type === "StripeInvalidRequestError"
      ? "Billing account not found. Please contact support."
      : "Failed to open billing portal. Please try again.";
    return {
      statusCode: err.statusCode || 500,
      body: JSON.stringify({ error: msg }),
    };
  }
};
