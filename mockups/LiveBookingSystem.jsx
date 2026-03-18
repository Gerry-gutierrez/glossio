import { useState } from "react";

// ─────────────────────────────────────────────
// SHARED DATA & CONSTANTS
// ─────────────────────────────────────────────

const SERVICES = [
  { id: 1, name: "Exterior Wash", price: "49.99", description: "Full exterior hand wash, clay bar treatment, and streak-free window cleaning.", icon: "💧", color: "#00C2FF" },
  { id: 2, name: "Interior Detail", price: "89.99", description: "Deep vacuum, leather conditioning, dashboard wipe-down, and odor elimination.", icon: "🪑", color: "#FF6B35" },
  { id: 3, name: "Full Detail", price: "159.99", description: "Our signature top-to-bottom treatment. Interior, exterior, tire dressing, engine bay.", icon: "✨", color: "#A259FF" },
  { id: 4, name: "Paint Correction", price: "299.99", description: "Multi-stage machine polish to remove swirls, scratches, and oxidation.", icon: "🔧", color: "#FFD60A" },
  { id: 5, name: "Ceramic Coating", price: "599.99", description: "Long-lasting ceramic protection. Repels water, dirt, and UV damage for years.", icon: "💎", color: "#00E5A0" },
];

const HOW_HEARD = ["Instagram", "Facebook", "Google", "TikTok", "Friend / Family Referral", "Saw the vehicle", "Business Card", "Other"];
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

const fmtDateLong = (d) => d instanceof Date
  ? d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  : d;

// Pre-existing dummy appointments on the detailer's board
const DUMMY_APPOINTMENTS = [
  { id: 1, clientName: "Marcus Rivera", phone: "(239) 555-0181", email: "marcus@email.com", vehicle: "2020 Toyota Camry (Black)", service: "Full Detail", serviceIcon: "✨", serviceColor: "#A259FF", price: "159.99", date: "Mon, Mar 16", time: "10:00 AM", status: "confirmed", notes: "" },
  { id: 2, clientName: "Destiny Walton", phone: "(239) 555-0142", email: "destiny@email.com", vehicle: "2022 Honda Civic (White)", service: "Exterior Wash", serviceIcon: "💧", serviceColor: "#00C2FF", price: "49.99", date: "Tue, Mar 17", time: "2:00 PM", status: "pending", notes: "Has a small scratch on the driver door." },
  { id: 3, clientName: "Trevor Lane", phone: "(239) 555-0199", email: "trevor@email.com", vehicle: "2019 Ford F-150 (Silver)", service: "Paint Correction", serviceIcon: "🔧", serviceColor: "#FFD60A", price: "299.99", date: "Wed, Mar 18", time: "9:00 AM", status: "complete", notes: "" },
];

const NAV_ITEMS = [
  { icon: "⚡", label: "Dashboard" },
  { icon: "📅", label: "Appointments" },
  { icon: "👥", label: "Clients" },
  { icon: "🛠", label: "Services" },
  { icon: "👤", label: "Public Profile" },
  { icon: "🔗", label: "My Link" },
  { icon: "⚙️", label: "Settings" },
];

const STATUS_STYLES = {
  pending:   { bg: "#FFD60A15", border: "#FFD60A33", color: "#FFD60A", dot: "#FFD60A", label: "Pending" },
  confirmed:  { bg: "#00C2FF15", border: "#00C2FF33", color: "#00C2FF", dot: "#00C2FF", label: "Confirmed" },
  complete:   { bg: "#00E5A015", border: "#00E5A033", color: "#00E5A0", dot: "#00E5A0", label: "Complete" },
  cancelled:  { bg: "#FF336615", border: "#FF336633", color: "#FF3366", dot: "#FF3366", label: "Cancelled" },
};

// ─────────────────────────────────────────────
// ROOT — owns all shared state
// ─────────────────────────────────────────────
// ── Revenue helpers ──
const getApptMonth = (appt) => {
  // Try to parse month from date string like "Tue, Mar 17" or "Mon, Apr 1"
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (!appt.date) return null;
  for (let i = 0; i < months.length; i++) {
    if (appt.date.includes(months[i])) return i; // 0-indexed
  }
  return null;
};

const NOW_MONTH = new Date().getMonth(); // 0-indexed

export default function App() {
  const [view, setView] = useState("detailer");
  const [appointments, setAppointments] = useState(DUMMY_APPOINTMENTS);
  const [newBadge, setNewBadge] = useState(0);

  const addAppointment = (appt) => {
    setAppointments(prev => [appt, ...prev]);
    setNewBadge(n => n + 1);
  };

  const updateStatus = (id, status, newDate, newTime) => {
    setAppointments(prev => prev.map(a => {
      if (a.id !== id) return a;
      const updated = { ...a, status };
      if (newDate) updated.date = newDate;
      if (newTime) updated.time = newTime;
      // Tag reschedule requests
      if (status === "pending" && a.status === "confirmed") updated.rescheduleRequest = true;
      if (status === "confirmed") updated.rescheduleRequest = false;
      return updated;
    }));
  };

  // Revenue computed from appointments
  const revenue = appointments.reduce((acc, a) => {
    const price = parseFloat(a.price) || 0;
    const month = getApptMonth(a);
    if (a.status === "complete") {
      acc.mtd += price;
    } else if (a.status === "confirmed") {
      if (month === NOW_MONTH) acc.projectedThis += price;
      else if (month === NOW_MONTH + 1) acc.projectedNext += price;
    }
    return acc;
  }, { mtd: 0, projectedThis: 0, projectedNext: 0 });

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#F0EDE8", background: "#0A0A0F", minHeight: "100vh" }}>
      <div style={{
        position: "fixed", top: 12, right: 12, zIndex: 200,
        display: "flex", gap: 6, background: "#111118",
        border: "1px solid #2A2A3E", borderRadius: 10, padding: 5
      }}>
        <button onClick={() => setView("client")} style={{
          background: view === "client" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "transparent",
          border: "none", borderRadius: 7, color: view === "client" ? "#fff" : "#666",
          fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer"
        }}>👤 Client View</button>
        <button onClick={() => setView("detailer")} style={{
          background: view === "detailer" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "transparent",
          border: "none", borderRadius: 7, color: view === "detailer" ? "#fff" : "#666",
          fontSize: 11, fontWeight: 700, padding: "6px 12px", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6
        }}>
          🛠 Detailer
          {newBadge > 0 && (
            <span style={{ background: "#FF6B35", borderRadius: "50%", fontSize: 10, fontWeight: 800, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{newBadge}</span>
          )}
        </button>
      </div>

      {view === "client"
        ? <ClientView onBook={addAppointment} onClientAction={(id, action, data) => {
            if (action === "cancel") updateStatus(id, "cancelled");
            if (action === "reschedule") updateStatus(id, "pending", data.date, data.time);
          }} appointments={appointments} />
        : <DetailerView appointments={appointments} updateStatus={updateStatus} revenue={revenue} newBadge={newBadge} clearBadge={() => setNewBadge(0)} />
      }
    </div>
  );
}

// ─────────────────────────────────────────────
// DETAILER — APPOINTMENTS TAB
// ─────────────────────────────────────────────
function DetailerView({ appointments, updateStatus, revenue, newBadge, clearBadge }) {
  const [activeNav, setActiveNav] = useState("Appointments");
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [altTimeModal, setAltTimeModal] = useState(null);
  const [altSlots, setAltSlots] = useState([{ date: null, time: "" }]);
  const [pickingSlot, setPickingSlot] = useState(0);
  const [filter, setFilter] = useState("all");

  const SLOT_COLORS = ["#00C2FF", "#A259FF", "#FF6B35"];
  const SLOT_LABELS = ["Option 1", "Option 2", "Option 3"];

  const openAltModal = (appt) => {
    setAltTimeModal(appt);
    setAltSlots([{ date: null, time: "" }]);
    setPickingSlot(0);
  };

  const addAltSlot = () => {
    if (altSlots.length < 3) setAltSlots(s => [...s, { date: null, time: "" }]);
  };

  const removeAltSlot = (i) => {
    const updated = altSlots.filter((_, idx) => idx !== i);
    setAltSlots(updated);
    if (pickingSlot >= updated.length) setPickingSlot(updated.length - 1);
  };

  const updateAltSlot = (i, key, val) => {
    setAltSlots(s => s.map((slot, idx) => idx === i ? { ...slot, [key]: val } : slot));
  };

  const validAltSlots = altSlots.filter(s => s.date && s.time);

  const filtered = filter === "all" ? appointments : appointments.filter(a => a.status === filter);

  const counts = {
    pending:   appointments.filter(a => a.status === "pending").length,
    confirmed: appointments.filter(a => a.status === "confirmed").length,
    complete:  appointments.filter(a => a.status === "complete").length,
    cancelled: appointments.filter(a => a.status === "cancelled").length,
  };

  const handleNavClick = (label) => {
    setActiveNav(label);
    if (label === "Appointments") clearBadge();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <div style={{ width: 220, background: "#0D0D15", borderRight: "1px solid #1E1E2E", display: "flex", flexDirection: "column", padding: "28px 0", flexShrink: 0, position: "sticky", top: 0, height: "100vh" }}>
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
          {NAV_ITEMS.map(item => (
            <button key={item.label} onClick={() => handleNavClick(item.label)} style={{
              width: "100%", background: activeNav === item.label ? "#1A1A2E" : "transparent",
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
              {item.label === "Appointments" && newBadge > 0 && (
                <span style={{ marginLeft: "auto", background: "#FF6B35", borderRadius: 10, fontSize: 10, fontWeight: 800, padding: "1px 7px", color: "#fff" }}>{newBadge} new</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Detailer Dashboard</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Appointments</h1>
          </div>
        </div>

        {/* Revenue Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: "Revenue MTD", value: revenue.mtd, color: "#00E5A0", note: "Completed jobs this month" },
            { label: "Projected This Month", value: revenue.projectedThis, color: "#00C2FF", note: "Confirmed · not yet complete" },
            { label: "Projected Next Month", value: revenue.projectedNext, color: "#A259FF", note: "Confirmed · next month" },
          ].map(card => (
            <div key={card.label} style={{ background: "#111118", border: "1px solid #1E1E2E", borderTop: `2px solid ${card.color}`, borderRadius: 12, padding: "16px 18px" }}>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>{card.label}</p>
              <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: card.color }}>${card.value.toFixed(2)}</p>
              <p style={{ margin: 0, fontSize: 10, color: "#444" }}>{card.note}</p>
            </div>
          ))}
        </div>

        {/* Status summary cards */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {[
            { key: "pending",   label: "Awaiting Confirm", icon: "🟡" },
            { key: "confirmed", label: "Confirmed",         icon: "🔵" },
            { key: "complete",  label: "Complete",          icon: "🟢" },
            { key: "cancelled", label: "Cancelled",         icon: "🔴" },
          ].map(s => {
            const st = STATUS_STYLES[s.key];
            return (
              <div key={s.key} onClick={() => setFilter(filter === s.key ? "all" : s.key)} style={{
                flex: 1, minWidth: 100, background: filter === s.key ? st.bg : "#111118",
                border: `1px solid ${filter === s.key ? st.border : "#1E1E2E"}`,
                borderTop: `2px solid ${filter === s.key ? st.color : "#1E1E2E"}`,
                borderRadius: 12, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s"
              }}>
                <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: st.color }}>{counts[s.key]}</p>
                <p style={{ margin: 0, fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["all", "pending", "confirmed", "complete"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? "#1A1A2E" : "transparent",
              border: `1px solid ${filter === f ? "#00C2FF44" : "#1E1E2E"}`,
              borderRadius: 8, color: filter === f ? "#00C2FF" : "#666",
              fontSize: 12, fontWeight: filter === f ? 700 : 400,
              padding: "7px 16px", cursor: "pointer", textTransform: "capitalize"
            }}>{f === "all" ? `All (${appointments.length})` : `${f} (${counts[f]})`}</button>
          ))}
        </div>

        {/* Appointment list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.length === 0 && (
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "48px", textAlign: "center" }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>📅</p>
              <p style={{ color: "#555", margin: 0 }}>No appointments here yet.</p>
            </div>
          )}

          {filtered.map(appt => {
            const st = STATUS_STYLES[appt.status];
            const isNew = appt.isNew;
            return (
              <div key={appt.id} style={{
                background: isNew ? "#FF6B3508" : "#111118",
                border: `1px solid ${isNew ? "#FF6B3533" : "#1E1E2E"}`,
                borderLeft: `3px solid ${st.color}`,
                borderRadius: 14, padding: "18px 20px",
                transition: "all 0.3s"
              }}>
                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      {isNew && <span style={{ background: "#FF6B3522", border: "1px solid #FF6B3544", borderRadius: 10, fontSize: 9, fontWeight: 700, color: "#FF6B35", padding: "2px 8px", letterSpacing: "0.1em" }}>NEW</span>}
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{appt.clientName}</h3>
                    </div>
                    <p style={{ margin: "0 0 3px", fontSize: 13, color: "#888" }}>
                      {appt.serviceIcon} {appt.service} · <span style={{ color: appt.serviceColor, fontWeight: 700 }}>${appt.price}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: 12, color: "#666" }}>📅 {appt.date} · ⏰ {appt.time}</p>
                  </div>
                  <span style={{
                    background: st.bg, border: `1px solid ${st.border}`,
                    borderRadius: 20, fontSize: 11, fontWeight: 700,
                    color: st.color, padding: "4px 12px"
                  }}>{st.label}</span>
                </div>

                {/* Vehicle + contact */}
                <div style={{ display: "flex", gap: 10, marginBottom: appt.notes ? 10 : 14, flexWrap: "wrap" }}>
                  <span style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 11, color: "#888", padding: "4px 10px" }}>🚗 {appt.vehicle}</span>
                  <span style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 8, fontSize: 11, color: "#888", padding: "4px 10px" }}>📱 {appt.phone}</span>
                </div>

                {/* Notes */}
                {appt.notes && (
                  <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 8, padding: "8px 12px", marginBottom: 14 }}>
                    <p style={{ margin: 0, fontSize: 12, color: "#888" }}>📝 {appt.notes}</p>
                  </div>
                )}

                {/* How heard */}
                {appt.howHeard && (
                  <p style={{ margin: "0 0 12px", fontSize: 11, color: "#555" }}>📣 Heard via: <span style={{ color: "#888" }}>{appt.howHeard}</span></p>
                )}

                {/* Reschedule request tag */}
                {appt.rescheduleRequest && appt.status === "pending" && (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FFD60A0D", border: "1px solid #FFD60A33", borderRadius: 20, padding: "4px 12px", marginBottom: 12 }}>
                    <span style={{ fontSize: 11 }}>🔄</span>
                    <span style={{ fontSize: 11, color: "#FFD60A", fontWeight: 700 }}>Reschedule Request — client asked to move this</span>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {appt.status === "pending" && (
                    <>
                      <button onClick={() => updateStatus(appt.id, "confirmed")} style={{
                        background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
                        borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700,
                        padding: "8px 18px", cursor: "pointer"
                      }}>✓ Confirm</button>
                      <button onClick={() => openAltModal(appt)} style={{
                        background: "#111118", border: "1px solid #FFD60A33",
                        borderRadius: 8, color: "#FFD60A", fontSize: 12, fontWeight: 700,
                        padding: "8px 18px", cursor: "pointer"
                      }}>🕐 Suggest Alt Time</button>
                    </>
                  )}
                  {appt.status === "confirmed" && (
                    <button onClick={() => updateStatus(appt.id, "complete")} style={{
                      background: "#00E5A015", border: "1px solid #00E5A044",
                      borderRadius: 8, color: "#00E5A0", fontSize: 12, fontWeight: 700,
                      padding: "8px 18px", cursor: "pointer"
                    }}>🟢 Mark Complete</button>
                  )}
                  {appt.status === "complete" && (
                    <span style={{ fontSize: 12, color: "#00E5A0", fontWeight: 700, padding: "8px 4px" }}>✓ Job Done</span>
                  )}
                  {appt.status === "cancelled" && (
                    <span style={{ fontSize: 12, color: "#FF3366", fontWeight: 700, padding: "8px 4px" }}>🔴 Cancelled by Client</span>
                  )}
                  {appt.status !== "cancelled" && (
                    <button onClick={() => setSelectedAppt(selectedAppt?.id === appt.id ? null : appt)} style={{
                      background: "transparent", border: "1px solid #2A2A3E",
                      borderRadius: 8, color: "#555", fontSize: 12,
                      padding: "8px 14px", cursor: "pointer", marginLeft: "auto"
                    }}>{selectedAppt?.id === appt.id ? "Hide Details ▲" : "Full Details ▼"}</button>
                  )}
                </div>

                {/* Expanded details */}
                {selectedAppt?.id === appt.id && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1A1A2E" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { label: "Email", value: appt.email },
                        { label: "Phone", value: appt.phone },
                        { label: "Vehicle", value: appt.vehicle },
                        { label: "Service", value: `${appt.service} · $${appt.price}` },
                        { label: "Date", value: appt.date },
                        { label: "Time", value: appt.time },
                      ].map(row => (
                        <div key={row.label} style={{ background: "#0A0A0F", border: "1px solid #1A1A2E", borderRadius: 8, padding: "10px 12px" }}>
                          <p style={{ margin: "0 0 3px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.label}</p>
                          <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC" }}>{row.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MULTI-SLOT ALT TIME MODAL ── */}
      {altTimeModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>

            <div style={{ marginBottom: 24 }}>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 700 }}>Suggest Alt Time</h2>
              <p style={{ margin: 0, fontSize: 13, color: "#666" }}>
                Give <strong style={{ color: "#C8C4BC" }}>{altTimeModal.clientName}</strong> up to <strong style={{ color: "#F0EDE8" }}>3 options</strong> to choose from.
              </p>
            </div>

            {/* Appointment chip */}
            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "13px 16px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{altTimeModal.serviceIcon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>{altTimeModal.clientName} — {altTimeModal.service}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Original: <span style={{ textDecoration: "line-through" }}>{altTimeModal.date} · {altTimeModal.time}</span></p>
              </div>
              <span style={{ background: "#FFD60A15", border: "1px solid #FFD60A33", borderRadius: 20, fontSize: 11, color: "#FFD60A", fontWeight: 700, padding: "3px 10px" }}>🟡 Pending</span>
            </div>

            {/* Slot tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              {altSlots.map((_, i) => (
                <button key={i} onClick={() => setPickingSlot(i)} style={{
                  background: pickingSlot === i ? `${SLOT_COLORS[i]}22` : "transparent",
                  border: `1px solid ${pickingSlot === i ? SLOT_COLORS[i] + "66" : "#2A2A3E"}`,
                  borderRadius: 10, color: pickingSlot === i ? SLOT_COLORS[i] : "#666",
                  fontSize: 12, fontWeight: pickingSlot === i ? 700 : 400,
                  padding: "7px 14px", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 7
                }}>
                  {SLOT_LABELS[i]}
                  {altSlots[i].date && altSlots[i].time
                    ? <span style={{ fontSize: 10 }}>✓</span>
                    : <span style={{ fontSize: 10, opacity: 0.4 }}>○</span>}
                  {altSlots.length > 1 && (
                    <span onClick={(e) => { e.stopPropagation(); removeAltSlot(i); }} style={{ fontSize: 11, color: "#FF3366", cursor: "pointer", marginLeft: 2 }}>✕</span>
                  )}
                </button>
              ))}
              {altSlots.length < 3 && (
                <button onClick={addAltSlot} style={{
                  background: "transparent", border: "1px dashed #2A2A3E",
                  borderRadius: 10, color: "#555", fontSize: 12,
                  padding: "7px 13px", cursor: "pointer"
                }}>+ Add Option</button>
              )}
            </div>

            {/* Active slot editor */}
            {altSlots.map((slot, i) => i !== pickingSlot ? null : (
              <div key={i} style={{ background: "#0A0A0F", border: `1px solid ${SLOT_COLORS[i]}33`, borderRadius: 14, padding: "20px", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: SLOT_COLORS[i] }} />
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: SLOT_COLORS[i] }}>{SLOT_LABELS[i]}</p>
                </div>

                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Date <span style={{ color: "#FF6B35" }}>*</span></p>
                <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 10, marginBottom: 16 }}>
                  {getDates().map((d, di) => {
                    const sel = slot.date && fmtDate(slot.date) === fmtDate(d);
                    const takenByOther = altSlots.some((s, si) => si !== i && s.date && fmtDate(s.date) === fmtDate(d));
                    return (
                      <div key={di} onClick={() => !takenByOther && updateAltSlot(i, "date", d)} style={{
                        flexShrink: 0, width: 58,
                        background: sel ? SLOT_COLORS[i] : "#111118",
                        border: `1px solid ${sel ? SLOT_COLORS[i] : "#1E1E2E"}`,
                        borderRadius: 10, padding: "10px 5px", textAlign: "center",
                        cursor: takenByOther ? "not-allowed" : "pointer",
                        opacity: takenByOther ? 0.25 : 1, transition: "all 0.15s"
                      }}>
                        <p style={{ margin: "0 0 2px", fontSize: 9, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p style={{ margin: "0 0 2px", fontSize: 17, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>{d.getDate()}</p>
                        <p style={{ margin: 0, fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
                      </div>
                    );
                  })}
                </div>

                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Time <span style={{ color: "#FF6B35" }}>*</span></p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
                  {TIMES.map(t => {
                    const sel = slot.time === t;
                    return (
                      <div key={t} onClick={() => updateAltSlot(i, "time", t)} style={{
                        background: sel ? SLOT_COLORS[i] : "#111118",
                        border: `1px solid ${sel ? SLOT_COLORS[i] : "#1E1E2E"}`,
                        borderRadius: 8, padding: "9px 4px", textAlign: "center",
                        fontSize: 11, fontWeight: sel ? 700 : 400,
                        color: sel ? "#0A0A0F" : "#888", cursor: "pointer"
                      }}>{t}</div>
                    );
                  })}
                </div>

                {slot.date && slot.time && (
                  <div style={{ marginTop: 14, background: `${SLOT_COLORS[i]}0D`, border: `1px solid ${SLOT_COLORS[i]}22`, borderRadius: 8, padding: "9px 14px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "#666" }}>{SLOT_LABELS[i]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SLOT_COLORS[i] }}>{fmtDate(slot.date)} · {slot.time}</span>
                  </div>
                )}
              </div>
            ))}

            {/* Summary of all filled slots */}
            {validAltSlots.length > 0 && (
              <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 10px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.18em" }}>What {altTimeModal.clientName.split(" ")[0]} Will See</p>
                {altSlots.map((slot, i) => slot.date && slot.time ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < altSlots.length - 1 ? "1px solid #1A1A2E" : "none" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: SLOT_COLORS[i], flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#666", flex: 1 }}>{SLOT_LABELS[i]}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: SLOT_COLORS[i] }}>{fmtDate(slot.date)} · {slot.time}</span>
                  </div>
                ) : null)}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setAltTimeModal(null)} style={{ background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#888", fontSize: 13, padding: "12px 20px", cursor: "pointer" }}>Cancel</button>
              <button
                disabled={validAltSlots.length === 0}
                onClick={() => { updateStatus(altTimeModal.id, "pending"); setAltTimeModal(null); }}
                style={{
                  flex: 1,
                  background: validAltSlots.length > 0 ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                  border: "none", borderRadius: 10,
                  color: validAltSlots.length > 0 ? "#fff" : "#444",
                  fontSize: 13, fontWeight: 700, padding: "12px",
                  cursor: validAltSlots.length > 0 ? "pointer" : "not-allowed"
                }}>
                📤 Send {validAltSlots.length > 0 ? validAltSlots.length : ""} Option{validAltSlots.length !== 1 ? "s" : ""} to {altTimeModal.clientName.split(" ")[0]}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIENT — BOOKING FLOW
// ─────────────────────────────────────────────
function ClientView({ onBook, onClientAction, appointments }) {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [expandedService, setExpandedService] = useState(null);
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", year: "", make: "", model: "", color: "", date: null, time: "", howHeard: "", notes: "" });
  const [bookedApptId, setBookedApptId] = useState(null);
  const [clientScreen, setClientScreen] = useState(null); // null | "manage" | "reschedule" | "cancelConfirm" | "done"
  const [reschedDate, setReschedDate] = useState(null);
  const [reschedTime, setReschedTime] = useState("");
  const [reminderView, setReminderView] = useState(false);
  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const step1Valid = form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.email.trim();
  const step2Valid = form.year.trim() && form.make.trim() && form.model.trim() && form.color.trim();
  const step3Valid = form.date && form.time;

  const submitBooking = () => {
    const id = Date.now();
    const appt = {
      id,
      clientName: `${form.firstName} ${form.lastName}`,
      phone: form.phone,
      email: form.email,
      vehicle: `${form.year} ${form.make} ${form.model} (${form.color})`,
      service: selectedService.name,
      serviceIcon: selectedService.icon,
      serviceColor: selectedService.color,
      price: selectedService.price,
      date: fmtDate(form.date),
      time: form.time,
      howHeard: form.howHeard,
      notes: form.notes,
      status: "pending",
      isNew: true,
    };
    onBook(appt);
    setBookedApptId(id);
    setStep(5);
  };

  // The booked appointment (for manage screen)
  const myAppt = appointments?.find(a => a.id === bookedApptId);

  // ── 24hr Reminder simulation ──
  if (reminderView) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      <div style={{ background: "#111118", borderBottom: "1px solid #1E1E2E", padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ margin: 0, fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>📱 Simulating 24hr Reminder Text</p>
        <button onClick={() => setReminderView(false)} style={{ background: "transparent", border: "1px solid #2A2A3E", borderRadius: 7, color: "#666", fontSize: 11, padding: "5px 12px", cursor: "pointer" }}>← Back to Confirmation</button>
      </div>
      <div style={{ maxWidth: 400, margin: "32px auto", padding: "0 24px" }}>
        <div style={{ background: "#1A1A1A", borderRadius: 36, border: "2px solid #2A2A2A", padding: "20px 0 28px", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 22px 12px", borderBottom: "1px solid #222" }}>
            <span style={{ fontSize: 12, color: "#888" }}>9:00 AM</span>
            <span style={{ fontSize: 12, color: "#888" }}>●●●</span>
          </div>
          <div style={{ textAlign: "center", padding: "14px 0 10px", borderBottom: "1px solid #1E1E1E" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", margin: "0 auto 7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>GlossIO Booking</p>
          </div>
          <div style={{ padding: "18px 16px" }}>
            <div style={{ background: "#1A2A3A", border: "1px solid #00C2FF22", borderRadius: "16px 16px 16px 4px", padding: "14px 16px" }}>
              <p style={{ margin: "0 0 10px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.7 }}>
                Hey {form.firstName || "there"} 👋 Just a reminder — you've got an appointment with <strong style={{ color: "#F0EDE8" }}>Carlos Detail Co.</strong> tomorrow!
              </p>
              <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}>
                <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>{selectedService?.icon} {selectedService?.name || "Exterior Wash"}</p>
                <p style={{ margin: "0 0 2px", fontSize: 12, color: "#888" }}>{myAppt?.date || form.date ? fmtDate(form.date) : "Tomorrow"} · {myAppt?.time || form.time || "10:00 AM"}</p>
                <p style={{ margin: 0, fontSize: 12, color: "#888" }}>{form.year} {form.make} {form.model}</p>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 12, color: "#777", lineHeight: 1.6 }}>
                Not going to make it? No worries — tap below to reschedule or cancel. Questions? Call or text Carlos at <strong style={{ color: "#00C2FF" }}>(239) 555-0100</strong>
              </p>
              <div onClick={() => { setReminderView(false); setClientScreen("manage"); }} style={{ background: "linear-gradient(135deg,#00C2FF,#A259FF)", borderRadius: 10, padding: "10px 14px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#fff" }}>Manage My Appointment →</p>
              </div>
            </div>
            <p style={{ margin: "6px 0 0 4px", fontSize: 10, color: "#555" }}>Today · Sent automatically by GlossIO</p>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Manage appointment screen (cancel / reschedule) ──
  if (step === 5 && clientScreen === "manage") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", padding: "40px 24px 60px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <button onClick={() => setClientScreen(null)} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Back to Confirmation</button>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Manage Your Appointment</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>Need to make a change? No problem.</p>

        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 20px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700 }}>{selectedService?.icon} {selectedService?.name}</p>
          <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>{myAppt?.date || fmtDate(form.date)} · {myAppt?.time || form.time}</p>
          <p style={{ margin: "0 0 4px", fontSize: 12, color: "#666" }}>{form.year} {form.make} {form.model}</p>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: selectedService?.color }}>${selectedService?.price}</p>
        </div>

        {clientScreen !== "cancelConfirm" && clientScreen !== "done" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button onClick={() => setClientScreen("reschedule")} style={{
              background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
              borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "16px", cursor: "pointer"
            }}>🔄 Reschedule Appointment</button>
            <button onClick={() => setClientScreen("cancelConfirm")} style={{
              background: "#111118", border: "1px solid #FF336633",
              borderRadius: 12, color: "#FF3366", fontSize: 14, fontWeight: 700,
              padding: "16px", cursor: "pointer"
            }}>🔴 Cancel Appointment</button>
          </div>
        )}

        {clientScreen === "cancelConfirm" && (
          <div style={{ background: "#FF33660A", border: "1px solid #FF336633", borderRadius: 14, padding: "24px", textAlign: "center" }}>
            <p style={{ fontSize: 32, margin: "0 0 12px" }}>⚠️</p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px" }}>Cancel your appointment?</p>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 20px", lineHeight: 1.6 }}>Carlos will be notified right away. You can always rebook through his page.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setClientScreen("manage")} style={{ flex: 1, background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#888", fontSize: 13, padding: "12px", cursor: "pointer" }}>Keep It</button>
              <button onClick={() => { onClientAction(bookedApptId, "cancel"); setClientScreen("done"); }} style={{ flex: 1, background: "#FF3366", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, padding: "12px", cursor: "pointer" }}>Yes, Cancel</button>
            </div>
          </div>
        )}

        {clientScreen === "done" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <p style={{ fontSize: 40, margin: "0 0 12px" }}>✓</p>
            <p style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px" }}>Appointment Cancelled</p>
            <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>Carlos has been notified. Switch to Detailer View to see it marked 🔴 Cancelled on his board.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Reschedule screen ──
  if (step === 5 && clientScreen === "reschedule") return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", padding: "40px 24px 60px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <button onClick={() => setClientScreen("manage")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0 }}>← Back</button>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Request a New Time</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 26px" }}>Pick a new date and time. Carlos will review and re-confirm.</p>

        <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>New Date <span style={{ color: "#FF6B35" }}>*</span></p>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
          {getDates().map((d, i) => {
            const sel = reschedDate && fmtDate(reschedDate) === fmtDate(d);
            return (
              <div key={i} onClick={() => setReschedDate(d)} style={{ flexShrink: 0, width: 62, background: sel ? "#00C2FF" : "#111118", border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`, borderRadius: 12, padding: "11px 6px", textAlign: "center", cursor: "pointer" }}>
                <p style={{ margin: "0 0 3px", fontSize: 9, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>{d.getDate()}</p>
                <p style={{ margin: 0, fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>New Time <span style={{ color: "#FF6B35" }}>*</span></p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 28 }}>
          {TIMES.map(t => {
            const sel = reschedTime === t;
            return <div key={t} onClick={() => setReschedTime(t)} style={{ background: sel ? "#00C2FF" : "#111118", border: `1px solid ${sel ? "#00C2FF" : "#1E1E2E"}`, borderRadius: 9, padding: "10px 4px", textAlign: "center", fontSize: 12, fontWeight: sel ? 700 : 400, color: sel ? "#0A0A0F" : "#C8C4BC", cursor: "pointer" }}>{t}</div>;
          })}
        </div>

        <button
          disabled={!reschedDate || !reschedTime}
          onClick={() => {
            onClientAction(bookedApptId, "reschedule", { date: fmtDate(reschedDate), time: reschedTime });
            setClientScreen("done");
          }}
          style={{
            width: "100%",
            background: reschedDate && reschedTime ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
            border: "none", borderRadius: 12, color: reschedDate && reschedTime ? "#fff" : "#444",
            fontSize: 15, fontWeight: 700, padding: "16px",
            cursor: reschedDate && reschedTime ? "pointer" : "not-allowed"
          }}>Send Reschedule Request to Carlos →</button>
      </div>
    </div>
  );

  // ── Reschedule submitted done screen ──
  if (step === 5 && clientScreen === "done" && myAppt?.status === "pending" && myAppt?.rescheduleRequest) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center", background: "#0A0A0F" }}>
      <div style={{ width: 88, height: 88, borderRadius: "50%", background: "#FFD60A14", border: "2px solid #FFD60A44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, marginBottom: 24 }}>🔄</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Reschedule Request Sent!</h1>
      <p style={{ fontSize: 14, color: "#777", margin: "0 0 24px", maxWidth: 320, lineHeight: 1.7 }}>
        Carlos received your new time request for <strong style={{ color: "#F0EDE8" }}>{reschedDate ? fmtDate(reschedDate) : ""} at {reschedTime}</strong>. He'll re-confirm shortly.
      </p>
      <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "18px 24px", maxWidth: 340 }}>
        <p style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 700 }}>{selectedService?.icon} {selectedService?.name} · ${selectedService?.price}</p>
        <p style={{ margin: "0 0 4px", fontSize: 12, color: "#888" }}>Requested: {reschedDate ? fmtDate(reschedDate) : ""} · {reschedTime}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#FFD60A" }}>⏳ Pending Carlos's confirmation</p>
      </div>
    </div>
  );

  if (step === 5) return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", padding: "0 0 60px" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(10,10,15,0.97)", borderBottom: "1px solid #1E1E2E", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, background: "linear-gradient(90deg,#00C2FF,#A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
        <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>Booking Confirmation</span>
      </div>

      <div style={{ maxWidth: 460, margin: "0 auto", padding: "36px 24px" }}>
        {/* Success header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#00E5A018", border: "2px solid #00E5A055", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, margin: "0 auto 18px" }}>✓</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Booking Request Sent!</h1>
          <p style={{ fontSize: 14, color: "#777", margin: 0, lineHeight: 1.7 }}>Carlos will confirm within 24 hours via text & email to <strong style={{ color: "#C8C4BC" }}>{form.phone}</strong>.</p>
        </div>

        {/* Save notice */}
        <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF22", borderRadius: 12, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>📌</span>
          <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>
            <strong>Save this page!</strong> You'll need it if you ever need to reschedule or cancel. Your confirmation will also be sent to <strong>{form.email}</strong>.
          </p>
        </div>

        {/* Booking summary */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
          <p style={{ margin: "0 0 14px", fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>Your Booking</p>
          {[
            { label: "Client", value: `${form.firstName} ${form.lastName}` },
            { label: "Service", value: `${selectedService.icon} ${selectedService.name} · $${selectedService.price}` },
            { label: "Vehicle", value: `${form.year} ${form.make} ${form.model} (${form.color})` },
            { label: "Date", value: fmtDate(form.date) },
            { label: "Time", value: form.time },
          ].map((row, i, arr) => (
            <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 9, marginBottom: 9, borderBottom: i < arr.length - 1 ? "1px solid #1A1A2E" : "none" }}>
              <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: 12, color: "#C8C4BC", textAlign: "right" }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Carlos contact */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 22 }}>📞</span>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700 }}>Need to reach Carlos directly?</p>
            <p style={{ margin: 0, fontSize: 13, color: "#00C2FF", fontWeight: 700 }}>Call or text (239) 555-0100</p>
          </div>
        </div>

        {/* No payment note */}
        <div style={{ background: "#00E5A008", border: "1px solid #00E5A022", borderRadius: 12, padding: "12px 18px", marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#00E5A0", lineHeight: 1.7 }}>💳 No payment due until the job is complete. Carlos handles payment in person after the detail.</p>
        </div>

        {/* Reschedule / Cancel */}
        <div style={{ borderTop: "1px solid #1E1E2E", paddingTop: 24 }}>
          <p style={{ fontSize: 11, color: "#555", textAlign: "center", margin: "0 0 14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>Need to make a change?</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setClientScreen("reschedule")} style={{ flex: 1, background: "#111118", border: "1px solid #00C2FF33", borderRadius: 10, color: "#00C2FF", fontSize: 13, fontWeight: 700, padding: "13px", cursor: "pointer" }}>🔄 Reschedule</button>
            <button onClick={() => setClientScreen("cancelConfirm")} style={{ flex: 1, background: "#111118", border: "1px solid #FF336633", borderRadius: 10, color: "#FF3366", fontSize: 13, fontWeight: 700, padding: "13px", cursor: "pointer" }}>🔴 Cancel</button>
          </div>
        </div>

        {/* Demo hint */}
        <div style={{ marginTop: 24, background: "#FF6B3508", border: "1px solid #FF6B3522", borderRadius: 10, padding: "12px 18px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "#FF6B35", lineHeight: 1.7 }}>💡 <strong>Demo:</strong> Switch to Detailer View to see this booking live on Carlos's board.</p>
          <button onClick={() => setReminderView(true)} style={{ background: "transparent", border: "1px solid #FF6B3544", borderRadius: 8, color: "#FF6B35", fontSize: 11, padding: "6px 12px", cursor: "pointer" }}>📱 Preview 24hr Reminder Text</button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F" }}>
      {/* Top bar */}
      <div style={{ background: "rgba(10,10,15,0.97)", borderBottom: "1px solid #1E1E2E", padding: "13px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 40, height: 53, boxSizing: "border-box" }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, background: "linear-gradient(90deg,#00C2FF,#A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
        {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ background: "#111118", border: "1px solid #2A2A3E", borderRadius: 8, color: "#888", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer" }}>← Back</button>}
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 24px 60px" }}>

        {/* Step 0 — service selection */}
        {step === 0 && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Carlos Detail Co.</p>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Book an Appointment</h1>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 24px" }}>Select a service to get started.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SERVICES.map(svc => {
                const isOpen = expandedService === svc.id;
                return (
                  <div key={svc.id} style={{ background: isOpen ? `${svc.color}08` : "#111118", border: `1px solid ${isOpen ? svc.color + "44" : "#1E1E2E"}`, borderLeft: `3px solid ${svc.color}`, borderRadius: 14, overflow: "hidden" }}>
                    <div onClick={() => setExpandedService(isOpen ? null : svc.id)} style={{ padding: "15px 16px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: `${svc.color}15`, border: `1px solid ${svc.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{svc.icon}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>{svc.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>{svc.description}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: svc.color }}>${svc.price}</p>
                        <span style={{ fontSize: 11, color: "#555" }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {isOpen && (
                      <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${svc.color}22` }}>
                        <p style={{ margin: "14px 0 8px", fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>What's Included</p>
                        <p style={{ margin: "0 0 14px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.8 }}>{svc.description}</p>
                        <div style={{ background: `${svc.color}10`, border: `1px solid ${svc.color}22`, borderRadius: 10, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                          <span style={{ fontSize: 12, color: "#888" }}>Starting at</span>
                          <span style={{ fontSize: 20, fontWeight: 700, color: svc.color }}>${svc.price}</span>
                        </div>
                        <button onClick={() => { setSelectedService(svc); setStep(1); }} style={{ width: "100%", background: `linear-gradient(135deg,${svc.color},${svc.color}bb)`, border: "none", borderRadius: 10, color: "#0A0A0F", fontSize: 14, fontWeight: 700, padding: "13px", cursor: "pointer" }}>Book {svc.name} →</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Steps 1–4 */}
        {step > 0 && (
          <>
            {/* Service chip */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: `${selectedService.color}15`, border: `1px solid ${selectedService.color}33`, borderRadius: 20, padding: "6px 14px", marginBottom: 22 }}>
              <span>{selectedService.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: selectedService.color }}>{selectedService.name}</span>
              <span style={{ fontSize: 12, color: "#888" }}>· ${selectedService.price}</span>
            </div>

            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 30 }}>
              {["Your Info", "Vehicle", "Date & Time", "Review"].map((label, i) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{ height: 3, borderRadius: 2, marginBottom: 5, background: i < step ? selectedService.color : "#1E1E2E", opacity: i === step - 1 ? 1 : i < step ? 0.45 : 0.15, transition: "all 0.3s" }} />
                  <p style={{ margin: 0, fontSize: 9, color: i === step - 1 ? "#C8C4BC" : "#444", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Step 1 */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Info</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>So Carlos knows who's coming in.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <FormField label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="John" required />
                  <FormField label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Smith" required />
                </div>
                <FormField label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="(239) 555-0100" type="tel" required />
                <FormField label="Email Address" value={form.email} onChange={set("email")} placeholder="john@email.com" type="email" required />
                <p style={{ fontSize: 11, color: "#555", margin: "0 0 24px" }}>📱 Carlos will text & email your confirmation to these.</p>
                <NextBtn active={step1Valid} onClick={() => setStep(2)} label="Next: Your Vehicle →" color={selectedService.color} />
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Vehicle</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>Tell Carlos what he'll be working on.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                  <FormField label="Year" value={form.year} onChange={set("year")} placeholder="2021" required />
                  <FormField label="Color" value={form.color} onChange={set("color")} placeholder="Pearl White" required />
                </div>
                <FormField label="Make" value={form.make} onChange={set("make")} placeholder="Toyota" required />
                <FormField label="Model" value={form.model} onChange={set("model")} placeholder="Camry" required />
                {form.year && form.make && form.model && (
                  <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "13px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 26 }}>🚗</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>{form.year} {form.make} {form.model}</p>
                      {form.color && <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{form.color}</p>}
                    </div>
                  </div>
                )}
                <NextBtn active={step2Valid} onClick={() => setStep(3)} label="Next: Date & Time →" color={selectedService.color} />
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Date & Time</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 22px" }}>Pick your preferred slot. Carlos confirms within 24 hrs.</p>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Date <span style={{ color: "#FF6B35" }}>*</span></p>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 20 }}>
                  {getDates().map((d, i) => {
                    const sel = form.date && fmtDate(form.date) === fmtDate(d);
                    return (
                      <div key={i} onClick={() => set("date")(d)} style={{ flexShrink: 0, width: 62, background: sel ? selectedService.color : "#111118", border: `1px solid ${sel ? selectedService.color : "#1E1E2E"}`, borderRadius: 12, padding: "11px 6px", textAlign: "center", cursor: "pointer" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 9, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase" }}>{d.toLocaleDateString("en-US", { weekday: "short" })}</p>
                        <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>{d.getDate()}</p>
                        <p style={{ margin: 0, fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>{d.toLocaleDateString("en-US", { month: "short" })}</p>
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Time <span style={{ color: "#FF6B35" }}>*</span></p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
                  {TIMES.map(t => {
                    const sel = form.time === t;
                    return <div key={t} onClick={() => set("time")(t)} style={{ background: sel ? selectedService.color : "#111118", border: `1px solid ${sel ? selectedService.color : "#1E1E2E"}`, borderRadius: 9, padding: "10px 4px", textAlign: "center", fontSize: 12, fontWeight: sel ? 700 : 400, color: sel ? "#0A0A0F" : "#C8C4BC", cursor: "pointer" }}>{t}</div>;
                  })}
                </div>
                <NextBtn active={step3Valid} onClick={() => setStep(4)} label="Next: Review →" color={selectedService.color} />
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Almost Done!</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>Review your booking then confirm.</p>

                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>How did you hear about Carlos?</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                  {HOW_HEARD.map(opt => {
                    const sel = form.howHeard === opt;
                    return <div key={opt} onClick={() => set("howHeard")(opt)} style={{ background: sel ? "#00C2FF15" : "#111118", border: `1px solid ${sel ? "#00C2FF44" : "#1E1E2E"}`, borderRadius: 9, padding: "10px 12px", fontSize: 12, color: sel ? "#00C2FF" : "#888", fontWeight: sel ? 700 : 400, cursor: "pointer" }}>{opt}</div>;
                  })}
                </div>

                <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 8px" }}>Notes <span style={{ fontSize: 10, color: "#444", textTransform: "none", letterSpacing: 0 }}>(optional)</span></p>
                <textarea value={form.notes} onChange={e => set("notes")(e.target.value)} placeholder="Special requests, gate codes, damage to note..." rows={3} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 13, padding: "12px 14px", outline: "none", resize: "vertical", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 22 }} />

                {/* Summary */}
                <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
                  <p style={{ margin: "0 0 14px", fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>Booking Summary</p>
                  {[
                    { label: "Service", value: `${selectedService.icon} ${selectedService.name}` },
                    { label: "Client", value: `${form.firstName} ${form.lastName}` },
                    { label: "Contact", value: `${form.phone} · ${form.email}` },
                    { label: "Vehicle", value: `${form.year} ${form.make} ${form.model} (${form.color})` },
                    { label: "Date", value: fmtDate(form.date) },
                    { label: "Time", value: form.time },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: 12, paddingBottom: 9, marginBottom: 9, borderBottom: i < arr.length - 1 ? "1px solid #1A1A2E" : "none" }}>
                      <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: 12, color: "#C8C4BC", textAlign: "right" }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "1px solid #1E1E2E", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: selectedService.color }}>${selectedService.price}</span>
                  </div>
                </div>

                <button onClick={submitBooking} style={{ width: "100%", background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 12, color: "#fff", fontSize: 15, fontWeight: 700, padding: "17px", cursor: "pointer", boxShadow: "0 6px 32px #00C2FF33" }}>
                  🗓 Confirm Booking Request
                </button>
                <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 11, color: "#555" }}>Carlos confirms within 24 hrs via text & email.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Shared form field ──
function FormField({ label, value, onChange, placeholder, type = "text", required }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 7 }}>
        {label}{required && <span style={{ color: "#FF6B35", marginLeft: 3 }}>*</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
    </div>
  );
}

// ── Next button ──
function NextBtn({ active, onClick, label, color }) {
  return (
    <button onClick={onClick} disabled={!active} style={{ width: "100%", background: active ? `linear-gradient(135deg, ${color}, #A259FF)` : "#1A1A2E", border: "none", borderRadius: 12, color: active ? "#fff" : "#444", fontSize: 15, fontWeight: 700, padding: "16px", cursor: active ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
      {label}
    </button>
  );
}
