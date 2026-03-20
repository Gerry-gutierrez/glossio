// /api/stripe-checkout — Create Stripe Checkout session
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const { priceId, profileId, email, successUrl, cancelUrl } = await req.json();

  if (!priceId || !profileId) {
    return new Response(JSON.stringify({ error: "priceId and profileId required" }), { status: 400, headers: corsHeaders });
  }

  const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:8080";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    customer_email: email || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl || `${siteUrl}/dashboard/settings/?billing=success`,
    cancel_url: cancelUrl || `${siteUrl}/dashboard/settings/?billing=cancelled`,
    metadata: { profile_id: profileId },
    subscription_data: { trial_period_days: 14, metadata: { profile_id: profileId } },
  });

  return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), { headers: corsHeaders });
});
