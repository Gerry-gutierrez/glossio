/* ─── Services Page ─────────────────────────────────────────────────────────── */

const ICON_OPTIONS = ["🚗","💧","✨","🔧","🪑","🧼","💎","🏆","⚡","🌟","🛞","🪣","🎯","🔥","🌊"];
const COLOR_OPTIONS = ["#00C2FF","#FF6B35","#A259FF","#FFD60A","#00E5A0","#FF3366","#FF9F1C","#2EC4B6"];

const STORAGE_KEY = "glossio_services";

let services = [];
let activeTab = null;
let editingId = null;
let deleteTargetId = null;
let nextId = 1;

// Modal state
let modalMode = "add"; // "add" or "edit"
let modalIcon = "🚗";
let modalColor = "#00C2FF";

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadServices() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      services = JSON.parse(data);
      nextId = services.reduce((max, s) => Math.max(max, s.id + 1), 1);
    }
  } catch (e) { services = []; }
}

function saveServices() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

/* ── Stats ───────────────────────────────────────────────────────────────── */

function updateStats() {
  document.getElementById("stat-total").textContent = services.length;
  if (services.length > 0) {
    const prices = services.map(s => parseFloat(s.price) || 0);
    document.getElementById("stat-min").textContent = "$" + Math.min(...prices).toFixed(2);
    document.getElementById("stat-max").textContent = "$" + Math.max(...prices).toFixed(2);
  } else {
    document.getElementById("stat-min").textContent = "$0";
    document.getElementById("stat-max").textContent = "$0";
  }
}

/* ── Render ──────────────────────────────────────────────────────────────── */

function render() {
  updateStats();
  const container = document.getElementById("services-container");
  const emptyState = document.getElementById("empty-state");

  if (services.length === 0) {
    container.innerHTML = "";
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";
  if (!activeTab || !services.find(s => s.id === activeTab)) {
    activeTab = services[0].id;
  }

  const active = services.find(s => s.id === activeTab);

  container.innerHTML = `
    <div class="svc-panel">
      <div class="svc-tabs">
        ${services.map(svc => `
          <button class="svc-tab ${svc.id === activeTab ? 'svc-tab-active' : ''}"
                  style="${svc.id === activeTab ? 'border-bottom-color:' + svc.color : ''}"
                  onclick="switchTab(${svc.id})">
            <span>${svc.icon}</span>
            <span>${svc.name}</span>
          </button>
        `).join("")}
      </div>
      <div class="svc-content">
        ${renderServiceView(active)}
      </div>
    </div>
  `;
}

function renderServiceView(svc) {
  return `
    <div class="svc-view">
      <div class="svc-view-header">
        <div style="display:flex;align-items:center;gap:16px">
          <div class="svc-icon-large" style="background:${svc.color}18;border-color:${svc.color}44">
            ${svc.icon}
          </div>
          <div>
            <h2 class="svc-view-name">${svc.name}</h2>
            <p class="svc-view-price" style="color:${svc.color}">$${svc.price}</p>
          </div>
        </div>
        <div class="svc-view-actions">
          <button class="btn-edit" onclick="openEditModal(${svc.id})">✏️ Edit</button>
          <button class="btn-remove" onclick="openDeleteModal(${svc.id})">🗑 Remove</button>
        </div>
      </div>

      <div class="svc-desc-box">
        <p class="svc-desc-label">What's Included</p>
        <p class="svc-desc-text">${svc.description || 'No description added yet.'}</p>
      </div>

      <div class="svc-price-divider">
        <div class="svc-price-line"></div>
        <span class="svc-price-label">Starting At</span>
        <div class="svc-price-line"></div>
      </div>
      <p class="svc-price-big" style="color:${svc.color}">$${svc.price}</p>
      <p class="svc-price-hint">This is what clients see on your public profile</p>
    </div>
  `;
}

/* ── Tab switching ───────────────────────────────────────────────────────── */

function switchTab(id) {
  activeTab = id;
  render();
}

/* ── Add Modal ───────────────────────────────────────────────────────────── */

function openAddModal() {
  modalMode = "add";
  editingId = null;
  modalIcon = "🚗";
  modalColor = "#00C2FF";
  document.getElementById("modal-title").textContent = "Add New Service";
  document.getElementById("modal-submit").textContent = "Add Service";
  document.getElementById("svc-name").value = "";
  document.getElementById("svc-price").value = "";
  document.getElementById("svc-desc").value = "";
  buildPickers();
  updatePreview();
  document.getElementById("service-modal").style.display = "flex";
}

/* ── Edit Modal ──────────────────────────────────────────────────────────── */

function openEditModal(id) {
  const svc = services.find(s => s.id === id);
  if (!svc) return;
  modalMode = "edit";
  editingId = id;
  modalIcon = svc.icon;
  modalColor = svc.color;
  document.getElementById("modal-title").textContent = "Edit — " + svc.name;
  document.getElementById("modal-submit").textContent = "Save Changes";
  document.getElementById("svc-name").value = svc.name;
  document.getElementById("svc-price").value = svc.price;
  document.getElementById("svc-desc").value = svc.description || "";
  buildPickers();
  updatePreview();
  document.getElementById("service-modal").style.display = "flex";
}

/* ── Pickers ─────────────────────────────────────────────────────────────── */

function buildPickers() {
  // Icon picker
  const iconPicker = document.getElementById("icon-picker");
  iconPicker.innerHTML = ICON_OPTIONS.map(ic => `
    <button class="picker-btn ${ic === modalIcon ? 'picker-btn-active' : ''}"
            onclick="pickIcon('${ic}')">${ic}</button>
  `).join("");

  // Color picker
  const colorPicker = document.getElementById("color-picker");
  colorPicker.innerHTML = COLOR_OPTIONS.map(c => `
    <button class="color-dot ${c === modalColor ? 'color-dot-active' : ''}"
            style="background:${c}" onclick="pickColor('${c}')"></button>
  `).join("");
}

function pickIcon(ic) {
  modalIcon = ic;
  buildPickers();
  updatePreview();
}

function pickColor(c) {
  modalColor = c;
  buildPickers();
  updatePreview();
}

/* ── Live Preview ────────────────────────────────────────────────────────── */

function updatePreview() {
  const name = document.getElementById("svc-name").value.trim();
  const price = document.getElementById("svc-price").value.trim();
  const preview = document.getElementById("live-preview");

  if (name) {
    preview.style.display = "block";
    preview.style.borderColor = modalColor + "33";
    preview.style.borderLeftColor = modalColor;
    document.getElementById("preview-icon").textContent = modalIcon;
    document.getElementById("preview-name").textContent = name;
    document.getElementById("preview-price").textContent = price ? "$" + price : "";
    document.getElementById("preview-price").style.color = modalColor;
  } else {
    preview.style.display = "none";
  }
}

/* ── Submit ───────────────────────────────────────────────────────────────── */

function submitService() {
  const name = document.getElementById("svc-name").value.trim();
  const price = document.getElementById("svc-price").value.trim();
  const desc = document.getElementById("svc-desc").value.trim();

  if (!name) return;

  if (modalMode === "add") {
    const svc = { id: nextId++, name, price: price || "0.00", description: desc, icon: modalIcon, color: modalColor };
    services.push(svc);
    activeTab = svc.id;
  } else {
    const svc = services.find(s => s.id === editingId);
    if (svc) {
      svc.name = name;
      svc.price = price || "0.00";
      svc.description = desc;
      svc.icon = modalIcon;
      svc.color = modalColor;
    }
  }

  saveServices();
  closeModal();
  render();
  showToast();
}

function closeModal() {
  document.getElementById("service-modal").style.display = "none";
}

/* ── Delete ───────────────────────────────────────────────────────────────── */

function openDeleteModal(id) {
  deleteTargetId = id;
  document.getElementById("delete-modal").style.display = "flex";
}

function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById("delete-modal").style.display = "none";
}

function confirmDelete() {
  services = services.filter(s => s.id !== deleteTargetId);
  if (activeTab === deleteTargetId && services.length > 0) {
    activeTab = services[0].id;
  }
  saveServices();
  closeDeleteModal();
  render();
  showToast();
}

/* ── Toast ────────────────────────────────────────────────────────────────── */

function showToast() {
  const toast = document.getElementById("save-toast");
  toast.style.display = "inline";
  setTimeout(() => { toast.style.display = "none"; }, 2000);
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadServices();
  render();

  // Live preview on input
  document.getElementById("svc-name").addEventListener("input", updatePreview);
  document.getElementById("svc-price").addEventListener("input", updatePreview);

  // Close modals on overlay click
  document.getElementById("service-modal").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
  });
  document.getElementById("delete-modal").addEventListener("click", function(e) {
    if (e.target === this) closeDeleteModal();
  });
});
