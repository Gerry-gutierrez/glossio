import { useState } from "react";

const CLIENTS = [
  {
    id: 1, firstName: "Marcus", lastName: "T.", phone: "(239) 555-0101",
    email: "marcus@gmail.com", vehicle: "2021 BMW M3", source: "Instagram",
    since: "Jan 2025", lastVisit: "Mar 6, 2025", totalSpent: 479.97,
    visits: 3, status: "active", notes: "Prefers morning appointments. Very particular about interior.",
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
    visits: 2, status: "active", notes: "",
    history: [
      { date: "Mar 6, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
      { date: "Feb 20, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
    ]
  },
  {
    id: 3, firstName: "Devon", lastName: "S.", phone: "(239) 555-0103",
    email: "devon@gmail.com", vehicle: "2020 Dodge Charger", source: "TikTok",
    since: "Mar 2025", lastVisit: "Upcoming Mar 10", totalSpent: 0,
    visits: 0, status: "never_came", notes: "First time client. Found us on TikTok.",
    history: [
      { date: "Mar 10, 2025", service: "Paint Correction", price: 299.99, status: "confirmed" },
    ]
  },
  {
    id: 4, firstName: "Aisha", lastName: "M.", phone: "(239) 555-0104",
    email: "aisha@gmail.com", vehicle: "2022 Tesla Model 3", source: "Instagram",
    since: "Feb 2025", lastVisit: "Upcoming Mar 12", totalSpent: 89.99,
    visits: 1, status: "active", notes: "Interested in ceramic coating down the line.",
    history: [
      { date: "Mar 12, 2025", service: "Interior Detail", price: 89.99, status: "confirmed" },
      { date: "Feb 5, 2025", service: "Interior Detail", price: 89.99, status: "complete" },
    ]
  },
  {
    id: 5, firstName: "Tyler", lastName: "W.", phone: "(239) 555-0105",
    email: "tyler@gmail.com", vehicle: "2023 Ford F-150", source: "Facebook",
    since: "Mar 2025", lastVisit: "—", totalSpent: 0,
    visits: 0, status: "never_came", notes: "",
    history: [
      { date: "Mar 15, 2025", service: "Full Detail", price: 159.99, status: "pending" },
    ]
  },
  {
    id: 6, firstName: "Sofia", lastName: "L.", phone: "(239) 555-0106",
    email: "sofia@gmail.com", vehicle: "2020 Porsche Cayenne", source: "Word of Mouth",
    since: "Jan 2025", lastVisit: "Upcoming Mar 20", totalSpent: 759.98,
    visits: 2, status: "active", notes: "High value client. Referred 2 friends.",
    history: [
      { date: "Mar 20, 2025", service: "Ceramic Coat", price: 599.99, status: "confirmed" },
      { date: "Jan 8, 2025", service: "Full Detail", price: 159.99, status: "complete" },
    ]
  },
  {
    id: 7, firstName: "Ray", lastName: "P.", phone: "(239) 555-0107",
    email: "ray@gmail.com", vehicle: "2022 Chevy Silverado", source: "TikTok",
    since: "Mar 2025", lastVisit: "—", totalSpent: 0,
    visits: 0, status: "never_came", notes: "",
    history: [
      { date: "Apr 2, 2025", service: "Full Detail", price: 159.99, status: "confirmed" },
    ]
  },
  {
    id: 8, firstName: "Nadia", lastName: "K.", phone: "(239) 555-0108",
    email: "nadia@gmail.com", vehicle: "2021 Kia Telluride", source: "Instagram",
    since: "Mar 2025", lastVisit: "—", totalSpent: 0,
    visits: 0, status: "never_came", notes: "",
    history: []
  },
  {
    id: 9, firstName: "Chris", lastName: "B.", phone: "(239) 555-0109",
    email: "chris@gmail.com", vehicle: "2019 Toyota Camry", source: "Facebook",
    since: "Feb 2025", lastVisit: "Feb 15, 2025", totalSpent: 209.97,
    visits: 3, status: "active", notes: "Always books on weekends.",
    history: [
      { date: "Apr 8, 2025", service: "Exterior Wash", price: 49.99, status: "confirmed" },
      { date: "Feb 15, 2025", service: "Full Detail", price: 159.99, status: "complete" },
      { date: "Jan 20, 2025", service: "Exterior Wash", price: 49.99, status: "complete" },
    ]
  },
];

const statusConfig = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Complete" },
};

const fmt = (n) => `$${n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

const SORT_OPTIONS = [
  { value: "az", label: "A → Z" },
  { value: "za", label: "Z → A" },
  { value: "recent", label: "Most Recent" },
  { value: "most_spent", label: "Top Spenders" },
  { value: "most_visits", label: "Most Visits" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All Clients" },
  { value: "active", label: "Came Through ✅" },
  { value: "never_came", label: "Never Came 👀" },
];

export default function ClientsTab() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  const [selectedClient, setSelectedClient] = useState(null);

  const filtered = CLIENTS
    .filter(c => {
      const matchSearch = `${c.firstName} ${c.lastName} ${c.vehicle} ${c.email} ${c.source}`
        .toLowerCase().includes(search.toLowerCase());
      const matchFilter = filterBy === "all" || c.status === filterBy;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortBy === "az") return a.firstName.localeCompare(b.firstName);
      if (sortBy === "za") return b.firstName.localeCompare(a.firstName);
      if (sortBy === "most_spent") return b.totalSpent - a.totalSpent;
      if (sortBy === "most_visits") return b.visits - a.visits;
      if (sortBy === "recent") return b.id - a.id;
      return 0;
    });

  if (selectedClient) {
    return <ClientDetail client={selectedClient} onBack={() => setSelectedClient(null)} />;
  }

  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#F0EDE8", minHeight: "100vh", background: "#0A0A0F", padding: "36px 40px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>CRM</p>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Your Clients</h1>
      </div>

      {/* Summary Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Clients", value: CLIENTS.length, icon: "👥", color: "#00C2FF" },
          { label: "Came Through", value: CLIENTS.filter(c => c.status === "active").length, icon: "✅", color: "#00E5A0" },
          { label: "Never Came", value: CLIENTS.filter(c => c.status === "never_came").length, icon: "👀", color: "#FFD60A" },
          { label: "Total Revenue", value: fmt(CLIENTS.reduce((s, c) => s + c.totalSpent, 0)), icon: "💰", color: "#A259FF" },
        ].map(s => (
          <div key={s.label} style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 14, padding: "18px 20px", borderTop: `2px solid ${s.color}`
          }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>{s.icon}</div>
            <p style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ margin: 0, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{
        background: "#111118", border: "1px solid #1E1E2E",
        borderRadius: 14, padding: "16px 20px", marginBottom: 20,
        display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap"
      }}>
        {/* Search */}
        <div style={{
          flex: 1, minWidth: 200,
          background: "#0A0A0F", border: "1px solid #2A2A3E",
          borderRadius: 8, padding: "9px 14px",
          display: "flex", gap: 8, alignItems: "center"
        }}>
          <span style={{ color: "#555", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Search by name, vehicle, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: "transparent", border: "none", outline: "none", color: "#F0EDE8", fontSize: 13, fontFamily: "Georgia, serif", width: "100%" }}
          />
          {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 14 }}>✕</button>}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#1E1E2E" }} />

        {/* Filter Tabs */}
        <div style={{ display: "flex", gap: 6 }}>
          {FILTER_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilterBy(opt.value)} style={{
              background: filterBy === opt.value ? "#1E1E2E" : "transparent",
              border: `1px solid ${filterBy === opt.value ? "#00C2FF44" : "#1E1E2E"}`,
              borderRadius: 8, color: filterBy === opt.value ? "#00C2FF" : "#666",
              fontSize: 12, fontWeight: filterBy === opt.value ? 700 : 400,
              padding: "7px 14px", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap"
            }}>{opt.label}</button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: "#1E1E2E" }} />

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", whiteSpace: "nowrap" }}>Sort by</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              background: "#0A0A0F", border: "1px solid #2A2A3E",
              borderRadius: 8, color: "#F0EDE8", fontSize: 12,
              padding: "8px 12px", outline: "none",
              fontFamily: "Georgia, serif", cursor: "pointer"
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Result count */}
        <span style={{ fontSize: 12, color: "#444", whiteSpace: "nowrap" }}>
          {filtered.length} of {CLIENTS.length} clients
        </span>
      </div>

      {/* Client List */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 40px", color: "#555" }}>
          <p style={{ fontSize: 40 }}>🔍</p>
          <p style={{ fontSize: 16 }}>No clients match your search.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(client => (
            <div key={client.id} onClick={() => setSelectedClient(client)}
              style={{
                background: "#111118", border: "1px solid #1E1E2E",
                borderRadius: 14, padding: "18px 24px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 18,
                transition: "border 0.2s",
                borderLeft: `3px solid ${client.status === "active" ? "#00E5A0" : "#FFD60A"}`
              }}>

              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: client.status === "active" ? "linear-gradient(135deg, #00E5A022, #00C2FF22)" : "linear-gradient(135deg, #FFD60A22, #FF6B3522)",
                border: `1.5px solid ${client.status === "active" ? "#00E5A033" : "#FFD60A33"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontWeight: 700,
                color: client.status === "active" ? "#00E5A0" : "#FFD60A"
              }}>{client.firstName[0]}</div>

              {/* Name & Vehicle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{client.firstName} {client.lastName}</p>
                  <span style={{
                    background: client.status === "active" ? "#00E5A015" : "#FFD60A15",
                    color: client.status === "active" ? "#00E5A0" : "#FFD60A",
                    border: `1px solid ${client.status === "active" ? "#00E5A033" : "#FFD60A33"}`,
                    borderRadius: 20, fontSize: 9, fontWeight: 700,
                    padding: "2px 8px", textTransform: "uppercase", letterSpacing: "0.1em"
                  }}>{client.status === "active" ? "Came Through" : "Never Came"}</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{client.vehicle} · via {client.source}</p>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 24, flexShrink: 0 }}>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: "#00C2FF" }}>{client.visits}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Visits</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 700, color: "#00E5A0" }}>{fmt(client.totalSpent)}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Spent</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 600, color: "#888" }}>{client.lastVisit}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Last Visit</p>
                </div>
              </div>

              <span style={{ color: "#444", fontSize: 18, flexShrink: 0 }}>›</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientDetail({ client, onBack }) {
  return (
    <div style={{ fontFamily: "Georgia, serif", color: "#F0EDE8", minHeight: "100vh", background: "#0A0A0F", padding: "36px 40px" }}>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: "#00C2FF", fontSize: 13, cursor: "pointer", marginBottom: 24, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
        ← Back to Clients
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left */}
        <div>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "linear-gradient(135deg, #00C2FF22, #A259FF22)",
                border: "1.5px solid #00C2FF33",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, color: "#00C2FF"
              }}>{client.firstName[0]}</div>
              <div>
                <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700 }}>{client.firstName} {client.lastName}</h2>
                <p style={{ margin: 0, fontSize: 13, color: "#666" }}>Client since {client.since}</p>
              </div>
            </div>
            {[
              { icon: "📱", label: "Phone", value: client.phone },
              { icon: "✉️", label: "Email", value: client.email },
              { icon: "🚗", label: "Vehicle", value: client.vehicle },
              { icon: "📣", label: "Found via", value: client.source },
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

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Total Visits", value: client.visits, color: "#00C2FF" },
              { label: "Total Spent", value: fmt(client.totalSpent), color: "#00E5A0" },
            ].map(s => (
              <div key={s.label} style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 12, padding: "18px 20px", borderTop: `2px solid ${s.color}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}
        <div>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px", marginBottom: 20 }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700 }}>Service History</h3>
            {client.history.length === 0 ? (
              <p style={{ color: "#555", fontSize: 13 }}>No services yet.</p>
            ) : client.history.map((h, i) => {
              const cfg = statusConfig[h.status];
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < client.history.length - 1 ? "1px solid #1A1A2A" : "none" }}>
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
              defaultValue={client.notes}
              placeholder="Add notes about this client..."
              rows={4}
              style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 8, color: "#F0EDE8", fontSize: 13, padding: "10px 14px", outline: "none", resize: "vertical", fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 12 }}
            />
            <button style={{ background: "linear-gradient(135deg, #00C2FF, #A259FF)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, padding: "9px 20px", cursor: "pointer" }}>Save Notes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
