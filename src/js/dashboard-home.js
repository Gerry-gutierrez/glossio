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

  /* Appointment count */
  const apptSub = document.querySelector(".appt-subtitle");
  const todayStr2 = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
  const todaysAppts = appts.filter(a => a.date === todayStr2 && a.status !== "cancelled");
  if (apptSub) apptSub.textContent = pending.length + " pending · " + todaysAppts.length + " today";

  /* Recent appointments list */
  const emptyState = document.querySelector(".appt-card .empty-state");
  const recentContainer = document.getElementById("dash-recent-appts");

  if (appts.length > 0 && emptyState) emptyState.style.display = "none";
  if (appts.length === 0 && emptyState) emptyState.style.display = "";

  if (recentContainer) {
    const todayStr = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0") + "-" + String(now.getDate()).padStart(2, "0");
    const upcoming = appts
      .filter(a => a.status === "pending" || (a.date === todayStr && a.status !== "cancelled"))
      .sort((a, b) => {
        /* Today's appts first, then by date, then by time */
        var aToday = a.date === todayStr ? 0 : 1;
        var bToday = b.date === todayStr ? 0 : 1;
        if (aToday !== bToday) return aToday - bToday;
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.time || "").localeCompare(b.time || "");
      });

    if (upcoming.length > 0) {
      const statusColors = {
        pending: "#FFD60A", confirmed: "#00C2FF", complete: "#00E5A0", cancelled: "#FF3366"
      };
      recentContainer.innerHTML = upcoming.map(a => {
        const c = statusColors[a.status] || "#FFD60A";
        return '<div style="display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid var(--border)">' +
          '<div style="width:4px;height:40px;border-radius:2px;background:' + c + ';flex-shrink:0"></div>' +
          '<div style="flex:1;min-width:0">' +
            '<p style="margin:0 0 3px;font-size:14px;font-weight:700">' + a.client + '</p>' +
            '<p style="margin:0;font-size:12px;color:var(--text-dim)">' + a.service + ' · ' + fmtDate(a.date) + '</p>' +
          '</div>' +
          '<div style="text-align:right;flex-shrink:0">' +
            '<p style="margin:0 0 2px;font-size:14px;font-weight:700;color:var(--success)">' + fmt(a.price) + '</p>' +
            '<span style="font-size:10px;background:' + c + '15;color:' + c + ';border:1px solid ' + c + '33;border-radius:20px;padding:2px 8px;font-weight:700;text-transform:uppercase">' + a.status + '</span>' +
          '</div>' +
        '</div>';
      }).join("");
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

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadDashStats();
  initCalendar();
  initViewToggle();
});
