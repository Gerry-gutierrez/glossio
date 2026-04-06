/* ─── Appointments Page ────────────────────────────────────────────────────── */

const APPTS_KEY = "glossio_appointments";
const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const APPT_STATUS = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Complete" },
  cancelled: { color: "#FF3366", bg: "#FF336615", border: "#FF336633", label: "Cancelled" },
  missed:    { color: "#FF8C42", bg: "#FF8C4215", border: "#FF8C4233", label: "Missed" },
};

let appointments = [];
let apptFilter = "pending";
let apptView = "list";
let nextApptId = 1;
let expandedApptId = null;

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* Format date as "Apr 2, 2026" */
function fmtDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  return months[m] + " " + d + ", " + parts[0];
}

/* Format time as "3:00 PM" */
function fmtTime(timeStr) {
  if (!timeStr) return "";
  var upper = String(timeStr).toUpperCase();
  if (/\b(AM|PM)\b/.test(upper)) {
    var cleaned = upper.replace(/\s*(AM|PM)\s*/g, "").trim();
    var suffix = upper.indexOf("PM") !== -1 ? "PM" : "AM";
    return cleaned + " " + suffix;
  }
  var parts = timeStr.split(":");
  var h = parseInt(parts[0], 10);
  var min = (parts[1] || "00").replace(/\D/g, "").padStart(2, "0").slice(0, 2);
  var ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return h + ":" + min + " " + ampm;
}

/* ── Persistence ─────────────────────────────────────────────────────────── */

/* Normalize a Supabase row to the shape the UI expects */
function normalizeAppt(a) {
  return {
    id: a.id,
    client: a.client || ((a.client_first_name || "") + " " + (a.client_last_name || "")).trim(),
    service: a.service_name || a.service || "",
    date: a.appt_date || a.scheduled_date || a.date || "",
    time: a.appt_time || a.scheduled_time || a.time || "",
    price: parseFloat(a.price) || parseFloat(a.service_price) || 0,
    status: a.status || "pending",
    phone: a.client_phone || a.phone || "",
    email: a.client_email || a.email || "",
    vehicle: a.vehicle || [a.vehicle_year, a.vehicle_make, a.vehicle_model].filter(Boolean).join(" ") || "",
    notes: a.notes || a.detailer_notes || ""
  };
}

function loadAppts() {
  if (window.db && window.db.appointments) {
    return window.db.appointments.list().then(function(rows) {
      appointments = (rows || []).map(normalizeAppt);
      renderAppts();
    }).catch(function() { appointments = []; renderAppts(); });
  }
  /* Fallback to localStorage */
  try {
    const data = localStorage.getItem(APPTS_KEY);
    if (data) {
      appointments = JSON.parse(data);
    }
  } catch (e) { appointments = []; }
  return Promise.resolve();
}

function saveAppts() {
  localStorage.setItem(APPTS_KEY, JSON.stringify(appointments));
}

/* ── Stats ───────────────────────────────────────────────────────────────── */

function updateApptStats() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();
  const nextMonth = thisMonth === 12 ? 1 : thisMonth + 1;
  const nextYear = thisMonth === 12 ? thisYear + 1 : thisYear;

  const getMonth = (a) => parseInt(a.date.split("-")[1]);
  const getYear = (a) => parseInt(a.date.split("-")[0]);

  const completedThisMonth = appointments.filter(a => a.status === "complete" && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const projThisMonth = appointments.filter(a => ["confirmed","pending"].includes(a.status) && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const projNextMonth = appointments.filter(a => getMonth(a) === nextMonth && getYear(a) === nextYear);

  const revMtd = completedThisMonth.reduce((s, a) => s + a.price, 0);
  const revProj = projThisMonth.reduce((s, a) => s + a.price, 0);
  const revNext = projNextMonth.reduce((s, a) => s + a.price, 0);

  document.getElementById("rev-mtd").textContent = fmt(revMtd);
  document.getElementById("rev-projected").textContent = fmt(revProj);
  document.getElementById("rev-next").textContent = fmt(revNext);
  document.getElementById("rev-mtd-detail").textContent = completedThisMonth.length + (completedThisMonth.length === 1 ? " job" : " jobs") + " completed";
  document.getElementById("rev-proj-detail").textContent = projThisMonth.length + (projThisMonth.length === 1 ? " job" : " jobs") + " remaining";
  document.getElementById("rev-next-detail").textContent = projNextMonth.length + (projNextMonth.length === 1 ? " job" : " jobs") + " booked ahead";

  const pending = appointments.filter(a => a.status === "pending").length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const complete = appointments.filter(a => a.status === "complete").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;
  const missed = appointments.filter(a => a.status === "missed").length;

  document.getElementById("count-pending").textContent = pending;
  document.getElementById("count-confirmed").textContent = confirmed;
  document.getElementById("count-complete").textContent = complete;
  document.getElementById("count-cancelled").textContent = cancelled;
  var missedEl = document.getElementById("count-missed");
  if (missedEl) missedEl.textContent = missed;

  document.getElementById("appt-summary").textContent = appointments.length + " total appointments";

  // Update filter tab counts
  document.querySelectorAll("#filter-tabs .filter-tab").forEach(btn => {
    const f = btn.dataset.filter;
    let count = appointments.length;
    if (f !== "all") count = appointments.filter(a => a.status === f).length;
    const label = f === "all" ? "All" : (APPT_STATUS[f]?.label || f);
    btn.textContent = label + " (" + count + ")";
    btn.classList.toggle("filter-tab-active", f === apptFilter);
  });
}

/* ── View Toggle ─────────────────────────────────────────────────────────── */

function setApptView(v) {
  apptView = v;
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.classList.toggle("view-btn-active", btn.dataset.view === v);
  });
  document.getElementById("appt-list-view").style.display = v === "list" ? "block" : "none";
  document.getElementById("appt-calendar-view").style.display = v === "calendar" ? "block" : "none";
  if (v === "calendar") renderCalendar();
}

/* ── Filter ──────────────────────────────────────────────────────────────── */

function setApptFilter(f) {
  apptFilter = f;
  renderAppts();
}

/* ── Render List ─────────────────────────────────────────────────────────── */

function renderAppts() {
  updateApptStats();

  const listEl = document.getElementById("appt-list-view");
  const emptyEl = document.getElementById("appt-empty");

  if (appointments.length === 0) {
    listEl.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  }

  emptyEl.style.display = "none";

  const searchVal = (document.getElementById("appt-search")?.value || "").toLowerCase();
  const filtered = appointments.filter(a => {
    const matchFilter = apptFilter === "all" || a.status === apptFilter;
    const matchSearch = !searchVal || (a.client + " " + a.vehicle + " " + a.service + " " + a.phone + " " + a.email).toLowerCase().includes(searchVal);
    return matchFilter && matchSearch;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-faint)"><p style="font-size:16px">No ' + apptFilter + ' appointments.</p></div>';
    return;
  }

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  listEl.innerHTML = sorted.map(a => {
    const cfg = APPT_STATUS[a.status] || APPT_STATUS.pending;
    const isExpanded = expandedApptId === a.id;
    const isPending = a.status === "pending";

    return `
      <div class="appt-item" style="border-left-color:${cfg.color}" onclick="toggleAppt('${a.id}')">
        <div class="appt-row">
          <div class="appt-row-main">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <p style="margin:0;font-size:15px;font-weight:700">${a.client}</p>
              ${isPending ? '<span class="new-badge">NEW</span>' : ''}
            </div>
            <p style="margin:0;font-size:12px;color:var(--text-dim)">${a.vehicle || ''}</p>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:var(--success)">${fmt(a.price)}</p>
            <span class="appt-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border}">${cfg.label}</span>
          </div>
          <div style="flex-shrink:0;margin-left:8px;text-align:right">
            <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#C8C4BC">${fmtDate(a.date)}</p>
            <p style="margin:0;font-size:13px;color:var(--text-dim)">${fmtTime(a.time)}</p>
          </div>
          <span style="color:var(--text-faint);font-size:14px;flex-shrink:0;margin-left:8px">${isExpanded ? '▲' : '▼'}</span>
        </div>
        ${isExpanded ? `
          <div class="appt-expanded" onclick="event.stopPropagation()">
            <div class="appt-detail-grid">
              <div><span class="appt-detail-label">Phone</span><span class="appt-detail-value">${a.phone || '—'}</span></div>
              <div><span class="appt-detail-label">Email</span><span class="appt-detail-value">${a.email || '—'}</span></div>
              <div><span class="appt-detail-label">Vehicle</span><span class="appt-detail-value">${a.vehicle || '—'}</span></div>
              <div><span class="appt-detail-label">Services</span><span class="appt-detail-value">${a.service ? a.service.replace(/\s*\+\s*/g, ', ') : '—'}</span></div>
              <div><span class="appt-detail-label">Notes</span><span class="appt-detail-value">${a.notes || 'None'}</span></div>
            </div>
            <div class="appt-actions">
              ${a.status === "pending" ? `
                <button class="action-btn" style="background:#00C2FF15;border-color:#00C2FF33;color:#00C2FF" onclick="confirmAppt('${a.id}')">✓ Confirm</button>
                <button class="action-btn" style="background:#A78BFA15;border-color:#A78BFA33;color:#A78BFA" onclick="openAdjustModal('${a.id}')">✎ Adjust</button>
                <button class="action-btn" style="background:#00E5A015;border-color:#00E5A033;color:#00E5A0" onclick="completeAppt('${a.id}')">✅ Came Through</button>
                <button class="action-btn" style="background:#FF8C4215;border-color:#FF8C4233;color:#FF8C42" onclick="missAppt('${a.id}')">⚠ No-Show</button>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="cancelAppt('${a.id}')">✗ Cancel</button>
              ` : ''}
              ${a.status === "confirmed" ? `
                <button class="action-btn" style="background:#A78BFA15;border-color:#A78BFA33;color:#A78BFA" onclick="openAdjustModal('${a.id}')">✎ Adjust</button>
                <button class="action-btn" style="background:#00E5A015;border-color:#00E5A033;color:#00E5A0" onclick="completeAppt('${a.id}')">✅ Came Through</button>
                <button class="action-btn" style="background:#FF8C4215;border-color:#FF8C4233;color:#FF8C42" onclick="missAppt('${a.id}')">⚠ No-Show</button>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="cancelAppt('${a.id}')">✗ Cancel</button>
              ` : ''}
              ${a.status === "complete" ? `<span style="font-size:12px;color:var(--text-faint)">Done ✓</span>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="deleteAppt('${a.id}')">🗑 Delete</button>` : ''}
              ${a.status === "cancelled" ? `<span style="font-size:12px;color:var(--text-faint)">Cancelled</span>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="deleteAppt('${a.id}')">🗑 Delete</button>` : ''}
              ${a.status === "missed" ? `<span style="font-size:12px;color:var(--text-faint)">No-Show ⚠</span>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="deleteAppt('${a.id}')">🗑 Delete</button>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join("");

  if (apptView === "calendar") renderCalendar();
}

/* ── Expand/Collapse ─────────────────────────────────────────────────────── */

function toggleAppt(id) {
  expandedApptId = expandedApptId === id ? null : id;
  renderAppts();
}

/* ── Actions ─────────────────────────────────────────────────────────────── */

function updateApptStatus(id, newStatus) {
  const a = appointments.find(ap => ap.id === id);
  if (!a) return;
  a.status = newStatus;
  renderAppts();
  /* Persist to Supabase */
  if (window.db && window.db.appointments) {
    window.db.appointments.update(id, { status: newStatus });
  }
  saveAppts();
}

function confirmAppt(id) { updateApptStatus(id, "confirmed"); }
function cancelAppt(id) { updateApptStatus(id, "cancelled"); }
function missAppt(id) {
  updateApptStatus(id, "missed");

  /* Auto-create/update flaker client on no-show */
  const a = appointments.find(ap => ap.id === id);
  if (!a) return;

  const nameParts = (a.client || "").split(" ");
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "";
  const now = new Date();
  const dateStr = a.date || now.toISOString().split("T")[0];

  if (window.db && window.db.clients) {
    window.db.clients.list().then(function(allClients) {
      var match = allClients.find(function(c) {
        return (a.phone && c.phone === a.phone) || (a.email && c.email === a.email);
      });
      if (match) {
        var newCount = (parseInt(match.no_show_count) || 0) + 1;
        window.db.clients.update(match.id, {
          no_show_count: newCount,
          status: "flaker"
        }).then(function() {
          console.log("Flaker bumped: no_show_count=" + newCount);
        }).catch(function(err) {
          console.error("Flaker update failed:", err);
        });
      } else {
        window.db.clients.create({
          first_name: firstName,
          last_name: lastName,
          phone: a.phone || "",
          email: a.email || "",
          vehicle_year: (a.vehicle || "").split(" ")[0] || null,
          vehicle_make: (a.vehicle || "").split(" ")[1] || null,
          vehicle_model: (a.vehicle || "").split(" ").slice(2).join(" ") || null,
          source: "booking_link",
          status: "flaker",
          visits: 0,
          total_spent: 0,
          last_visit: dateStr,
          no_show_count: 1,
          notes: "No-show on " + dateStr
        }).then(function() {
          console.log("Flaker client created");
        }).catch(function(err) {
          console.error("Flaker create failed:", err);
        });
      }
    }).catch(function(err) {
      console.error("Client list fetch failed:", err);
    });
  }
}

function completeAppt(id) {
  updateApptStatus(id, "complete");

  /* Auto-create client when appointment is completed */
  const a = appointments.find(ap => ap.id === id);
  if (!a) return;

  const nameParts = (a.client || "").split(" ");
  const firstName = nameParts[0] || "Unknown";
  const lastName = nameParts.slice(1).join(" ") || "";
  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const since = months[now.getMonth()] + " " + now.getFullYear();
  const dateStr = a.date || now.toISOString().split("T")[0];

  /* Check if client already exists in localStorage (by phone) */
  let existingClients = [];
  try { existingClients = JSON.parse(localStorage.getItem("glossio_clients") || "[]"); } catch(e) {}

  const existing = existingClients.find(c =>
    (a.phone && c.phone === a.phone) || (a.email && c.email === a.email)
  );

  /* Update client in Supabase via data layer (auth-wrapped, RLS-safe) */
  if (window.db && window.db.clients) {
    window.db.clients.list().then(function(allClients) {
      var match = allClients.find(function(c) {
        return a.phone && (c.phone === a.phone);
      });
      if (match) {
        /* Update existing client: bump visits, total_spent, status */
        var newVisits = (parseInt(match.visits || match.visit_count) || 0) + 1;
        var newSpent = (parseFloat(match.total_spent) || 0) + (a.price || 0);
        window.db.clients.update(match.id, {
          visits: newVisits,
          total_spent: newSpent,
          last_visit: dateStr,
          status: "active"
        }).then(function() {
          console.log("Client updated via db layer: visits=" + newVisits + ", status=active");
        }).catch(function(err) {
          console.error("Client update failed:", err);
        });
      } else {
        /* Create new client */
        window.db.clients.create({
          first_name: firstName,
          last_name: lastName,
          phone: a.phone || "",
          email: a.email || "",
          vehicle_year: (a.vehicle || "").split(" ")[0] || null,
          vehicle_make: (a.vehicle || "").split(" ")[1] || null,
          vehicle_model: (a.vehicle || "").split(" ").slice(2).join(" ") || null,
          source: "booking_link",
          status: "active",
          visits: 1,
          total_spent: a.price || 0,
          last_visit: dateStr,
          notes: ""
        }).then(function() {
          console.log("New client created via db layer");
        }).catch(function(err) {
          console.error("Client create failed:", err);
        });
      }
    }).catch(function(err) {
      console.error("Client list fetch failed:", err);
    });
  }

  /* Also update localStorage for offline fallback */
  if (existing) {
    existing.visits = (existing.visits || 0) + 1;
    existing.totalSpent = (existing.totalSpent || 0) + (a.price || 0);
    existing.lastVisit = dateStr;
    existing.status = "active";
    if (!existing.history) existing.history = [];
    existing.history.push({
      service: a.service || "Service",
      date: dateStr,
      price: a.price || 0,
      status: "complete"
    });
  } else {
    const nextId = existingClients.reduce((max, c) => Math.max(max, (c.id || 0) + 1), 1);
    const newClient = {
      id: nextId,
      firstName: firstName,
      lastName: lastName,
      phone: a.phone || "",
      email: a.email || "",
      vehicle: a.vehicle || "",
      source: "Booking Link",
      since: since,
      lastVisit: dateStr,
      totalSpent: a.price || 0,
      visits: 1,
      status: "active",
      notes: "",
      history: [{
        service: a.service || "Service",
        date: dateStr,
        price: a.price || 0,
        status: "complete"
      }]
    };
    existingClients.push(newClient);
  }

  localStorage.setItem("glossio_clients", JSON.stringify(existingClients));
}

function deleteAppt(id) {
  if (!confirm("Are you sure you want to permanently delete this appointment?")) return;
  appointments = appointments.filter(ap => ap.id !== id);
  expandedApptId = null;
  renderAppts();
  if (window.db && window.db.appointments) {
    window.db.appointments.remove(id);
  }
  saveAppts();
}

/* ── Adjust Modal ───────────────────────────────────────────────────────── */

var _adjustServices = []; /* detailer's full service list for the adjust modal */

function openAdjustModal(id) {
  const a = appointments.find(ap => ap.id === id);
  if (!a) return;

  /* Remove existing modal if any */
  const existing = document.getElementById("adjust-modal");
  if (existing) existing.remove();

  /* Load detailer's services, then render the modal */
  var loadServices = (window.db && window.db.services)
    ? window.db.services.list()
    : Promise.resolve([]);

  loadServices.then(function(svcList) {
    _adjustServices = svcList || [];

    /* Figure out which services are currently selected on this appointment */
    var currentNames = (a.service || "").split(/\s*\+\s*/).map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);

    var svcRows = _adjustServices.map(function(svc, idx) {
      var isChecked = currentNames.some(function(cn) {
        return cn === (svc.name || "").toLowerCase();
      });
      var isQuote = !svc.price || svc.price <= 0 || svc.pricing_type === "quote";
      var displayPrice = isChecked && isQuote ? "" : (svc.price ? svc.price.toFixed(2) : "");
      return `
        <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06)">
          <input type="checkbox" id="adj-svc-${idx}" ${isChecked ? "checked" : ""} onchange="updateAdjustTotal()" style="width:18px;height:18px;accent-color:#A78BFA;cursor:pointer;flex-shrink:0" />
          <label for="adj-svc-${idx}" style="flex:1;font-size:14px;cursor:pointer;color:var(--text, #fff)">${svc.name || "Service"}</label>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="color:var(--text-dim, #888);font-size:13px">$</span>
            <input type="number" id="adj-price-${idx}" value="${displayPrice}" placeholder="${isQuote ? 'Quote' : '0'}" min="0" step="0.01" onchange="updateAdjustTotal()" style="width:80px;padding:6px 8px;border-radius:6px;border:1px solid var(--border, #2a2a3e);background:var(--input-bg, #0d0d1a);color:var(--text, #fff);font-size:13px;text-align:right;box-sizing:border-box" />
          </div>
        </div>`;
    }).join("");

    const modal = document.createElement("div");
    modal.id = "adjust-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;overflow-y:auto";
    modal.innerHTML = `
      <div style="background:var(--card-bg, #1a1a2e);border:1px solid var(--border, #2a2a3e);border-radius:16px;padding:28px;width:100%;max-width:460px;color:var(--text, #fff);max-height:90vh;overflow-y:auto">
        <h3 style="margin:0 0 4px;font-size:18px;font-weight:700">Adjust Appointment</h3>
        <p style="margin:0 0 20px;font-size:13px;color:var(--text-dim, #888)">${a.client}</p>

        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim, #888);display:block;margin-bottom:8px">Services</label>
        <div style="background:var(--input-bg, #0d0d1a);border:1px solid var(--border, #2a2a3e);border-radius:10px;padding:4px 14px;margin-bottom:8px">
          ${svcRows || '<p style="padding:12px 0;color:var(--text-dim,#888);font-size:13px">No services found. Add services in the Services tab first.</p>'}
        </div>
        <div style="text-align:right;margin-bottom:16px">
          <span style="font-size:12px;color:var(--text-dim, #888)">Total: </span>
          <span id="adjust-total" style="font-size:15px;font-weight:700;color:#00E5A0">$0.00</span>
        </div>

        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim, #888);display:block;margin-bottom:6px">Date</label>
        <input type="date" id="adjust-date" value="${a.date}" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #2a2a3e);background:var(--input-bg, #0d0d1a);color:var(--text, #fff);font-size:14px;margin-bottom:16px;box-sizing:border-box" />

        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim, #888);display:block;margin-bottom:6px">Time</label>
        <input type="time" id="adjust-time" value="${a.time || ''}" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #2a2a3e);background:var(--input-bg, #0d0d1a);color:var(--text, #fff);font-size:14px;margin-bottom:16px;box-sizing:border-box" />

        <label style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim, #888);display:block;margin-bottom:6px">Notes</label>
        <textarea id="adjust-notes" rows="3" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border, #2a2a3e);background:var(--input-bg, #0d0d1a);color:var(--text, #fff);font-size:14px;margin-bottom:20px;resize:vertical;box-sizing:border-box">${a.notes || ''}</textarea>

        <div style="display:flex;gap:10px">
          <button onclick="saveAdjustment('${a.id}')" style="flex:1;padding:12px;border-radius:10px;border:none;background:linear-gradient(135deg,#A78BFA,#7C3AED);color:#fff;font-weight:700;font-size:14px;cursor:pointer">Save Changes</button>
          <button onclick="closeAdjustModal()" style="flex:1;padding:12px;border-radius:10px;border:1px solid var(--border, #2a2a3e);background:transparent;color:var(--text, #fff);font-weight:600;font-size:14px;cursor:pointer">Cancel</button>
        </div>
      </div>
    `;
    modal.addEventListener("click", function(e) { if (e.target === modal) closeAdjustModal(); });
    document.body.appendChild(modal);

    /* Calculate initial total */
    updateAdjustTotal();
  });
}

function updateAdjustTotal() {
  var total = 0;
  _adjustServices.forEach(function(svc, idx) {
    var cb = document.getElementById("adj-svc-" + idx);
    var priceInput = document.getElementById("adj-price-" + idx);
    if (cb && cb.checked && priceInput) {
      total += parseFloat(priceInput.value) || 0;
    }
  });
  var el = document.getElementById("adjust-total");
  if (el) el.textContent = "$" + total.toFixed(2);
}

function closeAdjustModal() {
  const modal = document.getElementById("adjust-modal");
  if (modal) modal.remove();
}

function saveAdjustment(id) {
  const a = appointments.find(ap => ap.id === id);
  if (!a) return;

  /* Build service name + total from checkboxes */
  var selectedNames = [];
  var totalPrice = 0;
  _adjustServices.forEach(function(svc, idx) {
    var cb = document.getElementById("adj-svc-" + idx);
    var priceInput = document.getElementById("adj-price-" + idx);
    if (cb && cb.checked) {
      selectedNames.push(svc.name || "Service");
      totalPrice += parseFloat(priceInput.value) || 0;
    }
  });

  var newService = selectedNames.join(" + ") || a.service;
  const newDate = document.getElementById("adjust-date").value;
  const newTime = document.getElementById("adjust-time").value;
  const newNotes = document.getElementById("adjust-notes").value;

  a.service = newService;
  a.price = totalPrice;
  a.date = newDate || a.date;
  a.time = newTime || a.time;
  a.notes = newNotes;

  /* Persist to Supabase */
  if (window.db && window.db.appointments) {
    window.db.appointments.update(id, {
      service_name: a.service,
      price: totalPrice,
      appt_date: a.date,
      appt_time: a.time,
      scheduled_date: a.date,
      scheduled_time: a.time,
      notes: newNotes,
      detailer_notes: newNotes
    });
  }
  saveAppts();
  closeAdjustModal();
  renderAppts();
}

/* ── Calendar ────────────────────────────────────────────────────────────── */

function renderCalendar() {
  const calEl = document.getElementById("appt-calendar-view");
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  // Show current month and next month
  const months = [
    { month: thisMonth, year: thisYear },
    { month: (thisMonth + 1) % 12, year: thisMonth === 11 ? thisYear + 1 : thisYear },
  ];

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  calEl.innerHTML = months.map(m => {
    const firstDay = new Date(m.year, m.month, 1).getDay();
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    const monthNum = m.month + 1;

    let cells = CALENDAR_DAYS.map(d => `<div class="cal-header-cell">${d}</div>`).join("");
    cells += Array.from({ length: firstDay }, () => '<div></div>').join("");

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${m.year}-${String(monthNum).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const dayAppts = appointments.filter(a => a.date === dateStr);
      const hasPending = dayAppts.some(a => a.status === "pending");
      const hasConfirmed = dayAppts.some(a => a.status === "confirmed");
      const hasComplete = dayAppts.some(a => a.status === "complete");
      const dotColor = hasPending ? "#FFD60A" : hasConfirmed ? "#00C2FF" : hasComplete ? "#00E5A0" : null;
      const hasAny = dayAppts.length > 0;

      cells += `
        <div class="cal-day ${hasAny ? 'cal-day-has' : ''}" style="${hasAny ? `background:${dotColor}15;border-color:${dotColor}33` : ''}">
          <span style="${hasAny ? 'color:var(--text);font-weight:700' : 'color:var(--text-faint)'}">${day}</span>
          ${hasAny ? `<span class="cal-day-count" style="color:${dotColor}">${dayAppts.length} appt${dayAppts.length > 1 ? 's' : ''}</span>` : ''}
        </div>
      `;
    }

    return `
      <div class="cal-month">
        <p class="cal-month-label">${monthNames[m.month].toUpperCase()} ${m.year}</p>
        <div class="cal-grid">${cells}</div>
      </div>
    `;
  }).join("");

  // Legend
  calEl.innerHTML += `
    <div class="cal-legend">
      ${Object.entries(APPT_STATUS).filter(([k]) => k !== 'cancelled').map(([, cfg]) => `
        <div class="legend-item"><div class="legend-dot-sq" style="background:${cfg.color}33;border-color:${cfg.color}55"></div><span>${cfg.label}</span></div>
      `).join("")}
    </div>
  `;
}

/* ── Create Appointment Modal ─────────────────────────────────────────────── */

var caStep = "choose";
var caClients = [];
var caServices = [];
var caSelectedClient = null;

function openCreateAppt() {
  caStep = "choose";
  caSelectedClient = null;
  caSetStep("choose");
  document.getElementById("create-appt-modal").style.display = "flex";

  // Load clients and services
  if (window.db) {
    if (window.db.clients) {
      window.db.clients.list().then(function(data) { caClients = data || []; });
    }
    if (window.db.services) {
      window.db.services.list().then(function(data) { caServices = data || []; });
    }
  }
}

function closeCreateAppt() {
  document.getElementById("create-appt-modal").style.display = "none";
}

function caSetStep(step) {
  caStep = step;
  document.getElementById("ca-step-choose").style.display = step === "choose" ? "block" : "none";
  document.getElementById("ca-step-existing").style.display = step === "existing" ? "block" : "none";
  document.getElementById("ca-step-new").style.display = step === "new" ? "block" : "none";
  document.getElementById("ca-step-schedule").style.display = (step === "existing" && caSelectedClient) || step === "new" || step === "schedule" ? "block" : "none";

  document.getElementById("create-appt-title").textContent =
    step === "choose" ? "Create Appointment" : step === "existing" ? "Existing Client" : "New Client";

  if (step === "existing") {
    caRenderClientList();
  }
  if (step === "new") {
    document.getElementById("ca-submit-btn").textContent = "Add Client & Schedule";
    caRenderServices();
  }
}

function caRenderClientList() {
  var search = (document.getElementById("ca-client-search").value || "").toLowerCase();
  var list = document.getElementById("ca-client-list");
  var filtered = caClients.filter(function(c) {
    var name = (c.first_name || "") + " " + (c.last_name || "") + " " + (c.phone || "") + " " + (c.email || "");
    return name.toLowerCase().indexOf(search) >= 0;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:var(--text-faint);font-size:13px;text-align:center;padding:20px">No clients found.</p>';
    return;
  }

  list.innerHTML = filtered.map(function(c) {
    var vehicle = [c.vehicle_year, c.vehicle_make, c.vehicle_model].filter(Boolean).join(" ");
    return '<button class="client-pick-btn" onclick="caSelectClient(\'' + c.id + '\')">' +
      '<div class="client-pick-avatar">' + (c.first_name || "?")[0] + '</div>' +
      '<div style="flex:1;min-width:0;text-align:left">' +
        '<p style="margin:0;font-size:14px;font-weight:600">' + (c.first_name || "") + ' ' + (c.last_name || "") + '</p>' +
        '<p style="margin:0;font-size:12px;color:var(--text-dim)">' + (vehicle || c.phone || "") + '</p>' +
      '</div></button>';
  }).join("");
}

function caFilterClients() { caRenderClientList(); }

function caSelectClient(id) {
  caSelectedClient = caClients.find(function(c) { return String(c.id) === String(id); });
  if (!caSelectedClient) return;

  document.getElementById("ca-selected-info").innerHTML =
    '<button class="back-link" onclick="caDeselectClient()">← Pick different client</button>' +
    '<p style="margin:0 0 16px;font-size:14px;color:var(--text-dim)">For <strong style="color:var(--text)">' +
    caSelectedClient.first_name + ' ' + (caSelectedClient.last_name || '') + '</strong>' +
    (caSelectedClient.phone ? ' · ' + caSelectedClient.phone : '') + '</p>';

  document.getElementById("ca-step-existing").style.display = "none";
  document.getElementById("ca-step-schedule").style.display = "block";
  document.getElementById("ca-submit-btn").textContent = "Schedule Appointment";
  caRenderServices();
}

function caDeselectClient() {
  caSelectedClient = null;
  document.getElementById("ca-step-existing").style.display = "block";
  document.getElementById("ca-step-schedule").style.display = "none";
  caRenderClientList();
}

function caRenderServices() {
  var grid = document.getElementById("ca-service-grid");
  if (!caServices || caServices.length === 0) {
    grid.innerHTML = '<p style="color:#FFD60A;font-size:13px">No services found. Add services in the Services tab first.</p>';
    return;
  }
  grid.innerHTML = caServices.map(function(svc) {
    return '<button class="sched-svc-btn" data-id="' + svc.id + '" data-price="' + (svc.price || 0) + '" onclick="caSelectService(this)">' +
      '<span style="font-size:20px">' + (svc.icon || "🔧") + '</span>' +
      '<span style="font-size:13px;font-weight:600">' + svc.name + '</span>' +
      '<span style="font-size:12px;color:' + (svc.color || "#00C2FF") + '">' +
      (svc.pricing_type === "quote" ? "Quote" : "$" + svc.price) + '</span></button>';
  }).join("");
}

function caSelectService(btn) {
  btn.classList.toggle("sched-svc-active");
}

function caSubmit() {
  var activeBtns = document.querySelectorAll("#ca-service-grid .sched-svc-btn.sched-svc-active");
  var date = document.getElementById("ca-date").value;
  var time = document.getElementById("ca-time").value;
  var notes = document.getElementById("ca-notes").value.trim();
  var errEl = document.getElementById("ca-error");

  if (activeBtns.length === 0 || !date || !time) {
    errEl.textContent = "Please select at least one service, date, and time.";
    return;
  }

  var isNew = caStep === "new";
  var firstName, lastName, phone, email, vehicleYear, vehicleMake, vehicleModel, howHeard;

  if (isNew) {
    firstName = document.getElementById("ca-first").value.trim();
    lastName = document.getElementById("ca-last").value.trim();
    phone = document.getElementById("ca-phone").value.trim();
    email = document.getElementById("ca-email").value.trim();
    vehicleYear = document.getElementById("ca-vyear").value.trim();
    vehicleMake = document.getElementById("ca-vmake").value.trim();
    vehicleModel = document.getElementById("ca-vmodel").value.trim();
    howHeard = document.getElementById("ca-source").value;

    if (!firstName) { errEl.textContent = "Please enter the client's first name."; return; }
    if (!phone) { errEl.textContent = "Please enter a phone number."; return; }
  } else {
    if (!caSelectedClient) { errEl.textContent = "Please select a client."; return; }
    firstName = caSelectedClient.first_name;
    lastName = caSelectedClient.last_name || "";
    phone = caSelectedClient.phone || "";
    email = caSelectedClient.email || "";
  }

  errEl.textContent = "";
  var submitBtn = document.getElementById("ca-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";

  var profileId = window.__glossio_user_id || "";

  /* Build service names and total price from selected services */
  var serviceNames = [];
  var totalPrice = 0;
  var firstServiceId = "";
  activeBtns.forEach(function(btn) {
    if (!firstServiceId) firstServiceId = btn.dataset.id;
    var svc = caServices.find(function(s) { return s.id === btn.dataset.id; });
    if (svc) serviceNames.push(svc.name);
    totalPrice += parseFloat(btn.dataset.price) || 0;
  });

  var body = {
    profileId: profileId,
    serviceId: firstServiceId,
    serviceName: serviceNames.join(" + "),
    servicePrice: totalPrice,
    firstName: firstName,
    lastName: lastName,
    phone: phone,
    email: email,
    scheduledDate: date,
    scheduledTime: time,
    notes: notes,
    price: totalPrice
  };

  if (isNew) {
    body.vehicleYear = vehicleYear;
    body.vehicleMake = vehicleMake;
    body.vehicleModel = vehicleModel;
    body.howHeard = howHeard;
  }

  fetch("/.netlify/functions/create-booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(function(res) { return res.json(); })
    .then(function(result) {
      submitBtn.disabled = false;
      submitBtn.textContent = isNew ? "Add Client & Schedule" : "Schedule Appointment";
      if (result.error) {
        errEl.textContent = result.error;
      } else {
        closeCreateAppt();
        loadAppts().then(function() { renderAppts(); });
      }
    })
    .catch(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = isNew ? "Add Client & Schedule" : "Schedule Appointment";
      errEl.textContent = "Something went wrong. Please try again.";
    });

}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadAppts().then(function() {
    renderAppts();
  });

  // Close create modal on overlay click
  var createModal = document.getElementById("create-appt-modal");
  if (createModal) {
    createModal.addEventListener("click", function(e) {
      if (e.target === createModal) closeCreateAppt();
    });
  }
});
