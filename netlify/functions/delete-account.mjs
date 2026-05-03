/* ─── /api/delete-account — User-initiated account deletion ──────────────── */
/*
 * POST { accessToken, confirmation }
 *
 * The user must be authenticated. We verify their JWT against Supabase, then
 * follow the same cascade-delete path as admin-delete-user.
 *
 * `confirmation` must equal "DELETE" (the string the user typed). This is a
 * defense-in-depth check — the frontend already gates the button, but we
 * never trust the frontend.
 *
 * 1. Verify access token → get userId (the user can ONLY delete themselves)
 * 2. Cancel Stripe subscription if active
 * 3. Delete auth.users → cascade wipes profile + all related rows
 */

import { createClient } from "@supabase/supabase-js";
import stripe from "stripe";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { accessToken, confirmation } = body;

  if (!accessToken) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Not signed in" }) };
  }

  /* Defense in depth: server-side confirmation check */
  if ((confirmation || "").trim() !== "DELETE") {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Confirmation text must be DELETE" }) };
  }

  /* ── 1. Verify the JWT and get the user ID ── */
  /* Use the anon key + the user's token to ensure the token is valid for THIS project */
  const userClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: "Bearer " + accessToken } } }
  );

  const { data: userData, error: userErr } = await userClient.auth.getUser(accessToken);
  if (userErr || !userData || !userData.user) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Invalid or expired session" }) };
  }
  const userId = userData.user.id;

  /* ── 2. Use service role for the actual destructive ops ── */
  const adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: profile, error: lookupErr } = await adminClient
      .from("profiles")
      .select("id, stripe_subscription_id, subscription_status")
      .eq("id", userId)
      .maybeSingle();

    if (lookupErr) {
      console.error("delete-account lookup error:", lookupErr);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not look up your account" }) };
    }

    /* ── Cancel Stripe subscription if active ── */
    if (profile && profile.stripe_subscription_id && profile.subscription_status !== "canceled") {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not cancel your subscription. Please contact support." }) };
      }
      try {
        const stripeClient = stripe(stripeSecret);
        await stripeClient.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeErr) {
        const msg = stripeErr && stripeErr.message ? stripeErr.message : "";
        const isAlreadyGone = stripeErr && (stripeErr.code === "resource_missing" || /No such subscription/i.test(msg));
        if (!isAlreadyGone) {
          console.error("delete-account stripe error:", stripeErr);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "We could not cancel your subscription. Your account was NOT deleted. Please email support@glossio.app." }),
          };
        }
      }
    }

    /* ── Delete auth.users → cascade wipes everything ── */
    const { error: deleteErr } = await adminClient.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("delete-account auth delete error:", deleteErr);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to delete your account. Please email support@glossio.app." }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("delete-account fatal:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
