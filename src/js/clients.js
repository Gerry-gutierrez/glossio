/* ─── Clients CRM ──────────────────────────────────────────────────────────── */

const CLIENTS_KEY = "glossio_clients";

const STATUS_CONFIG = {
  pending:   { color: "#FFD60A", bg: "#FFD60A15", border: "#FFD60A33", label: "Pending" },
  confirmed: { color: "#00C2FF", bg: "#00C2FF15", border: "#00C2FF33", label: "Confirmed" },
  complete:  { color: "#00E5A0", bg: "#00E5A015", border: "#00E5A033", label: "Complete" },
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
          visits: parseInt(c.visits) || parseInt(c.visit_count) || 0,
          status: c.status || "never_came",
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
      const matchSearch = (c.firstName + " " + c.lastName + " " + c.vehicle + " " + c.email + " " + c.source)
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

  const history = c.history || [];

  detail.innerHTML = `
    <button class="back-btn" onclick="hideDetail()">← Back to Clients</button>

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
                    <p style="margin:0;font-size:12px;color:var(--text-dim)">${h.date}</p>
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

  clients.push({
    id: nextClientId++,
    firstName: first,
    lastName: last || "",
    phone: document.getElementById("ac-phone").value.trim(),
    email: document.getElementById("ac-email").value.trim(),
    vehicle: document.getElementById("ac-vehicle").value.trim(),
    source: document.getElementById("ac-source").value,
    since: since,
    lastVisit: "—",
    totalSpent: 0,
    visits: 0,
    status: "never_came",
    notes: document.getElementById("ac-notes").value.trim(),
    history: []
  });

  saveClients();
  closeAddClient();
  renderList();
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
