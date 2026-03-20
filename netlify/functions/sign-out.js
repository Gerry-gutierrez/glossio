/* ─── /api/sign-out — Server-side sign out ────────────────────────────────── */

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  /* Client-side Supabase handles sign out directly.
     This endpoint exists as a fallback for clearing server-side session state
     or for redirect-based sign out flows. */

  return {
    statusCode: 200,
    headers: {
      "Set-Cookie": "sb-access-token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    },
    body: JSON.stringify({ success: true, redirectTo: "/" }),
  };
};
