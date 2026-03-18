import { useState } from "react";

function SavedToast({ show, message = "Changes Saved!" }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00E5A0", borderRadius: 10, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,229,160,0.3)", zIndex: 999 }}>
      <span style={{ fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0F" }}>{message}</span>
    </div>
  );
}

const BILLING_HISTORY = [
  { id: 1, date: "Mar 12, 2026", amount: "$25.00", status: "Trial", desc: "GlossIO Pro — Trial Period", invoice: "#INV-0001" },
  { id: 2, date: "Feb 12, 2026", amount: "$25.00", status: "Paid", desc: "GlossIO Pro — Monthly", invoice: "#INV-0002" },
  { id: 3, date: "Jan 12, 2026", amount: "$25.00", status: "Paid", desc: "GlossIO Pro — Monthly", invoice: "#INV-0003" },
  { id: 4, date: "Dec 12, 2025", amount: "$25.00", status: "Paid", desc: "GlossIO Pro — Monthly", invoice: "#INV-0004" },
];

export default function SubscriptionBilling() {
  const [screen, setScreen] = useState("main");
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Changes Saved!");
  const [cancelScreen, setCancelScreen] = useState(1); // 1 | 2 (confirmed)
  const [cancelled, setCancelled] = useState(false);

  const showToast = (msg = "Changes Saved!") => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const PLAN = {
    name: "GlossIO Pro",
    price: "$25/mo",
    trialEnds: "Mar 26, 2026",
    nextBilling: "Mar 26, 2026",
    memberSince: "Mar 12, 2026",
    email: "carlos@detailco.com",
    card: "Visa ending in 4242",
  };

  // ── MAIN ──
  if (screen === "main") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Settings</p>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Subscription & Billing</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 32px", lineHeight: 1.7 }}>Manage your plan, payment method, and billing history.</p>

        {/* Plan status banner */}
        <div style={{ background: "linear-gradient(135deg,#00C2FF0F,#A259FF0F)", border: "1px solid #00C2FF22", borderRadius: 16, padding: "20px 24px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,#00C2FF,#A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💳</div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{PLAN.name}</p>
                <span style={{ fontSize: 10, background: cancelled ? "#FF336620" : "#FFD60A20", border: `1px solid ${cancelled ? "#FF336644" : "#FFD60A44"}`, color: cancelled ? "#FF3366" : "#FFD60A", borderRadius: 20, padding: "2px 10px", fontWeight: 700 }}>{cancelled ? "Cancelled" : "Trial Active"}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{cancelled ? `Access until ${PLAN.trialEnds}` : `Trial ends ${PLAN.trialEnds} · ${PLAN.price} after`}</p>
            </div>
          </div>
        </div>

        {[
          { id: "plan", icon: "⭐", color: "#FFD60A", label: "Current Plan", desc: `${PLAN.name} · ${PLAN.price} · Trial ends ${PLAN.trialEnds}` },
          { id: "payment", icon: "💳", color: "#00C2FF", label: "Update Payment Method", desc: `${PLAN.card} · Redirects to Stripe` },
          { id: "history", icon: "🧾", color: "#A259FF", label: "Billing History", desc: `${BILLING_HISTORY.length} invoices on file` },
          { id: "cancel", icon: "⚠️", color: "#FF3366", label: "Cancel Subscription", desc: cancelled ? `Already cancelled — access until ${PLAN.trialEnds}` : "You'll keep access until the end of your billing period", disabled: cancelled },
        ].map(item => (
          <div key={item.id} onClick={() => !item.disabled && setScreen(item.id)} style={{ background: "#111118", border: "1px solid #1E1E2E", borderLeft: `3px solid ${item.disabled ? "#2A2A3E" : item.color}`, borderRadius: 16, padding: "20px 24px", marginBottom: 12, cursor: item.disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, opacity: item.disabled ? 0.45 : 1 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{item.desc}</p>
              </div>
            </div>
            <span style={{ fontSize: 18, color: "#444", flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>
      <SavedToast show={toast} message={toastMsg} />
    </div>
  );

  // ── CURRENT PLAN ──
  if (screen === "plan") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Subscription & Billing</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 28px" }}>Current Plan</h2>

        {/* Plan card */}
        <div style={{ background: "linear-gradient(135deg,#00C2FF0A,#A259FF0A)", border: "1px solid #00C2FF33", borderRadius: 20, padding: "28px 28px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700 }}>{PLAN.name}</p>
              <span style={{ fontSize: 11, background: "#FFD60A20", border: "1px solid #FFD60A44", color: "#FFD60A", borderRadius: 20, padding: "3px 12px", fontWeight: 700 }}>Trial Active</span>
            </div>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#00C2FF" }}>{PLAN.price}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Trial Ends", value: PLAN.trialEnds, color: "#FFD60A" },
              { label: "Next Billing", value: PLAN.nextBilling, color: "#00C2FF" },
              { label: "Member Since", value: PLAN.memberSince, color: "#A259FF" },
              { label: "Billing Email", value: PLAN.email, color: "#F0EDE8" },
            ].map(item => (
              <div key={item.label} style={{ background: "#0A0A0F", borderRadius: 10, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: item.color }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's included */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>What's included</p>
          {["Unlimited client bookings", "Custom public booking page", "Client CRM & history", "Automated 24hr reminders", "Revenue tracking dashboard", "SMS & email notifications"].map(feature => (
            <div key={feature} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
              <span style={{ color: "#00E5A0", fontWeight: 700, fontSize: 13 }}>✓</span>
              <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC" }}>{feature}</p>
            </div>
          ))}
        </div>

        {/* Annual upsell */}
        <div style={{ background: "#FFD60A08", border: "1px solid #FFD60A33", borderRadius: 14, padding: "18px 20px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#FFD60A" }}>Save $50 with Annual billing</p>
            <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.6 }}>Switch to $250/yr and get 2 months free. Billed once a year.</p>
          </div>
        </div>

        <button onClick={() => setScreen("main")} style={{ width: "100%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Got It</button>
      </div>
      <SavedToast show={toast} message={toastMsg} />
    </div>
  );

  // ── UPDATE PAYMENT METHOD ──
  if (screen === "payment") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Subscription & Billing</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Update Payment Method</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Your payment details are managed securely through Stripe.</p>

        {/* Current card */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Current Payment Method</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 32, background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💳</div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{PLAN.card}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#555" }}>Expires 12/28</p>
            </div>
            <span style={{ marginLeft: "auto", fontSize: 11, background: "#00E5A015", border: "1px solid #00E5A033", color: "#00E5A0", borderRadius: 20, padding: "3px 10px", fontWeight: 700 }}>Active</span>
          </div>
        </div>

        {/* Stripe redirect info */}
        <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF22", borderRadius: 14, padding: "24px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#00C2FF10", border: "1px solid #00C2FF33", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 30 }}>🔒</div>
          <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700 }}>Secure Payment via Stripe</p>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: "#666", lineHeight: 1.7 }}>Clicking below will open Stripe's secure portal where you can update your card details. Your information is never stored on our servers.</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 4 }}>
            {["🔐 256-bit SSL", "✓ PCI Compliant", "✓ Stripe Secured"].map(badge => (
              <span key={badge} style={{ fontSize: 10, background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 20, color: "#555", padding: "3px 10px" }}>{badge}</span>
            ))}
          </div>
        </div>

        <button onClick={() => showToast("Redirecting to Stripe...")} style={{ width: "100%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span>🔒</span> Update Payment Method via Stripe →
        </button>
      </div>
      <SavedToast show={toast} message={toastMsg} />
    </div>
  );

  // ── BILLING HISTORY ──
  if (screen === "history") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Subscription & Billing</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Billing History</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>All past charges and invoices for your GlossIO account.</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
          {BILLING_HISTORY.map(item => (
            <div key={item.id} style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: item.status === "Trial" ? "#FFD60A10" : "#00E5A010", border: `1px solid ${item.status === "Trial" ? "#FFD60A33" : "#00E5A033"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🧾</div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700 }}>{item.desc}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{item.date} · {item.invoice}</p>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{item.amount}</p>
                <span style={{ fontSize: 10, background: item.status === "Trial" ? "#FFD60A15" : "#00E5A015", border: `1px solid ${item.status === "Trial" ? "#FFD60A33" : "#00E5A033"}`, color: item.status === "Trial" ? "#FFD60A" : "#00E5A0", borderRadius: 20, padding: "2px 8px", fontWeight: 700 }}>{item.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>Need a receipt? Contact <span style={{ color: "#00C2FF" }}>support@glossio.app</span> and we'll send you a copy.</p>
        </div>
      </div>
      <SavedToast show={toast} message={toastMsg} />
    </div>
  );

  // ── CANCEL SUBSCRIPTION ──
  if (screen === "cancel") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Subscription & Billing</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 28px" }}>Cancel Subscription</h2>

        {cancelScreen === 1 && (
          <>
            {/* What you'll lose */}
            <div style={{ background: "#FF336608", border: "1px solid #FF336622", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 14px", fontSize: 13, fontWeight: 700, color: "#FF3366" }}>⚠️ Before you go — here's what you'll lose:</p>
              {["Your public booking page goes offline", "Clients can no longer book you through GlossIO", "Access to your client CRM & history", "Automated reminders & notifications", "Revenue tracking dashboard"].map(item => (
                <div key={item} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <span style={{ color: "#FF3366", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>✕</span>
                  <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC" }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Access until info */}
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px 18px", marginBottom: 24, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7 }}>
                If you cancel, you'll keep full access to GlossIO until <strong style={{ color: "#FFD60A" }}>{PLAN.trialEnds}</strong>. After that your account will be deactivated.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setScreen("main")} style={{ flex: 2, background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Keep My Subscription</button>
              <button onClick={() => setCancelScreen(2)} style={{ flex: 1, background: "#111118", border: "1px solid #FF336633", borderRadius: 10, color: "#FF3366", fontSize: 13, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Cancel</button>
            </div>
          </>
        )}

        {cancelScreen === 2 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "48px 32px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FF336610", border: "2px solid #FF336633", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>😔</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Subscription Cancelled</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 20px", lineHeight: 1.7 }}>
              Your GlossIO Pro subscription has been cancelled. You'll keep full access until <strong style={{ color: "#FFD60A" }}>{PLAN.trialEnds}</strong>.
            </p>
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 16px", marginBottom: 28, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6, textAlign: "left" }}>Changed your mind? You can reactivate your subscription anytime before <strong style={{ color: "#F0EDE8" }}>{PLAN.trialEnds}</strong>.</p>
            </div>
            <button onClick={() => { setCancelled(true); setScreen("main"); showToast("Subscription cancelled"); }} style={{ width: "100%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer" }}>← Back to Settings</button>
          </div>
        )}
      </div>
      <SavedToast show={toast} message={toastMsg} />
    </div>
  );
}
