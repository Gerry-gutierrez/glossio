export default function Step5Preview() {
  const companyName = "Carlos Detail Co.";
  const firstName = "Carlos";

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>

      <h1 style={{
        margin: "0 0 40px", fontSize: 26, fontWeight: 700,
        background: "linear-gradient(90deg, #00C2FF, #A259FF)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>GlossIO</h1>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#111118", border: "1px solid #1E1E2E",
        borderRadius: 20, padding: "48px 44px",
        textAlign: "center", position: "relative", overflow: "hidden"
      }}>

        {/* Background glow */}
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 300, height: 300,
          background: "radial-gradient(circle, #00C2FF08, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Checkmark circle */}
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: "linear-gradient(135deg, #00C2FF, #A259FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 28px",
          boxShadow: "0 0 40px #00C2FF33"
        }}>✓</div>

        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
          Welcome to GlossIO,<br />
          <span style={{
            background: "linear-gradient(90deg, #00C2FF, #A259FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>{companyName}! 🎉</span>
        </h2>

        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "12px 0 32px", maxWidth: 380, marginLeft: "auto", marginRight: "auto" }}>
          Your 14-day free trial has started. Let's get your profile set up so clients can start booking you right away.
        </p>

        {/* Trial badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#00E5A015", border: "1px solid #00E5A033",
          borderRadius: 20, padding: "8px 18px", marginBottom: 36
        }}>
          <span style={{ fontSize: 14 }}>🟢</span>
          <span style={{ fontSize: 13, color: "#00E5A0", fontWeight: 700 }}>14-Day Free Trial — Active</span>
        </div>

        {/* Checklist */}
        <div style={{
          background: "#0A0A0F", border: "1px solid #1E1E2E",
          borderRadius: 14, padding: "24px", marginBottom: 32, textAlign: "left"
        }}>
          <p style={{ margin: "0 0 16px", fontSize: 11, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>
            Your First Steps
          </p>
          {[
            { icon: "🎨", title: "Customize your public profile", sub: "Add a photo and let clients know who you are", done: false },
            { icon: "🛠", title: "Add your services & prices", sub: "Tell clients what you offer and what it costs", done: false },
            { icon: "📸", title: "Upload your work photos", sub: "Show off your best details — let the work speak", done: false },
            { icon: "🔗", title: "Copy & share your booking link", sub: "Drop it in your bio, DMs, or anywhere you promote", done: false },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 14, alignItems: "flex-start",
              paddingBottom: i < 3 ? 16 : 0,
              borderBottom: i < 3 ? "1px solid #1A1A2A" : "none",
              marginBottom: i < 3 ? 16 : 0
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: "#111118", border: "1px solid #2A2A3E",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18
              }}>{item.icon}</div>
              <div>
                <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 600 }}>{item.title}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{item.sub}</p>
              </div>
              <div style={{ marginLeft: "auto", flexShrink: 0 }}>
                <div style={{
                  width: 20, height: 20, borderRadius: "50%",
                  border: "2px solid #2A2A3E",
                  background: "transparent"
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button style={{
          width: "100%",
          background: "linear-gradient(135deg, #00C2FF, #A259FF)",
          border: "none", borderRadius: 12, color: "#fff",
          fontSize: 15, fontWeight: 700, padding: "16px",
          cursor: "pointer", letterSpacing: "0.05em",
          boxShadow: "0 4px 24px #00C2FF22"
        }}>
          Go to My Dashboard →
        </button>

        <p style={{ margin: "16px 0 0", fontSize: 12, color: "#444" }}>
          No credit card needed · Cancel anytime after your trial
        </p>
      </div>
    </div>
  );
}
