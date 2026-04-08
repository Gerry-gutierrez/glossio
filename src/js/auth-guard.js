/* ─── Auth Guard ──────────────────────────────────────────────────────────── */
/* Redirects unauthenticated users to /login/ on dashboard pages.             */
/* Also hydrates sidebar with real user data when Supabase is connected.      */

(function() {
  "use strict";

  /* Skip guard if Supabase is not configured (local dev mode) */
  if (!window.sbReady) return;

  window.sbAuth.getSession().then(function(session) {
    if (!session) {
      window.location.replace("/login/");
      return;
    }

    /* Hydrate sidebar with real user data */
    var user = session.user;
    if (!user) return;

    window.__glossio_user_id = user.id;

    window.db.profile.get().then(function(profile) {
      if (!profile) return;

      /* Store company name globally for direct Supabase inserts */
      if (profile.company_name) {
        window.__glossio_company_name = profile.company_name;
      }

      /* Update sidebar name */
      var nameEl = document.querySelector(".user-name");
      if (nameEl && profile.company_name) {
        nameEl.textContent = profile.company_name;
      }

      /* Update avatar — show image if available, otherwise initial */
      var avatarEl = document.querySelector(".user-avatar");
      if (avatarEl) {
        if (profile.avatar_url) {
          avatarEl.textContent = "";
          avatarEl.style.backgroundImage = "url(" + profile.avatar_url + ")";
          avatarEl.style.backgroundSize = "cover";
          avatarEl.style.backgroundPosition = "center";
        } else if (profile.company_name) {
          avatarEl.textContent = profile.company_name.charAt(0).toUpperCase();
        }
      }

      /* Update plan badge */
      var planEl = document.querySelector(".user-plan");
      if (planEl) {
        var status = profile.subscription_status || "trialing";
        var labels = {
          trialing: "Free Trial",
          active: "PRO",
          past_due: "Past Due",
          canceled: "Canceled",
          incomplete: "Incomplete"
        };
        planEl.textContent = labels[status] || "Free Trial";
      }

      /* Update dashboard welcome title */
      var dashTitle = document.querySelector(".dash-header-title");
      if (dashTitle && profile.company_name) {
        dashTitle.textContent = profile.company_name;
      }

      /* ── Trial expiry / paywall check ── */
      var subStatus = profile.subscription_status || "trialing";
      var needsPaywall = false;

      if (subStatus === "active") {
        /* Full access — do nothing */
      } else if (subStatus === "past_due" || subStatus === "canceled" || subStatus === "incomplete") {
        needsPaywall = true;
      } else if (subStatus === "trialing") {
        var trialEnd = profile.trial_ends_at ? new Date(profile.trial_ends_at) : null;
        if (trialEnd && trialEnd < new Date()) {
          needsPaywall = true;
        }
      }

      if (needsPaywall) {
        showPaywall();
      }
    });
  });

  /* ── Paywall display + Stripe checkout wiring ── */
  function showPaywall() {
    var overlay = document.getElementById("paywallOverlay");
    if (!overlay) return;

    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    var buttons = overlay.querySelectorAll(".paywall-btn");
    buttons.forEach(function(btn) {
      btn.addEventListener("click", function() {
        var plan = btn.getAttribute("data-plan");
        var priceId = plan === "annual"
          ? window.__GLOSSIO_STRIPE_ANNUAL_PRICE
          : window.__GLOSSIO_STRIPE_MONTHLY_PRICE;

        if (!priceId) {
          alert("Unable to load plan. Please try again later.");
          return;
        }

        buttons.forEach(function(b) { b.disabled = true; });
        btn.textContent = "Redirecting to Stripe...";

        window.glossioStripe.checkout(priceId).catch(function(err) {
          console.error("Checkout error:", err);
          buttons.forEach(function(b) { b.disabled = false; });
          btn.textContent = plan === "annual" ? "Select Annual" : "Select Monthly";
          alert("Something went wrong. Please try again.");
        });
      });
    });
  }

  /* Wire up sign out button */
  document.addEventListener("DOMContentLoaded", function() {
    var signOutBtn = document.querySelector(".sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        window.sbAuth.signOut().then(function() {
          /* Clear cached user data so stale session can't bleed through */
          window.__glossio_user_id = null;
          var lsKeys = [
            "glossio_profile", "glossio_services", "glossio_work_photos",
            "glossio_clients", "glossio_appointments", "glossio_settings"
          ];
          lsKeys.forEach(function(k) { localStorage.removeItem(k); });
          window.location.replace("/login/");
        });
      });
    }
  });

})();
