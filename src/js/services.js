/* ─── Services Page ─────────────────────────────────────────────────────────── */
/* All CRUD operations go through window.db (Supabase when online,             */
/* localStorage fallback when offline). This ensures services exist in         */
/* Supabase for the public booking flow.                                       */

const ICON_OPTIONS = ["🚗","💧","✨","🔧","🪑","🧼","💎","🏆","⚡","🌟","🛞","🪣","🎯","🔥","🌊"];
const COLOR_OPTIONS = ["#00C2FF","#FF6B35","#A259FF","#FFD60A","#00E5A0","#FF3366","#FF9F1C","#2EC4B6"];

const STORAGE_KEY = "glossio_services";

let services = [];
let activeTab = null;
let editingId = null;
let deleteTargetId = null;

// Modal state
let modalMode = "add"; // "add" or "edit"
let modalIcon = "🚗";
let modalColor = "#00C2FF";
let modalPricingType = "fixed"; // "fixed" or "quote"

/* ── Persistence ─────────────────────────────────────────────────────────── */

/** Load services: try Supabase first, fall back to localStorage */
function loadServices() {
  /* Load localStorage immediately so UI renders fast */
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) services = JSON.parse(data);
  } catch (e) { services = []; }

  /* Then sync with Supabase once auth is ready */
  waitForAuth(function() {
    if (!window.db || !window.db.isOnline()) return;

    window.db.services.list().then(function(sbServices) {
      if (sbServices && sbServices.length > 0) {
        /* Supabase has data — use it as source of truth */
        services = sbServices.map(normalizeSvc);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
        render();
      } else if (services.length > 0) {
        /* Supabase is empty but localStorage has data — migrate */
        migrateToSupabase();
      }
    }).catch(function(err) {
      console.warn("Failed to load services from Supabase:", err);
    });
  });
}

/** Wait for window.db.isOnline() to become true (auth ready), then call fn */
function waitForAuth(fn) {
  var attempts = 0;
  var check = function() {
    attempts++;
    if (window.db && window.db.isOnline()) {
      fn();
    } else if (attempts < 25) {
      setTimeout(check, 200); /* retry for up to 5 seconds */
    }
  };
  setTimeout(check, 100);
}

/** Normalize a service object from Supabase format */
function normalizeSvc(s) {
  return {
    id: s.id,
    name: s.name,
    price: String(s.price || "0.00"),
    description: s.description || "",
    icon: s.icon || "🚗",
    color: s.color || "#00C2FF",
    is_active: s.is_active !== false,
    sort_order: s.sort_order || 0,
    pricing_type: s.pricing_type || "fixed"
  };
}

/** Migrate localStorage services to Supabase (one-time) */
function migrateToSupabase() {
  if (!window.db || !window.db.isOnline()) return;

  var migrated = 0;
  var total = services.length;

  services.forEach(function(svc, idx) {
    window.db.services.create({
      name: svc.name,
      price: parseFloat(svc.price) || 0,
      description: svc.description || "",
      icon: svc.icon || "🚗",
      color: svc.color || "#00C2FF",
      is_active: true,
      sort_order: idx
    }).then(function(created) {
      if (created && created.id) {
        /* Update local service with Supabase UUID */
        svc.id = created.id;
        svc.is_active = true;
        migrated++;
        if (migrated === total) {
          /* All migrated — save updated IDs to localStorage */
          localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
          render();
          console.log("Migrated " + total + " services to Supabase");
        }
      }
    }).catch(function(err) {
      console.error("Failed to migrate service:", svc.name, err);
    });
  });
}

function saveServicesToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
}

/* ── Stats ───────────────────────────────────────────────────────────────── */

function updateStats() {
  document.getElementById("stat-total").textContent = services.length;
  if (services.length > 0) {
    const prices = services.filter(s => s.pricing_type !== 'quote').map(s => parseFloat(s.price) || 0);
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

  container.innerHTML = `
    <div class="svc-table" style="background:var(--bg-card);border:1px solid var(--border);border-radius:12px;overflow:hidden">
      <div class="svc-table-header" style="display:grid;grid-template-columns:2fr 100px 3fr 80px 80px;gap:12px;padding:14px 20px;border-bottom:1px solid var(--border);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-faint)">
        <span>Service</span>
        <span>Price</span>
        <span>Description</span>
        <span style="text-align:center">Edit</span>
        <span style="text-align:center">Delete</span>
      </div>
      ${services.map((svc, i) => `
        <div class="svc-table-row" style="display:grid;grid-template-columns:2fr 100px 3fr 80px 80px;gap:12px;align-items:center;padding:16px 20px;${i < services.length - 1 ? 'border-bottom:1px solid var(--border)' : ''};transition:background .15s" onmouseover="this.style.background='var(--bg-hover)'" onmouseout="this.style.background=''">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">${svc.icon}</span>
            <span style="font-size:14px;font-weight:600">${svc.name}</span>
          </div>
          <span style="font-size:15px;font-weight:700;color:${svc.pricing_type === 'quote' ? 'var(--primary)' : 'var(--success)'}">${svc.pricing_type === 'quote' ? 'Request Quote' : '$' + svc.price}</span>
          <span style="font-size:13px;color:var(--text-dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${svc.description || '<span style="color:var(--text-faint);font-style:italic">No description</span>'}</span>
          <div style="text-align:center">
            <button onclick="openEditModal('${svc.id}')" style="background:none;border:1px solid var(--border);border-radius:6px;padding:6px 14px;font-size:12px;color:var(--primary);cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border)'">Edit</button>
          </div>
          <div style="text-align:center">
            <button onclick="openDeleteModal('${svc.id}')" style="background:none;border:1px solid var(--border);border-radius:6px;padding:6px 14px;font-size:12px;color:#FF3366;cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='#FF3366'" onmouseout="this.style.borderColor='var(--border)'">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ── Tab switching ───────────────────────────────────────────────────────── */

function switchTab(id) {
  activeTab = id;
  render();
}

/* ── Add Modal ───────────────────────────────────────────────────────────── */

function setPricingType(type) {
  modalPricingType = type;
  var fixedBtn = document.getElementById("toggle-fixed");
  var quoteBtn = document.getElementById("toggle-quote");
  var priceWrap = document.getElementById("price-field-wrap");

  if (type === "quote") {
    fixedBtn.classList.remove("pricing-toggle-active");
    quoteBtn.classList.add("pricing-toggle-active");
    priceWrap.style.display = "none";
  } else {
    fixedBtn.classList.add("pricing-toggle-active");
    quoteBtn.classList.remove("pricing-toggle-active");
    priceWrap.style.display = "block";
  }
  updatePreview();
}

function openAddModal() {
  modalMode = "add";
  editingId = null;
  modalIcon = "🚗";
  modalColor = "#00C2FF";
  modalPricingType = "fixed";
  document.getElementById("modal-title").textContent = "Add New Service";
  document.getElementById("modal-submit").textContent = "Add Service";
  document.getElementById("svc-name").value = "";
  document.getElementById("svc-price").value = "";
  document.getElementById("svc-desc").value = "";
  var durEl = document.getElementById("svc-duration");
  if (durEl) durEl.value = "";
  _showDurationField();
  buildPickers();
  setPricingType("fixed");
  updatePreview();
  document.getElementById("service-modal").style.display = "flex";
}

/* ── Edit Modal ──────────────────────────────────────────────────────────── */

function openEditModal(id) {
  const svc = services.find(s => s.id === id || String(s.id) === String(id));
  if (!svc) return;
  modalMode = "edit";
  editingId = id;
  modalIcon = svc.icon;
  modalColor = svc.color;
  modalPricingType = svc.pricing_type || "fixed";
  document.getElementById("modal-title").textContent = "Edit — " + svc.name;
  document.getElementById("modal-submit").textContent = "Save Changes";
  document.getElementById("svc-name").value = svc.name;
  document.getElementById("svc-price").value = svc.price;
  document.getElementById("svc-desc").value = svc.description || "";
  var durEl = document.getElementById("svc-duration");
  if (durEl) durEl.value = svc.duration_minutes || "";
  _showDurationField();
  buildPickers();
  setPricingType(modalPricingType);
  updatePreview();
  document.getElementById("service-modal").style.display = "flex";
}

function _showDurationField() {
  var wrap = document.getElementById("duration-field-wrap");
  if (!wrap) return;
  // Check if time blocks are enabled from localStorage settings
  try {
    var s = JSON.parse(localStorage.getItem("glossio_settings") || "{}");
    wrap.style.display = s.timeBlocksEnabled ? "" : "none";
  } catch(e) { wrap.style.display = "none"; }
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
    if (modalPricingType === "quote") {
      document.getElementById("preview-price").textContent = "Request a Quote";
    } else {
      document.getElementById("preview-price").textContent = price ? "$" + price : "";
    }
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
  const durVal = document.getElementById("svc-duration")?.value;
  const duration = durVal ? parseInt(durVal) : null;

  if (!name) return;

  if (modalMode === "add") {
    var svcData = {
      name: name,
      price: modalPricingType === "quote" ? 0 : (parseFloat(price) || 0),
      description: desc,
      icon: modalIcon,
      color: modalColor,
      pricing_type: modalPricingType,
      is_active: true,
      sort_order: services.length,
      duration_minutes: duration
    };

    /* Write to Supabase via window.db (falls back to localStorage if offline) */
    window.db.services.create(svcData).then(function(created) {
      var svc = normalizeSvc(created || svcData);
      services.push(svc);
      activeTab = svc.id;
      saveServicesToLocalStorage();
      closeModal();
      render();
      showToast();
    }).catch(function(err) {
      console.error("Failed to create service:", err);
      /* Still add locally so UI doesn't appear broken */
      svcData.id = "local-" + Date.now();
      svcData.price = price || "0.00";
      services.push(svcData);
      activeTab = svcData.id;
      saveServicesToLocalStorage();
      closeModal();
      render();
      showToast();
    });
  } else {
    var svc = services.find(s => s.id === editingId || String(s.id) === String(editingId));
    if (svc) {
      var updates = {
        name: name,
        price: modalPricingType === "quote" ? 0 : (parseFloat(price) || 0),
        description: desc,
        icon: modalIcon,
        color: modalColor,
        pricing_type: modalPricingType,
        duration_minutes: duration
      };

      /* Update in Supabase */
      window.db.services.update(svc.id, updates).then(function() {
        svc.name = name;
        svc.price = modalPricingType === "quote" ? "0" : (price || "0.00");
        svc.description = desc;
        svc.icon = modalIcon;
        svc.color = modalColor;
        svc.pricing_type = modalPricingType;
        svc.duration_minutes = duration;
        saveServicesToLocalStorage();
        closeModal();
        render();
        showToast();
      }).catch(function(err) {
        console.error("Failed to update service:", err);
        /* Update locally anyway */
        svc.name = name;
        svc.price = modalPricingType === "quote" ? "0" : (price || "0.00");
        svc.description = desc;
        svc.icon = modalIcon;
        svc.color = modalColor;
        svc.pricing_type = modalPricingType;
        svc.duration_minutes = duration;
        saveServicesToLocalStorage();
        closeModal();
        render();
        showToast();
      });
    }
  }
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
  var targetId = deleteTargetId;

  /* Delete from Supabase */
  window.db.services.remove(targetId).then(function() {
    services = services.filter(s => s.id !== targetId && String(s.id) !== String(targetId));
    if (activeTab === targetId && services.length > 0) {
      activeTab = services[0].id;
    }
    saveServicesToLocalStorage();
    closeDeleteModal();
    render();
    showToast();
  }).catch(function(err) {
    console.error("Failed to delete service:", err);
    /* Delete locally anyway */
    services = services.filter(s => s.id !== targetId && String(s.id) !== String(targetId));
    if (activeTab === targetId && services.length > 0) {
      activeTab = services[0].id;
    }
    saveServicesToLocalStorage();
    closeDeleteModal();
    render();
    showToast();
  });
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
  var pModal = document.getElementById("product-modal");
  if (pModal) {
    pModal.addEventListener("click", function(e) {
      if (e.target === this) closeProductModal();
    });
  }

  /* Load products state */
  loadProductsState();
});

/* ─── Products ─────────────────────────────────────────────────────────── */

var productsEnabled = false;
var productsList = [];
var pendingProductFile = null;
var pendingProductDataUrl = null;
var editingProductId = null;

function escP(str) {
  var d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

function loadProductsState() {
  waitForAuth(function() {
    if (!window.db || !window.db.isOnline()) return;

    /* Load products_enabled flag from profile */
    window.db.profile.get().then(function(sbP) {
      if (sbP) {
        productsEnabled = !!sbP.products_enabled;
        updateProductsToggleUI();
        renderProductsSection();
      }
    });

    /* Load product list */
    if (window.db.products) {
      window.db.products.list().then(function(sbProducts) {
        if (sbProducts) {
          productsList = sbProducts;
          renderProductsSection();
        }
      });
    }
  });
}

function updateProductsToggleUI() {
  var input = document.getElementById("products-toggle-input");
  var track = document.getElementById("products-toggle-track");
  var thumb = document.getElementById("products-toggle-thumb");
  if (!input || !track || !thumb) return;
  input.checked = productsEnabled;
  track.style.background = productsEnabled ? "#00C2FF" : "#333";
  thumb.style.left = productsEnabled ? "25px" : "3px";
}

function toggleProductsEnabled(checked) {
  productsEnabled = checked;
  updateProductsToggleUI();
  if (window.db && window.db.isOnline()) {
    window.db.profile.update({ products_enabled: checked });
  }
  renderProductsSection();
  showToast();
}

function renderProductsSection() {
  var container = document.getElementById("products-container");
  if (!container) return;

  if (!productsEnabled) {
    container.innerHTML = '<p style="font-size:13px;color:var(--text-faint);margin:0">Toggle on to start adding products your clients can browse.</p>';
    return;
  }

  var html = '<div style="display:flex;gap:8px;margin-bottom:16px">' +
    '<button class="btn btn-primary" style="font-size:12px;padding:8px 16px" onclick="openAddProduct()">+ Add Product</button>' +
  '</div>';

  if (productsList.length === 0) {
    html += '<div style="text-align:center;padding:24px 0;border:1px dashed var(--border);border-radius:12px">' +
      '<p style="font-size:32px;margin:0 0 8px">🛒</p>' +
      '<p style="font-size:13px;color:var(--text-dim);margin:0 0 4px">No products yet</p>' +
      '<p style="font-size:11px;color:var(--text-faint);margin:0">Add sprays, cleaners, merch — anything you sell.</p>' +
    '</div>';
  } else {
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
    productsList.forEach(function(prod) {
      html +=
        '<div style="background:var(--bg);border:1px solid var(--border);border-radius:12px;overflow:hidden;position:relative">' +
          '<div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:2">' +
            '<button style="padding:4px 8px;font-size:11px;background:rgba(10,10,15,0.85);border:1px solid #333;color:var(--primary);border-radius:6px;cursor:pointer" onclick="openEditProduct(\'' + prod.id + '\')">Edit</button>' +
            '<button style="padding:4px 8px;font-size:11px;background:rgba(10,10,15,0.85);border:1px solid #333;color:#FF3366;border-radius:6px;cursor:pointer" onclick="deleteProductConfirm(\'' + prod.id + '\')">✕</button>' +
          '</div>' +
          (prod.image_url
            ? '<div style="width:100%;aspect-ratio:1;overflow:hidden"><img src="' + escP(prod.image_url) + '" alt="' + escP(prod.name) + '" style="width:100%;height:100%;object-fit:cover"></div>'
            : '<div style="width:100%;aspect-ratio:1;background:#111118;display:flex;align-items:center;justify-content:center"><span style="font-size:40px;color:#333">🛒</span></div>'
          ) +
          '<div style="padding:12px">' +
            '<p style="margin:0 0 4px;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escP(prod.name) + '</p>' +
            '<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#00C2FF">$' + escP(String(prod.price || '0')) + '</p>' +
            (prod.description ? '<p style="margin:0;font-size:11px;color:var(--text-faint);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + escP(prod.description) + '</p>' : '') +
          '</div>' +
        '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

function openAddProduct() {
  editingProductId = null;
  pendingProductFile = null;
  pendingProductDataUrl = null;
  document.getElementById("product-modal-title").textContent = "Add Product";
  document.getElementById("product-submit-btn").textContent = "Add Product";
  document.getElementById("product-name").value = "";
  document.getElementById("product-price").value = "";
  document.getElementById("product-desc").value = "";
  var preview = document.getElementById("product-upload-preview");
  var placeholder = document.getElementById("product-upload-placeholder");
  if (preview) { preview.style.display = "none"; preview.src = ""; }
  if (placeholder) placeholder.style.display = "";
  document.getElementById("product-modal").style.display = "flex";
}

function openEditProduct(id) {
  var prod = productsList.find(function(p) { return p.id === id; });
  if (!prod) return;
  editingProductId = id;
  pendingProductFile = null;
  pendingProductDataUrl = null;
  document.getElementById("product-modal-title").textContent = "Edit Product";
  document.getElementById("product-submit-btn").textContent = "Save Changes";
  document.getElementById("product-name").value = prod.name || "";
  document.getElementById("product-price").value = prod.price || "";
  document.getElementById("product-desc").value = prod.description || "";
  var preview = document.getElementById("product-upload-preview");
  var placeholder = document.getElementById("product-upload-placeholder");
  if (prod.image_url && preview) {
    preview.src = prod.image_url;
    preview.style.display = "block";
    if (placeholder) placeholder.style.display = "none";
  } else {
    if (preview) { preview.style.display = "none"; preview.src = ""; }
    if (placeholder) placeholder.style.display = "";
  }
  document.getElementById("product-modal").style.display = "flex";
}

function closeProductModal() {
  document.getElementById("product-modal").style.display = "none";
}

function handleProductFile(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showToast();
    return;
  }
  pendingProductFile = file;
  var reader = new FileReader();
  reader.onload = function(e) {
    pendingProductDataUrl = e.target.result;
    var preview = document.getElementById("product-upload-preview");
    var placeholder = document.getElementById("product-upload-placeholder");
    if (preview) { preview.src = pendingProductDataUrl; preview.style.display = "block"; }
    if (placeholder) placeholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}

function submitProduct() {
  var name = document.getElementById("product-name").value.trim();
  var price = document.getElementById("product-price").value.trim();
  var desc = document.getElementById("product-desc").value.trim();

  if (!name || !price) {
    showToast();
    return;
  }

  var btn = document.getElementById("product-submit-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

  var saveData = {
    name: name,
    price: parseFloat(price) || 0,
    description: desc || null
  };
  if (!editingProductId) saveData.sort_order = productsList.length;

  /* Upload image first if we have one */
  var uploadPromise;
  if (pendingProductFile && window.db && window.db.isOnline()) {
    var uid = window.__glossio_user_id;
    var ext = pendingProductFile.name.split(".").pop() || "jpg";
    var path = uid + "/products/" + Date.now() + "." + ext;
    uploadPromise = window.db.storage.upload("work-photos", path, pendingProductFile)
      .then(function() {
        saveData.image_url = window.db.storage.getPublicUrl("work-photos", path);
      });
  } else {
    uploadPromise = Promise.resolve();
  }

  uploadPromise.then(function() {
    if (editingProductId) {
      return window.db.products.update(editingProductId, saveData).then(function() {
        productsList = productsList.map(function(p) {
          return p.id === editingProductId ? Object.assign(p, saveData) : p;
        });
      });
    } else {
      return window.db.products.create(saveData).then(function(created) {
        if (created) productsList.push(created);
      });
    }
  }).then(function() {
    closeProductModal();
    renderProductsSection();
    showToast();
    if (btn) { btn.disabled = false; btn.textContent = editingProductId ? "Save Changes" : "Add Product"; }
  }).catch(function(err) {
    console.error("Product save error:", err);
    if (btn) { btn.disabled = false; btn.textContent = editingProductId ? "Save Changes" : "Add Product"; }
    showToast();
  });
}

function deleteProductConfirm(id) {
  if (!confirm("Remove this product?")) return;
  window.db.products.remove(id).then(function() {
    productsList = productsList.filter(function(p) { return p.id !== id; });
    renderProductsSection();
    showToast();
  }).catch(function() {
    showToast();
  });
}
