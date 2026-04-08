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
          vehicleYear: c.vehicle_year || "",
          vehicleMake: c.vehicle_make || "",
          vehicleModel: c.vehicle_model || "",
          vehicles: [],
          source: c.source || "",
          since: c.since || "",
          lastVisit: c.last_visit || c.lastVisit || "",
          totalSpent: parseFloat(c.total_spent) || parseFloat(c.totalSpent) || 0,
          visits: parseInt(c.total_visits) || parseInt(c.visits) || parseInt(c.visit_count) || 0,
          status: c.status || ((parseInt(c.total_visits) || 0) > 0 ? "active" : "never_came"),
          noShowCount: parseInt(c.no_show_count) || 0,
          notes: c.notes || "",
          history: c.history || []
        };
      });
      nextClientId = clients.reduce((max, c) => Math.max(max, (typeof c.id === "number" ? c.id : 0) + 1), 1);

      // Load vehicles for all clients
      return _loadAllVehicles().then(function() { return clients; });
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
      const matchFilter = currentFilter === "all" || c.status === currentFilter ||
        (currentFilter === "flaker" && (c.noShowCount || 0) > 0);
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
    const isFlaker = c.status === "flaker" || (c.noShowCount || 0) > 0;
    const statusColor = isFlaker ? "#FF8C42" : (isActive ? "#00E5A0" : "#FFD60A");
    const statusLabel = isFlaker ? "⚠ Flaker" : (isActive ? "Came Through" : "Never Came");
    const flakerBadge = (c.noShowCount || 0) > 0
      ? `<span class="client-status-badge" style="background:#FF8C4215;color:#FF8C42;border:1px solid #FF8C4233;margin-left:6px">⚠ ${c.noShowCount} no-show${c.noShowCount > 1 ? 's' : ''}</span>`
      : '';
    return `
      <div class="client-row" style="border-left:3px solid ${statusColor}" onclick="showDetail('${c.id}')">
        <div class="client-avatar" style="background:linear-gradient(135deg, ${statusColor}22, ${statusColor}11);border:1.5px solid ${statusColor}33;color:${statusColor}">
          ${c.firstName[0]}
        </div>
        <div class="client-info">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <p class="client-row-name">${c.firstName} ${c.lastName}</p>
            <span class="client-status-badge" style="background:${statusColor}15;color:${statusColor};border:1px solid ${statusColor}33">${statusLabel}</span>${flakerBadge && !isFlaker ? flakerBadge : ''}${isFlaker && c.noShowCount > 1 ? `<span class="client-status-badge" style="background:#FF8C4215;color:#FF8C42;border:1px solid #FF8C4233;margin-left:6px">${c.noShowCount}x</span>` : ''}
          </div>
          <p class="client-row-detail">${(c.vehicles && c.vehicles.length > 0) ? [c.vehicles[0].year, c.vehicles[0].make, c.vehicles[0].model].filter(Boolean).join(" ") : (c.vehicle || "No vehicle")}${c.vehicles && c.vehicles.length > 1 ? ' +' + (c.vehicles.length - 1) + ' more' : ''} · via ${c.source || "Unknown"}</p>
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
            <p style="margin:0 0 2px;font-size:13px;font-weight:600;color:var(--text-muted)">${_fmtUSDate(c.lastVisit)}</p>
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
          (c.email && a.client_email === c.email) ||
          (a.client_id && String(a.client_id) === String(c.id))
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

      /* Check for future recurring appointments */
      _checkRecurringAppts(c, appts);
    });
  }
}

function _fmtUSDate(dateStr) {
  if (!dateStr) return "—";
  var parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  return parseInt(parts[1],10) + "/" + parseInt(parts[2],10) + "/" + parts[0];
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

/* ── Multi-Vehicle Support ─────────────────────────────────────────────── */

function _loadAllVehicles() {
  if (!window.sbClient) return Promise.resolve();
  return window.sbClient.from("client_vehicles")
    .select("*")
    .then(function(r) {
      var vehicles = r.data || [];
      // Group by client_id
      clients.forEach(function(c) {
        c.vehicles = vehicles.filter(function(v) { return v.client_id === c.id; })
          .map(function(v) {
            return { id: v.id, year: v.vehicle_year || "", make: v.vehicle_make || "", model: v.vehicle_model || "" };
          });
        // If client has a legacy vehicle but no entries in client_vehicles, migrate it
        if (c.vehicles.length === 0 && c.vehicleYear) {
          _addVehicleToDb(c.id, c.vehicleYear, c.vehicleMake, c.vehicleModel).then(function(v) {
            if (v) c.vehicles.push({ id: v.id, year: v.vehicle_year, make: v.vehicle_make, model: v.vehicle_model });
          });
        }
      });
    }).catch(function() { /* table might not exist yet */ });
}

function _addVehicleToDb(clientId, year, make, model) {
  if (!window.sbClient) return Promise.resolve(null);
  return window.sbClient.from("client_vehicles")
    .insert({ client_id: clientId, vehicle_year: year || null, vehicle_make: make || null, vehicle_model: model || null })
    .select()
    .single()
    .then(function(r) { return r.data; })
    .catch(function() { return null; });
}

function addVehicleToClient(clientId) {
  var year = document.getElementById("av-year").value.trim();
  var make = document.getElementById("av-make").value.trim();
  var model = document.getElementById("av-vmodel").value.trim();
  if (!make && !model) return;

  var c = clients.find(function(cl) { return String(cl.id) === String(clientId); });
  if (!c) return;

  var btn = document.getElementById("av-save-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Adding..."; }

  _addVehicleToDb(clientId, year, make, model).then(function(v) {
    if (v) {
      c.vehicles.push({ id: v.id, year: v.vehicle_year || year, make: v.vehicle_make || make, model: v.vehicle_model || model });
      // Also update the primary vehicle fields if this is the first
      if (c.vehicles.length === 1) {
        c.vehicleYear = year; c.vehicleMake = make; c.vehicleModel = model;
        c.vehicle = [year, make, model].filter(Boolean).join(" ");
      }
    }
    // Re-render
    var detail = document.getElementById("client-detail");
    if (detail && viewingDetail) showDetail(c.id);
  });
}

function removeVehicle(vehicleId, clientId) {
  if (!confirm("Remove this vehicle?")) return;
  var c = clients.find(function(cl) { return String(cl.id) === String(clientId); });
  if (!c) return;

  if (window.sbClient) {
    window.sbClient.from("client_vehicles").delete().eq("id", vehicleId).then(function() {
      c.vehicles = c.vehicles.filter(function(v) { return v.id !== vehicleId; });
      // Update primary vehicle to first remaining
      if (c.vehicles.length > 0) {
        c.vehicleYear = c.vehicles[0].year; c.vehicleMake = c.vehicles[0].make; c.vehicleModel = c.vehicles[0].model;
        c.vehicle = [c.vehicles[0].year, c.vehicles[0].make, c.vehicles[0].model].filter(Boolean).join(" ");
      } else {
        c.vehicleYear = ""; c.vehicleMake = ""; c.vehicleModel = ""; c.vehicle = "";
      }
      var detail = document.getElementById("client-detail");
      if (detail && viewingDetail) showDetail(c.id);
    });
  }
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
            <div style="flex:1">
              <h2 style="margin:0 0 4px;font-size:22px;font-weight:700">${c.firstName} ${c.lastName}</h2>
              <p style="margin:0;font-size:13px;color:var(--text-dim)">Client since ${c.since || "Recently"}</p>
            </div>
            <button onclick="openEditClient('${c.id}')" style="background:none;border:none;cursor:pointer;padding:6px;border-radius:6px;color:var(--text-dim);transition:color 0.2s" title="Edit client info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </div>
          ${[
            { icon: "📱", label: "Phone", value: c.phone || "—" },
            { icon: "✉️", label: "Email", value: c.email || "—" },
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

          <!-- Vehicles Section -->
          <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">
            <span style="font-size:16px;margin-top:1px">🚗</span>
            <div style="flex:1">
              <p style="margin:0 0 6px;font-size:10px;color:var(--text-faint);letter-spacing:0.15em;text-transform:uppercase">Vehicles</p>
              ${(c.vehicles && c.vehicles.length > 0) ? c.vehicles.map(v => `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
                  <p style="margin:0;font-size:14px;color:#C8C4BC">${[v.year, v.make, v.model].filter(Boolean).join(" ")}</p>
                  <button onclick="removeVehicle('${v.id}','${c.id}')" style="background:none;border:none;color:var(--text-faint);cursor:pointer;font-size:14px;padding:2px 6px" title="Remove vehicle">✕</button>
                </div>
              `).join("") : '<p style="margin:0 0 6px;font-size:14px;color:#C8C4BC">' + (c.vehicle || "—") + '</p>'}
              <div id="add-vehicle-form" style="margin-top:8px">
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">
                  <input id="av-year" class="input" placeholder="Year" style="font-size:12px;padding:6px 8px">
                  <input id="av-make" class="input" placeholder="Make" style="font-size:12px;padding:6px 8px">
                  <input id="av-vmodel" class="input" placeholder="Model" style="font-size:12px;padding:6px 8px">
                </div>
                <button id="av-save-btn" class="btn" style="font-size:11px;padding:5px 12px;background:rgba(0,229,160,0.1);border:1px solid rgba(0,229,160,0.3);color:#00E5A0;cursor:pointer;border-radius:6px" onclick="addVehicleToClient('${c.id}')">+ Add Vehicle</button>
              </div>
            </div>
          </div>
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

        <!-- Cancel Recurring (shown dynamically if client has future recurring appts) -->
        <div id="cancel-recurring-container" style="margin-top:12px"></div>
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

/* ── Edit Client ───────────────────────────────────────────────────────── */

function openEditClient(id) {
  var c = clients.find(function(cl) { return String(cl.id) === String(id); });
  if (!c) return;

  var modal = document.getElementById("edit-client-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "edit-client-modal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  modal.innerHTML = `
    <div class="modal-box" style="max-width:480px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0;font-size:20px;font-weight:700">Edit Client</h2>
        <button class="modal-close" onclick="closeEditClient()">✕</button>
      </div>
      <div class="form-row">
        <div><p class="field-label">First Name</p><input id="ec-first" class="input" value="${c.firstName}"></div>
        <div><p class="field-label">Last Name</p><input id="ec-last" class="input" value="${c.lastName}"></div>
      </div>
      <div class="form-row">
        <div><p class="field-label">Phone</p><input id="ec-phone" class="input" value="${c.phone}"></div>
        <div><p class="field-label">Email</p><input id="ec-email" class="input" value="${c.email}"></div>
      </div>
      <p style="margin:12px 0 0;font-size:12px;color:var(--text-faint)">Vehicles are managed on the profile page below.</p>
      <p id="ec-error" style="color:#FF3366;font-size:13px;margin:12px 0 0;display:none"></p>
      <div style="display:flex;gap:10px;margin-top:20px">
        <button class="btn btn-ghost" onclick="closeEditClient()">Cancel</button>
        <button id="ec-save-btn" class="btn btn-primary" style="flex:1" onclick="saveEditClient('${c.id}')">Save Changes</button>
      </div>
    </div>
  `;
}

function closeEditClient() {
  var modal = document.getElementById("edit-client-modal");
  if (modal) modal.style.display = "none";
}

function saveEditClient(id) {
  var first = document.getElementById("ec-first").value.trim();
  var last = document.getElementById("ec-last").value.trim();
  var phone = document.getElementById("ec-phone").value.trim();
  var email = document.getElementById("ec-email").value.trim();

  if (!first) {
    var errEl = document.getElementById("ec-error");
    errEl.textContent = "First name is required.";
    errEl.style.display = "block";
    return;
  }

  var c = clients.find(function(cl) { return String(cl.id) === String(id); });
  if (!c) return;

  var oldPhone = c.phone;
  var oldEmail = c.email;

  // Update local client object
  c.firstName = first;
  c.lastName = last;
  c.phone = phone;
  c.email = email;
  saveClients();

  // Update Supabase clients table (vehicle fields stay as-is)
  var clientFields = {
    first_name: first,
    last_name: last,
    phone: phone,
    email: email
  };

  var saveBtn = document.getElementById("ec-save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  var clientUpdateDone = false;
  var apptsUpdateDone = false;

  function finishSave() {
    if (!clientUpdateDone || !apptsUpdateDone) return;
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
    closeEditClient();
    // Re-render detail view with updated data
    var detail = document.getElementById("client-detail");
    if (detail && viewingDetail) {
      _renderClientDetail(c, detail, []);
      if (window.db && window.db.appointments) {
        window.db.appointments.list().then(function(appts) {
          var clientAppts = (appts || []).filter(function(a) {
            return a.status === "complete" && (
              (c.phone && a.client_phone === c.phone) ||
              (c.email && a.client_email === c.email) ||
              (a.client_id && String(a.client_id) === String(c.id))
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
  }

  // 1) Update clients table
  if (window.db && window.db.clients) {
    window.db.clients.update(id, clientFields).then(function() {
      clientUpdateDone = true;
      finishSave();
    }).catch(function() {
      clientUpdateDone = true;
      finishSave();
    });
  } else {
    clientUpdateDone = true;
  }

  // 2) Update all appointments for this client (past + future)
  //    Match by client_id OR old phone OR old email to catch orphaned appts
  //    Only update name/phone/email — vehicle stays as whatever was booked
  var apptFields = {
    client_id: id,
    client_first_name: first,
    client_last_name: last,
    client_phone: phone,
    client_email: email
  };

  if (window.sbClient) {
    var uid = window.db && window.db._userId ? window.db._userId() : null;
    var pending = 0;
    var done = 0;
    function checkApptsDone() { if (done >= pending) { apptsUpdateDone = true; finishSave(); } }

    // Build an OR filter: client_id match, old phone match, old email match
    var filters = [];
    filters.push("client_id.eq." + id);
    if (oldPhone) filters.push("client_phone.eq." + oldPhone);
    if (oldEmail) filters.push("client_email.eq." + oldEmail);
    var orFilter = filters.join(",");

    var query = window.sbClient.from("appointments")
      .update(apptFields)
      .or(orFilter);
    if (uid) query = query.eq("profile_id", uid);
    query.select().then(function() {
      apptsUpdateDone = true;
      finishSave();
    }).catch(function() {
      apptsUpdateDone = true;
      finishSave();
    });
  } else {
    apptsUpdateDone = true;
  }

  if (!window.db && !window.sbClient) {
    closeEditClient();
    var detail = document.getElementById("client-detail");
    if (detail && viewingDetail) _renderClientDetail(c, detail, []);
  }
}

/* ── Add Client ──────────────────────────────────────────────────────────── */

function openAddClient() {
  document.getElementById("ac-first").value = "";
  document.getElementById("ac-last").value = "";
  document.getElementById("ac-phone").value = "";
  document.getElementById("ac-email").value = "";
  document.getElementById("ac-vyear").value = "";
  document.getElementById("ac-vmake").value = "";
  document.getElementById("ac-vmodel").value = "";
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
  const vYear = document.getElementById("ac-vyear").value.trim();
  const vMake = document.getElementById("ac-vmake").value.trim();
  const vModel = document.getElementById("ac-vmodel").value.trim();
  const vehicle = [vYear, vMake, vModel].filter(Boolean).join(" ");
  const source = document.getElementById("ac-source").value;
  const notes = document.getElementById("ac-notes").value.trim();

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
  var vYear = document.getElementById("ac-vyear").value.trim();
  var vMake = document.getElementById("ac-vmake").value.trim();
  var vModel = document.getElementById("ac-vmodel").value.trim();
  var vehicle = [vYear, vMake, vModel].filter(Boolean).join(" ");
  var source = document.getElementById("ac-source").value;
  var notes = document.getElementById("ac-notes").value.trim();

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

  // Reset to one-time mode
  schedType = "onetime";
  schedSelectedDay = null;
  setSchedType("onetime");

  document.getElementById("sched-client-name").textContent = client.firstName + " " + client.lastName;
  document.getElementById("sched-date").value = "";
  document.getElementById("sched-time").value = "";
  document.getElementById("sched-start-date").value = "";
  document.getElementById("sched-recurring-time").value = "";
  document.getElementById("sched-notes").value = "";
  document.getElementById("sched-error").textContent = "";
  document.querySelectorAll("#sched-day-picker .filter-tab").forEach(function(b) { b.classList.remove("active"); });

  // Add onchange listeners for preview updates
  var freqEl = document.getElementById("sched-frequency");
  var countEl = document.getElementById("sched-end-count");
  if (freqEl) freqEl.onchange = updateRecurringPreview;
  if (countEl) countEl.onchange = updateRecurringPreview;

  // Load vehicle picker
  var vehiclePicker = document.getElementById("sched-vehicle-picker");
  if (vehiclePicker) {
    if (client.vehicles && client.vehicles.length > 1) {
      vehiclePicker.style.display = "";
      var sel = document.getElementById("sched-vehicle-select");
      sel.innerHTML = "";
      client.vehicles.forEach(function(v, i) {
        var opt = document.createElement("option");
        opt.value = i;
        opt.textContent = [v.year, v.make, v.model].filter(Boolean).join(" ");
        sel.appendChild(opt);
      });
    } else {
      vehiclePicker.style.display = "none";
    }
  }

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
          btn.classList.toggle("sched-svc-active");
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
  var activeBtns = document.querySelectorAll(".sched-svc-btn.sched-svc-active");
  var notes = document.getElementById("sched-notes").value.trim();
  var errEl = document.getElementById("sched-error");

  if (activeBtns.length === 0) {
    errEl.textContent = "Please select at least one service.";
    return;
  }

  var client = pendingScheduleClient;
  if (!client) return;

  // Determine which vehicle to use
  var vYear = client.vehicleYear || "";
  var vMake = client.vehicleMake || "";
  var vModel = client.vehicleModel || "";
  var vehiclePickerEl = document.getElementById("sched-vehicle-picker");
  if (vehiclePickerEl && vehiclePickerEl.style.display !== "none" && client.vehicles && client.vehicles.length > 1) {
    var selIdx = parseInt(document.getElementById("sched-vehicle-select").value) || 0;
    var selVehicle = client.vehicles[selIdx];
    if (selVehicle) { vYear = selVehicle.year; vMake = selVehicle.make; vModel = selVehicle.model; }
  }

  var profileId = window.__glossio_user_id || "";
  var serviceNames = [];
  var totalPrice = 0;
  var firstServiceId = "";
  activeBtns.forEach(function(btn) {
    if (!firstServiceId) firstServiceId = btn.dataset.id;
    serviceNames.push(btn.querySelector("span:nth-child(2)")?.textContent || "Service");
    totalPrice += parseFloat(btn.dataset.price) || 0;
  });

  /* ── One-time appointment ── */
  if (schedType === "onetime") {
    var date = document.getElementById("sched-date").value;
    var time = document.getElementById("sched-time").value;
    if (!date) { errEl.textContent = "Please select a date."; return; }
    if (!time) { errEl.textContent = "Please select a time."; return; }

    errEl.textContent = "";
    var submitBtn = document.getElementById("sched-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Scheduling...";

    fetch("/.netlify/functions/create-booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: profileId,
        serviceId: firstServiceId,
        serviceName: serviceNames.join(" + "),
        servicePrice: totalPrice,
        firstName: client.firstName,
        lastName: client.lastName,
        phone: client.phone,
        email: client.email,
        vehicleYear: vYear,
        vehicleMake: vMake,
        vehicleModel: vModel,
        scheduledDate: date,
        scheduledTime: time,
        notes: notes,
        price: totalPrice
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
    return;
  }

  /* ── Recurring appointment ── */
  var startDate = document.getElementById("sched-start-date").value;
  var recurTime = document.getElementById("sched-recurring-time").value;
  var freq = parseInt(document.getElementById("sched-frequency").value);
  var count = parseInt(document.getElementById("sched-end-count").value);

  if (schedSelectedDay === null) { errEl.textContent = "Please select a day of the week."; return; }
  if (!startDate) { errEl.textContent = "Please select a start date."; return; }
  if (!recurTime) { errEl.textContent = "Please select a time."; return; }

  errEl.textContent = "";
  var submitBtn = document.getElementById("sched-submit-btn");
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating " + count + " appointments...";

  var dates = _generateRecurringDates(startDate, schedSelectedDay, freq, count);
  var recurrenceId = "rec_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);

  // Format time for display (e.g. "14:00" → "2:00 PM")
  var timeParts = recurTime.split(":");
  var h = parseInt(timeParts[0]);
  var ampm = h >= 12 ? "PM" : "AM";
  var h12 = h % 12 || 12;
  var displayTime = h12 + ":" + timeParts[1] + " " + ampm;

  // Build all appointment rows to insert directly into Supabase
  var uid = window.__glossio_user_id || "";
  var clientId = client.id || null;
  var detailerUsername = window.__glossio_company_name || window.__glossio_username || "";

  var apptRows = dates.map(function(d) {
    return {
      profile_id: uid,
      client_id: clientId,
      service_id: firstServiceId,
      detailer_username: detailerUsername,
      client_first_name: client.firstName,
      client_last_name: client.lastName || "",
      client_phone: client.phone || "",
      client_email: client.email || "",
      vehicle_year: vYear || null,
      vehicle_make: vMake || null,
      vehicle_model: vModel || null,
      service_name: serviceNames.join(" + "),
      service_price: String(totalPrice),
      appt_date: d,
      appt_time: displayTime,
      scheduled_date: d,
      scheduled_time: recurTime + ":00",
      status: "confirmed",
      notes: notes || null,
      recurrence_id: recurrenceId,
      price: totalPrice
    };
  });

  if (window.sbClient) {
    window.sbClient.from("appointments")
      .insert(apptRows)
      .select()
      .then(function(r) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Recurring Series";
        if (r.error) {
          errEl.textContent = r.error.message || "Failed to create recurring appointments.";
        } else {
          closeScheduleModal();
          renderList();
          // Re-render detail if viewing
          var c = pendingScheduleClient;
          if (c && viewingDetail) {
            var detail = document.getElementById("client-detail");
            if (detail) showDetail(c);
          }
        }
      })
      .catch(function() {
        submitBtn.disabled = false;
        submitBtn.textContent = "Create Recurring Series";
        errEl.textContent = "Something went wrong. Please try again.";
      });
  }
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

      /* ── Appointment type toggle ── */
      '<div id="sched-type-toggle" style="display:flex;gap:8px;margin-bottom:20px">' +
        '<button id="sched-type-onetime" class="filter-tab active" onclick="setSchedType(\'onetime\')" style="flex:1;text-align:center">One-Time</button>' +
        '<button id="sched-type-recurring" class="filter-tab" onclick="setSchedType(\'recurring\')" style="flex:1;text-align:center">Recurring</button>' +
      '</div>' +

      '<p class="field-label">Service</p>' +
      '<div id="sched-service-grid" class="sched-service-grid"></div>' +

      /* ── Vehicle picker (shown when client has multiple vehicles) ── */
      '<div id="sched-vehicle-picker" style="display:none;margin-top:16px">' +
        '<p class="field-label">Vehicle</p>' +
        '<select id="sched-vehicle-select" class="input"></select>' +
      '</div>' +

      /* ── One-time date/time (existing) ── */
      '<div id="sched-onetime-fields" style="margin-top:16px">' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<div><p class="field-label">Date</p><input id="sched-date" type="date" class="input"></div>' +
          '<div><p class="field-label">Time</p><input id="sched-time" type="time" class="input"></div>' +
        '</div>' +
      '</div>' +

      /* ── Recurring fields ── */
      '<div id="sched-recurring-fields" style="display:none;margin-top:16px">' +
        '<p class="field-label">Repeats</p>' +
        '<select id="sched-frequency" class="input" style="margin-bottom:12px">' +
          '<option value="1">Every week</option>' +
          '<option value="2" selected>Every 2 weeks</option>' +
          '<option value="3">Every 3 weeks</option>' +
          '<option value="4">Every 4 weeks (Monthly)</option>' +
        '</select>' +
        '<p class="field-label">On</p>' +
        '<div id="sched-day-picker" style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap">' +
          '<button class="filter-tab" data-day="1" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Mon</button>' +
          '<button class="filter-tab" data-day="2" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Tue</button>' +
          '<button class="filter-tab" data-day="3" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Wed</button>' +
          '<button class="filter-tab" data-day="4" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Thu</button>' +
          '<button class="filter-tab" data-day="5" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Fri</button>' +
          '<button class="filter-tab" data-day="6" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Sat</button>' +
          '<button class="filter-tab" data-day="0" onclick="pickSchedDay(this)" style="min-width:40px;text-align:center">Sun</button>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
          '<div><p class="field-label">Starting</p><input id="sched-start-date" type="date" class="input"></div>' +
          '<div><p class="field-label">At</p><input id="sched-recurring-time" type="time" class="input"></div>' +
        '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">' +
          '<div>' +
            '<p class="field-label">Ends after</p>' +
            '<select id="sched-end-count" class="input">' +
              '<option value="4">4 appointments</option>' +
              '<option value="6">6 appointments</option>' +
              '<option value="8">8 appointments</option>' +
              '<option value="10">10 appointments</option>' +
              '<option value="12" selected>12 appointments</option>' +
              '<option value="16">16 appointments</option>' +
              '<option value="24">24 appointments</option>' +
            '</select>' +
          '</div>' +
          '<div>' +
            '<p class="field-label">Preview</p>' +
            '<p id="sched-preview" style="font-size:12px;color:var(--text-dim);margin:8px 0 0;line-height:1.5">—</p>' +
          '</div>' +
        '</div>' +
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

var schedType = "onetime";
var schedSelectedDay = null;

function setSchedType(type) {
  schedType = type;
  var oneBtn = document.getElementById("sched-type-onetime");
  var recBtn = document.getElementById("sched-type-recurring");
  oneBtn.className = "filter-tab" + (type === "onetime" ? " active" : "");
  recBtn.className = "filter-tab" + (type === "recurring" ? " active" : "");
  // Apply inline styles for clear visual feedback
  oneBtn.style.background = type === "onetime" ? "rgba(0,194,255,0.15)" : "";
  oneBtn.style.color = type === "onetime" ? "#00C2FF" : "";
  oneBtn.style.borderColor = type === "onetime" ? "#00C2FF" : "";
  recBtn.style.background = type === "recurring" ? "rgba(0,194,255,0.15)" : "";
  recBtn.style.color = type === "recurring" ? "#00C2FF" : "";
  recBtn.style.borderColor = type === "recurring" ? "#00C2FF" : "";
  document.getElementById("sched-onetime-fields").style.display = type === "onetime" ? "" : "none";
  document.getElementById("sched-recurring-fields").style.display = type === "recurring" ? "" : "none";
  document.getElementById("sched-submit-btn").textContent = type === "onetime" ? "Schedule Appointment" : "Create Recurring Series";
  if (type === "recurring") updateRecurringPreview();
}

function pickSchedDay(btn) {
  document.querySelectorAll("#sched-day-picker .filter-tab").forEach(function(b) {
    b.classList.remove("active");
    b.style.background = "";
    b.style.color = "";
    b.style.borderColor = "";
  });
  btn.classList.add("active");
  btn.style.background = "rgba(0,194,255,0.15)";
  btn.style.color = "#00C2FF";
  btn.style.borderColor = "#00C2FF";
  schedSelectedDay = parseInt(btn.dataset.day);
  updateRecurringPreview();
}

function updateRecurringPreview() {
  var freq = parseInt(document.getElementById("sched-frequency")?.value || "2");
  var count = parseInt(document.getElementById("sched-end-count")?.value || "12");
  var preview = document.getElementById("sched-preview");
  if (!preview) return;
  if (schedSelectedDay === null) { preview.textContent = "Select a day"; return; }

  var dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var totalWeeks = freq * count;
  var months = Math.round(totalWeeks / 4.3);
  preview.textContent = "Every " + (freq === 1 ? "" : freq + " ") + "week" + (freq > 1 ? "s" : "") +
    " on " + dayNames[schedSelectedDay] + " — " + count + " appts over ~" + months + " months";
}

function _generateRecurringDates(startDate, dayOfWeek, freqWeeks, count) {
  var dates = [];
  var d = new Date(startDate + "T12:00:00");
  // Move to the first occurrence of the selected day
  var currentDay = d.getDay();
  var daysUntil = (dayOfWeek - currentDay + 7) % 7;
  if (daysUntil === 0 && d <= new Date()) daysUntil = 7 * freqWeeks;
  d.setDate(d.getDate() + daysUntil);

  for (var i = 0; i < count; i++) {
    var yyyy = d.getFullYear();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    dates.push(yyyy + "-" + mm + "-" + dd);
    d.setDate(d.getDate() + (7 * freqWeeks));
  }
  return dates;
}

/* ── Recurring Appointment Management ──────────────────────────────────── */

function _checkRecurringAppts(c, allAppts) {
  var container = document.getElementById("cancel-recurring-container");
  if (!container) return;

  var today = new Date().toISOString().split("T")[0];
  var futureRecurring = (allAppts || []).filter(function(a) {
    return a.recurrence_id &&
      (a.status === "pending" || a.status === "confirmed") &&
      a.appt_date >= today &&
      (String(a.client_id) === String(c.id) ||
       (c.phone && a.client_phone === c.phone));
  });

  if (futureRecurring.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML =
    '<button class="btn" style="font-size:12px;padding:9px 20px;margin-top:4px;background:#FF336615;border:1px solid #FF336633;color:#FF3366;width:100%;font-weight:600" ' +
    'onclick="cancelRecurringAppts(\'' + c.id + '\',\'' + futureRecurring[0].recurrence_id + '\')">' +
    'Cancel Recurring Appointments (' + futureRecurring.length + ' remaining)</button>';
}

function cancelRecurringAppts(clientId, recurrenceId) {
  if (!confirm("This will permanently delete all future recurring appointments for this client. Past and completed appointments will stay on record. Continue?")) return;

  var today = new Date().toISOString().split("T")[0];

  if (window.sbClient) {
    window.sbClient.from("appointments")
      .delete()
      .eq("recurrence_id", recurrenceId)
      .gte("appt_date", today)
      .in("status", ["pending", "confirmed"])
      .select()
      .then(function(r) {
        // Remove the button
        var container = document.getElementById("cancel-recurring-container");
        if (container) container.innerHTML = '<p style="color:var(--success);font-size:13px;margin:8px 0">Recurring appointments cancelled.</p>';
        // Refresh the detail view
        var c = clients.find(function(cl) { return String(cl.id) === String(clientId); });
        if (c) {
          setTimeout(function() { showDetail(c.id); }, 1500);
        }
      })
      .catch(function() {
        alert("Something went wrong. Please try again.");
      });
  }
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
