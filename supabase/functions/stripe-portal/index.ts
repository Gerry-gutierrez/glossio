// /api/stripe-portal — Create Stripe Billing Portal session
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const { customerId } = await req.json();

  if (!customerId) return new Response(JSON.stringify({ error: "customerId required" }), { status: 400, headers: corsHeaders });

  const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:8080";

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${siteUrl}/dashboard/settings/`,
  });

  return new Response(JSON.stringify({ url: session.url }), { headers: corsHeaders });
});
