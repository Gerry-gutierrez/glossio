/* ─── Signup Multi-Step Flow ──────────────────────────────────────────────── */

var currentStep = 1;
var resendAttempts = 0;
var verifiedPhoneE164 = ""; // E.164-formatted phone we sent the OTP to

/* If already logged in, redirect to dashboard */
if (window.sbReady) {
  window.sbAuth.getUser().then(function(user) {
    if (user) window.location.replace("/dashboard/");
  });
}

/* Convert (239) 555-0100 → +12395550100 (E.164 for Twilio) */
function toE164(raw) {
  var digits = (raw || "").replace(/\D/g, "");
  if (digits.length === 10) return "+1" + digits;
  if (digits.length === 11 && digits[0] === "1") return "+" + digits;
  return raw && raw.charAt(0) === "+" ? raw : "+" + digits;
}

/* Pretty-print E.164 → (239) 555-0100 for display on the verify screen */
function formatE164ForDisplay(e164) {
  var d = (e164 || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  if (d.length === 10) return "(" + d.slice(0,3) + ") " + d.slice(3,6) + "-" + d.slice(6);
  return e164;
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

    /* Send the OTP to the phone, THEN show step 3. Account is NOT created yet. */
    sendVerificationCode(/* isResend */ false);
    return; /* sendVerificationCode handles doGoToStep(3) on success */
  }

  doGoToStep(step);
}

function doGoToStep(step) {
  currentStep = step;

  for (var i = 1; i <= 4; i++) {
    var el = document.getElementById("step" + i);
    if (el) el.style.display = "none";
  }

  var current = document.getElementById("step" + step);
  if (current) current.style.display = (step === 4 ? "block" : "block");

  var progressBar = document.getElementById("progressBar");
  var footer = document.getElementById("signupFooter");
  if (step >= 4) {
    progressBar.style.display = "none";
    footer.style.display = "none";
  } else {
    progressBar.style.display = "block";
    footer.style.display = "block";
  }

  /* Three progress dots — fill in based on current step */
  for (var j = 1; j <= 3; j++) {
    var dot = document.getElementById("dot" + j);
    if (!dot) continue;
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

  /* Progress fill: 0% / 50% / 100% across the 3 dots; 100% at success step */
  var fill = document.getElementById("progressFill");
  if (fill) {
    var pct = step === 1 ? 0 : step === 2 ? 50 : 100;
    fill.style.width = pct + "%";
  }

  if (step === 4) {
    var company = document.getElementById("companyName");
    var first = document.getElementById("firstName");
    var title = document.getElementById("welcomeTitle");
    var name = (company && company.value) || (first && first.value) || "";
    if (title) title.textContent = name ? "You're in, " + name + "!" : "You're in!";
  }

  if (step === 3) {
    /* Focus the first OTP box */
    setTimeout(function() {
      var first = document.querySelector('.otp-input[data-otp="0"]');
      if (first) first.focus();
    }, 50);
  }
}

/* ── SMS verification (Step 3) ─────────────────────────────────────────── */

function sendVerificationCode(isResend) {
  var phoneRaw = document.getElementById("cellPhone").value.trim();
  verifiedPhoneE164 = toE164(phoneRaw);

  var btn = document.getElementById(isResend ? "resendBtn" : "step2Btn");
  var origText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = isResend ? "Sending..." : "Sending code..."; }
  hideSignupError();

  fetch("/.netlify/functions/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: verifiedPhoneE164, type: "phone_signup" }),
  })
    .then(function(r) { return r.json().then(function(d) { return { status: r.status, data: d }; }); })
    .then(function(res) {
      if (btn) { btn.disabled = false; btn.textContent = origText || (isResend ? "Resend Code" : "Continue →"); }

      if (res.status === 429) {
        showVerifyStatus("Too many code requests. Wait a few minutes and try again.", "error");
        return;
      }
      if (res.status !== 200 || !res.data.success) {
        var msg = res.data.error || "Failed to send code. Double-check the number and try again.";
        if (currentStep === 2) {
          showSignupError(msg);
        } else {
          showVerifyStatus(msg, "error");
        }
        return;
      }

      /* Success */
      if (!isResend) {
        document.getElementById("verifyPhoneDisplay").textContent = formatE164ForDisplay(verifiedPhoneE164);
        clearOtpInputs();
        doGoToStep(3);
      } else {
        resendAttempts++;
        showVerifyStatus("New code sent.", "info");
        clearOtpInputs();
        if (resendAttempts >= 2) {
          var note = document.getElementById("verifySupportNote");
          if (note) note.style.display = "block";
        }
      }
    })
    .catch(function() {
      if (btn) { btn.disabled = false; btn.textContent = origText || (isResend ? "Resend Code" : "Continue →"); }
      var m = "Network error. Please check your connection and try again.";
      if (currentStep === 2) showSignupError(m); else showVerifyStatus(m, "error");
    });
}

function resendCode() { sendVerificationCode(/* isResend */ true); }
window.resendCode = resendCode;

function changePhoneNumber() {
  /* Go back to step 1 so they can fix the number. Password is preserved silently. */
  hideSignupError();
  clearOtpInputs();
  resendAttempts = 0;
  var note = document.getElementById("verifySupportNote");
  if (note) note.style.display = "none";
  doGoToStep(1);
  setTimeout(function() {
    var ph = document.getElementById("cellPhone");
    if (ph) ph.focus();
  }, 50);
}
window.changePhoneNumber = changePhoneNumber;

function getOtpValue() {
  var v = "";
  document.querySelectorAll(".otp-input").forEach(function(inp) { v += inp.value; });
  return v;
}

function clearOtpInputs() {
  document.querySelectorAll(".otp-input").forEach(function(inp) { inp.value = ""; });
  var btn = document.getElementById("verifyBtn");
  if (btn) btn.disabled = true;
  var status = document.getElementById("verifyStatus");
  if (status) status.textContent = "";
}

function submitVerification() {
  var code = getOtpValue();
  if (code.length !== 6) { showVerifyStatus("Enter all 6 digits.", "error"); return; }

  var btn = document.getElementById("verifyBtn");
  btn.disabled = true;
  btn.textContent = "Verifying...";
  showVerifyStatus("", "info");

  fetch("/.netlify/functions/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: verifiedPhoneE164, code: code, type: "phone_signup" }),
  })
    .then(function(r) { return r.json().then(function(d) { return { status: r.status, data: d }; }); })
    .then(function(res) {
      if (res.status === 200 && res.data.verified) {
        /* Code verified — NOW create the Supabase account */
        btn.textContent = "Creating account...";
        createAccount();
      } else {
        btn.disabled = false;
        btn.textContent = "Verify & Create Account";
        showVerifyStatus(res.data.error || "Invalid or expired code. Try again or resend.", "error");
        clearOtpInputs();
        var first = document.querySelector('.otp-input[data-otp="0"]');
        if (first) first.focus();
      }
    })
    .catch(function() {
      btn.disabled = false;
      btn.textContent = "Verify & Create Account";
      showVerifyStatus("Network error. Please try again.", "error");
    });
}
window.submitVerification = submitVerification;

function showVerifyStatus(msg, kind) {
  var el = document.getElementById("verifyStatus");
  if (!el) return;
  el.textContent = msg;
  el.className = "verify-status verify-status-" + (kind || "info");
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

  /* The verify button is what's spinning at this point (we're called from submitVerification) */
  var verifyBtn = document.getElementById("verifyBtn");

  if (!window.sbReady) {
    /* Demo mode — skip auth, just go to success */
    doGoToStep(4);
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

    /* Seed profile defaults — and stamp phone_verified_at since we just verified via Twilio */
    return window.api.call("seed-profile", {
      userId: user.id,
      companyName: companyName || firstName + " " + lastName,
      phone: digits,
      phoneVerified: true
    });
  }).then(function() {
    /* Auto sign in after signup */
    return window.sbAuth.signIn(email, password);
  }).then(function(result) {
    if (result && result.error) {
      /* Sign in failed but account was created — still show success */
      console.warn("Auto sign-in failed:", result.error);
    }
    doGoToStep(4);
  }).catch(function(err) {
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = "Verify & Create Account";
    }
    /* If account creation fails AFTER phone is verified, show the error on the verify screen */
    showVerifyStatus(err.message || "Signup failed. Please try again.", "error");
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

  /* OTP inputs: auto-advance, backspace, paste */
  var otpInputs = document.querySelectorAll(".otp-input");
  if (otpInputs.length === 6) {
    otpInputs.forEach(function(inp, idx) {
      inp.addEventListener("input", function(e) {
        /* Strip non-digits */
        var v = inp.value.replace(/\D/g, "");
        inp.value = v.slice(0, 1);
        if (inp.value && idx < 5) otpInputs[idx + 1].focus();
        updateVerifyBtnState();
      });
      inp.addEventListener("keydown", function(e) {
        if (e.key === "Backspace" && !inp.value && idx > 0) {
          otpInputs[idx - 1].focus();
        }
        if (e.key === "Enter") {
          var btn = document.getElementById("verifyBtn");
          if (btn && !btn.disabled) submitVerification();
        }
      });
      inp.addEventListener("paste", function(e) {
        e.preventDefault();
        var text = (e.clipboardData || window.clipboardData).getData("text").replace(/\D/g, "").slice(0, 6);
        for (var i = 0; i < text.length && (idx + i) < 6; i++) {
          otpInputs[idx + i].value = text[i];
        }
        var nextIdx = Math.min(idx + text.length, 5);
        otpInputs[nextIdx].focus();
        updateVerifyBtnState();
      });
    });
  }

  function updateVerifyBtnState() {
    var btn = document.getElementById("verifyBtn");
    if (!btn) return;
    btn.disabled = getOtpValue().length !== 6;
  }
});
