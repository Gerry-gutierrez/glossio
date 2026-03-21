/* ─── Signup Multi-Step Flow ──────────────────────────────────────────────── */

var currentStep = 1;

/* If already logged in, redirect to dashboard */
if (window.sbReady) {
  window.sbAuth.getSession().then(function(session) {
    if (session) window.location.replace("/dashboard/");
  });
}

function goToStep(step) {
  /* Validate before advancing */
  if (step === 2 && currentStep === 1) {
    var email = document.getElementById("signupEmail").value.trim();
    var phone = document.getElementById("cellPhone").value.trim();
    if (!email) { showSignupError("Email is required."); return; }
    if (!phone || phone.replace(/\D/g, "").length < 10) { showSignupError("Valid phone number is required."); return; }
    hideSignupError();
  }

  if (step === 3 && currentStep === 2) {
    var pw = document.getElementById("signupPassword").value;
    var confirm = document.getElementById("confirmPassword").value;
    if (pw.length < 8) { showSignupError("Password must be at least 8 characters."); return; }
    if (pw !== confirm) { showSignupError("Passwords don't match."); return; }
    hideSignupError();

    /* Create the account */
    createAccount();
    return; /* Don't advance yet — createAccount will call doGoToStep(3) on success */
  }

  doGoToStep(step);
}

function doGoToStep(step) {
  currentStep = step;

  for (var i = 1; i <= 3; i++) {
    var el = document.getElementById("step" + i);
    if (el) el.style.display = "none";
  }

  var current = document.getElementById("step" + step);
  if (current) current.style.display = "block";

  var progressBar = document.getElementById("progressBar");
  var footer = document.getElementById("signupFooter");
  if (step >= 3) {
    progressBar.style.display = "none";
    footer.style.display = "none";
  } else {
    progressBar.style.display = "block";
    footer.style.display = "block";
  }

  for (var j = 1; j <= 2; j++) {
    var dot = document.getElementById("dot" + j);
    if (step > j) {
      dot.className = "progress-dot progress-dot-done";
      dot.innerHTML = "&#10003;";
    } else if (step === j) {
      dot.className = "progress-dot progress-dot-current";
      dot.textContent = j;
    } else {
      dot.className = "progress-dot progress-dot-pending";
      dot.textContent = j;
    }
  }

  var fill = document.getElementById("progressFill");
  fill.style.width = ((step - 1) * 100) + "%";

  if (step === 3) {
    var company = document.getElementById("companyName");
    var first = document.getElementById("firstName");
    var title = document.getElementById("welcomeTitle");
    var name = (company && company.value) || (first && first.value) || "";
    title.textContent = name ? "You're in, " + name + "!" : "You're in!";
  }
}

/* ── Account Creation ──────────────────────────────────────────────────── */

function createAccount() {
  var email = document.getElementById("signupEmail").value.trim();
  var password = document.getElementById("signupPassword").value;
  var firstName = document.getElementById("firstName").value.trim();
  var lastName = document.getElementById("lastName").value.trim();
  var companyName = document.getElementById("companyName").value.trim();
  var phone = document.getElementById("cellPhone").value.trim();
  var address = document.getElementById("address").value.trim();

  var btn = document.getElementById("step2Btn");
  btn.textContent = "Creating account...";
  btn.disabled = true;

  if (!window.sbReady) {
    /* Demo mode — skip auth, just go to success */
    doGoToStep(3);
    return;
  }

  var digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "+1" + digits;

  window.sbAuth.signUp(email, password, {
    first_name: firstName,
    last_name: lastName,
    company_name: companyName,
    phone: digits
  }).then(function(result) {
    if (result.error) throw result.error;

    var user = result.data.user;
    if (!user) throw new Error("Signup failed");

    /* Seed profile defaults */
    return window.api.call("seed-profile", {
      userId: user.id,
      companyName: companyName || firstName + " " + lastName,
      phone: digits
    });
  }).then(function() {
    /* Auto sign in after signup */
    return window.sbAuth.signIn(email, password);
  }).then(function(result) {
    if (result && result.error) {
      /* Sign in failed but account was created — still show success */
      console.warn("Auto sign-in failed:", result.error);
    }
    doGoToStep(3);
  }).catch(function(err) {
    btn.textContent = "Create My Account →";
    btn.disabled = false;
    showSignupError(err.message || "Signup failed. Please try again.");
  });
}

/* ── Helpers ───────────────────────────────────────────────────────────── */

function showSignupError(msg) {
  var el = document.getElementById("signupError");
  if (el) { el.textContent = msg; el.style.display = "block"; }
}

function hideSignupError() {
  var el = document.getElementById("signupError");
  if (el) el.style.display = "none";
}

function togglePassword(inputId) {
  var input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}

/* ── Init ──────────────────────────────────────────────────────────────── */

document.addEventListener("DOMContentLoaded", function() {
  /* Phone formatting */
  var cellPhone = document.getElementById("cellPhone");
  if (cellPhone) {
    cellPhone.addEventListener("input", function() {
      var v = cellPhone.value;
      var digits = v.replace(/\D/g, "").slice(0, 10);
      if (digits.length <= 3) cellPhone.value = digits;
      else if (digits.length <= 6) cellPhone.value = "(" + digits.slice(0,3) + ") " + digits.slice(3);
      else cellPhone.value = "(" + digits.slice(0,3) + ") " + digits.slice(3,6) + "-" + digits.slice(6);
    });
  }

  /* Password strength */
  var pw = document.getElementById("signupPassword");
  var confirm = document.getElementById("confirmPassword");

  if (pw) {
    pw.addEventListener("input", function() {
      var bar = document.getElementById("strengthBar");
      var fill = document.getElementById("strengthFill");
      var label = document.getElementById("strengthLabel");

      if (pw.value) {
        bar.style.display = "block";
        if (pw.value.length >= 12) {
          fill.style.width = "100%"; fill.style.background = "#00E5A0";
          label.textContent = "Strong password";
        } else if (pw.value.length >= 8) {
          fill.style.width = "60%"; fill.style.background = "#FFD60A";
          label.textContent = "Good — could be stronger";
        } else {
          fill.style.width = "30%"; fill.style.background = "#FF3366";
          label.textContent = "Too short";
        }
      } else {
        bar.style.display = "none";
      }
      checkMismatch();
    });
  }

  if (confirm) {
    confirm.addEventListener("input", checkMismatch);
  }

  function checkMismatch() {
    var msg = document.getElementById("mismatchMsg");
    if (confirm.value && pw.value !== confirm.value) {
      msg.style.display = "block";
    } else {
      msg.style.display = "none";
    }
  }

  /* Pre-fill email from URL */
  var params = new URLSearchParams(window.location.search);
  var emailParam = params.get("email");
  if (emailParam) {
    var emailInput = document.getElementById("signupEmail");
    if (emailInput) emailInput.value = emailParam;
  }
});
