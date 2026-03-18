import { useState } from "react";

const SETTINGS_SECTIONS = [
  {
    id: "account",
    icon: "🔐",
    label: "Account & Security",
    description: "Password, email, phone, two-factor authentication",
    color: "#00C2FF",
    items: ["Change Password", "Change Email", "Change Phone", "Two-Factor Auth"],
  },
  {
    id: "business",
    icon: "🏢",
    label: "Business Info",
    description: "Business name, location, hours, tagline, bio",
    color: "#A259FF",
    items: ["Business Name", "Location & Service Area", "Business Hours", "Tagline & Bio"],
  },
  {
    id: "availability",
    icon: "📅",
    label: "Availability & Blocking",
    description: "Days off, vacation blocks, booking limits, advance window",
    color: "#FF6B35",
    items: ["Vacation / Date Blocks", "Max Appts Per Day", "Advance Booking Window"],
  },
  {
    id: "notifications",
    icon: "🔔",
    label: "Notifications",
    description: "Booking alerts, cancellations, reminders, email summaries",
    color: "#FFD60A",
    items: ["New Booking Alerts", "Cancellation Alerts", "24hr Reminder Toggle", "Weekly Email Summary"],
  },
  {
    id: "subscription",
    icon: "💳",
    label: "Subscription & Billing",
    description: "Current plan, billing date, payment method, cancel",
    color: "#00E5A0",
    items: ["Current Plan", "Update Payment Method", "Billing History", "Cancel Subscription"],
  },
  {
    id: "support",
    icon: "🆘",
    label: "Support",
    description: "Contact admin, submit feedback, help docs",
    color: "#FF3366",
    items: ["Contact Support"],
  },
];

export default function SettingsHome() {
  const [activeSection, setActiveSection] = useState(null);
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
      display: "flex",
    }}>

      {/* ── Sidebar ── */}
      <div style={{
        width: 220, background: "#0D0D15",
        borderRight: "1px solid #1E1E2E",
        display: "flex", flexDirection: "column",
        padding: "28px 0", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ padding: "0 24px 28px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#444", textTransform: "uppercase", margin: "0 0 4px" }}>Platform</p>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, background: "linear-gradient(90deg,#00C2FF,#A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
        </div>

        <div style={{ margin: "0 12px 24px", background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>🧑</div>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700 }}>Carlos Detail Co.</p>
            <p style={{ margin: 0, fontSize: 10, color: "#555" }}>Pro · Trial Active</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 12px" }}>
          {[
            { icon: "⚡", label: "Dashboard" },
            { icon: "📅", label: "Appointments" },
            { icon: "👥", label: "Clients" },
            { icon: "🛠", label: "Services" },
            { icon: "👤", label: "Public Profile" },
            { icon: "🔗", label: "My Link" },
            { icon: "⚙️", label: "Settings" },
          ].map(item => (
            <button key={item.label} style={{
              width: "100%",
              background: item.label === "Settings" ? "#1A1A2E" : "transparent",
              border: "none", borderRadius: 10,
              borderLeft: `2px solid ${item.label === "Settings" ? "#00C2FF" : "transparent"}`,
              color: item.label === "Settings" ? "#00C2FF" : "#666",
              fontSize: 13, fontWeight: item.label === "Settings" ? 700 : 400,
              padding: "10px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 2, textAlign: "left"
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* My Link button */}
        <div style={{ padding: "0 12px" }}>
          <button style={{
            width: "100%", background: "linear-gradient(135deg,#00C2FF22,#A259FF22)",
            border: "1px solid #00C2FF33", borderRadius: 10,
            color: "#00C2FF", fontSize: 12, fontWeight: 700,
            padding: "10px 14px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8
          }}>
            🔗 Copy My Link
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Detailer Dashboard</p>
          <h1 style={{ fontSize: 30, fontWeight: 700, margin: "0 0 8px" }}>Settings</h1>
          <p style={{ fontSize: 14, color: "#555", margin: 0 }}>Manage your account, availability, notifications, and subscription.</p>
        </div>

        {/* Quick info bar */}
        <div style={{
          background: "#111118", border: "1px solid #1E1E2E",
          borderRadius: 14, padding: "16px 24px",
          display: "flex", gap: 32, marginBottom: 36,
          flexWrap: "wrap"
        }}>
          {[
            { label: "Plan", value: "GlossIO Pro", color: "#00C2FF" },
            { label: "Trial Ends", value: "Mar 26, 2026", color: "#FFD60A" },
            { label: "Member Since", value: "Mar 12, 2026", color: "#A259FF" },
            { label: "Account", value: "carlos@detailco.com", color: "#F0EDE8" },
          ].map(item => (
            <div key={item.label}>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Section cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {SETTINGS_SECTIONS.map(section => {
            const isHovered = hovered === section.id;
            const isActive = activeSection === section.id;
            return (
              <div
                key={section.id}
                onMouseEnter={() => setHovered(section.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: isHovered ? `${section.color}0A` : "#0D0D15",
                  border: `1px solid ${isHovered ? section.color + "44" : "#1E1E2E"}`,
                  borderLeft: `3px solid ${isHovered ? section.color : "#1E1E2E"}`,
                  borderRadius: 16, padding: "24px 26px",
                  cursor: "default", transition: "all 0.2s",
                }}
              >
                {/* Card header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 12,
                      background: `${section.color}15`,
                      border: `1px solid ${section.color}33`,
                      display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 22, flexShrink: 0
                    }}>
                      {section.icon}
                    </div>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: isHovered ? section.color : "#F0EDE8" }}>{section.label}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.5 }}>{section.description}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: isHovered ? section.color : "#333", transition: "all 0.2s", marginTop: 2 }}>›</span>
                </div>

                {/* Sub-items — directly clickable */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 6,
                  borderTop: `1px solid ${isHovered || isActive ? section.color + "22" : "#1A1A2E"}`,
                  paddingTop: 14
                }}>
                  {section.items.map(item => (
                    <span
                      key={item}
                      onClick={(e) => { e.stopPropagation(); alert(`Opening: ${item}`); }}
                      style={{
                        background: isHovered || isActive ? `${section.color}15` : "#111118",
                        border: `1px solid ${isHovered || isActive ? section.color + "55" : "#1E1E2E"}`,
                        borderRadius: 20, fontSize: 11,
                        color: isHovered || isActive ? section.color : "#555",
                        padding: "5px 13px", transition: "all 0.2s",
                        cursor: "pointer", fontWeight: isHovered || isActive ? 700 : 400,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${section.color}30`;
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = isHovered ? `${section.color}15` : "#111118";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {item} →
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div style={{ marginTop: 32, padding: "16px 20px", background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20 }}>🛡️</span>
          <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.7 }}>
            Your data is encrypted and never shared. For urgent account issues contact us at <span style={{ color: "#00C2FF" }}>support@glossio.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}
