import { useState } from "react";

const SERVICES = [
  { id: 1, name: "Exterior Wash", price: "49.99", description: "Full exterior hand wash, clay bar treatment, and streak-free window cleaning.", icon: "💧", color: "#00C2FF" },
  { id: 2, name: "Interior Detail", price: "89.99", description: "Deep vacuum, leather conditioning, dashboard wipe-down, and odor elimination.", icon: "🪑", color: "#FF6B35" },
  { id: 3, name: "Full Detail", price: "159.99", description: "Our signature top-to-bottom treatment. Interior, exterior, tire dressing, engine bay.", icon: "✨", color: "#A259FF" },
  { id: 4, name: "Paint Correction", price: "299.99", description: "Multi-stage machine polish to remove swirls, scratches, and oxidation.", icon: "🔧", color: "#FFD60A" },
  { id: 5, name: "Ceramic Coating", price: "599.99", description: "Long-lasting ceramic protection. Repels water, dirt, and UV damage for years.", icon: "💎", color: "#00E5A0" },
];

const PHOTOS = [
  { id: 1, color: "#0f1a2e", label: "BMW M3 · Full Detail", emoji: "🚗" },
  { id: 2, color: "#0d1117", label: "Porsche · Paint Correction", emoji: "🏎️" },
  { id: 3, color: "#141420", label: "Tesla · Ceramic Coat", emoji: "⚡" },
  { id: 4, color: "#0a0a1a", label: "F-150 · Interior Detail", emoji: "🛻" },
  { id: 5, color: "#111118", label: "Charger · Full Detail", emoji: "💫" },
  { id: 6, color: "#0d1a15", label: "Civic · Exterior Wash", emoji: "💧" },
  { id: 7, color: "#1a1020", label: "Cayenne · Ceramic Coat", emoji: "✨" },
  { id: 8, color: "#0a1a1a", label: "Silverado · Full Detail", emoji: "🔥" },
  { id: 9, color: "#1a0a0a", label: "Model 3 · Paint Correction", emoji: "🌟" },
];

export default function ClientProfile() {
  const [expandedPhoto, setExpandedPhoto] = useState(null);
  const [showServices, setShowServices] = useState(false);
  const [expandedService, setExpandedService] = useState(null);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: "rgba(10,10,15,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1E1E2E",
        padding: "13px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 40,
        height: 53, boxSizing: "border-box"
      }}>
        <h2 style={{
          margin: 0, fontSize: 18, fontWeight: 700,
          background: "linear-gradient(90deg, #00C2FF, #A259FF)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
        }}>GlossIO</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E5A0" }} />
          <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Verified Detailer
          </span>
        </div>
      </div>

      {/* ── HERO — 100vh minus top bar, everything above the fold ── */}
      <div style={{
        height: "calc(100vh - 53px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Glow blob behind pic */}
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: 320, height: 320,
          background: "radial-gradient(circle, #00C2FF0F, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Profile Picture */}
        <div style={{
          width: 118, height: 118, borderRadius: "50%",
          background: "linear-gradient(135deg, #00C2FF, #A259FF)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 52, marginBottom: 18,
          boxShadow: "0 0 0 4px #0A0A0F, 0 0 0 7px #00C2FF55, 0 0 48px #00C2FF18",
          position: "relative", zIndex: 1, flexShrink: 0,
        }}>🧑</div>

        {/* Name + PRO badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Carlos Detail Co.
          </h1>
          <span style={{
            background: "#00C2FF22", border: "1px solid #00C2FF55",
            borderRadius: 20, fontSize: 10, color: "#00C2FF",
            fontWeight: 700, padding: "2px 9px", letterSpacing: "0.08em"
          }}>✓ PRO</span>
        </div>

        {/* Tagline */}
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "#777", lineHeight: 1.5 }}>
          Premium mobile detailing · Naples, FL
        </p>

        {/* Stats pill */}
        <div style={{
          display: "flex",
          background: "#111118",
          border: "1px solid #1E1E2E",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 26,
        }}>
          {[
            { value: "150+", label: "Details" },
            { value: "5.0 ⭐", label: "Rating" },
            { value: "3 yrs", label: "Experience" },
          ].map((s, i) => (
            <div key={s.label} style={{
              textAlign: "center",
              padding: "13px 22px",
              borderRight: i < 2 ? "1px solid #1E1E2E" : "none",
            }}>
              <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700 }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#555", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── BOOK BUTTON — the whole reason this page exists ── */}
        <button
          onClick={() => setShowServices(true)}
          style={{
            width: "100%", maxWidth: 420,
            background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            border: "none", borderRadius: 16, color: "#fff",
            fontSize: 17, fontWeight: 700, padding: "20px 24px",
            cursor: "pointer", letterSpacing: "0.02em",
            boxShadow: "0 8px 48px #00C2FF44",
            marginBottom: 10,
          }}>
          🛠 See Services &amp; Book an Appointment
        </button>
        <p style={{ margin: "0 0 28px", fontSize: 11, color: "#555" }}>
          Browse services · Pick a time · Get confirmed
        </p>

        {/* Scroll hint */}
        <div style={{ opacity: 0.3, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <p style={{ margin: 0, fontSize: 10, color: "#888", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Scroll to see our work
          </p>
          <span style={{ fontSize: 13, color: "#888" }}>↓</span>
        </div>
      </div>

      {/* ── BELOW THE FOLD — Our Work ── */}
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Section Label */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
          <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.25em", textTransform: "uppercase" }}>Our Work</span>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
        </div>

        {/* 3x3 Photo Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
          {PHOTOS.map(photo => (
            <div
              key={photo.id}
              onClick={() => setExpandedPhoto(photo)}
              style={{
                aspectRatio: "1",
                background: photo.color,
                borderRadius: 12,
                border: "1px solid #1E1E2E",
                cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 6, position: "relative", overflow: "hidden",
              }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(135deg, #ffffff05, transparent 60%)",
                pointerEvents: "none",
              }} />
              <span style={{ fontSize: 30 }}>{photo.emoji}</span>
              <span style={{ fontSize: 9, color: "#555", textAlign: "center", padding: "0 6px" }}>
                {photo.label}
              </span>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", margin: "0 0 40px", fontSize: 11, color: "#444" }}>
          Tap any photo to view
        </p>

        {/* About */}
        <div style={{
          background: "#111118", border: "1px solid #1E1E2E",
          borderRadius: 14, padding: "22px 24px", marginBottom: 28
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>About</p>
          <p style={{ margin: 0, fontSize: 14, color: "#C8C4BC", lineHeight: 1.85 }}>
            5 years of making cars shine. Specializing in paint correction and ceramic coatings.
            Every vehicle gets treated like it's my own. Based in Naples, FL — mobile service
            available throughout Collier County.
          </p>
        </div>

        {/* Bottom CTA */}
        <button
          onClick={() => setShowServices(true)}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #00C2FF, #A259FF)",
            border: "none", borderRadius: 14, color: "#fff",
            fontSize: 15, fontWeight: 700, padding: "17px",
            cursor: "pointer", letterSpacing: "0.03em",
            boxShadow: "0 4px 32px #00C2FF22", marginBottom: 12,
          }}>
          🗓 Ready to Book? Let's Go →
        </button>
        <p style={{ textAlign: "center", margin: 0, fontSize: 11, color: "#444" }}>
          Powered by <span style={{ color: "#00C2FF" }}>GlossIO</span>
        </p>
      </div>

      {/* ── PHOTO EXPAND MODAL ── */}
      {expandedPhoto && (
        <div
          onClick={() => setExpandedPhoto(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100, padding: 24,
          }}>
          <div style={{
            background: expandedPhoto.color,
            border: "1px solid #2A2A3E",
            borderRadius: 20, width: "100%", maxWidth: 380,
            aspectRatio: "1",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
          }}>
            <span style={{ fontSize: 72 }}>{expandedPhoto.emoji}</span>
            <p style={{ margin: 0, fontSize: 14, color: "#888" }}>{expandedPhoto.label}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#444" }}>Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* ── SERVICES + BOOK BOTTOM SHEET ── */}
      {showServices && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowServices(false); }}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            zIndex: 100,
          }}>
          <div style={{
            background: "#111118",
            border: "1px solid #1E1E2E",
            borderRadius: "22px 22px 0 0",
            width: "100%", maxWidth: 520,
            padding: "32px 28px 48px",
            maxHeight: "88vh", overflowY: "auto",
          }}>
            {/* Handle bar */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: "#2A2A3E", margin: "0 auto 24px",
            }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Services & Booking</h2>
              <button
                onClick={() => setShowServices(false)}
                style={{
                  background: "#1A1A2E", border: "1px solid #2A2A3E",
                  borderRadius: 8, color: "#888", fontSize: 18,
                  width: 36, height: 36, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>✕</button>
            </div>
            <p style={{ margin: "0 0 24px", fontSize: 13, color: "#666" }}>
              Select a service below to start your booking.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {SERVICES.map(svc => {
                const isOpen = expandedService === svc.id;
                return (
                  <div
                    key={svc.id}
                    style={{
                      background: isOpen ? `${svc.color}08` : "#0A0A0F",
                      border: `1px solid ${isOpen ? svc.color + "44" : "#1E1E2E"}`,
                      borderLeft: `3px solid ${svc.color}`,
                      borderRadius: 13,
                      overflow: "hidden",
                      transition: "all 0.2s",
                    }}>

                    {/* ── Collapsed row — always visible, tap to expand ── */}
                    <div
                      onClick={() => setExpandedService(isOpen ? null : svc.id)}
                      style={{
                        padding: "15px 16px",
                        display: "flex", alignItems: "center", gap: 13,
                        cursor: "pointer",
                      }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                        background: `${svc.color}15`, border: `1px solid ${svc.color}33`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20,
                      }}>{svc.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>{svc.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>
                          {svc.description}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: svc.color }}>
                          ${svc.price}
                        </p>
                        <span style={{ fontSize: 11, color: "#555" }}>{isOpen ? "▲ Less" : "▼ More"}</span>
                      </div>
                    </div>

                    {/* ── Expanded drop — full details + Book button ── */}
                    {isOpen && (
                      <div style={{
                        padding: "0 16px 18px",
                        borderTop: `1px solid ${svc.color}22`,
                      }}>
                        {/* What's included */}
                        <p style={{ margin: "14px 0 8px", fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>
                          What's Included
                        </p>
                        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.8 }}>
                          {svc.description}
                        </p>

                        {/* Price callout */}
                        <div style={{
                          background: `${svc.color}10`, border: `1px solid ${svc.color}22`,
                          borderRadius: 10, padding: "12px 14px",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          marginBottom: 14,
                        }}>
                          <span style={{ fontSize: 12, color: "#888" }}>Starting at</span>
                          <span style={{ fontSize: 20, fontWeight: 700, color: svc.color }}>${svc.price}</span>
                        </div>

                        {/* Book This Service button */}
                        <button style={{
                          width: "100%",
                          background: `linear-gradient(135deg, ${svc.color}, ${svc.color}99)`,
                          border: "none", borderRadius: 10, color: "#0A0A0F",
                          fontSize: 13, fontWeight: 700, padding: "13px",
                          cursor: "pointer", letterSpacing: "0.04em",
                        }}>
                          Book {svc.name} →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{
              background: "#00C2FF08", border: "1px solid #00C2FF1A",
              borderRadius: 12, padding: "13px 16px",
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>
                📋 After selecting your service, you'll share your info and preferred time.
                Carlos will confirm your appointment within 24 hours.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
