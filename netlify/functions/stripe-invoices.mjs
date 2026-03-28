/* ─── /api/stripe-invoices — Fetch customer invoices from Stripe ────────── */

import stripe from "stripe";

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
    const invoices = await stripeClient.invoices.list({
      customer: customerId,
      limit: 24,
    });

    const mapped = invoices.data.map((inv) => ({
      id: inv.id,
      date: new Date(inv.created * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      amount: "$" + (inv.amount_paid / 100).toFixed(2),
      desc: inv.lines.data[0]?.description || "GlossIO Pro",
      invoice: inv.number || inv.id.slice(-8).toUpperCase(),
      status: inv.amount_paid === 0 ? "Trial" : (inv.status === "paid" ? "Paid" : inv.status),
      url: inv.hosted_invoice_url || null,
    }));

    return { statusCode: 200, headers, body: JSON.stringify({ invoices: mapped }) };
  } catch (err) {
    console.error("stripe-invoices error:", err);
    return {
      statusCode: err.statusCode || 500,
      headers,
      body: JSON.stringify({ error: "Failed to load invoices" }),
    };
  }
};
