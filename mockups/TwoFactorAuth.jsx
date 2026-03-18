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

export default function TwoFactorAuth() {
  const [screen, setScreen] = useState("main"); // main | enabling | success | disableConfirm | disabled
  const [enabled, setEnabled] = useState(false);
  const [code, setCode] = useState("");
  const [resent, setResent] = useState(false);

  const PHONE = "(239) 555-0100";

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  const reset = (newState) => {
    setCode("");
    setResent(false);
    setEnabled(newState);
    setScreen("main");
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0A0A0F",
      fontFamily: "Georgia, serif", color: "#F0EDE8",
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", padding: "48px 24px"
    }}>
      <div style={{ width: "100%", maxWidth: 460 }}>

        {/* ══════════════════════════════════ */}
        {/* MAIN — Toggle screen              */}
        {/* ══════════════════════════════════ */}
        {screen === "main" && (
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Account & Security</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Two-Factor Authentication</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>
              Add an extra layer of security to your account. Every time you log in, you'll also need to enter a code sent to your phone.
            </p>

            {/* Status card */}
            <div style={{
              background: enabled ? "#00E5A008" : "#111118",
              border: `1px solid ${enabled ? "#00E5A033" : "#1E1E2E"}`,
              borderRadius: 16, padding: "24px 24px",
              marginBottom: 20
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: enabled ? 20 : 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: enabled ? "#00E5A015" : "#1A1A2E",
                    border: `1px solid ${enabled ? "#00E5A033" : "#2A2A3E"}`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24
                  }}>🔐</div>
                  <div>
                    <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700 }}>Two-Factor Authentication</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: enabled ? "#00E5A0" : "#555" }} />
                      <span style={{ fontSize: 12, color: enabled ? "#00E5A0" : "#555", fontWeight: 700 }}>
                        {enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Toggle switch */}
                <div
                  onClick={() => enabled ? setScreen("disableConfirm") : setScreen("enabling")}
                  style={{
                    width: 52, height: 28, borderRadius: 14,
                    background: enabled ? "#00E5A0" : "#2A2A3E",
                    position: "relative", cursor: "pointer",
                    transition: "all 0.3s", flexShrink: 0
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "#fff",
                    position: "absolute", top: 3,
                    left: enabled ? 27 : 3,
                    transition: "all 0.3s",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                  }} />
                </div>
              </div>

              {/* Enabled details */}
              {enabled && (
                <div style={{ borderTop: "1px solid #00E5A022", paddingTop: 16 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#0A0A0F", border: "1px solid #1E1E2E", borderRadius: 10, padding: "12px 14px" }}>
                    <span style={{ fontSize: 18 }}>📱</span>
                    <div>
                      <p style={{ margin: "0 0 2px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.1em" }}>Verification sent to</p>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#F0EDE8" }}>{PHONE}</p>
                    </div>
                    <span style={{ marginLeft: "auto", fontSize: 11, color: "#00E5A0", fontWeight: 700 }}>✓ Verified</span>
                  </div>
                </div>
              )}
            </div>

            {/* What is 2FA explainer */}
            {!enabled && (
              <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 14, padding: "20px 22px", marginBottom: 20 }}>
                <p style={{ margin: "0 0 14px", fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: "0.15em" }}>How it works</p>
                {[
                  { icon: "🔑", title: "You log in with your password", desc: "Same as always — nothing changes here." },
                  { icon: "📱", title: "We text you a 6-digit code", desc: `Sent instantly to ${PHONE}.` },
                  { icon: "✓", title: "You enter the code to get in", desc: "Even if someone has your password, they can't get in without your phone." },
                ].map((item, i, arr) => (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < arr.length - 1 ? 14 : 0, marginBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? "1px solid #1A1A2E" : "none" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 700 }}>{item.title}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#666", lineHeight: 1.5 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Enable button */}
            {!enabled && (
              <button
                onClick={() => setScreen("enabling")}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg,#00C2FF,#A259FF)",
                  border: "none", borderRadius: 12, color: "#fff",
                  fontSize: 15, fontWeight: 700, padding: "16px",
                  cursor: "pointer"
                }}>
                🔐 Enable Two-Factor Authentication
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* ENABLING — Verify phone screen    */}
        {/* ══════════════════════════════════ */}
        {screen === "enabling" && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "36px 36px 32px" }}>
            <button onClick={() => setScreen("main")} style={{ background: "transparent", border: "none", color: "#666", fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>← Back</button>

            <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Setting Up 2FA</p>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px" }}>Verify Your Phone</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 4px", lineHeight: 1.7 }}>
              We sent a 6-digit code via text to
            </p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#00C2FF", margin: "0 0 4px" }}>{PHONE}</p>
            <p style={{ fontSize: 12, color: "#555", margin: "0 0 4px" }}>Enter it below to confirm your phone and activate 2FA.</p>

            <CodeInput value={code} onChange={setCode} />

            {code.length === 6 && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#00E5A0", fontWeight: 700, margin: "-12px 0 16px" }}>✓ Code entered — ready to activate</p>
            )}

            <button
              disabled={code.length !== 6}
              onClick={() => setScreen("success")}
              style={{
                width: "100%",
                background: code.length === 6 ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E",
                border: "none", borderRadius: 12,
                color: code.length === 6 ? "#fff" : "#444",
                fontSize: 15, fontWeight: 700, padding: "16px",
                cursor: code.length === 6 ? "pointer" : "not-allowed",
                marginBottom: 16, transition: "all 0.2s"
              }}>
              Activate Two-Factor Authentication →
            </button>

            <div style={{ textAlign: "center" }}>
              {resent ? (
                <p style={{ fontSize: 12, color: "#00E5A0", margin: 0, fontWeight: 700 }}>✓ Code resent to {PHONE}</p>
              ) : (
                <button onClick={handleResend} style={{ background: "transparent", border: "none", color: "#555", fontSize: 12, cursor: "pointer" }}>
                  Didn't get it? <span style={{ color: "#00C2FF", textDecoration: "underline" }}>Resend Code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* SUCCESS — 2FA Enabled             */}
        {/* ══════════════════════════════════ */}
        {screen === "success" && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "#00E5A015", border: "2px solid #00E5A055",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 44
            }}>🔐</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>2FA is Now Active!</h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 20px", lineHeight: 1.7 }}>
              Your account is now protected with two-factor authentication. Every login will require a code sent to <strong style={{ color: "#F0EDE8" }}>{PHONE}</strong>.
            </p>

            <div style={{ background: "#00E5A008", border: "1px solid #00E5A022", borderRadius: 12, padding: "14px 18px", marginBottom: 28, display: "flex", gap: 10, textAlign: "left" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>💡</span>
              <p style={{ margin: 0, fontSize: 12, color: "#00E5A0", lineHeight: 1.7 }}>
                Make sure you always have access to <strong>{PHONE}</strong>. If you change your phone number, update it in Settings first before it affects your login.
              </p>
            </div>

            <p style={{ fontSize: 28, margin: "0 0 28px" }}>🙂</p>

            <button onClick={() => reset(true)} style={{
              background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none",
              borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700,
              padding: "14px 32px", cursor: "pointer"
            }}>← Back to Settings</button>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* DISABLE CONFIRM                   */}
        {/* ══════════════════════════════════ */}
        {screen === "disableConfirm" && (
          <div style={{ background: "#111118", border: "1px solid #FF336622", borderRadius: 20, padding: "40px 36px", textAlign: "center" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "#FF336610", border: "2px solid #FF336633",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 38
            }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Disable Two-Factor Authentication?</h2>
            <p style={{ fontSize: 13, color: "#888", margin: "0 0 24px", lineHeight: 1.7 }}>
              This will remove the extra layer of security from your account. Anyone with your password will be able to log in without a code.
            </p>

            <div style={{ background: "#FF33660A", border: "1px solid #FF336622", borderRadius: 10, padding: "12px 16px", marginBottom: 24, display: "flex", gap: 8, textAlign: "left" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🔓</span>
              <p style={{ margin: 0, fontSize: 12, color: "#FF3366", lineHeight: 1.6 }}>
                We strongly recommend keeping 2FA enabled to protect your GlossIO account.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setScreen("main")}
                style={{
                  flex: 1, background: "linear-gradient(135deg,#00C2FF,#A259FF)",
                  border: "none", borderRadius: 10, color: "#fff",
                  fontSize: 13, fontWeight: 700, padding: "13px", cursor: "pointer"
                }}>Keep It On</button>
              <button
                onClick={() => { setScreen("disabled"); setEnabled(false); }}
                style={{
                  flex: 1, background: "#111118",
                  border: "1px solid #FF336633",
                  borderRadius: 10, color: "#FF3366",
                  fontSize: 13, fontWeight: 700, padding: "13px", cursor: "pointer"
                }}>Yes, Disable</button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ */}
        {/* DISABLED — Success screen         */}
        {/* ══════════════════════════════════ */}
        {screen === "disabled" && (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "56px 36px", textAlign: "center" }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: "#FF336610", border: "2px solid #FF336633",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px", fontSize: 44
            }}>🔓</div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 10px" }}>2FA has been Disabled</h2>
            <p style={{ fontSize: 14, color: "#666", margin: "0 0 20px", lineHeight: 1.7 }}>
              Two-factor authentication is now off. You can re-enable it anytime from Account & Security settings.
            </p>
            <p style={{ fontSize: 28, margin: "0 0 28px" }}>🙂</p>
            <button onClick={() => reset(false)} style={{
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
