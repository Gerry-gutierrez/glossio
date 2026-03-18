import { useState } from "react";

function SavedToast({ show }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00E5A0", borderRadius: 10, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,229,160,0.3)", zIndex: 999 }}>
      <span style={{ fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0F" }}>Changes Saved!</span>
    </div>
  );
}

function Toggle({ on, onToggle, color = "#00C2FF" }) {
  return (
    <div onClick={onToggle} style={{ width: 52, height: 28, borderRadius: 14, background: on ? color : "#2A2A3E", position: "relative", cursor: "pointer", transition: "all 0.3s", flexShrink: 0 }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: on ? 27 : 3, transition: "all 0.3s", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
    </div>
  );
}

function ChannelPicker({ sms, email, onSmsToggle, onEmailToggle, disabled }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 14, opacity: disabled ? 0.35 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <div onClick={onSmsToggle} style={{ flex: 1, background: sms ? "#00C2FF15" : "#0A0A0F", border: `1px solid ${sms ? "#00C2FF55" : "#2A2A3E"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
        <span style={{ fontSize: 18 }}>📱</span>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: sms ? "#00C2FF" : "#666" }}>Text (SMS)</p>
          <p style={{ margin: 0, fontSize: 10, color: "#555" }}>To your phone</p>
        </div>
        <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: sms ? "#00C2FF" : "transparent", border: `2px solid ${sms ? "#00C2FF" : "#2A2A3E"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {sms && <span style={{ fontSize: 9, color: "#fff", fontWeight: 900 }}>✓</span>}
        </div>
      </div>
      <div onClick={onEmailToggle} style={{ flex: 1, background: email ? "#A259FF15" : "#0A0A0F", border: `1px solid ${email ? "#A259FF55" : "#2A2A3E"}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s" }}>
        <span style={{ fontSize: 18 }}>✉️</span>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: email ? "#A259FF" : "#666" }}>Email</p>
          <p style={{ margin: 0, fontSize: 10, color: "#555" }}>To your inbox</p>
        </div>
        <div style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: email ? "#A259FF" : "transparent", border: `2px solid ${email ? "#A259FF" : "#2A2A3E"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {email && <span style={{ fontSize: 9, color: "#fff", fontWeight: 900 }}>✓</span>}
        </div>
      </div>
    </div>
  );
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function Notifications() {
  const [screen, setScreen] = useState("main");
  const [toast, setToast] = useState(false);

  // New Booking Alerts
  const [bookingOn, setBookingOn] = useState(true);
  const [bookingSms, setBookingSms] = useState(true);
  const [bookingEmail, setBookingEmail] = useState(true);

  // Cancellation Alerts
  const [cancelOn, setCancelOn] = useState(true);
  const [cancelSms, setCancelSms] = useState(true);
  const [cancelEmail, setCancelEmail] = useState(false);

  // 24hr Reminder
  const [reminderOn, setReminderOn] = useState(true);

  // Weekly Summary
  const [summaryOn, setSummaryOn] = useState(true);
  const [summaryDay, setSummaryDay] = useState("Monday");
  const [summaryIncludes, setSummaryIncludes] = useState({
    upcoming: true, revenue: true, newClients: true, cancellations: true
  });

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const toggleSummaryItem = (key) => setSummaryIncludes(s => ({ ...s, [key]: !s[key] }));

  const summaryItemCount = Object.values(summaryIncludes).filter(Boolean).length;

  const channelLabel = (sms, email) => {
    if (sms && email) return "SMS + Email";
    if (sms) return "SMS only";
    if (email) return "Email only";
    return "No channel selected";
  };

  // ── MAIN ──
  if (screen === "main") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Settings</p>
        <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Notifications</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 32px", lineHeight: 1.7 }}>Choose how and when GlossIO notifies you.</p>

        {[
          {
            id: "booking", icon: "🔔", color: "#00C2FF",
            label: "New Booking Alerts",
            desc: bookingOn ? `On — ${channelLabel(bookingSms, bookingEmail)}` : "Off — you won't be notified of new bookings",
            badge: bookingOn ? "On" : "Off", badgeOn: bookingOn
          },
          {
            id: "cancel", icon: "🚫", color: "#FF3366",
            label: "Cancellation Alerts",
            desc: cancelOn ? `On — ${channelLabel(cancelSms, cancelEmail)}` : "Off — you won't be notified of cancellations",
            badge: cancelOn ? "On" : "Off", badgeOn: cancelOn
          },
          {
            id: "reminder", icon: "⏰", color: "#FFD60A",
            label: "24hr Client Reminder",
            desc: reminderOn ? "On — clients get a text reminder 24hrs before their appointment" : "Off — no automatic reminders sent to clients",
            badge: reminderOn ? "On" : "Off", badgeOn: reminderOn
          },
          {
            id: "summary", icon: "📊", color: "#00E5A0",
            label: "Weekly Email Summary",
            desc: summaryOn ? `On — sent every ${summaryDay}, ${summaryItemCount} item${summaryItemCount !== 1 ? "s" : ""} included` : "Off — no weekly summary emails",
            badge: summaryOn ? "On" : "Off", badgeOn: summaryOn
          },
        ].map(item => (
          <div key={item.id} onClick={() => setScreen(item.id)} style={{ background: "#111118", border: "1px solid #1E1E2E", borderLeft: `3px solid ${item.color}`, borderRadius: 16, padding: "20px 24px", marginBottom: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 46, height: 46, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{item.label}</p>
                  <span style={{ fontSize: 10, background: item.badgeOn ? `${item.color}20` : "#1A1A2E", border: `1px solid ${item.badgeOn ? item.color + "44" : "#2A2A3E"}`, color: item.badgeOn ? item.color : "#555", borderRadius: 20, padding: "2px 10px", fontWeight: 700 }}>{item.badge}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{item.desc}</p>
              </div>
            </div>
            <span style={{ fontSize: 18, color: "#444", flexShrink: 0 }}>›</span>
          </div>
        ))}
      </div>
      <SavedToast show={toast} />
    </div>
  );

  // ── NEW BOOKING ALERTS ──
  if (screen === "booking") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Notifications</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>New Booking Alerts</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Get notified the moment a client submits a new booking request.</p>

        <div style={{ background: "#111118", border: "1px solid #00C2FF22", borderLeft: "3px solid #00C2FF", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: bookingOn ? 20 : 0 }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700 }}>New Booking Alerts</p>
              <p style={{ margin: 0, fontSize: 12, color: bookingOn ? "#00C2FF" : "#555" }}>{bookingOn ? "Currently enabled" : "Currently disabled"}</p>
            </div>
            <Toggle on={bookingOn} onToggle={() => setBookingOn(o => !o)} color="#00C2FF" />
          </div>

          {bookingOn && (
            <>
              <div style={{ height: 1, background: "#1E1E2E", marginBottom: 16 }} />
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>How would you like to be notified?</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Select one or both — at least one must be on.</p>
              <ChannelPicker sms={bookingSms} email={bookingEmail} onSmsToggle={() => setBookingSms(s => !s)} onEmailToggle={() => setBookingEmail(e => !e)} disabled={false} />
              {!bookingSms && !bookingEmail && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#FF3366", fontWeight: 700 }}>⚠ Select at least one notification channel.</p>
              )}
            </>
          )}
        </div>

        <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.6 }}>You'll be notified as soon as a client submits a request — even before you confirm it.</p>
        </div>

        <button onClick={() => { showToast(); setScreen("main"); }} disabled={bookingOn && !bookingSms && !bookingEmail} style={{ width: "100%", background: bookingOn && !bookingSms && !bookingEmail ? "#1A1A2E" : "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 10, color: bookingOn && !bookingSms && !bookingEmail ? "#444" : "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: bookingOn && !bookingSms && !bookingEmail ? "not-allowed" : "pointer" }}>Save</button>
      </div>
      <SavedToast show={toast} />
    </div>
  );

  // ── CANCELLATION ALERTS ──
  if (screen === "cancel") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Notifications</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Cancellation Alerts</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Get notified when a client cancels an appointment.</p>

        <div style={{ background: "#111118", border: "1px solid #FF336622", borderLeft: "3px solid #FF3366", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: cancelOn ? 20 : 0 }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700 }}>Cancellation Alerts</p>
              <p style={{ margin: 0, fontSize: 12, color: cancelOn ? "#FF3366" : "#555" }}>{cancelOn ? "Currently enabled" : "Currently disabled"}</p>
            </div>
            <Toggle on={cancelOn} onToggle={() => setCancelOn(o => !o)} color="#FF3366" />
          </div>

          {cancelOn && (
            <>
              <div style={{ height: 1, background: "#1E1E2E", marginBottom: 16 }} />
              <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>How would you like to be notified?</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Select one or both — at least one must be on.</p>
              <ChannelPicker sms={cancelSms} email={cancelEmail} onSmsToggle={() => setCancelSms(s => !s)} onEmailToggle={() => setCancelEmail(e => !e)} disabled={false} />
              {!cancelSms && !cancelEmail && (
                <p style={{ margin: "10px 0 0", fontSize: 12, color: "#FF3366", fontWeight: 700 }}>⚠ Select at least one notification channel.</p>
              )}
            </>
          )}
        </div>

        <div style={{ background: "#FF336608", border: "1px solid #FF336622", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#FF3366", lineHeight: 1.6 }}>Cancellation alerts help you react fast — rebook the slot or reach out to the client directly.</p>
        </div>

        <button onClick={() => { showToast(); setScreen("main"); }} disabled={cancelOn && !cancelSms && !cancelEmail} style={{ width: "100%", background: cancelOn && !cancelSms && !cancelEmail ? "#1A1A2E" : "linear-gradient(135deg,#FF3366,#A259FF)", border: "none", borderRadius: 10, color: cancelOn && !cancelSms && !cancelEmail ? "#444" : "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: cancelOn && !cancelSms && !cancelEmail ? "not-allowed" : "pointer" }}>Save</button>
      </div>
      <SavedToast show={toast} />
    </div>
  );

  // ── 24HR REMINDER ──
  if (screen === "reminder") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Notifications</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>24hr Client Reminder</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Automatically text your clients 24 hours before their appointment to reduce no-shows.</p>

        <div style={{ background: "#111118", border: "1px solid #FFD60A22", borderLeft: "3px solid #FFD60A", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700 }}>Automatic 24hr Reminder</p>
              <p style={{ margin: 0, fontSize: 12, color: reminderOn ? "#FFD60A" : "#555" }}>{reminderOn ? "Enabled — clients will be texted automatically" : "Disabled — no reminders will be sent"}</p>
            </div>
            <Toggle on={reminderOn} onToggle={() => setReminderOn(o => !o)} color="#FFD60A" />
          </div>
        </div>

        {/* Preview of what client receives */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 16, opacity: reminderOn ? 1 : 0.4, transition: "all 0.3s" }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>📱 Preview — What your client receives</p>
          <div style={{ background: "#0A0A0F", borderRadius: 12, padding: "14px 16px", borderLeft: "3px solid #FFD60A" }}>
            <p style={{ margin: "0 0 4px", fontSize: 11, color: "#FFD60A", fontWeight: 700 }}>GlossIO — Carlos Detail Co.</p>
            <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC", lineHeight: 1.7 }}>
              Hey! Just a reminder that your detail appointment is <strong>tomorrow</strong>. 📅<br />
              <strong>Service:</strong> Full Detail<br />
              <strong>Time:</strong> 10:00 AM<br />
              <strong>Location:</strong> Naples, FL<br /><br />
              Not going to make it? <span style={{ color: "#00C2FF", textDecoration: "underline" }}>Click here to reschedule or cancel.</span>
            </p>
          </div>
        </div>

        <div style={{ background: "#FFD60A0A", border: "1px solid #FFD60A22", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
          <p style={{ margin: 0, fontSize: 12, color: "#FFD60A", lineHeight: 1.6 }}>This reminder goes out automatically via SMS — no action needed from you. Clients can reschedule or cancel directly from the link.</p>
        </div>

        <button onClick={() => { showToast(); setScreen("main"); }} style={{ width: "100%", background: "linear-gradient(135deg,#FFD60A,#FF6B35)", border: "none", borderRadius: 10, color: "#0A0A0F", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Save</button>
      </div>
      <SavedToast show={toast} />
    </div>
  );

  // ── WEEKLY EMAIL SUMMARY ──
  if (screen === "summary") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Notifications</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Weekly Email Summary</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>A weekly recap of your business sent straight to your inbox.</p>

        {/* Master toggle */}
        <div style={{ background: "#111118", border: "1px solid #00E5A022", borderLeft: "3px solid #00E5A0", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: summaryOn ? 24 : 0 }}>
            <div>
              <p style={{ margin: "0 0 3px", fontSize: 15, fontWeight: 700 }}>Weekly Email Summary</p>
              <p style={{ margin: 0, fontSize: 12, color: summaryOn ? "#00E5A0" : "#555" }}>{summaryOn ? "Enabled" : "Disabled"}</p>
            </div>
            <Toggle on={summaryOn} onToggle={() => setSummaryOn(o => !o)} color="#00E5A0" />
          </div>

          {summaryOn && (
            <>
              {/* Day picker */}
              <div style={{ marginBottom: 22 }}>
                <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700 }}>Send every:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {DAYS.map(d => (
                    <div key={d} onClick={() => setSummaryDay(d)} style={{ background: summaryDay === d ? "#00E5A015" : "#0A0A0F", border: `1px solid ${summaryDay === d ? "#00E5A055" : "#2A2A3E"}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: summaryDay === d ? "#00E5A0" : "#666", fontWeight: summaryDay === d ? 700 : 400, cursor: "pointer" }}>{d.slice(0, 3)}</div>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: "#1E1E2E", marginBottom: 20 }} />

              {/* Include items */}
              <p style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 700 }}>What to include:</p>
              {[
                { key: "upcoming", icon: "📅", label: "Upcoming appointments for the week", desc: "A list of all confirmed jobs ahead" },
                { key: "revenue", icon: "💰", label: "Revenue MTD", desc: "Your month-to-date earnings so far" },
                { key: "newClients", icon: "👥", label: "New clients added", desc: "Any new clients booked that week" },
                { key: "cancellations", icon: "🚫", label: "Cancellations that week", desc: "Jobs that were cancelled in the past 7 days" },
              ].map(item => (
                <div key={item.key} onClick={() => toggleSummaryItem(item.key)} style={{ display: "flex", alignItems: "center", gap: 12, background: summaryIncludes[item.key] ? "#00E5A008" : "#0A0A0F", border: `1px solid ${summaryIncludes[item.key] ? "#00E5A033" : "#1E1E2E"}`, borderRadius: 10, padding: "12px 14px", marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: summaryIncludes[item.key] ? "#F0EDE8" : "#666" }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{item.desc}</p>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: summaryIncludes[item.key] ? "#00E5A0" : "transparent", border: `2px solid ${summaryIncludes[item.key] ? "#00E5A0" : "#2A2A3E"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {summaryIncludes[item.key] && <span style={{ fontSize: 10, color: "#0A0A0F", fontWeight: 900 }}>✓</span>}
                  </div>
                </div>
              ))}
              {summaryItemCount === 0 && <p style={{ margin: "8px 0 0", fontSize: 12, color: "#FF3366", fontWeight: 700 }}>⚠ Select at least one item to include.</p>}
            </>
          )}
        </div>

        {/* Summary preview */}
        {summaryOn && (
          <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Current Settings</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span>📅</span>
              <p style={{ margin: 0, fontSize: 13 }}>Sent every <strong style={{ color: "#00E5A0" }}>{summaryDay}</strong></p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span>📋</span>
              <p style={{ margin: 0, fontSize: 13 }}><strong style={{ color: "#00E5A0" }}>{summaryItemCount}</strong> item{summaryItemCount !== 1 ? "s" : ""} included</p>
            </div>
          </div>
        )}

        <button onClick={() => { showToast(); setScreen("main"); }} disabled={summaryOn && summaryItemCount === 0} style={{ width: "100%", background: summaryOn && summaryItemCount === 0 ? "#1A1A2E" : "linear-gradient(135deg,#00E5A0,#00C2FF)", border: "none", borderRadius: 10, color: summaryOn && summaryItemCount === 0 ? "#444" : "#0A0A0F", fontSize: 14, fontWeight: 700, padding: "14px", cursor: summaryOn && summaryItemCount === 0 ? "not-allowed" : "pointer" }}>Save</button>
      </div>
      <SavedToast show={toast} />
    </div>
  );
}
