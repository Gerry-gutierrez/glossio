/* ─── Appointments Page ────────────────────────────────────────────────────── */

const APPTS_KEY = "glossio_appointments";
const CALENDAR_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const APPT_STATUS = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Complete" },
  cancelled: { color: "#FF3366", bg: "#FF336615", border: "#FF336633", label: "Cancelled" },
};

let appointments = [];
let apptFilter = "all";
let apptView = "list";
let nextApptId = 1;
let expandedApptId = null;

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadAppts() {
  try {
    const data = localStorage.getItem(APPTS_KEY);
    if (data) {
      appointments = JSON.parse(data);
      nextApptId = appointments.reduce((max, a) => Math.max(max, a.id + 1), 1);
    }
  } catch (e) { appointments = []; }
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
  document.getElementById("rev-mtd-detail").textContent = completedThisMonth.length + " jobs completed";
  document.getElementById("rev-proj-detail").textContent = projThisMonth.length + " jobs remaining";
  document.getElementById("rev-next-detail").textContent = projNextMonth.length + " jobs booked ahead";

  const pending = appointments.filter(a => a.status === "pending").length;
  const confirmed = appointments.filter(a => a.status === "confirmed").length;
  const complete = appointments.filter(a => a.status === "complete").length;
  const cancelled = appointments.filter(a => a.status === "cancelled").length;

  document.getElementById("count-pending").textContent = pending;
  document.getElementById("count-confirmed").textContent = confirmed;
  document.getElementById("count-complete").textContent = complete;
  document.getElementById("count-cancelled").textContent = cancelled;

  document.getElementById("leg-pending").textContent = pending;
  document.getElementById("leg-confirmed").textContent = confirmed;
  document.getElementById("leg-complete").textContent = complete;

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

  const filtered = apptFilter === "all" ? appointments : appointments.filter(a => a.status === apptFilter);

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
      <div class="appt-item" style="border-left-color:${cfg.color}" onclick="toggleAppt(${a.id})">
        <div class="appt-row">
          <div class="appt-row-main">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
              <p style="margin:0;font-size:15px;font-weight:700">${a.client}</p>
              ${isPending ? '<span class="new-badge">NEW</span>' : ''}
            </div>
            <p style="margin:0;font-size:12px;color:var(--text-dim)">${a.vehicle || ''} · ${a.service}</p>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:var(--success)">${fmt(a.price)}</p>
            <span class="appt-status-badge" style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border}">${cfg.label}</span>
          </div>
          <div style="flex-shrink:0;margin-left:8px">
            <p style="margin:0 0 2px;font-size:13px;color:#C8C4BC">${a.date}</p>
            <p style="margin:0;font-size:11px;color:var(--text-faint)">${a.time || ''}</p>
          </div>
          <span style="color:var(--text-faint);font-size:14px;flex-shrink:0;margin-left:8px">${isExpanded ? '▲' : '▼'}</span>
        </div>
        ${isExpanded ? `
          <div class="appt-expanded" onclick="event.stopPropagation()">
            <div class="appt-detail-grid">
              <div><span class="appt-detail-label">Phone</span><span class="appt-detail-value">${a.phone || '—'}</span></div>
              <div><span class="appt-detail-label">Email</span><span class="appt-detail-value">${a.email || '—'}</span></div>
              <div><span class="appt-detail-label">Vehicle</span><span class="appt-detail-value">${a.vehicle || '—'}</span></div>
              <div><span class="appt-detail-label">Notes</span><span class="appt-detail-value">${a.notes || 'None'}</span></div>
            </div>
            <div class="appt-actions">
              ${a.status === "pending" ? `
                <button class="action-btn" style="background:#00C2FF15;border-color:#00C2FF33;color:#00C2FF" onclick="confirmAppt(${a.id})">✓ Confirm</button>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="cancelAppt(${a.id})">✗ Cancel</button>
              ` : ''}
              ${a.status === "confirmed" ? `
                <button class="action-btn" style="background:#00E5A015;border-color:#00E5A033;color:#00E5A0" onclick="completeAppt(${a.id})">✅ Mark Complete</button>
                <button class="action-btn" style="background:#FF336615;border-color:#FF336633;color:#FF3366" onclick="cancelAppt(${a.id})">✗ Cancel</button>
              ` : ''}
              ${a.status === "complete" ? '<span style="font-size:12px;color:var(--text-faint)">Done ✓</span>' : ''}
              ${a.status === "cancelled" ? '<span style="font-size:12px;color:var(--text-faint)">Cancelled</span>' : ''}
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

function confirmAppt(id) {
  const a = appointments.find(ap => ap.id === id);
  if (a) { a.status = "confirmed"; saveAppts(); renderAppts(); }
}

function completeAppt(id) {
  const a = appointments.find(ap => ap.id === id);
  if (a) { a.status = "complete"; saveAppts(); renderAppts(); }
}

function cancelAppt(id) {
  const a = appointments.find(ap => ap.id === id);
  if (a) { a.status = "cancelled"; saveAppts(); renderAppts(); }
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

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadAppts();
  renderAppts();
});
