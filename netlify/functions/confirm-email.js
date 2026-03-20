/* ─── /api/confirm-email — Admin confirm user's email ─────────────────────── */

const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const { userId } = JSON.parse(event.body || "{}");
  if (!userId) {
    return { statusCode: 400, body: JSON.stringify({ error: "userId required" }) };
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (error) {
      return { statusCode: 400, body: JSON.stringify({ error: error.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("confirm-email error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Confirmation failed" }),
    };
  }
};
