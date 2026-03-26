/* ─── Public Profile Page ─────────────────────────────────────────────────── */

var PROFILE_KEY = "glossio_profile";
var PHOTOS_KEY = "glossio_work_photos";
var SERVICES_KEY = "glossio_services";

/* In-memory cache for API-fetched data (used by the booking flow) */
var _apiServices = null;
var _apiPhotos = null;
var _apiHours = null; /* business hours from API */
var _apiBlocks = null; /* vacation / date blocks from API */
var _apiAvailability = null; /* advance booking / min notice settings */

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch(e) { return {}; }
}
function loadPhotos() {
  if (_apiPhotos && _apiPhotos.length > 0) return _apiPhotos;
  try { return JSON.parse(localStorage.getItem(PHOTOS_KEY) || "[]"); } catch(e) { return []; }
}
function loadServices() {
  if (_apiServices && _apiServices.length > 0) return _apiServices;
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
        /* Cache API data so openServicesSheet() and booking flow use real IDs */
        _apiServices = data.services || [];
        _apiPhotos = data.photos || [];
        _apiHours = data.hours || [];
        _apiBlocks = data.blocks || [];
        _apiAvailability = data.availability || { advance_booking_days: 30, minimum_notice_hours: 24 };
        return {
          profile: data.profile || {},
          photos: _apiPhotos,
          services: _apiServices
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
      '<div class="pub-photo-cell"><span style="font-size:30px;color:var(--text-faint)">&#128247;</span><span style="font-size:9px;color:#555">No photos yet</span></div>'.repeat(3) +
    '</div>';
  }
  var html = '<div class="pub-photo-grid">';
  photos.forEach(function(ph) {
    var imgSrc = ph.url || ph.image;
    html += '<div class="pub-photo-cell pub-photo-cell-img" onclick="expandPhoto(\'' + ph.id + '\')" style="cursor:pointer">' +
      '<div class="pub-photo-shine"></div>' +
      (imgSrc ? '<img src="' + imgSrc + '" alt="' + esc(ph.label || '') + '" class="pub-photo-image" />' : '<span style="font-size:30px;color:var(--text-faint)">&#128247;</span>') +
      (ph.label ? '<span class="pub-photo-label">' + esc(ph.label) + '</span>' : '') +
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
    '<div class="pub-photo-expanded">' +
      ((photo.url || photo.image) ? '<img src="' + (photo.url || photo.image) + '" alt="' + esc(photo.label || '') + '" style="max-width:100%;max-height:70vh;border-radius:12px;object-fit:contain" />' : '') +
      (photo.label ? '<p style="margin:10px 0 0;font-size:14px;color:#888">' + esc(photo.label) + '</p>' : '') +
      '<p style="margin:6px 0 0;font-size:11px;color:#444">Tap anywhere to close</p>' +
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
    _selectedServices = [];
    html += '<div class="pub-service-list">';
    services.forEach(function(svc) {
      var color = svc.color || '#00C2FF';
      var icon = svc.icon || '&#128736;';
      html +=
        '<div class="pub-svc-card" data-svc-id="' + svc.id + '" data-svc-name="' + esc(svc.name) + '" data-svc-price="' + esc(svc.price) + '" data-svc-color="' + color + '" data-svc-pricing-type="' + (svc.pricing_type || 'fixed') + '" style="border-left:3px solid ' + color + ';cursor:pointer" onclick="toggleServiceSelect(\'' + svc.id + '\')">' +
          '<div class="pub-svc-row">' +
            '<div class="pub-svc-check" id="svc-check-' + svc.id + '" style="width:22px;height:22px;border-radius:6px;border:2px solid #555;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-right:10px;transition:all .2s"></div>' +
            '<div class="pub-svc-icon" style="background:' + color + '15;border-color:' + color + '33">' + icon + '</div>' +
            '<div style="flex:1;min-width:0">' +
              '<p class="pub-svc-name">' + esc(svc.name) + '</p>' +
              '<p class="pub-svc-desc-short">' + esc(svc.description || '') + '</p>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0">' +
              '<p class="pub-svc-price" style="color:' + color + '">' + (svc.pricing_type === 'quote' ? 'Get Quote' : '$' + esc(svc.price)) + '</p>' +
              '<span class="pub-svc-toggle" onclick="event.stopPropagation();toggleService(\'' + svc.id + '\')">&#9660; More</span>' +
            '</div>' +
          '</div>' +
          '<div class="pub-svc-expanded" style="display:none;border-top:1px solid ' + color + '22">' +
            '<p class="pub-svc-inc-label">What\'s Included</p>' +
            '<p class="pub-svc-inc-text">' + esc(svc.description || '') + '</p>' +
            '<div class="pub-svc-price-box" style="background:' + color + '10;border-color:' + color + '22">' +
              '<span style="font-size:12px;color:#888">' + (svc.pricing_type === 'quote' ? 'Pricing' : 'Starting at') + '</span>' +
              '<span style="font-size:20px;font-weight:700;color:' + color + '">' + (svc.pricing_type === 'quote' ? 'Request a Quote' : '$' + esc(svc.price)) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>';
    });
    html += '</div>';

    /* Continue button + total */
    html += '<div id="svc-selection-summary" style="display:none;margin-top:16px;padding:16px;background:var(--bg-card);border:1px solid var(--border);border-radius:12px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
        '<span style="font-size:14px;color:#aaa" id="svc-sel-count">0 services selected</span>' +
        '<span style="font-size:18px;font-weight:700;color:var(--success)" id="svc-sel-total">$0</span>' +
      '</div>' +
      '<button id="svc-continue-btn" onclick="handleMultiBooking()" style="width:100%;padding:14px;border:none;border-radius:10px;font-size:15px;font-weight:700;color:#fff;cursor:pointer;background:linear-gradient(135deg,#7C5CFC,#00C2FF)">Continue to Booking &#8594;</button>' +
    '</div>';
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

/* ── Booking Flow — Multi-step form ──────────────────────────────────── */

var _selectedServices = [];  /* Array of { id, name, price, color } */
var _selectedServiceId = null;
var _selectedServiceName = "";
var _selectedServiceColor = "";
var _selectedServicePrice = "";

function toggleServiceSelect(serviceId) {
  var card = document.querySelector('.pub-svc-card[data-svc-id="' + serviceId + '"]');
  if (!card) return;
  var check = document.getElementById("svc-check-" + serviceId);
  var idx = -1;
  for (var i = 0; i < _selectedServices.length; i++) {
    if (_selectedServices[i].id === serviceId) { idx = i; break; }
  }

  if (idx >= 0) {
    /* Deselect */
    _selectedServices.splice(idx, 1);
    if (check) { check.style.background = ""; check.style.borderColor = "#555"; check.innerHTML = ""; }
    card.style.boxShadow = "";
  } else {
    /* Select */
    var color = card.getAttribute("data-svc-color") || "#00C2FF";
    _selectedServices.push({
      id: serviceId,
      name: card.getAttribute("data-svc-name") || "Service",
      price: card.getAttribute("data-svc-price") || "0",
      color: color,
      pricing_type: card.getAttribute("data-svc-pricing-type") || "fixed"
    });
    if (check) {
      check.style.background = color;
      check.style.borderColor = color;
      check.innerHTML = '<span style="color:#fff;font-size:14px;font-weight:700">&#10003;</span>';
    }
    card.style.boxShadow = "0 0 0 2px " + color + "44";
  }

  /* Update summary */
  var summary = document.getElementById("svc-selection-summary");
  var countEl = document.getElementById("svc-sel-count");
  var totalEl = document.getElementById("svc-sel-total");
  if (summary) {
    if (_selectedServices.length > 0) {
      summary.style.display = "";
      var hasQuote = _selectedServices.some(function(svc) { return svc.pricing_type === 'quote'; });
      var total = _selectedServices.reduce(function(s, svc) { return s + (svc.pricing_type === 'quote' ? 0 : (parseFloat(svc.price) || 0)); }, 0);
      if (countEl) countEl.textContent = _selectedServices.length + " service" + (_selectedServices.length > 1 ? "s" : "") + " selected";
      if (totalEl) totalEl.textContent = hasQuote ? (total > 0 ? "$" + total.toFixed(2) + " + Quote" : "Quote") : "$" + total.toFixed(2);
    } else {
      summary.style.display = "none";
    }
  }
}

function handleMultiBooking() {
  if (_selectedServices.length === 0) return;

  /* Combine selected services into the booking variables */
  _selectedServiceId = _selectedServices[0].id;
  _selectedServiceName = _selectedServices.map(function(s) { return s.name; }).join(" + ");
  _selectedServiceColor = _selectedServices[0].color;
  var totalPrice = _selectedServices.reduce(function(s, svc) { return s + (parseFloat(svc.price) || 0); }, 0);
  _selectedServicePrice = totalPrice.toFixed(2);

  /* Close services sheet and open booking form */
  closeServicesSheet();
  openBookingForm();
}

function handleBooking(serviceId, btn) {
  /* Legacy single-service booking (kept for compatibility) */
  var card = document.querySelector('.pub-svc-card[data-svc-id="' + serviceId + '"]');
  _selectedServiceId = serviceId;
  _selectedServiceName = card ? card.querySelector('.pub-svc-name').textContent : "Service";
  _selectedServiceColor = card ? card.style.borderLeftColor || "#00C2FF" : "#00C2FF";
  var priceEl = card ? card.querySelector('.pub-svc-price') : null;
  _selectedServicePrice = priceEl ? priceEl.textContent.replace(/[^0-9.]/g, '') : "";

  /* Close services sheet and open booking form */
  closeServicesSheet();
  openBookingForm();
}

function openBookingForm() {
  var sheet = document.getElementById("services-sheet");
  if (!sheet) return;

  var today = new Date();
  var minDate = today.toISOString().split("T")[0];
  /* Allow booking up to 60 days out */
  var maxDate = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  var html =
    '<div class="pub-sheet">' +
      '<div class="pub-sheet-handle"></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Book ' + esc(_selectedServiceName) + '</h2>' +
        '<button class="pub-sheet-close" onclick="closeServicesSheet()">&#10005;</button>' +
      '</div>' +
      '<p style="margin:0 0 20px;font-size:13px;color:#666">Fill in your details to request this appointment.</p>' +

      '<form id="booking-form" onsubmit="submitBooking(event)">' +

        /* ── Contact Info Section ── */
        '<div class="booking-section-label">Contact Information</div>' +

        '<div class="booking-row">' +
          '<div class="booking-field">' +
            '<label class="booking-label" for="bf-first">First Name *</label>' +
            '<input class="booking-input" type="text" id="bf-first" name="firstName" required placeholder="John" autocomplete="given-name" />' +
          '</div>' +
          '<div class="booking-field">' +
            '<label class="booking-label" for="bf-last">Last Name *</label>' +
            '<input class="booking-input" type="text" id="bf-last" name="lastName" required placeholder="Doe" autocomplete="family-name" />' +
          '</div>' +
        '</div>' +

        '<div class="booking-field">' +
          '<label class="booking-label" for="bf-email">Email</label>' +
          '<input class="booking-input" type="email" id="bf-email" name="email" placeholder="john@example.com" autocomplete="email" />' +
        '</div>' +

        '<div class="booking-field">' +
          '<label class="booking-label" for="bf-phone">Phone Number *</label>' +
          '<input class="booking-input" type="tel" id="bf-phone" name="phone" required placeholder="(555) 123-4567" autocomplete="tel" />' +
        '</div>' +

        /* ── Vehicle Info Section ── */
        '<div class="booking-section-label" style="margin-top:24px">Vehicle Information</div>' +

        '<div class="booking-row booking-row-3">' +
          '<div class="booking-field">' +
            '<label class="booking-label" for="bf-year">Year</label>' +
            '<input class="booking-input" type="text" id="bf-year" name="vehicleYear" placeholder="2024" maxlength="4" />' +
          '</div>' +
          '<div class="booking-field">' +
            '<label class="booking-label" for="bf-make">Make</label>' +
            '<input class="booking-input" type="text" id="bf-make" name="vehicleMake" placeholder="Toyota" />' +
          '</div>' +
          '<div class="booking-field">' +
            '<label class="booking-label" for="bf-model">Model</label>' +
            '<input class="booking-input" type="text" id="bf-model" name="vehicleModel" placeholder="Camry" />' +
          '</div>' +
        '</div>' +

        /* ── Notes Section ── */
        '<div class="booking-field" style="margin-top:24px">' +
          '<label class="booking-label" for="bf-notes">Additional Notes</label>' +
          '<textarea class="booking-input booking-textarea" id="bf-notes" name="notes" placeholder="Any special requests or details the detailer should know..." rows="3"></textarea>' +
        '</div>' +

        /* ── Date & Time Section ── */
        '<div class="booking-section-label" style="margin-top:24px">Preferred Date &amp; Time</div>' +

        '<div class="booking-field">' +
          '<label class="booking-label">Date *</label>' +
          '<div id="bf-date-grid" class="bf-date-grid"></div>' +
          '<input type="hidden" id="bf-date" name="scheduledDate" />' +
        '</div>' +

        '<div class="booking-field">' +
          '<label class="booking-label">Time *</label>' +
          '<div id="bf-time-grid" class="bf-time-grid"><p style="color:#555;font-size:12px;margin:0">Select a date first</p></div>' +
          '<input type="hidden" id="bf-time" name="scheduledTime" />' +
        '</div>' +

        /* ── Error message ── */
        '<div id="booking-error" class="booking-error" style="display:none"></div>' +

        /* ── Submit ── */
        '<button type="submit" class="booking-submit-btn" id="booking-submit-btn">' +
          'Book Appointment &#8594;' +
        '</button>' +

        '<div class="booking-disclaimer">' +
          '<p>By booking, you agree to be contacted by this detailer regarding your appointment. ' +
          'The detailer will get in contact with you to confirm the appointment.</p>' +
        '</div>' +

      '</form>' +
    '</div>';

  sheet.style.display = "flex";
  sheet.innerHTML = html;
  sheet.onclick = function(e) {
    if (e.target === sheet) closeServicesSheet();
  };

  /* Render custom date grid */
  renderBookingDateGrid();
}

/** Render the date card grid for the booking form */
function renderBookingDateGrid() {
  var container = document.getElementById("bf-date-grid");
  if (!container) return;

  var hours = _apiHours || [];
  var blocks = _apiBlocks || [];
  var avail = _apiAvailability || { advance_booking_days: 30 };
  var maxDays = avail.advance_booking_days || 30;
  var html = "";

  for (var i = 0; i <= maxDays; i++) {
    var d = new Date();
    d.setDate(d.getDate() + i);
    var dayOfWeek = d.getDay(); // 0=Sun, 6=Sat
    var dayHours = null;
    for (var h = 0; h < hours.length; h++) {
      if (hours[h].day_of_week === dayOfWeek) { dayHours = hours[h]; break; }
    }
    var isClosed = dayHours ? !dayHours.is_open : false;
    var dateStr = d.toISOString().split("T")[0];

    /* Check if date falls within any vacation / date block */
    if (!isClosed) {
      for (var b = 0; b < blocks.length; b++) {
        if (dateStr >= blocks[b].start_date && dateStr <= blocks[b].end_date) {
          isClosed = true;
          break;
        }
      }
    }

    var weekday = d.toLocaleDateString("en-US", { weekday: "short" });
    var dayNum = d.getDate();
    var month = d.toLocaleDateString("en-US", { month: "short" });

    html += '<div class="bf-date-card' + (isClosed ? ' bf-date-closed' : '') + '" data-date="' + dateStr + '" data-closed="' + (isClosed ? '1' : '0') + '">' +
      '<span class="bf-date-weekday">' + weekday + '</span>' +
      '<span class="bf-date-num">' + dayNum + '</span>' +
      '<span class="bf-date-month">' + month + '</span>' +
      (isClosed ? '<span class="bf-date-closed-label">Closed</span>' : '') +
    '</div>';
  }

  container.innerHTML = html;

  /* Add click handlers */
  var cards = container.querySelectorAll(".bf-date-card");
  cards.forEach(function(card) {
    card.addEventListener("click", function() {
      if (card.getAttribute("data-closed") === "1") return;
      /* Deselect all */
      cards.forEach(function(c) { c.classList.remove("bf-date-selected"); });
      card.classList.add("bf-date-selected");
      /* Set hidden input */
      document.getElementById("bf-date").value = card.getAttribute("data-date");
      /* Render time slots for this date */
      renderBookingTimeGrid(card.getAttribute("data-date"));
    });
  });
}

/** Render time slots based on business hours for the selected date */
function renderBookingTimeGrid(dateStr) {
  var container = document.getElementById("bf-time-grid");
  if (!container) return;

  var d = new Date(dateStr + "T12:00:00");
  var dayOfWeek = d.getDay();
  var hours = _apiHours || [];
  var dayHours = null;
  for (var h = 0; h < hours.length; h++) {
    if (hours[h].day_of_week === dayOfWeek) { dayHours = hours[h]; break; }
  }

  if (!dayHours || !dayHours.is_open) {
    container.innerHTML = '<p style="color:#555;font-size:12px;margin:0">Not available on this day</p>';
    document.getElementById("bf-time").value = "";
    return;
  }

  var openH = parseInt(dayHours.open_time.split(":")[0], 10);
  var closeH = parseInt(dayHours.close_time.split(":")[0], 10);
  var html = "";

  /* If today, only show times after the current hour */
  var todayStr = new Date().toISOString().split("T")[0];
  var isToday = dateStr === todayStr;
  var currentHour = isToday ? new Date().getHours() : -1;

  for (var hr = openH; hr < closeH; hr++) {
    /* Skip past times if booking for today */
    if (isToday && hr <= currentHour) continue;

    var ampm = hr < 12 ? "AM" : "PM";
    var display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    var label = display + ":00 " + ampm;
    var val24 = (hr < 10 ? "0" : "") + hr + ":00";
    html += '<div class="bf-time-slot" data-time="' + val24 + '" data-label="' + label + '">' + label + '</div>';
  }

  if (!html) {
    container.innerHTML = '<p style="color:#555;font-size:12px;margin:0">No available times</p>';
    document.getElementById("bf-time").value = "";
    return;
  }

  container.innerHTML = html;
  document.getElementById("bf-time").value = "";

  /* Add click handlers */
  var slots = container.querySelectorAll(".bf-time-slot");
  slots.forEach(function(slot) {
    slot.addEventListener("click", function() {
      slots.forEach(function(s) { s.classList.remove("bf-time-selected"); });
      slot.classList.add("bf-time-selected");
      document.getElementById("bf-time").value = slot.getAttribute("data-label");
    });
  });
}

function submitBooking(e) {
  e.preventDefault();

  var btn = document.getElementById("booking-submit-btn");
  var errDiv = document.getElementById("booking-error");
  if (!btn) return;

  /* Gather form data */
  var firstName = document.getElementById("bf-first").value.trim();
  var lastName = document.getElementById("bf-last").value.trim();
  var email = document.getElementById("bf-email").value.trim();
  var phone = document.getElementById("bf-phone").value.trim();
  var vehicleYear = document.getElementById("bf-year").value.trim();
  var vehicleMake = document.getElementById("bf-make").value.trim();
  var vehicleModel = document.getElementById("bf-model").value.trim();
  var notes = document.getElementById("bf-notes").value.trim();
  var scheduledDate = document.getElementById("bf-date").value;
  var scheduledTime = document.getElementById("bf-time").value;

  /* Basic validation */
  if (!firstName || !lastName || !phone || !scheduledDate || !scheduledTime) {
    errDiv.textContent = "Please fill in all required fields (name, phone, date, and time).";
    errDiv.style.display = "block";
    return;
  }

  var slug = getSlugFromUrl();
  if (!slug) {
    errDiv.textContent = "Unable to identify the detailer. Please try again.";
    errDiv.style.display = "block";
    return;
  }

  /* Disable button */
  btn.disabled = true;
  btn.innerHTML = "Submitting\u2026";
  btn.style.opacity = "0.6";
  errDiv.style.display = "none";

  var payload = {
    slug: slug,
    serviceId: _selectedServiceId,
    serviceName: _selectedServiceName,
    servicePrice: _selectedServicePrice,
    firstName: firstName,
    lastName: lastName,
    email: email,
    phone: phone,
    vehicleYear: vehicleYear,
    vehicleMake: vehicleMake,
    vehicleModel: vehicleModel,
    notes: notes,
    scheduledDate: scheduledDate,
    scheduledTime: scheduledTime
  };

  window.api.call("create-booking", payload)
    .then(function(data) {
      if (data.error) {
        var msg = data.error;
        if (data.debug_slug) msg += " (slug: " + data.debug_slug + ")";
        throw new Error(msg);
      }
      showBookingConfirmation();
    })
    .catch(function(err) {
      btn.disabled = false;
      btn.innerHTML = "Book Appointment &#8594;";
      btn.style.opacity = "";
      errDiv.textContent = err.message || "Something went wrong. Please try again.";
      errDiv.style.display = "block";
    });
}

function showBookingConfirmation() {
  var sheet = document.getElementById("services-sheet");
  if (!sheet) return;

  sheet.innerHTML =
    '<div class="pub-sheet" style="text-align:center">' +
      '<div class="pub-sheet-handle"></div>' +
      '<div style="font-size:56px;margin:20px 0 16px">&#10003;</div>' +
      '<h2 style="margin:0 0 12px;font-size:22px;font-weight:700;color:var(--success)">Booking Requested!</h2>' +
      '<p style="margin:0 0 8px;font-size:15px;color:#C8C4BC">Your appointment request for <strong>' + esc(_selectedServiceName) + '</strong> has been submitted.</p>' +
      '<p style="margin:0 0 28px;font-size:13px;color:#888">The detailer will get in contact with you to confirm the appointment.</p>' +
      '<button class="booking-submit-btn" onclick="closeServicesSheet()" style="background:var(--bg-card);border:1px solid var(--border);color:var(--text)">' +
        'Done' +
      '</button>' +
    '</div>';
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function esc(str) {
  var d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", renderPublicProfile);
