/* ─── Forgot Password Page ────────────────────────────────────────────────── */

(function() {
  "use strict";

  document.addEventListener("DOMContentLoaded", function() {
    var emailInput = document.getElementById("resetEmail");
    var btn = document.getElementById("resetBtn");
    if (!btn || !emailInput) return;

    btn.addEventListener("click", function(e) {
      e.preventDefault();
      var email = emailInput.value.trim();
      if (!email) return;

      btn.disabled = true;
      btn.textContent = "Sending...";

      if (!window.sbReady) {
        /* Demo mode */
        showSuccess();
        return;
      }

      window.sbAuth.resetPassword(email).then(function(result) {
        if (result && result.error) throw result.error;
        showSuccess();
      }).catch(function(err) {
        btn.disabled = false;
        btn.textContent = "Send Reset Link";
        alert(err.message || "Failed to send reset link.");
      });
    });

    function showSuccess() {
      var card = document.querySelector(".auth-card");
      if (card) {
        card.innerHTML =
          '<div style="text-align:center;padding:20px 0">' +
            '<div style="width:64px;height:64px;border-radius:50%;background:#00E5A015;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;font-size:28px">&#9993;</div>' +
            '<h2 class="auth-title" style="text-align:center">Check your email</h2>' +
            '<p class="auth-sub" style="text-align:center">We sent a password reset link to <strong style="color:#F0EDE8">' + emailInput.value + '</strong>. Click the link in the email to reset your password.</p>' +
            '<p style="font-size:12px;color:#555;margin-top:20px">Didn\'t get it? Check your spam folder or <a href="/forgot-password/" class="auth-link">try again</a>.</p>' +
          '</div>';
      }
    }
  });

})();
