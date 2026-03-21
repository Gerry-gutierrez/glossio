/* ─── Link Page ──────────────────────────────────────────────────────────── */

/* Cached slug — populated on DOMContentLoaded from Supabase */
var _cachedSlug = null;

function getProfileUrl() {
  var slug = _cachedSlug || "your-business";
  return window.location.origin + "/profile/" + slug + "/";
}

function copyProfileLink() {
  var url = getProfileUrl();
  navigator.clipboard.writeText(url).then(function() {
    showLinkToast("Link copied to clipboard!");
  }).catch(function() {
    showLinkToast("Link: " + url);
  });
}

function showLinkToast(msg) {
  var old = document.getElementById("link-toast");
  if (old) old.remove();
  var t = document.createElement("div");
  t.id = "link-toast";
  t.style.cssText = "position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#00E5A0;border-radius:10px;padding:12px 24px;display:flex;align-items:center;gap:8px;box-shadow:0 8px 32px rgba(0,229,160,0.3);z-index:999";
  t.innerHTML = '<span style="font-size:16px">&#10003;</span><span style="font-size:13px;font-weight:700;color:#0A0A0F">' + msg + '</span>';
  document.body.appendChild(t);
  setTimeout(function() { t.remove(); }, 2500);
}

function showShareTip(title, lines) {
  var tip = document.getElementById("share-tip");
  if (!tip) return;
  tip.style.display = "";
  tip.style.cssText = "background:var(--bg-card);border:1px solid var(--border);border-radius:16px;padding:20px;margin-bottom:24px";
  tip.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<h3 style="font-size:16px;font-weight:700;margin:0">' + title + '</h3>' +
      '<button onclick="document.getElementById(\'share-tip\').style.display=\'none\'" style="background:none;border:none;color:var(--text-dim);font-size:18px;cursor:pointer;padding:4px">&times;</button>' +
    '</div>' +
    '<ol style="margin:0;padding-left:20px;font-size:13px;color:var(--text-dim);line-height:1.8">' +
      lines.map(function(l) { return '<li>' + l + '</li>'; }).join("") +
    '</ol>';
}

function shareViaSms() {
  var url = getProfileUrl();
  var body = encodeURIComponent("Check out my services and book an appointment: " + url);
  window.open("sms:?body=" + body, "_blank");
  showShareTip("Text It to Clients", [
    "A new message window should open with your link pre-filled.",
    "Add the client's phone number and hit send.",
    "Works great for follow-ups and repeat clients."
  ]);
}

function shareViaInstagram() {
  copyProfileLink();
  showShareTip("Add to Your Instagram Bio", [
    "Your link has been copied to the clipboard.",
    "Open Instagram &rarr; Edit Profile &rarr; Website.",
    "Paste the link and save.",
    "Mention it in your stories: \"Link in bio!\""
  ]);
}

function shareViaCard() {
  copyProfileLink();
  showShareTip("Put It on Your Business Card", [
    "Your link has been copied.",
    "Add it to your card design under your contact info.",
    "Keep it short &mdash; clients can type it easily.",
    "Consider adding a QR code that points to the same link."
  ]);
}

function shareGeneral() {
  var url = getProfileUrl();
  if (navigator.share) {
    navigator.share({ title: "Book with me", url: url }).catch(function() {
      copyProfileLink();
    });
  } else {
    copyProfileLink();
  }
  showShareTip("Share Anywhere", [
    "Your link has been copied to the clipboard.",
    "Paste it in emails, Facebook, Google Business, Yelp &mdash; anywhere.",
    "Clients tap the link and see your full profile and services."
  ]);
}

/* ── Init ─────────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  var display = document.getElementById("link-url-display");
  var copyBtn = document.getElementById("copyLinkBtn2");

  /* Show loading state until real slug is fetched */
  if (display) {
    display.textContent = "Loading your link...";
  }
  if (copyBtn) {
    copyBtn.disabled = true;
    copyBtn.style.opacity = "0.5";
  }

  function loadSlug() {
    if (!window.db || !window.db.profile) return;

    window.db.profile.get().then(function(profile) {
      if (profile && profile.slug) {
        _cachedSlug = profile.slug;
      } else if (profile && profile.company_name) {
        /* Derive slug from company name and persist it to Supabase */
        _cachedSlug = profile.company_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
        /* Save the slug so the public profile API can find it */
        window.db.profile.update({ slug: _cachedSlug }).catch(function(err) {
          console.warn("Failed to save slug:", err);
        });
      }
      if (_cachedSlug) {
        if (display) display.textContent = window.location.host + "/profile/" + _cachedSlug;
        if (copyBtn) { copyBtn.disabled = false; copyBtn.style.opacity = ""; }
      } else {
        if (display) display.textContent = "Unable to load link — please refresh";
      }
    }).catch(function() {
      if (display) display.textContent = "Unable to load link — please refresh";
    });
  }

  /* Wait for auth to be ready before fetching slug */
  if (window.__glossio_user_id) {
    /* Auth already resolved */
    loadSlug();
  } else if (window.sbAuth) {
    /* Listen for auth state change */
    window.sbAuth.onAuthStateChange(function(event, session) {
      if (session && session.user) {
        window.__glossio_user_id = session.user.id;
        loadSlug();
      }
    });
    /* Also try getSession in case onAuthStateChange already fired */
    window.sbAuth.getSession().then(function(session) {
      if (session && session.user && !_cachedSlug) {
        window.__glossio_user_id = session.user.id;
        loadSlug();
      }
    });
  } else {
    if (display) display.textContent = "Unable to load link — please refresh";
  }
});
