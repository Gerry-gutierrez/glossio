import { useState } from "react";

export default function Step4Preview() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = password.length === 0 ? null : password.length < 8 ? "weak" : password.length < 12 ? "good" : "strong";
  const strengthColor = { weak: "#FF3366", good: "#FFD60A", strong: "#00E5A0" }[strength] || "#1E1E2E";
  const strengthLabel = { weak: "Too short", good: "Good — could be stronger", strong: "Strong password ✓" }[strength] || "";
  const strengthWidth = { weak: "25%", good: "60%", strong: "100%" }[strength] || "0%";

  const passwordsMatch = confirm && password === confirm;
  const canProceed = strength !== "weak" && strength !== null && passwordsMatch;

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
                background: s.id < 4 ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#111118",
                border: "2px solid #00C2FF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: s.id < 4 ? "#fff" : "#00C2FF",
              }}>
                {s.id < 4 ? "✓" : s.id}
              </div>
              <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: "#1E1E2E", borderRadius: 2 }}>
          <div style={{ height: "100%", width: "99%", background: "linear-gradient(90deg, #00C2FF, #A259FF)", borderRadius: 2 }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#111118", border: "1px solid #1E1E2E",
        borderRadius: 20, padding: "40px 44px",
      }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 10px" }}>Step 4 of 4</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Create your login</h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0 0 32px" }}>
          Almost there! Set a password and you're good to go.
        </p>

        {/* Sign in reminder */}
        <div style={{
          background: "#00C2FF0D", border: "1px solid #00C2FF22",
          borderRadius: 10, padding: "12px 16px", marginBottom: 28,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <span style={{ fontSize: 18 }}>🔐</span>
          <p style={{ margin: 0, fontSize: 13, color: "#00C2FF", lineHeight: 1.6 }}>
            You can sign in using your <strong>email</strong> or <strong>phone number</strong> + this password.
          </p>
        </div>

        {/* Password */}
        <label style={labelStyle}>Password</label>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type={showPass ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: 44, marginBottom: 0 }}
          />
          <button onClick={() => setShowPass(v => !v)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16
          }}>{showPass ? "🙈" : "👁"}</button>
        </div>

        {/* Strength bar */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ height: 4, background: "#1E1E2E", borderRadius: 2, marginBottom: 6 }}>
            <div style={{
              height: "100%", width: strengthWidth,
              background: strengthColor, borderRadius: 2, transition: "all 0.3s"
            }} />
          </div>
          {strength && (
            <p style={{ margin: 0, fontSize: 11, color: strengthColor, transition: "color 0.3s" }}>
              {strengthLabel}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <label style={labelStyle}>Confirm Password</label>
        <div style={{ position: "relative", marginBottom: 8 }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            style={{
              ...inputStyle, paddingRight: 44, marginBottom: 0,
              border: confirm ? `1px solid ${passwordsMatch ? "#00E5A055" : "#FF336655"}` : "1px solid #2A2A3E"
            }}
          />
          <button onClick={() => setShowConfirm(v => !v)} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16
          }}>{showConfirm ? "🙈" : "👁"}</button>
        </div>
        {confirm && (
          <p style={{ margin: "0 0 20px", fontSize: 12, color: passwordsMatch ? "#00E5A0" : "#FF3366" }}>
            {passwordsMatch ? "✓ Passwords match" : "✗ Passwords don't match"}
          </p>
        )}

        {/* Password rules */}
        <div style={{
          background: "#0A0A0F", border: "1px solid #1E1E2E",
          borderRadius: 10, padding: "14px 16px", marginBottom: 28
        }}>
          {[
            { rule: "At least 8 characters", met: password.length >= 8 },
            { rule: "At least one number", met: /\d/.test(password) },
            { rule: "Passwords match", met: passwordsMatch },
          ].map(r => (
            <div key={r.rule} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: r.met ? "#00E5A0" : "#444" }}>{r.met ? "✓" : "○"}</span>
              <span style={{ fontSize: 12, color: r.met ? "#C8C4BC" : "#555" }}>{r.rule}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: "transparent", border: "1px solid #2A2A3E",
            borderRadius: 10, color: "#888", fontSize: 14,
            fontWeight: 600, padding: "13px 20px", cursor: "pointer"
          }}>← Back</button>
          <button style={{
            flex: 1,
            background: canProceed ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
            border: "none", borderRadius: 10,
            color: canProceed ? "#fff" : "#444",
            fontSize: 14, fontWeight: 700, padding: "13px",
            cursor: canProceed ? "pointer" : "not-allowed",
            letterSpacing: "0.05em", transition: "all 0.3s"
          }}>Create My Account →</button>
        </div>
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
