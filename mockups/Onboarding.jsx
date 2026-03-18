import { useState } from "react";

const STEPS = [
  { id: 1, label: "Business Info" },
  { id: 2, label: "Personal Info" },
  { id: 3, label: "Verify" },
  { id: 4, label: "Create Login" },
  { id: 5, label: "Welcome" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    companyName: "", companyPhone: "",
    firstName: "", lastName: "", phone: "", email: "", address: "",
    emailCode: "", phoneCode: "",
    password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const canProceed = () => {
    if (step === 1) return form.firstName === "" ? false : true; // step 1 is business — optional fields
    if (step === 2) return form.firstName && form.lastName && form.phone && form.email && form.address;
    if (step === 3) return emailVerified && phoneVerified;
    if (step === 4) return form.password && form.password === form.confirmPassword && form.password.length >= 8;
    return true;
  };

  const next = () => { if (canProceed()) setStep(s => Math.min(s + 1, 5)); };
  const back = () => setStep(s => Math.max(s - 1, 1));

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
        margin: "0 0 40px",
        fontSize: 26, fontWeight: 700,
        background: "linear-gradient(90deg, #00C2FF, #A259FF)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>GlossIO</h1>

      {/* Progress Bar */}
      {step < 5 && (
        <div style={{ width: "100%", maxWidth: 520, marginBottom: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            {STEPS.slice(0, 4).map(s => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: step > s.id ? "linear-gradient(135deg, #00C2FF, #A259FF)"
                    : step === s.id ? "#111118" : "#111118",
                  border: step >= s.id ? "2px solid #00C2FF" : "2px solid #2A2A3E",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700,
                  color: step > s.id ? "#fff" : step === s.id ? "#00C2FF" : "#444",
                  transition: "all 0.3s"
                }}>
                  {step > s.id ? "✓" : s.id}
                </div>
                <span style={{ fontSize: 10, color: step >= s.id ? "#888" : "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress line */}
          <div style={{ height: 2, background: "#1E1E2E", borderRadius: 2, marginTop: 4 }}>
            <div style={{
              height: "100%",
              width: `${((step - 1) / 3) * 100}%`,
              background: "linear-gradient(90deg, #00C2FF, #A259FF)",
              borderRadius: 2, transition: "width 0.4s ease"
            }} />
          </div>
        </div>
      )}

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 520,
        background: "#111118",
        border: "1px solid #1E1E2E",
        borderRadius: 20,
        padding: "40px 44px",
      }}>

        {/* ── STEP 1: Business Info ── */}
        {step === 1 && (
          <div>
            <Tag>Step 1 of 4</Tag>
            <h2 style={headingStyle}>Tell us about your business</h2>
            <p style={subStyle}>Company name and number are optional — add them if you have one, skip if you're just getting started.</p>

            <Label>Company Name <Optional /></Label>
            <Input placeholder="e.g. Carlos Detail Co." value={form.companyName} onChange={e => update("companyName", e.target.value)} />

            <Label>Company Phone Number <Optional /></Label>
            <Input placeholder="e.g. (239) 555-0199" value={form.companyPhone} onChange={e => update("companyPhone", e.target.value)} />

            <div style={{
              background: "#00C2FF0D", border: "1px solid #00C2FF22",
              borderRadius: 10, padding: "14px 16px", margin: "24px 0 28px"
            }}>
              <p style={{ margin: 0, fontSize: 13, color: "#00C2FF", lineHeight: 1.6 }}>
                🎉 <strong>No credit card needed.</strong> Try GlossIO free for 14 days — if you love it, pick a plan that works for you. If not, no hard feelings.
              </p>
            </div>

            <PrimaryButton onClick={next}>Continue →</PrimaryButton>
          </div>
        )}

        {/* ── STEP 2: Personal Info ── */}
        {step === 2 && (
          <div>
            <Tag>Step 2 of 4</Tag>
            <h2 style={headingStyle}>Your personal info</h2>
            <p style={subStyle}>This is how we'll identify your account and keep you in the loop.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <Label>First Name</Label>
                <Input placeholder="Carlos" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input placeholder="Martinez" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
              </div>
            </div>

            <Label>Phone Number</Label>
            <Input placeholder="(239) 555-0100" value={form.phone} onChange={e => update("phone", e.target.value)} />

            <Label>Email Address</Label>
            <Input placeholder="carlos@gmail.com" value={form.email} onChange={e => update("email", e.target.value)} />

            <Label>Address</Label>
            <Input placeholder="123 Main St, Naples, FL 34102" value={form.address} onChange={e => update("address", e.target.value)} />

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              <GhostButton onClick={back}>← Back</GhostButton>
              <PrimaryButton onClick={next} disabled={!canProceed()}>Continue →</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── STEP 3: Verify ── */}
        {step === 3 && (
          <div>
            <Tag>Step 3 of 4</Tag>
            <h2 style={headingStyle}>Verify your info</h2>
            <p style={subStyle}>We sent a 6-digit code to your email and phone. Enter both below to confirm it's really you.</p>

            {/* Email verify */}
            <div style={{
              background: "#0A0A0F", border: `1px solid ${emailVerified ? "#00E5A044" : "#1E1E2E"}`,
              borderRadius: 12, padding: "20px 22px", marginBottom: 16
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Label style={{ margin: 0 }}>Email Code</Label>
                {emailVerified && <span style={{ fontSize: 11, color: "#00E5A0", fontWeight: 700 }}>✓ Verified</span>}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555" }}>Sent to {form.email || "your email"}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <Input
                  placeholder="Enter 6-digit code"
                  value={form.emailCode}
                  onChange={e => update("emailCode", e.target.value)}
                  style={{ marginBottom: 0, flex: 1 }}
                />
                <button onClick={() => setEmailVerified(true)} style={{
                  background: emailVerified ? "#00E5A022" : "linear-gradient(135deg, #00C2FF, #A259FF)",
                  border: emailVerified ? "1px solid #00E5A044" : "none",
                  borderRadius: 8, color: emailVerified ? "#00E5A0" : "#fff",
                  fontSize: 12, fontWeight: 700, padding: "0 16px",
                  cursor: "pointer", whiteSpace: "nowrap"
                }}>{emailVerified ? "✓ Done" : "Verify"}</button>
              </div>
            </div>

            {/* Phone verify */}
            <div style={{
              background: "#0A0A0F", border: `1px solid ${phoneVerified ? "#00E5A044" : "#1E1E2E"}`,
              borderRadius: 12, padding: "20px 22px", marginBottom: 28
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Label style={{ margin: 0 }}>Phone Code</Label>
                {phoneVerified && <span style={{ fontSize: 11, color: "#00E5A0", fontWeight: 700 }}>✓ Verified</span>}
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 12, color: "#555" }}>Sent to {form.phone || "your phone"}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <Input
                  placeholder="Enter 6-digit code"
                  value={form.phoneCode}
                  onChange={e => update("phoneCode", e.target.value)}
                  style={{ marginBottom: 0, flex: 1 }}
                />
                <button onClick={() => setPhoneVerified(true)} style={{
                  background: phoneVerified ? "#00E5A022" : "linear-gradient(135deg, #00C2FF, #A259FF)",
                  border: phoneVerified ? "1px solid #00E5A044" : "none",
                  borderRadius: 8, color: phoneVerified ? "#00E5A0" : "#fff",
                  fontSize: 12, fontWeight: 700, padding: "0 16px",
                  cursor: "pointer", whiteSpace: "nowrap"
                }}>{phoneVerified ? "✓ Done" : "Verify"}</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <GhostButton onClick={back}>← Back</GhostButton>
              <PrimaryButton onClick={next} disabled={!canProceed()}>Continue →</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── STEP 4: Create Login ── */}
        {step === 4 && (
          <div>
            <Tag>Step 4 of 4</Tag>
            <h2 style={headingStyle}>Create your login</h2>
            <p style={subStyle}>You can sign in with your email or phone number plus this password.</p>

            <Label>Password</Label>
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => update("password", e.target.value)}
                style={{ ...inputBase, width: "100%", boxSizing: "border-box", paddingRight: 44 }}
              />
              <button onClick={() => setShowPass(v => !v)} style={{
                position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16
              }}>{showPass ? "🙈" : "👁"}</button>
            </div>

            <Label>Confirm Password</Label>
            <Input
              type="password"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={e => update("confirmPassword", e.target.value)}
            />

            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p style={{ margin: "-8px 0 12px", fontSize: 12, color: "#FF3366" }}>Passwords don't match</p>
            )}

            {/* Password strength */}
            {form.password && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ height: 4, background: "#1E1E2E", borderRadius: 2 }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    width: form.password.length >= 12 ? "100%" : form.password.length >= 8 ? "60%" : "30%",
                    background: form.password.length >= 12 ? "#00E5A0" : form.password.length >= 8 ? "#FFD60A" : "#FF3366",
                    transition: "all 0.3s"
                  }} />
                </div>
                <p style={{ margin: "6px 0 0", fontSize: 11, color: "#555" }}>
                  {form.password.length >= 12 ? "Strong password ✓" : form.password.length >= 8 ? "Good — could be stronger" : "Too short"}
                </p>
              </div>
            )}

            <div style={{
              background: "#A259FF0D", border: "1px solid #A259FF22",
              borderRadius: 10, padding: "12px 16px", marginBottom: 28
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "#A259FF", lineHeight: 1.6 }}>
                🔐 You can sign in using your <strong>email</strong> or <strong>phone number</strong> + your password.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <GhostButton onClick={back}>← Back</GhostButton>
              <PrimaryButton onClick={next} disabled={!canProceed()}>Create My Account →</PrimaryButton>
            </div>
          </div>
        )}

        {/* ── STEP 5: Welcome ── */}
        {step === 5 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #00C2FF, #A259FF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, margin: "0 auto 24px"
            }}>✓</div>

            <h2 style={{ ...headingStyle, textAlign: "center" }}>
              You're in{form.companyName ? `, ${form.companyName}` : form.firstName ? `, ${form.firstName}` : ""}! 🎉
            </h2>
            <p style={{ ...subStyle, textAlign: "center" }}>
              Your 14-day free trial has started. Head to your dashboard to set up your public profile, add your services, and grab your booking link.
            </p>

            <div style={{
              background: "#0A0A0F", border: "1px solid #1E1E2E",
              borderRadius: 12, padding: "18px 22px", margin: "24px 0 32px", textAlign: "left"
            }}>
              {[
                { icon: "🎨", text: "Customize your public profile" },
                { icon: "🛠", text: "Add your services & prices" },
                { icon: "🔗", text: "Copy & share your booking link" },
                { icon: "📅", text: "Watch appointments roll in" },
              ].map(item => (
                <div key={item.text} style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#C8C4BC" }}>{item.text}</span>
                </div>
              ))}
            </div>

            <PrimaryButton onClick={() => alert("→ Redirect to Dashboard")}>
              Go to My Dashboard →
            </PrimaryButton>
          </div>
        )}
      </div>

      {/* Already have account */}
      {step < 5 && (
        <p style={{ marginTop: 20, fontSize: 13, color: "#555" }}>
          Already have an account?{" "}
          <a href="#" style={{ color: "#00C2FF", textDecoration: "none", fontWeight: 600 }}>Sign In</a>
        </p>
      )}
    </div>
  );
}

// ── Reusable components ──
const inputBase = {
  background: "#0A0A0F", border: "1px solid #2A2A3E",
  borderRadius: 8, color: "#F0EDE8", fontSize: 14,
  padding: "11px 14px", outline: "none",
  fontFamily: "Georgia, serif", display: "block",
};

const Input = ({ style, ...props }) => (
  <input style={{ ...inputBase, width: "100%", boxSizing: "border-box", marginBottom: 16, ...style }} {...props} />
);

const Label = ({ children, style }) => (
  <label style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 8, ...style }}>
    {children}
  </label>
);

const Optional = () => (
  <span style={{ fontSize: 10, color: "#444", marginLeft: 6, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
);

const Tag = ({ children }) => (
  <p style={{ fontSize: 10, letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", margin: "0 0 10px" }}>{children}</p>
);

const headingStyle = { fontSize: 24, fontWeight: 700, margin: "0 0 10px" };
const subStyle = { fontSize: 14, color: "#777", lineHeight: 1.7, margin: "0 0 28px" };

const PrimaryButton = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    flex: 1, width: "100%",
    background: disabled ? "#1A1A2E" : "linear-gradient(135deg, #00C2FF, #A259FF)",
    border: "none", borderRadius: 10, color: disabled ? "#444" : "#fff",
    fontSize: 14, fontWeight: 700, padding: "13px",
    cursor: disabled ? "not-allowed" : "pointer", letterSpacing: "0.05em",
    transition: "all 0.2s"
  }}>{children}</button>
);

const GhostButton = ({ children, onClick }) => (
  <button onClick={onClick} style={{
    background: "transparent", border: "1px solid #2A2A3E",
    borderRadius: 10, color: "#888", fontSize: 14,
    fontWeight: 600, padding: "13px 20px", cursor: "pointer"
  }}>{children}</button>
);
