import { useState } from "react";

const SERVICES = [
  { id: 1, name: "Exterior Wash", price: "49.99", description: "Full exterior hand wash, clay bar treatment, and streak-free window cleaning.", icon: "💧", color: "#00C2FF" },
  { id: 2, name: "Interior Detail", price: "89.99", description: "Deep vacuum, leather conditioning, dashboard wipe-down, and odor elimination.", icon: "🪑", color: "#FF6B35" },
  { id: 3, name: "Full Detail", price: "159.99", description: "Our signature top-to-bottom treatment. Interior, exterior, tire dressing, engine bay.", icon: "✨", color: "#A259FF" },
  { id: 4, name: "Paint Correction", price: "299.99", description: "Multi-stage machine polish to remove swirls, scratches, and oxidation.", icon: "🔧", color: "#FFD60A" },
  { id: 5, name: "Ceramic Coating", price: "599.99", description: "Long-lasting ceramic protection. Repels water, dirt, and UV damage for years.", icon: "💎", color: "#00E5A0" },
];

const PHOTOS = [
  { id: 1, color: "#1a1a2e", label: "BMW M3 · Full Detail", emoji: "🚗" },
  { id: 2, color: "#0d1117", label: "Porsche · Paint Correction", emoji: "🏎️" },
  { id: 3, color: "#141420", label: "Tesla · Ceramic Coat", emoji: "⚡" },
  { id: 4, color: "#0a0a1a", label: "F-150 · Interior Detail", emoji: "🛻" },
  { id: 5, color: "#111118", label: "Charger · Full Detail", emoji: "💫" },
  { id: 6, color: "#0d0d15", label: "Civic · Exterior Wash", emoji: "💧" },
  { id: 7, color: "#1a1020", label: "Cayenne · Ceramic Coat", emoji: "✨" },
  { id: 8, color: "#0a1a1a", label: "Silverado · Full Detail", emoji: "🔥" },
  { id: 9, color: "#1a0a0a", label: "Model 3 · Paint Correction", emoji: "🌟" },
];

const NAV = [
  { icon: "⚡", label: "Dashboard" },
  { icon: "📅", label: "Appointments" },
  { icon: "👥", label: "Clients" },
  { icon: "🛠", label: "Services" },
  { icon: "👤", label: "Public Profile" },
  { icon: "🔗", label: "My Link" },
  { icon: "⚙️", label: "Settings" },
];

const UNIQUE_LINK = "glossio.app/carlos-detail-co";

// ─────────────────────────────────────────────
// CLIENT PUBLIC PROFILE (what clients see)
// ─────────────────────────────────────────────
function ClientProfile({ onBack }) {
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [showServices, setShowServices] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8" }}>

      {/* Top bar — client only, no edit controls */}
      <div style={{
        background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1E1E2E",
        padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 40
      }}>
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 700,
          background: "linear-gradient(90deg, #00C2FF, #A259FF)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>GlossIO</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E5A0" }} />
          <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>Verified Detailer</span>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 80px" }}>

        {/* ── ABOVE THE FOLD HERO — everything visible on first load, no scrolling needed ── */}
        <div style={{
          minHeight: "calc(100vh - 53px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "32px 24px 28px", textAlign: "center", position: "relative"
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
            width: 280, height: 280,
            background: "radial-gradient(circle, #00C2FF0D, transparent 70%)",
            pointerEvents: "none"
          }} />

          {/* Profile Pic — big, no edit controls whatsoever */}
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 52, marginBottom: 18,
            boxShadow: "0 0 0 4px #0A0A0F, 0 0 0 7px #00C2FF44, 0 0 40px #00C2FF1A",
            position: "relative", zIndex: 1, flexShrink: 0
          }}>🧑</div>

          {/* Name + Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>Carlos Detail Co.</h1>
            <span style={{
              background: "#00C2FF22", border: "1px solid #00C2FF44",
              borderRadius: 20, fontSize: 10, color: "#00C2FF",
              fontWeight: 700, padding: "2px 8px", letterSpacing: "0.1em"
            }}>✓ PRO</span>
          </div>

          {/* Tagline */}
          <p style={{ margin: "0 0 18px", fontSize: 14, color: "#777" }}>
            Premium mobile detailing · Naples, FL
          </p>

          {/* Stats row — compact card */}
          <div style={{
            display: "flex", gap: 0, marginBottom: 24,
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 14, overflow: "hidden"
          }}>
            {[{ value: "150+", label: "Details" }, { value: "5.0 ⭐", label: "Rating" }, { value: "3 yrs", label: "Experience" }].map((s, i) => (
              <div key={s.label} style={{
                textAlign: "center", padding: "12px 22px",
                borderRight: i < 2 ? "1px solid #1E1E2E" : "none"
              }}>
                <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700 }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── THE BOOK BUTTON — right under the pic, impossible to miss ── */}
          <button
            onClick={() => setShowServices(true)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #00C2FF, #A259FF)",
              border: "none", borderRadius: 16, color: "#fff",
              fontSize: 17, fontWeight: 700, padding: "20px",
              cursor: "pointer", letterSpacing: "0.03em",
              boxShadow: "0 6px 40px #00C2FF44",
              marginBottom: 10
            }}>
            🛠 See Services & Book an Appointment
          </button>
          <p style={{ margin: "0 0 28px", fontSize: 11, color: "#555" }}>
            Browse services · Pick a time · Get confirmed
          </p>

          {/* Scroll hint */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.35 }}>
            <p style={{ margin: 0, fontSize: 10, color: "#666", letterSpacing: "0.15em", textTransform: "uppercase" }}>Scroll to see our work</p>
            <span style={{ fontSize: 14 }}>↓</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
          <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.25em", textTransform: "uppercase" }}>Our Work</span>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
        </div>

        {/* 3x3 Photo Grid — tap to expand, NO remove button */}
        <div style={{ padding: "0 24px", marginBottom: 32 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {PHOTOS.map(photo => (
              <div
                key={photo.id}
                onClick={() => setExpandedPhoto(photo)}
                style={{
                  aspectRatio: "1", background: photo.color, borderRadius: 12,
                  border: "1px solid #1E1E2E", cursor: "pointer",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 6, position: "relative", overflow: "hidden"
                }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #ffffff04, transparent 60%)", pointerEvents: "none" }} />
                <span style={{ fontSize: 30 }}>{photo.emoji}</span>
                <span style={{ fontSize: 9, color: "#555", textAlign: "center", padding: "0 6px" }}>{photo.label}</span>
              </div>
            ))}
          </div>
          <p style={{ textAlign: "center", margin: "14px 0 0", fontSize: 11, color: "#444" }}>
            Tap any photo to view
          </p>
        </div>

        {/* Bio */}
        <div style={{ margin: "0 24px 28px", background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "22px 24px" }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>About</p>
          <p style={{ margin: 0, fontSize: 14, color: "#C8C4BC", lineHeight: 1.8 }}>
            5 years of making cars shine. Specializing in paint correction and ceramic coatings. Every vehicle gets treated like it's my own. Based in Naples, FL — mobile service available throughout Collier County.
          </p>
        </div>

        {/* Bottom CTA */}
        <div style={{ padding: "0 24px" }}>
          <button onClick={() => setShowServices(true)} style={{
            width: "100%",
            background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            border: "none", borderRadius: 14, color: "#fff",
            fontSize: 15, fontWeight: 700, padding: "16px",
            cursor: "pointer", letterSpacing: "0.04em",
            boxShadow: "0 4px 32px #00C2FF22", marginBottom: 12
          }}>🗓 Ready to Book? Let's Go →</button>
          <p style={{ textAlign: "center", margin: 0, fontSize: 11, color: "#444" }}>
            Powered by <span style={{ color: "#00C2FF" }}>GlossIO</span>
          </p>
        </div>
      </div>

      {/* Photo Expand Modal */}
      {expandedPhoto && (
        <div onClick={() => setExpandedPhoto(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: 24
        }}>
          <div style={{
            background: expandedPhoto.color, border: "1px solid #2A2A3E",
            borderRadius: 20, width: "100%", maxWidth: 400, aspectRatio: "1",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14
          }}>
            <span style={{ fontSize: 72 }}>{expandedPhoto.emoji}</span>
            <p style={{ margin: 0, fontSize: 14, color: "#888" }}>{expandedPhoto.label}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Services + Book Sheet */}
      {showServices && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          zIndex: 100
        }}>
          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: "20px 20px 0 0",
            width: "100%", maxWidth: 520,
            padding: "32px 28px 48px",
            maxHeight: "85vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Services & Booking</h2>
              <button onClick={() => setShowServices(false)} style={{
                background: "#1A1A2E", border: "1px solid #2A2A3E",
                borderRadius: 8, color: "#888", fontSize: 18,
                width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#666" }}>Select a service to start your booking.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {SERVICES.map(svc => (
                <div key={svc.id} style={{
                  background: "#0A0A0F", border: "1px solid #1E1E2E",
                  borderLeft: `3px solid ${svc.color}`,
                  borderRadius: 12, padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12, cursor: "pointer"
                }}>
                  <span style={{ fontSize: 22 }}>{svc.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>{svc.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{svc.description}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: svc.color, flexShrink: 0 }}>${svc.price}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 16px" }}>
              <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.6 }}>
                📋 After selecting your service, you'll provide your info and preferred time. Carlos will confirm within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Back to Dashboard button (demo only) */}
      <button onClick={onBack} style={{
        position: "fixed", bottom: 20, right: 20,
        background: "#1A1A2E", border: "1px solid #2A2A3E",
        borderRadius: 10, color: "#888", fontSize: 12,
        fontWeight: 600, padding: "10px 16px", cursor: "pointer", zIndex: 50
      }}>← Back to Dashboard</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// DETAILER DASHBOARD — My Link Tab
// ─────────────────────────────────────────────
export default function MyLinkDashboard() {
  const [showClientView, setShowClientView] = useState(false);
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeNav, setActiveNav] = useState("My Link");

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (showClientView) return <ClientProfile onBack={() => setShowClientView(false)} />;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8" }}>

      {/* ── SIDEBAR ── */}
      <div style={{
        width: 220, background: "#0D0D15", borderRight: "1px solid #1E1E2E",
        display: "flex", flexDirection: "column", padding: "28px 0",
        flexShrink: 0, position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ padding: "0 24px 28px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#444", textTransform: "uppercase", margin: "0 0 4px" }}>Platform</p>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, background: "linear-gradient(90deg, #00C2FF, #A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
        </div>

        <div style={{ margin: "0 12px 24px", background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg, #00C2FF, #A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🧑</div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Carlos Detail Co.</p>
            <p style={{ margin: 0, fontSize: 10, color: "#555" }}>Pro · Trial Active</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV.map(item => (
            <button key={item.label}
              onClick={() => {
                setActiveNav(item.label);
                if (item.label === "My Link") setShowLinkPopup(true);
              }}
              style={{
                width: "100%",
                background: activeNav === item.label ? "#1A1A2E" : "transparent",
                border: "none", borderRadius: 10,
                borderLeft: `2px solid ${activeNav === item.label ? "#00C2FF" : "transparent"}`,
                color: activeNav === item.label ? "#00C2FF" : "#666",
                fontSize: 13, fontWeight: activeNav === item.label ? 700 : 400,
                padding: "10px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 10,
                marginBottom: 2, textAlign: "left"
              }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px 0" }}>
          <button
            onClick={() => setShowLinkPopup(true)}
            style={{
              width: "100%", background: "linear-gradient(135deg, #00C2FF15, #A259FF15)",
              border: "1px solid #00C2FF33", borderRadius: 10, color: "#00C2FF",
              fontSize: 12, fontWeight: 700, padding: "10px 14px", cursor: "pointer"
            }}>🔗 Copy My Link</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Detailer Dashboard</p>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Link</h1>
        </div>

        {/* Link Card */}
        <div style={{
          background: "#111118", border: "1px solid #1E1E2E",
          borderRadius: 20, padding: "40px", maxWidth: 600, marginBottom: 28
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #00C2FF22, #A259FF22)",
              border: "1px solid #00C2FF33",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
            }}>🔗</div>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Your Public Profile Link</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Share this with any client — it's your digital storefront</p>
            </div>
          </div>

          {/* Link display */}
          <div style={{
            background: "#0A0A0F", border: "1px solid #2A2A3E",
            borderRadius: 12, padding: "16px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            gap: 12, marginBottom: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
              <span style={{ fontSize: 16 }}>🌐</span>
              <span style={{ fontSize: 14, color: "#00C2FF", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {UNIQUE_LINK}
              </span>
            </div>
            <button
              onClick={handleCopy}
              style={{
                background: copied ? "#00E5A022" : "linear-gradient(135deg, #00C2FF, #A259FF)",
                border: copied ? "1px solid #00E5A044" : "none",
                borderRadius: 8, color: copied ? "#00E5A0" : "#fff",
                fontSize: 12, fontWeight: 700, padding: "9px 18px",
                cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}>
              {copied ? "✓ Copied!" : "Copy Link"}
            </button>
          </div>

          {/* Share options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
            {[
              { icon: "📱", label: "Text It", sub: "Send via SMS" },
              { icon: "📸", label: "Instagram", sub: "Add to bio" },
              { icon: "🪪", label: "Business Card", sub: "Print it" },
            ].map(s => (
              <div key={s.label} style={{
                background: "#0A0A0F", border: "1px solid #1E1E2E",
                borderRadius: 12, padding: "16px 14px", textAlign: "center", cursor: "pointer"
              }}>
                <p style={{ fontSize: 24, margin: "0 0 6px" }}>{s.icon}</p>
                <p style={{ margin: "0 0 3px", fontSize: 12, fontWeight: 700 }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#555" }}>{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Preview button */}
          <button
            onClick={() => setShowClientView(true)}
            style={{
              width: "100%", background: "transparent",
              border: "1px solid #A259FF44", borderRadius: 12,
              color: "#A259FF", fontSize: 14, fontWeight: 700,
              padding: "14px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}>
            👁 See What Your Clients See
          </button>
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 600 }}>
          {[
            { icon: "🔒", title: "Clients can't edit anything", body: "When a client opens your link, they can only view your profile, browse your photos, and book. No editing. No removing pics. None of that." },
            { icon: "🔄", title: "Always up to date", body: "Any change you make to your services, photos, or profile instantly reflects on your link. No republishing needed." },
            { icon: "📊", title: "Every booking gets tracked", body: "When a client books through your link, they automatically get added to your Clients tab with their info and job history." },
            { icon: "🌐", title: "Works everywhere", body: "Text it, DM it, add it to your Instagram bio, print it on a business card. It works anywhere a link works." },
          ].map(card => (
            <div key={card.title} style={{
              background: "#111118", border: "1px solid #1E1E2E",
              borderRadius: 14, padding: "22px 24px"
            }}>
              <p style={{ fontSize: 24, margin: "0 0 10px" }}>{card.icon}</p>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700 }}>{card.title}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.7 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── LINK POPUP (triggered from sidebar nav click) ── */}
      {showLinkPopup && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowLinkPopup(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24
          }}>
          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 20, padding: "36px 40px",
            width: "100%", maxWidth: 460
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Your Booking Link</h2>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Share this so clients can find and book you</p>
              </div>
              <button onClick={() => setShowLinkPopup(false)} style={{
                background: "#1A1A2E", border: "1px solid #2A2A3E",
                borderRadius: 8, color: "#888", fontSize: 18,
                width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>

            {/* Link Box */}
            <div style={{
              background: "#0A0A0F", border: "1px solid #2A2A3E",
              borderRadius: 12, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12, marginBottom: 16
            }}>
              <span style={{ fontSize: 15 }}>🌐</span>
              <span style={{ flex: 1, fontSize: 13, color: "#00C2FF", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {UNIQUE_LINK}
              </span>
            </div>

            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                background: copied ? "#00E5A022" : "linear-gradient(135deg, #00C2FF, #A259FF)",
                border: copied ? "1px solid #00E5A055" : "none",
                borderRadius: 12, color: copied ? "#00E5A0" : "#fff",
                fontSize: 15, fontWeight: 700, padding: "15px",
                cursor: "pointer", marginBottom: 20, transition: "all 0.2s"
              }}>
              {copied ? "✓ Link Copied to Clipboard!" : "📋 Copy Link"}
            </button>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {["📱 Text", "📸 Instagram", "🪪 Print"].map(opt => (
                <div key={opt} style={{
                  flex: 1, background: "#0A0A0F", border: "1px solid #1E1E2E",
                  borderRadius: 10, padding: "10px 8px", textAlign: "center",
                  cursor: "pointer", fontSize: 12, color: "#888"
                }}>{opt}</div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #1E1E2E", paddingTop: 20 }}>
              <button
                onClick={() => { setShowLinkPopup(false); setShowClientView(true); }}
                style={{
                  width: "100%", background: "transparent",
                  border: "1px solid #A259FF33", borderRadius: 10,
                  color: "#A259FF", fontSize: 13, fontWeight: 700,
                  padding: "12px", cursor: "pointer"
                }}>
                👁 Preview as Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
