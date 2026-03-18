import { useState } from "react";

const SERVICES = [
  { id: 1, name: "Exterior Wash", price: "49.99", description: "Full exterior hand wash, clay bar treatment, and streak-free window cleaning.", icon: "💧", color: "#00C2FF" },
  { id: 2, name: "Interior Detail", price: "89.99", description: "Deep vacuum, leather conditioning, dashboard wipe-down, and odor elimination.", icon: "🪑", color: "#FF6B35" },
  { id: 3, name: "Full Detail", price: "159.99", description: "Our signature top-to-bottom treatment. Interior, exterior, tire dressing, engine bay.", icon: "✨", color: "#A259FF" },
  { id: 4, name: "Paint Correction", price: "299.99", description: "Multi-stage machine polish to remove swirls, scratches, and oxidation.", icon: "🔧", color: "#FFD60A" },
  { id: 5, name: "Ceramic Coating", price: "599.99", description: "Long-lasting ceramic protection. Repels water, dirt, and UV damage for years.", icon: "💎", color: "#00E5A0" },
];

const HOW_HEARD = [
  "Instagram", "Facebook", "Google", "TikTok",
  "Friend / Family Referral", "Saw the vehicle", "Business Card", "Other"
];

const TIMES = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
  "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Get next 14 days for date picker
const getDates = () => {
  const dates = [];
  for (let i = 1; i <= 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const fmt = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

// ── INPUT COMPONENT ──
function Field({ label, value, onChange, placeholder, type = "text", required }) {
  const empty = required && !value.trim();
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 7 }}>
        {label}{required && <span style={{ color: "#FF6B35", marginLeft: 3 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", background: "#0A0A0F",
          border: `1px solid ${empty ? "#FF6B3533" : "#2A2A3E"}`,
          borderRadius: 10, color: "#F0EDE8", fontSize: 14,
          padding: "12px 14px", outline: "none",
          fontFamily: "Georgia, serif", boxSizing: "border-box",
          transition: "border 0.2s"
        }}
      />
    </div>
  );
}

export default function BookingFlow() {
  const [selectedService, setSelectedService] = useState(null);
  const [step, setStep] = useState(0); // 0 = services list, 1-4 = booking steps, 5 = confirmed
  const [expandedService, setExpandedService] = useState(null);

  // Form state
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    year: "", make: "", model: "", color: "",
    date: null, time: "",
    howHeard: "", notes: "",
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const startBooking = (svc) => {
    setSelectedService(svc);
    setStep(1);
  };

  // Step validation
  const step1Valid = form.firstName.trim() && form.lastName.trim() && form.phone.trim() && form.email.trim();
  const step2Valid = form.year.trim() && form.make.trim() && form.model.trim() && form.color.trim();
  const step3Valid = form.date && form.time;

  if (step === 5) return <Confirmation form={form} service={selectedService} onDone={() => { setStep(0); setSelectedService(null); setForm({ firstName: "", lastName: "", phone: "", email: "", year: "", make: "", model: "", color: "", date: null, time: "", howHeard: "", notes: "" }); }} />;

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8" }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: "rgba(10,10,15,0.97)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1E1E2E", padding: "13px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 40, height: 53, boxSizing: "border-box"
      }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, background: "linear-gradient(90deg, #00C2FF, #A259FF)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>GlossIO</h2>
        {step > 0 && (
          <button onClick={() => step === 1 ? setStep(0) : setStep(s => s - 1)} style={{
            background: "#111118", border: "1px solid #2A2A3E", borderRadius: 8,
            color: "#888", fontSize: 12, fontWeight: 600, padding: "7px 14px", cursor: "pointer"
          }}>← Back</button>
        )}
      </div>

      {/* ── STEP 0: SERVICE SELECTION ── */}
      {step === 0 && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "32px 24px 60px" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Carlos Detail Co.</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 6px" }}>Book an Appointment</h1>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 28px" }}>Select a service to get started.</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {SERVICES.map(svc => {
              const isOpen = expandedService === svc.id;
              return (
                <div key={svc.id} style={{
                  background: isOpen ? `${svc.color}08` : "#111118",
                  border: `1px solid ${isOpen ? svc.color + "44" : "#1E1E2E"}`,
                  borderLeft: `3px solid ${svc.color}`,
                  borderRadius: 14, overflow: "hidden", transition: "all 0.2s"
                }}>
                  {/* Collapsed row */}
                  <div onClick={() => setExpandedService(isOpen ? null : svc.id)} style={{
                    padding: "15px 16px", display: "flex", alignItems: "center", gap: 13, cursor: "pointer"
                  }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                      background: `${svc.color}15`, border: `1px solid ${svc.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22
                    }}>{svc.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 14, fontWeight: 700 }}>{svc.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: isOpen ? "normal" : "nowrap" }}>{svc.description}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: svc.color }}>${svc.price}</p>
                      <span style={{ fontSize: 11, color: "#555" }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>

                  {/* Expanded drop */}
                  {isOpen && (
                    <div style={{ padding: "0 16px 18px", borderTop: `1px solid ${svc.color}22` }}>
                      <p style={{ margin: "14px 0 8px", fontSize: 10, letterSpacing: "0.2em", color: "#555", textTransform: "uppercase" }}>What's Included</p>
                      <p style={{ margin: "0 0 14px", fontSize: 13, color: "#C8C4BC", lineHeight: 1.8 }}>{svc.description}</p>
                      <div style={{
                        background: `${svc.color}10`, border: `1px solid ${svc.color}22`,
                        borderRadius: 10, padding: "11px 14px",
                        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14
                      }}>
                        <span style={{ fontSize: 12, color: "#888" }}>Starting at</span>
                        <span style={{ fontSize: 20, fontWeight: 700, color: svc.color }}>${svc.price}</span>
                      </div>
                      <button
                        onClick={() => startBooking(svc)}
                        style={{
                          width: "100%",
                          background: `linear-gradient(135deg, ${svc.color}, ${svc.color}bb)`,
                          border: "none", borderRadius: 10, color: "#0A0A0F",
                          fontSize: 14, fontWeight: 700, padding: "13px",
                          cursor: "pointer", letterSpacing: "0.04em"
                        }}>
                        Book {svc.name} →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEPS 1–4 ── */}
      {step > 0 && step < 5 && (
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "28px 24px 60px" }}>

          {/* Selected service chip */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: `${selectedService.color}15`,
            border: `1px solid ${selectedService.color}33`,
            borderRadius: 20, padding: "6px 14px", marginBottom: 24
          }}>
            <span>{selectedService.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: selectedService.color }}>{selectedService.name}</span>
            <span style={{ fontSize: 12, color: "#888" }}>· ${selectedService.price}</span>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
            {["Your Info", "Your Vehicle", "Date & Time", "Final Details"].map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{
                  height: 3, borderRadius: 2, marginBottom: 6,
                  background: i < step ? selectedService.color : i === step - 1 ? selectedService.color : "#1E1E2E",
                  opacity: i === step - 1 ? 1 : i < step ? 0.4 : 0.2,
                  transition: "all 0.3s"
                }} />
                <p style={{ margin: 0, fontSize: 9, color: i === step - 1 ? "#C8C4BC" : "#444", letterSpacing: "0.1em", textTransform: "uppercase", textAlign: "center" }}>{label}</p>
              </div>
            ))}
          </div>

          {/* ── STEP 1: YOUR INFO ── */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Info</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px" }}>So Carlos knows who's coming in.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="First Name" value={form.firstName} onChange={set("firstName")} placeholder="John" required />
                <Field label="Last Name" value={form.lastName} onChange={set("lastName")} placeholder="Smith" required />
              </div>
              <Field label="Phone Number" value={form.phone} onChange={set("phone")} placeholder="(239) 555-0100" type="tel" required />
              <Field label="Email Address" value={form.email} onChange={set("email")} placeholder="john@email.com" type="email" required />
              <p style={{ margin: "0 0 24px", fontSize: 11, color: "#555" }}>
                📱 Carlos will text and email your confirmation to these.
              </p>
              <button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                style={{
                  width: "100%",
                  background: step1Valid ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
                  border: "none", borderRadius: 12, color: step1Valid ? "#fff" : "#444",
                  fontSize: 15, fontWeight: 700, padding: "16px",
                  cursor: step1Valid ? "pointer" : "not-allowed", transition: "all 0.2s"
                }}>
                Next: Your Vehicle →
              </button>
            </div>
          )}

          {/* ── STEP 2: VEHICLE ── */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Your Vehicle</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px" }}>Tell Carlos what he'll be working on.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
                <Field label="Year" value={form.year} onChange={set("year")} placeholder="2021" required />
                <Field label="Color" value={form.color} onChange={set("color")} placeholder="Pearl White" required />
              </div>
              <Field label="Make" value={form.make} onChange={set("make")} placeholder="Toyota" required />
              <Field label="Model" value={form.model} onChange={set("model")} placeholder="Camry" required />

              {/* Vehicle preview */}
              {form.year && form.make && form.model && (
                <div style={{
                  background: "#111118", border: "1px solid #1E1E2E",
                  borderRadius: 12, padding: "14px 18px", marginBottom: 24,
                  display: "flex", alignItems: "center", gap: 12
                }}>
                  <span style={{ fontSize: 28 }}>🚗</span>
                  <div>
                    <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700 }}>{form.year} {form.make} {form.model}</p>
                    {form.color && <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{form.color}</p>}
                  </div>
                </div>
              )}

              <button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                style={{
                  width: "100%",
                  background: step2Valid ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
                  border: "none", borderRadius: 12, color: step2Valid ? "#fff" : "#444",
                  fontSize: 15, fontWeight: 700, padding: "16px",
                  cursor: step2Valid ? "pointer" : "not-allowed", transition: "all 0.2s"
                }}>
                Next: Pick a Date & Time →
              </button>
            </div>
          )}

          {/* ── STEP 3: DATE & TIME ── */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Pick a Date & Time</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>Choose your preferred slot. Carlos will confirm within 24 hrs.</p>

              {/* Date scroll */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Preferred Date <span style={{ color: "#FF6B35" }}>*</span></p>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 22 }}>
                {getDates().map((d, i) => {
                  const sel = form.date && fmt(form.date) === fmt(d);
                  return (
                    <div key={i} onClick={() => set("date")(d)} style={{
                      flexShrink: 0, width: 64, background: sel ? selectedService.color : "#111118",
                      border: `1px solid ${sel ? selectedService.color : "#1E1E2E"}`,
                      borderRadius: 12, padding: "12px 8px", textAlign: "center", cursor: "pointer",
                      transition: "all 0.15s"
                    }}>
                      <p style={{ margin: "0 0 4px", fontSize: 10, color: sel ? "#0A0A0F" : "#555", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {d.toLocaleDateString("en-US", { weekday: "short" })}
                      </p>
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: sel ? "#0A0A0F" : "#F0EDE8" }}>
                        {d.getDate()}
                      </p>
                      <p style={{ margin: "3px 0 0", fontSize: 9, color: sel ? "#0A0A0F" : "#555" }}>
                        {d.toLocaleDateString("en-US", { month: "short" })}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time grid */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>Preferred Time <span style={{ color: "#FF6B35" }}>*</span></p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 28 }}>
                {TIMES.map(t => {
                  const sel = form.time === t;
                  return (
                    <div key={t} onClick={() => set("time")(t)} style={{
                      background: sel ? selectedService.color : "#111118",
                      border: `1px solid ${sel ? selectedService.color : "#1E1E2E"}`,
                      borderRadius: 10, padding: "10px 6px", textAlign: "center",
                      cursor: "pointer", fontSize: 12, fontWeight: sel ? 700 : 400,
                      color: sel ? "#0A0A0F" : "#C8C4BC", transition: "all 0.15s"
                    }}>{t}</div>
                  );
                })}
              </div>

              <button
                onClick={() => setStep(4)}
                disabled={!step3Valid}
                style={{
                  width: "100%",
                  background: step3Valid ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
                  border: "none", borderRadius: 12, color: step3Valid ? "#fff" : "#444",
                  fontSize: 15, fontWeight: 700, padding: "16px",
                  cursor: step3Valid ? "pointer" : "not-allowed", transition: "all 0.2s"
                }}>
                Next: Final Details →
              </button>
            </div>
          )}

          {/* ── STEP 4: FINAL DETAILS + REVIEW ── */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 6px" }}>Almost Done!</h2>
              <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px" }}>One last thing — then review your booking.</p>

              {/* How did you hear */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 10px" }}>How did you hear about Carlos?</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
                {HOW_HEARD.map(opt => {
                  const sel = form.howHeard === opt;
                  return (
                    <div key={opt} onClick={() => set("howHeard")(opt)} style={{
                      background: sel ? "#00C2FF15" : "#111118",
                      border: `1px solid ${sel ? "#00C2FF44" : "#1E1E2E"}`,
                      borderRadius: 10, padding: "10px 14px",
                      fontSize: 13, color: sel ? "#00C2FF" : "#888",
                      fontWeight: sel ? 700 : 400,
                      cursor: "pointer", transition: "all 0.15s"
                    }}>{opt}</div>
                  );
                })}
              </div>

              {/* Notes */}
              <p style={{ fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", margin: "0 0 8px" }}>Additional Notes <span style={{ fontSize: 10, color: "#444", textTransform: "none", letterSpacing: 0 }}>(optional)</span></p>
              <textarea
                value={form.notes}
                onChange={e => set("notes")(e.target.value)}
                placeholder="Any special requests, damage to note, gate codes, etc."
                rows={3}
                style={{
                  width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E",
                  borderRadius: 10, color: "#F0EDE8", fontSize: 13,
                  padding: "12px 14px", outline: "none", resize: "vertical",
                  fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 24
                }}
              />

              {/* Booking Summary */}
              <div style={{
                background: "#111118", border: "1px solid #1E1E2E",
                borderRadius: 14, padding: "22px 24px", marginBottom: 22
              }}>
                <p style={{ margin: "0 0 16px", fontSize: 10, letterSpacing: "0.25em", color: "#555", textTransform: "uppercase" }}>Booking Summary</p>

                {[
                  { label: "Service", value: `${selectedService.icon} ${selectedService.name} — $${selectedService.price}` },
                  { label: "Client", value: `${form.firstName} ${form.lastName}` },
                  { label: "Contact", value: `${form.phone} · ${form.email}` },
                  { label: "Vehicle", value: `${form.year} ${form.make} ${form.model} (${form.color})` },
                  { label: "Date", value: form.date ? fmt(form.date) : "—" },
                  { label: "Time", value: form.time || "—" },
                ].map(row => (
                  <div key={row.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                    gap: 12, paddingBottom: 10, marginBottom: 10,
                    borderBottom: "1px solid #1A1A2E"
                  }}>
                    <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: "#C8C4BC", textAlign: "right" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 4 }}>
                  <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: selectedService.color }}>${selectedService.price}</span>
                </div>
              </div>

              <button
                onClick={() => setStep(5)}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #00C2FF, #A259FF)",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 700, padding: "18px",
                  cursor: "pointer", boxShadow: "0 6px 32px #00C2FF33",
                  letterSpacing: "0.03em"
                }}>
                🗓 Confirm Booking Request
              </button>
              <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 11, color: "#555" }}>
                Carlos will confirm within 24 hours via text & email.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── CONFIRMATION SCREEN ──
function Confirmation({ form, service, onDone }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>

      {/* Success icon */}
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: "linear-gradient(135deg, #00E5A022, #00C2FF22)",
        border: "2px solid #00E5A055",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 44, marginBottom: 24,
        boxShadow: "0 0 40px #00E5A018"
      }}>✓</div>

      <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px" }}>Booking Request Sent!</h1>
      <p style={{ fontSize: 14, color: "#777", margin: "0 0 32px", maxWidth: 340, lineHeight: 1.7 }}>
        Carlos will review your request and confirm within 24 hours. You'll get a text and email at:
      </p>

      <div style={{
        background: "#111118", border: "1px solid #1E1E2E",
        borderRadius: 14, padding: "18px 24px", marginBottom: 28,
        width: "100%", maxWidth: 360
      }}>
        <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700 }}>{form.firstName} {form.lastName}</p>
        <p style={{ margin: "0 0 4px", fontSize: 13, color: "#888" }}>📱 {form.phone}</p>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>✉️ {form.email}</p>
        <div style={{ borderTop: "1px solid #1E1E2E", paddingTop: 14 }}>
          <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700 }}>{service.icon} {service.name} — ${service.price}</p>
          <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
            {form.date ? form.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }) : ""} · {form.time}
          </p>
        </div>
      </div>

      <div style={{
        background: "#00C2FF08", border: "1px solid #00C2FF1A",
        borderRadius: 12, padding: "14px 18px", marginBottom: 28,
        maxWidth: 360, width: "100%"
      }}>
        <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>
          💡 Once Carlos confirms, you'll receive a final text with all the details. No payment is due until the job is complete.
        </p>
      </div>

      <button onClick={onDone} style={{
        background: "transparent", border: "1px solid #2A2A3E",
        borderRadius: 10, color: "#888", fontSize: 13,
        fontWeight: 600, padding: "12px 28px", cursor: "pointer"
      }}>← Back to Profile</button>
    </div>
  );
}
