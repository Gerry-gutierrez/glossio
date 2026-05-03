/* ─── /api/admin-delete-user — Admin: permanently delete a user ─────────── */
/*
 * POST { userId, pass }
 * 1. Verifies admin password
 * 2. Looks up the user's Stripe subscription, cancels immediately if active
 * 3. Deletes auth.users row → ON DELETE CASCADE wipes profile + services +
 *    work_photos + clients + appointments + availability + business_hours +
 *    notification_settings + availability_settings (per migration 001)
 * 4. Returns { ok: true } on success
 *
 * SAFETY: If Stripe cancellation fails, the user is NOT deleted. Prevents
 * orphaned subscriptions that keep billing forever.
 */

import { createClient } from "@supabase/supabase-js";
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

  let body;
  try { body = JSON.parse(event.body || "{}"); } catch (_) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid request body" }) };
  }

  const { userId, pass } = body;
  if (!userId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "userId required" }) };
  }

  /* ── Admin password check ── */
  const ADMIN_PASS = (process.env.ADMIN_SECRET_KEY || "").trim();
  if (!ADMIN_PASS || (pass || "").trim() !== ADMIN_PASS) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    /* ── 1. Look up the profile to grab Stripe IDs and a friendly label ── */
    const { data: profile, error: lookupErr } = await supabase
      .from("profiles")
      .select("id, email, company_name, stripe_customer_id, stripe_subscription_id, subscription_status")
      .eq("id", userId)
      .maybeSingle();

    if (lookupErr) {
      console.error("admin-delete-user lookup error:", lookupErr);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Could not look up user" }) };
    }

    /* If profile is gone but auth user might still exist, try to nuke the auth row anyway */
    const label = profile ? (profile.company_name || profile.email || userId) : userId;

    /* ── 2. Cancel Stripe subscription if active ── */
    if (profile && profile.stripe_subscription_id && profile.subscription_status !== "canceled") {
      const stripeSecret = process.env.STRIPE_SECRET_KEY;
      if (!stripeSecret) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: "Stripe not configured — cannot safely delete a paying user" }) };
      }
      try {
        const stripeClient = stripe(stripeSecret);
        /* Cancel IMMEDIATELY (not at period end) — user is being deleted, no access to preserve */
        await stripeClient.subscriptions.cancel(profile.stripe_subscription_id);
      } catch (stripeErr) {
        /* Subscription might already be canceled or not exist — that's fine, keep going.
         * Any other error: bail out so we don't orphan an active subscription. */
        const msg = stripeErr && stripeErr.message ? stripeErr.message : "Stripe cancel failed";
        const isAlreadyGone = stripeErr && (stripeErr.code === "resource_missing" || /No such subscription/i.test(msg));
        if (!isAlreadyGone) {
          console.error("admin-delete-user stripe error:", stripeErr);
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: "Stripe cancellation failed. User NOT deleted to prevent orphan billing. " + msg }),
          };
        }
      }
    }

    /* ── 3. Delete the auth.users row → cascade wipes everything else ── */
    const { error: deleteErr } = await supabase.auth.admin.deleteUser(userId);
    if (deleteErr) {
      console.error("admin-delete-user auth delete error:", deleteErr);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Failed to delete user: " + (deleteErr.message || "unknown") }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ ok: true, deleted: label }),
    };
  } catch (err) {
    console.error("admin-delete-user fatal:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
