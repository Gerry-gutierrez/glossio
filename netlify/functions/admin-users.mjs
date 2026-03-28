/* ─── /api/admin-users — Admin auth + user list ──────────────────────────── */

import { createClient } from "@supabase/supabase-js";

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "GET") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const params = event.queryStringParameters || {};
  const pass = params.pass || "";

  /* ── Password check ── */
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || "";
  if (!ADMIN_PASS || pass !== ADMIN_PASS) {
    /* If action=auth, return ok/fail for the login gate */
    if (params.action === "auth") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: false }),
      };
    }
    return { statusCode: 401, headers, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  /* Auth-only check (login gate) */
  if (params.action === "auth") {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  /* ── Fetch users from profiles ── */
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: users, error } = await supabase
      .from("profiles")
      .select("id, company_name, email, slug, created_at, is_pro")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return { statusCode: 500, headers, body: JSON.stringify({ error: "Database error" }) };
    }

    /* Map to the shape the admin dashboard expects */
    const mapped = (users || []).map((u) => ({
      id: u.id,
      company_name: u.company_name || "",
      email: u.email || "",
      slug: u.slug || "",
      created_at: u.created_at,
      status: u.is_pro ? "active" : "paused",
      plan: u.is_pro ? "Monthly" : "Free Trial",
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ users: mapped }),
    };
  } catch (err) {
    console.error("Admin users error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: "Server error" }) };
  }
};
