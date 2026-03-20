/* ─── Public Profile Page ─────────────────────────────────────────────────── */

var PROFILE_KEY = "glossio_profile";
var PHOTOS_KEY = "glossio_work_photos";
var SERVICES_KEY = "glossio_services";

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch(e) { return {}; }
}
function loadPhotos() {
  try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "[]"); } catch(e) { return []; }
}
function loadServices() {
  try { return JSON.parse(localStorage.getItem(SERVICES_KEY) || "[]"); } catch(e) { return []; }
}

/** Extract slug from URL path: /profile/carlos-detail-co → "carlos-detail-co" */
function getSlugFromUrl() {
  var match = window.location.pathname.match(/\/profile\/([^\/]+)/);
  return match ? match[1] : null;
}

/** Try to load profile from API (Supabase via Netlify Function), fall back to localStorage */
function loadProfileData() {
  var slug = getSlugFromUrl();

  /* If we have a slug and the API is available, fetch from server */
  if (slug) {
    return window.api.get("public-profile", { slug: slug })
      .then(function(data) {
        if (data.error) throw new Error(data.error);
        return {
          profile: data.profile || {},
          photos: data.photos || [],
          services: data.services || []
        };
      })
      .catch(function() {
        /* API failed — fall back to localStorage */
        return {
          profile: loadProfile(),
          photos: loadPhotos(),
          services: loadServices()
        };
      });
  }

  /* No slug in URL — use localStorage (dashboard preview mode) */
  return Promise.resolve({
    profile: loadProfile(),
    photos: loadPhotos(),
    services: loadServices()
  });
}

/* ── Render the full public profile ─────────────────────────────────────── */

function renderPublicProfile() {
  loadProfileData().then(function(data) {
    doRender(data.profile, data.photos, data.services);
  });
}

function doRender(p, photos, services) {
  var name = p.displayName || p.company_name || "Your Business";
  var tagline = p.tagline || "Professional Auto Detailing";
  var city = p.city || "";
  var state = p.state || "";
  var location = [city, state].filter(Boolean).join(", ");
  var bio = p.bio || "Professional auto detailing with attention to every detail.";
  var details = p.detailsCount || "50+";
  var rating = p.rating || "5.0";
  var experience = p.experience || "3+";
  var initial = name.charAt(0).toUpperCase();

  var container = document.getElementById("pub-content");
  if (!container) return;

  container.innerHTML =
    /* ── TOP BAR ── */
    '<div class="pub-topbar">' +
      '<a href="/" class="gradient-text" style="font-size:18px;font-weight:700;text-decoration:none">GlossIO</a>' +
      '<div class="pub-verified">' +
        '<span class="pub-verified-dot"></span>' +
        '<span>Verified Detailer</span>' +
      '</div>' +
    '</div>' +

    /* ── HERO ── */
    '<section class="pub-hero-full">' +
      '<div class="pub-glow"></div>' +
      '<div class="pub-avatar-ring">' + initial + '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<h1 class="pub-name" style="margin:0">' + esc(name) + '</h1>' +
        '<span class="pub-pro-badge">&#10003; PRO</span>' +
      '</div>' +
      '<p class="pub-tagline">' + esc(tagline + (location ? " · " + location : "")) + '</p>' +

      '<div class="pub-stats-pill">' +
        '<div class="pub-stat-item"><p class="pub-stat-val">' + esc(details) + '</p><p class="pub-stat-lbl">Details</p></div>' +
        '<div class="pub-stat-item pub-stat-mid"><p class="pub-stat-val">' + esc(rating) + ' &#11088;</p><p class="pub-stat-lbl">Rating</p></div>' +
        '<div class="pub-stat-item"><p class="pub-stat-val">' + esc(experience) + ' yrs</p><p class="pub-stat-lbl">Experience</p></div>' +
      '</div>' +

      '<button class="pub-book-btn" onclick="openServicesSheet()">' +
        '&#128736; See Services &amp; Book an Appointment' +
      '</button>' +
      '<p class="pub-book-sub">Browse services · Pick a time · Get confirmed</p>' +

      '<div class="pub-scroll-hint">' +
        '<p>Scroll to see our work</p>' +
        '<span>&#8595;</span>' +
      '</div>' +
    '</section>' +

    /* ── OUR WORK ── */
    '<div class="pub-work-section">' +
      '<div class="pub-divider">' +
        '<div class="pub-divider-line"></div>' +
        '<span class="pub-divider-text">Our Work</span>' +
        '<div class="pub-divider-line"></div>' +
      '</div>' +

      renderPhotoGrid(photos) +

      '<p style="text-align:center;margin:0 0 40px;font-size:11px;color:#444">Tap any photo to view</p>' +

      /* About */
      '<div class="pub-about-card">' +
        '<p class="pub-about-label">About</p>' +
        '<p class="pub-about-text">' + esc(bio) + '</p>' +
      '</div>' +

      /* Bottom CTA */
      '<button class="pub-book-btn pub-book-btn-bottom" onclick="openServicesSheet()">' +
        '&#128197; Ready to Book? Let\'s Go &#8594;' +
      '</button>' +
      '<p style="text-align:center;margin:0;font-size:11px;color:#444">' +
        'Powered by <span style="color:var(--primary)">GlossIO</span>' +
      '</p>' +
    '</div>' +

    /* ── PHOTO MODAL ── */
    '<div id="photo-modal" class="pub-modal" style="display:none"></div>' +

    /* ── SERVICES BOTTOM SHEET ── */
    '<div id="services-sheet" class="pub-sheet-overlay" style="display:none"></div>';
}

function renderPhotoGrid(photos) {
  if (photos.length === 0) {
    return '<div class="pub-photo-grid">' +
      '<div class="pub-photo-cell"><span style="font-size:30px">&#128247;</span><span style="font-size:9px;color:#555">No photos yet</span></div>'.repeat(3) +
    '</div>';
  }
  var html = '<div class="pub-photo-grid">';
  photos.forEach(function(ph) {
    html += '<div class="pub-photo-cell" onclick="expandPhoto(\'' + ph.id + '\')" style="background:' + (ph.color || '#111118') + ';cursor:pointer">' +
      '<div class="pub-photo-shine"></div>' +
      '<span style="font-size:30px">' + (ph.emoji || '&#128247;') + '</span>' +
      '<span style="font-size:9px;color:#555;text-align:center;padding:0 6px">' + esc(ph.label || '') + '</span>' +
    '</div>';
  });
  html += '</div>';
  return html;
}

/* ── Photo Expand Modal ─────────────────────────────────────────────────── */

function expandPhoto(id) {
  var photos = loadPhotos();
  var photo = photos.find(function(p) { return p.id === id; });
  if (!photo) return;

  var modal = document.getElementById("photo-modal");
  if (!modal) return;
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="pub-photo-expanded" style="background:' + (photo.color || '#111118') + '">' +
      '<span style="font-size:72px">' + (photo.emoji || '&#128247;') + '</span>' +
      '<p style="margin:0;font-size:14px;color:#888">' + esc(photo.label || '') + '</p>' +
      '<p style="margin:0;font-size:11px;color:#444">Tap anywhere to close</p>' +
    '</div>';
  modal.onclick = function() { modal.style.display = "none"; };
}

/* ── Services Bottom Sheet ──────────────────────────────────────────────── */

function openServicesSheet() {
  var services = loadServices();
  var sheet = document.getElementById("services-sheet");
  if (!sheet) return;

  var html =
    '<div class="pub-sheet">' +
      '<div class="pub-sheet-handle"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Services &amp; Booking</h2>' +
        '<button class="pub-sheet-close" onclick="closeServicesSheet()">&#10005;</button>' +
      '</div>' +
      '<p style="margin:0 0 24px;font-size:13px;color:#666">Select a service below to start your booking.</p>';

  if (services.length === 0) {
    html += '<div style="text-align:center;padding:40px 0">' +
      '<p style="font-size:32px;margin-bottom:12px">&#128736;</p>' +
      '<p style="font-size:14px;color:#888">No services listed yet.</p>' +
      '<p style="font-size:12px;color:#555">Check back soon!</p>' +
    '</div>';
  } else {
    html += '<div class="pub-service-list">';
    services.forEach(function(svc) {
      var color = svc.color || '#00C2FF';
      var icon = svc.icon || '&#128736;';
      html +=
        '<div class="pub-svc-card" data-svc-id="' + svc.id + '" style="border-left:3px solid ' + color + '">' +
          '<div class="pub-svc-row" onclick="toggleService(\'' + svc.id + '\')">' +
            '<div class="pub-svc-icon" style="background:' + color + '15;border-color:' + color + '33">' + icon + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<p class="pub-svc-name">' + esc(svc.name) + '</p>' +
              '<p class="pub-svc-desc-short">' + esc(svc.description || '') + '</p>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">' +
              '<p class="pub-svc-price" style="color:' + color + '">$' + esc(svc.price) + '</p>' +
              '<span class="pub-svc-toggle">&#9660; More</span>' +
            '</div>' +
          '</div>' +
          '<div class="pub-svc-expanded" style="display:none;border-top:1px solid ' + color + '22">' +
            '<p class="pub-svc-inc-label">What\'s Included</p>' +
            '<p class="pub-svc-inc-text">' + esc(svc.description || '') + '</p>' +
            '<div class="pub-svc-price-box" style="background:' + color + '10;border-color:' + color + '22">' +
              '<span style="font-size:12px;color:#888">Starting at</span>' +
              '<span style="font-size:20px;font-weight:700;color:' + color + '">$' + esc(svc.price) + '</span>' +
            '</div>' +
            '<button class="pub-svc-book-btn" onclick="handleBooking(\'' + svc.id + '\', this)" style="background:linear-gradient(135deg,' + color + ',' + color + '99)">' +
              'Book ' + esc(svc.name) + ' &#8594;' +
            '</button>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  html += '<div class="pub-sheet-info">' +
    '<p>&#128203; After selecting your service, you\'ll share your info and preferred time. We\'ll confirm your appointment within 24 hours.</p>' +
  '</div>';

  html += '</div>';

  sheet.style.display = "flex";
  sheet.innerHTML = html;
  sheet.onclick = function(e) {
    if (e.target === sheet) closeServicesSheet();
  };
}

function closeServicesSheet() {
  var sheet = document.getElementById("services-sheet");
  if (sheet) sheet.style.display = "none";
}

function toggleService(id) {
  var card = document.querySelector('.pub-svc-card[data-svc-id="' + id + '"]');
  if (!card) return;
  var expanded = card.querySelector('.pub-svc-expanded');
  var toggle = card.querySelector('.pub-svc-toggle');
  if (!expanded) return;

  var isOpen = expanded.style.display !== "none";
  expanded.style.display = isOpen ? "none" : "";
  if (toggle) toggle.innerHTML = isOpen ? "&#9660; More" : "&#9650; Less";

  /* Collapse others */
  document.querySelectorAll('.pub-svc-card').forEach(function(c) {
    if (c !== card) {
      var ex = c.querySelector('.pub-svc-expanded');
      var tg = c.querySelector('.pub-svc-toggle');
      if (ex) ex.style.display = "none";
      if (tg) tg.innerHTML = "&#9660; More";
    }
  });
}

/* ── Booking with double-submit prevention ────────────────────────────── */

var _bookingInProgress = false;

function handleBooking(serviceId, btn) {
  if (_bookingInProgress) return;
  _bookingInProgress = true;

  var origText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Booking\u2026";
  btn.style.opacity = "0.6";

  /* TODO: Replace with actual booking flow (collect client info, pick time, etc.) */
  /* For now this triggers the notification endpoint */
  var slug = getSlugFromUrl();
  if (!slug) {
    _bookingInProgress = false;
    btn.disabled = false;
    btn.innerHTML = origText;
    btn.style.opacity = "";
    return;
  }

  /* Simulated booking — in production this would collect client info first */
  /* Re-enable after 3 seconds to prevent accidental double-tap */
  setTimeout(function() {
    _bookingInProgress = false;
    btn.disabled = false;
    btn.innerHTML = origText;
    btn.style.opacity = "";
  }, 3000);
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function esc(str) {
  var d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", renderPublicProfile);
