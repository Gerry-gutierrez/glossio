// /api/webhooks/stripe — Stripe webhook handler
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14?target=deno";

serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from("profiles").update({
        subscription_status: sub.status === "active" ? "active" : sub.status,
        stripe_subscription_id: sub.id,
        is_pro: sub.status === "active",
      }).eq("stripe_customer_id", sub.customer as string);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await supabase.from("profiles").update({
        subscription_status: "canceled",
        is_pro: false,
      }).eq("stripe_customer_id", sub.customer as string);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      await supabase.from("profiles").update({ subscription_status: "past_due" }).eq("stripe_customer_id", invoice.customer as string);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.metadata?.profile_id) {
        await supabase.from("profiles").update({ stripe_customer_id: session.customer as string }).eq("id", session.metadata.profile_id);
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
