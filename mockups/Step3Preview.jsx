import { useState } from "react";

export default function Step3Preview() {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const bothVerified = emailVerified && phoneVerified;

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
                background: s.id < 3 ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#111118",
                border: s.id <= 3 ? "2px solid #00C2FF" : "2px solid #2A2A3E",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700,
                color: s.id < 3 ? "#fff" : s.id === 3 ? "#00C2FF" : "#444",
              }}>
                {s.id < 3 ? "✓" : s.id}
              </div>
              <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: s.id <= 3 ? "#888" : "#444" }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div style={{ height: 2, background: "#1E1E2E", borderRadius: 2 }}>
          <div style={{ height: "100%", width: "66%", background: "linear-gradient(90deg, #00C2FF, #A259FF)", borderRadius: 2 }} />
        </div>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#111118", border: "1px solid #1E1E2E",
        borderRadius: 20, padding: "40px 44px",
      }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 10px" }}>Step 3 of 4</p>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Verify your info</h2>
        <p style={{ fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0 0 32px" }}>
          We sent a 6-digit code to your email and phone number. Enter both below to confirm it's really you.
        </p>

        {/* Email Verify Block */}
        <div style={{
          background: "#0A0A0F",
          border: `1px solid ${emailVerified ? "#00E5A055" : "#1E1E2E"}`,
          borderRadius: 14, padding: "22px", marginBottom: 16,
          transition: "border 0.3s"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase" }}>
              ✉️ Email Code
            </label>
            {emailVerified && (
              <span style={{
                background: "#00E5A022", border: "1px solid #00E5A044",
                borderRadius: 20, padding: "2px 10px",
                fontSize: 10, color: "#00E5A0", fontWeight: 700, letterSpacing: "0.1em"
              }}>✓ VERIFIED</span>
            )}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#555" }}>Sent to car***@gmail.com</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Enter 6-digit code"
              value={emailCode}
              onChange={e => setEmailCode(e.target.value)}
              maxLength={6}
              disabled={emailVerified}
              style={{
                flex: 1, background: emailVerified ? "#0D0D15" : "#111118",
                border: "1px solid #2A2A3E", borderRadius: 8,
                color: emailVerified ? "#555" : "#F0EDE8",
                fontSize: 16, padding: "10px 14px", outline: "none",
                fontFamily: "Georgia, serif", letterSpacing: "0.3em",
                textAlign: "center"
              }}
            />
            <button
              onClick={() => emailCode.length >= 4 && setEmailVerified(true)}
              disabled={emailVerified}
              style={{
                background: emailVerified ? "#00E5A022" : emailCode.length >= 4 ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
                border: emailVerified ? "1px solid #00E5A044" : "none",
                borderRadius: 8, color: emailVerified ? "#00E5A0" : emailCode.length >= 4 ? "#fff" : "#444",
                fontSize: 13, fontWeight: 700, padding: "0 18px",
                cursor: emailVerified ? "default" : "pointer", whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}>
              {emailVerified ? "✓ Done" : "Verify"}
            </button>
          </div>
          {!emailVerified && (
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#444" }}>
              Didn't get it? <span style={{ color: "#00C2FF", cursor: "pointer" }}>Resend code</span>
            </p>
          )}
        </div>

        {/* Phone Verify Block */}
        <div style={{
          background: "#0A0A0F",
          border: `1px solid ${phoneVerified ? "#00E5A055" : "#1E1E2E"}`,
          borderRadius: 14, padding: "22px", marginBottom: 32,
          transition: "border 0.3s"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase" }}>
              📱 Phone Code
            </label>
            {phoneVerified && (
              <span style={{
                background: "#00E5A022", border: "1px solid #00E5A044",
                borderRadius: 20, padding: "2px 10px",
                fontSize: 10, color: "#00E5A0", fontWeight: 700, letterSpacing: "0.1em"
              }}>✓ VERIFIED</span>
            )}
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#555" }}>Sent to (239) 555-****</p>
          <div style={{ display: "flex", gap: 10 }}>
            <input
              placeholder="Enter 6-digit code"
              value={phoneCode}
              onChange={e => setPhoneCode(e.target.value)}
              maxLength={6}
              disabled={phoneVerified}
              style={{
                flex: 1, background: phoneVerified ? "#0D0D15" : "#111118",
                border: "1px solid #2A2A3E", borderRadius: 8,
                color: phoneVerified ? "#555" : "#F0EDE8",
                fontSize: 16, padding: "10px 14px", outline: "none",
                fontFamily: "Georgia, serif", letterSpacing: "0.3em",
                textAlign: "center"
              }}
            />
            <button
              onClick={() => phoneCode.length >= 4 && setPhoneVerified(true)}
              disabled={phoneVerified}
              style={{
                background: phoneVerified ? "#00E5A022" : phoneCode.length >= 4 ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
                border: phoneVerified ? "1px solid #00E5A044" : "none",
                borderRadius: 8, color: phoneVerified ? "#00E5A0" : phoneCode.length >= 4 ? "#fff" : "#444",
                fontSize: 13, fontWeight: 700, padding: "0 18px",
                cursor: phoneVerified ? "default" : "pointer", whiteSpace: "nowrap",
                transition: "all 0.2s"
              }}>
              {phoneVerified ? "✓ Done" : "Verify"}
            </button>
          </div>
          {!phoneVerified && (
            <p style={{ margin: "10px 0 0", fontSize: 11, color: "#444" }}>
              Didn't get it? <span style={{ color: "#00C2FF", cursor: "pointer" }}>Resend code</span>
            </p>
          )}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            background: "transparent", border: "1px solid #2A2A3E",
            borderRadius: 10, color: "#888", fontSize: 14,
            fontWeight: 600, padding: "13px 20px", cursor: "pointer"
          }}>← Back</button>
          <button style={{
            flex: 1,
            background: bothVerified ? "linear-gradient(135deg, #00C2FF, #A259FF)" : "#1A1A2E",
            border: "none", borderRadius: 10,
            color: bothVerified ? "#fff" : "#444",
            fontSize: 14, fontWeight: 700, padding: "13px",
            cursor: bothVerified ? "pointer" : "not-allowed",
            letterSpacing: "0.05em", transition: "all 0.3s"
          }}>Continue →</button>
        </div>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: "#555" }}>
        Already have an account?{" "}
        <a href="#" style={{ color: "#00C2FF", textDecoration: "none", fontWeight: 600 }}>Sign In</a>
      </p>
    </div>
  );
}
