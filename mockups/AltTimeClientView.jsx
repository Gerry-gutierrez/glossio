import { useState } from "react";

// ── What this simulates ──
// 1. Carlos hits "Suggest Alt Time" on his dashboard
// 2. Client receives a text message AND email
// 3. Client taps the link → lands on this response screen
// 4. Client can Accept or Request Different Time
// 5. Appt stays PENDING on Carlos's board until client responds

const BOOKING = {
  clientName: "Destiny Walton",
  service: "Exterior Wash",
  serviceIcon: "💧",
  serviceColor: "#00C2FF",
  price: "49.99",
  vehicle: "2022 Honda Civic (White)",
  originalDate: "Tue, Mar 17",
  originalTime: "2:00 PM",
  altDate: "Wed, Mar 18",
  altTime: "11:00 AM",
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

export default function AltTimeClientView() {
  const [screen, setScreen] = useState("message"); // message | response | requestNew | accepted | submitted
  const [messageType, setMessageType] = useState("text"); // text | email
  const [newDate, setNewDate] = useState(null);
  const [newTime, setNewTime] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8" }}>

      {/* ── DEMO SWITCHER ── */}
      <div style={{
        background: "#111118", borderBottom: "1px solid #1E1E2E",
        padding: "10px 20px", display: "flex", alignItems: "center",
        justifyContent: "space-between", flexWrap: "wrap", gap: 10
      }}>
        <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: "0.1em" }}>
          📱 SIMULATING CLIENT EXPERIENCE — Carlos suggested an alt time
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {["text", "email"].map(t => (
            <button key={t} onClick={() => { setMessageType(t); setScreen("message"); }} style={{
              background: messageType === t && screen === "message" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#0A0A0F",
              border: `1px solid ${messageType === t && screen === "message" ? "transparent" : "#2A2A3E"}`,
              borderRadius: 7, color: messageType === t && screen === "message" ? "#fff" : "#666",
              fontSize: 11, fontWeight: 700, padding: "6px 14px", cursor: "pointer"
            }}>{t === "text" ? "📱 Text Message" : "✉️ Email"}</button>
          ))}
          <button onClick={() => setScreen("response")} style={{
            background: screen === "response" || screen === "requestNew" ? "linear-gradient(135deg,#A259FF,#FF6B35)" : "#0A0A0F",
            border: "1px solid #2A2A3E", borderRadius: 7,
            color: screen === "response" || screen === "requestNew" ? "#fff" : "#666",
            fontSize: 11, fontWeight: 700, padding: "6px 14px", cursor: "pointer"
          }}>🔗 Booking Response Page</button>
        </div>
      </div>

      {/* ─────────────────────────────────────── */}
      {/* TEXT MESSAGE VIEW                       */}
      {/* ─────────────────────────────────────── */}
      {screen === "message" && messageType === "text" && (
        <div style={{ maxWidth: 400, margin: "40px auto", padding: "0 24px" }}>
          <p style={{ fontSize: 11, color: "#555", textAlign: "center", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            iPhone — Messages
          </p>

          {/* Phone frame */}
          <div style={{
            background: "#1A1A1A", borderRadius: 40,
            border: "2px solid #2A2A2A",
            padding: "20px 0 32px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
          }}>
            {/* Status bar */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0 24px 14px", borderBottom: "1px solid #2A2A2A" }}>
              <span style={{ fontSize: 12, color: "#888" }}>9:41 AM</span>
              <div style={{ width: 80, height: 10, background: "#2A2A2A", borderRadius: 5 }} />
              <span style={{ fontSize: 12, color: "#888" }}>●●●</span>
            </div>

            {/* Contact header */}
            <div style={{ textAlign: "center", padding: "16px 0 12px", borderBottom: "1px solid #1E1E1E" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", margin: "0 auto 8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✨</div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F0EDE8" }}>GlossIO Booking</p>
              <p style={{ margin: 0, fontSize: 11, color: "#555" }}>+1 (239) 555-0100</p>
            </div>

            {/* Messages */}
            <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Previous confirmation message */}
              <div style={{ alignSelf: "flex-start", maxWidth: "80%" }}>
                <div style={{ background: "#2A2A2A", borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC", lineHeight: 1.5 }}>
                    Hi Destiny! Your booking request for <strong>Exterior Wash</strong> on Tue, Mar 17 at 2:00 PM was received. Carlos will confirm shortly.
                  </p>
                </div>
                <p style={{ margin: "4px 0 0 4px", fontSize: 10, color: "#555" }}>Yesterday 2:14 PM</p>
              </div>

              {/* Alt time message — the new one */}
              <div style={{ alignSelf: "flex-start", maxWidth: "85%" }}>
                <div style={{
                  background: "#1A2A3A",
                  border: "1px solid #00C2FF33",
                  borderRadius: "18px 18px 18px 4px", padding: "12px 14px"
                }}>
                  <p style={{ margin: "0 0 10px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.6 }}>
                    Hey Destiny 👋 Carlos here! I need to move your <strong style={{ color: "#F0EDE8" }}>Exterior Wash</strong> appointment.
                  </p>
                  <div style={{
                    background: "#0A0A0F", borderRadius: 10,
                    border: "1px solid #1E1E2E", padding: "10px 12px", marginBottom: 10
                  }}>
                    <p style={{ margin: "0 0 6px", fontSize: 11, color: "#555" }}>
                      <span style={{ textDecoration: "line-through" }}>Tue, Mar 17 · 2:00 PM</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#00C2FF" }}>
                      Wed, Mar 18 · 11:00 AM ✓
                    </p>
                  </div>
                  <p style={{ margin: "0 0 12px", fontSize: 12, color: "#888", lineHeight: 1.5 }}>
                    Does this work for you? Tap below to accept or request a different time.
                  </p>
                  {/* CTA link */}
                  <div
                    onClick={() => setScreen("response")}
                    style={{
                      background: "linear-gradient(135deg,#00C2FF,#A259FF)",
                      borderRadius: 10, padding: "10px 14px",
                      textAlign: "center", cursor: "pointer"
                    }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>
                      👉 Respond to Booking
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.7)" }}>
                      glossio.app/booking/destiny-123
                    </p>
                  </div>
                </div>
                <p style={{ margin: "4px 0 0 4px", fontSize: 10, color: "#555" }}>Today 9:38 AM</p>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#555" }}>
            Tap <strong style={{ color: "#00C2FF" }}>Respond to Booking</strong> to see the response page
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* EMAIL VIEW                              */}
      {/* ─────────────────────────────────────── */}
      {screen === "message" && messageType === "email" && (
        <div style={{ maxWidth: 540, margin: "40px auto", padding: "0 24px" }}>
          <p style={{ fontSize: 11, color: "#555", textAlign: "center", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 20 }}>
            Email Inbox
          </p>

          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 16, overflow: "hidden",
            boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
          }}>
            {/* Email header */}
            <div style={{ background: "#0D0D15", borderBottom: "1px solid #1E1E2E", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
                  <div>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>GlossIO · Carlos Detail Co.</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#555" }}>bookings@glossio.app</p>
                  </div>
                </div>
                <span style={{ fontSize: 11, color: "#555" }}>9:38 AM</span>
              </div>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#F0EDE8" }}>
                📅 Your appointment time has changed
              </p>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: "#666" }}>To: destiny@email.com</p>
            </div>

            {/* Email body */}
            <div style={{ padding: "28px 28px 32px" }}>
              <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px" }}>Hey Destiny 👋</p>
              <p style={{ fontSize: 13, color: "#C8C4BC", lineHeight: 1.8, margin: "0 0 24px" }}>
                Carlos needs to make a small change to your upcoming appointment. Here are the updated details:
              </p>

              {/* Before / After */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Original Time</p>
                  <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888", textDecoration: "line-through" }}>Tue, Mar 17</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#888", textDecoration: "line-through" }}>2:00 PM</p>
                </div>
                <div style={{ background: "#00C2FF0A", border: "1px solid #00C2FF33", borderRadius: 12, padding: "16px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: 10, color: "#00C2FF", textTransform: "uppercase", letterSpacing: "0.15em" }}>New Proposed Time</p>
                  <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#F0EDE8" }}>Wed, Mar 18</p>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#00C2FF" }}>11:00 AM ✓</p>
                </div>
              </div>

              {/* Service summary */}
              <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>Exterior Wash</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#888" }}>2022 Honda Civic · $49.99</p>
                </div>
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                <div
                  onClick={() => setScreen("response")}
                  style={{
                    flex: 1, background: "linear-gradient(135deg,#00C2FF,#A259FF)",
                    borderRadius: 10, padding: "13px", textAlign: "center",
                    cursor: "pointer"
                  }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>✓ Accept New Time</p>
                </div>
                <div
                  onClick={() => setScreen("response")}
                  style={{
                    flex: 1, background: "#111118",
                    border: "1px solid #2A2A3E",
                    borderRadius: 10, padding: "13px", textAlign: "center",
                    cursor: "pointer"
                  }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#888" }}>🕐 Request Different Time</p>
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#555", lineHeight: 1.7, borderTop: "1px solid #1E1E2E", paddingTop: 20 }}>
                Questions? Reply to this email or text Carlos at <span style={{ color: "#00C2FF" }}>(239) 555-0100</span>.<br />
                Powered by <span style={{ color: "#00C2FF" }}>GlossIO</span>
              </p>
            </div>
          </div>

          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "#555" }}>
            Tap either button to see the response page
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* RESPONSE PAGE (link from text/email)   */}
      {/* ─────────────────────────────────────── */}
      {screen === "response" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 60px" }}>
          {/* GlossIO header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, background: "linear-gradient(90deg,#00C2FF,#A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
            <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.12em", textTransform: "uppercase" }}>Booking Update</span>
          </div>

          {/* Notice banner */}
          <div style={{ background: "#FFD60A0D", border: "1px solid #FFD60A33", borderRadius: 14, padding: "16px 18px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🕐</span>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: "#FFD60A" }}>Carlos proposed a new time</p>
              <p style={{ margin: 0, fontSize: 12, color: "#888", lineHeight: 1.6 }}>Your original slot wasn't available. Please accept or request a different time below.</p>
            </div>
          </div>

          {/* Before / After cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>Your Original</p>
              <p style={{ margin: "0 0 3px", fontSize: 13, color: "#666", textDecoration: "line-through" }}>{BOOKING.originalDate}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#666", textDecoration: "line-through" }}>{BOOKING.originalTime}</p>
            </div>
            <div style={{ background: "#00C2FF0A", border: "1px solid #00C2FF33", borderRadius: 12, padding: "16px" }}>
              <p style={{ margin: "0 0 8px", fontSize: 10, color: "#00C2FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>Carlos Proposes</p>
              <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700, color: "#F0EDE8" }}>{BOOKING.altDate}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#00C2FF" }}>{BOOKING.altTime}</p>
            </div>
          </div>

          {/* Booking details */}
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 20px", marginBottom: 28 }}>
            <p style={{ margin: "0 0 14px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.2em" }}>Your Booking</p>
            {[
              { label: "Client", value: BOOKING.clientName },
              { label: "Service", value: `${BOOKING.serviceIcon} ${BOOKING.service} · $${BOOKING.price}` },
              { label: "Vehicle", value: BOOKING.vehicle },
            ].map((row, i, arr) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 10, marginBottom: 10, borderBottom: i < arr.length - 1 ? "1px solid #1A1A2E" : "none" }}>
                <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</span>
                <span style={{ fontSize: 13, color: "#C8C4BC", textAlign: "right" }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Response buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setScreen("accepted")}
              style={{
                width: "100%", background: "linear-gradient(135deg,#00C2FF,#A259FF)",
                border: "none", borderRadius: 13, color: "#fff",
                fontSize: 15, fontWeight: 700, padding: "17px",
                cursor: "pointer", boxShadow: "0 6px 32px #00C2FF33"
              }}>
              ✓ Yes, {BOOKING.altDate} at {BOOKING.altTime} works for me
            </button>
            <button
              onClick={() => setScreen("requestNew")}
              style={{
                width: "100%", background: "#111118",
                border: "1px solid #2A2A3E",
                borderRadius: 13, color: "#888",
                fontSize: 14, fontWeight: 600, padding: "15px",
                cursor: "pointer"
              }}>
              🕐 That doesn't work — request a different time
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* REQUEST DIFFERENT TIME                 */}
      {/* ─────────────────────────────────────── */}
      {screen === "requestNew" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "36px 24px 60px" }}>
          <button onClick={() => setScreen("response")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Back</button>

          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Request a Different Time</h2>
          <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.6 }}>Pick a date and time that works for you. Carlos will review and confirm.</p>

          <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Preferred Date <span style={{ color: "#FF6B35" }}>*</span></p>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 22 }}>
            {getDates().map((d, i) => {
              const sel = newDate && fmtDate(newDate) === fmtDate(d);
              return (
                <div key={i} onClick={() => setNewDate(d)} style={{
                  flexShrink: 0, width: 62,
                  background: sel ? "#00C2FF" : "#111118",
                  border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`,
                  borderRadius: 12, padding: "11px 6px", textAlign: "center", cursor: "pointer"
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

          <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Preferred Time <span style={{ color: "#FF6B35" }}>*</span></p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 28 }}>
            {TIMES.map(t => {
              const sel = newTime === t;
              return (
                <div key={t} onClick={() => setNewTime(t)} style={{
                  background: sel ? "#00C2FF" : "#111118",
                  border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`,
                  borderRadius: 9, padding: "10px 4px",
                  textAlign: "center", fontSize: 12,
                  fontWeight: sel ? 700 : 400,
                  color: sel ? "#0A0A0F" : "#C8C4BC", cursor: "pointer"
                }}>{t}</div>
              );
            })}
          </div>

          <button
            disabled={!newDate || !newTime}
            onClick={() => setScreen("submitted")}
            style={{
              width: "100%",
              background: newDate && newTime ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
              border: "none", borderRadius: 12, color: newDate && newTime ? "#fff" : "#444",
              fontSize: 15, fontWeight: 700, padding: "16px",
              cursor: newDate && newTime ? "pointer" : "not-allowed"
            }}>
            Send My Preferred Time to Carlos →
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* ACCEPTED SCREEN                        */}
      {/* ─────────────────────────────────────── */}
      {screen === "accepted" && (
        <div style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#00E5A018", border: "2px solid #00E5A055", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 24, boxShadow: "0 0 40px #00E5A014" }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>You're all set, Destiny!</h1>
          <p style={{ fontSize: 14, color: "#777", margin: "0 0 28px", maxWidth: 320, lineHeight: 1.7 }}>
            Your appointment is confirmed for the new time. Carlos will see your acceptance right away.
          </p>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 24px", width: "100%", maxWidth: 340, marginBottom: 20 }}>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>💧 Exterior Wash · $49.99</p>
            <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>2022 Honda Civic (White)</p>
            <p style={{ margin: "0 0 12px", fontSize: 13, color: "#00C2FF", fontWeight: 700 }}>
              📅 {BOOKING.altDate} · {BOOKING.altTime}
            </p>
            <div style={{ borderTop: "1px solid #1E1E2E", paddingTop: 12 }}>
              <p style={{ margin: 0, fontSize: 12, color: "#555" }}>Carlos Detail Co. · (239) 555-0100</p>
            </div>
          </div>
          <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 18px", maxWidth: 340 }}>
            <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>
              💡 On Carlos's dashboard this appointment just flipped from 🟡 Pending → 🔵 Confirmed automatically.
            </p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* SUBMITTED NEW TIME REQUEST             */}
      {/* ─────────────────────────────────────── */}
      {screen === "submitted" && (
        <div style={{ minHeight: "90vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#FFD60A14", border: "2px solid #FFD60A44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 24 }}>🕐</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Request Sent!</h1>
          <p style={{ fontSize: 14, color: "#777", margin: "0 0 28px", maxWidth: 320, lineHeight: 1.7 }}>
            Carlos received your preferred time of <strong style={{ color: "#F0EDE8" }}>{newDate ? fmtDate(newDate) : ""} at {newTime}</strong>. He'll confirm shortly.
          </p>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 24px", width: "100%", maxWidth: 340 }}>
            <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700 }}>💧 Exterior Wash · $49.99</p>
            <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Requested: {newDate ? fmtDate(newDate) : ""} · {newTime}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#FFD60A" }}>⏳ Pending Carlos's confirmation</p>
          </div>
        </div>
      )}
    </div>
  );
}
