/* ─── Dashboard Home ─────────────────────────────────────────────────────── */

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

function fmtDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  return months[m] + " " + d + ", " + parts[0];
}

function fmtTime(timeStr) {
  if (!timeStr) return "";
  var parts = timeStr.split(":");
  var h = parseInt(parts[0], 10);
  var min = parts[1] || "00";
  var ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return h + ":" + min + " " + ampm;
}

/* Normalize a Supabase appointment row to the shape the UI expects */
function normalizeAppt(a) {
  return {
    id: a.id,
    client: (a.client_first_name || "") + " " + (a.client_last_name || ""),
    service: a.service_name || a.service || "",
    date: a.appt_date || a.scheduled_date || a.date || "",
    time: a.appt_time || a.scheduled_time || a.time || "",
    price: parseFloat(a.price) || parseFloat(a.service_price) || 0,
    status: a.status || "pending",
    phone: a.client_phone || a.phone || "",
    email: a.client_email || a.email || "",
    vehicle: [a.vehicle_year, a.vehicle_make, a.vehicle_model].filter(Boolean).join(" ") || a.vehicle || "",
    notes: a.notes || a.detailer_notes || ""
  };
}

function loadDashStats() {
  const now = new Date();
  const thisMonth = now.getMonth() + 1;
  const thisYear = now.getFullYear();

  const getMonth = (a) => { var p = (a.date || "").split("-"); return parseInt(p[1]) || 0; };
  const getYear = (a) => { var p = (a.date || "").split("-"); return parseInt(p[0]) || 0; };

  /* Load appointments via data layer (waits for auth) */
  _loadDashAppts().then(function(appts) {
    _renderDashStats(appts, now, thisMonth, thisYear, getMonth, getYear);
  });
}

function _loadDashAppts() {
  if (window.db && window.db.appointments) {
    return window.db.appointments.list().then(function(rows) {
      return (rows || []).map(normalizeAppt);
    }).catch(function() { return []; });
  }
  try {
    return Promise.resolve(JSON.parse(localStorage.getItem("glossio_appointments") || "[]"));
  } catch(e) { return Promise.resolve([]); }
}

function _renderDashStats(appts, now, thisMonth, thisYear, getMonth, getYear) {

  const completedThisMonth = appts.filter(a => a.status === "complete" && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const projThisMonth = appts.filter(a => ["confirmed","pending"].includes(a.status) && getMonth(a) === thisMonth && getYear(a) === thisYear);
  const pending = appts.filter(a => a.status === "pending");

  const revMtd = completedThisMonth.reduce((s, a) => s + a.price, 0);
  const revProj = projThisMonth.reduce((s, a) => s + a.price, 0);

  /* Update stat cards */
  const statValues = document.querySelectorAll(".stat-value");
  const statDetails = document.querySelectorAll(".stat-detail");
  if (statValues[0]) statValues[0].textContent = fmt(revMtd);
  if (statValues[1]) statValues[1].textContent = fmt(revProj);
  if (statValues[2]) statValues[2].textContent = appts.length;
  if (statDetails[0]) statDetails[0].textContent = completedThisMonth.length + (completedThisMonth.length === 1 ? " job" : " jobs") + " completed";
  if (statDetails[1]) statDetails[1].textContent = projThisMonth.length + (projThisMonth.length === 1 ? " job" : " jobs") + " remaining";
  if (statDetails[2]) statDetails[2].textContent = pending.length + " awaiting confirmation";

  /* Pending banner */
  const banner = document.querySelector(".pending-banner");
  if (banner) {
    const pendingText = banner.querySelector(".pending-text");
    if (pending.length > 0) {
      banner.style.display = "";
      if (pendingText) pendingText.textContent = pending.length + " Pending Appointment" + (pending.length > 1 ? "s" : "");
    } else {
      banner.style.display = "none";
    }
  }

  /* Status legend */
  const confirmed = appts.filter(a => a.status === "confirmed").length;
  const complete = appts.filter(a => a.status === "complete").length;
  const statusItems = document.querySelectorAll(".status-item span");
  if (statusItems[0]) statusItems[0].textContent = "Pending (" + pending.length + ")";
  if (statusItems[1]) statusItems[1].textContent = "Confirmed (" + confirmed + ")";
  if (statusItems[2]) statusItems[2].textContent = "Complete (" + complete + ")";

  /* ── Two-column appointment lists ── */
  const todayStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");

  /* Left: All pending appointments (any date), sorted earliest first */
  const pendingAppts = pending.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return (a.time || "").localeCompare(b.time || "");
  });

  /* Right: Confirmed appointments for today only, sorted by time */
  const confirmedToday = appts
    .filter(a => a.status === "confirmed" && a.date === todayStr)
    .sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  /* Action button styles */
  var btnBase = 'border-radius:6px;font-size:11px;font-weight:700;padding:5px 10px;cursor:pointer;white-space:nowrap;';

  /* Render pending column */
  var pendingList = document.getElementById("dash-pending-list");
  var pendingEmpty = document.getElementById("dash-pending-empty");
  var pendingCount = document.getElementById("dash-pending-count");
  if (pendingCount) pendingCount.textContent = pendingAppts.length;

  if (pendingList) {
    if (pendingAppts.length > 0) {
      if (pendingEmpty) pendingEmpty.style.display = "none";
      pendingList.innerHTML = pendingAppts.map(function(a) {
        var serviceLine = a.service ? '<p class="dash-col-card-service" style="font-size:12px;color:var(--primary);margin-top:4px">' + a.service + (a.price ? ' · ' + fmt(a.price) : '') + '</p>' : '';
        return '<div class="dash-col-card" onclick="dashToggleCard(this)" style="cursor:pointer">' +
          '<p class="dash-col-card-name">' + a.client + '</p>' +
          serviceLine +
          '<p class="dash-col-card-detail">' + (a.vehicle || '') + '</p>' +
          '<p class="dash-col-card-time">' + fmtDate(a.date) + ' · ' + fmtTime(a.time) + '</p>' +
          '<div class="dash-card-actions" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:none;flex-wrap:wrap;gap:6px">' +
            '<button style="' + btnBase + 'background:#00C2FF15;border:1px solid #00C2FF33;color:#00C2FF" onclick="event.stopPropagation();dashAction(\'' + a.id + '\',\'confirmed\')">✓ Confirm</button>' +
            '<button style="' + btnBase + 'background:#A259FF15;border:1px solid #A259FF33;color:#A259FF" onclick="event.stopPropagation();dashAdjust(\'' + a.id + '\')">✎ Adjust</button>' +
            '<button style="' + btnBase + 'background:#FF336615;border:1px solid #FF336633;color:#FF3366" onclick="event.stopPropagation();dashAction(\'' + a.id + '\',\'cancelled\')">✗ Cancel</button>' +
          '</div>' +
        '</div>';
      }).join("");
    } else {
      if (pendingEmpty) pendingEmpty.style.display = "";
      pendingList.innerHTML = "";
    }
  }

  /* Render confirmed today column */
  var confirmedList = document.getElementById("dash-confirmed-list");
  var confirmedEmpty = document.getElementById("dash-confirmed-empty");
  var confirmedCount = document.getElementById("dash-confirmed-count");
  if (confirmedCount) confirmedCount.textContent = confirmedToday.length;

  if (confirmedList) {
    if (confirmedToday.length > 0) {
      if (confirmedEmpty) confirmedEmpty.style.display = "none";
      confirmedList.innerHTML = confirmedToday.map(function(a) {
        var serviceLine = a.service ? '<p class="dash-col-card-service" style="font-size:12px;color:var(--success);margin-top:4px">' + a.service + (a.price ? ' · ' + fmt(a.price) : '') + '</p>' : '';
        return '<div class="dash-col-card" onclick="dashToggleCard(this)" style="cursor:pointer">' +
          '<p class="dash-col-card-name">' + a.client + '</p>' +
          serviceLine +
          '<p class="dash-col-card-detail">' + (a.vehicle || '') + '</p>' +
          '<p class="dash-col-card-time">' + fmtTime(a.time) + '</p>' +
          '<div class="dash-card-actions" style="display:none;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);display:none;flex-wrap:wrap;gap:6px">' +
            '<button style="' + btnBase + 'background:#00E5A015;border:1px solid #00E5A033;color:#00E5A0" onclick="event.stopPropagation();dashCameThrough(\'' + a.id + '\')">✅ Came Through</button>' +
            '<button style="' + btnBase + 'background:#A259FF15;border:1px solid #A259FF33;color:#A259FF" onclick="event.stopPropagation();dashAdjust(\'' + a.id + '\')">✎ Adjust</button>' +
            '<button style="' + btnBase + 'background:#FF336615;border:1px solid #FF336633;color:#FF3366" onclick="event.stopPropagation();dashAction(\'' + a.id + '\',\'cancelled\')">✗ Cancel</button>' +
          '</div>' +
        '</div>';
      }).join("");
    } else {
      if (confirmedEmpty) confirmedEmpty.style.display = "";
      confirmedList.innerHTML = "";
    }
  }
}


function showDashToast(msg) {
  const existing = document.getElementById("dash-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "dash-toast";
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00E5A0;border-radius:10px;padding:12px 24px;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,229,160,0.3);z-index:999";
  t.innerHTML = '<span style="font-size:16px">✓</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + msg + '</span>';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ─── Calendar View ──────────────────────────────────────────────────────── */

let calYear, calMonth; // 0-indexed month

function initCalendar() {
  const now = new Date();
  calYear = now.getFullYear();
  calMonth = now.getMonth();
  renderCalendar();
}

function renderCalendar() {
  const container = document.getElementById("dash-calendar-view");
  if (!container) return;

  _loadDashAppts().then(function(appts) { _renderCalendarWith(container, appts); });
}

function _renderCalendarWith(container, appts) {

  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const daysInPrev = new Date(calYear, calMonth, 0).getDate();
  const today = new Date();

  const statusColors = {
    pending: "#FFD60A", confirmed: "#00C2FF", complete: "#00E5A0", cancelled: "#FF3366"
  };

  // Build appointment lookup by date string
  const apptsByDate = {};
  appts.forEach(function(a) {
    if (!apptsByDate[a.date]) apptsByDate[a.date] = [];
    apptsByDate[a.date].push(a);
  });

  let html = '<div class="cal-nav">' +
    '<button class="cal-nav-btn" id="cal-prev">&larr;</button>' +
    '<span class="cal-month-label">' + monthNames[calMonth] + ' ' + calYear + '</span>' +
    '<button class="cal-nav-btn" id="cal-next">&rarr;</button>' +
  '</div>';

  html += '<div class="cal-grid">';

  // Day headers
  dayNames.forEach(function(d) {
    html += '<div class="cal-day-header">' + d + '</div>';
  });

  // Previous month filler days
  for (var i = firstDay - 1; i >= 0; i--) {
    html += '<div class="cal-day other-month"><span class="cal-day-num">' + (daysInPrev - i) + '</span></div>';
  }

  // Current month days
  for (var d = 1; d <= daysInMonth; d++) {
    var dateStr = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    var isToday = today.getFullYear() === calYear && today.getMonth() === calMonth && today.getDate() === d;
    var dayAppts = apptsByDate[dateStr] || [];

    html += '<div class="cal-day' + (isToday ? ' today' : '') + '">';
    html += '<span class="cal-day-num">' + d + '</span>';
    dayAppts.slice(0, 2).forEach(function(a) {
      var c = statusColors[a.status] || "#FFD60A";
      html += '<div class="cal-day-appt" style="background:' + c + '18;color:' + c + ';border-left:2px solid ' + c + '" title="' + a.client + ' - ' + a.service + '">' + a.client + '</div>';
    });
    if (dayAppts.length > 2) {
      html += '<div style="font-size:10px;color:var(--text-faint);margin-top:1px">+' + (dayAppts.length - 2) + ' more</div>';
    }
    html += '</div>';
  }

  // Next month filler days
  var totalCells = firstDay + daysInMonth;
  var remaining = (7 - (totalCells % 7)) % 7;
  for (var n = 1; n <= remaining; n++) {
    html += '<div class="cal-day other-month"><span class="cal-day-num">' + n + '</span></div>';
  }

  html += '</div>';
  container.innerHTML = html;

  // Nav buttons
  document.getElementById("cal-prev").addEventListener("click", function() {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  document.getElementById("cal-next").addEventListener("click", function() {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
}

/* ─── View Toggle ────────────────────────────────────────────────────────── */

function initViewToggle() {
  var btns = document.querySelectorAll(".view-btn");
  var listView = document.querySelector(".list-view");
  var calView = document.querySelector(".calendar-view");
  if (!btns.length || !listView || !calView) return;

  btns.forEach(function(btn) {
    btn.addEventListener("click", function() {
      btns.forEach(function(b) {
        b.classList.remove("view-btn-active");
        b.classList.add("view-btn-inactive");
      });
      btn.classList.remove("view-btn-inactive");
      btn.classList.add("view-btn-active");

      if (btn.textContent.trim() === "Calendar") {
        listView.classList.add("hidden");
        calView.classList.add("active");
        renderCalendar();
      } else {
        listView.classList.remove("hidden");
        calView.classList.remove("active");
      }
    });
  });
}

/* ─── Dashboard Action Handlers ───────────────────────────────────────────── */

function dashToggleCard(el) {
  var actions = el.querySelector('.dash-card-actions');
  if (!actions) return;
  var isOpen = actions.style.display === 'flex';
  /* Close all others first */
  document.querySelectorAll('.dash-card-actions').forEach(function(a) { a.style.display = 'none'; });
  actions.style.display = isOpen ? 'none' : 'flex';
}

function dashAction(id, newStatus) {
  if (window.db && window.db.appointments) {
    window.db.appointments.update(id, { status: newStatus }).then(function() {
      showDashToast(newStatus === 'confirmed' ? 'Appointment confirmed!' : newStatus === 'cancelled' ? 'Appointment cancelled' : 'Status updated');
      loadDashStats(); /* Refresh the dashboard */
    });
  }
}

function dashCameThrough(id) {
  if (!window.db || !window.db.appointments) return;
  /* Mark appointment complete */
  window.db.appointments.update(id, { status: 'complete' }).then(function() {
    /* Get appointment details to create/update client */
    window.db.appointments.get(id).then(function(a) {
      if (!a) return;
      var phone = a.client_phone || '';
      var firstName = a.client_first_name || '';
      var lastName = a.client_last_name || '';
      var price = parseFloat(a.price) || parseFloat(a.service_price) || 0;
      var dateStr = a.appt_date || a.scheduled_date || '';
      var uid = window.__glossio_user_id;

      if (uid && phone && window.sbClient) {
        window.sbClient.from('clients')
          .select('id, visits, total_spent')
          .eq('profile_id', uid)
          .eq('phone', phone)
          .single()
          .then(function(r) {
            if (r.data) {
              var newVisits = (parseInt(r.data.visits) || 0) + 1;
              var newSpent = (parseFloat(r.data.total_spent) || 0) + price;
              window.sbClient.from('clients').update({
                visits: newVisits,
                total_spent: newSpent,
                last_visit: dateStr,
                status: 'active'
              }).eq('id', r.data.id);
            } else {
              window.sbClient.from('clients').insert({
                profile_id: uid,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
                email: a.client_email || null,
                vehicle_year: a.vehicle_year || null,
                vehicle_make: a.vehicle_make || null,
                vehicle_model: a.vehicle_model || null,
                source: 'booking_link',
                status: 'active',
                visits: 1,
                total_spent: price,
                last_visit: dateStr
              });
            }
          });
      }
    });
    showDashToast('Marked as Came Through!');
    loadDashStats();
  });
}

function dashAdjust(id) {
  /* Open a simple modal to adjust date/time */
  var existing = document.getElementById('dash-adjust-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'dash-adjust-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center';
  modal.innerHTML =
    '<div style="background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:28px;width:360px;max-width:90vw">' +
      '<h3 style="margin:0 0 16px;font-size:16px;font-weight:700">Adjust Appointment</h3>' +
      '<label style="font-size:12px;color:var(--text-dim);display:block;margin-bottom:4px">Date</label>' +
      '<input type="date" id="dash-adj-date" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:12px;font-size:14px">' +
      '<label style="font-size:12px;color:var(--text-dim);display:block;margin-bottom:4px">Time</label>' +
      '<input type="time" id="dash-adj-time" style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);margin-bottom:16px;font-size:14px">' +
      '<div style="display:flex;gap:10px">' +
        '<button onclick="dashSaveAdjust(\'' + id + '\')" style="flex:1;padding:10px;border:none;border-radius:8px;background:#00C2FF;color:#fff;font-weight:700;cursor:pointer;font-size:14px">Save</button>' +
        '<button onclick="document.getElementById(\'dash-adjust-modal\').remove()" style="flex:1;padding:10px;border:1px solid var(--border);border-radius:8px;background:transparent;color:var(--text);font-weight:600;cursor:pointer;font-size:14px">Cancel</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) { if (e.target === modal) modal.remove(); });
}

function dashSaveAdjust(id) {
  var date = document.getElementById('dash-adj-date').value;
  var time = document.getElementById('dash-adj-time').value;
  if (!date && !time) return;
  var fields = {};
  if (date) { fields.appt_date = date; fields.scheduled_date = date; }
  if (time) { fields.appt_time = time; fields.scheduled_time = time; }
  if (window.db && window.db.appointments) {
    window.db.appointments.update(id, fields).then(function() {
      document.getElementById('dash-adjust-modal').remove();
      showDashToast('Appointment adjusted!');
      loadDashStats();
    });
  }
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadDashStats();
  initCalendar();
  initViewToggle();
});
