import { useState } from "react";

function CodeInput({ value, onChange }) {
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);
  return (
    <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "24px 0" }}>
      {digits.map((d, i) => (
        <input
          key={i}
          type="text"
          maxLength={1}
          value={d}
          onChange={e => {
            const newVal = value.split("");
            newVal[i] = e.target.value.replace(/[^0-9]/, "");
            onChange(newVal.join("").slice(0, 6));
            if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
          }}
          onKeyDown={e => {
            if (e.key === "Backspace" && !value[i] && e.target.previousSibling) e.target.previousSibling.focus();
          }}
          style={{
            width: 48, height: 56, textAlign: "center",
            background: d ? "#A259FF15" : "#0A0A0F",
            border: `2px solid ${d ? "#A259FF" : "#2A2A3E"}`,
            borderRadius: 12, color: "#F0EDE8", fontSize: 22, fontWeight: 700,
            fontFamily: "Georgia, serif", outline: "none"
          }}
        />
      ))}
    </div>
  );
}

const formatPhone = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
};

const isValidPhone = (val) => val.replace(/\D/g, "").length === 10;

export default function ChangePhone() {
  const [screen, setScreen] = useState(1);
  const [newPhone, setNewPhone] = useState("");
  const [confirmPhone, setConfirmPhone] = useState("");
  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);

  const CURRENT_PHONE = "(239) 555-0100";
  const phonesMatch = newPhone === confirmPhone && confirmPhone.length > 0;
  const isDifferent = newPhone !== CURRENT_PHONE;
  const screen1Valid = isValidPhone(newPhone) && phonesMatch && isDifferent;

  const handleResend = () => { setResent(true); setTimeout(() => setResent(false), 3000); };
  const reset = () => { setScreen(1); setNewPhone(""); setConfirmPhone(""); setCode(""); setResent(false); };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Progress */}
        {screen < 3 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {["New Phone", "Verify Code", "Done"].map((label, i) => (
              <div key={label} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, marginBottom: 6, background: i + 1 <= screen ? "#A259FF" : "#1E1E2E", transition: "all 0.3s" }} />
                <p style={{ margin: 0, fontSize: 9, textAlign: "center", color: i + 1 === screen ? "#C8C4BC" : "#444", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Screen 1 */}
        {screen === 1 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Account & Security</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Change Phone Number</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Enter your new number. We'll send a verification code via text to confirm.</p>

            {/* Current — read only */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Current Phone Number</label>
              <div style={{ background: "#0A0A0F", border: "1px solid #1A1A2E", borderRadius: 10, padding: "13px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#555" }}>{CURRENT_PHONE}</span>
                <span style={{ fontSize: 11, background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 20, color: "#555", padding: "3px 10px" }}>Current</span>
              </div>
            </div>

            <div style={{ height: 1, background: "#1E1E2E", margin: "6px 0 22px" }} />

            {/* New phone */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>New Phone Number <span style={{ color: "#FF6B35" }}>*</span></label>
              <input
                type="tel" value={newPhone}
                onChange={e => setNewPhone(formatPhone(e.target.value))}
                placeholder="(239) 555-0000"
                style={{ width: "100%", background: "#0A0A0F", border: `1px solid ${newPhone.length > 0 && !isValidPhone(newPhone) ? "#FF336655" : "#2A2A3E"}`, borderRadius: 10, color: "#F0EDE8", fontSize: 14, padding: "13px 14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
              />
              {newPhone.length > 0 && !isValidPhone(newPhone) && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#FF3366" }}>Please enter a valid 10-digit phone number</p>}
              {isValidPhone(newPhone) && !isDifferent && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#FF3366" }}>Must be different from your current number</p>}
            </div>

            {/* Confirm phone */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Confirm New Phone Number <span style={{ color: "#FF6B35" }}>*</span></label>
              <input
                type="tel" value={confirmPhone}
                onChange={e => setConfirmPhone(formatPhone(e.target.value))}
                placeholder="(239) 555-0000"
                style={{ width: "100%", background: "#0A0A0F", border: `1px solid ${confirmPhone.length > 0 ? (phonesMatch ? "#A259FF55" : "#FF336655") : "#2A2A3E"}`, borderRadius: 10, color: "#F0EDE8", fontSize: 14, padding: "13px 14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
              />
              {confirmPhone.length > 0 && (
                <p style={{ margin: "5px 0 0", fontSize: 12, color: phonesMatch ? "#00E5A0" : "#FF3366", fontWeight: 700 }}>
                  {phonesMatch ? "✓ Numbers match" : "✕ Numbers don't match"}
                </p>
              )}
            </div>

            {/* Info note */}
            <div style={{ background: "#A259FF08", border: "1px solid #A259FF1A", borderRadius: 10, padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>📱</span>
              <p style={{ margin: 0, fontSize: 12, color: "#A259FF", lineHeight: 1.7 }}>
                A 6-digit code will be sent via <strong>text message</strong> to <strong>{newPhone || "your new number"}</strong>. Standard messaging rates may apply.
              </p>
            </div>

            <button disabled={!screen1Valid} onClick={() => setScreen(2)} style={{ width: "100%", background: screen1Valid ? "linear-gradient(135deg,#A259FF,#00C2FF)" : "#1A1A2E", border: "none", borderRadius: 12, color: screen1Valid ? "#fff" : "#444", fontSize: 15, fontWeight: 700, padding: "16px", cursor: screen1Valid ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Send Verification Code →
            </button>
          </div>
        )}

        {/* Screen 2 */}
        {screen === 2 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
            <button onClick={() => setScreen(1)} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Verify Your New Number</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Enter the Code</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px" }}>We texted a 6-digit code to</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#A259FF", margin: "0 0 4px" }}>{newPhone}</p>
            <p style={{ fontSize: 12, color: "#555", margin: 0 }}>It should arrive within a few seconds.</p>

            <CodeInput value={code} onChange={setCode} />

            {code.length === 6 && <p style={{ textAlign: "center", fontSize: 12, color: "#00E5A0", fontWeight: 700, margin: "-12px 0 16px" }}>✓ Code entered — ready to verify</p>}

            <button disabled={code.length !== 6} onClick={() => setScreen(3)} style={{ width: "100%", background: code.length === 6 ? "linear-gradient(135deg,#A259FF,#00C2FF)" : "#1A1A2E", border: "none", borderRadius: 12, color: code.length === 6 ? "#fff" : "#444", fontSize: 15, fontWeight: 700, padding: "16px", cursor: code.length === 6 ? "pointer" : "not-allowed", marginBottom: 16, transition: "all 0.2s" }}>
              Verify & Update Phone →
            </button>

            <div style={{ textAlign: "center" }}>
              {resent
                ? <p style={{ fontSize: 12, color: "#00E5A0", margin: 0, fontWeight: 700 }}>✓ Code resent to {newPhone}</p>
                : <button onClick={handleResend} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>Didn't get it? <span style={{ color: "#A259FF", textDecoration: "underline" }}>Resend Code</span></button>
              }
            </div>
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button onClick={() => { setScreen(1); setCode(""); }} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>
                Wrong number? <span style={{ color: "#00C2FF", textDecoration: "underline" }}>Change it</span>
              </button>
            </div>
          </div>
        )}

        {/* Screen 3 — Success */}
        {screen === 3 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#A259FF15", border: "2px solid #A259FF55", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 44 }}>✓</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Phone Number Updated!</h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 20px", lineHeight: 1.7 }}>Your phone number has been successfully updated.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28, textAlign: "left" }}>
              <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>Old Number</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666", textDecoration: "line-through" }}>{CURRENT_PHONE}</p>
              </div>
              <div style={{ background: "#A259FF0A", border: "1px solid #A259FF33", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#A259FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>New Number</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#F0EDE8" }}>{newPhone}</p>
              </div>
            </div>

            <p style={{ fontSize: 28, margin: "0 0 28px" }}>🙂</p>
            <button onClick={reset} style={{ background: "linear-gradient(135deg,#A259FF,#00C2FF)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px 32px", cursor: "pointer" }}>← Back to Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}
