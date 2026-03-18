import { useState } from "react";

export default function Step2Preview() {
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "", address: ""
  });
  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const isComplete = form.firstName && form.lastName && form.phone && form.email && form.address;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 20px",
    }}>

      {/* Logo */}
      <h1 style={{
        margin: "0 0 40px", fontSize: 26, fontWeight: 700,
        background: "linear-gradient(90deg, #00C2FF, #A259FF)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>GlossIO</h1>

      {/* Progress */}
      <div style={{ width: "100%", maxWidth: 520, marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          {[
            { id: 1, label: "Business Info" },
            { id: 2, label: "Personal Info" },
            { id: 3, label: "Verify" },
            { id: 4, label: "Create Login" },
          ].map(s => (
            <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: s.id === 1 ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#111118",
                border: s.id <= 2 ? "2px solid #00C2FF" : "2px solid #2A2A3E",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: s.id === 1 ? "#fff" : s.id === 2 ? "#00C2FF" : "#444",
              }}>
                {s.id === 1 ? "✓" : s.id}
              </div>
              <span style={{
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                color: s.id <= 2 ? "#888" : "#444"
              }}>{s.label}</span>
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: "#1E1E2E", borderRadius: 2 }}>
          <div style={{
            height: "100%", width: "33%",
            background: "linear-gradient(90deg, #00C2FF, #A259FF)",
            borderRadius: 2
          }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#111118",
        border: "1px solid #1E1E2E",
        borderRadius: 20,
        padding: "40px 44px",
      }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 10px" }}>Step 2 of 4</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Your personal info</h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0 0 32px" }}>
          This is how we'll identify your account and keep you in the loop.
        </p>

        {/* First & Last Name */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 4 }}>
          <div>
            <label style={labelStyle}>First Name</label>
            <input
              placeholder="Carlos"
              value={form.firstName}
              onChange={e => update("firstName", e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Last Name</label>
            <input
              placeholder="Martinez"
              value={form.lastName}
              onChange={e => update("lastName", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Phone */}
        <label style={labelStyle}>Phone Number</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "#555"
          }}>📱</span>
          <input
            placeholder="(239) 555-0100"
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
            style={{ ...inputStyle, paddingLeft: 40, marginBottom: 0 }}
          />
        </div>

        {/* Email */}
        <label style={labelStyle}>Email Address</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "#555"
          }}>✉️</span>
          <input
            placeholder="carlos@gmail.com"
            value={form.email}
            onChange={e => update("email", e.target.value)}
            style={{ ...inputStyle, paddingLeft: 40, marginBottom: 0 }}
          />
        </div>

        {/* Address */}
        <label style={labelStyle}>Address</label>
        <div style={{ position: "relative", marginBottom: 28 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: "#555"
          }}>📍</span>
          <input
            placeholder="123 Main St, Naples, FL 34102"
            value={form.address}
            onChange={e => update("address", e.target.value)}
            style={{ ...inputStyle, paddingLeft: 40, marginBottom: 0 }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: "transparent", border: "1px solid #2A2A3E",
            borderRadius: 10, color: "#888", fontSize: 14,
            fontWeight: 600, padding: "13px 20px", cursor: "pointer"
          }}>← Back</button>
          <button style={{
            flex: 1,
            background: isComplete ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
            border: "none", borderRadius: 10,
            color: isComplete ? "#fff" : "#444",
            fontSize: 14, fontWeight: 700, padding: "13px",
            cursor: isComplete ? "pointer" : "not-allowed",
            letterSpacing: "0.05em", transition: "all 0.3s"
          }}>Continue →</button>
        </div>

        {/* Helper note */}
        <p style={{ margin: "18px 0 0", fontSize: 12, color: "#444", textAlign: "center", lineHeight: 1.6 }}>
          Your phone and email will be verified in the next step.
        </p>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: "#555" }}>
        Already have an account?{" "}
        <a href="#" style={{ color: "#00C2FF", textDecoration: "none", fontWeight: 600 }}>Sign In</a>
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: 11, letterSpacing: "0.2em",
  color: "#666", textTransform: "uppercase", marginBottom: 8
};

const inputStyle = {
  width: "100%", background: "#0A0A0F",
  border: "1px solid #2A2A3E", borderRadius: 8,
  color: "#F0EDE8", fontSize: 14, padding: "11px 14px",
  outline: "none", fontFamily: "Georgia, serif",
  boxSizing: "border-box", display: "block", marginBottom: 16
};
