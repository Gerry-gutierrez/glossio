/* ─── Login Page ──────────────────────────────────────────────────────────── */

(function() {
  "use strict";

  /* If already logged in, redirect to dashboard */
  /* Use getUser() instead of getSession() — getUser() validates the token
     with Supabase's server, so a stale/revoked session won't pass through */
  if (window.sbReady) {
    window.sbAuth.getUser().then(function(user) {
      if (user) window.location.replace("/dashboard/");
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    var form = document.getElementById("loginForm");
    var identifier = document.getElementById("loginIdentifier");
    var password = document.getElementById("loginPassword");
    var btn = document.getElementById("loginBtn");
    var errorEl = document.getElementById("loginError");

    if (!form) return;

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (!identifier.value || !password.value) return;

      errorEl.style.display = "none";
      btn.disabled = true;
      btn.textContent = "Signing in...";

      var input = identifier.value.trim();
      var isPhone = /^[\d(]/.test(input) && !input.includes("@");

      if (isPhone) {
        /* Phone login: look up email first, then sign in */
        var digits = input.replace(/\D/g, "");
        if (digits.length === 10) digits = "+1" + digits;
        else if (!digits.startsWith("+")) digits = "+" + digits;

        window.api.call("lookup-email", { phone: digits })
        .then(function(data) {
          if (data.email) {
            return doSignIn(data.email, password.value);
          } else {
            /* Server-provided message is friendlier ("...try your email instead") */
            throw new Error(data.error || "Couldn't find that phone number. Try signing in with your email instead.");
          }
        })
        .catch(function(err) {
          showError(err.message || "Login failed. Check your credentials.");
          resetBtn();
        });
      } else {
        /* Email login */
        doSignIn(input, password.value).catch(function(err) {
          showError(err.message || "Login failed. Check your credentials.");
          resetBtn();
        });
      }
    });

    function doSignIn(email, pass) {
      if (!window.sbReady) {
        /* Offline/demo mode — just redirect */
        window.location.replace("/dashboard/");
        return Promise.resolve();
      }

      return window.sbAuth.signIn(email, pass).then(function(result) {
        if (result.error) throw result.error;
        window.location.replace("/dashboard/");
      });
    }

    function showError(msg) {
      errorEl.textContent = msg;
      errorEl.style.display = "block";
    }

    function resetBtn() {
      btn.disabled = false;
      btn.textContent = "Sign In";
      /* Re-check fields */
      if (identifier.value && password.value) {
        btn.disabled = false;
        btn.className = "auth-btn";
      }
    }
  });

})();
