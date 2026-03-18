import { useState } from "react";

const INITIAL_PHOTOS = [
  { id: 1, color: "#1a1a2e", label: "BMW M3 · Full Detail", emoji: "🚗" },
  { id: 2, color: "#0d1117", label: "Porsche · Paint Correction", emoji: "🏎️" },
  { id: 3, color: "#141420", label: "Tesla · Ceramic Coat", emoji: "⚡" },
  { id: 4, color: "#0a0a1a", label: "F-150 · Interior Detail", emoji: "🛻" },
  { id: 5, color: "#111118", label: "Charger · Full Detail", emoji: "💫" },
  { id: 6, color: "#0d0d15", label: "Civic · Exterior Wash", emoji: "💧" },
  { id: 7, color: "#1a1020", label: "Cayenne · Ceramic Coat", emoji: "✨" },
  { id: 8, color: "#0a1a1a", label: "Silverado · Full Detail", emoji: "🔥" },
  { id: 9, color: "#1a0a0a", label: "Model 3 · Paint Correction", emoji: "🌟" },
];

export default function DetailerProfileEdit() {
  const [photos, setPhotos] = useState(INITIAL_PHOTOS);
  const [removeMode, setRemoveMode] = useState(false);
  const [selectedToRemove, setSelectedToRemove] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: "Carlos Detail Co.",
    tagline: "Premium mobile detailing in Naples, FL",
    instagram: "@carlosdetail",
    location: "Naples, FL",
    bio: "5 years of making cars shine. Specializing in paint correction and ceramic coatings. Every vehicle gets treated like it's my own.",
  });
  const [editDraft, setEditDraft] = useState({ ...profile });
  const [previewMode, setPreviewMode] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleRemoveSelect = (id) => {
    setSelectedToRemove(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const confirmRemove = () => {
    setPhotos(prev => prev.filter(p => !selectedToRemove.includes(p.id)));
    setSelectedToRemove([]);
    setRemoveMode(false);
  };

  const cancelRemove = () => {
    setSelectedToRemove([]);
    setRemoveMode(false);
  };

  const saveProfile = () => {
    setProfile({ ...editDraft });
    setShowEditProfile(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const addPhoto = () => {
    const emojis = ["🚙", "🏁", "🌊", "🔩", "🪩", "🌟", "💥", "🎯"];
    const colors = ["#0d1a2e", "#1a0d2e", "#0d2e1a", "#2e1a0d"];
    const newPhoto = {
      id: Date.now(),
      color: colors[Math.floor(Math.random() * colors.length)],
      label: "New Upload",
      emoji: emojis[Math.floor(Math.random() * emojis.length)]
    };
    setPhotos(prev => [...prev, newPhoto]);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0A0F",
      fontFamily: "Georgia, serif",
      color: "#F0EDE8",
    }}>

      {/* ── TOP BAR ── */}
      <div style={{
        background: "rgba(10,10,15,0.97)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #1E1E2E",
        padding: "14px 24px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "sticky", top: 0, zIndex: 40
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h2 style={{
            margin: 0, fontSize: 18, fontWeight: 700,
            background: "linear-gradient(90deg, #00C2FF, #A259FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>GlossIO</h2>
          <span style={{ fontSize: 11, color: "#555" }}>·</span>
          <span style={{ fontSize: 11, color: "#555", letterSpacing: "0.15em", textTransform: "uppercase" }}>Public Profile Editor</span>
        </div>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {saved && (
            <span style={{ fontSize: 12, color: "#00E5A0", fontWeight: 700 }}>✓ Saved!</span>
          )}
          <button
            onClick={() => setPreviewMode(v => !v)}
            style={{
              background: previewMode ? "#00C2FF22" : "#111118",
              border: `1px solid ${previewMode ? "#00C2FF44" : "#2A2A3E"}`,
              borderRadius: 8, color: previewMode ? "#00C2FF" : "#888",
              fontSize: 12, fontWeight: 700, padding: "8px 16px", cursor: "pointer"
            }}>
            {previewMode ? "✏️ Edit Mode" : "👁 Preview as Client"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 0 80px" }}>

        {/* ── EDIT MODE BANNER ── */}
        {!previewMode && (
          <div style={{
            background: "#A259FF0D", border: "1px solid #A259FF22",
            borderBottom: "1px solid #A259FF22",
            padding: "12px 24px",
            display: "flex", alignItems: "center", gap: 10
          }}>
            <span style={{ fontSize: 14 }}>✏️</span>
            <p style={{ margin: 0, fontSize: 12, color: "#A259FF", lineHeight: 1.5 }}>
              <strong>You're editing your public profile.</strong> Clients won't see your changes until you save. Hit "Preview as Client" to see how it looks.
            </p>
          </div>
        )}

        {/* ── PROFILE HEADER ── */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          padding: "48px 24px 36px", textAlign: "center", position: "relative"
        }}>
          {/* Glow */}
          <div style={{
            position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)",
            width: 200, height: 200,
            background: "radial-gradient(circle, #00C2FF0A, transparent 70%)",
            pointerEvents: "none"
          }} />

          {/* Profile Picture + Edit Pencil */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{
              width: 110, height: 110, borderRadius: "50%",
              background: "linear-gradient(135deg, #00C2FF, #A259FF)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 48,
              boxShadow: "0 0 0 4px #0A0A0F, 0 0 0 6px #00C2FF33",
              position: "relative", zIndex: 1
            }}>🧑</div>

            {/* Pencil edit button — only in edit mode */}
            {!previewMode && (
              <button style={{
                position: "absolute", bottom: 4, right: 4,
                width: 32, height: 32, borderRadius: "50%",
                background: "#1E1E2E", border: "2px solid #0A0A0F",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", fontSize: 14, zIndex: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.6)"
              }} title="Change profile photo">
                ✏️
              </button>
            )}
          </div>

          {/* Name & edit */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700 }}>{profile.name}</h1>
            <span style={{
              background: "#00C2FF22", border: "1px solid #00C2FF44",
              borderRadius: 20, fontSize: 10, color: "#00C2FF",
              fontWeight: 700, padding: "2px 8px", letterSpacing: "0.1em"
            }}>✓ PRO</span>
          </div>

          <p style={{ margin: "0 0 12px", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
            {profile.tagline}
          </p>

          <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", justifyContent: "center" }}>
            {[`📸 ${profile.instagram}`, `📍 ${profile.location}`].map(tag => (
              <span key={tag} style={{
                background: "#111118", border: "1px solid #1E1E2E",
                borderRadius: 20, fontSize: 12, color: "#888", padding: "5px 14px"
              }}>{tag}</span>
            ))}
          </div>

          {/* Edit Profile Info Button — edit mode only */}
          {!previewMode && (
            <button
              onClick={() => { setEditDraft({ ...profile }); setShowEditProfile(true); }}
              style={{
                background: "#111118", border: "1px solid #2A2A3E",
                borderRadius: 10, color: "#C8C4BC",
                fontSize: 13, fontWeight: 600, padding: "10px 22px",
                cursor: "pointer", marginBottom: 20,
                display: "flex", alignItems: "center", gap: 8
              }}>
              ✏️ Edit Profile Info
            </button>
          )}

          {/* Book an Appointment Button — preview/client mode only */}
          {previewMode && (
            <div style={{ width: "100%", marginBottom: 24 }}>
              <button style={{
                width: "100%",
                background: "linear-gradient(135deg, #00C2FF, #A259FF)",
                border: "none", borderRadius: 14, color: "#fff",
                fontSize: 16, fontWeight: 700, padding: "18px",
                cursor: "pointer", letterSpacing: "0.05em",
                boxShadow: "0 4px 32px #00C2FF33",
                marginBottom: 8
              }}>
                🗓 Book an Appointment
              </button>
              <p style={{ margin: 0, fontSize: 11, color: "#555", textAlign: "center" }}>
                Select your service · Pick a time · Get confirmed
              </p>
            </div>
          )}

          {/* Bio */}
          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 12, padding: "16px 20px",
            width: "100%", textAlign: "left", marginBottom: 8
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: "#555", letterSpacing: "0.2em", textTransform: "uppercase" }}>About</p>
            <p style={{ margin: 0, fontSize: 13, color: "#C8C4BC", lineHeight: 1.8 }}>{profile.bio}</p>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 24px", marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
          <span style={{ fontSize: 10, color: "#444", letterSpacing: "0.25em", textTransform: "uppercase" }}>Work Photos</span>
          <div style={{ flex: 1, height: 1, background: "#1E1E2E" }} />
        </div>

        {/* ── PHOTO GRID ── */}
        <div style={{ padding: "0 24px" }}>

          {/* Remove mode banner */}
          {removeMode && (
            <div style={{
              background: "#FF336615", border: "1px solid #FF336633",
              borderRadius: 10, padding: "12px 16px", marginBottom: 14,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <p style={{ margin: 0, fontSize: 12, color: "#FF3366" }}>
                {selectedToRemove.length === 0
                  ? "Tap photos to select them for removal"
                  : `${selectedToRemove.length} photo${selectedToRemove.length > 1 ? "s" : ""} selected`}
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                {selectedToRemove.length > 0 && (
                  <button onClick={confirmRemove} style={{
                    background: "#FF336622", border: "1px solid #FF336644",
                    borderRadius: 6, color: "#FF3366", fontSize: 11,
                    fontWeight: 700, padding: "5px 12px", cursor: "pointer"
                  }}>Remove</button>
                )}
                <button onClick={cancelRemove} style={{
                  background: "transparent", border: "1px solid #2A2A3E",
                  borderRadius: 6, color: "#888", fontSize: 11,
                  fontWeight: 600, padding: "5px 12px", cursor: "pointer"
                }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => removeMode && toggleRemoveSelect(photo.id)}
                style={{
                  aspectRatio: "1",
                  background: photo.color,
                  borderRadius: 12,
                  border: removeMode && selectedToRemove.includes(photo.id)
                    ? "2px solid #FF3366"
                    : "1px solid #1E1E2E",
                  cursor: removeMode ? "pointer" : "default",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 6, position: "relative", overflow: "hidden",
                  transition: "all 0.15s"
                }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(135deg, #ffffff04, transparent 60%)",
                  pointerEvents: "none"
                }} />

                {/* Remove checkmark */}
                {removeMode && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 20, height: 20, borderRadius: "50%",
                    background: selectedToRemove.includes(photo.id) ? "#FF3366" : "#111118",
                    border: `2px solid ${selectedToRemove.includes(photo.id) ? "#FF3366" : "#2A2A3E"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: "#fff", fontWeight: 700
                  }}>{selectedToRemove.includes(photo.id) ? "✓" : ""}</div>
                )}

                <span style={{ fontSize: 28 }}>{photo.emoji}</span>
                <span style={{ fontSize: 9, color: "#555", textAlign: "center", padding: "0 6px" }}>{photo.label}</span>
              </div>
            ))}
          </div>

          {/* Photo action buttons — edit mode only */}
          {!previewMode && (
            <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
              <button
                onClick={addPhoto}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #00C2FF15, #A259FF15)",
                  border: "1px solid #00C2FF33",
                  borderRadius: 12, color: "#00C2FF",
                  fontSize: 13, fontWeight: 700, padding: "13px",
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8
                }}>
                📸 Upload Photos
              </button>
              <button
                onClick={() => { setRemoveMode(true); setSelectedToRemove([]); }}
                disabled={removeMode}
                style={{
                  flex: 1,
                  background: removeMode ? "#111118" : "#FF336610",
                  border: `1px solid ${removeMode ? "#1E1E2E" : "#FF336633"}`,
                  borderRadius: 12,
                  color: removeMode ? "#444" : "#FF3366",
                  fontSize: 13, fontWeight: 700, padding: "13px",
                  cursor: removeMode ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 8
                }}>
                🗑 Remove Photos
              </button>
            </div>
          )}
        </div>

        {/* Preview CTA — only in preview mode */}
        {previewMode && (
          <div style={{ padding: "0 24px" }}>
            <button style={{
              width: "100%",
              background: "linear-gradient(135deg, #00C2FF, #A259FF)",
              border: "none", borderRadius: 14, color: "#fff",
              fontSize: 16, fontWeight: 700, padding: "18px",
              cursor: "pointer", letterSpacing: "0.05em",
              boxShadow: "0 4px 32px #00C2FF33", marginBottom: 10
            }}>
              🗓 Book an Appointment
            </button>
            <p style={{ textAlign: "center", margin: "10px 0 0", fontSize: 11, color: "#555" }}>
              Powered by <span style={{ color: "#00C2FF" }}>GlossIO</span>
            </p>
          </div>
        )}
      </div>

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditProfile && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 100, padding: 20
        }}>
          <div style={{
            background: "#111118", border: "1px solid #1E1E2E",
            borderRadius: 20, padding: "36px 40px",
            width: "100%", maxWidth: 480,
            maxHeight: "90vh", overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Edit Profile Info</h2>
              <button onClick={() => setShowEditProfile(false)} style={{
                background: "#1A1A2E", border: "1px solid #2A2A3E",
                borderRadius: 8, color: "#888", fontSize: 18,
                width: 36, height: 36, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>✕</button>
            </div>

            {[
              { label: "Display Name", key: "name", placeholder: "Carlos Detail Co." },
              { label: "Tagline", key: "tagline", placeholder: "Premium mobile detailing in Naples, FL" },
              { label: "Instagram Handle", key: "instagram", placeholder: "@yourhandle" },
              { label: "Location", key: "location", placeholder: "Naples, FL" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>
                  {f.label}
                </label>
                <input
                  value={editDraft[f.key]}
                  onChange={e => setEditDraft(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E",
                    borderRadius: 8, color: "#F0EDE8", fontSize: 14,
                    padding: "11px 14px", outline: "none",
                    fontFamily: "Georgia, serif", boxSizing: "border-box"
                  }}
                />
              </div>
            ))}

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 11, letterSpacing: "0.2em", color: "#666", textTransform: "uppercase", marginBottom: 8 }}>Bio</label>
              <textarea
                value={editDraft.bio}
                onChange={e => setEditDraft(p => ({ ...p, bio: e.target.value }))}
                rows={4}
                style={{
                  width: "100%", background: "#0A0A0F", border: "1px solid #2A2A3E",
                  borderRadius: 8, color: "#F0EDE8", fontSize: 14,
                  padding: "11px 14px", outline: "none", resize: "vertical",
                  fontFamily: "Georgia, serif", boxSizing: "border-box"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEditProfile(false)} style={{
                background: "transparent", border: "1px solid #2A2A3E",
                borderRadius: 10, color: "#888", fontSize: 14,
                fontWeight: 600, padding: "12px 20px", cursor: "pointer"
              }}>Cancel</button>
              <button onClick={saveProfile} style={{
                flex: 1, background: "linear-gradient(135deg, #00C2FF, #A259FF)",
                border: "none", borderRadius: 10, color: "#fff",
                fontSize: 14, fontWeight: 700, padding: "12px", cursor: "pointer"
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
