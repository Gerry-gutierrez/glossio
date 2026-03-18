import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM"
];

const DEFAULT_HOURS = {
  Monday:    { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
  Tuesday:   { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
  Wednesday: { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
  Thursday:  { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
  Friday:    { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
  Saturday:  { open: true,  openTime: "9:00 AM", closeTime: "3:00 PM" },
  Sunday:    { open: false, openTime: "9:00 AM", closeTime: "3:00 PM" },
};

const RADIUS_OPTIONS = ["5 miles", "10 miles", "15 miles", "25 miles", "50 miles", "No limit"];

// ── Reusable saved toast ──
function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "#00E5A0", borderRadius: 10, padding: "12px 24px",
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 8px 32px rgba(0,229,160,0.3)", zIndex: 999
    }}>
      <span style={{ fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0F" }}>Changes Saved!</span>
    </div>
  );
}

// ── Section wrapper ──
function Section({ id, activeSection, setActiveSection, icon, color, label, children }) {
  const isOpen = activeSection === id;
  return (
    <div style={{
      background: isOpen ? `${color}08` : "#111118",
      border: `1px solid ${isOpen ? color + "44" : "#1E1E2E"}`,
      borderLeft: `3px solid ${isOpen ? color : "#1E1E2E"}`,
      borderRadius: 16, marginBottom: 12, overflow: "hidden",
      transition: "all 0.2s"
    }}>
      <div
        onClick={() => setActiveSection(isOpen ? null : id)}
        style={{ padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 10,
            background: `${color}15`, border: `1px solid ${color}33`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
          }}>{icon}</div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: isOpen ? color : "#F0EDE8" }}>{label}</p>
        </div>
        <span style={{ fontSize: 16, color: isOpen ? color : "#444", transition: "all 0.2s" }}>{isOpen ? "▲" : "›"}</span>
      </div>
      {isOpen && (
        <div style={{ padding: "0 24px 24px", borderTop: `1px solid ${color}22` }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Form field ──
function Field({ label, value, onChange, placeholder, type = "text", maxLength }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          width: "100%", background: "#0A0A0F",
          border: "1px solid #2A2A3E", borderRadius: 10,
          color: "#F0EDE8", fontSize: 14, padding: "12px 14px",
          outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box"
        }}
      />
    </div>
  );
}

export default function BusinessInfo() {
  const [activeSection, setActiveSection] = useState(null);
  const [toast, setToast] = useState(false);

  // Business Name
  const [bizName, setBizName] = useState("Carlos Detail Co.");

  // Location
  const [city, setCity] = useState("Naples");
  const [state, setState] = useState("FL");
  const [zip, setZip] = useState("34102");
  const [radius, setRadius] = useState("25 miles");

  // Business Hours
  const [hours, setHours] = useState(DEFAULT_HOURS);

  // Tagline & Bio
  const [tagline, setTagline] = useState("Naples' #1 Mobile Detailer");
  const [bio, setBio] = useState("Serving Southwest Florida with passion and precision. Every vehicle gets treated like my own.");

  const showToast = () => {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const toggleDay = (day) => {
    setHours(h => ({ ...h, [day]: { ...h[day], open: !h[day].open } }));
  };

  const updateHour = (day, key, val) => {
    setHours(h => ({ ...h, [day]: { ...h[day], [key]: val } }));
  };

  const copyToAll = (sourceDay) => {
    const source = hours[sourceDay];
    const updated = {};
    DAYS.forEach(d => {
      updated[d] = { ...hours[d], openTime: source.openTime, closeTime: source.closeTime };
    });
    setHours(updated);
  };

  const openDays = DAYS.filter(d => hours[d].open);

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0F",
      fontFamily: "Georgia, serif", color: "#F0EDE8",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "48px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: 560 }}>

        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Settings</p>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Business Info</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 32px", lineHeight: 1.7 }}>
          Keep your business details up to date. This info appears on your public profile and booking page.
        </p>

        {/* ── BUSINESS NAME ── */}
        <Section id="name" activeSection={activeSection} setActiveSection={setActiveSection} icon="🏢" color="#00C2FF" label="Business Name">
          <div style={{ paddingTop: 20 }}>
            <Field label="Business Name" value={bizName} onChange={setBizName} placeholder="Your business name" maxLength={50} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{bizName.length}/50 characters</p>
              {bizName.length === 0 && <p style={{ margin: 0, fontSize: 11, color: "#FF3366" }}>Business name can't be empty</p>}
            </div>
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12, color: "#555", lineHeight: 1.6 }}>This name appears on your public booking page and all client communications.</p>
            </div>
            <button
              disabled={bizName.trim().length === 0}
              onClick={showToast}
              style={{
                width: "100%",
                background: bizName.trim().length > 0 ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                border: "none", borderRadius: 10, color: bizName.trim().length > 0 ? "#fff" : "#444",
                fontSize: 14, fontWeight: 700, padding: "14px", cursor: bizName.trim().length > 0 ? "pointer" : "not-allowed"
              }}>Save Business Name</button>
          </div>
        </Section>

        {/* ── LOCATION & SERVICE AREA ── */}
        <Section id="location" activeSection={activeSection} setActiveSection={setActiveSection} icon="📍" color="#A259FF" label="Location & Service Area">
          <div style={{ paddingTop: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0 16px" }}>
              <Field label="City" value={city} onChange={setCity} placeholder="Naples" />
              <Field label="State" value={state} onChange={setState} placeholder="FL" maxLength={2} />
            </div>
            <Field label="Zip Code" value={zip} onChange={setZip} placeholder="34102" type="text" maxLength={5} />

            {/* Service radius */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 10 }}>How Far Do You Travel?</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {RADIUS_OPTIONS.map(r => {
                  const sel = radius === r;
                  return (
                    <div key={r} onClick={() => setRadius(r)} style={{
                      background: sel ? "#A259FF15" : "#0A0A0F",
                      border: `1px solid ${sel ? "#A259FF66" : "#2A2A3E"}`,
                      borderRadius: 20, padding: "7px 16px",
                      fontSize: 12, color: sel ? "#A259FF" : "#666",
                      fontWeight: sel ? 700 : 400, cursor: "pointer", transition: "all 0.15s"
                    }}>{r}</div>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>📍</span>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>{city}, {state} {zip}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Serving within {radius}</p>
              </div>
            </div>

            <button onClick={showToast} style={{
              width: "100%", background: "linear-gradient(135deg,#A259FF,#00C2FF)",
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer"
            }}>Save Location</button>
          </div>
        </Section>

        {/* ── BUSINESS HOURS ── */}
        <Section id="hours" activeSection={activeSection} setActiveSection={setActiveSection} icon="🕐" color="#FF6B35" label="Business Hours">
          <div style={{ paddingTop: 20 }}>

            {/* Summary chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
              {DAYS.map(day => (
                <span key={day} style={{
                  background: hours[day].open ? "#FF6B3515" : "#111118",
                  border: `1px solid ${hours[day].open ? "#FF6B3544" : "#1E1E2E"}`,
                  borderRadius: 20, fontSize: 11,
                  color: hours[day].open ? "#FF6B35" : "#444",
                  padding: "4px 11px", fontWeight: hours[day].open ? 700 : 400
                }}>{day.slice(0, 3)}</span>
              ))}
            </div>

            {/* Per-day rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {DAYS.map(day => {
                const h = hours[day];
                return (
                  <div key={day} style={{
                    background: h.open ? "#0D0D15" : "#0A0A0A",
                    border: `1px solid ${h.open ? "#FF6B3522" : "#1A1A1A"}`,
                    borderRadius: 12, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    opacity: h.open ? 1 : 0.5, transition: "all 0.2s"
                  }}>
                    {/* Toggle */}
                    <div onClick={() => toggleDay(day)} style={{
                      width: 40, height: 22, borderRadius: 11,
                      background: h.open ? "#FF6B35" : "#2A2A3E",
                      position: "relative", cursor: "pointer",
                      flexShrink: 0, transition: "all 0.25s"
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", background: "#fff",
                        position: "absolute", top: 3,
                        left: h.open ? 21 : 3,
                        transition: "all 0.25s"
                      }} />
                    </div>

                    {/* Day name */}
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, width: 90, flexShrink: 0, color: h.open ? "#F0EDE8" : "#444" }}>{day}</p>

                    {h.open ? (
                      <>
                        {/* Open time */}
                        <select
                          value={h.openTime}
                          onChange={e => updateHour(day, "openTime", e.target.value)}
                          style={{
                            flex: 1, background: "#111118", border: "1px solid #2A2A3E",
                            borderRadius: 8, color: "#F0EDE8", fontSize: 12,
                            padding: "7px 10px", outline: "none", fontFamily: "Georgia, serif"
                          }}>
                          {HOURS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <span style={{ fontSize: 11, color: "#555", flexShrink: 0 }}>to</span>

                        {/* Close time */}
                        <select
                          value={h.closeTime}
                          onChange={e => updateHour(day, "closeTime", e.target.value)}
                          style={{
                            flex: 1, background: "#111118", border: "1px solid #2A2A3E",
                            borderRadius: 8, color: "#F0EDE8", fontSize: 12,
                            padding: "7px 10px", outline: "none", fontFamily: "Georgia, serif"
                          }}>
                          {HOURS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        {/* Copy to all */}
                        <button
                          onClick={() => copyToAll(day)}
                          title="Copy these hours to all days"
                          style={{
                            background: "transparent", border: "1px solid #2A2A3E",
                            borderRadius: 7, color: "#555", fontSize: 10,
                            padding: "5px 8px", cursor: "pointer", flexShrink: 0,
                            whiteSpace: "nowrap"
                          }}>Copy to all</button>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: 12, color: "#444", fontStyle: "italic" }}>Closed</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Open days summary */}
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Open {openDays.length} days a week</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{openDays.join(", ")}</p>
            </div>

            <button onClick={showToast} style={{
              width: "100%", background: "linear-gradient(135deg,#FF6B35,#A259FF)",
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer"
            }}>Save Business Hours</button>
          </div>
        </Section>

        {/* ── TAGLINE & BIO ── */}
        <Section id="bio" activeSection={activeSection} setActiveSection={setActiveSection} icon="✏️" color="#FFD60A" label="Tagline & Bio">
          <div style={{ paddingTop: 20 }}>

            {/* Tagline */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Tagline <span style={{ fontSize: 10, color: "#444", textTransform: "none", letterSpacing: 0 }}>(shown under your name on your public profile)</span>
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Naples' #1 Mobile Detailer"
                maxLength={60}
                style={{
                  width: "100%", background: "#0A0A0F",
                  border: "1px solid #2A2A3E", borderRadius: 10,
                  color: "#F0EDE8", fontSize: 14, padding: "12px 14px",
                  outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box"
                }}
              />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#555" }}>{tagline.length}/60 characters</p>
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Bio <span style={{ fontSize: 10, color: "#444", textTransform: "none", letterSpacing: 0 }}>(appears on your public profile)</span>
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                placeholder="Tell clients a little about yourself and your work..."
                rows={4}
                maxLength={300}
                style={{
                  width: "100%", background: "#0A0A0F",
                  border: "1px solid #2A2A3E", borderRadius: 10,
                  color: "#F0EDE8", fontSize: 14, padding: "12px 14px",
                  outline: "none", fontFamily: "Georgia, serif",
                  resize: "vertical", boxSizing: "border-box"
                }}
              />
              <p style={{ margin: "5px 0 0", fontSize: 11, color: "#555" }}>{bio.length}/300 characters</p>
            </div>

            {/* Live preview */}
            <div style={{ background: "#0A0A0F", border: "1px solid #FFD60A22", borderRadius: 12, padding: "18px 20px", marginBottom: 20 }}>
              <p style={{ margin: "0 0 12px", fontSize: 10, color: "#FFD60A", textTransform: "uppercase", letterSpacing: "0.15em" }}>👁 Preview on Public Profile</p>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>🧑</div>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700 }}>Carlos Detail Co.</p>
                  <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>{tagline || "Your tagline appears here"}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.7 }}>{bio || "Your bio appears here..."}</p>
                </div>
              </div>
            </div>

            <div style={{ background: "#FFD60A0A", border: "1px solid #FFD60A22", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 14 }}>💡</span>
              <p style={{ margin: 0, fontSize: 11, color: "#FFD60A", lineHeight: 1.6 }}>Changes here will also update your public profile automatically.</p>
            </div>

            <button onClick={showToast} style={{
              width: "100%", background: "linear-gradient(135deg,#FFD60A,#FF6B35)",
              border: "none", borderRadius: 10, color: "#0A0A0F",
              fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer"
            }}>Save Tagline & Bio</button>
          </div>
        </Section>

      </div>

      <SavedToast show={toast} />
    </div>
  );
}
