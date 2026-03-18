import { useState } from "react";

// ── Saved toast ──
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

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export default function AvailabilityBlocking() {
  const [screen, setScreen] = useState("main");
  const [toast, setToast] = useState(false);

  // Vacation blocks
  const [blocks, setBlocks] = useState([
    { id: 1, start: "2026-03-20", end: "2026-03-27" },
    { id: 2, start: "2026-04-05", end: "2026-04-05" },
  ]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [blockError, setBlockError] = useState("");

  // Max appts
  const [noLimit, setNoLimit] = useState(false);
  const [maxAppts, setMaxAppts] = useState(4);
  const [customInput, setCustomInput] = useState("");

  // Advance booking
  const [advanceDays, setAdvanceDays] = useState(30);
  const [minHours, setMinHours] = useState(24);

  const showToast = () => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const addBlock = () => {
    setBlockError("");
    if (!startDate) { setBlockError("Please select a start date."); return; }
    if (!endDate) { setBlockError("Please select an end date."); return; }
    if (endDate < startDate) { setBlockError("End date can't be before start date."); return; }
    setBlocks(b => [...b, { id: Date.now(), start: startDate, end: endDate }]);
    setStartDate(""); setEndDate("");
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif",
      color: "#F0EDE8", display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "48px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* MAIN */}
        {screen === "main" && (
          <>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Settings</p>
            <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>Availability & Blocking</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 32px", lineHeight: 1.7 }}>Control when clients can and can't book you.</p>

            {[
              { id: "vacation", icon: "🏖️", color: "#00C2FF", label: "Vacation / Date Blocks", desc: "Block specific dates or ranges — clients won't be able to book you on these days.", meta: blocks.length > 0 ? `${blocks.length} active block${blocks.length > 1 ? "s" : ""}` : "No blocks set" },
              { id: "maxappts", icon: "📋", color: "#A259FF", label: "Max Appointments Per Day", desc: "Set a daily cap so you don't get overbooked.", meta: noLimit ? "No limit" : `Max ${customInput || maxAppts} appts/day` },
              { id: "advancebooking", icon: "📅", color: "#FF6B35", label: "Advance Booking Window", desc: "Control how far ahead clients can book and how much notice you need.", meta: `${advanceDays} days ahead · ${minHours}hr min notice` },
            ].map(item => (
              <div key={item.id} onClick={() => setScreen(item.id)} style={{
                background: "#111118", border: "1px solid #1E1E2E",
                borderLeft: `3px solid ${item.color}`, borderRadius: 16,
                padding: "22px 24px", marginBottom: 12, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `${item.color}15`, border: `1px solid ${item.color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>{item.label}</p>
                    <p style={{ margin: "0 0 6px", fontSize: 12, color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
                    <span style={{ fontSize: 11, background: `${item.color}15`, border: `1px solid ${item.color}33`, borderRadius: 20, color: item.color, padding: "3px 10px", fontWeight: 700 }}>{item.meta}</span>
                  </div>
                </div>
                <span style={{ fontSize: 18, color: "#444", flexShrink: 0, marginLeft: 12 }}>›</span>
              </div>
            ))}
          </>
        )}

        {/* VACATION / DATE BLOCKS */}
        {screen === "vacation" && (
          <>
            <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Availability & Blocking</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Vacation / Date Blocks</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px", lineHeight: 1.7 }}>Clients will not be able to book on blocked dates.</p>

            {/* Add block */}
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "24px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700, color: "#00C2FF" }}>+ Add New Block</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 10 }}>
                <div>
                  <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Start Date</label>
                  <input type="date" value={startDate} min={today} onChange={e => { setStartDate(e.target.value); setBlockError(""); }} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 13, padding: "11px 12px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", colorScheme: "dark" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>End Date</label>
                  <input type="date" value={endDate} min={startDate || today} onChange={e => { setEndDate(e.target.value); setBlockError(""); }} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 13, padding: "11px 12px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box", colorScheme: "dark" }} />
                </div>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 11, color: "#555" }}>💡 For a single day off, set start and end to the same date.</p>
              {blockError && <p style={{ margin: "0 0 10px", fontSize: 12, color: "#FF3366", fontWeight: 700 }}>✕ {blockError}</p>}
              {startDate && endDate && endDate >= startDate && (
                <div style={{ background: "#00C2FF0A", border: "1px solid #00C2FF22", borderRadius: 10, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>📅</span>
                  <p style={{ margin: 0, fontSize: 13, color: "#00C2FF", fontWeight: 700 }}>
                    {startDate === endDate ? formatDate(startDate) : `${formatDate(startDate)} – ${formatDate(endDate)}`}
                  </p>
                </div>
              )}
              <button onClick={addBlock} disabled={!startDate || !endDate} style={{ width: "100%", background: startDate && endDate ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E", border: "none", borderRadius: 10, color: startDate && endDate ? "#fff" : "#444", fontSize: 14, fontWeight: 700, padding: "13px", cursor: startDate && endDate ? "pointer" : "not-allowed" }}>Add Block</button>
            </div>

            {/* Existing blocks */}
            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "24px" }}>
              <p style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 700 }}>
                Active Blocks
                {blocks.length > 0 && <span style={{ marginLeft: 8, fontSize: 11, background: "#00C2FF15", border: "1px solid #00C2FF33", borderRadius: 20, color: "#00C2FF", padding: "2px 10px" }}>{blocks.length}</span>}
              </p>
              {blocks.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <p style={{ fontSize: 28, margin: "0 0 8px" }}>🗓️</p>
                  <p style={{ margin: 0, fontSize: 13, color: "#555" }}>No blocked dates — you're wide open!</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {blocks.sort((a, b) => a.start.localeCompare(b.start)).map(block => (
                    <div key={block.id} style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 18 }}>🚫</span>
                        <div>
                          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>
                            {block.start === block.end ? formatDate(block.start) : `${formatDate(block.start)} – ${formatDate(block.end)}`}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{block.start === block.end ? "Single day off" : "Date range blocked"}</p>
                        </div>
                      </div>
                      <button onClick={() => setBlocks(b => b.filter(x => x.id !== block.id))} style={{ background: "#FF336610", border: "1px solid #FF336633", borderRadius: 8, color: "#FF3366", fontSize: 18, width: 36, height: 36, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🗑️</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ background: "#FF336608", border: "1px solid #FF336622", borderRadius: 10, padding: "12px 16px", marginTop: 16, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <p style={{ margin: 0, fontSize: 12, color: "#FF6666", lineHeight: 1.6 }}>Clients will not be able to select blocked dates when booking. Existing appointments on these dates are not automatically cancelled.</p>
            </div>
          </>
        )}

        {/* MAX APPOINTMENTS PER DAY */}
        {screen === "maxappts" && (
          <>
            <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Availability & Blocking</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Max Appointments Per Day</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Set a daily cap on bookings so you're never overloaded.</p>

            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px" }}>
              {/* No limit toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: noLimit ? "#00E5A008" : "#0A0A0F", border: `1px solid ${noLimit ? "#00E5A033" : "#1E1E2E"}`, borderRadius: 12, padding: "16px 18px", marginBottom: 24 }}>
                <div>
                  <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>No Appointment Limit</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#666" }}>Accept as many bookings as come in</p>
                </div>
                <div onClick={() => setNoLimit(n => !n)} style={{ width: 48, height: 26, borderRadius: 13, background: noLimit ? "#00E5A0" : "#2A2A3E", position: "relative", cursor: "pointer", flexShrink: 0, transition: "all 0.25s" }}>
                  <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: noLimit ? 25 : 3, transition: "all 0.25s" }} />
                </div>
              </div>

              {!noLimit && (
                <>
                  <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 12 }}>Daily Maximum</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map(n => {
                      const sel = maxAppts === n && !customInput;
                      return (
                        <div key={n} onClick={() => { setMaxAppts(n); setCustomInput(""); }} style={{ width: 52, height: 52, borderRadius: 12, background: sel ? "#A259FF15" : "#0A0A0F", border: `2px solid ${sel ? "#A259FF" : "#2A2A3E"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: sel ? "#A259FF" : "#666", cursor: "pointer", transition: "all 0.15s" }}>{n}</div>
                      );
                    })}
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 11, color: "#555", marginBottom: 8 }}>Or enter a custom number:</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input type="number" min={1} max={99} value={customInput} onChange={e => { setCustomInput(e.target.value); if (e.target.value) setMaxAppts(parseInt(e.target.value) || 1); }} placeholder="e.g. 7" style={{ width: 90, background: "#0A0A0F", border: `1px solid ${customInput ? "#A259FF66" : "#2A2A3E"}`, borderRadius: 10, color: "#F0EDE8", fontSize: 16, padding: "11px 14px", outline: "none", fontFamily: "Georgia, serif", fontWeight: 700 }} />
                      <p style={{ margin: 0, fontSize: 13, color: "#666" }}>appointments per day</p>
                    </div>
                  </div>
                  <div style={{ background: "#A259FF0A", border: "1px solid #A259FF22", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 20 }}>📋</span>
                    <p style={{ margin: 0, fontSize: 13, color: "#A259FF", fontWeight: 700 }}>Max <strong>{customInput || maxAppts}</strong> appointment{(customInput || maxAppts) > 1 ? "s" : ""} per day</p>
                  </div>
                </>
              )}

              {noLimit && (
                <div style={{ background: "#00E5A008", border: "1px solid #00E5A022", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>♾️</span>
                  <p style={{ margin: 0, fontSize: 13, color: "#00E5A0", fontWeight: 700 }}>No daily limit — accepting all bookings</p>
                </div>
              )}

              <button onClick={showToast} style={{ width: "100%", background: "linear-gradient(135deg,#A259FF,#00C2FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Save</button>
            </div>
          </>
        )}

        {/* ADVANCE BOOKING WINDOW */}
        {screen === "advancebooking" && (
          <>
            <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Availability & Blocking</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Advance Booking Window</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Control how far ahead clients can schedule and how much notice you need.</p>

            <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 16, padding: "28px" }}>
              {/* How far ahead */}
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>How far in advance can clients book?</label>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666" }}>Clients won't be able to book anything beyond this window.</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="number" min={1} max={365} value={advanceDays} onChange={e => setAdvanceDays(parseInt(e.target.value) || 1)} style={{ width: 90, background: "#0A0A0F", border: "1px solid #FF6B3566", borderRadius: 10, color: "#F0EDE8", fontSize: 22, padding: "11px 14px", outline: "none", fontFamily: "Georgia, serif", fontWeight: 700, textAlign: "center" }} />
                  <p style={{ margin: 0, fontSize: 14, color: "#888" }}>days in advance</p>
                </div>
                <div style={{ background: "#FF6B350A", border: "1px solid #FF6B3522", borderRadius: 10, padding: "10px 14px", marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>📅</span>
                  <p style={{ margin: 0, fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>Clients can book up to <strong>{advanceDays} days</strong> ahead from today</p>
                </div>
              </div>

              <div style={{ height: 1, background: "#1E1E2E", marginBottom: 28 }} />

              {/* Min notice */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>What is the minimum notice required?</label>
                <p style={{ margin: "0 0 16px", fontSize: 12, color: "#666" }}>Clients can't book anything sooner than this from now.</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <input type="number" min={1} max={168} value={minHours} onChange={e => setMinHours(parseInt(e.target.value) || 1)} style={{ width: 90, background: "#0A0A0F", border: "1px solid #FF6B3566", borderRadius: 10, color: "#F0EDE8", fontSize: 22, padding: "11px 14px", outline: "none", fontFamily: "Georgia, serif", fontWeight: 700, textAlign: "center" }} />
                  <p style={{ margin: 0, fontSize: 14, color: "#888" }}>hours minimum notice</p>
                </div>
                <div style={{ background: "#FF6B350A", border: "1px solid #FF6B3522", borderRadius: 10, padding: "10px 14px", marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
                  <span>⏱️</span>
                  <p style={{ margin: 0, fontSize: 12, color: "#FF6B35", fontWeight: 700 }}>Clients must book at least <strong>{minHours} hours</strong> before their appointment</p>
                </div>
              </div>

              <button onClick={showToast} style={{ width: "100%", background: "linear-gradient(135deg,#FF6B35,#A259FF)", border: "none", borderRadius: 10, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px", cursor: "pointer" }}>Save</button>
            </div>
          </>
        )}

      </div>
      <SavedToast show={toast} />
    </div>
  );
}
