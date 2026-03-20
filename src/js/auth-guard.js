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

      /* Update sidebar name */
      var nameEl = document.querySelector(".user-name");
      if (nameEl && profile.company_name) {
        nameEl.textContent = profile.company_name;
      }

      /* Update avatar initial */
      var avatarEl = document.querySelector(".user-avatar");
      if (avatarEl && profile.company_name) {
        avatarEl.textContent = profile.company_name.charAt(0).toUpperCase();
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
    });
  });

  /* Wire up sign out button */
  document.addEventListener("DOMContentLoaded", function() {
    var signOutBtn = document.querySelector(".sign-out-btn");
    if (signOutBtn) {
      signOutBtn.addEventListener("click", function(e) {
        e.preventDefault();
        window.sbAuth.signOut().then(function() {
          window.location.replace("/login/");
        });
      });
    }
  });

})();
