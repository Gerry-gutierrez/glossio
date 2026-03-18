import { useState } from "react";

const INITIAL_SERVICES = [
  { id: 1, name: "Exterior Wash", price: "49.99", description: "Full exterior hand wash, clay bar treatment, and streak-free window cleaning. Leaves your paint gleaming.", icon: "💧", color: "#00C2FF" },
  { id: 2, name: "Interior Detail", price: "89.99", description: "Deep vacuum, leather conditioning, dashboard wipe-down, and odor elimination. Your cabin, refreshed.", icon: "🪑", color: "#FF6B35" },
  { id: 3, name: "Full Detail", price: "159.99", description: "Our signature top-to-bottom treatment. Exterior wash, interior detail, tire dressing, and engine bay clean.", icon: "✨", color: "#A259FF" },
  { id: 4, name: "Paint Correction", price: "299.99", description: "Multi-stage machine polish to remove swirls, scratches, and oxidation. Restore showroom-level gloss.", icon: "🔧", color: "#FFD60A" },
];

const ICON_OPTIONS = ["🚗","💧","✨","🔧","🪑","🧼","💎","🏆","⚡","🌟","🛞","🪣","🎯","🔥","🌊"];
const COLOR_OPTIONS = ["#00C2FF","#FF6B35","#A259FF","#FFD60A","#00E5A0","#FF3366","#FF9F1C","#2EC4B6"];

const NAV = [
  { icon: "⚡", label: "Dashboard" },
  { icon: "📅", label: "Appointments" },
  { icon: "👥", label: "Clients" },
  { icon: "🛠", label: "Services" },
  { icon: "👤", label: "Public Profile" },
  { icon: "🔗", label: "My Link" },
  { icon: "⚙️", label: "Settings" },
];

let nextId = 5;

export default function ServicesTab() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [activeTab, setActiveTab] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newService, setNewService] = useState({ name: "", price: "", description: "", icon: "🚗", color: "#00C2FF" });
  const [saved, setSaved] = useState(false);

  const active = services.find(s => s.id === activeTab) || services[0];

  const startEdit = (svc) => {
    setEditingId(svc.id);
    setEditData({ name: svc.name, price: svc.price, description: svc.description, icon: svc.icon, color: svc.color });
  };

  const saveEdit = () => {
    setServices(services.map(s => s.id === editingId ? { ...s, ...editData } : s));
    setEditingId(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cancelEdit = () => setEditingId(null);

  const confirmDelete = (id) => {
    const remaining = services.filter(s => s.id !== id);
    setServices(remaining);
    setDeleteConfirm(null);
    if (remaining.length > 0) setActiveTab(remaining[0].id);
  };

  const addService = () => {
    if (!newService.name.trim()) return;
    const svc = { ...newService, id: nextId++ };
    setServices([...services, svc]);
    setActiveTab(svc.id);
    setShowAddModal(false);
    setNewService({ name: "", price: "", description: "", icon: "🚗", color: "#00C2FF" });
  };

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
            <button key={item.label} style={{
              width: "100%",
              background: item.label === "Services" ? "#1A1A2E" : "transparent",
              border: "none", borderRadius: 10,
              borderLeft: `2px solid ${item.label === "Services" ? "#00C2FF" : "transparent"}`,
              color: item.label === "Services" ? "#00C2FF" : "#666",
              fontSize: 13, fontWeight: item.label === "Services" ? 700 : 400,
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
          <button style={{
            width: "100%", background: "linear-gradient(135deg, #00C2FF15, #A259FF15)",
            border: "1px solid #00C2FF33", borderRadius: 10, color: "#00C2FF",
            fontSize: 12, fontWeight: 700, padding: "10px 14px", cursor: "pointer"
          }}>🔗 Copy My Link</button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, padding: "36px 40px", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Detailer Dashboard</p>
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Services</h1>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {saved && <span style={{ fontSize: 12, color: "#00E5A0", fontWeight: 700 }}>✓ Changes Saved!</span>}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                background: "linear-gradient(135deg, #00C2FF, #A259FF)",
                border: "none", borderRadius: 8, color: "#fff",
                fontSize: 13, fontWeight: 700, padding: "10px 20px",
                cursor: "pointer", letterSpacing: "0.05em"
              }}>+ Add Service</button>
          </div>
        </div>

        {/* Info Banner */}
        <div style={{
          background: "#00C2FF0A", border: "1px solid #00C2FF1A",
          borderRadius: 12, padding: "12px 18px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 10
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <p style={{ margin: 0, fontSize: 13, color: "#00C2FF", lineHeight: 1.5 }}>
            These are the services your clients see on your public profile. Keep them updated so clients know exactly what you offer and what it costs.
          </p>
        </div>

        {/* Services Count */}
        <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
          {[
            { label: "Total Services", value: services.length, color: "#00C2FF" },
            { label: "Starting From", value: `$${Math.min(...services.map(s => parseFloat(s.price))).toFixed(2)}`, color: "#00E5A0" },
            { label: "Up To", value: `$${Math.max(...services.map(s => parseFloat(s.price))).toFixed(2)}`, color: "#A259FF" },
          ].map(s => (
            <div key={s.label} style={{
              background: "#111118", border: "1px solid #1E1E2E",
              borderRadius: 12, padding: "16px 20px", flex: 1,
              borderTop: `2px solid ${s.color}`
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Service Tabs + Content */}
        {services.length > 0 ? (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 18, overflow: "hidden" }}>

            {/* Tabs row */}
            <div style={{
              background: "linear-gradient(135deg, #0D0D15, #111118)",
              borderBottom: "1px solid #1E1E2E",
              padding: "0 24px",
              display: "flex", gap: 4, overflowX: "auto"
            }}>
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => { setActiveTab(svc.id); setEditingId(null); }}
                  style={{
                    background: activeTab === svc.id ? "#111118" : "transparent",
                    border: "none",
                    borderBottom: activeTab === svc.id ? `2px solid ${svc.color}` : "2px solid transparent",
                    color: activeTab === svc.id ? "#F0EDE8" : "#666",
                    fontSize: 13,
                    fontWeight: activeTab === svc.id ? 700 : 400,
                    padding: "14px 18px",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 7
                  }}>
                  <span>{svc.icon}</span>
                  <span>{svc.name}</span>
                </button>
              ))}
            </div>

            {/* Active Service Content */}
            {active && (
              <div style={{ padding: "32px 36px" }}>
                {editingId === active.id ? (
                  /* ── EDIT MODE ── */
                  <div>
                    <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 24px" }}>Editing — {active.name}</p>

                    <p style={labelStyle}>Choose Icon</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                      {ICON_OPTIONS.map(ic => (
                        <button key={ic} onClick={() => setEditData({ ...editData, icon: ic })} style={{
                          fontSize: 20, width: 42, height: 42, borderRadius: 8, cursor: "pointer",
                          background: editData.icon === ic ? "#1E1E2E" : "transparent",
                          border: editData.icon === ic ? "2px solid #00C2FF" : "2px solid #2A2A3E",
                          display: "flex", alignItems: "center", justifyContent: "center"
                        }}>{ic}</button>
                      ))}
                    </div>

                    <p style={labelStyle}>Accent Color</p>
                    <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
                      {COLOR_OPTIONS.map(c => (
                        <button key={c} onClick={() => setEditData({ ...editData, color: c })} style={{
                          width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer",
                          border: editData.color === c ? "3px solid #fff" : "3px solid transparent"
                        }} />
                      ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 4 }}>
                      <div>
                        <p style={labelStyle}>Service Name</p>
                        <input style={inputStyle} value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                      </div>
                      <div>
                        <p style={labelStyle}>Price ($)</p>
                        <input style={inputStyle} value={editData.price} onChange={e => setEditData({ ...editData, price: e.target.value })} />
                      </div>
                    </div>

                    <p style={labelStyle}>Description</p>
                    <textarea style={{ ...inputStyle, height: 100, resize: "vertical" }} value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />

                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button onClick={saveEdit} style={primaryBtn}>Save Changes</button>
                      <button onClick={cancelEdit} style={ghostBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* ── VIEW MODE ── */
                  <div>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{
                          width: 68, height: 68, borderRadius: 16,
                          background: `${active.color}18`,
                          border: `1.5px solid ${active.color}44`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30
                        }}>{active.icon}</div>
                        <div>
                          <h2 style={{ margin: "0 0 6px", fontSize: 26, fontWeight: 700 }}>{active.name}</h2>
                          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: active.color }}>${active.price}</p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(active)} style={{
                          background: "#1A1A2E", border: "1px solid #2A2A3E",
                          borderRadius: 8, color: "#C8C4BC", fontSize: 12,
                          fontWeight: 600, padding: "9px 16px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6
                        }}>✏️ Edit</button>
                        <button onClick={() => setDeleteConfirm(active.id)} style={{
                          background: "#1E0A0F", border: "1px solid #FF336633",
                          borderRadius: 8, color: "#FF3366", fontSize: 12,
                          fontWeight: 600, padding: "9px 16px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 6
                        }}>🗑 Remove</button>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{
                      background: "#0A0A0F", border: "1px solid #1E1E2E",
                      borderRadius: 12, padding: "20px 24px", marginBottom: 24
                    }}>
                      <p style={{ fontSize: 10, letterSpacing: "0.25em", color: "#444", textTransform: "uppercase", margin: "0 0 10px" }}>What's Included</p>
                      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, color: "#C8C4BC" }}>{active.description}</p>
                    </div>

                    {/* Price display */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
                      <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.2em", textTransform: "uppercase" }}>Starting At</span>
                      <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
                    </div>
                    <p style={{ textAlign: "center", fontSize: 42, fontWeight: 700, margin: "0 0 8px", color: active.color }}>${active.price}</p>
                    <p style={{ textAlign: "center", fontSize: 12, color: "#555", margin: 0 }}>This is what clients see on your public profile</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 18, padding: "80px 40px", textAlign: "center"
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>🛠</p>
            <h3 style={{ margin: "0 0 10px", fontSize: 20, color: "#888" }}>No services yet</h3>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: "#555" }}>Add your first service so clients know what you offer.</p>
            <button onClick={() => setShowAddModal(true)} style={primaryBtn}>+ Add Your First Service</button>
          </div>
        )}
      </div>

      {/* ── ADD SERVICE MODAL ── */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 }}>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 40px", width: "100%", maxWidth: 500, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Add New Service</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 8, color: "#888", fontSize: 18, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
            </div>

            <p style={labelStyle}>Choose Icon</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {ICON_OPTIONS.map(ic => (
                <button key={ic} onClick={() => setNewService({ ...newService, icon: ic })} style={{
                  fontSize: 20, width: 42, height: 42, borderRadius: 8, cursor: "pointer",
                  background: newService.icon === ic ? "#1E1E2E" : "transparent",
                  border: newService.icon === ic ? "2px solid #00C2FF" : "2px solid #2A2A3E",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>{ic}</button>
              ))}
            </div>

            <p style={labelStyle}>Accent Color</p>
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {COLOR_OPTIONS.map(c => (
                <button key={c} onClick={() => setNewService({ ...newService, color: c })} style={{
                  width: 30, height: 30, borderRadius: "50%", background: c, cursor: "pointer",
                  border: newService.color === c ? "3px solid #fff" : "3px solid transparent"
                }} />
              ))}
            </div>

            <p style={labelStyle}>Service Name</p>
            <input style={inputStyle} value={newService.name} onChange={e => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. Ceramic Coating" />

            <p style={labelStyle}>Price ($)</p>
            <input style={inputStyle} value={newService.price} onChange={e => setNewService({ ...newService, price: e.target.value })} placeholder="e.g. 199.99" />

            <p style={labelStyle}>Description</p>
            <textarea style={{ ...inputStyle, height: 90, resize: "vertical" }} value={newService.description} onChange={e => setNewService({ ...newService, description: e.target.value })} placeholder="What's included in this service?" />

            {/* Live Preview */}
            {newService.name && (
              <div style={{ background: "#0A0A0F", border: `1px solid ${newService.color}33`, borderRadius: 12, padding: "16px 18px", marginBottom: 24, borderLeft: `3px solid ${newService.color}` }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>Preview</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 24 }}>{newService.icon}</span>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700 }}>{newService.name}</p>
                    {newService.price && <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: newService.color }}>${newService.price}</p>}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowAddModal(false)} style={ghostBtn}>Cancel</button>
              <button onClick={addService} disabled={!newService.name.trim()} style={{
                ...primaryBtn,
                flex: 1,
                opacity: newService.name.trim() ? 1 : 0.4,
                cursor: newService.name.trim() ? "pointer" : "not-allowed"
              }}>Add Service</button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 18, padding: "36px 40px", width: 380, textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>🗑</p>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>Remove this service?</h3>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: "#666" }}>
              Clients will no longer see this on your public profile. This can't be undone.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={() => confirmDelete(deleteConfirm)} style={{ ...primaryBtn, background: "linear-gradient(135deg, #FF3366, #FF6B35)" }}>Yes, Remove It</button>
              <button onClick={() => setDeleteConfirm(null)} style={ghostBtn}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, letterSpacing: "0.2em",
  color: "#666", textTransform: "uppercase", marginBottom: 8
};

const inputStyle = {
  width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E",
  borderRadius: 8, color: "#F0EDE8", fontSize: 14, padding: "10px 14px",
  outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box",
  display: "block", marginBottom: 16
};

const primaryBtn = {
  background: "linear-gradient(135deg, #00C2FF, #A259FF)",
  border: "none", borderRadius: 8, color: "#fff",
  fontSize: 13, fontWeight: 700, padding: "11px 24px",
  cursor: "pointer", letterSpacing: "0.05em"
};

const ghostBtn = {
  background: "transparent", border: "1px solid #2A2A3E",
  borderRadius: 8, color: "#888", fontSize: 13,
  fontWeight: 600, padding: "11px 24px", cursor: "pointer"
};
