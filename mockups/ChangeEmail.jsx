import { useState } from "react";

// ── 6-digit code input ──
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
            if (e.key === "Backspace" && !value[i] && e.target.previousSibling) {
              e.target.previousSibling.focus();
            }
          }}
          style={{
            width: 48, height: 56, textAlign: "center",
            background: d ? "#00C2FF15" : "#0A0A0F",
            border: `2px solid ${d ? "#00C2FF" : "#2A2A3E"}`,
            borderRadius: 12, color: "#F0EDE8", fontSize: 22, fontWeight: 700,
            fontFamily: "Georgia, serif", outline: "none"
          }}
        />
      ))}
    </div>
  );
}

export default function ChangeEmail() {
  const [screen, setScreen] = useState(1); // 1 | 2 | 3
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);

  const CURRENT_EMAIL = "carlos@detailco.com";

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  const emailsMatch = newEmail === confirmEmail && confirmEmail.length > 0;
  const isDifferent = newEmail !== CURRENT_EMAIL;
  const screen1Valid = isValidEmail(newEmail) && emailsMatch && isDifferent;

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const reset = () => {
    setScreen(1);
    setNewEmail("");
    setConfirmEmail("");
    setCode("");
    setResent(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0F",
      fontFamily: "Georgia, serif", color: "#F0EDE8",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "48px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* Progress bar */}
        {screen < 3 && (
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              {["New Email", "Verify Code", "Done"].map((label, i) => (
                <div key={label} style={{ flex: 1 }}>
                  <div style={{
                    height: 4, borderRadius: 2, marginBottom: 6,
                    background: i + 1 <= screen ? "#00C2FF" : "#1E1E2E",
                    transition: "all 0.3s"
                  }} />
                  <p style={{
                    margin: 0, fontSize: 9, textAlign: "center",
                    color: i + 1 === screen ? "#C8C4BC" : "#444",
                    textTransform: "uppercase", letterSpacing: "0.1em"
                  }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════ */}
        {/* SCREEN 1 — Enter new email    */}
        {/* ══════════════════════════════ */}
        {screen === 1 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Account & Security</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Change Email</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>
              Enter your new email address. We'll send a verification code to confirm you own it.
            </p>

            {/* Current email — read only */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Current Email
              </label>
              <div style={{
                background: "#0A0A0F", border: "1px solid #1A1A2E",
                borderRadius: 10, padding: "13px 14px",
                display: "flex", alignItems: "center", justifyContent: "space-between"
              }}>
                <span style={{ fontSize: 14, color: "#555" }}>{CURRENT_EMAIL}</span>
                <span style={{ fontSize: 11, background: "#1A1A2E", border: "1px solid #2A2A3E", borderRadius: 20, color: "#555", padding: "3px 10px" }}>Current</span>
              </div>
            </div>

            <div style={{ height: 1, background: "#1E1E2E", margin: "6px 0 22px" }} />

            {/* New email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                New Email Address <span style={{ color: "#FF6B35" }}>*</span>
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
                style={{
                  width: "100%", background: "#0A0A0F",
                  border: `1px solid ${newEmail.length > 0 && !isValidEmail(newEmail) ? "#FF336655" : "#2A2A3E"}`,
                  borderRadius: 10, color: "#F0EDE8", fontSize: 14,
                  padding: "13px 14px", outline: "none",
                  fontFamily: "Georgia, serif", boxSizing: "border-box"
                }}
              />
              {newEmail.length > 0 && !isValidEmail(newEmail) && (
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#FF3366" }}>Please enter a valid email address</p>
              )}
              {newEmail.length > 0 && isValidEmail(newEmail) && !isDifferent && (
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#FF3366" }}>New email must be different from your current email</p>
              )}
            </div>

            {/* Confirm new email */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                Confirm New Email <span style={{ color: "#FF6B35" }}>*</span>
              </label>
              <input
                type="email"
                value={confirmEmail}
                onChange={e => setConfirmEmail(e.target.value)}
                placeholder="Re-enter new email address"
                style={{
                  width: "100%", background: "#0A0A0F",
                  border: `1px solid ${confirmEmail.length > 0 ? (emailsMatch ? "#00C2FF55" : "#FF336655") : "#2A2A3E"}`,
                  borderRadius: 10, color: "#F0EDE8", fontSize: 14,
                  padding: "13px 14px", outline: "none",
                  fontFamily: "Georgia, serif", boxSizing: "border-box"
                }}
              />
              {confirmEmail.length > 0 && (
                <p style={{ margin: "5px 0 0", fontSize: 12, color: emailsMatch ? "#00E5A0" : "#FF3366", fontWeight: 700 }}>
                  {emailsMatch ? "✓ Emails match" : "✕ Emails don't match"}
                </p>
              )}
            </div>

            {/* Info note */}
            <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 16px", marginBottom: 22, display: "flex", gap: 10 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.7 }}>
                A 6-digit verification code will be sent to <strong>{newEmail || "your new email"}</strong>. You'll need to enter it to confirm the change.
              </p>
            </div>

            <button
              disabled={!screen1Valid}
              onClick={() => setScreen(2)}
              style={{
                width: "100%",
                background: screen1Valid ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                border: "none", borderRadius: 12,
                color: screen1Valid ? "#fff" : "#444",
                fontSize: 15, fontWeight: 700, padding: "16px",
                cursor: screen1Valid ? "pointer" : "not-allowed",
                transition: "all 0.2s"
              }}>
              Send Verification Code →
            </button>
          </div>
        )}

        {/* ══════════════════════════════ */}
        {/* SCREEN 2 — Enter code         */}
        {/* ══════════════════════════════ */}
        {screen === 2 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
            <button onClick={() => setScreen(1)} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>

            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Verify Your New Email</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Enter the Code</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", lineHeight: 1.7 }}>
              We sent a 6-digit code to
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#00C2FF", margin: "0 0 4px" }}>{newEmail}</p>
            <p style={{ fontSize: 12, color: "#555", margin: 0 }}>Check your inbox and spam folder.</p>

            <CodeInput value={code} onChange={setCode} />

            {/* Code valid indicator */}
            {code.length === 6 && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#00E5A0", fontWeight: 700, margin: "-12px 0 16px" }}>✓ Code entered — ready to verify</p>
            )}

            <button
              disabled={code.length !== 6}
              onClick={() => setScreen(3)}
              style={{
                width: "100%",
                background: code.length === 6 ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                border: "none", borderRadius: 12,
                color: code.length === 6 ? "#fff" : "#444",
                fontSize: 15, fontWeight: 700, padding: "16px",
                cursor: code.length === 6 ? "pointer" : "not-allowed",
                marginBottom: 16, transition: "all 0.2s"
              }}>
              Verify & Update Email →
            </button>

            {/* Resend */}
            <div style={{ textAlign: "center" }}>
              {resent ? (
                <p style={{ fontSize: 12, color: "#00E5A0", margin: 0, fontWeight: 700 }}>✓ Code resent to {newEmail}</p>
              ) : (
                <button onClick={handleResend} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>
                  Didn't get it? <span style={{ color: "#00C2FF", textDecoration: "underline" }}>Resend Code</span>
                </button>
              )}
            </div>

            {/* Wrong email? */}
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button onClick={() => { setScreen(1); setCode(""); }} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>
                Wrong email? <span style={{ color: "#A259FF", textDecoration: "underline" }}>Change it</span>
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════ */}
        {/* SCREEN 3 — Success            */}
        {/* ══════════════════════════════ */}
        {screen === 3 && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "#00E5A015", border: "2px solid #00E5A055",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 44
            }}>✓</div>

            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Email Updated!</h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 20px", lineHeight: 1.7 }}>
              Your email address has been successfully updated.
            </p>

            {/* Before / After */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28, textAlign: "left" }}>
              <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.12em" }}>Old Email</p>
                <p style={{ margin: 0, fontSize: 12, color: "#666", textDecoration: "line-through" }}>{CURRENT_EMAIL}</p>
              </div>
              <div style={{ background: "#00C2FF0A", border: "1px solid #00C2FF33", borderRadius: 12, padding: "14px 16px" }}>
                <p style={{ margin: "0 0 6px", fontSize: 10, color: "#00C2FF", textTransform: "uppercase", letterSpacing: "0.12em" }}>New Email</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#F0EDE8" }}>{newEmail}</p>
              </div>
            </div>

            <p style={{ fontSize: 28, margin: "0 0 28px" }}>🙂</p>

            <button onClick={reset} style={{
              background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
              borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "14px 32px", cursor: "pointer"
            }}>← Back to Settings</button>
          </div>
        )}
      </div>
    </div>
  );
}
