import { useState } from "react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [email, setEmail] = useState("");

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
      overflowX: "hidden",
    }}>

      {/* NAV */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,15,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1E1E2E",
        padding: "16px 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{
          fontSize: 22, fontWeight: 700,
          background: "linear-gradient(90deg, #00C2FF, #A259FF)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>GlossIO</span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["How it Works", "Pricing", "For Detailers"].map(item => (
            <a key={item} href="#" style={{ color: "#888", fontSize: 14, textDecoration: "none" }}>{item}</a>
          ))}
        </div>
        <button style={{
          background: "linear-gradient(135deg, #00C2FF, #A259FF)",
          border: "none", borderRadius: 8, color: "#fff",
          fontSize: 13, fontWeight: 700, padding: "10px 22px", cursor: "pointer",
        }}>Start Free Trial</button>
      </nav>

      {/* HERO */}
      <section style={{ textAlign: "center", padding: "100px 40px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, #00C2FF18 0%, transparent 70%)",
          pointerEvents: "none"
        }} />
        <div style={{
          display: "inline-block",
          background: "#00C2FF15", border: "1px solid #00C2FF33",
          borderRadius: 20, padding: "6px 16px", marginBottom: 28,
          fontSize: 12, color: "#00C2FF", letterSpacing: "0.15em", textTransform: "uppercase"
        }}>Built for Auto Detailers</div>

        <h1 style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.15, margin: "0 auto 24px", maxWidth: 720 }}>
          Stop Losing Clients<br />
          <span style={{
            background: "linear-gradient(90deg, #00C2FF, #A259FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>in the DMs.</span>
        </h1>

        <p style={{ fontSize: 18, color: "#888", maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7 }}>
          GlossIO gives your detail business a professional home — so clients can browse your services, book appointments, and you never miss a job again.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              background: "#111118", border: "1px solid #2A2A3E",
              borderRadius: 8, color: "#F0EDE8", fontSize: 14,
              padding: "12px 18px", outline: "none", width: 260,
              fontFamily: "Georgia, serif"
            }}
          />
          <button style={{
            background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            border: "none", borderRadius: 8, color: "#fff",
            fontSize: 14, fontWeight: 700, padding: "12px 28px", cursor: "pointer",
          }}>Start My Free Trial →</button>
        </div>
        <p style={{ fontSize: 12, color: "#555", marginTop: 14 }}>14 days free · No credit card required · Cancel anytime</p>
      </section>

      {/* PAIN POINT STRIP */}
      <section style={{
        background: "#0D0D15",
        borderTop: "1px solid #1E1E2E", borderBottom: "1px solid #1E1E2E",
        padding: "28px 60px",
        display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap",
      }}>
        {[
          { icon: "📲", text: "Appointments buried in Instagram DMs" },
          { icon: "🤦", text: "Clients ghosting after you quote them" },
          { icon: "📅", text: "No-shows with zero heads up" },
          { icon: "😤", text: "Managing everything from your notes app" },
        ].map(p => (
          <div key={p.text} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <span style={{ fontSize: 13, color: "#666" }}>{p.text}</span>
          </div>
        ))}
      </section>

      {/* GOLDEN CIRCLE */}
      <section style={{ padding: "100px 60px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Our Purpose</p>
          <h2 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>Why GlossIO Exists</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {[
            {
              ring: "WHY", color: "#00C2FF",
              title: "Every detailer deserves a real business",
              body: "Your craft is professional. Your tools should be too. Too many talented detailers lose work because they're running their business out of a text thread. That ends here.",
            },
            {
              ring: "HOW", color: "#A259FF",
              title: "By replacing the DM with a system built for you",
              body: "GlossIO gives you a professional booking page, an appointment dashboard, automated reminders, and real-time client communication — all in one place.",
            },
            {
              ring: "WHAT", color: "#FF6B35",
              title: "A platform your clients love and you actually use",
              body: "Your own branded profile link. A service menu you control. An appointment board that keeps you organized. Clients book, you confirm, reminders go out automatically.",
            },
          ].map(card => (
            <div key={card.ring} style={{
              background: "#111118", border: "1px solid #1E1E2E",
              borderRadius: 16, padding: "32px 28px",
              borderTop: `3px solid ${card.color}`,
            }}>
              <div style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: `${card.color}22`, border: `1px solid ${card.color}44`,
                borderRadius: 8, padding: "4px 12px",
                fontSize: 11, fontWeight: 700, color: card.color,
                letterSpacing: "0.2em", marginBottom: 18
              }}>{card.ring}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 14px", lineHeight: 1.4 }}>{card.title}</h3>
              <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, margin: 0 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{
        background: "#0D0D15",
        borderTop: "1px solid #1E1E2E", borderBottom: "1px solid #1E1E2E",
        padding: "100px 60px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Simple by Design</p>
            <h2 style={{ fontSize: 38, fontWeight: 700, margin: 0 }}>How It Works</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {[
              { step: "01", icon: "🚀", title: "Sign Up", desc: "Create your account in minutes. Start your 14-day free trial — no card needed." },
              { step: "02", icon: "🎨", title: "Build Your Profile", desc: "Add your services, prices, photos, and a profile pic. Make it yours." },
              { step: "03", icon: "🔗", title: "Share Your Link", desc: "Drop your unique GlossIO link in your bio, stories, or wherever you promote." },
              { step: "04", icon: "📅", title: "Manage Everything", desc: "Clients book, you confirm, reminders go out automatically. You stay focused." },
            ].map(step => (
              <div key={step.step} style={{
                background: "#111118", border: "1px solid #1E1E2E",
                borderRadius: 14, padding: "26px 22px", textAlign: "center"
              }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", margin: "0 0 12px" }}>{step.step}</p>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{step.icon}</div>
                <h4 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 10px" }}>{step.title}</h4>
                <p style={{ fontSize: 13, color: "#777", lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: "100px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ fontSize: 11, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Simple Pricing</p>
          <h2 style={{ fontSize: 38, fontWeight: 700, margin: "0 0 16px" }}>One price. Everything included.</h2>
          <p style={{ fontSize: 15, color: "#777", margin: 0 }}>No hidden fees. No contracts. Cancel anytime.</p>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: 4, display: "flex", gap: 4 }}>
            {["monthly", "annual"].map(cycle => (
              <button key={cycle} onClick={() => setBillingCycle(cycle)} style={{
                background: billingCycle === cycle ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "transparent",
                border: "none", borderRadius: 7,
                color: billingCycle === cycle ? "#fff" : "#666",
                fontSize: 13, fontWeight: 700,
                padding: "8px 22px", cursor: "pointer",
              }}>
                {cycle === "annual" ? "Annual — Save $50" : "Monthly"}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: "#111118", border: "1px solid #2A2A3E",
          borderRadius: 20, padding: "48px 52px", textAlign: "center",
          position: "relative", overflow: "hidden", maxWidth: 480, margin: "0 auto"
        }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, #A259FF18, transparent)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, #00C2FF12, transparent)" }} />

          {billingCycle === "annual" && (
            <div style={{
              background: "#00E5A022", border: "1px solid #00E5A044",
              borderRadius: 20, padding: "4px 14px", display: "inline-block",
              fontSize: 12, color: "#00E5A0", fontWeight: 700, marginBottom: 20
            }}>🎉 Best Value — Save $50/year</div>
          )}

          <p style={{ fontSize: 13, color: "#666", letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 0 12px" }}>
            {billingCycle === "monthly" ? "Monthly Plan" : "Annual Plan"}
          </p>
          <div style={{ marginBottom: billingCycle === "annual" ? 8 : 28 }}>
            <span style={{ fontSize: 52, fontWeight: 700 }}>${billingCycle === "monthly" ? "25" : "250"}</span>
            <span style={{ fontSize: 16, color: "#666" }}>{billingCycle === "monthly" ? "/mo" : "/year"}</span>
          </div>
          {billingCycle === "annual" && (
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 28px" }}>That's just $20.83/mo</p>
          )}

          <div style={{ textAlign: "left", margin: "0 0 28px", display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Your own branded booking page",
              "Unlimited appointments",
              "Automated text & email reminders",
              "Real-time dashboard",
              "Service menu editor",
              "Photo gallery for your work",
              "Shareable social media link",
              "No hidden fees — ever",
            ].map(feat => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "#00E5A0", fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 14, color: "#C8C4BC" }}>{feat}</span>
              </div>
            ))}
          </div>

          <button style={{
            width: "100%", background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            border: "none", borderRadius: 10, color: "#fff",
            fontSize: 15, fontWeight: 700, padding: "14px", cursor: "pointer",
            marginBottom: 14
          }}>Start My 14-Day Free Trial →</button>
          <p style={{ fontSize: 12, color: "#555", margin: 0 }}>No credit card required to start</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{
        background: "#0D0D15", borderTop: "1px solid #1E1E2E",
        padding: "100px 60px", textAlign: "center"
      }}>
        <h2 style={{ fontSize: 42, fontWeight: 700, margin: "0 auto 16px", maxWidth: 600, lineHeight: 1.2 }}>
          Your next client is already looking for you.
        </h2>
        <p style={{ fontSize: 16, color: "#777", margin: "0 auto 40px", maxWidth: 460, lineHeight: 1.7 }}>
          Give them a professional place to land. Set up your GlossIO profile today — free for 14 days.
        </p>
        <button style={{
          background: "linear-gradient(135deg, #00C2FF, #A259FF)",
          border: "none", borderRadius: 10, color: "#fff",
          fontSize: 15, fontWeight: 700, padding: "14px 36px", cursor: "pointer",
        }}>Get Started Free →</button>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: "1px solid #1E1E2E", padding: "28px 60px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16
      }}>
        <span style={{
          fontSize: 16, fontWeight: 700,
          background: "linear-gradient(90deg, #00C2FF, #A259FF)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>GlossIO</span>
        <p style={{ fontSize: 12, color: "#444", margin: 0 }}>© 2025 GlossIO. All rights reserved.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Contact"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
