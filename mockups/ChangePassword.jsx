import { useState } from "react";

// ── Password strength checker ──
const checkStrength = (pw) => {
  const has8 = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*]/.test(pw);
  const score = [has8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  return {
    score,
    has8, hasUpper, hasNumber,
    label: score === 0 ? "" : score === 1 ? "Weak" : score === 2 ? "Fair" : score === 3 ? "Strong" : "Very Strong",
    color: score === 0 ? "#333" : score === 1 ? "#FF3366" : score === 2 ? "#FFD60A" : score === 3 ? "#00C2FF" : "#00E5A0",
  };
};

// ── Eye toggle field ──
function PasswordField({ label, value, onChange, placeholder, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", background: "#0A0A0F",
            border: "1px solid #2A2A3E", borderRadius: 10,
            color: "#F0EDE8", fontSize: 14, padding: "13px 44px 13px 14px",
            outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box"
          }}
        />
        <button
          onClick={() => setShow(s => !s)}
          style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 17, color: show ? "#00C2FF" : "#444", padding: 0
          }}>
          {show ? "👁" : "🙈"}
        </button>
      </div>
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11, color: "#555" }}>{hint}</p>}
    </div>
  );
}

// ── Requirement row ──
function Req({ met, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
      <div style={{
        width: 16, height: 16, borderRadius: "50%",
        background: met ? "#00E5A020" : "#FF336610",
        border: `1px solid ${met ? "#00E5A0" : "#FF336633"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, flexShrink: 0
      }}>
        {met ? <span style={{ color: "#00E5A0" }}>✓</span> : <span style={{ color: "#FF3366" }}>✕</span>}
      </div>
      <span style={{ fontSize: 12, color: met ? "#00E5A0" : "#666" }}>{label}</span>
    </div>
  );
}

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
            newVal[i] = e.target.value.replace(/\D/, "");
            onChange(newVal.join("").slice(0, 6));
            // Auto focus next
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

export default function ChangePassword() {
  // Main flow: "change" | "forgot"
  const [flow, setFlow] = useState("change");

  // Change password state
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [changeScreen, setChangeScreen] = useState(1); // 1 | 2(success)

  // Forgot password state
  const [forgotScreen, setForgotScreen] = useState(1); // 1 | 2 | 3 | 4
  const [forgotEmail, setForgotEmail] = useState("carlos@detailco.com");
  const [forgotCode, setForgotCode] = useState("");
  const [forgotNew, setForgotNew] = useState("");
  const [forgotConfirm, setForgotConfirm] = useState("");

  const strength = checkStrength(newPw);
  const forgotStrength = checkStrength(forgotNew);

  // Change password validations
  const newIsDifferent = newPw !== currentPw;
  const newMatches = newPw === confirmPw && confirmPw.length > 0;
  const changeValid = currentPw.length > 0 && strength.has8 && strength.hasUpper && strength.hasNumber && newIsDifferent && newMatches;

  // Forgot password validations
  const forgotMatches = forgotNew === forgotConfirm && forgotConfirm.length > 0;
  const forgotValid = forgotStrength.has8 && forgotStrength.hasUpper && forgotStrength.hasNumber && forgotMatches;

  const resetAll = () => {
    setFlow("change"); setChangeScreen(1); setForgotScreen(1);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setForgotCode(""); setForgotNew(""); setForgotConfirm("");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* ── DEMO SWITCHER ── */}
        <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 10, padding: "8px", display: "flex", gap: 6, marginBottom: 32 }}>
          <button onClick={() => { setFlow("change"); setChangeScreen(1); }} style={{
            flex: 1, background: flow === "change" ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "transparent",
            border: "none", borderRadius: 7, color: flow === "change" ? "#fff" : "#666",
            fontSize: 11, fontWeight: 700, padding: "7px", cursor: "pointer"
          }}>🔐 Change Password</button>
          <button onClick={() => { setFlow("forgot"); setForgotScreen(1); }} style={{
            flex: 1, background: flow === "forgot" ? "linear-gradient(135deg,#FF6B35,#A259FF)" : "transparent",
            border: "none", borderRadius: 7, color: flow === "forgot" ? "#fff" : "#666",
            fontSize: 11, fontWeight: 700, padding: "7px", cursor: "pointer"
          }}>❓ Forgot Password Flow</button>
        </div>

        {/* ════════════════════════════════ */}
        {/* CHANGE PASSWORD FLOW            */}
        {/* ════════════════════════════════ */}
        {flow === "change" && (
          <>
            {/* Screen 1/2 — Change form */}
            {changeScreen === 1 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Account & Security</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 28px" }}>Change Password</h2>

                <PasswordField label="Current Password" value={currentPw} onChange={setCurrentPw} placeholder="Enter your current password" />

                <div style={{ height: 1, background: "#1E1E2E", margin: "6px 0 22px" }} />

                <PasswordField label="New Password" value={newPw} onChange={setNewPw} placeholder="Enter new password" />

                {/* Strength bar */}
                {newPw.length > 0 && (
                  <div style={{ marginTop: -10, marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= strength.score ? strength.color : "#1E1E2E", transition: "all 0.3s" }} />
                      ))}
                    </div>
                    {strength.label && <p style={{ margin: 0, fontSize: 11, color: strength.color, fontWeight: 700 }}>{strength.label}</p>}
                  </div>
                )}

                <PasswordField label="Confirm New Password" value={confirmPw} onChange={setConfirmPw} placeholder="Re-enter new password" />

                {/* Match indicator */}
                {confirmPw.length > 0 && (
                  <p style={{ margin: "-10px 0 18px", fontSize: 12, color: newMatches ? "#00E5A0" : "#FF3366", fontWeight: 700 }}>
                    {newMatches ? "✓ Passwords match" : "✕ Passwords don't match"}
                  </p>
                )}

                {/* Requirements */}
                <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Password Requirements</p>
                  <Req met={strength.has8} label="At least 8 characters" />
                  <Req met={strength.hasUpper} label="At least 1 uppercase letter" />
                  <Req met={strength.hasNumber} label="At least 1 number" />
                  <Req met={newIsDifferent && newPw.length > 0} label="Must be different from current password" />
                </div>

                {/* Save button */}
                <button
                  disabled={!changeValid}
                  onClick={() => setChangeScreen(2)}
                  style={{
                    width: "100%",
                    background: changeValid ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                    border: "none", borderRadius: 12,
                    color: changeValid ? "#fff" : "#444",
                    fontSize: 15, fontWeight: 700, padding: "16px",
                    cursor: changeValid ? "pointer" : "not-allowed",
                    marginBottom: 16, transition: "all 0.2s"
                  }}>
                  Set New Password
                </button>

                {/* Forgot password link */}
                <div style={{ textAlign: "center" }}>
                  <button
                    onClick={() => { setFlow("forgot"); setForgotScreen(1); }}
                    style={{
                      background: "transparent", border: "none",
                      color: "#FF3366", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", textDecoration: "underline", padding: 0
                    }}>
                    Forgot your password?
                  </button>
                </div>
              </div>
            )}

            {/* Screen 2/2 — Success */}
            {changeScreen === 2 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#00E5A015", border: "2px solid #00E5A055", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 44 }}>✓</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Password has been Saved</h2>
                <p style={{ fontSize: 14, color: "#666", margin: "0 0 8px", lineHeight: 1.7 }}>Your password has been updated successfully. Use your new password next time you log in.</p>
                <p style={{ fontSize: 28, margin: "0 0 32px" }}>🙂</p>
                <button onClick={resetAll} style={{
                  background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
                  borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
                  padding: "14px 32px", cursor: "pointer"
                }}>← Back to Settings</button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════ */}
        {/* FORGOT PASSWORD FLOW            */}
        {/* ════════════════════════════════ */}
        {flow === "forgot" && (
          <>
            {/* Progress dots */}
            {forgotScreen < 4 && (
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{ width: i === forgotScreen ? 24 : 8, height: 8, borderRadius: 4, background: i === forgotScreen ? "#00C2FF" : i < forgotScreen ? "#00C2FF55" : "#1E1E2E", transition: "all 0.3s" }} />
                ))}
              </div>
            )}

            {/* Screen 1/4 — Enter email */}
            {forgotScreen === 1 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Forgot Password</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Reset Your Password</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>We'll send a 6-digit verification code to your email address.</p>

                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.18em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  style={{
                    width: "100%", background: "#0A0A0F",
                    border: "1px solid #2A2A3E", borderRadius: 10,
                    color: "#F0EDE8", fontSize: 14, padding: "13px 14px",
                    outline: "none", fontFamily: "Georgia, serif",
                    boxSizing: "border-box", marginBottom: 24
                  }}
                />

                <button
                  disabled={!forgotEmail.includes("@")}
                  onClick={() => setForgotScreen(2)}
                  style={{
                    width: "100%",
                    background: forgotEmail.includes("@") ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                    border: "none", borderRadius: 12,
                    color: forgotEmail.includes("@") ? "#fff" : "#444",
                    fontSize: 15, fontWeight: 700, padding: "16px",
                    cursor: forgotEmail.includes("@") ? "pointer" : "not-allowed"
                  }}>
                  Send Code →
                </button>

                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <button onClick={() => setFlow("change")} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>← Back to Change Password</button>
                </div>
              </div>
            )}

            {/* Screen 2/4 — Enter 6-digit code */}
            {forgotScreen === 2 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Verify Your Email</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Enter the Code</h2>
                <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", lineHeight: 1.7 }}>
                  We sent a 6-digit code to
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#00C2FF", margin: "0 0 8px" }}>{forgotEmail}</p>
                <p style={{ fontSize: 12, color: "#555", margin: "0 0 4px" }}>Check your inbox and enter the code below.</p>

                <CodeInput value={forgotCode} onChange={setForgotCode} />

                <button
                  disabled={forgotCode.length !== 6}
                  onClick={() => setForgotScreen(3)}
                  style={{
                    width: "100%",
                    background: forgotCode.length === 6 ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                    border: "none", borderRadius: 12,
                    color: forgotCode.length === 6 ? "#fff" : "#444",
                    fontSize: 15, fontWeight: 700, padding: "16px",
                    cursor: forgotCode.length === 6 ? "pointer" : "not-allowed",
                    marginBottom: 16
                  }}>
                  Verify Code →
                </button>

                <div style={{ textAlign: "center" }}>
                  <button onClick={() => setForgotCode("")} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>
                    Didn't get it? <span style={{ color: "#00C2FF", textDecoration: "underline" }}>Resend Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* Screen 3/4 — Create new password */}
            {forgotScreen === 3 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Create New Password</p>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 28px" }}>Set a New Password</h2>

                <PasswordField label="New Password" value={forgotNew} onChange={setForgotNew} placeholder="Enter new password" />

                {/* Strength bar */}
                {forgotNew.length > 0 && (
                  <div style={{ marginTop: -10, marginBottom: 18 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= forgotStrength.score ? forgotStrength.color : "#1E1E2E", transition: "all 0.3s" }} />
                      ))}
                    </div>
                    {forgotStrength.label && <p style={{ margin: 0, fontSize: 11, color: forgotStrength.color, fontWeight: 700 }}>{forgotStrength.label}</p>}
                  </div>
                )}

                <PasswordField label="Confirm New Password" value={forgotConfirm} onChange={setForgotConfirm} placeholder="Re-enter new password" />

                {forgotConfirm.length > 0 && (
                  <p style={{ margin: "-10px 0 18px", fontSize: 12, color: forgotMatches ? "#00E5A0" : "#FF3366", fontWeight: 700 }}>
                    {forgotMatches ? "✓ Passwords match" : "✕ Passwords don't match"}
                  </p>
                )}

                {/* Requirements */}
                <div style={{ background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 12, padding: "14px 16px", marginBottom: 22 }}>
                  <p style={{ margin: "0 0 10px", fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>Password Requirements</p>
                  <Req met={forgotStrength.has8} label="At least 8 characters" />
                  <Req met={forgotStrength.hasUpper} label="At least 1 uppercase letter" />
                  <Req met={forgotStrength.hasNumber} label="At least 1 number" />
                  <Req met={forgotMatches} label="Both passwords must match" />
                </div>

                <button
                  disabled={!forgotValid}
                  onClick={() => setForgotScreen(4)}
                  style={{
                    width: "100%",
                    background: forgotValid ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                    border: "none", borderRadius: 12,
                    color: forgotValid ? "#fff" : "#444",
                    fontSize: 15, fontWeight: 700, padding: "16px",
                    cursor: forgotValid ? "pointer" : "not-allowed",
                    transition: "all 0.2s"
                  }}>
                  Set New Password
                </button>
              </div>
            )}

            {/* Screen 4/4 — Success */}
            {forgotScreen === 4 && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
                <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#00E5A015", border: "2px solid #00E5A055", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 44 }}>✓</div>
                <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>Password has been Saved</h2>
                <p style={{ fontSize: 14, color: "#666", margin: "0 0 8px", lineHeight: 1.7 }}>Your new password is set. Use it next time you log in to GlossIO.</p>
                <p style={{ fontSize: 28, margin: "0 0 32px" }}>🙂</p>
                <button onClick={resetAll} style={{
                  background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
                  borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
                  padding: "14px 32px", cursor: "pointer"
                }}>← Back to Settings</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
