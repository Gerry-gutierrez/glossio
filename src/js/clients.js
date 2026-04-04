/* ─── Clients CRM ──────────────────────────────────────────────────────────── */

const CLIENTS_KEY = "glossio_clients";

const STATUS_CONFIG = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Came Through" },
};

let clients = [];
let currentFilter = "all";
let currentSort = "recent";
let nextClientId = 1;
let viewingDetail = false;

function fmt(n) { return "$" + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadClients() {
  if (window.db && window.db.clients) {
    return window.db.clients.list().then(function(rows) {
      clients = (rows || []).map(function(c) {
        return {
          id: c.id,
          firstName: c.first_name || c.firstName || "",
          lastName: c.last_name || c.lastName || "",
          phone: c.phone || "",
          email: c.email || "",
          vehicle: [c.vehicle_year, c.vehicle_make, c.vehicle_model].filter(Boolean).join(" ") || c.vehicle || "",
          source: c.source || "",
          since: c.since || "",
          lastVisit: c.last_visit || c.lastVisit || "",
          totalSpent: parseFloat(c.total_spent) || parseFloat(c.totalSpent) || 0,
          visits: parseInt(c.total_visits) || parseInt(c.visits) || parseInt(c.visit_count) || 0,
          status: c.status || ((parseInt(c.total_visits) || 0) > 0 ? "active" : "never_came"),
          notes: c.notes || "",
          history: c.history || []
        };
      });
      nextClientId = clients.reduce((max, c) => Math.max(max, (typeof c.id === "number" ? c.id : 0) + 1), 1);
      return clients;
    }).catch(function() {
      /* Fallback to localStorage */
      _loadClientsFromLS();
      return clients;
    });
  }
  _loadClientsFromLS();
  return Promise.resolve(clients);
}

function _loadClientsFromLS() {
  try {
    const data = localStorage.getItem(CLIENTS_KEY);
    if (data) {
      clients = JSON.parse(data);
      nextClientId = clients.reduce((max, c) => Math.max(max, (typeof c.id === "number" ? c.id : 0) + 1), 1);
    }
  } catch (e) { clients = []; }
}

function saveClients() {
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients));
}

/* ── Stats ───────────────────────────────────────────────────────────────── */

function updateStats() {
  document.getElementById("stat-total-clients").textContent = clients.length;
  document.getElementById("stat-came").textContent = clients.filter(c => c.status === "active").length;
  document.getElementById("stat-never").textContent = clients.filter(c => c.status === "never_came").length;
  document.getElementById("stat-revenue").textContent = fmt(clients.reduce((s, c) => s + (c.totalSpent || 0), 0));
}

/* ── Filter / Sort / Search ──────────────────────────────────────────────── */

function getFilteredClients() {
  const search = (document.getElementById("client-search")?.value || "").toLowerCase();
  return clients
    .filter(c => {
      const matchSearch = (c.firstName + " " + c.lastName + " " + c.phone + " " + c.vehicle + " " + c.email + " " + c.source)
        .toLowerCase().includes(search);
      const matchFilter = currentFilter === "all" || c.status === currentFilter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (currentSort === "az") return a.firstName.localeCompare(b.firstName);
      if (currentSort === "za") return b.firstName.localeCompare(a.firstName);
      if (currentSort === "most_spent") return (b.totalSpent || 0) - (a.totalSpent || 0);
      if (currentSort === "most_visits") return (b.visits || 0) - (a.visits || 0);
      return b.id - a.id; // recent
    });
}

function setFilter(f) {
  currentFilter = f;
  document.querySelectorAll(".filter-btns .filter-btn").forEach(btn => {
    btn.classList.toggle("filter-btn-active", btn.dataset.filter === f);
  });
  renderList();
}

function setSort(s) {
  currentSort = s;
  renderList();
}

function clearSearch() {
  document.getElementById("client-search").value = "";
  document.getElementById("clear-search").style.display = "none";
  renderList();
}

/* ── Render List ─────────────────────────────────────────────────────────── */

function renderList() {
  if (viewingDetail) return;

  updateStats();
  const list = document.getElementById("client-list");
  const empty = document.getElementById("empty-state");
  const noResults = document.getElementById("no-results");
  const resultCount = document.getElementById("result-count");

  // Show/hide clear button
  const searchVal = document.getElementById("client-search")?.value || "";
  document.getElementById("clear-search").style.display = searchVal ? "block" : "none";

  if (clients.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    noResults.style.display = "none";
    resultCount.textContent = "";
    return;
  }

  empty.style.display = "none";
  const filtered = getFilteredClients();
  resultCount.textContent = filtered.length + " of " + clients.length + " clients";

  if (filtered.length === 0) {
    list.innerHTML = "";
    noResults.style.display = "block";
    return;
  }

  noResults.style.display = "none";
  list.innerHTML = filtered.map(c => {
    const isActive = c.status === "active";
    const statusColor = isActive ? "#00E5A0" : "#FFD60A";
    const statusLabel = isActive ? "Came Through" : "Never Came";
    return `
      <div class="client-row" style="border-left:3px solid ${statusColor}" onclick="showDetail('${c.id}')">
        <div class="client-avatar" style="background:linear-gradient(135deg, ${statusColor}22, ${statusColor}11);border:1.5px solid ${statusColor}33;color:${statusColor}">
          ${c.firstName[0]}
        </div>
        <div class="client-info">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <p class="client-row-name">${c.firstName} ${c.lastName}</p>
            <span class="client-status-badge" style="background:${statusColor}15;color:${statusColor};border:1px solid ${statusColor}33">${statusLabel}</span>
          </div>
          <p class="client-row-detail">${c.vehicle || "No vehicle"} · via ${c.source || "Unknown"}</p>
        </div>
        <div class="client-stats-right">
          <div style="text-align:center">
            <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:var(--primary)">${c.visits || 0}</p>
            <p style="margin:0;font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.1em">Visits</p>
          </div>
          <div style="text-align:center">
            <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:var(--success)">${fmt(c.totalSpent || 0)}</p>
            <p style="margin:0;font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.1em">Spent</p>
          </div>
          <div style="text-align:center">
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:var(--text-muted)">${c.lastVisit || "—"}</p>
            <p style="margin:0;font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:0.1em">Last Visit</p>
          </div>
        </div>
        <span style="color:var(--text-faint);font-size:18px;flex-shrink:0">›</span>
      </div>
    `;
  }).join("");
}

/* ── Client Detail ───────────────────────────────────────────────────────── */

function showDetail(id) {
  const c = clients.find(cl => String(cl.id) === String(id));
  if (!c) return;

  viewingDetail = true;

  // Hide list views
  document.getElementById("client-list").style.display = "none";
  document.getElementById("empty-state").style.display = "none";
  document.getElementById("no-results").style.display = "none";
  document.querySelector(".clients-stats").style.display = "none";
  document.querySelector(".client-controls-bar").style.display = "none";
  document.querySelector(".page-header").style.display = "none";

  const detail = document.getElementById("client-detail");
  detail.style.display = "block";

  /* Fetch completed appointments for this client from Supabase */
  _renderClientDetail(c, detail, []);
  if (window.db && window.db.appointments) {
    window.db.appointments.list().then(function(appts) {
      var clientAppts = (appts || []).filter(function(a) {
        return a.status === "complete" && (
          (c.phone && a.client_phone === c.phone) ||
          (c.email && a.client_email === c.email)
        );
      }).map(function(a) {
        return {
          service: a.service_name || a.service || "Service",
          date: a.appt_date || a.scheduled_date || "",
          price: parseFloat(a.service_price) || parseFloat(a.price) || 0,
          status: "complete"
        };
      }).sort(function(a, b) { return (b.date || "").localeCompare(a.date || ""); });
      _renderClientDetail(c, detail, clientAppts);
    });
  }
}

function _fmtDetailDate(dateStr) {
  if (!dateStr) return "";
  var parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var m = parseInt(parts[1], 10) - 1;
  var d = parseInt(parts[2], 10);
  return months[m] + " " + d + ", " + parts[0];
}

function _renderClientDetail(c, detail, history) {

  detail.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <button class="back-btn" onclick="hideDetail()" style="margin-bottom:0">← Back to Clients</button>
      <button class="btn" style="font-size:13px;padding:6px 14px;background:linear-gradient(135deg,rgba(0,194,255,0.12),rgba(162,89,255,0.12));border:1px solid rgba(0,194,255,0.25);color:#00C2FF;font-weight:600;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:6px" onclick="openScheduleModal(clients.find(function(x){return String(x.id)==='${c.id}'}) || {firstName:'${c.firstName}',lastName:'${c.lastName}',phone:'${c.phone || ""}',email:'${c.email || ""}'})">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="12" y1="14" x2="12" y2="18"/><line x1="10" y1="16" x2="14" y2="16"/></svg>
        Schedule Appointment
      </button>
    </div>

    <div class="detail-grid">
      <div>
        <!-- Info Card -->
        <div class="detail-card" style="margin-bottom:20px">
          <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
            <div class="client-avatar-lg">${c.firstName[0]}</div>
            <div>
              <h2 style="margin:0 0 4px;font-size:22px;font-weight:700">${c.firstName} ${c.lastName}</h2>
              <p style="margin:0;font-size:13px;color:var(--text-dim)">Client since ${c.since || "Recently"}</p>
            </div>
          </div>
          ${[
            { icon: "📱", label: "Phone", value: c.phone || "—" },
            { icon: "✉️", label: "Email", value: c.email || "—" },
            { icon: "🚗", label: "Vehicle", value: c.vehicle || "—" },
            { icon: "📣", label: "Found via", value: c.source || "—" },
          ].map(f => `
            <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">
              <span style="font-size:16px;margin-top:1px">${f.icon}</span>
              <div>
                <p style="margin:0 0 2px;font-size:10px;color:var(--text-faint);letter-spacing:0.15em;text-transform:uppercase">${f.label}</p>
                <p style="margin:0;font-size:14px;color:#C8C4BC">${f.value}</p>
              </div>
            </div>
          `).join("")}
        </div>

        <!-- Mini stats -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="mini-stat" style="border-top:2px solid var(--primary)">
            <p class="mini-stat-value" style="color:var(--primary)">${c.visits || 0}</p>
            <p class="mini-stat-label">Total Visits</p>
          </div>
          <div class="mini-stat" style="border-top:2px solid var(--success)">
            <p class="mini-stat-value" style="color:var(--success)">${fmt(c.totalSpent || 0)}</p>
            <p class="mini-stat-label">Total Spent</p>
          </div>
        </div>
      </div>

      <div>
        <!-- History -->
        <div class="detail-card" style="margin-bottom:20px">
          <h3 style="margin:0 0 20px;font-size:15px;font-weight:700">Service History</h3>
          ${history.length === 0 ? '<p style="color:var(--text-faint);font-size:13px">No services yet.</p>' :
            history.map((h, i) => {
              const cfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.complete;
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;${i < history.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
                  <div>
                    <p style="margin:0 0 3px;font-size:14px;font-weight:600">${h.service}</p>
                    <p style="margin:0;font-size:12px;color:var(--text-dim)">${_fmtDetailDate(h.date)}</p>
                  </div>
                  <div style="text-align:right">
                    <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:var(--success)">${fmt(h.price)}</p>
                    <span style="background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.border};border-radius:20px;font-size:9px;font-weight:700;padding:2px 8px;text-transform:uppercase;letter-spacing:0.08em">${cfg.label}</span>
                  </div>
                </div>
              `;
            }).join("")
          }
        </div>

        <!-- Notes -->
        <div class="detail-card">
          <h3 style="margin:0 0 14px;font-size:15px;font-weight:700">Notes</h3>
          <textarea id="client-notes" class="input" style="height:100px;resize:vertical;margin-bottom:12px" placeholder="Add notes about this client...">${c.notes || ""}</textarea>
          <button class="btn btn-primary" style="font-size:12px;padding:9px 20px" onclick="saveNotes('${c.id}')">Save Notes</button>
          <span id="notes-toast" class="save-toast" style="display:none;margin-left:10px">✓ Saved!</span>
          <button class="btn" style="font-size:12px;padding:9px 20px;margin-top:16px;background:#FF336615;border:1px solid #FF336633;color:#FF3366;width:100%" onclick="deleteClient('${c.id}')">🗑 Delete Client</button>
        </div>
      </div>
    </div>
  `;
}

function hideDetail() {
  viewingDetail = false;
  document.getElementById("client-detail").style.display = "none";
  document.getElementById("client-list").style.display = "block";
  document.querySelector(".clients-stats").style.display = "";
  document.querySelector(".client-controls-bar").style.display = "";
  document.querySelector(".page-header").style.display = "";
  renderList();
}

function saveNotes(id) {
  const c = clients.find(cl => String(cl.id) === String(id));
  if (!c) return;
  c.notes = document.getElementById("client-notes").value;
  saveClients();

  /* Persist to Supabase */
  if (window.db && window.db.clients) {
    window.db.clients.update(id, { notes: c.notes });
  }

  const toast = document.getElementById("notes-toast");
  toast.style.display = "inline";
  setTimeout(() => { toast.style.display = "none"; }, 2000);
}

function deleteClient(id) {
  if (!confirm("Are you sure you want to permanently delete this client? This cannot be undone.")) return;
  clients = clients.filter(cl => String(cl.id) !== String(id));
  hideDetail();
  if (window.db && window.db.clients) {
    window.db.clients.remove(id);
  }
  saveClients();
}

/* ── Add Client ──────────────────────────────────────────────────────────── */

function openAddClient() {
  document.getElementById("ac-first").value = "";
  document.getElementById("ac-last").value = "";
  document.getElementById("ac-phone").value = "";
  document.getElementById("ac-email").value = "";
  document.getElementById("ac-vehicle").value = "";
  document.getElementById("ac-source").value = "Instagram";
  document.getElementById("ac-notes").value = "";
  document.getElementById("add-client-modal").style.display = "flex";
}

function closeAddClient() {
  document.getElementById("add-client-modal").style.display = "none";
}

function addClient() {
  const first = document.getElementById("ac-first").value.trim();
  const last = document.getElementById("ac-last").value.trim();
  if (!first) return;

  const now = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const since = months[now.getMonth()] + " " + now.getFullYear();

  const phone = document.getElementById("ac-phone").value.trim();
  const email = document.getElementById("ac-email").value.trim();
  const vehicle = document.getElementById("ac-vehicle").value.trim();
  const source = document.getElementById("ac-source").value;
  const notes = document.getElementById("ac-notes").value.trim();

  /* Parse vehicle into year/make/model for Supabase */
  const vParts = vehicle.split(" ");
  const vYear = vParts.length >= 3 && /^\d{4}$/.test(vParts[0]) ? vParts[0] : "";
  const vMake = vYear ? (vParts[1] || "") : (vParts[0] || "");
  const vModel = vYear ? vParts.slice(2).join(" ") : vParts.slice(1).join(" ");

  const newClient = {
    id: nextClientId++,
    firstName: first,
    lastName: last || "",
    phone: phone,
    email: email,
    vehicle: vehicle,
    source: source,
    since: since,
    lastVisit: "—",
    totalSpent: 0,
    visits: 0,
    status: "never_came",
    notes: notes,
    history: []
  };

  /* Persist to Supabase */
  if (window.db && window.db.clients) {
    window.db.clients.create({
      first_name: first,
      last_name: last || "",
      phone: phone,
      email: email,
      vehicle_year: vYear,
      vehicle_make: vMake,
      vehicle_model: vModel,
      source: source,
      notes: notes,
      status: "never_came"
    }).then(function(row) {
      if (row && row.id) {
        newClient.id = row.id;
      }
      clients.push(newClient);
      saveClients();
      closeAddClient();
      renderList();
    }).catch(function() {
      /* Fallback to local-only */
      clients.push(newClient);
      saveClients();
      closeAddClient();
      renderList();
    });
  } else {
    clients.push(newClient);
    saveClients();
    closeAddClient();
    renderList();
  }
}

/* ── Add Client & Schedule ────────────────────────────────────────────────── */

var pendingScheduleClient = null;

function addClientAndSchedule() {
  var first = document.getElementById("ac-first").value.trim();
  if (!first) return;

  var last = document.getElementById("ac-last").value.trim();
  var phone = document.getElementById("ac-phone").value.trim();
  var email = document.getElementById("ac-email").value.trim();
  var vehicle = document.getElementById("ac-vehicle").value.trim();
  var source = document.getElementById("ac-source").value;
  var notes = document.getElementById("ac-notes").value.trim();

  var vParts = vehicle.split(" ");
  var vYear = vParts.length >= 3 && /^\d{4}$/.test(vParts[0]) ? vParts[0] : "";
  var vMake = vYear ? (vParts[1] || "") : (vParts[0] || "");
  var vModel = vYear ? vParts.slice(2).join(" ") : vParts.slice(1).join(" ");

  var now = new Date();
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var since = months[now.getMonth()] + " " + now.getFullYear();

  var newClient = {
    id: nextClientId++, firstName: first, lastName: last || "",
    phone: phone, email: email, vehicle: vehicle, source: source,
    since: since, lastVisit: "—", totalSpent: 0, visits: 0,
    status: "never_came", notes: notes, history: []
  };

  if (window.db && window.db.clients) {
    window.db.clients.create({
      first_name: first, last_name: last || "", phone: phone, email: email,
      vehicle_year: vYear, vehicle_make: vMake, vehicle_model: vModel,
      source: source, notes: notes, status: "never_came"
    }).then(function(row) {
      if (row && row.id) newClient.id = row.id;
      clients.push(newClient);
      saveClients();
      closeAddClient();
      renderList();
      openScheduleModal(newClient);
    }).catch(function() {
      clients.push(newClient);
      saveClients();
      closeAddClient();
      renderList();
      openScheduleModal(newClient);
    });
  } else {
    clients.push(newClient);
    saveClients();
    closeAddClient();
    renderList();
    openScheduleModal(newClient);
  }
}

function openScheduleModal(client) {
  pendingScheduleClient = client;
  var modal = document.getElementById("schedule-modal");
  if (!modal) { createScheduleModal(); modal = document.getElementById("schedule-modal"); }

  document.getElementById("sched-client-name").textContent = client.firstName + " " + client.lastName;
  document.getElementById("sched-date").value = "";
  document.getElementById("sched-time").value = "";
  document.getElementById("sched-notes").value = "";
  document.getElementById("sched-error").textContent = "";

  // Load services
  var grid = document.getElementById("sched-service-grid");
  grid.innerHTML = '<p style="color:var(--text-faint);font-size:13px">Loading services...</p>';

  if (window.db && window.db.services) {
    window.db.services.list().then(function(svcs) {
      if (!svcs || svcs.length === 0) {
        grid.innerHTML = '<p style="color:#FFD60A;font-size:13px">No services found. Add services in the Services tab first.</p>';
        return;
      }
      grid.innerHTML = "";
      svcs.forEach(function(svc) {
        var btn = document.createElement("button");
        btn.className = "sched-svc-btn";
        btn.dataset.id = svc.id;
        btn.dataset.price = svc.price || "0";
        btn.innerHTML = '<span style="font-size:20px">' + (svc.icon || "🔧") + '</span>' +
          '<span style="font-size:13px;font-weight:600">' + svc.name + '</span>' +
          '<span style="font-size:12px;color:' + (svc.color || "#00C2FF") + '">' +
          (svc.pricing_type === "quote" ? "Quote" : "$" + svc.price) + '</span>';
        btn.onclick = function() {
          grid.querySelectorAll(".sched-svc-btn").forEach(function(b) { b.classList.remove("sched-svc-active"); });
          btn.classList.add("sched-svc-active");
        };
        grid.appendChild(btn);
      });
    });
  }

  modal.style.display = "flex";
}

function closeScheduleModal() {
  document.getElementById("schedule-modal").style.display = "none";
  pendingScheduleClient = null;
}

function submitSchedule() {
  var activeBtn = document.querySelector(".sched-svc-btn.sched-svc-active");
  var date = document.getElementById("sched-date").value;
  var time = document.getElementById("sched-time").value;
  var notes = document.getElementById("sched-notes").value.trim();
  var errEl = document.getElementById("sched-error");

  if (!activeBtn || !date || !time) {
    errEl.textContent = "Please select a service, date, and time.";
    return;
  }

  var client = pendingScheduleClient;
  if (!client) return;

  errEl.textContent = "";
  var submitBtn = document.getElementById("sched-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Scheduling...";

  // Get slug from profile (async)
  var slugPromise = (window.db && window.db.profile)
    ? window.db.profile.get().then(function(p) { return (p && p.slug) || ""; })
    : Promise.resolve("");

  slugPromise.then(function(slug) {
    fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug,
        serviceId: activeBtn.dataset.id,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        scheduledDate: date,
        scheduledTime: time,
        notes: notes,
        price: parseFloat(activeBtn.dataset.price) || 0
      })
    }).then(function(res) { return res.json(); })
      .then(function(result) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Schedule Appointment";
        if (result.error) {
          errEl.textContent = result.error;
        } else {
          closeScheduleModal();
          renderList();
        }
      })
      .catch(function() {
        submitBtn.disabled = false;
        submitBtn.textContent = "Schedule Appointment";
        errEl.textContent = "Something went wrong. Please try again.";
      });
  }); /* end slugPromise.then */
}

function createScheduleModal() {
  var modal = document.createElement("div");
  modal.id = "schedule-modal";
  modal.className = "modal-overlay";
  modal.style.display = "none";
  modal.onclick = function(e) { if (e.target === modal) closeScheduleModal(); };
  modal.innerHTML =
    '<div class="modal-box" style="max-width:480px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Schedule Appointment</h2>' +
        '<button class="modal-close" onclick="closeScheduleModal()">✕</button>' +
      '</div>' +
      '<p style="margin:0 0 20px;font-size:14px;color:var(--text-dim)">For <strong id="sched-client-name" style="color:var(--text)"></strong></p>' +
      '<p class="field-label">Service</p>' +
      '<div id="sched-service-grid" class="sched-service-grid"></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px">' +
        '<div><p class="field-label">Date</p><input id="sched-date" type="date" class="input"></div>' +
        '<div><p class="field-label">Time</p><input id="sched-time" type="time" class="input"></div>' +
      '</div>' +
      '<p class="field-label" style="margin-top:16px">Notes (optional)</p>' +
      '<textarea id="sched-notes" class="input" style="height:60px;resize:vertical" placeholder="Any notes for this appointment..."></textarea>' +
      '<p id="sched-error" style="color:#FF3366;font-size:13px;margin:12px 0 0"></p>' +
      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeScheduleModal()">Cancel</button>' +
        '<button id="sched-submit-btn" class="btn btn-primary" style="flex:1" onclick="submitSchedule()">Schedule Appointment</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(modal);
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  var result = loadClients();
  if (result && result.then) {
    result.then(function() { updateStats(); renderList(); });
  } else {
    updateStats(); renderList();
  }

  document.getElementById("client-search").addEventListener("input", renderList);

  // Close modal on overlay click
  document.getElementById("add-client-modal").addEventListener("click", function(e) {
    if (e.target === this) closeAddClient();
  });

  // Add "Add Client" button to page header
  const header = document.querySelector(".page-header");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  const addBtn = document.createElement("button");
  addBtn.className = "btn btn-primary";
  addBtn.style.cssText = "font-size:13px;padding:10px 20px";
  addBtn.textContent = "+ Add Client";
  addBtn.onclick = openAddClient;
  header.appendChild(addBtn);
});
