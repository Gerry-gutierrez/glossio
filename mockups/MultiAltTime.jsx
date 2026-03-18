import { useState } from "react";

const BOOKING = {
  clientName: "Destiny Walton",
  service: "Exterior Wash",
  serviceIcon: "💧",
  serviceColor: "#00C2FF",
  price: "49.99",
  vehicle: "2022 Honda Civic (White)",
  originalDate: "Tue, Mar 17",
  originalTime: "2:00 PM",
  detailer: "Carlos Detail Co.",
  detailerPhone: "(239) 555-0100",
};

const TIMES = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

const getDates = () => {
  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const fmtDate = (d) => d instanceof Date
  ? d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
  : d;

const SLOT_COLORS = ["#00C2FF", "#A259FF", "#FF6B35"];
const SLOT_LABELS = ["Option 1", "Option 2", "Option 3"];

export default function MultiAltTime() {
  const [view, setView] = useState("detailer"); // detailer | client

  // Detailer side state
  const [slots, setSlots] = useState([{ date: null, time: "" }]); // up to 3
  const [pickingSlot, setPickingSlot] = useState(0); // which slot is being edited
  const [sent, setSent] = useState(false);

  // Client side state
  const [screen, setScreen] = useState("message");
  const [messageType, setMessageType] = useState("text");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState("");
  const [finalScreen, setFinalScreen] = useState(null); // accepted | submitted

  const addSlot = () => {
    if (slots.length < 3) setSlots(s => [...s, { date: null, time: "" }]);
  };

  const removeSlot = (i) => {
    const updated = slots.filter((_, idx) => idx !== i);
    setSlots(updated);
    if (pickingSlot >= updated.length) setPickingSlot(updated.length - 1);
  };

  const updateSlot = (i, key, val) => {
    setSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [key]: val } : slot));
  };

  const validSlots = slots.filter(s => s.date && s.time);
  const canSend = validSlots.length > 0;

  // Simulate the slots Carlos built (for client view)
  const builtSlots = sent ? validSlots : [
    { date: getDates()[1], time: "11:00 AM" },
    { date: getDates()[3], time: "9:00 AM" },
    { date: getDates()[4], time: "2:00 PM" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8" }}>

      {/* ── TOP SWITCHER ── */}
      <div style={{
        background: "#111118", borderBottom: "1px solid #1E1E2E",
        padding: "10px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10,
        position: "sticky", top: 0, zIndex: 50
      }}>
        <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          🔄 Multi-Slot Alt Time Flow
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setView("detailer")} style={{
            background: view === "detailer" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#0A0A0F",
            border: `1px solid ${view === "detailer" ? "transparent" : "#2A2A3E"}`,
            borderRadius: 7, color: view === "detailer" ? "#fff" : "#666",
            fontSize: 11, fontWeight: 700, padding: "6px 14px", cursor: "pointer"
          }}>🛠 Carlos's Modal</button>
          <button onClick={() => { setView("client"); setScreen("message"); }} style={{
            background: view === "client" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#0A0A0F",
            border: `1px solid ${view === "client" ? "transparent" : "#2A2A3E"}`,
            borderRadius: 7, color: view === "client" ? "#fff" : "#666",
            fontSize: 11, fontWeight: 700, padding: "6px 14px", cursor: "pointer"
          }}>👤 Client Receives</button>
        </div>
      </div>

      {/* ═══════════════════════════════════════ */}
      {/* DETAILER SIDE — Suggest Alt Time Modal  */}
      {/* ═══════════════════════════════════════ */}
      {view === "detailer" && (
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "36px 24px 60px" }}>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Suggest Alt Time</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Propose New Time Slots</h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0, lineHeight: 1.6 }}>
              Give Destiny up to <strong style={{ color: "#F0EDE8" }}>3 options</strong> to choose from. Less back and forth, faster confirmation.
            </p>
          </div>

          {/* Appointment being rescheduled */}
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "16px 20px", marginBottom: 28, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "#00C2FF15", border: "1px solid #00C2FF33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>💧</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>Destiny Walton — Exterior Wash</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888" }}>
                Original: <span style={{ textDecoration: "line-through", color: "#666" }}>Tue, Mar 17 · 2:00 PM</span>
              </p>
            </div>
            <span style={{ background: "#FFD60A15", border: "1px solid #FFD60A33", borderRadius: 20, fontSize: 11, color: "#FFD60A", fontWeight: 700, padding: "4px 12px" }}>🟡 Pending</span>
          </div>

          {/* Slot tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
            {slots.map((_, i) => (
              <button key={i} onClick={() => setPickingSlot(i)} style={{
                background: pickingSlot === i ? `${SLOT_COLORS[i]}22` : "#111118",
                border: `1px solid ${pickingSlot === i ? SLOT_COLORS[i] + "66" : "#1E1E2E"}`,
                borderRadius: 10, color: pickingSlot === i ? SLOT_COLORS[i] : "#666",
                fontSize: 12, fontWeight: pickingSlot === i ? 700 : 400,
                padding: "8px 16px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8
              }}>
                {SLOT_LABELS[i]}
                {slots[i].date && slots[i].time
                  ? <span style={{ fontSize: 10, opacity: 0.7 }}>✓</span>
                  : <span style={{ fontSize: 10, opacity: 0.4 }}>○</span>
                }
                {slots.length > 1 && (
                  <span
                    onClick={(e) => { e.stopPropagation(); removeSlot(i); }}
                    style={{ fontSize: 12, color: "#FF3366", cursor: "pointer", opacity: 0.7, marginLeft: 2 }}>✕</span>
                )}
              </button>
            ))}
            {slots.length < 3 && (
              <button onClick={addSlot} style={{
                background: "transparent", border: "1px dashed #2A2A3E",
                borderRadius: 10, color: "#555", fontSize: 12,
                padding: "8px 14px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 6
              }}>+ Add Option</button>
            )}
          </div>

          {/* Active slot editor */}
          {slots.map((slot, i) => i !== pickingSlot ? null : (
            <div key={i} style={{
              background: "#111118",
              border: `1px solid ${SLOT_COLORS[i]}33`,
              borderRadius: 16, padding: "24px",
              marginBottom: 24
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: SLOT_COLORS[i] }} />
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: SLOT_COLORS[i] }}>{SLOT_LABELS[i]}</p>
              </div>

              {/* Date scroll */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>
                Date <span style={{ color: "#FF6B35" }}>*</span>
              </p>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
                {getDates().map((d, di) => {
                  const sel = slot.date && fmtDate(slot.date) === fmtDate(d);
                  // Disable dates already picked in other slots
                  const takenByOther = slots.some((s, si) => si !== i && s.date && fmtDate(s.date) === fmtDate(d));
                  return (
                    <div key={di} onClick={() => !takenByOther && updateSlot(i, "date", d)} style={{
                      flexShrink: 0, width: 62,
                      background: sel ? SLOT_COLORS[i] : takenByOther ? "#0A0A0F" : "#0D0D15",
                      border: `1px solid ${sel ? SLOT_COLORS[i] : takenByOther ? "#111" : "#1E1E2E"}`,
                      borderRadius: 12, padding: "11px 6px", textAlign: "center",
                      cursor: takenByOther ? "not-allowed" : "pointer",
                      opacity: takenByOther ? 0.3 : 1,
                      transition: "all 0.15s"
                    }}>
                      <p style={{ margin: "0 0 3px", fontSize: 9, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase" }}>
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>{d.getDate()}</p>
                      <p style={{ margin: 0, fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>
                Time <span style={{ color: "#FF6B35" }}>*</span>
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                {TIMES.map(t => {
                  const sel = slot.time === t;
                  const takenByOther = slots.some((s, si) => si !== i && s.date && slot.date && fmtDate(s.date) === fmtDate(slot.date) && s.time === t);
                  return (
                    <div key={t} onClick={() => !takenByOther && updateSlot(i, "time", t)} style={{
                      background: sel ? SLOT_COLORS[i] : "#0A0A0F",
                      border: `1px solid ${sel ? SLOT_COLORS[i] : "#1E1E2E"}`,
                      borderRadius: 9, padding: "10px 4px",
                      textAlign: "center", fontSize: 11,
                      fontWeight: sel ? 700 : 400,
                      color: sel ? "#0A0A0F" : takenByOther ? "#333" : "#C8C4BC",
                      cursor: takenByOther ? "not-allowed" : "pointer",
                      opacity: takenByOther ? 0.4 : 1
                    }}>{t}</div>
                  );
                })}
              </div>

              {/* Preview of this slot */}
              {slot.date && slot.time && (
                <div style={{ marginTop: 16, background: `${SLOT_COLORS[i]}0D`, border: `1px solid ${SLOT_COLORS[i]}22`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>{SLOT_LABELS[i]} will read:</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: SLOT_COLORS[i] }}>{fmtDate(slot.date)} · {slot.time}</span>
                </div>
              )}
            </div>
          ))}

          {/* All slots summary */}
          {validSlots.length > 0 && (
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
              <p style={{ margin: "0 0 14px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.2em" }}>What Destiny Will See</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slots.map((slot, i) => slot.date && slot.time ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0A0A0F", border: `1px solid ${SLOT_COLORS[i]}22`, borderRadius: 10, padding: "11px 14px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: SLOT_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#888", flex: 1 }}>{SLOT_LABELS[i]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: SLOT_COLORS[i] }}>{fmtDate(slot.date)} · {slot.time}</span>
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Send button */}
          <button
            disabled={!canSend}
            onClick={() => { setSent(true); setView("client"); setScreen("message"); }}
            style={{
              width: "100%",
              background: canSend ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
              border: "none", borderRadius: 12,
              color: canSend ? "#fff" : "#444",
              fontSize: 15, fontWeight: 700, padding: "17px",
              cursor: canSend ? "pointer" : "not-allowed",
              boxShadow: canSend ? "0 6px 32px #00C2FF22" : "none",
              transition: "all 0.2s"
            }}>
            📤 Send {validSlots.length} Option{validSlots.length !== 1 ? "s" : ""} to Destiny
          </button>
          <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 11, color: "#555" }}>
            Destiny gets a text + email with all options to pick from
          </p>
        </div>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* CLIENT SIDE                             */}
      {/* ═══════════════════════════════════════ */}
      {view === "client" && (
        <div>
          {/* Sub-nav */}
          {!finalScreen && (
            <div style={{ background: "#0D0D15", borderBottom: "1px solid #1E1E2E", padding: "8px 20px", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["text", "email"].map(t => (
                <button key={t} onClick={() => { setMessageType(t); setScreen("message"); }} style={{
                  background: messageType === t && screen === "message" ? "#1A1A2E" : "transparent",
                  border: `1px solid ${messageType === t && screen === "message" ? "#00C2FF44" : "#1E1E2E"}`,
                  borderRadius: 7, color: messageType === t && screen === "message" ? "#00C2FF" : "#555",
                  fontSize: 11, fontWeight: 700, padding: "6px 13px", cursor: "pointer"
                }}>{t === "text" ? "📱 Text" : "✉️ Email"}</button>
              ))}
              <button onClick={() => setScreen("pick")} style={{
                background: screen === "pick" || screen === "requestNew" ? "#1A1A2E" : "transparent",
                border: `1px solid ${screen === "pick" || screen === "requestNew" ? "#A259FF44" : "#1E1E2E"}`,
                borderRadius: 7, color: screen === "pick" || screen === "requestNew" ? "#A259FF" : "#555",
                fontSize: 11, fontWeight: 700, padding: "6px 13px", cursor: "pointer"
              }}>🔗 Booking Page</button>
            </div>
          )}

          {/* ── TEXT MESSAGE ── */}
          {screen === "message" && messageType === "text" && !finalScreen && (
            <div style={{ maxWidth: 400, margin: "32px auto", padding: "0 24px" }}>
              <p style={{ fontSize: 11, color: "#555", textAlign: "center", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 18 }}>iPhone — Messages</p>
              <div style={{ background: "#1A1A1A", borderRadius: 36, border: "2px solid #2A2A2A", padding: "20px 0 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0 22px 12px", borderBottom: "1px solid #222" }}>
                  <span style={{ fontSize: 12, color: "#888" }}>9:41 AM</span>
                  <span style={{ fontSize: 12, color: "#888" }}>●●●</span>
                </div>
                <div style={{ textAlign: "center", padding: "14px 0 10px", borderBottom: "1px solid #1E1E1E" }}>
                  <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", margin: "0 auto 7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>GlossIO Booking</p>
                </div>
                <div style={{ padding: "18px 16px" }}>
                  <div style={{ alignSelf: "flex-start", maxWidth: "90%" }}>
                    <div style={{ background: "#1A2A3A", border: "1px solid #00C2FF22", borderRadius: "16px 16px 16px 4px", padding: "12px 14px" }}>
                      <p style={{ margin: "0 0 10px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.6 }}>
                        Hey Destiny 👋 I need to reschedule your <strong style={{ color: "#F0EDE8" }}>Exterior Wash</strong>. I've got <strong style={{ color: "#F0EDE8" }}>{builtSlots.length} open slots</strong> — pick what works best for you:
                      </p>
                      {/* Slot pills */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                        {builtSlots.map((slot, i) => (
                          <div key={i} style={{ background: "#0A0A0F", border: `1px solid ${SLOT_COLORS[i]}33`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: SLOT_COLORS[i], flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: SLOT_COLORS[i], fontWeight: 700 }}>{fmtDate(slot.date)} · {slot.time}</span>
                          </div>
                        ))}
                      </div>
                      <div onClick={() => setScreen("pick")} style={{ background: "linear-gradient(135deg,#00C2FF,#A259FF)", borderRadius: 10, padding: "10px 14px", textAlign: "center", cursor: "pointer" }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>👉 Pick Your Time Slot</p>
                        <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.65)" }}>glossio.app/booking/destiny-123</p>
                      </div>
                    </div>
                    <p style={{ margin: "4px 0 0 4px", fontSize: 10, color: "#555" }}>Today 9:41 AM</p>
                  </div>
                </div>
              </div>
              <p style={{ textAlign: "center", marginTop: 18, fontSize: 12, color: "#555" }}>Tap <strong style={{ color: "#00C2FF" }}>Pick Your Time Slot</strong> to see booking page</p>
            </div>
          )}

          {/* ── EMAIL ── */}
          {screen === "message" && messageType === "email" && !finalScreen && (
            <div style={{ maxWidth: 540, margin: "32px auto", padding: "0 24px" }}>
              <p style={{ fontSize: 11, color: "#555", textAlign: "center", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 18 }}>Email Inbox</p>
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}>
                <div style={{ background: "#0D0D15", borderBottom: "1px solid #1E1E2E", padding: "18px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>GlossIO · Carlos Detail Co.</p>
                        <p style={{ margin: 0, fontSize: 11, color: "#555" }}>bookings@glossio.app</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "#555" }}>9:41 AM</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>📅 Pick your new appointment time — {builtSlots.length} options available</p>
                </div>
                <div style={{ padding: "24px 24px 28px" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>Hey Destiny 👋</p>
                  <p style={{ fontSize: 13, color: "#C8C4BC", lineHeight: 1.8, margin: "0 0 22px" }}>
                    Carlos needs to reschedule your <strong>Exterior Wash</strong>. He's picked out <strong>{builtSlots.length} open time slots</strong> for you — just tap the one that works best and you're all set.
                  </p>
                  {/* Slot option cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
                    {builtSlots.map((slot, i) => (
                      <div key={i} style={{ background: "#0A0A0F", border: `1px solid ${SLOT_COLORS[i]}33`, borderLeft: `3px solid ${SLOT_COLORS[i]}`, borderRadius: 10, padding: "13px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 9, height: 9, borderRadius: "50%", background: SLOT_COLORS[i] }} />
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#F0EDE8" }}>{fmtDate(slot.date)} · {slot.time}</span>
                        </div>
                        <span style={{ fontSize: 11, color: SLOT_COLORS[i] }}>{SLOT_LABELS[i]}</span>
                      </div>
                    ))}
                  </div>
                  <div onClick={() => setScreen("pick")} style={{ background: "linear-gradient(135deg,#00C2FF,#A259FF)", borderRadius: 10, padding: "14px", textAlign: "center", cursor: "pointer", marginBottom: 20 }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff" }}>👉 Pick My Time Slot</p>
                  </div>
                  <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, borderTop: "1px solid #1E1E2E", paddingTop: 18 }}>
                    None of these work? You can also request a custom time from the booking page.<br />
                    Questions? Text Carlos at <span style={{ color: "#00C2FF" }}>(239) 555-0100</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── PICK A SLOT PAGE ── */}
          {screen === "pick" && !finalScreen && (
            <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 60px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, background: "linear-gradient(90deg,#00C2FF,#A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
                <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>Booking Update</span>
              </div>

              <div style={{ background: "#FFD60A0D", border: "1px solid #FFD60A33", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🕐</span>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700, color: "#FFD60A" }}>Carlos proposed {builtSlots.length} new time{builtSlots.length > 1 ? "s" : ""}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Pick the one that works best for you. Still doesn't work? Request your own below.</p>
                </div>
              </div>

              {/* Original */}
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "13px 16px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Original</span>
                <span style={{ fontSize: 13, color: "#666", textDecoration: "line-through" }}>Tue, Mar 17 · 2:00 PM</span>
              </div>

              {/* Slot cards — tap to select */}
              <p style={{ fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", margin: "0 0 12px" }}>Choose a Time</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {builtSlots.map((slot, i) => {
                  const sel = selectedSlot === i;
                  return (
                    <div key={i} onClick={() => setSelectedSlot(sel ? null : i)} style={{
                      background: sel ? `${SLOT_COLORS[i]}12` : "#111118",
                      border: `2px solid ${sel ? SLOT_COLORS[i] : "#1E1E2E"}`,
                      borderRadius: 14, padding: "18px 20px",
                      display: "flex", alignItems: "center", gap: 14,
                      cursor: "pointer", transition: "all 0.2s"
                    }}>
                      {/* Radio circle */}
                      <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${sel ? SLOT_COLORS[i] : "#2A2A3E"}`, background: sel ? SLOT_COLORS[i] : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                        {sel && <span style={{ fontSize: 12, color: "#0A0A0F", fontWeight: 700 }}>✓</span>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700, color: sel ? SLOT_COLORS[i] : "#F0EDE8" }}>
                          {fmtDate(slot.date)}
                        </p>
                        <p style={{ margin: 0, fontSize: 13, color: sel ? SLOT_COLORS[i] : "#888" }}>{slot.time}</p>
                      </div>
                      <span style={{ fontSize: 10, color: sel ? SLOT_COLORS[i] : "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{SLOT_LABELS[i]}</span>
                    </div>
                  );
                })}
              </div>

              {/* Confirm selection */}
              <button
                disabled={selectedSlot === null}
                onClick={() => setFinalScreen("accepted")}
                style={{
                  width: "100%",
                  background: selectedSlot !== null ? `linear-gradient(135deg, ${SLOT_COLORS[selectedSlot]}, #A259FF)` : "#1A1A2E",
                  border: "none", borderRadius: 12,
                  color: selectedSlot !== null ? "#fff" : "#444",
                  fontSize: 15, fontWeight: 700, padding: "17px",
                  cursor: selectedSlot !== null ? "pointer" : "not-allowed",
                  marginBottom: 12, transition: "all 0.2s"
                }}>
                {selectedSlot !== null
                  ? `✓ Confirm — ${fmtDate(builtSlots[selectedSlot].date)} at ${builtSlots[selectedSlot].time}`
                  : "Select a time slot above"}
              </button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
                <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
                <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.15em", textTransform: "uppercase" }}>None of these work?</span>
                <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
              </div>

              <button onClick={() => setScreen("requestNew")} style={{
                width: "100%", background: "transparent",
                border: "1px solid #2A2A3E", borderRadius: 12,
                color: "#888", fontSize: 13, fontWeight: 600, padding: "14px",
                cursor: "pointer"
              }}>🕐 Request a Different Time</button>
            </div>
          )}

          {/* ── REQUEST CUSTOM TIME ── */}
          {screen === "requestNew" && !finalScreen && (
            <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 60px" }}>
              <button onClick={() => setScreen("pick")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Request Your Own Time</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 26px" }}>Pick a date and time that works for you. Carlos will review and confirm.</p>

              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Date <span style={{ color: "#FF6B35" }}>*</span></p>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
                {getDates().map((d, i) => {
                  const sel = newDate && fmtDate(newDate) === fmtDate(d);
                  return (
                    <div key={i} onClick={() => setNewDate(d)} style={{ flexShrink: 0, width: 62, background: sel ? "#00C2FF" : "#111118", border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`, borderRadius: 12, padding: "11px 6px", textAlign: "center", cursor: "pointer" }}>
                      <p style={{ margin: "0 0 3px", fontSize: 9, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                      <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>{d.getDate()}</p>
                      <p style={{ margin: 0, fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
                    </div>
                  );
                })}
              </div>

              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Time <span style={{ color: "#FF6B35" }}>*</span></p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 28 }}>
                {TIMES.map(t => {
                  const sel = newTime === t;
                  return <div key={t} onClick={() => setNewTime(t)} style={{ background: sel ? "#00C2FF" : "#111118", border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`, borderRadius: 9, padding: "10px 4px", textAlign: "center", fontSize: 12, fontWeight: sel ? 700 : 400, color: sel ? "#0A0A0F" : "#C8C4BC", cursor: "pointer" }}>{t}</div>;
                })}
              </div>

              <button disabled={!newDate || !newTime} onClick={() => setFinalScreen("submitted")} style={{
                width: "100%",
                background: newDate && newTime ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                border: "none", borderRadius: 12,
                color: newDate && newTime ? "#fff" : "#444",
                fontSize: 15, fontWeight: 700, padding: "16px",
                cursor: newDate && newTime ? "pointer" : "not-allowed"
              }}>Send My Preferred Time to Carlos →</button>
            </div>
          )}

          {/* ── ACCEPTED ── */}
          {finalScreen === "accepted" && selectedSlot !== null && (
            <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#00E5A018", border: "2px solid #00E5A055", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 24 }}>✓</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>You're all set, Destiny!</h1>
              <p style={{ fontSize: 14, color: "#777", margin: "0 0 24px", maxWidth: 300, lineHeight: 1.7 }}>Your appointment is locked in. Carlos's dashboard just flipped to 🔵 Confirmed.</p>
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 24px", width: "100%", maxWidth: 340, marginBottom: 18 }}>
                <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>💧 Exterior Wash · $49.99</p>
                <p style={{ margin: "0 0 10px", fontSize: 13, color: "#888" }}>2022 Honda Civic (White)</p>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: SLOT_COLORS[selectedSlot] }}>
                  📅 {fmtDate(builtSlots[selectedSlot].date)} · {builtSlots[selectedSlot].time}
                </p>
              </div>
              <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 18px", maxWidth: 340 }}>
                <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>💡 No payment due until the job is complete. Carlos will text you a reminder the day before.</p>
              </div>
            </div>
          )}

          {/* ── SUBMITTED CUSTOM ── */}
          {finalScreen === "submitted" && (
            <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#FFD60A14", border: "2px solid #FFD60A44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 24 }}>🕐</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Request Sent!</h1>
              <p style={{ fontSize: 14, color: "#777", margin: "0 0 24px", maxWidth: 300, lineHeight: 1.7 }}>
                Carlos received your request for <strong style={{ color: "#F0EDE8" }}>{newDate ? fmtDate(newDate) : ""} at {newTime}</strong>. He'll confirm shortly.
              </p>
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 24px", maxWidth: 340 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>💧 Exterior Wash · $49.99</p>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#888" }}>Requested: {newDate ? fmtDate(newDate) : ""} · {newTime}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#FFD60A" }}>⏳ Pending Carlos's confirmation</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
