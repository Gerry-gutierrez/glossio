/* ─── Profile Management ─────────────────────────────────────────────────── */

const PROFILE_KEY = "glossio_profile";
const PHOTOS_KEY = "glossio_work_photos";

const DEFAULT_PROFILE = {
  displayName: "Your Business",
  tagline: "Professional Auto Detailing",
  instagram: "",
  city: "",
  state: "",
  bio: "",
  stats: { details: "0", rating: "5.0", experience: "New" },
};

const SAMPLE_PHOTOS = [
  { id: 1, color: "#0f1a2e", label: "BMW M3 · Full Detail", emoji: "🚗" },
  { id: 2, color: "#0d1117", label: "Porsche · Paint Correction", emoji: "🏎️" },
  { id: 3, color: "#141420", label: "Tesla · Ceramic Coat", emoji: "⚡" },
  { id: 4, color: "#0a0a1a", label: "F-150 · Interior Detail", emoji: "🛻" },
  { id: 5, color: "#111118", label: "Charger · Full Detail", emoji: "💫" },
  { id: 6, color: "#0d1a15", label: "Civic · Exterior Wash", emoji: "💧" },
];

let profile = {};
let photos = [];
let nextPhotoId = 100;
let removeMode = false;
let previewMode = false;

function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadProfile() {
  try {
    const d = localStorage.getItem(PROFILE_KEY);
    profile = d ? { ...DEFAULT_PROFILE, ...JSON.parse(d) } : { ...DEFAULT_PROFILE };
  } catch (e) { profile = { ...DEFAULT_PROFILE }; }
  try {
    const p = localStorage.getItem(PHOTOS_KEY);
    photos = p ? JSON.parse(p) : [];
    nextPhotoId = photos.reduce((max, ph) => Math.max(max, ph.id + 1), 100);
  } catch (e) { photos = []; }
}

function saveProfile() { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
function savePhotos() { localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos)); }

/* ── Toast ───────────────────────────────────────────────────────────────── */

function showProfileToast(msg) {
  const existing = document.getElementById("profile-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "profile-toast";
  t.className = "settings-toast";
  t.innerHTML = '<span style="font-size:16px">✓</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + (msg || "Saved!") + '</span>';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ── Render Profile ──────────────────────────────────────────────────────── */

function renderProfile() {
  const p = profile;
  const main = document.getElementById("profile-content");

  if (previewMode) {
    renderPreview();
    return;
  }

  const locationStr = [p.city, p.state].filter(Boolean).join(", ") || "Your City, State";
  const instaStr = p.instagram ? "@" + p.instagram : "@yourbusiness";

  main.innerHTML =
    /* Page header */
    '<div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<h1 class="page-title">My Profile</h1>' +
        '<span style="font-size:11px;color:var(--primary);background:rgba(0,194,255,0.08);border:1px solid rgba(0,194,255,0.2);border-radius:20px;padding:3px 10px">Public Profile</span>' +
      '</div>' +
      '<button class="btn btn-secondary" style="font-size:12px;padding:8px 16px" onclick="togglePreview()">👁 Preview as Client</button>' +
    '</div>' +

    /* Profile Hero */
    '<div class="profile-hero">' +
      '<div class="profile-avatar-large">' + escHtml(p.displayName[0]) + '</div>' +
      '<div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<p class="profile-name-large">' + escHtml(p.displayName) + '</p>' +
          '<span style="background:#00C2FF22;border:1px solid #00C2FF55;border-radius:20px;font-size:10px;color:#00C2FF;font-weight:700;padding:2px 9px;letter-spacing:0.08em">✓ PRO</span>' +
        '</div>' +
        '<p class="profile-tagline">' + escHtml(p.tagline) + '</p>' +
        '<div class="profile-tags">' +
          '<span class="profile-tag">' + escHtml(instaStr) + '</span>' +
          '<span class="profile-tag">' + escHtml(locationStr) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +

    /* Stats */
    '<div class="profile-stats-bar">' +
      '<div class="profile-stat"><p class="profile-stat-value">' + escHtml(p.stats.details || "0") + '</p><p class="profile-stat-label">Details</p></div>' +
      '<div class="profile-stat"><p class="profile-stat-value">' + escHtml(p.stats.rating || "5.0") + ' ⭐</p><p class="profile-stat-label">Rating</p></div>' +
      '<div class="profile-stat"><p class="profile-stat-value">' + escHtml(p.stats.experience || "New") + '</p><p class="profile-stat-label">Experience</p></div>' +
    '</div>' +

    /* Bio */
    '<div class="card" style="margin-bottom:28px">' +
      '<h3 style="font-size:14px;font-weight:700;margin:0 0 12px;color:var(--text-muted)">About</h3>' +
      '<p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin:0">' +
        escHtml(p.bio || "Tell your clients about yourself and your detailing experience. Click \"Edit Profile Info\" to update this section.") +
      '</p>' +
      '<button class="btn btn-secondary" style="margin-top:16px;font-size:12px;padding:8px 16px" onclick="openEditModal()">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ' +
        'Edit Profile Info' +
      '</button>' +
    '</div>' +

    /* Work Photos */
    '<div class="photo-section">' +
      '<div class="photo-section-header">' +
        '<div class="photo-section-line"></div>' +
        '<span class="photo-section-title">Work Photos (' + photos.length + ')</span>' +
        '<div class="photo-section-line"></div>' +
      '</div>' +
      (photos.length > 0 ?
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
          '<button class="btn btn-primary" style="font-size:12px;padding:8px 16px" onclick="openAddPhoto()">+ Add Photo</button>' +
          '<button class="btn ' + (removeMode ? 'btn-danger' : 'btn-ghost') + '" style="font-size:12px;padding:8px 16px" onclick="toggleRemoveMode()">' + (removeMode ? '✕ Done Removing' : '🗑 Remove Photos') + '</button>' +
        '</div>' +
        '<div class="photo-grid">' +
          photos.map(ph =>
            '<div class="photo-card" style="background:' + ph.color + ';position:relative;cursor:pointer" onclick="' + (removeMode ? 'removePhoto(' + ph.id + ')' : 'expandPhoto(' + ph.id + ')') + '">' +
              (removeMode ? '<div class="photo-remove-badge">✕</div>' : '') +
              '<span style="font-size:30px">' + ph.emoji + '</span>' +
              '<span style="font-size:9px;color:#555;text-align:center;padding:0 6px">' + escHtml(ph.label) + '</span>' +
            '</div>'
          ).join("") +
        '</div>'
      :
        '<div class="photo-grid">' +
          '<div class="photo-card photo-card-empty">No photos yet</div>' +
          '<div class="photo-card photo-card-empty">Upload photos</div>' +
          '<div class="photo-card photo-card-empty">of your work</div>' +
          '<div class="photo-card photo-card-empty">to showcase here</div>' +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:16px;font-size:13px;padding:10px 20px" onclick="openAddPhoto()">Upload Photos</button>'
      ) +
      '<p style="text-align:center;margin:10px 0 0;font-size:11px;color:#444">Tap any photo to view</p>' +
    '</div>';
}

/* ── Edit Modal ──────────────────────────────────────────────────────────── */

function openEditModal() {
  const p = profile;
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:500px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Edit Profile</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">✕</button>' +
      '</div>' +
      '<p class="field-label">Display Name</p>' +
      '<input class="input" id="edit-name" value="' + escHtml(p.displayName) + '" maxlength="50" placeholder="Your business name">' +
      '<p class="field-label">Tagline</p>' +
      '<input class="input" id="edit-tagline" value="' + escHtml(p.tagline) + '" maxlength="60" placeholder="e.g. Premium Mobile Detailing">' +
      '<p class="field-label">Instagram Handle</p>' +
      '<div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#555;font-size:14px">@</span><input class="input" id="edit-instagram" value="' + escHtml(p.instagram) + '" maxlength="30" placeholder="yourbusiness" style="padding-left:30px"></div>' +
      '<div class="form-row">' +
        '<div><p class="field-label">City</p><input class="input" id="edit-city" value="' + escHtml(p.city) + '" placeholder="Naples"></div>' +
        '<div><p class="field-label">State</p><input class="input" id="edit-state" value="' + escHtml(p.state) + '" placeholder="FL" maxlength="2"></div>' +
      '</div>' +
      '<p class="field-label">Bio</p>' +
      '<textarea class="input" id="edit-bio" rows="4" maxlength="300" style="resize:vertical" placeholder="Tell clients about yourself...">' + escHtml(p.bio) + '</textarea>' +
      '<p style="margin:5px 0 16px;font-size:11px;color:#555"><span id="edit-bio-count">' + (p.bio || "").length + '</span>/300</p>' +
      '<div class="form-row" style="margin-bottom:0">' +
        '<div><p class="field-label">Details Completed</p><input class="input" id="edit-details" value="' + escHtml(p.stats.details) + '" placeholder="150+"></div>' +
        '<div><p class="field-label">Rating</p><input class="input" id="edit-rating" value="' + escHtml(p.stats.rating) + '" placeholder="5.0"></div>' +
        '<div><p class="field-label">Experience</p><input class="input" id="edit-exp" value="' + escHtml(p.stats.experience) + '" placeholder="3 yrs"></div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="saveEdit()">Save Profile</button>' +
      '</div>' +
    '</div>';

  document.getElementById("edit-bio").addEventListener("input", function() {
    document.getElementById("edit-bio-count").textContent = this.value.length;
  });

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function closeEditModal() {
  document.getElementById("profile-modal").style.display = "none";
}

function saveEdit() {
  profile.displayName = document.getElementById("edit-name").value.trim() || "Your Business";
  profile.tagline = document.getElementById("edit-tagline").value.trim();
  profile.instagram = document.getElementById("edit-instagram").value.trim().replace(/^@/, "");
  profile.city = document.getElementById("edit-city").value.trim();
  profile.state = document.getElementById("edit-state").value.trim();
  profile.bio = document.getElementById("edit-bio").value.trim();
  profile.stats.details = document.getElementById("edit-details").value.trim();
  profile.stats.rating = document.getElementById("edit-rating").value.trim();
  profile.stats.experience = document.getElementById("edit-exp").value.trim();
  saveProfile();
  closeEditModal();
  renderProfile();
  showProfileToast("Profile updated!");
}

/* ── Add Photo ───────────────────────────────────────────────────────────── */

const PHOTO_EMOJIS = ["🚗","🏎️","⚡","🛻","💫","💧","✨","🔥","🌟","🪩","💎","🏁"];
const PHOTO_COLORS = ["#0f1a2e","#0d1117","#141420","#0a0a1a","#111118","#0d1a15","#1a1020","#0a1a1a","#1a0a0a"];

function openAddPhoto() {
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:420px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Add Work Photo</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">✕</button>' +
      '</div>' +
      '<p class="field-label">Label</p>' +
      '<input class="input" id="photo-label" placeholder="e.g. BMW M3 · Full Detail" maxlength="40">' +
      '<p class="field-label">Choose an Icon</p>' +
      '<div class="icon-picker" id="photo-emoji-picker">' +
        PHOTO_EMOJIS.map((e, i) =>
          '<button class="picker-btn' + (i === 0 ? ' picker-btn-active' : '') + '" onclick="pickPhotoEmoji(this,\'' + e + '\')">' + e + '</button>'
        ).join("") +
      '</div>' +
      '<div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:10px;padding:12px 16px;margin-bottom:16px;display:flex;gap:8px">' +
        '<span>📸</span><p style="margin:0;font-size:12px;color:#555;line-height:1.6">In the full version, you\'ll upload real photos here. For now, choose an icon as a placeholder.</p>' +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="addPhoto()">Add Photo</button>' +
      '</div>' +
    '</div>';

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

let selectedPhotoEmoji = PHOTO_EMOJIS[0];

function pickPhotoEmoji(btn, emoji) {
  selectedPhotoEmoji = emoji;
  document.querySelectorAll("#photo-emoji-picker .picker-btn").forEach(b => b.classList.remove("picker-btn-active"));
  btn.classList.add("picker-btn-active");
}

function addPhoto() {
  const label = document.getElementById("photo-label").value.trim() || "New Photo";
  const color = PHOTO_COLORS[Math.floor(Math.random() * PHOTO_COLORS.length)];
  photos.push({ id: nextPhotoId++, label, emoji: selectedPhotoEmoji, color });
  savePhotos();
  closeEditModal();
  renderProfile();
  showProfileToast("Photo added!");
}

/* ── Remove Photo ────────────────────────────────────────────────────────── */

function toggleRemoveMode() {
  removeMode = !removeMode;
  renderProfile();
}

function removePhoto(id) {
  photos = photos.filter(p => p.id !== id);
  savePhotos();
  renderProfile();
  showProfileToast("Photo removed");
}

/* ── Expand Photo ────────────────────────────────────────────────────────── */

function expandPhoto(id) {
  const ph = photos.find(p => p.id === id);
  if (!ph) return;
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div style="background:' + ph.color + ';border:1px solid #2A2A3E;border-radius:20px;width:100%;max-width:380px;aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;cursor:pointer" onclick="closeEditModal()">' +
      '<span style="font-size:72px">' + ph.emoji + '</span>' +
      '<p style="margin:0;font-size:14px;color:#888">' + escHtml(ph.label) + '</p>' +
      '<p style="margin:0;font-size:11px;color:#444">Tap anywhere to close</p>' +
    '</div>';
  modal.addEventListener("click", function handler(e) {
    if (e.target === modal) { closeEditModal(); modal.removeEventListener("click", handler); }
  });
}

/* ── Preview Mode ────────────────────────────────────────────────────────── */

function togglePreview() {
  previewMode = !previewMode;
  renderProfile();
}

function renderPreview() {
  const p = profile;
  const locationStr = [p.city, p.state].filter(Boolean).join(", ") || "Your City";
  const main = document.getElementById("profile-content");

  main.innerHTML =
    '<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:10px;letter-spacing:0.2em;color:#555;text-transform:uppercase">Client Preview Mode</span>' +
        '<span style="background:#FFD60A20;border:1px solid #FFD60A44;border-radius:20px;font-size:10px;color:#FFD60A;font-weight:700;padding:2px 10px">PREVIEW</span>' +
      '</div>' +
      '<button class="btn btn-secondary" style="font-size:12px;padding:8px 16px" onclick="togglePreview()">← Back to Edit</button>' +
    '</div>' +

    /* Client-facing profile preview */
    '<div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:20px;overflow:hidden;max-width:520px;margin:0 auto">' +

      /* Top bar */
      '<div style="background:rgba(10,10,15,0.97);border-bottom:1px solid #1E1E2E;padding:13px 24px;display:flex;justify-content:space-between;align-items:center">' +
        '<h2 style="margin:0;font-size:18px;font-weight:700;background:linear-gradient(90deg,#00C2FF,#A259FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GlossIO</h2>' +
        '<div style="display:flex;align-items:center;gap:7px"><div style="width:7px;height:7px;border-radius:50%;background:#00E5A0"></div><span style="font-size:11px;color:#555;letter-spacing:0.12em;text-transform:uppercase">Verified Detailer</span></div>' +
      '</div>' +

      /* Hero */
      '<div style="text-align:center;padding:48px 24px 40px">' +
        '<div style="width:118px;height:118px;border-radius:50%;background:linear-gradient(135deg,#00C2FF,#A259FF);display:flex;align-items:center;justify-content:center;font-size:52px;margin:0 auto 18px;box-shadow:0 0 0 4px #0A0A0F,0 0 0 7px #00C2FF55">' + escHtml(p.displayName[0]) + '</div>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px">' +
          '<h1 style="margin:0;font-size:26px;font-weight:700">' + escHtml(p.displayName) + '</h1>' +
          '<span style="background:#00C2FF22;border:1px solid #00C2FF55;border-radius:20px;font-size:10px;color:#00C2FF;font-weight:700;padding:2px 9px">✓ PRO</span>' +
        '</div>' +
        '<p style="margin:0 0 20px;font-size:14px;color:#777">' + escHtml(p.tagline || "Professional Auto Detailing") + ' · ' + escHtml(locationStr) + '</p>' +

        /* Stats */
        '<div style="display:inline-flex;background:#111118;border:1px solid #1E1E2E;border-radius:14px;overflow:hidden;margin-bottom:26px">' +
          [
            { value: p.stats.details || "0", label: "Details" },
            { value: (p.stats.rating || "5.0") + " ⭐", label: "Rating" },
            { value: p.stats.experience || "New", label: "Experience" },
          ].map((s, i) =>
            '<div style="text-align:center;padding:13px 22px;' + (i < 2 ? 'border-right:1px solid #1E1E2E' : '') + '"><p style="margin:0 0 3px;font-size:16px;font-weight:700">' + escHtml(s.value) + '</p><p style="margin:0;font-size:10px;color:#555;letter-spacing:0.08em;text-transform:uppercase">' + s.label + '</p></div>'
          ).join("") +
        '</div>' +

        /* Book button */
        '<div><button style="width:100%;max-width:420px;background:linear-gradient(135deg,#00C2FF,#A259FF);border:none;border-radius:16px;color:#fff;font-size:17px;font-weight:700;padding:20px 24px;cursor:default;box-shadow:0 8px 48px #00C2FF44;font-family:Georgia,serif">🛠 See Services & Book an Appointment</button></div>' +
        '<p style="margin:10px 0 0;font-size:11px;color:#555">Browse services · Pick a time · Get confirmed</p>' +
      '</div>' +

      /* Photos */
      (photos.length > 0 ?
        '<div style="padding:0 24px 40px">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><div style="flex:1;height:1px;background:#1E1E2E"></div><span style="font-size:10px;color:#444;letter-spacing:0.25em;text-transform:uppercase">Our Work</span><div style="flex:1;height:1px;background:#1E1E2E"></div></div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' +
            photos.map(ph =>
              '<div style="aspect-ratio:1;background:' + ph.color + ';border-radius:12px;border:1px solid #1E1E2E;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px">' +
                '<span style="font-size:30px">' + ph.emoji + '</span>' +
                '<span style="font-size:9px;color:#555;text-align:center;padding:0 6px">' + escHtml(ph.label) + '</span>' +
              '</div>'
            ).join("") +
          '</div>' +
        '</div>'
      : '') +

      /* About */
      (p.bio ?
        '<div style="padding:0 24px 40px">' +
          '<div style="background:#111118;border:1px solid #1E1E2E;border-radius:14px;padding:22px 24px">' +
            '<p style="margin:0 0 10px;font-size:10px;color:#555;letter-spacing:0.2em;text-transform:uppercase">About</p>' +
            '<p style="margin:0;font-size:14px;color:#C8C4BC;line-height:1.85">' + escHtml(p.bio) + '</p>' +
          '</div>' +
        '</div>'
      : '') +

      /* Footer */
      '<div style="text-align:center;padding:0 24px 32px"><p style="margin:0;font-size:11px;color:#444">Powered by <span style="color:#00C2FF">GlossIO</span></p></div>' +

    '</div>';
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadProfile();
  renderProfile();
});
