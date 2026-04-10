/* ─── Profile Management ─────────────────────────────────────────────────── */
/* All saves go through window.db (Supabase when online, localStorage         */
/* fallback when offline). Photos upload to Supabase Storage.                 */

const PROFILE_KEY = "glossio_profile";
const PHOTOS_KEY = "glossio_work_photos";

const DEFAULT_PROFILE = {
  displayName: "Your Business",
  tagline: "Professional Auto Detailing",
  instagram: "",
  city: "",
  state: "",
  bio: "",
};

let profile = {};
let photos = [];
let nextPhotoId = 100;
let removeMode = false;
let previewMode = false;
let avatarUrl = null;
let uploadingAvatar = false;
let productsEnabled = false;
let productsList = [];
let pendingProductFile = null;
let pendingProductDataUrl = null;

function escHtml(str) {
  const d = document.createElement("div");
  d.textContent = str || "";
  return d.innerHTML;
}

/* ── Persistence ─────────────────────────────────────────────────────────── */

function loadProfile() {
  /* Load from localStorage first for instant UI */
  try {
    const d = localStorage.getItem(PROFILE_KEY);
    profile = d ? { ...DEFAULT_PROFILE, ...JSON.parse(d) } : { ...DEFAULT_PROFILE };
  } catch (e) { profile = { ...DEFAULT_PROFILE }; }
  try {
    const p = localStorage.getItem(PHOTOS_KEY);
    photos = p ? JSON.parse(p) : [];
    nextPhotoId = photos.reduce((max, ph) => Math.max(max, (typeof ph.id === "number" ? ph.id + 1 : 100)), 100);
  } catch (e) { photos = []; }

  /* Sync from Supabase once auth is ready */
  waitForAuth(function() {
    if (!window.db || !window.db.isOnline()) return;

    /* Load profile from Supabase */
    window.db.profile.get().then(function(sbProfile) {
      if (sbProfile && sbProfile.company_name) {
        /* Merge Supabase data into profile */
        profile.displayName = sbProfile.company_name || profile.displayName;
        profile.tagline = sbProfile.tagline || profile.tagline;
        profile.instagram = sbProfile.instagram_handle || profile.instagram;
        profile.bio = sbProfile.bio || profile.bio;
        avatarUrl = sbProfile.avatar_url || null;
        /* Split location column into city/state */
        if (sbProfile.location) {
          var parts = sbProfile.location.split(",").map(function(s) { return s.trim(); });
          profile.city = parts[0] || profile.city;
          profile.state = parts[1] || profile.state;
        }
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
        renderProfile();
      } else if (profile.displayName && profile.displayName !== "Your Business") {
        /* Supabase profile is bare, but localStorage has data — sync up */
        syncProfileToSupabase();
      }
    });

    /* Load products_enabled flag from profile */
    window.db.profile.get().then(function(sbP) {
      if (sbP) {
        productsEnabled = !!sbP.products_enabled;
      }
    });

    /* Load products from Supabase */
    if (window.db.products) {
      window.db.products.list().then(function(sbProducts) {
        if (sbProducts) {
          productsList = sbProducts;
          renderProfile();
        }
      });
    }

    /* Load photos from Supabase */
    window.db.photos.list().then(function(sbPhotos) {
      if (sbPhotos && sbPhotos.length > 0) {
        photos = sbPhotos.map(function(ph) {
          return {
            id: ph.id,
            label: ph.label || "",
            image: ph.url || ph.image || "",
            url: ph.url || ph.image || ""
          };
        });
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
        renderProfile();
      } else if (photos.length > 0) {
        /* Migrate localStorage photos to Supabase */
        migratePhotosToSupabase();
      }
    });
  });
}

/** Wait for window.db.isOnline() to become true */
function waitForAuth(fn) {
  var attempts = 0;
  var check = function() {
    attempts++;
    if (window.db && window.db.isOnline()) {
      fn();
    } else if (attempts < 25) {
      setTimeout(check, 200);
    }
  };
  setTimeout(check, 100);
}

/** Sync profile fields to Supabase */
function syncProfileToSupabase() {
  if (!window.db || !window.db.isOnline()) return;
  var loc = [profile.city, profile.state].filter(Boolean).join(", ");
  window.db.profile.update({
    company_name: profile.displayName,
    tagline: profile.tagline || null,
    bio: profile.bio || null,
    instagram_handle: profile.instagram || null,
    location: loc || null
  }).catch(function(err) {
    console.warn("Failed to sync profile to Supabase:", err);
  });
}

/** Migrate localStorage photos to Supabase */
function migratePhotosToSupabase() {
  if (!window.db || !window.db.isOnline()) return;

  photos.forEach(function(ph, idx) {
    var url = ph.image || ph.url;
    if (!url) return;

    window.db.photos.create({
      url: url,
      sort_order: idx
    }).then(function(created) {
      if (created && created.id) {
        ph.id = created.id;
        localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
      }
    }).catch(function(err) {
      console.warn("Failed to migrate photo:", err);
    });
  });
}

function saveProfile() {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  /* Also sync to Supabase */
  syncProfileToSupabase();
}

function savePhotos() {
  localStorage.setItem(PHOTOS_KEY, JSON.stringify(photos));
}

/* ── Toast ───────────────────────────────────────────────────────────────── */

function showProfileToast(msg) {
  const existing = document.getElementById("profile-toast");
  if (existing) existing.remove();
  const t = document.createElement("div");
  t.id = "profile-toast";
  t.className = "settings-toast";
  t.innerHTML = '<span style="font-size:16px">✓</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + (msg || "Saved!") + '</span>';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

/* ── Render Profile ──────────────────────────────────────────────────────── */

function renderProfile() {
  const p = profile;
  const main = document.getElementById("profile-content");

  if (previewMode) {
    renderPreview();
    return;
  }

  const locationStr = [p.city, p.state].filter(Boolean).join(", ") || "Your City, State";
  const instaStr = p.instagram ? "@" + p.instagram : "@yourbusiness";

  main.innerHTML =
    /* Page header */
    '<div class="page-header" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<h1 class="page-title">My Profile</h1>' +
        '<span style="font-size:11px;color:var(--primary);background:rgba(0,194,255,0.08);border:1px solid rgba(0,194,255,0.2);border-radius:20px;padding:3px 10px">Public Profile</span>' +
      '</div>' +
      '<button class="btn btn-secondary" style="font-size:12px;padding:8px 16px" onclick="togglePreview()">👁 Preview as Client</button>' +
    '</div>' +

    /* Profile Hero */
    '<div class="profile-hero">' +
      '<div style="position:relative;flex-shrink:0">' +
        '<div class="profile-avatar-large">' +
          (avatarUrl ? '<img src="' + avatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : escHtml(p.displayName[0])) +
        '</div>' +
        '<button class="avatar-upload-btn" onclick="document.getElementById(\'avatar-file-input\').click()" title="Change profile photo">' +
          (uploadingAvatar ? '<span class="avatar-spinner"></span>' : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>') +
        '</button>' +
        '<input type="file" id="avatar-file-input" accept="image/jpeg,image/png,image/webp" style="display:none" onchange="handleAvatarUpload(this)">' +
      '</div>' +
      '<div>' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">' +
          '<p class="profile-name-large">' + escHtml(p.displayName) + '</p>' +
          '<span style="background:#00C2FF22;border:1px solid #00C2FF55;border-radius:20px;font-size:10px;color:#00C2FF;font-weight:700;padding:2px 9px;letter-spacing:0.08em">✓ PRO</span>' +
        '</div>' +
        '<p class="profile-tagline">' + escHtml(p.tagline) + '</p>' +
        '<div class="profile-tags">' +
          '<span class="profile-tag">' + escHtml(instaStr) + '</span>' +
          '<span class="profile-tag">' + escHtml(locationStr) + '</span>' +
        '</div>' +
      '</div>' +
    '</div>' +


    /* My Link */
    '<div class="card" style="margin-bottom:28px">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>' +
        '<h3 style="font-size:15px;font-weight:700;margin:0">Your Public Profile Link</h3>' +
      '</div>' +
      '<p style="font-size:12px;color:var(--text-dim);margin:0 0 14px">Share this link anywhere — social media, messages, business cards.</p>' +
      '<div class="link-url-box">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>' +
        '<span class="link-url" id="profile-link-url">Loading your link...</span>' +
        '<button class="btn btn-primary" style="font-size:12px;padding:8px 16px;white-space:nowrap" id="profileCopyLinkBtn" onclick="copyProfileLink()">Copy Link</button>' +
      '</div>' +
    '</div>' +

    /* Bio */
    '<div class="card" style="margin-bottom:28px">' +
      '<h3 style="font-size:14px;font-weight:700;margin:0 0 12px;color:var(--text-muted)">About</h3>' +
      '<p style="font-size:14px;color:var(--text-muted);line-height:1.7;margin:0">' +
        escHtml(p.bio || "Tell your clients about yourself and your detailing experience. Click \"Edit Profile Info\" to update this section.") +
      '</p>' +
      '<button class="btn btn-secondary" style="margin-top:16px;font-size:12px;padding:8px 16px" onclick="openEditModal()">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg> ' +
        'Edit Profile Info' +
      '</button>' +
    '</div>' +

    /* Products Section (moved up for visibility) */
    '<div class="card" style="margin-bottom:28px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">' +
        '<div>' +
          '<h3 style="font-size:15px;font-weight:700;margin:0">Products</h3>' +
          '<p style="font-size:12px;color:var(--text-dim);margin:4px 0 0">Display products you sell on your public profile</p>' +
        '</div>' +
        '<label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;flex-shrink:0">' +
          '<input type="checkbox" ' + (productsEnabled ? 'checked' : '') + ' onchange="toggleProductsEnabled(this.checked)" style="opacity:0;width:0;height:0">' +
          '<span style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:' + (productsEnabled ? '#00C2FF' : '#333') + ';border-radius:24px;transition:.3s"></span>' +
          '<span style="position:absolute;content:\'\';height:18px;width:18px;left:' + (productsEnabled ? '23px' : '3px') + ';bottom:3px;background:#fff;border-radius:50%;transition:.3s"></span>' +
        '</label>' +
      '</div>' +
      (productsEnabled ? renderProductsManager() : '<p style="font-size:13px;color:#555;margin:0">Toggle on to add products your clients can browse — sprays, cleaners, merch, and more.</p>') +
    '</div>' +

    /* Work Photos */
    '<div class="photo-section">' +
      '<div class="photo-section-header">' +
        '<div class="photo-section-line"></div>' +
        '<span class="photo-section-title">Work Photos (' + photos.length + ')</span>' +
        '<div class="photo-section-line"></div>' +
      '</div>' +
      (photos.length > 0 ?
        '<div style="display:flex;gap:8px;margin-bottom:16px">' +
          '<button class="btn btn-primary" style="font-size:12px;padding:8px 16px" onclick="openAddPhoto()">+ Add Photo</button>' +
          '<button class="btn ' + (removeMode ? 'btn-danger' : 'btn-ghost') + '" style="font-size:12px;padding:8px 16px" onclick="toggleRemoveMode()">' + (removeMode ? 'Done Removing' : 'Remove Photos') + '</button>' +
        '</div>' +
        '<div class="photo-grid">' +
          photos.map(ph =>
            '<div class="photo-card photo-card-img" style="position:relative;cursor:pointer" onclick="' + (removeMode ? "removePhoto('" + ph.id + "')" : "expandPhoto('" + ph.id + "')") + '">' +
              (removeMode ? '<div class="photo-remove-badge">&#10005;</div>' : '') +
              ((ph.image || ph.url) ? '<img src="' + (ph.image || ph.url) + '" alt="' + escHtml(ph.label) + '" class="photo-card-image" />' : '<span style="font-size:30px;color:var(--text-faint)">&#128247;</span>') +
              (ph.label ? '<span class="photo-card-label">' + escHtml(ph.label) + '</span>' : '') +
            '</div>'
          ).join("") +
        '</div>'
      :
        '<div class="photo-grid">' +
          '<div class="photo-card photo-card-empty">No photos yet</div>' +
          '<div class="photo-card photo-card-empty">Upload photos</div>' +
          '<div class="photo-card photo-card-empty">of your work</div>' +
          '<div class="photo-card photo-card-empty">to showcase here</div>' +
        '</div>' +
        '<button class="btn btn-primary" style="margin-top:16px;font-size:13px;padding:10px 20px" onclick="openAddPhoto()">Upload Photos</button>'
      ) +
      '<p style="text-align:center;margin:10px 0 0;font-size:11px;color:#444">Tap any photo to view</p>' +
    '</div>' +

    /* Bottom spacer for mobile nav */
    '<div style="height:100px"></div>';
}

/* ── Products Manager ──────────────────────────────────────────────────── */

function toggleProductsEnabled(checked) {
  productsEnabled = checked;
  /* Save to Supabase */
  if (window.db && window.db.isOnline()) {
    window.db.profile.update({ products_enabled: checked });
  }
  renderProfile();
  showProfileToast(checked ? "Products enabled!" : "Products hidden from profile");
}

function renderProductsManager() {
  var html = '';

  if (productsList.length > 0) {
    html += '<div style="display:flex;gap:8px;margin-bottom:16px">' +
      '<button class="btn btn-primary" style="font-size:12px;padding:8px 16px" onclick="openAddProduct()">+ Add Product</button>' +
    '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px">';
    productsList.forEach(function(prod) {
      html +=
        '<div class="card" style="padding:0;overflow:hidden;border:1px solid var(--border);position:relative">' +
          '<div style="position:absolute;top:8px;right:8px;display:flex;gap:4px;z-index:2">' +
            '<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;background:rgba(10,10,15,0.8);border:1px solid #333" onclick="openEditProduct(\'' + prod.id + '\')">Edit</button>' +
            '<button class="btn btn-ghost" style="padding:4px 8px;font-size:11px;background:rgba(10,10,15,0.8);border:1px solid #333;color:#FF3366" onclick="deleteProduct(\'' + prod.id + '\')">X</button>' +
          '</div>' +
          (prod.image_url
            ? '<div style="width:100%;aspect-ratio:1;overflow:hidden"><img src="' + escHtml(prod.image_url) + '" alt="' + escHtml(prod.name) + '" style="width:100%;height:100%;object-fit:cover"></div>'
            : '<div style="width:100%;aspect-ratio:1;background:#111118;display:flex;align-items:center;justify-content:center"><span style="font-size:40px;color:#333">&#128722;</span></div>'
          ) +
          '<div style="padding:12px">' +
            '<p style="margin:0 0 4px;font-size:14px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + escHtml(prod.name) + '</p>' +
            '<p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#00C2FF">$' + escHtml(String(prod.price || '0')) + '</p>' +
            (prod.description ? '<p style="margin:0;font-size:11px;color:#777;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">' + escHtml(prod.description) + '</p>' : '') +
          '</div>' +
        '</div>';
    });
    html += '</div>';
  } else {
    html += '<div style="text-align:center;padding:24px 0">' +
      '<p style="font-size:32px;margin:0 0 8px">&#128722;</p>' +
      '<p style="font-size:13px;color:#777;margin:0 0 16px">No products yet. Add sprays, cleaners, merch — anything you sell.</p>' +
      '<button class="btn btn-primary" style="font-size:13px;padding:10px 20px" onclick="openAddProduct()">+ Add Your First Product</button>' +
    '</div>';
  }

  return html;
}

/* ── Add Product Modal ─────────────────────────────────────────────────── */

function openAddProduct() {
  pendingProductFile = null;
  pendingProductDataUrl = null;
  var modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:460px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Add Product</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">&#10005;</button>' +
      '</div>' +

      '<p class="field-label">Product Photo</p>' +
      '<div id="product-upload-area" class="photo-upload-area" onclick="document.getElementById(\'product-file-input\').click()" style="cursor:pointer">' +
        '<input type="file" id="product-file-input" accept="image/*" style="display:none" onchange="handleProductFile(this)">' +
        '<div id="product-upload-placeholder" class="photo-upload-placeholder">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
          '<p style="margin:6px 0 0;font-size:13px;color:var(--text-faint)">Click to upload a photo</p>' +
          '<p style="margin:2px 0 0;font-size:11px;color:#444">JPG, PNG, or WebP — max 5 MB</p>' +
        '</div>' +
        '<img id="product-upload-preview" style="display:none;max-width:100%;max-height:200px;border-radius:8px;object-fit:contain" />' +
      '</div>' +

      '<p class="field-label">Product Name *</p>' +
      '<input class="input" id="product-name" placeholder="e.g. SiO2 Ceramic Detailer" maxlength="80">' +

      '<p class="field-label">Price ($) *</p>' +
      '<input class="input" id="product-price" type="number" step="0.01" min="0" placeholder="29.99">' +

      '<p class="field-label">Description</p>' +
      '<textarea class="input" id="product-desc" rows="3" maxlength="300" placeholder="What does this product do? Why should clients buy it?" style="resize:vertical"></textarea>' +

      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" id="add-product-btn" onclick="submitProduct()">Add Product</button>' +
      '</div>' +
    '</div>';

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function handleProductFile(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showProfileToast("Image must be under 5 MB");
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

function submitProduct(editId) {
  var name = document.getElementById("product-name").value.trim();
  var price = document.getElementById("product-price").value.trim();
  var desc = document.getElementById("product-desc").value.trim();

  if (!name || !price) {
    showProfileToast("Name and price are required");
    return;
  }

  var btn = document.getElementById("add-product-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Saving..."; }

  var saveData = {
    name: name,
    price: parseFloat(price) || 0,
    description: desc || null,
    sort_order: editId ? undefined : productsList.length
  };

  /* Upload image first if we have one */
  var uploadPromise;
  if (pendingProductFile && window.db && window.db.isOnline()) {
    var userId = window.__glossio_user_id;
    var ext = pendingProductFile.name.split(".").pop() || "jpg";
    var path = userId + "/products/" + Date.now() + "." + ext;
    uploadPromise = window.db.storage.upload("work-photos", path, pendingProductFile)
      .then(function() {
        saveData.image_url = window.db.storage.getPublicUrl("work-photos", path);
      });
  } else {
    uploadPromise = Promise.resolve();
  }

  uploadPromise.then(function() {
    /* Remove undefined keys */
    Object.keys(saveData).forEach(function(k) { if (saveData[k] === undefined) delete saveData[k]; });

    if (editId) {
      return window.db.products.update(editId, saveData).then(function(updated) {
        /* Update local list */
        productsList = productsList.map(function(p) {
          if (p.id === editId) return Object.assign(p, saveData);
          return p;
        });
      });
    } else {
      return window.db.products.create(saveData).then(function(created) {
        if (created) productsList.push(created);
      });
    }
  }).then(function() {
    closeEditModal();
    renderProfile();
    showProfileToast(editId ? "Product updated!" : "Product added!");
  }).catch(function(err) {
    console.error("Product save error:", err);
    if (btn) { btn.disabled = false; btn.textContent = editId ? "Save Changes" : "Add Product"; }
    showProfileToast("Failed to save — try again");
  });
}

function openEditProduct(id) {
  var prod = productsList.find(function(p) { return p.id === id; });
  if (!prod) return;

  pendingProductFile = null;
  pendingProductDataUrl = null;
  var modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:460px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Edit Product</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">&#10005;</button>' +
      '</div>' +

      '<p class="field-label">Product Photo</p>' +
      '<div id="product-upload-area" class="photo-upload-area" onclick="document.getElementById(\'product-file-input\').click()" style="cursor:pointer">' +
        '<input type="file" id="product-file-input" accept="image/*" style="display:none" onchange="handleProductFile(this)">' +
        '<div id="product-upload-placeholder" class="photo-upload-placeholder" style="' + (prod.image_url ? 'display:none' : '') + '">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
          '<p style="margin:6px 0 0;font-size:13px;color:var(--text-faint)">Click to change photo</p>' +
        '</div>' +
        '<img id="product-upload-preview" src="' + escHtml(prod.image_url || '') + '" style="' + (prod.image_url ? '' : 'display:none;') + 'max-width:100%;max-height:200px;border-radius:8px;object-fit:contain" />' +
      '</div>' +

      '<p class="field-label">Product Name *</p>' +
      '<input class="input" id="product-name" value="' + escHtml(prod.name) + '" maxlength="80">' +

      '<p class="field-label">Price ($) *</p>' +
      '<input class="input" id="product-price" type="number" step="0.01" min="0" value="' + (prod.price || '') + '">' +

      '<p class="field-label">Description</p>' +
      '<textarea class="input" id="product-desc" rows="3" maxlength="300" style="resize:vertical">' + escHtml(prod.description || '') + '</textarea>' +

      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" id="add-product-btn" onclick="submitProduct(\'' + id + '\')">Save Changes</button>' +
      '</div>' +
    '</div>';

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function deleteProduct(id) {
  if (!confirm("Remove this product?")) return;
  window.db.products.remove(id).then(function() {
    productsList = productsList.filter(function(p) { return p.id !== id; });
    renderProfile();
    showProfileToast("Product removed");
  }).catch(function() {
    showProfileToast("Failed to remove — try again");
  });
}

/* ── Edit Modal ──────────────────────────────────────────────────────────── */

function openEditModal() {
  const p = profile;
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:500px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Edit Profile</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">✕</button>' +
      '</div>' +
      '<p class="field-label">Display Name</p>' +
      '<input class="input" id="edit-name" value="' + escHtml(p.displayName) + '" maxlength="50" placeholder="Your business name">' +
      '<p class="field-label">Tagline</p>' +
      '<input class="input" id="edit-tagline" value="' + escHtml(p.tagline) + '" maxlength="60" placeholder="e.g. Premium Mobile Detailing">' +
      '<p class="field-label">Instagram Handle</p>' +
      '<div style="position:relative"><span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#555;font-size:14px">@</span><input class="input" id="edit-instagram" value="' + escHtml(p.instagram) + '" maxlength="30" placeholder="yourbusiness" style="padding-left:30px"></div>' +
      '<div class="form-row">' +
        '<div><p class="field-label">City</p><input class="input" id="edit-city" value="' + escHtml(p.city) + '" placeholder="Naples"></div>' +
        '<div><p class="field-label">State</p><input class="input" id="edit-state" value="' + escHtml(p.state) + '" placeholder="FL" maxlength="2"></div>' +
      '</div>' +
      '<p class="field-label">Bio</p>' +
      '<textarea class="input" id="edit-bio" rows="4" maxlength="300" style="resize:vertical" placeholder="Tell clients about yourself...">' + escHtml(p.bio) + '</textarea>' +
      '<p style="margin:5px 0 16px;font-size:11px;color:#555"><span id="edit-bio-count">' + (p.bio || "").length + '</span>/300</p>' +
      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" onclick="saveEdit()">Save Profile</button>' +
      '</div>' +
    '</div>';

  document.getElementById("edit-bio").addEventListener("input", function() {
    document.getElementById("edit-bio-count").textContent = this.value.length;
  });

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function closeEditModal() {
  document.getElementById("profile-modal").style.display = "none";
}

function saveEdit() {
  profile.displayName = document.getElementById("edit-name").value.trim() || "Your Business";
  profile.tagline = document.getElementById("edit-tagline").value.trim();
  profile.instagram = document.getElementById("edit-instagram").value.trim().replace(/^@/, "");
  profile.city = document.getElementById("edit-city").value.trim();
  profile.state = document.getElementById("edit-state").value.trim();
  profile.bio = document.getElementById("edit-bio").value.trim();

  /* Save to localStorage */
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  /* Persist all fields directly to Supabase */
  if (window.db && window.db.isOnline()) {
    var locationStr = [profile.city, profile.state].filter(Boolean).join(", ");
    var updateFields = {
      company_name: profile.displayName,
      tagline: profile.tagline || "",
      bio: profile.bio || "",
      instagram_handle: profile.instagram || "",
      location: locationStr
    };
    console.log("Saving profile to Supabase:", updateFields);
    window.db.profile.update(updateFields).then(function(result) {
      console.log("Profile save result:", result);
    }).catch(function(err) {
      console.error("Failed to save profile to Supabase:", err);
    });
  }

  closeEditModal();
  renderProfile();
  showProfileToast("Profile updated!");
}

/* ── Add Photo ───────────────────────────────────────────────────────────── */

let pendingPhotoFile = null;
let pendingPhotoDataUrl = null;

function openAddPhoto() {
  pendingPhotoDataUrl = null;
  pendingPhotoFile = null;
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="modal-box" style="max-width:420px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:28px">' +
        '<h2 style="margin:0;font-size:20px;font-weight:700">Add Work Photo</h2>' +
        '<button class="modal-close" onclick="closeEditModal()">&#10005;</button>' +
      '</div>' +
      '<p class="field-label">Photo</p>' +
      '<div id="photo-upload-area" class="photo-upload-area" onclick="document.getElementById(\'photo-file-input\').click()">' +
        '<input type="file" id="photo-file-input" accept="image/*" style="display:none" onchange="handlePhotoFile(this)">' +
        '<div id="photo-upload-placeholder" class="photo-upload-placeholder">' +
          '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>' +
          '<p style="margin:6px 0 0;font-size:13px;color:var(--text-faint)">Click to upload a photo</p>' +
          '<p style="margin:2px 0 0;font-size:11px;color:#444">JPG, PNG, or WebP</p>' +
        '</div>' +
        '<img id="photo-upload-preview" class="photo-upload-preview" style="display:none" />' +
      '</div>' +
      '<p class="field-label">Label</p>' +
      '<input class="input" id="photo-label" placeholder="e.g. BMW M3 · Full Detail" maxlength="40">' +
      '<div style="display:flex;gap:10px;margin-top:20px">' +
        '<button class="btn btn-ghost" onclick="closeEditModal()">Cancel</button>' +
        '<button class="btn btn-primary" style="flex:1" id="add-photo-btn" onclick="addPhoto()" disabled>Add Photo</button>' +
      '</div>' +
    '</div>';

  modal.addEventListener("click", function(e) {
    if (e.target === this) closeEditModal();
  });
}

function handlePhotoFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showProfileToast("Image must be under 5 MB");
    return;
  }
  /* Keep the file reference for Supabase upload */
  pendingPhotoFile = file;

  const reader = new FileReader();
  reader.onload = function(e) {
    pendingPhotoDataUrl = e.target.result;
    const preview = document.getElementById("photo-upload-preview");
    const placeholder = document.getElementById("photo-upload-placeholder");
    preview.src = pendingPhotoDataUrl;
    preview.style.display = "block";
    placeholder.style.display = "none";
    document.getElementById("add-photo-btn").disabled = false;
  };
  reader.readAsDataURL(file);
}

function addPhoto() {
  if (!pendingPhotoDataUrl) return;
  var label = document.getElementById("photo-label").value.trim() || "";
  var btn = document.getElementById("add-photo-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Uploading..."; }

  /* Try to upload to Supabase Storage first */
  if (window.db && window.db.isOnline() && pendingPhotoFile) {
    var userId = window.__glossio_user_id;
    var ext = pendingPhotoFile.name.split(".").pop() || "jpg";
    var path = userId + "/work-photos/" + Date.now() + "." + ext;

    window.db.storage.upload("work-photos", path, pendingPhotoFile)
      .then(function() {
        var publicUrl = window.db.storage.getPublicUrl("work-photos", path);

        /* Save to work_photos table */
        return window.db.photos.create({
          url: publicUrl,
          sort_order: photos.length
        }).then(function(created) {
          var photo = {
            id: created ? created.id : ("local-" + Date.now()),
            label: label,
            image: publicUrl,
            url: publicUrl
          };
          photos.push(photo);
          savePhotos();
          closeEditModal();
          renderProfile();
          showProfileToast("Photo added!");
        });
      })
      .catch(function(err) {
        console.warn("Supabase upload failed, saving locally:", err);
        /* Fallback: save data URL locally */
        savePhotoLocally(label);
      });
  } else {
    /* Offline: save data URL locally */
    savePhotoLocally(label);
  }
}

function savePhotoLocally(label) {
  photos.push({ id: nextPhotoId++, label: label, image: pendingPhotoDataUrl });
  savePhotos();
  closeEditModal();
  renderProfile();
  showProfileToast("Photo added!");
}

/* ── Remove Photo ────────────────────────────────────────────────────────── */

function toggleRemoveMode() {
  removeMode = !removeMode;
  renderProfile();
}

function removePhoto(id) {
  /* Remove from Supabase */
  if (window.db && window.db.isOnline()) {
    window.db.photos.remove(id).catch(function(err) {
      console.warn("Failed to remove photo from Supabase:", err);
    });
  }

  photos = photos.filter(p => p.id !== id && String(p.id) !== String(id));
  savePhotos();
  renderProfile();
  showProfileToast("Photo removed");
}

/* ── Expand Photo ────────────────────────────────────────────────────────── */

function expandPhoto(id) {
  const ph = photos.find(p => p.id === id || String(p.id) === String(id));
  if (!ph) return;
  const modal = document.getElementById("profile-modal");
  modal.style.display = "flex";
  modal.innerHTML =
    '<div class="photo-expanded-container" onclick="closeEditModal()">' +
      ((ph.image || ph.url) ? '<img src="' + (ph.image || ph.url) + '" alt="' + escHtml(ph.label) + '" class="photo-expanded-img" />' : '') +
      (ph.label ? '<p style="margin:10px 0 0;font-size:14px;color:#888">' + escHtml(ph.label) + '</p>' : '') +
      '<p style="margin:6px 0 0;font-size:11px;color:#444">Tap anywhere to close</p>' +
    '</div>';
  modal.addEventListener("click", function handler(e) {
    if (e.target === modal) { closeEditModal(); modal.removeEventListener("click", handler); }
  });
}

/* ── Preview Mode ────────────────────────────────────────────────────────── */

function togglePreview() {
  previewMode = !previewMode;
  renderProfile();
}

function renderPreview() {
  const p = profile;
  const locationStr = [p.city, p.state].filter(Boolean).join(", ") || "Your City";
  const main = document.getElementById("profile-content");

  main.innerHTML =
    '<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">' +
      '<div style="display:flex;align-items:center;gap:8px">' +
        '<span style="font-size:10px;letter-spacing:0.2em;color:#555;text-transform:uppercase">Client Preview Mode</span>' +
        '<span style="background:#FFD60A20;border:1px solid #FFD60A44;border-radius:20px;font-size:10px;color:#FFD60A;font-weight:700;padding:2px 10px">PREVIEW</span>' +
      '</div>' +
      '<button class="btn btn-secondary" style="font-size:12px;padding:8px 16px" onclick="togglePreview()">← Back to Edit</button>' +
    '</div>' +

    /* Client-facing profile preview */
    '<div style="background:#0A0A0F;border:1px solid #1E1E2E;border-radius:20px;overflow:hidden;max-width:520px;margin:0 auto">' +

      /* Top bar */
      '<div style="background:rgba(10,10,15,0.97);border-bottom:1px solid #1E1E2E;padding:13px 24px;display:flex;justify-content:space-between;align-items:center">' +
        '<h2 style="margin:0;font-size:18px;font-weight:700;background:linear-gradient(90deg,#00C2FF,#A259FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent">GlossIO</h2>' +
        '<div style="display:flex;align-items:center;gap:7px"><div style="width:7px;height:7px;border-radius:50%;background:#00E5A0"></div><span style="font-size:11px;color:#555;letter-spacing:0.12em;text-transform:uppercase">Verified Detailer</span></div>' +
      '</div>' +

      /* Hero */
      '<div style="text-align:center;padding:48px 24px 40px">' +
        '<div style="width:118px;height:118px;border-radius:50%;background:linear-gradient(135deg,#00C2FF,#A259FF);display:flex;align-items:center;justify-content:center;font-size:52px;margin:0 auto 18px;box-shadow:0 0 0 4px #0A0A0F,0 0 0 7px #00C2FF55;overflow:hidden">' + (avatarUrl ? '<img src="' + avatarUrl + '" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:50%">' : escHtml(p.displayName[0])) + '</div>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px">' +
          '<h1 style="margin:0;font-size:26px;font-weight:700">' + escHtml(p.displayName) + '</h1>' +
          '<span style="background:#00C2FF22;border:1px solid #00C2FF55;border-radius:20px;font-size:10px;color:#00C2FF;font-weight:700;padding:2px 9px">✓ PRO</span>' +
        '</div>' +
        '<p style="margin:0 0 20px;font-size:14px;color:#777">' + escHtml(p.tagline || "Professional Auto Detailing") + ' · ' + escHtml(locationStr) + '</p>' +


        /* Book button */
        '<div><button style="width:100%;max-width:420px;background:linear-gradient(135deg,#00C2FF,#A259FF);border:none;border-radius:16px;color:#fff;font-size:17px;font-weight:700;padding:20px 24px;cursor:default;box-shadow:0 8px 48px #00C2FF44;font-family:Georgia,serif">🛠 See Services & Book an Appointment</button></div>' +
        '<p style="margin:10px 0 0;font-size:11px;color:#555">Browse services · Pick a time · Get confirmed</p>' +
      '</div>' +

      /* Photos */
      (photos.length > 0 ?
        '<div style="padding:0 24px 40px">' +
          '<div style="display:flex;align-items:center;gap:12px;margin-bottom:20px"><div style="flex:1;height:1px;background:#1E1E2E"></div><span style="font-size:10px;color:#444;letter-spacing:0.25em;text-transform:uppercase">Our Work</span><div style="flex:1;height:1px;background:#1E1E2E"></div></div>' +
          '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">' +
            photos.map(ph =>
              '<div style="aspect-ratio:1;border-radius:12px;border:1px solid #1E1E2E;overflow:hidden;position:relative">' +
                ((ph.image || ph.url) ? '<img src="' + (ph.image || ph.url) + '" alt="' + escHtml(ph.label) + '" style="width:100%;height:100%;object-fit:cover" />' : '<div style="width:100%;height:100%;background:#111118;display:flex;align-items:center;justify-content:center"><span style="font-size:30px;color:var(--text-faint)">&#128247;</span></div>') +
                (ph.label ? '<span style="position:absolute;bottom:0;left:0;right:0;font-size:9px;color:#fff;text-align:center;padding:12px 6px 6px;background:linear-gradient(transparent,rgba(0,0,0,0.7))">' + escHtml(ph.label) + '</span>' : '') +
              '</div>'
            ).join("") +
          '</div>' +
        '</div>'
      : '') +

      /* About */
      (p.bio ?
        '<div style="padding:0 24px 40px">' +
          '<div style="background:#111118;border:1px solid #1E1E2E;border-radius:14px;padding:22px 24px">' +
            '<p style="margin:0 0 10px;font-size:10px;color:#555;letter-spacing:0.2em;text-transform:uppercase">About</p>' +
            '<p style="margin:0;font-size:14px;color:#C8C4BC;line-height:1.85">' + escHtml(p.bio) + '</p>' +
          '</div>' +
        '</div>'
      : '') +

      /* Footer */
      '<div style="text-align:center;padding:0 24px 32px"><p style="margin:0;font-size:11px;color:#444">Powered by <span style="color:#00C2FF">GlossIO</span></p></div>' +

    '</div>';
}

/* ── Profile Link ────────────────────────────────────────────────────────── */

var _profileSlug = null;

function getProfileUrl() {
  var slug = _profileSlug || "your-business";
  return window.location.origin + "/profile/" + slug + "/";
}

function copyProfileLink() {
  var url = getProfileUrl();
  navigator.clipboard.writeText(url).then(function() {
    showProfileToast("Link copied to clipboard!");
  }).catch(function() {
    showProfileToast("Link: " + url);
  });
}

function loadProfileSlug() {
  var display = document.getElementById("profile-link-url");
  var copyBtn = document.getElementById("profileCopyLinkBtn");

  if (!display) return;

  if (!window.db || !window.db.profile) {
    display.textContent = "Unable to load link — please refresh";
    return;
  }

  window.db.profile.get().then(function(p) {
    if (p && p.slug) {
      _profileSlug = p.slug;
    } else if (p && p.company_name) {
      _profileSlug = p.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
      window.db.profile.update({ slug: _profileSlug }).catch(function() {});
    }
    if (_profileSlug) {
      if (display) display.textContent = window.location.host + "/profile/" + _profileSlug;
      if (copyBtn) { copyBtn.disabled = false; copyBtn.style.opacity = ""; }
    } else {
      if (display) display.textContent = "Unable to load link — please refresh";
    }
  }).catch(function() {
    if (display) display.textContent = "Unable to load link — please refresh";
  });
}

/* ── Avatar Upload ────────────────────────────────────────────────────────── */

function handleAvatarUpload(input) {
  var file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showProfileToast("Image must be under 2 MB");
    return;
  }
  uploadingAvatar = true;
  renderProfile();

  var userId = window.__glossio_user_id;
  if (!userId || !window.db || !window.db.isOnline()) {
    showProfileToast("Unable to upload — please try again");
    uploadingAvatar = false;
    renderProfile();
    return;
  }

  var ext = file.name.split(".").pop() || "jpg";
  var path = userId + "/avatar." + ext;

  /* Upload new avatar (upsert overwrites old) */
  window.db.storage.upload("work-photos", path, file)
    .then(function() {
      var publicUrl = window.db.storage.getPublicUrl("work-photos", path) + "?v=" + Date.now();
      avatarUrl = publicUrl;
      /* Update profile in Supabase */
      return window.db.profile.update({ avatar_url: publicUrl });
    })
    .then(function() {
      uploadingAvatar = false;
      renderProfile();
      showProfileToast("Profile photo updated!");
    })
    .catch(function(err) {
      console.error("Avatar upload failed:", err);
      uploadingAvatar = false;
      renderProfile();
      showProfileToast("Upload failed — please try again");
    });

  input.value = "";
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  loadProfile();
  renderProfile();

  /* Load slug once auth is ready */
  waitForAuth(function() {
    loadProfileSlug();
  });
});
