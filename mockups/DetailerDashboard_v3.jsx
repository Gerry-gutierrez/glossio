import { useState } from "react";

const THIS_MONTH = 3;
const NEXT_MONTH = 4;

const CLIENTS = [
  {
    id: 1, firstName: "Marcus", lastName: "T.", phone: "(239) 555-0101",
    email: "marcus@gmail.com", vehicle: "2021 BMW M3", source: "Instagram",
    since: "Jan 2025", lastVisit: "Mar 6, 2025", totalSpent: 479.97,
    visits: 3, notes: "Prefers morning appointments. Very particular about interior.",
    history: [
      { date: "Mar 6, 2025", service: "Full Detail", price: 159.99, status: "complete" },
      { date: "Feb 10, 2025", service: "Paint Correction", price: 299.99, status: "complete" },
      { date: "Jan 15, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
    ]
  },
  {
    id: 2, firstName: "Jenna", lastName: "R.", phone: "(239) 555-0102",
    email: "jenna@gmail.com", vehicle: "2019 Honda Civic", source: "Word of Mouth",
    since: "Feb 2025", lastVisit: "Mar 6, 2025", totalSpent: 99.98,
    visits: 2, notes: "",
    history: [
      { date: "Mar 6, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
      { date: "Feb 20, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
    ]
  },
  {
    id: 3, firstName: "Devon", lastName: "S.", phone: "(239) 555-0103",
    email: "devon@gmail.com", vehicle: "2020 Dodge Charger", source: "TikTok",
    since: "Mar 2025", lastVisit: "Upcoming Mar 10", totalSpent: 0,
    visits: 0, notes: "First time client. Found us on TikTok.",
    history: [
      { date: "Mar 10, 2025", service: "Paint Correction", price: 299.99, status: "confirmed" },
    ]
  },
  {
    id: 4, firstName: "Aisha", lastName: "M.", phone: "(239) 555-0104",
    email: "aisha@gmail.com", vehicle: "2022 Tesla Model 3", source: "Instagram",
    since: "Feb 2025", lastVisit: "Upcoming Mar 12", totalSpent: 89.99,
    visits: 1, notes: "Interested in ceramic coating down the line.",
    history: [
      { date: "Mar 12, 2025", service: "Interior Detail", price: 89.99, status: "confirmed" },
      { date: "Feb 5, 2025", service: "Interior Detail", price: 89.99, status: "complete" },
    ]
  },
  {
    id: 5, firstName: "Tyler", lastName: "W.", phone: "(239) 555-0105",
    email: "tyler@gmail.com", vehicle: "2023 Ford F-150", source: "Facebook",
    since: "Mar 2025", lastVisit: "Upcoming Mar 15", totalSpent: 0,
    visits: 0, notes: "",
    history: [
      { date: "Mar 15, 2025", service: "Full Detail", price: 159.99, status: "pending" },
    ]
  },
  {
    id: 6, firstName: "Sofia", lastName: "L.", phone: "(239) 555-0106",
    email: "sofia@gmail.com", vehicle: "2020 Porsche Cayenne", source: "Word of Mouth",
    since: "Jan 2025", lastVisit: "Upcoming Mar 20", totalSpent: 599.99,
    visits: 2, notes: "High value client. Referred 2 friends.",
    history: [
      { date: "Mar 20, 2025", service: "Ceramic Coat", price: 599.99, status: "confirmed" },
      { date: "Jan 8, 2025", service: "Full Detail", price: 159.99, status: "complete" },
    ]
  },
];

const INITIAL_APPOINTMENTS = [
  { id: 1, client: "Marcus T.", service: "Full Detail", price: 159.99, date: "2025-03-06", time: "10:00 AM", status: "complete", vehicle: "2021 BMW M3", phone: "(239) 555-0101" },
  { id: 2, client: "Jenna R.", service: "Exterior Wash", price: 49.99, date: "2025-03-06", time: "1:00 PM", status: "complete", vehicle: "2019 Honda Civic", phone: "(239) 555-0102" },
  { id: 3, client: "Devon S.", service: "Paint Correction", price: 299.99, date: "2025-03-10", time: "9:00 AM", status: "confirmed", vehicle: "2020 Dodge Charger", phone: "(239) 555-0103" },
  { id: 4, client: "Aisha M.", service: "Interior Detail", price: 89.99, date: "2025-03-12", time: "11:00 AM", status: "confirmed", vehicle: "2022 Tesla Model 3", phone: "(239) 555-0104" },
  { id: 5, client: "Tyler W.", service: "Full Detail", price: 159.99, date: "2025-03-15", time: "2:00 PM", status: "pending", vehicle: "2023 Ford F-150", phone: "(239) 555-0105" },
  { id: 6, client: "Sofia L.", service: "Ceramic Coat", price: 599.99, date: "2025-03-20", time: "10:00 AM", status: "confirmed", vehicle: "2020 Porsche Cayenne", phone: "(239) 555-0106" },
  { id: 7, client: "Ray P.", service: "Full Detail", price: 159.99, date: "2025-04-02", time: "11:00 AM", status: "confirmed", vehicle: "2022 Chevy Silverado", phone: "(239) 555-0107" },
  { id: 8, client: "Nadia K.", service: "Interior Detail", price: 89.99, date: "2025-04-05", time: "9:00 AM", status: "pending", vehicle: "2021 Kia Telluride", phone: "(239) 555-0108" },
  { id: 9, client: "Chris B.", service: "Exterior Wash", price: 49.99, date: "2025-04-08", time: "3:00 PM", status: "confirmed", vehicle: "2019 Toyota Camry", phone: "(239) 555-0109" },
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

const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const statusConfig = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Complete" },
};

const fmt = (n) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const actionBtn = (color) => ({
  background: `${color}15`, border: `1px solid ${color}33`,
  borderRadius: 6, color, fontSize: 11, fontWeight: 700,
  padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap"
});

const labelStyle = {
  display: "block", fontSize: 11, letterSpacing: "0.2em",
  color: "#666", textTransform: "uppercase", marginBottom: 8
};

const inputStyle = {
  width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E",
  borderRadius: 8, color: "#F0EDE8", fontSize: 14,
  padding: "11px 14px", outline: "none",
  fontFamily: "Georgia, serif", boxSizing: "border-box"
};

export default function Dashboard() {
  const [appointments, setAppointments] = useState(INITIAL_APPOINTMENTS);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [apptView, setApptView] = useState("table");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearch, setClientSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    name: "Carlos Detail Co.", tagline: "Premium mobile detailing in Naples, FL",
    phone: "(239) 555-0100", instagram: "@carlosdetail",
    bio: "5 years of making cars shine. Specializing in paint correction and ceramic coatings.",
  });
  const [editProfile, setEditProfile] = useState({ ...profile });

  const revenueMTD = appointments.filter(a => a.status === "complete" && parseInt(a.date.split("-")[1]) === THIS_MONTH).reduce((s, a) => s + a.price, 0);
  const projectedThisMonth = appointments.filter(a => ["confirmed","pending"].includes(a.status) && parseInt(a.date.split("-")[1]) === THIS_MONTH).reduce((s, a) => s + a.price, 0);
  const projectedNextMonth = appointments.filter(a => parseInt(a.date.split("-")[1]) === NEXT_MONTH).reduce((s, a) => s + a.price, 0);
  const pending = appointments.filter(a => a.status === "pending").length;

  const confirm = (id) => setAppointments(p => p.map(a => a.id === id ? { ...a, status: "confirmed" } : a));
  const markComplete = (id) => setAppointments(p => p.map(a => a.id === id ? { ...a, status: "complete" } : a));
  const copyLink = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const saveProfile = () => { setProfile({ ...editProfile }); setShowProfileModal(false); };

  const filteredClients = CLIENTS.filter(c =>
    `${c.firstName} ${c.lastName} ${c.vehicle} ${c.email}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const apptDates = appointments.map(a => ({
    day: parseInt(a.date.split("-")[2]),
    month: parseInt(a.date.split("-")[1]),
    status: a.status
  }));

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
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{profile.name}</p>
            <p style={{ margin: 0, fontSize: 10, color: "#555" }}>Pro · Trial Active</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "0 12px" }}>
          {NAV.map(item => (
            <button key={item.label} onClick={() => {
              setActiveNav(item.label);
              setSelectedClient(null);
              if (item.label === "Public Profile") setShowProfileModal(true);
            }} style={{
              width: "100%", background: activeNav === item.label ? "#1A1A2E" : "transparent",
              border: "none", borderRadius: 10,
              borderLeft: `2px solid ${activeNav === item.label ? "#00C2FF" : "transparent"}`,
              color: activeNav === item.label ? "#00C2FF" : "#666",
              fontSize: 13, fontWeight: activeNav === item.label ? 700 : 400,
              padding: "10px 14px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              marginBottom: 2, textAlign: "left", transition: "all 0.15s"
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
              {item.label === "Appointments" && pending > 0 && (
                <span style={{ marginLeft: "auto", background: "#FFD60A", borderRadius: 10, fontSize: 10, fontWeight: 700, color: "#0A0A0F", padding: "1px 7px" }}>{pending}</span>
              )}
              {item.label === "Clients" && (
                <span style={{ marginLeft: "auto", background: "#1E1E2E", borderRadius: 10, fontSize: 10, fontWeight: 700, color: "#888", padding: "1px 7px" }}>{CLIENTS.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px 0" }}>
          <button onClick={copyLink} style={{
            width: "100%", background: copied ? "#00E5A015" : "linear-gradient(135deg, #00C2FF15, #A259FF15)",
            border: `1px solid ${copied ? "#00E5A044" : "#00C2FF33"}`,
            borderRadius: 10, color: copied ? "#00E5A0" : "#00C2FF",
            fontSize: 12, fontWeight: 700, padding: "10px 14px", cursor: "pointer", transition: "all 0.2s"
          }}>{copied ? "✓ Link Copied!" : "🔗 Copy My Link"}</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* ════════════ DASHBOARD VIEW ════════════ */}
        {activeNav === "Dashboard" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Welcome back</p>
                <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>{profile.name}</h1>
              </div>
              {pending > 0 && (
                <div style={{ background: "#FFD60A15", border: "1px solid #FFD60A33", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🔔</span>
                  <span style={{ fontSize: 13, color: "#FFD60A", fontWeight: 700 }}>{pending} Pending {pending === 1 ? "Appointment" : "Appointments"}</span>
                </div>
              )}
            </div>

            {/* Revenue Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 36 }}>
              {[
                { label: "Revenue MTD", value: fmt(revenueMTD), icon: "💰", color: "#00E5A0", sub: "Completed jobs this month", detail: `${appointments.filter(a => a.status === "complete" && parseInt(a.date.split("-")[1]) === THIS_MONTH).length} jobs completed` },
                { label: "Projected This Month", value: fmt(projectedThisMonth), icon: "📈", color: "#00C2FF", sub: "Confirmed + pending · March", detail: `${appointments.filter(a => ["confirmed","pending"].includes(a.status) && parseInt(a.date.split("-")[1]) === THIS_MONTH).length} jobs remaining` },
                { label: "Projected Next Month", value: fmt(projectedNextMonth), icon: "🗓", color: "#A259FF", sub: "All booked jobs · April", detail: `${appointments.filter(a => parseInt(a.date.split("-")[1]) === NEXT_MONTH).length} jobs booked ahead` },
              ].map(s => (
                <div key={s.label} style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "24px 26px", borderTop: `2px solid ${s.color}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${s.color}10, transparent)` }} />
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                  <p style={{ margin: "0 0 4px", fontSize: 30, fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ margin: "0 0 6px", fontSize: 11, color: "#888", letterSpacing: "0.08em", textTransform: "uppercase" }}>{s.label}</p>
                  <p style={{ margin: "0 0 4px", fontSize: 11, color: "#555" }}>{s.sub}</p>
                  <p style={{ margin: 0, fontSize: 11, color: s.color, opacity: 0.7 }}>{s.detail}</p>
                </div>
              ))}
            </div>

            {/* Appointments Table */}
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 18, overflow: "hidden", marginBottom: 28 }}>
              <div style={{ padding: "20px 28px", borderBottom: "1px solid #1E1E2E", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700 }}>Appointments</h2>
                  <p style={{ margin: 0, fontSize: 11, color: "#555" }}>March & April 2025 · {appointments.length} total</p>
                </div>
                <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 8, padding: 3, display: "flex", gap: 3 }}>
                  {["table", "calendar"].map(v => (
                    <button key={v} onClick={() => setApptView(v)} style={{
                      background: apptView === v ? "#1E1E2E" : "transparent", border: "none", borderRadius: 6,
                      color: apptView === v ? "#00C2FF" : "#555", fontSize: 12,
                      fontWeight: apptView === v ? 700 : 400, padding: "6px 14px", cursor: "pointer", transition: "all 0.2s"
                    }}>{v === "table" ? "≡ List" : "▦ Calendar"}</button>
                  ))}
                </div>
              </div>

              <div style={{ padding: "12px 28px", borderBottom: "1px solid #1A1A2A", display: "flex", gap: 20 }}>
                {Object.entries(statusConfig).map(([key, cfg]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: cfg.color }} />
                    <span style={{ fontSize: 11, color: "#666" }}>{cfg.label} ({appointments.filter(a => a.status === key).length})</span>
                  </div>
                ))}
              </div>

              {apptView === "table" && (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #1A1A2A" }}>
                      {["Client", "Vehicle", "Service", "Price", "Date & Time", "Status", "Actions"].map(h => (
                        <th key={h} style={{ padding: "12px 20px", textAlign: "left", fontSize: 10, letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => {
                      const cfg = statusConfig[a.status];
                      return (
                        <tr key={a.id} style={{ borderBottom: i < appointments.length - 1 ? "1px solid #141420" : "none" }}>
                          <td style={{ padding: "14px 20px" }}>
                            <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600 }}>{a.client}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{a.phone}</p>
                          </td>
                          <td style={{ padding: "14px 20px", fontSize: 13, color: "#888" }}>{a.vehicle}</td>
                          <td style={{ padding: "14px 20px", fontSize: 13, color: "#C8C4BC" }}>{a.service}</td>
                          <td style={{ padding: "14px 20px", fontSize: 13, color: "#00E5A0", fontWeight: 700 }}>{fmt(a.price)}</td>
                          <td style={{ padding: "14px 20px" }}>
                            <p style={{ margin: "0 0 2px", fontSize: 13, color: "#C8C4BC" }}>{a.date}</p>
                            <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{a.time}</p>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "3px 10px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{cfg.label}</span>
                          </td>
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {a.status === "pending" && (<><button onClick={() => confirm(a.id)} style={actionBtn("#00C2FF")}>✓ Confirm</button><button style={actionBtn("#FF6B35")}>↩ Alt Time</button></>)}
                              {a.status === "confirmed" && <button onClick={() => markComplete(a.id)} style={actionBtn("#00E5A0")}>✅ Mark Complete</button>}
                              {a.status === "complete" && <span style={{ fontSize: 12, color: "#444" }}>Done ✓</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {apptView === "calendar" && (
                <div style={{ padding: "28px" }}>
                  {[{ month: THIS_MONTH, label: "MARCH 2025", offset: 6, days: 31 }, { month: NEXT_MONTH, label: "APRIL 2025", offset: 2, days: 30 }].map(cal => (
                    <div key={cal.label} style={{ marginBottom: 36 }}>
                      <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888", textAlign: "center", letterSpacing: "0.15em" }}>{cal.label}</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
                        {CALENDAR_DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, color: "#444", letterSpacing: "0.1em", padding: "4px 0" }}>{d}</div>)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {Array.from({ length: cal.offset }).map((_, i) => <div key={`e${i}`} />)}
                        {Array.from({ length: cal.days }, (_, i) => i + 1).map(date => {
                          const dayAppts = apptDates.filter(a => a.day === date && a.month === cal.month);
                          const hasPending = dayAppts.some(a => a.status === "pending");
                          const hasConfirmed = dayAppts.some(a => a.status === "confirmed");
                          const hasComplete = dayAppts.some(a => a.status === "complete");
                          const dotColor = hasPending ? "#FFD60A" : hasConfirmed ? "#00C2FF" : hasComplete ? "#00E5A0" : null;
                          const hasAny = dayAppts.length > 0;
                          return (
                            <div key={date} style={{ aspectRatio: "1", borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: hasAny ? `${dotColor}15` : "#0A0A0F", border: `1px solid ${hasAny ? `${dotColor}33` : "#1A1A2A"}` }}>
                              <span style={{ fontSize: 13, color: hasAny ? "#F0EDE8" : "#555", fontWeight: hasAny ? 700 : 400 }}>{date}</span>
                              {hasAny && <span style={{ fontSize: 9, color: dotColor, fontWeight: 700 }}>{dayAppts.length} appt{dayAppts.length > 1 ? "s" : ""}</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                    {Object.entries(statusConfig).map(([key, cfg]) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: `${cfg.color}33`, border: `1px solid ${cfg.color}55` }} />
                        <span style={{ fontSize: 11, color: "#666" }}>{cfg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 18, padding: "24px 28px" }}>
              <h2 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>Quick Actions</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                {[
                  { icon: "👤", label: "Edit Public Profile", color: "#00C2FF", action: () => setShowProfileModal(true) },
                  { icon: "🛠", label: "Manage Services", color: "#A259FF", action: () => setActiveNav("Services") },
                  { icon: "📸", label: "Upload Work Photos", color: "#FF6B35", action: () => {} },
                  { icon: "🔗", label: "Copy Booking Link", color: "#FFD60A", action: copyLink },
                ].map(a => (
                  <button key={a.label} onClick={a.action} style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "18px 16px", cursor: "pointer", borderTop: `2px solid ${a.color}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
                    <span style={{ fontSize: 24 }}>{a.icon}</span>
                    <span style={{ fontSize: 12, color: "#C8C4BC", fontWeight: 600, lineHeight: 1.4 }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════ CLIENTS VIEW ════════════ */}
        {activeNav === "Clients" && !selectedClient && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>CRM</p>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your Clients</h1>
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ color: "#555", fontSize: 14 }}>🔍</span>
                  <input
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    style={{ background: "transparent", border: "none", outline: "none", color: "#F0EDE8", fontSize: 13, fontFamily: "Georgia, serif", width: 180 }}
                  />
                </div>
              </div>
            </div>

            {/* Client Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Total Clients", value: CLIENTS.length, icon: "👥", color: "#00C2FF" },
                { label: "Total Revenue", value: fmt(CLIENTS.reduce((s, c) => s + c.totalSpent, 0)), icon: "💰", color: "#00E5A0" },
                { label: "Avg. Per Client", value: fmt(CLIENTS.reduce((s, c) => s + c.totalSpent, 0) / CLIENTS.length), icon: "📊", color: "#A259FF" },
              ].map(s => (
                <div key={s.label} style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", borderTop: `2px solid ${s.color}` }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                  <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</p>
                  <p style={{ margin: 0, fontSize: 11, color: "#666", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Client Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {filteredClients.map(client => (
                <div key={client.id} onClick={() => setSelectedClient(client)}
                  style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "22px 24px", cursor: "pointer", transition: "border 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #00C2FF22, #A259FF22)",
                      border: "1.5px solid #00C2FF33",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20, fontWeight: 700, color: "#00C2FF"
                    }}>{client.firstName[0]}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 16, fontWeight: 700 }}>{client.firstName} {client.lastName}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{client.vehicle}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: "0 0 2px", fontSize: 16, fontWeight: 700, color: "#00E5A0" }}>{fmt(client.totalSpent)}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#555" }}>lifetime</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      { label: "Visits", value: client.visits },
                      { label: "Source", value: client.source },
                      { label: "Last Visit", value: client.lastVisit },
                    ].map(d => (
                      <div key={d.label} style={{ background: "#0A0A0F", border: "1px solid #1A1A2A", borderRadius: 8, padding: "8px 10px" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase" }}>{d.label}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#C8C4BC", fontWeight: 600 }}>{d.value}</p>
                      </div>
                    ))}
                  </div>

                  {client.notes && (
                    <div style={{ marginTop: 12, background: "#FFD60A08", border: "1px solid #FFD60A22", borderRadius: 8, padding: "8px 12px" }}>
                      <p style={{ margin: 0, fontSize: 12, color: "#888" }}>📝 {client.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ════════════ CLIENT DETAIL VIEW ════════════ */}
        {activeNav === "Clients" && selectedClient && (
          <>
            <button onClick={() => setSelectedClient(null)} style={{ background: "transparent", border: "none", color: "#00C2FF", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
              ← Back to Clients
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Left - Profile */}
              <div>
                <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #00C2FF22, #A259FF22)", border: "1.5px solid #00C2FF33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#00C2FF" }}>
                      {selectedClient.firstName[0]}
                    </div>
                    <div>
                      <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>{selectedClient.firstName} {selectedClient.lastName}</h2>
                      <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Client since {selectedClient.since}</p>
                    </div>
                  </div>

                  {[
                    { icon: "📱", label: "Phone", value: selectedClient.phone },
                    { icon: "✉️", label: "Email", value: selectedClient.email },
                    { icon: "🚗", label: "Vehicle", value: selectedClient.vehicle },
                    { icon: "📣", label: "Found via", value: selectedClient.source },
                  ].map(f => (
                    <div key={f.label} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 14 }}>
                      <span style={{ fontSize: 16, marginTop: 1 }}>{f.icon}</span>
                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 10, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>{f.label}</p>
                        <p style={{ margin: 0, fontSize: 14, color: "#C8C4BC" }}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[
                    { label: "Total Visits", value: selectedClient.visits, color: "#00C2FF" },
                    { label: "Total Spent", value: fmt(selectedClient.totalSpent), color: "#00E5A0" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "18px 20px", borderTop: `2px solid ${s.color}` }}>
                      <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right - History & Notes */}
              <div>
                <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
                  <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700 }}>Service History</h3>
                  {selectedClient.history.map((h, i) => {
                    const cfg = statusConfig[h.status];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < selectedClient.history.length - 1 ? "1px solid #1A1A2A" : "none" }}>
                        <div>
                          <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 600 }}>{h.service}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{h.date}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#00E5A0" }}>{fmt(h.price)}</p>
                          <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 20, fontSize: 9, fontWeight: 700, padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{cfg.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "24px" }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Notes</h3>
                  <textarea
                    defaultValue={selectedClient.notes}
                    placeholder="Add notes about this client..."
                    rows={4}
                    style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 8, color: "#F0EDE8", fontSize: 13, padding: "10px 14px", outline: "none", resize: "vertical", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12 }}
                  />
                  <button style={{ background: "linear-gradient(135deg, #00C2FF, #A259FF)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 20px", cursor: "pointer" }}>Save Notes</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Placeholder for other nav items */}
        {!["Dashboard", "Clients"].includes(activeNav) && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#555" }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🔨</p>
            <p style={{ fontSize: 18, fontWeight: 700, color: "#888", marginBottom: 8 }}>{activeNav}</p>
            <p style={{ fontSize: 14 }}>Coming soon — we're building this next!</p>
          </div>
        )}
      </div>

      {/* ── PROFILE MODAL ── */}
      {showProfileModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "40px 44px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Dashboard</p>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Edit Public Profile</h2>
              </div>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 8, color: "#888", fontSize: 18, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #00C2FF, #A259FF)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🧑</div>
              <div>
                <button style={{ background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 8, color: "#C8C4BC", fontSize: 12, fontWeight: 600, padding: "8px 16px", cursor: "pointer", display: "block", marginBottom: 6 }}>📸 Upload Profile Photo</button>
                <p style={{ margin: 0, fontSize: 11, color: "#555" }}>JPG or PNG · Max 5MB</p>
              </div>
            </div>
            {[
              { label: "Business / Display Name", key: "name" },
              { label: "Tagline", key: "tagline" },
              { label: "Contact Phone", key: "phone" },
              { label: "Instagram Handle", key: "instagram" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={labelStyle}>{f.label}</label>
                <input value={editProfile[f.key]} onChange={e => setEditProfile(p => ({ ...p, [f.key]: e.target.value }))} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Bio</label>
              <textarea value={editProfile.bio} onChange={e => setEditProfile(p => ({ ...p, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowProfileModal(false)} style={{ background: "transparent", border: "1px solid #2A2A3E", borderRadius: 10, color: "#888", fontSize: 14, fontWeight: 600, padding: "13px 20px", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveProfile} style={{ flex: 1, background: "linear-gradient(135deg, #00C2FF, #A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "13px", cursor: "pointer" }}>Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
