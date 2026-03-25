/* ─── Settings Page ──────────────────────────────────────────────────────── */

const SETTINGS_KEY = "glossio_settings";
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM"
];
const RADIUS_OPTIONS = ["5 miles","10 miles","15 miles","25 miles","50 miles","No limit"];

const DEFAULT_SETTINGS = {
  bizName: "Your Business",
  city: "",
  state: "",
  zip: "",
  radius: "25 miles",
  hours: {
    Monday:    { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
    Tuesday:   { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
    Wednesday: { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
    Thursday:  { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
    Friday:    { open: true,  openTime: "8:00 AM", closeTime: "5:00 PM" },
    Saturday:  { open: true,  openTime: "9:00 AM", closeTime: "3:00 PM" },
    Sunday:    { open: false, openTime: "9:00 AM", closeTime: "3:00 PM" },
  },
  tagline: "",
  bio: "",
  blocks: [],
  noLimit: false,
  maxAppts: 4,
  advanceDays: 30,
  minHours: 24,
  bookingOn: true,
  bookingSms: true,
  bookingEmail: true,
  cancelOn: true,
  cancelSms: true,
  cancelEmail: false,
  reminderOn: true,
  summaryOn: true,
  summaryDay: "Monday",
  summaryIncludes: { upcoming: true, revenue: true, newClients: true, cancellations: true },
  cancelled: false,
};

let settings = {};
let currentScreen = "hub";

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadSettings() {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    settings = data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : { ...DEFAULT_SETTINGS };
  } catch (e) { settings = { ...DEFAULT_SETTINGS }; }
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

/* ── Toast ───────────────────────────────────────────────────────────────── */

function showSettingsToast(msg) {
  const existing = document.getElementById("settings-toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.id = "settings-toast";
  toast.className = "settings-toast";
  toast.innerHTML = '<span style="font-size:16px">✓</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + (msg || "Changes Saved!") + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

/* ── Navigation ──────────────────────────────────────────────────────────── */

function showScreen(screen) {
  currentScreen = screen;
  const hub = document.getElementById("settings-hub");
  const sub = document.getElementById("settings-sub");

  if (screen === "hub") {
    hub.style.display = "";
    sub.style.display = "none";
    sub.innerHTML = "";
    return;
  }

  hub.style.display = "none";
  sub.style.display = "block";

  switch (screen) {
    case "availability": renderAvailability(); break;
    case "availability-hours": renderAvailabilityHours(); break;
    case "availability-vacation": renderVacation(); break;
    case "availability-maxappts": renderMaxAppts(); break;
    case "availability-advance": renderAdvance(); break;
    case "notifications": renderNotifications(); break;
    case "notifications-booking": renderNotifBooking(); break;
    case "notifications-cancel": renderNotifCancel(); break;
    case "notifications-reminder": renderNotifReminder(); break;
    case "notifications-summary": renderNotifSummary(); break;
    case "billing": renderBilling(); break;
    case "billing-plan": renderBillingPlan(); break;
    case "billing-payment": renderBillingPayment(); break;
    case "billing-history": renderBillingHistory(); break;
    case "billing-cancel": renderBillingCancel(); break;
    case "support": renderSupport(); break;
    case "account": renderAccount(); break;
    case "account-password": renderAccountPassword(); break;
    default: showScreen("hub");
  }
}

function backBtn(target) {
  return '<button class="settings-back-btn" onclick="showScreen(\'' + target + '\')">← Back</button>';
}

function subHeader(breadcrumb, title, desc) {
  return '<p class="settings-breadcrumb">' + breadcrumb + '</p>' +
         '<h2 class="settings-sub-title">' + title + '</h2>' +
         (desc ? '<p class="settings-sub-desc">' + desc + '</p>' : '');
}

function timeOptions(selected) {
  return HOURS.map(h => '<option value="' + h + '"' + (h === selected ? ' selected' : '') + '>' + h + '</option>').join("");
}

/* ── Business Info ───────────────────────────────────────────────────────── */

function renderBusiness() {
  const s = settings;
  const openDays = DAYS.filter(d => s.hours[d].open);

  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Business Info", "Keep your business details up to date. This info appears on your public profile and booking page.") +

    /* Business Name Section */
    '<div class="stg-section" id="sec-name">' +
      '<div class="stg-section-header" onclick="toggleSection(\'name\')">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="stg-section-icon" style="background:#00C2FF15;border-color:#00C2FF33">🏢</div>' +
          '<p class="stg-section-label">Business Name</p>' +
        '</div>' +
        '<span class="stg-chevron" id="chev-name">›</span>' +
      '</div>' +
      '<div class="stg-section-body" id="body-name" style="display:none">' +
        '<div class="field-label">BUSINESS NAME</div>' +
        '<input class="input" id="biz-name" value="' + escHtml(s.bizName) + '" maxlength="50" placeholder="Your business name">' +
        '<p class="char-count"><span id="biz-name-count">' + s.bizName.length + '</span>/50 characters</p>' +
        '<div class="stg-hint"><span>💡</span><p>This name appears on your public booking page and all client communications.</p></div>' +
        '<button class="btn btn-gradient" onclick="saveBizName()">Save Business Name</button>' +
      '</div>' +
    '</div>' +

    /* Location Section */
    '<div class="stg-section" id="sec-location">' +
      '<div class="stg-section-header" onclick="toggleSection(\'location\')">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="stg-section-icon" style="background:#A259FF15;border-color:#A259FF33">📍</div>' +
          '<p class="stg-section-label">Location & Service Area</p>' +
        '</div>' +
        '<span class="stg-chevron" id="chev-location">›</span>' +
      '</div>' +
      '<div class="stg-section-body" id="body-location" style="display:none">' +
        '<div style="display:grid;grid-template-columns:2fr 1fr;gap:0 16px">' +
          '<div><div class="field-label">CITY</div><input class="input" id="loc-city" value="' + escHtml(s.city) + '" placeholder="Naples"></div>' +
          '<div><div class="field-label">STATE</div><input class="input" id="loc-state" value="' + escHtml(s.state) + '" placeholder="FL" maxlength="2"></div>' +
        '</div>' +
        '<div class="field-label">ZIP CODE</div>' +
        '<input class="input" id="loc-zip" value="' + escHtml(s.zip) + '" placeholder="34102" maxlength="5">' +
        '<div class="field-label">HOW FAR DO YOU TRAVEL?</div>' +
        '<div class="radius-pills">' +
          RADIUS_OPTIONS.map(r =>
            '<div class="radius-pill' + (s.radius === r ? ' radius-pill-active' : '') + '" onclick="pickRadius(\'' + r + '\')">' + r + '</div>'
          ).join("") +
        '</div>' +
        '<div class="stg-preview" style="border-color:#A259FF33"><span style="font-size:18px">📍</span><div><p style="margin:0 0 2px;font-size:13px;font-weight:700" id="loc-preview-text">' + escHtml(s.city || "City") + ', ' + escHtml(s.state || "ST") + ' ' + escHtml(s.zip || "00000") + '</p><p style="margin:0;font-size:12px;color:#666">Serving within ' + s.radius + '</p></div></div>' +
        '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#A259FF,#00C2FF)" onclick="saveLocation()">Save Location</button>' +
      '</div>' +
    '</div>' +

    /* Business Hours Section */
    '<div class="stg-section" id="sec-hours">' +
      '<div class="stg-section-header" onclick="toggleSection(\'hours\')">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="stg-section-icon" style="background:#FF6B3515;border-color:#FF6B3533">🕐</div>' +
          '<p class="stg-section-label">Business Hours</p>' +
        '</div>' +
        '<span class="stg-chevron" id="chev-hours">›</span>' +
      '</div>' +
      '<div class="stg-section-body" id="body-hours" style="display:none">' +
        '<div class="day-chips">' +
          DAYS.map(d => '<span class="day-chip' + (s.hours[d].open ? ' day-chip-active' : '') + '">' + d.slice(0,3) + '</span>').join("") +
        '</div>' +
        '<div class="hours-list">' +
          DAYS.map(d => {
            const h = s.hours[d];
            return '<div class="hour-row' + (h.open ? '' : ' hour-row-closed') + '">' +
              '<div class="toggle-switch' + (h.open ? ' toggle-on' : '') + '" onclick="toggleDay(\'' + d + '\')"><div class="toggle-knob"></div></div>' +
              '<p class="hour-day-name">' + d + '</p>' +
              (h.open ?
                '<select class="time-select" onchange="updateHour(\'' + d + '\',\'openTime\',this.value)">' + timeOptions(h.openTime) + '</select>' +
                '<span style="font-size:11px;color:#555;flex-shrink:0">to</span>' +
                '<select class="time-select" onchange="updateHour(\'' + d + '\',\'closeTime\',this.value)">' + timeOptions(h.closeTime) + '</select>' +
                '<button class="copy-all-btn" onclick="copyHoursToAll(\'' + d + '\')">Copy to all</button>'
              : '<p style="margin:0;font-size:12px;color:#444;font-style:italic">Closed</p>') +
            '</div>';
          }).join("") +
        '</div>' +
        '<div class="stg-preview"><p style="margin:0 0 6px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em">Open ' + openDays.length + ' days a week</p><p style="margin:0;font-size:12px;color:#888">' + openDays.join(", ") + '</p></div>' +
        '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FF6B35,#A259FF)" onclick="saveHours()">Save Business Hours</button>' +
      '</div>' +
    '</div>' +

    /* Tagline & Bio Section */
    '<div class="stg-section" id="sec-bio">' +
      '<div class="stg-section-header" onclick="toggleSection(\'bio\')">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<div class="stg-section-icon" style="background:#FFD60A15;border-color:#FFD60A33">✏️</div>' +
          '<p class="stg-section-label">Tagline & Bio</p>' +
        '</div>' +
        '<span class="stg-chevron" id="chev-bio">›</span>' +
      '</div>' +
      '<div class="stg-section-body" id="body-bio" style="display:none">' +
        '<div class="field-label">TAGLINE <span style="font-size:10px;color:#444;text-transform:none;letter-spacing:0">(shown under your name on your public profile)</span></div>' +
        '<input class="input" id="stg-tagline" value="' + escHtml(s.tagline) + '" maxlength="60" placeholder="e.g. Naples\' #1 Mobile Detailer">' +
        '<p class="char-count"><span id="tagline-count">' + s.tagline.length + '</span>/60 characters</p>' +
        '<div class="field-label">BIO <span style="font-size:10px;color:#444;text-transform:none;letter-spacing:0">(appears on your public profile)</span></div>' +
        '<textarea class="input" id="stg-bio" maxlength="300" rows="4" style="resize:vertical" placeholder="Tell clients a little about yourself and your work...">' + escHtml(s.bio) + '</textarea>' +
        '<p class="char-count"><span id="bio-count">' + s.bio.length + '</span>/300 characters</p>' +
        '<div class="stg-preview" style="border-color:#FFD60A22">' +
          '<p style="margin:0 0 12px;font-size:10px;color:#FFD60A;text-transform:uppercase;letter-spacing:0.15em">👁 Preview on Public Profile</p>' +
          '<div style="display:flex;gap:14px;align-items:flex-start">' +
            '<div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#00C2FF,#A259FF);display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0">🧑</div>' +
            '<div>' +
              '<p style="margin:0 0 3px;font-size:15px;font-weight:700">' + escHtml(s.bizName) + '</p>' +
              '<p style="margin:0 0 8px;font-size:12px;color:#888" id="tagline-preview">' + escHtml(s.tagline || "Your tagline appears here") + '</p>' +
              '<p style="margin:0;font-size:12px;color:#666;line-height:1.7" id="bio-preview">' + escHtml(s.bio || "Your bio appears here...") + '</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="stg-hint" style="background:#FFD60A0A;border-color:#FFD60A22"><span>💡</span><p style="color:#FFD60A">Changes here will also update your public profile automatically.</p></div>' +
        '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FFD60A,#FF6B35);color:#0A0A0F" onclick="saveBio()">Save Tagline & Bio</button>' +
      '</div>' +
    '</div>';

  // Wire up live character counts
  const bizInput = document.getElementById("biz-name");
  if (bizInput) bizInput.addEventListener("input", function() {
    document.getElementById("biz-name-count").textContent = this.value.length;
  });
  const tagInput = document.getElementById("stg-tagline");
  if (tagInput) tagInput.addEventListener("input", function() {
    document.getElementById("tagline-count").textContent = this.value.length;
    document.getElementById("tagline-preview").textContent = this.value || "Your tagline appears here";
  });
  const bioInput = document.getElementById("stg-bio");
  if (bioInput) bioInput.addEventListener("input", function() {
    document.getElementById("bio-count").textContent = this.value.length;
    document.getElementById("bio-preview").textContent = this.value || "Your bio appears here...";
  });
}

function toggleSection(id) {
  const body = document.getElementById("body-" + id);
  const chev = document.getElementById("chev-" + id);
  const isOpen = body.style.display !== "none";
  body.style.display = isOpen ? "none" : "block";
  chev.textContent = isOpen ? "›" : "▲";
}

function toggleDay(day) {
  settings.hours[day].open = !settings.hours[day].open;
  renderBusiness();
}

function updateHour(day, key, val) {
  settings.hours[day][key] = val;
}

function copyHoursToAll(sourceDay) {
  const src = settings.hours[sourceDay];
  DAYS.forEach(d => {
    settings.hours[d].openTime = src.openTime;
    settings.hours[d].closeTime = src.closeTime;
  });
  renderBusiness();
}

function pickRadius(r) {
  settings.radius = r;
  document.querySelectorAll(".radius-pill").forEach(p => {
    p.classList.toggle("radius-pill-active", p.textContent === r);
  });
}

function saveBizName() {
  const val = document.getElementById("biz-name").value.trim();
  if (!val) return;
  settings.bizName = val;
  saveSettings();
  showSettingsToast();
}

function saveLocation() {
  settings.city = document.getElementById("loc-city").value.trim();
  settings.state = document.getElementById("loc-state").value.trim();
  settings.zip = document.getElementById("loc-zip").value.trim();
  saveSettings();
  showSettingsToast();
}

function saveHours() {
  saveSettings();
  showSettingsToast();
}

function saveBio() {
  settings.tagline = document.getElementById("stg-tagline").value.trim();
  settings.bio = document.getElementById("stg-bio").value.trim();
  saveSettings();
  showSettingsToast();
}

/* ── Availability & Blocking ─────────────────────────────────────────────── */

function renderAvailability() {
  const s = settings;
  const openDays = DAYS.filter(d => s.hours[d].open);
  const blockCount = s.blocks.length;
  const maxLabel = s.noLimit ? "No limit" : "Max " + s.maxAppts + " appts/day";
  const advLabel = s.advanceDays + " days ahead · " + s.minHours + "hr min notice";

  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Availability & Blocking", "Control when clients can and can't book you.") +

    [
      { id: "availability-hours", icon: "🕐", color: "#FFD60A", label: "Business Hours", desc: "Set the days and hours you're available for appointments.", meta: openDays.length + " days open" },
      { id: "availability-vacation", icon: "🏖️", color: "#00C2FF", label: "Vacation / Date Blocks", desc: "Block specific dates or ranges — clients won't be able to book you on these days.", meta: blockCount > 0 ? blockCount + " active block" + (blockCount > 1 ? "s" : "") : "No blocks set" },
      { id: "availability-maxappts", icon: "📋", color: "#A259FF", label: "Max Appointments Per Day", desc: "Set a daily cap so you don't get overbooked.", meta: maxLabel },
      { id: "availability-advance", icon: "📅", color: "#FF6B35", label: "Advance Booking Window", desc: "Control how far ahead clients can book and how much notice you need.", meta: advLabel },
    ].map(item =>
      '<div class="stg-nav-card" style="border-left-color:' + item.color + '" onclick="showScreen(\'' + item.id + '\')">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div class="stg-section-icon" style="background:' + item.color + '15;border-color:' + item.color + '33">' + item.icon + '</div>' +
          '<div>' +
            '<p style="margin:0 0 4px;font-size:15px;font-weight:700">' + item.label + '</p>' +
            '<p style="margin:0 0 6px;font-size:12px;color:#666;line-height:1.5">' + item.desc + '</p>' +
            '<span class="stg-meta-badge" style="background:' + item.color + '15;border-color:' + item.color + '33;color:' + item.color + '">' + item.meta + '</span>' +
          '</div>' +
        '</div>' +
        '<span style="font-size:18px;color:#444;flex-shrink:0;margin-left:12px">›</span>' +
      '</div>'
    ).join("");
}

function renderAvailabilityHours() {
  const s = settings;
  const openDays = DAYS.filter(d => s.hours[d].open);

  document.getElementById("settings-sub").innerHTML =
    backBtn("availability") +
    subHeader("Availability & Blocking", "Business Hours", "Set the days and hours you're available for appointments.") +

    '<div class="day-chips">' +
      DAYS.map(d => '<span class="day-chip' + (s.hours[d].open ? ' day-chip-active' : '') + '">' + d.slice(0,3) + '</span>').join("") +
    '</div>' +
    '<div class="hours-list">' +
      DAYS.map(d => {
        const h = s.hours[d];
        return '<div class="hour-row' + (h.open ? '' : ' hour-row-closed') + '">' +
          '<div class="toggle-switch' + (h.open ? ' toggle-on' : '') + '" onclick="toggleDayAvail(\'' + d + '\')"><div class="toggle-knob"></div></div>' +
          '<p class="hour-day-name">' + d + '</p>' +
          (h.open ?
            '<select class="time-select" onchange="updateHour(\'' + d + '\',\'openTime\',this.value)">' + timeOptions(h.openTime) + '</select>' +
            '<span style="font-size:11px;color:#555;flex-shrink:0">to</span>' +
            '<select class="time-select" onchange="updateHour(\'' + d + '\',\'closeTime\',this.value)">' + timeOptions(h.closeTime) + '</select>' +
            '<button class="copy-all-btn" onclick="copyHoursToAllAvail(\'' + d + '\')">Copy to all</button>'
          : '<p style="margin:0;font-size:12px;color:#444;font-style:italic">Closed</p>') +
        '</div>';
      }).join("") +
    '</div>' +
    '<div class="stg-preview"><p style="margin:0 0 6px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em">Open ' + openDays.length + ' days a week</p><p style="margin:0;font-size:12px;color:#888">' + openDays.join(", ") + '</p></div>' +
    '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FFD60A,#FF6B35);color:#0A0A0F" onclick="saveHours()">Save Business Hours</button>';
}

function toggleDayAvail(day) {
  settings.hours[day].open = !settings.hours[day].open;
  renderAvailabilityHours();
}

function copyHoursToAllAvail(sourceDay) {
  const src = settings.hours[sourceDay];
  DAYS.forEach(d => {
    settings.hours[d].openTime = src.openTime;
    settings.hours[d].closeTime = src.closeTime;
  });
  renderAvailabilityHours();
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function renderVacation() {
  const s = settings;
  const today = new Date().toISOString().split("T")[0];

  document.getElementById("settings-sub").innerHTML =
    backBtn("availability") +
    subHeader("Availability & Blocking", "Vacation / Date Blocks", "Clients will not be able to book on blocked dates.") +

    '<div class="stg-card" style="margin-bottom:16px">' +
      '<p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#00C2FF">+ Add New Block</p>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">' +
        '<div><div class="field-label">START DATE</div><input type="date" class="input" id="block-start" min="' + today + '" style="color-scheme:dark"></div>' +
        '<div><div class="field-label">END DATE</div><input type="date" class="input" id="block-end" min="' + today + '" style="color-scheme:dark"></div>' +
      '</div>' +
      '<p style="margin:0 0 12px;font-size:11px;color:#555">💡 For a single day off, set start and end to the same date.</p>' +
      '<div id="block-error"></div>' +
      '<div id="block-preview"></div>' +
      '<button class="btn btn-gradient" onclick="addBlock()">Add Block</button>' +
    '</div>' +

    '<div class="stg-card">' +
      '<p style="margin:0 0 16px;font-size:13px;font-weight:700">Active Blocks' +
        (s.blocks.length > 0 ? ' <span class="stg-meta-badge" style="margin-left:8px;background:#00C2FF15;border-color:#00C2FF33;color:#00C2FF">' + s.blocks.length + '</span>' : '') +
      '</p>' +
      (s.blocks.length === 0 ?
        '<div style="text-align:center;padding:28px 0"><p style="font-size:28px;margin:0 0 8px">🗓️</p><p style="margin:0;font-size:13px;color:#555">No blocked dates — you\'re wide open!</p></div>'
      :
        '<div style="display:flex;flex-direction:column;gap:10px">' +
          [...s.blocks].sort((a,b) => a.start.localeCompare(b.start)).map(block =>
            '<div class="block-row">' +
              '<div style="display:flex;gap:10px;align-items:center">' +
                '<span style="font-size:18px">🚫</span>' +
                '<div>' +
                  '<p style="margin:0 0 2px;font-size:13px;font-weight:700">' + (block.start === block.end ? formatDate(block.start) : formatDate(block.start) + ' – ' + formatDate(block.end)) + '</p>' +
                  '<p style="margin:0;font-size:11px;color:#555">' + (block.start === block.end ? "Single day off" : "Date range blocked") + '</p>' +
                '</div>' +
              '</div>' +
              '<button class="block-delete-btn" onclick="removeBlock(' + block.id + ')">🗑️</button>' +
            '</div>'
          ).join("") +
        '</div>'
      ) +
    '</div>' +

    '<div class="stg-warning"><span style="font-size:16px;flex-shrink:0">⚠️</span><p>Clients will not be able to select blocked dates when booking. Existing appointments on these dates are not automatically cancelled.</p></div>';

  // Wire up date preview
  const startEl = document.getElementById("block-start");
  const endEl = document.getElementById("block-end");
  if (startEl && endEl) {
    const updatePreview = () => {
      const s = startEl.value, e = endEl.value;
      const prev = document.getElementById("block-preview");
      if (s && e && e >= s) {
        prev.innerHTML = '<div style="background:#00C2FF0A;border:1px solid #00C2FF22;border-radius:10px;padding:10px 14px;margin-bottom:12px;display:flex;gap:8px;align-items:center"><span>📅</span><p style="margin:0;font-size:13px;color:#00C2FF;font-weight:700">' + (s === e ? formatDate(s) : formatDate(s) + ' – ' + formatDate(e)) + '</p></div>';
      } else {
        prev.innerHTML = "";
      }
    };
    startEl.addEventListener("change", () => { endEl.min = startEl.value || today; updatePreview(); });
    endEl.addEventListener("change", updatePreview);
  }
}

function addBlock() {
  const start = document.getElementById("block-start").value;
  const end = document.getElementById("block-end").value;
  const errEl = document.getElementById("block-error");

  if (!start) { errEl.innerHTML = '<p style="margin:0 0 10px;font-size:12px;color:#FF3366;font-weight:700">✕ Please select a start date.</p>'; return; }
  if (!end) { errEl.innerHTML = '<p style="margin:0 0 10px;font-size:12px;color:#FF3366;font-weight:700">✕ Please select an end date.</p>'; return; }
  if (end < start) { errEl.innerHTML = '<p style="margin:0 0 10px;font-size:12px;color:#FF3366;font-weight:700">✕ End date can\'t be before start date.</p>'; return; }

  settings.blocks.push({ id: Date.now(), start, end });
  saveSettings();
  renderVacation();
}

function removeBlock(id) {
  settings.blocks = settings.blocks.filter(b => b.id !== id);
  saveSettings();
  renderVacation();
}

/* ── Max Appointments ────────────────────────────────────────────────────── */

function renderMaxAppts() {
  const s = settings;

  document.getElementById("settings-sub").innerHTML =
    backBtn("availability") +
    subHeader("Availability & Blocking", "Max Appointments Per Day", "Set a daily cap on bookings so you're never overloaded.") +

    '<div class="stg-card">' +
      '<div class="stg-toggle-row" style="background:' + (s.noLimit ? '#00E5A008' : '#0A0A0F') + ';border-color:' + (s.noLimit ? '#00E5A033' : '#1E1E2E') + '">' +
        '<div><p style="margin:0 0 3px;font-size:14px;font-weight:700">No Appointment Limit</p><p style="margin:0;font-size:12px;color:#666">Accept as many bookings as come in</p></div>' +
        '<div class="toggle-switch' + (s.noLimit ? ' toggle-on' : '') + '" style="' + (s.noLimit ? 'background:#00E5A0' : '') + '" onclick="toggleNoLimit()"><div class="toggle-knob"></div></div>' +
      '</div>' +

      (!s.noLimit ?
        '<div class="field-label" style="margin-top:20px">DAILY MAXIMUM</div>' +
        '<div class="max-grid">' +
          [1,2,3,4,5,6,8,10].map(n =>
            '<div class="max-pill' + (s.maxAppts === n ? ' max-pill-active' : '') + '" onclick="pickMax(' + n + ')">' + n + '</div>'
          ).join("") +
        '</div>' +
        '<div style="margin-bottom:20px"><p style="margin:0 0 8px;font-size:11px;color:#555">Or enter a custom number:</p>' +
          '<div style="display:flex;gap:10px;align-items:center">' +
            '<input type="number" class="input" id="custom-max" min="1" max="99" value="" placeholder="e.g. 7" style="width:90px;font-size:16px;font-weight:700" oninput="customMaxInput(this.value)">' +
            '<p style="margin:0;font-size:13px;color:#666">appointments per day</p>' +
          '</div>' +
        '</div>' +
        '<div class="stg-preview" style="border-color:#A259FF22"><span style="font-size:20px">📋</span><p style="margin:0;font-size:13px;color:#A259FF;font-weight:700">Max <strong>' + s.maxAppts + '</strong> appointment' + (s.maxAppts > 1 ? 's' : '') + ' per day</p></div>'
      :
        '<div class="stg-preview" style="border-color:#00E5A022"><span style="font-size:20px">♾️</span><p style="margin:0;font-size:13px;color:#00E5A0;font-weight:700">No daily limit — accepting all bookings</p></div>'
      ) +

      '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#A259FF,#00C2FF);margin-top:16px" onclick="saveMaxAppts()">Save</button>' +
    '</div>';
}

function toggleNoLimit() {
  settings.noLimit = !settings.noLimit;
  renderMaxAppts();
}

function pickMax(n) {
  settings.maxAppts = n;
  renderMaxAppts();
}

function customMaxInput(val) {
  if (val && parseInt(val) > 0) {
    settings.maxAppts = parseInt(val);
  }
}

function saveMaxAppts() {
  saveSettings();
  showSettingsToast();
}

/* ── Advance Booking ─────────────────────────────────────────────────────── */

function renderAdvance() {
  const s = settings;

  document.getElementById("settings-sub").innerHTML =
    backBtn("availability") +
    subHeader("Availability & Blocking", "Advance Booking Window", "Control how far ahead clients can schedule and how much notice you need.") +

    '<div class="stg-card">' +
      '<div style="margin-bottom:32px">' +
        '<p style="margin:0 0 6px;font-size:13px;font-weight:700">How far in advance can clients book?</p>' +
        '<p style="margin:0 0 16px;font-size:12px;color:#666">Clients won\'t be able to book anything beyond this window.</p>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<input type="number" class="input" id="advance-days" min="1" max="365" value="' + s.advanceDays + '" style="width:90px;font-size:22px;font-weight:700;text-align:center;border-color:#FF6B3566">' +
          '<p style="margin:0;font-size:14px;color:#888">days in advance</p>' +
        '</div>' +
        '<div class="stg-preview" style="margin-top:14px;border-color:#FF6B3522"><span>📅</span><p style="margin:0;font-size:12px;color:#FF6B35;font-weight:700">Clients can book up to <strong id="adv-days-preview">' + s.advanceDays + '</strong> days ahead from today</p></div>' +
      '</div>' +
      '<div style="height:1px;background:#1E1E2E;margin-bottom:28px"></div>' +
      '<div style="margin-bottom:24px">' +
        '<p style="margin:0 0 6px;font-size:13px;font-weight:700">What is the minimum notice required?</p>' +
        '<p style="margin:0 0 16px;font-size:12px;color:#666">Clients can\'t book anything sooner than this from now.</p>' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          '<input type="number" class="input" id="min-hours" min="1" max="168" value="' + s.minHours + '" style="width:90px;font-size:22px;font-weight:700;text-align:center;border-color:#FF6B3566">' +
          '<p style="margin:0;font-size:14px;color:#888">hours minimum notice</p>' +
        '</div>' +
        '<div class="stg-preview" style="margin-top:14px;border-color:#FF6B3522"><span>⏱️</span><p style="margin:0;font-size:12px;color:#FF6B35;font-weight:700">Clients must book at least <strong id="min-hrs-preview">' + s.minHours + '</strong> hours before their appointment</p></div>' +
      '</div>' +
      '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FF6B35,#A259FF)" onclick="saveAdvance()">Save</button>' +
    '</div>';

  document.getElementById("advance-days").addEventListener("input", function() {
    document.getElementById("adv-days-preview").textContent = this.value || "0";
  });
  document.getElementById("min-hours").addEventListener("input", function() {
    document.getElementById("min-hrs-preview").textContent = this.value || "0";
  });
}

function saveAdvance() {
  settings.advanceDays = parseInt(document.getElementById("advance-days").value) || 1;
  settings.minHours = parseInt(document.getElementById("min-hours").value) || 1;
  saveSettings();
  showSettingsToast();
}

/* ── Notifications ───────────────────────────────────────────────────────── */

function channelLabel(sms, email) {
  if (sms && email) return "SMS + Email";
  if (sms) return "SMS only";
  if (email) return "Email only";
  return "No channel selected";
}

function renderNotifications() {
  const s = settings;
  const summaryItemCount = Object.values(s.summaryIncludes).filter(Boolean).length;

  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Notifications", "Choose how and when GlossIO notifies you.") +

    [
      { id: "notifications-booking", icon: "🔔", color: "#00C2FF", label: "New Booking Alerts", desc: s.bookingOn ? "On — " + channelLabel(s.bookingSms, s.bookingEmail) : "Off", on: s.bookingOn },
      { id: "notifications-cancel", icon: "🚫", color: "#FF3366", label: "Cancellation Alerts", desc: s.cancelOn ? "On — " + channelLabel(s.cancelSms, s.cancelEmail) : "Off", on: s.cancelOn },
      { id: "notifications-reminder", icon: "⏰", color: "#FFD60A", label: "24hr Client Reminder", desc: s.reminderOn ? "On — clients get a text reminder 24hrs before" : "Off", on: s.reminderOn },
      { id: "notifications-summary", icon: "📊", color: "#00E5A0", label: "Weekly Email Summary", desc: s.summaryOn ? "On — sent every " + s.summaryDay + ", " + summaryItemCount + " items included" : "Off", on: s.summaryOn },
    ].map(item =>
      '<div class="stg-nav-card" style="border-left-color:' + item.color + '" onclick="showScreen(\'' + item.id + '\')">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div class="stg-section-icon" style="background:' + item.color + '15;border-color:' + item.color + '33">' + item.icon + '</div>' +
          '<div>' +
            '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
              '<p style="margin:0;font-size:15px;font-weight:700">' + item.label + '</p>' +
              '<span class="stg-meta-badge" style="background:' + (item.on ? item.color + '20' : '#1A1A2E') + ';border-color:' + (item.on ? item.color + '44' : '#2A2A3E') + ';color:' + (item.on ? item.color : '#555') + '">' + (item.on ? "On" : "Off") + '</span>' +
            '</div>' +
            '<p style="margin:0;font-size:12px;color:#666">' + item.desc + '</p>' +
          '</div>' +
        '</div>' +
        '<span style="font-size:18px;color:#444;flex-shrink:0">›</span>' +
      '</div>'
    ).join("");
}

function renderToggleCard(label, sublabel, isOn, toggleFn, color) {
  return '<div class="stg-toggle-row" style="background:' + (isOn ? color + '08' : '#0A0A0F') + ';border-color:' + (isOn ? color + '33' : '#1E1E2E') + '">' +
    '<div><p style="margin:0 0 3px;font-size:15px;font-weight:700">' + label + '</p><p style="margin:0;font-size:12px;color:' + (isOn ? color : '#555') + '">' + sublabel + '</p></div>' +
    '<div class="toggle-switch' + (isOn ? ' toggle-on' : '') + '" style="' + (isOn ? 'background:' + color : '') + '" onclick="' + toggleFn + '"><div class="toggle-knob"></div></div>' +
  '</div>';
}

function channelPicker(smsOn, emailOn, smsFn, emailFn) {
  return '<div style="display:flex;gap:8px;margin-top:14px">' +
    '<div class="channel-pick' + (smsOn ? ' channel-active-sms' : '') + '" onclick="' + smsFn + '">' +
      '<span style="font-size:18px">📱</span><div><p style="margin:0 0 2px;font-size:12px;font-weight:700;color:' + (smsOn ? '#00C2FF' : '#666') + '">Text (SMS)</p><p style="margin:0;font-size:10px;color:#555">To your phone</p></div>' +
      '<div class="channel-check' + (smsOn ? ' channel-check-on' : '') + '" style="border-color:' + (smsOn ? '#00C2FF' : '#2A2A3E') + ';background:' + (smsOn ? '#00C2FF' : 'transparent') + '">' + (smsOn ? '<span style="font-size:9px;color:#fff;font-weight:900">✓</span>' : '') + '</div>' +
    '</div>' +
    '<div class="channel-pick' + (emailOn ? ' channel-active-email' : '') + '" onclick="' + emailFn + '">' +
      '<span style="font-size:18px">✉️</span><div><p style="margin:0 0 2px;font-size:12px;font-weight:700;color:' + (emailOn ? '#A259FF' : '#666') + '">Email</p><p style="margin:0;font-size:10px;color:#555">To your inbox</p></div>' +
      '<div class="channel-check' + (emailOn ? ' channel-check-on' : '') + '" style="border-color:' + (emailOn ? '#A259FF' : '#2A2A3E') + ';background:' + (emailOn ? '#A259FF' : 'transparent') + '">' + (emailOn ? '<span style="font-size:9px;color:#fff;font-weight:900">✓</span>' : '') + '</div>' +
    '</div>' +
  '</div>';
}

function renderNotifBooking() {
  const s = settings;
  document.getElementById("settings-sub").innerHTML =
    backBtn("notifications") +
    subHeader("Notifications", "New Booking Alerts", "Get notified the moment a client submits a new booking request.") +

    '<div class="stg-card" style="border-left:3px solid #00C2FF;margin-bottom:16px">' +
      renderToggleCard("New Booking Alerts", s.bookingOn ? "Currently enabled" : "Currently disabled", s.bookingOn, "toggleBookingOn()", "#00C2FF") +
      (s.bookingOn ?
        '<div style="height:1px;background:#1E1E2E;margin:16px 0"></div>' +
        '<p style="margin:0 0 4px;font-size:13px;font-weight:700">How would you like to be notified?</p>' +
        '<p style="margin:0;font-size:12px;color:#666">Select one or both — at least one must be on.</p>' +
        channelPicker(s.bookingSms, s.bookingEmail, "toggleBookingSms()", "toggleBookingEmail()") +
        (!s.bookingSms && !s.bookingEmail ? '<p style="margin:10px 0 0;font-size:12px;color:#FF3366;font-weight:700">⚠ Select at least one notification channel.</p>' : '')
      : '') +
    '</div>' +

    '<div class="stg-hint" style="background:#00C2FF08;border-color:#00C2FF1A"><span>💡</span><p style="color:#00C2FF">You\'ll be notified as soon as a client submits a request — even before you confirm it.</p></div>' +
    '<button class="btn btn-gradient" onclick="saveNotifBooking()" style="margin-top:16px">Save</button>';
}

function toggleBookingOn() { settings.bookingOn = !settings.bookingOn; renderNotifBooking(); }
function toggleBookingSms() { settings.bookingSms = !settings.bookingSms; renderNotifBooking(); }
function toggleBookingEmail() { settings.bookingEmail = !settings.bookingEmail; renderNotifBooking(); }
function saveNotifBooking() { if (settings.bookingOn && !settings.bookingSms && !settings.bookingEmail) return; saveSettings(); showSettingsToast(); showScreen("notifications"); }

function renderNotifCancel() {
  const s = settings;
  document.getElementById("settings-sub").innerHTML =
    backBtn("notifications") +
    subHeader("Notifications", "Cancellation Alerts", "Get notified when a client cancels an appointment.") +

    '<div class="stg-card" style="border-left:3px solid #FF3366;margin-bottom:16px">' +
      renderToggleCard("Cancellation Alerts", s.cancelOn ? "Currently enabled" : "Currently disabled", s.cancelOn, "toggleCancelOn()", "#FF3366") +
      (s.cancelOn ?
        '<div style="height:1px;background:#1E1E2E;margin:16px 0"></div>' +
        '<p style="margin:0 0 4px;font-size:13px;font-weight:700">How would you like to be notified?</p>' +
        '<p style="margin:0;font-size:12px;color:#666">Select one or both — at least one must be on.</p>' +
        channelPicker(s.cancelSms, s.cancelEmail, "toggleCancelSms()", "toggleCancelEmail()") +
        (!s.cancelSms && !s.cancelEmail ? '<p style="margin:10px 0 0;font-size:12px;color:#FF3366;font-weight:700">⚠ Select at least one notification channel.</p>' : '')
      : '') +
    '</div>' +

    '<div class="stg-hint" style="background:#FF336608;border-color:#FF336622"><span>💡</span><p style="color:#FF3366">Cancellation alerts help you react fast — rebook the slot or reach out to the client directly.</p></div>' +
    '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FF3366,#A259FF);margin-top:16px" onclick="saveNotifCancel()">Save</button>';
}

function toggleCancelOn() { settings.cancelOn = !settings.cancelOn; renderNotifCancel(); }
function toggleCancelSms() { settings.cancelSms = !settings.cancelSms; renderNotifCancel(); }
function toggleCancelEmail() { settings.cancelEmail = !settings.cancelEmail; renderNotifCancel(); }
function saveNotifCancel() { if (settings.cancelOn && !settings.cancelSms && !settings.cancelEmail) return; saveSettings(); showSettingsToast(); showScreen("notifications"); }

function renderNotifReminder() {
  const s = settings;
  document.getElementById("settings-sub").innerHTML =
    backBtn("notifications") +
    subHeader("Notifications", "24hr Client Reminder", "Automatically text your clients 24 hours before their appointment to reduce no-shows.") +

    '<div class="stg-card" style="border-left:3px solid #FFD60A;margin-bottom:16px">' +
      renderToggleCard("Automatic 24hr Reminder", s.reminderOn ? "Enabled — clients will be texted automatically" : "Disabled — no reminders will be sent", s.reminderOn, "toggleReminder()", "#FFD60A") +
    '</div>' +

    '<div class="stg-card" style="margin-bottom:16px;opacity:' + (s.reminderOn ? '1' : '0.4') + '">' +
      '<p style="margin:0 0 14px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em">📱 Preview — What your client receives</p>' +
      '<div style="background:#0A0A0F;border-radius:12px;padding:14px 16px;border-left:3px solid #FFD60A">' +
        '<p style="margin:0 0 4px;font-size:11px;color:#FFD60A;font-weight:700">GlossIO — Your Business</p>' +
        '<p style="margin:0;font-size:13px;color:#C8C4BC;line-height:1.7">Hey! Just a reminder that your detail appointment is <strong>tomorrow</strong>. 📅<br><strong>Service:</strong> Full Detail<br><strong>Time:</strong> 10:00 AM<br><strong>Location:</strong> Your City<br><br>Not going to make it? <span style="color:#00C2FF;text-decoration:underline">Click here to reschedule or cancel.</span></p>' +
      '</div>' +
    '</div>' +

    '<div class="stg-hint" style="background:#FFD60A0A;border-color:#FFD60A22"><span>💡</span><p style="color:#FFD60A">This reminder goes out automatically via SMS — no action needed from you.</p></div>' +
    '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#FFD60A,#FF6B35);color:#0A0A0F;margin-top:16px" onclick="saveReminder()">Save</button>';
}

function toggleReminder() { settings.reminderOn = !settings.reminderOn; renderNotifReminder(); }
function saveReminder() { saveSettings(); showSettingsToast(); showScreen("notifications"); }

function renderNotifSummary() {
  const s = settings;
  const itemCount = Object.values(s.summaryIncludes).filter(Boolean).length;

  const items = [
    { key: "upcoming", icon: "📅", label: "Upcoming appointments for the week", desc: "A list of all confirmed jobs ahead" },
    { key: "revenue", icon: "💰", label: "Revenue MTD", desc: "Your month-to-date earnings so far" },
    { key: "newClients", icon: "👥", label: "New clients added", desc: "Any new clients booked that week" },
    { key: "cancellations", icon: "🚫", label: "Cancellations that week", desc: "Jobs that were cancelled in the past 7 days" },
  ];

  document.getElementById("settings-sub").innerHTML =
    backBtn("notifications") +
    subHeader("Notifications", "Weekly Email Summary", "A weekly recap of your business sent straight to your inbox.") +

    '<div class="stg-card" style="border-left:3px solid #00E5A0;margin-bottom:16px">' +
      renderToggleCard("Weekly Email Summary", s.summaryOn ? "Enabled" : "Disabled", s.summaryOn, "toggleSummary()", "#00E5A0") +

      (s.summaryOn ?
        '<div style="margin-top:22px"><p style="margin:0 0 10px;font-size:12px;font-weight:700">Send every:</p>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
          DAYS.map(d =>
            '<div class="day-pick' + (s.summaryDay === d ? ' day-pick-active' : '') + '" onclick="pickSummaryDay(\'' + d + '\')">' + d.slice(0,3) + '</div>'
          ).join("") +
        '</div></div>' +
        '<div style="height:1px;background:#1E1E2E;margin:20px 0"></div>' +
        '<p style="margin:0 0 12px;font-size:12px;font-weight:700">What to include:</p>' +
        items.map(item =>
          '<div class="summary-item' + (s.summaryIncludes[item.key] ? ' summary-item-active' : '') + '" onclick="toggleSummaryItem(\'' + item.key + '\')">' +
            '<span style="font-size:20px;flex-shrink:0">' + item.icon + '</span>' +
            '<div style="flex:1"><p style="margin:0 0 2px;font-size:13px;font-weight:700;color:' + (s.summaryIncludes[item.key] ? '#F0EDE8' : '#666') + '">' + item.label + '</p><p style="margin:0;font-size:11px;color:#555">' + item.desc + '</p></div>' +
            '<div class="channel-check' + (s.summaryIncludes[item.key] ? ' channel-check-on' : '') + '" style="border-color:' + (s.summaryIncludes[item.key] ? '#00E5A0' : '#2A2A3E') + ';background:' + (s.summaryIncludes[item.key] ? '#00E5A0' : 'transparent') + '">' + (s.summaryIncludes[item.key] ? '<span style="font-size:10px;color:#0A0A0F;font-weight:900">✓</span>' : '') + '</div>' +
          '</div>'
        ).join("") +
        (itemCount === 0 ? '<p style="margin:8px 0 0;font-size:12px;color:#FF3366;font-weight:700">⚠ Select at least one item to include.</p>' : '')
      : '') +
    '</div>' +

    (s.summaryOn ?
      '<div class="stg-preview" style="margin-bottom:16px"><p style="margin:0 0 8px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.15em">Current Settings</p>' +
      '<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px"><span>📅</span><p style="margin:0;font-size:13px">Sent every <strong style="color:#00E5A0">' + s.summaryDay + '</strong></p></div>' +
      '<div style="display:flex;gap:8px;align-items:center"><span>📋</span><p style="margin:0;font-size:13px"><strong style="color:#00E5A0">' + itemCount + '</strong> item' + (itemCount !== 1 ? 's' : '') + ' included</p></div></div>'
    : '') +

    '<button class="btn btn-gradient" style="background:linear-gradient(135deg,#00E5A0,#00C2FF);color:#0A0A0F" onclick="saveSummary()">Save</button>';
}

function toggleSummary() { settings.summaryOn = !settings.summaryOn; renderNotifSummary(); }
function pickSummaryDay(d) { settings.summaryDay = d; renderNotifSummary(); }
function toggleSummaryItem(key) { settings.summaryIncludes[key] = !settings.summaryIncludes[key]; renderNotifSummary(); }
function saveSummary() { const c = Object.values(settings.summaryIncludes).filter(Boolean).length; if (settings.summaryOn && c === 0) return; saveSettings(); showSettingsToast(); showScreen("notifications"); }

/* ── Subscription & Billing ──────────────────────────────────────────────── */

var PLAN = { name: "GlossIO Pro", price: "$19.98/mo", trialEnds: "—", nextBilling: "—", memberSince: "—", email: "—", card: "Managed by Stripe" };
var BILLING_HISTORY = [];

function getBillingBadge() {
  var st = PLAN.status || "trialing";
  if (st === "active") return { text: "Active", bg: "#00E5A020", border: "#00E5A044", color: "#00E5A0" };
  if (st === "canceled") return { text: "Cancelled", bg: "#FF336620", border: "#FF336644", color: "#FF3366" };
  if (st === "past_due") return { text: "Past Due", bg: "#FF336620", border: "#FF336644", color: "#FF3366" };
  return { text: "Trial Active", bg: "#FFD60A20", border: "#FFD60A44", color: "#FFD60A" };
}

function getBillingSubline() {
  var st = PLAN.status || "trialing";
  if (st === "active") return "Your subscription is active · " + PLAN.price;
  if (st === "canceled") return "Access until " + PLAN.trialEnds;
  if (st === "past_due") return "Payment failed — please update your payment method";
  return "Trial ends " + PLAN.trialEnds + " · " + PLAN.price + " after";
}

function renderBilling() {
  var badge = getBillingBadge();
  var isCanceled = (PLAN.status === "canceled") || settings.cancelled;
  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Subscription & Billing", "Manage your plan, payment method, and billing history.") +

    '<div class="billing-banner">' +
      '<div style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:46px;height:46px;border-radius:12px;background:linear-gradient(135deg,#00C2FF,#A259FF);display:flex;align-items:center;justify-content:center;font-size:22px">💳</div>' +
        '<div>' +
          '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
            '<p style="margin:0;font-size:16px;font-weight:700">' + PLAN.name + '</p>' +
            '<span class="stg-meta-badge" style="background:' + badge.bg + ';border-color:' + badge.border + ';color:' + badge.color + '">' + badge.text + '</span>' +
          '</div>' +
          '<p style="margin:0;font-size:12px;color:#666">' + getBillingSubline() + '</p>' +
        '</div>' +
      '</div>' +
    '</div>' +

    [
      { id: "billing-plan", icon: "⭐", color: "#FFD60A", label: "Current Plan", desc: PLAN.name + " · " + PLAN.price },
      { id: "billing-payment", icon: "💳", color: "#00C2FF", label: "Update Payment Method", desc: PLAN.card + " · Redirects to Stripe" },
      { id: "billing-history", icon: "🧾", color: "#A259FF", label: "Billing History", desc: "View invoices and charges" },
      { id: "billing-cancel", icon: "⚠️", color: "#FF3366", label: "Cancel Subscription", desc: isCanceled ? "Already cancelled" : "Keep access until end of billing period", disabled: isCanceled },
    ].map(item =>
      '<div class="stg-nav-card' + (item.disabled ? ' stg-nav-disabled' : '') + '" style="border-left-color:' + (item.disabled ? '#2A2A3E' : item.color) + '" onclick="' + (item.disabled ? '' : "showScreen('" + item.id + "')") + '">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div class="stg-section-icon" style="background:' + item.color + '15;border-color:' + item.color + '33">' + item.icon + '</div>' +
          '<div><p style="margin:0 0 4px;font-size:15px;font-weight:700">' + item.label + '</p><p style="margin:0;font-size:12px;color:#666">' + item.desc + '</p></div>' +
        '</div>' +
        '<span style="font-size:18px;color:#444;flex-shrink:0">›</span>' +
      '</div>'
    ).join("");
}

function renderBillingPlan() {
  var badge = getBillingBadge();
  document.getElementById("settings-sub").innerHTML =
    backBtn("billing") +
    subHeader("Subscription & Billing", "Current Plan", "") +

    '<div class="billing-plan-card">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">' +
        '<div><p style="margin:0 0 6px;font-size:22px;font-weight:700">' + PLAN.name + '</p><span class="stg-meta-badge" style="background:' + badge.bg + ';border-color:' + badge.border + ';color:' + badge.color + '">' + badge.text + '</span></div>' +
        '<p style="margin:0;font-size:28px;font-weight:700;color:#00C2FF">' + PLAN.price + '</p>' +
      '</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
        [
          { label: "Trial Ends", value: PLAN.trialEnds, color: "#FFD60A" },
          { label: "Next Billing", value: PLAN.nextBilling, color: "#00C2FF" },
          { label: "Member Since", value: PLAN.memberSince, color: "#A259FF" },
          { label: "Billing Email", value: PLAN.email, color: "#F0EDE8" },
        ].map(i => '<div style="background:#0A0A0F;border-radius:10px;padding:12px 14px"><p style="margin:0 0 4px;font-size:10px;color:#555;text-transform:uppercase;letter-spacing:0.12em">' + i.label + '</p><p style="margin:0;font-size:12px;font-weight:700;color:' + i.color + '">' + i.value + '</p></div>').join("") +
      '</div>' +
    '</div>' +

    '<div class="stg-card" style="margin-bottom:20px">' +
      '<p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.15em">What\'s included</p>' +
      ["Unlimited client bookings","Custom public booking page","Client CRM & history","Revenue tracking dashboard","Shareable social media link","Photo gallery for your work"].map(f =>
        '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><span style="color:#00E5A0;font-weight:700;font-size:13px">✓</span><p style="margin:0;font-size:13px;color:#C8C4BC">' + f + '</p></div>'
      ).join("") +
    '</div>' +

    '<div class="stg-hint" style="background:#FFD60A08;border-color:#FFD60A33"><span style="font-size:24px">💡</span><div><p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#FFD60A">Save $50 with Annual billing</p><p style="margin:0;font-size:12px;color:#888;line-height:1.6">Switch to $189.76/yr and save $50.</p></div></div>' +
    '<button class="btn btn-gradient" style="margin-top:16px" onclick="showScreen(\'billing\')">Got It</button>';
}

function renderBillingPayment() {
  var hasCard = PLAN.card && PLAN.card !== "Managed by Stripe" && PLAN.card !== "—";
  document.getElementById("settings-sub").innerHTML =
    backBtn("billing") +
    subHeader("Subscription & Billing", "Update Payment Method", "Your payment details are managed securely through Stripe.") +

    '<div class="stg-card" style="margin-bottom:20px">' +
      '<p style="margin:0 0 14px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.15em">Current Payment Method</p>' +
      '<div style="display:flex;align-items:center;gap:12px">' +
        '<div style="width:48px;height:32px;background:#1A1A2E;border:1px solid #2A2A3E;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:18px">💳</div>' +
        '<div><p style="margin:0 0 2px;font-size:14px;font-weight:700">' + PLAN.card + '</p><p style="margin:0;font-size:11px;color:#555">' + (hasCard ? "Managed by Stripe" : "No card on file yet") + '</p></div>' +
      '</div>' +
    '</div>' +

    '<div style="background:#00C2FF08;border:1px solid #00C2FF22;border-radius:14px;padding:24px;margin-bottom:24px;text-align:center">' +
      '<div style="width:64px;height:64px;border-radius:50%;background:#00C2FF10;border:1px solid #00C2FF33;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:30px">🔒</div>' +
      '<p style="margin:0 0 8px;font-size:15px;font-weight:700">Secure Payment via Stripe</p>' +
      '<p style="margin:0 0 16px;font-size:13px;color:#666;line-height:1.7">Clicking below will open Stripe\'s secure portal where you can update your card details.</p>' +
      '<div style="display:flex;gap:8px;justify-content:center">' +
        ["🔐 256-bit SSL","✓ PCI Compliant","✓ Stripe Secured"].map(b => '<span style="font-size:10px;background:#0A0A0F;border:1px solid #1E1E2E;border-radius:20px;color:#555;padding:3px 10px">' + b + '</span>').join("") +
      '</div>' +
    '</div>' +

    '<button class="btn btn-gradient" onclick="openStripePortal()">🔒 Update Payment Method via Stripe →</button>';
}

function openStripePortal() {
  if (window.glossioStripe && window.glossioStripe.openPortal) {
    showSettingsToast("Redirecting to Stripe...");
    window.glossioStripe.openPortal().catch(function(err) {
      console.error("Stripe portal error:", err);
      showSettingsToast("Could not open Stripe portal. Please try again.");
    });
  } else {
    showSettingsToast("Stripe is not configured yet.");
  }
}

function renderBillingHistory() {
  var hasHistory = BILLING_HISTORY.length > 0;
  document.getElementById("settings-sub").innerHTML =
    backBtn("billing") +
    subHeader("Subscription & Billing", "Billing History", "All past charges and invoices for your GlossIO account.") +

    (hasHistory ?
      '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">' +
        BILLING_HISTORY.map(item =>
          '<div class="stg-card" style="padding:16px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px">' +
            '<div style="display:flex;align-items:center;gap:12px">' +
              '<div style="width:40px;height:40px;border-radius:10px;background:' + (item.status === "Trial" ? "#FFD60A10" : "#00E5A010") + ';border:1px solid ' + (item.status === "Trial" ? "#FFD60A33" : "#00E5A033") + ';display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">🧾</div>' +
              '<div><p style="margin:0 0 3px;font-size:13px;font-weight:700">' + item.desc + '</p><p style="margin:0;font-size:11px;color:#555">' + item.date + ' · ' + item.invoice + '</p></div>' +
            '</div>' +
            '<div style="text-align:right;flex-shrink:0">' +
              '<p style="margin:0 0 4px;font-size:14px;font-weight:700">' + item.amount + '</p>' +
              '<span class="stg-meta-badge" style="background:' + (item.status === "Trial" ? "#FFD60A15" : "#00E5A015") + ';border-color:' + (item.status === "Trial" ? "#FFD60A33" : "#00E5A033") + ';color:' + (item.status === "Trial" ? "#FFD60A" : "#00E5A0") + '">' + item.status + '</span>' +
            '</div>' +
          '</div>'
        ).join("") +
      '</div>'
    :
      '<div class="stg-card" style="padding:40px 20px;text-align:center">' +
        '<p style="font-size:36px;margin:0 0 12px">🧾</p>' +
        '<p style="margin:0 0 6px;font-size:15px;font-weight:700">No billing history yet</p>' +
        '<p style="margin:0;font-size:12px;color:#555">Invoices will appear here once your trial ends and billing begins.</p>' +
      '</div>'
    ) +

    '<div class="stg-hint" style="margin-top:24px"><span>💡</span><p>Need a receipt? Contact <span style="color:#00C2FF">support@glossio.app</span> and we\'ll send you a copy.</p></div>';
}

function renderBillingCancel() {
  document.getElementById("settings-sub").innerHTML =
    backBtn("billing") +
    subHeader("Subscription & Billing", "Cancel Subscription", "") +

    '<div id="cancel-step-1">' +
      '<div style="background:#FF336608;border:1px solid #FF336622;border-radius:16px;padding:24px;margin-bottom:16px">' +
        '<p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#FF3366">⚠️ Before you go — here\'s what you\'ll lose:</p>' +
        ["Your public booking page goes offline","Clients can no longer book you through GlossIO","Access to your client CRM & history","Automated reminders & notifications","Revenue tracking dashboard"].map(item =>
          '<div style="display:flex;gap:10px;align-items:center;margin-bottom:10px"><span style="color:#FF3366;font-size:13px;font-weight:700;flex-shrink:0">✕</span><p style="margin:0;font-size:13px;color:#C8C4BC">' + item + '</p></div>'
        ).join("") +
      '</div>' +

      '<div class="stg-preview"><span style="font-size:20px">📅</span><p style="margin:0;font-size:13px;line-height:1.7">If you cancel, you\'ll keep full access until <strong style="color:#FFD60A">' + PLAN.trialEnds + '</strong>. After that your account will be deactivated.</p></div>' +

      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-gradient" style="flex:2" onclick="showScreen(\'billing\')">Keep My Subscription</button>' +
        '<button class="btn" style="flex:1;background:#111118;border:1px solid #FF336633;color:#FF3366" onclick="confirmCancel()">Cancel</button>' +
      '</div>' +
    '</div>';
}

function confirmCancel() {
  document.getElementById("cancel-step-1").innerHTML =
    '<div class="stg-card" style="padding:48px 32px;text-align:center">' +
      '<div style="width:80px;height:80px;border-radius:50%;background:#FF336610;border:2px solid #FF336633;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:36px">😔</div>' +
      '<h2 style="font-size:22px;font-weight:700;margin:0 0 10px">Subscription Cancelled</h2>' +
      '<p style="font-size:13px;color:#666;margin:0 0 20px;line-height:1.7">Your GlossIO Pro subscription has been cancelled. You\'ll keep full access until <strong style="color:#FFD60A">' + PLAN.trialEnds + '</strong>.</p>' +
      '<div class="stg-hint"><span>💡</span><p>Changed your mind? You can reactivate anytime before <strong style="color:#F0EDE8">' + PLAN.trialEnds + '</strong>.</p></div>' +
      '<button class="btn btn-gradient" style="margin-top:20px" onclick="finishCancel()">← Back to Settings</button>' +
    '</div>';
}

function finishCancel() {
  settings.cancelled = true;
  saveSettings();
  showSettingsToast("Subscription cancelled");
  showScreen("billing");
}

/* ── Support ─────────────────────────────────────────────────────────────── */

function renderSupport() {
  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Contact Support", "Send a message to the GlossIO team. We'll respond within 24 hours.") +

    '<div id="support-form">' +
      '<div class="stg-card" style="border-left:3px solid #00C2FF;margin-bottom:20px">' +
        '<div class="field-label">SUBJECT</div>' +
        '<input class="input" id="sup-subject" maxlength="80" placeholder="What\'s your issue about?">' +
        '<p class="char-count"><span id="sup-subject-count">0</span>/80</p>' +

        '<div class="field-label">PRIORITY</div>' +
        '<div style="display:flex;gap:8px;margin-bottom:18px">' +
          [
            { label: "Low", color: "#00E5A0" },
            { label: "Normal", color: "#00C2FF" },
            { label: "Urgent", color: "#FF3366" },
          ].map(p =>
            '<div class="priority-pick' + (p.label === "Normal" ? ' priority-active' : '') + '" data-priority="' + p.label + '" data-color="' + p.color + '" onclick="pickPriority(\'' + p.label + '\')" style="' + (p.label === "Normal" ? 'background:#00C2FF15;border-color:#00C2FF55;color:#00C2FF' : '') + '"><p style="margin:0;font-size:12px;font-weight:700">' + p.label + '</p></div>'
          ).join("") +
        '</div>' +

        '<div class="field-label">MESSAGE</div>' +
        '<textarea class="input" id="sup-message" rows="5" maxlength="1000" style="resize:vertical" placeholder="Describe your issue in detail..."></textarea>' +
        '<p class="char-count"><span id="sup-msg-count">0</span>/1000</p>' +
      '</div>' +

      '<div class="stg-hint" style="background:#00C2FF08;border-color:#00C2FF1A"><span>🛡️</span><p style="color:#00C2FF">For urgent issues you can also email us directly at <strong>support@glossio.app</strong>.</p></div>' +
      '<button class="btn btn-gradient" style="margin-top:16px" id="sup-send-btn" onclick="sendSupport()">Send Message → support@glossio.app</button>' +
    '</div>';

  document.getElementById("sup-subject").addEventListener("input", function() {
    document.getElementById("sup-subject-count").textContent = this.value.length;
  });
  document.getElementById("sup-message").addEventListener("input", function() {
    document.getElementById("sup-msg-count").textContent = this.value.length;
  });
}

function pickPriority(label) {
  const colors = { Low: "#00E5A0", Normal: "#00C2FF", Urgent: "#FF3366" };
  document.querySelectorAll(".priority-pick").forEach(p => {
    const isActive = p.dataset.priority === label;
    const c = colors[p.dataset.priority];
    p.className = "priority-pick" + (isActive ? " priority-active" : "");
    p.style.background = isActive ? c + "15" : "";
    p.style.borderColor = isActive ? c + "55" : "";
    p.style.color = isActive ? c : "";
  });
}

function sendSupport() {
  const subj = document.getElementById("sup-subject").value.trim();
  const msg = document.getElementById("sup-message").value.trim();
  if (!subj || !msg) return;

  document.getElementById("support-form").innerHTML =
    '<div class="stg-card" style="padding:52px 32px;text-align:center">' +
      '<div style="width:80px;height:80px;border-radius:50%;background:#00C2FF10;border:2px solid #00C2FF33;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:38px">📬</div>' +
      '<h2 style="font-size:22px;font-weight:700;margin:0 0 10px">Message Sent!</h2>' +
      '<p style="font-size:13px;color:#666;margin:0 0 8px;line-height:1.7">Your message has been sent to the GlossIO team.</p>' +
      '<p style="font-size:13px;color:#666;margin:0 0 28px;line-height:1.7">We\'ll reply within 24 hours.</p>' +
      '<p style="font-size:28px;margin:0 0 28px">🙂</p>' +
      '<button class="btn btn-gradient" onclick="showScreen(\'hub\')">← Back to Settings</button>' +
    '</div>';
}

/* ── Account & Security (placeholder) ────────────────────────────────────── */

function renderAccount() {
  document.getElementById("settings-sub").innerHTML =
    backBtn("hub") +
    subHeader("Settings", "Account & Security", "Manage your login credentials and security settings.") +

    '<div class="stg-nav-card" style="border-left-color:#00C2FF" onclick="showScreen(\'account-password\')">' +
      '<div style="display:flex;gap:14px;align-items:center">' +
        '<div class="stg-section-icon" style="background:#00C2FF15;border-color:#00C2FF33">🔑</div>' +
        '<div><p style="margin:0 0 4px;font-size:15px;font-weight:700">Change Password</p><p style="margin:0;font-size:12px;color:#666">Update your account password</p></div>' +
      '</div>' +
      '<span style="font-size:18px;color:#444;flex-shrink:0">›</span>' +
    '</div>' +

    [
      { icon: "✉️", color: "#A259FF", label: "Change Email", desc: "Update your login email address" },
      { icon: "📱", color: "#FF6B35", label: "Change Phone", desc: "Update your phone number" },
      { icon: "🛡️", color: "#FFD60A", label: "Two-Factor Authentication", desc: "Add an extra layer of security" },
    ].map(item =>
      '<div class="stg-nav-card" style="border-left-color:' + item.color + ';cursor:default;opacity:0.6">' +
        '<div style="display:flex;gap:14px;align-items:center">' +
          '<div class="stg-section-icon" style="background:' + item.color + '15;border-color:' + item.color + '33">' + item.icon + '</div>' +
          '<div><p style="margin:0 0 4px;font-size:15px;font-weight:700">' + item.label + '</p><p style="margin:0;font-size:12px;color:#666">' + item.desc + '</p></div>' +
        '</div>' +
        '<span class="stg-meta-badge" style="background:#1A1A2E;border-color:#2A2A3E;color:#555">Coming Soon</span>' +
      '</div>'
    ).join("");
}

function renderAccountPassword() {
  document.getElementById("settings-sub").innerHTML =
    backBtn("account") +
    subHeader("Account & Security", "Change Password", "Enter your current password and choose a new one.") +

    '<div class="stg-card">' +
      '<div style="margin-bottom:20px">' +
        '<label style="display:block;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">Current Password</label>' +
        '<input type="password" id="pwdCurrent" class="stg-input" placeholder="Enter current password" autocomplete="current-password">' +
      '</div>' +
      '<div style="margin-bottom:20px">' +
        '<label style="display:block;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">New Password</label>' +
        '<input type="password" id="pwdNew" class="stg-input" placeholder="Enter new password" autocomplete="new-password">' +
      '</div>' +
      '<div style="margin-bottom:24px">' +
        '<label style="display:block;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:6px">Confirm New Password</label>' +
        '<input type="password" id="pwdConfirm" class="stg-input" placeholder="Confirm new password" autocomplete="new-password">' +
      '</div>' +
      '<div id="pwdMsg" style="display:none;margin-bottom:16px;padding:10px 14px;border-radius:8px;font-size:13px"></div>' +
      '<button class="btn btn-gradient" id="pwdSubmit" onclick="handleChangePassword()">Change Password</button>' +
    '</div>' +

    '<div class="stg-hint"><span>🔒</span><p>Your password must be at least 6 characters. After changing your password you will remain logged in.</p></div>';
}

function handleChangePassword() {
  var current = document.getElementById("pwdCurrent").value.trim();
  var newPwd = document.getElementById("pwdNew").value.trim();
  var confirm = document.getElementById("pwdConfirm").value.trim();
  var msgEl = document.getElementById("pwdMsg");
  var btn = document.getElementById("pwdSubmit");

  function showMsg(text, isError) {
    msgEl.style.display = "block";
    msgEl.textContent = text;
    msgEl.style.background = isError ? "#FF336615" : "#00E5A015";
    msgEl.style.color = isError ? "#FF3366" : "#00E5A0";
    msgEl.style.border = "1px solid " + (isError ? "#FF336633" : "#00E5A033");
  }

  if (!current) { showMsg("Please enter your current password.", true); return; }
  if (!newPwd) { showMsg("Please enter a new password.", true); return; }
  if (newPwd.length < 6) { showMsg("New password must be at least 6 characters.", true); return; }
  if (newPwd !== confirm) { showMsg("New passwords do not match.", true); return; }
  if (newPwd === current) { showMsg("New password must be different from current password.", true); return; }

  btn.disabled = true;
  btn.textContent = "Updating...";
  msgEl.style.display = "none";

  /* Verify current password by re-signing in */
  window.sbAuth.getSession().then(function(session) {
    if (!session || !session.user || !session.user.email) {
      throw new Error("No active session");
    }
    return window.sbClient.auth.signInWithPassword({ email: session.user.email, password: current });
  }).then(function(result) {
    if (result.error) throw new Error("Current password is incorrect.");
    /* Current password verified — now update */
    return window.sbClient.auth.updateUser({ password: newPwd });
  }).then(function(result) {
    if (result.error) throw result.error;
    showMsg("Password changed successfully!", false);
    btn.textContent = "Change Password";
    btn.disabled = false;
    document.getElementById("pwdCurrent").value = "";
    document.getElementById("pwdNew").value = "";
    document.getElementById("pwdConfirm").value = "";
  }).catch(function(err) {
    showMsg(err.message || "Failed to change password. Please try again.", true);
    btn.textContent = "Change Password";
    btn.disabled = false;
  });
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadSettings();

  /* ── Hydrate settings bar from Supabase profile ── */
  if (window.db && window.db.profile) {
    window.db.profile.get().then(function(profile) {
      if (!profile) return;

      /* Also hydrate the PLAN object for billing sub-pages */
      var status = profile.subscription_status || "trialing";
      var trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
      var createdAt = profile.created_at ? new Date(profile.created_at) : null;

      /* Plan label */
      var planEl = document.getElementById("stgBarPlan");
      if (planEl) {
        var planLabels = { trialing: "Free Trial", active: "PRO", past_due: "Past Due", canceled: "Canceled", incomplete: "Incomplete" };
        planEl.textContent = planLabels[status] || "Free Trial";
        if (status === "active") planEl.style.color = "#00E5A0";
        else if (status === "past_due" || status === "canceled") planEl.style.color = "#FF3366";
      }

      /* Trial Ends */
      var trialEl = document.getElementById("stgBarTrialEnds");
      if (trialEl && trialEnd) {
        var now = new Date();
        var daysLeft = Math.max(0, Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24)));
        if (status === "active") {
          trialEl.textContent = "—";
          trialEl.style.color = "#555";
        } else if (daysLeft <= 0) {
          trialEl.textContent = "Expired";
          trialEl.style.color = "#FF3366";
        } else {
          trialEl.textContent = daysLeft + (daysLeft === 1 ? " day" : " days");
        }
      }

      /* Member Since */
      var memberEl = document.getElementById("stgBarMemberSince");
      if (memberEl && createdAt) {
        var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        memberEl.textContent = months[createdAt.getMonth()] + " " + createdAt.getDate() + ", " + createdAt.getFullYear();
      }

      /* Account status */
      var acctEl = document.getElementById("stgBarAccount");
      if (acctEl) {
        if (status === "active" || status === "trialing") {
          acctEl.textContent = "Active";
          acctEl.style.color = "#00E5A0";
        } else if (status === "past_due") {
          acctEl.textContent = "Past Due";
          acctEl.style.color = "#FF3366";
        } else if (status === "canceled") {
          acctEl.textContent = "Canceled";
          acctEl.style.color = "#FF3366";
        } else {
          acctEl.textContent = "Inactive";
          acctEl.style.color = "#FF3366";
        }
      }

      /* Update PLAN object for billing sub-pages */
      PLAN.status = status;
      if (status === "active") {
        PLAN.price = "$19.98/mo"; /* Will be updated if we know the actual plan */
      }
      if (trialEnd) {
        var m2 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        PLAN.trialEnds = m2[trialEnd.getMonth()] + " " + trialEnd.getDate() + ", " + trialEnd.getFullYear();
        PLAN.nextBilling = PLAN.trialEnds;
      }
      if (createdAt) {
        var m3 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        PLAN.memberSince = m3[createdAt.getMonth()] + " " + createdAt.getDate() + ", " + createdAt.getFullYear();
      }
      /* Use real email from auth session */
      if (window.sbAuth) {
        window.sbAuth.getSession().then(function(session) {
          if (session && session.user && session.user.email) {
            PLAN.email = session.user.email;
          }
        });
      }
    });
  }

  // Make hub section cards clickable
  document.querySelectorAll(".settings-section").forEach(card => {
    const title = card.querySelector(".settings-section-title")?.textContent || "";
    let screen = "hub";
    if (title.includes("Account")) screen = "account";
    else if (title.includes("Availability")) screen = "availability";
    else if (title.includes("Notifications")) screen = "notifications";
    else if (title.includes("Subscription")) screen = "billing";
    else if (title.includes("Support")) screen = "support";
    card.style.cursor = "pointer";
    card.addEventListener("click", () => showScreen(screen));
  });

  // Also make individual chips clickable
  document.querySelectorAll(".settings-chip").forEach(chip => {
    chip.style.cursor = "pointer";
  });
});
