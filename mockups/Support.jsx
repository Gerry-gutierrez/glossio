import { useState } from "react";

function SavedToast({ show, message }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00E5A0", borderRadius: 10, padding: "12px 24px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 32px rgba(0,229,160,0.3)", zIndex: 999 }}>
      <span style={{ fontSize: 16 }}>✓</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#0A0A0F" }}>{message}</span>
    </div>
  );
}

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("Normal");
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState(false);

  const showToast = (msg) => { setToast(true); setTimeout(() => setToast(false), 2500); };

  const reset = () => { setSent(false); setSubject(""); setMessage(""); setPriority("Normal"); };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", fontFamily: "Georgia, serif", color: "#F0EDE8", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "48px 24px" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 6px" }}>Settings</p>
        <h2 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 8px" }}>Contact Support</h2>
        <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>Send a message to the GlossIO team. We'll respond to <strong style={{ color: "#F0EDE8" }}>carlos@detailco.com</strong> within 24 hours.</p>

        {!sent ? (
          <>
            <div style={{ background: "#111118", border: "1px solid #00C2FF22", borderLeft: "3px solid #00C2FF", borderRadius: 16, padding: "24px", marginBottom: 20 }}>

              {/* Subject */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="What's your issue about?" maxLength={80} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }} />
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#555" }}>{subject.length}/80</p>
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 10 }}>Priority</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { label: "Low", color: "#00E5A0" },
                    { label: "Normal", color: "#00C2FF" },
                    { label: "Urgent", color: "#FF3366" },
                  ].map(p => (
                    <div key={p.label} onClick={() => setPriority(p.label)} style={{ flex: 1, background: priority === p.label ? `${p.color}15` : "#0A0A0F", border: `1px solid ${priority === p.label ? p.color + "55" : "#2A2A3E"}`, borderRadius: 10, padding: "10px", textAlign: "center", cursor: "pointer", transition: "all 0.15s" }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: priority === p.label ? p.color : "#666" }}>{p.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail. The more info you give us, the faster we can help." rows={5} maxLength={1000} style={{ width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E", borderRadius: 10, color: "#F0EDE8", fontSize: 14, padding: "12px 14px", outline: "none", fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }} />
                <p style={{ margin: "5px 0 0", fontSize: 11, color: "#555" }}>{message.length}/1000</p>
              </div>
            </div>

            {/* Support note */}
            <div style={{ background: "#00C2FF08", border: "1px solid #00C2FF1A", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 8 }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>🛡️</span>
              <p style={{ margin: 0, fontSize: 12, color: "#00C2FF", lineHeight: 1.6 }}>For urgent issues you can also email us directly at <strong>support@glossio.app</strong>.</p>
            </div>

            <button
              disabled={!subject.trim() || !message.trim()}
              onClick={() => setSent(true)}
              style={{ width: "100%", background: subject.trim() && message.trim() ? "linear-gradient(135deg,#00C2FF,#A259FF)" : "#1A1A2E", border: "none", borderRadius: 10, color: subject.trim() && message.trim() ? "#fff" : "#444", fontSize: 14, fontWeight: 700, padding: "14px", cursor: subject.trim() && message.trim() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
              Send Message → support@glossio.app
            </button>
          </>
        ) : (
          <div style={{ background: "#111118", border: "1px solid #1E1E2E", borderRadius: 20, padding: "52px 32px", textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#00C2FF10", border: "2px solid #00C2FF33", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 38 }}>📬</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 10px" }}>Message Sent!</h2>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 8px", lineHeight: 1.7 }}>Your message has been sent to the GlossIO team.</p>
            <p style={{ fontSize: 13, color: "#666", margin: "0 0 28px", lineHeight: 1.7 }}>We'll reply to <strong style={{ color: "#00C2FF" }}>carlos@detailco.com</strong> within 24 hours.</p>
            <p style={{ fontSize: 28, margin: "0 0 28px" }}>🙂</p>
            <button onClick={reset} style={{ background: "linear-gradient(135deg,#00C2FF,#A259FF)", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 700, padding: "14px 32px", cursor: "pointer" }}>← Back to Settings</button>
          </div>
        )}
      </div>
      <SavedToast show={toast} message="Sent!" />
    </div>
  );
}
