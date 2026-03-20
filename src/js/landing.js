// Pricing toggle
function setPricing(cycle) {
  var monthly = document.getElementById('toggleMonthly');
  var annual = document.getElementById('toggleAnnual');
  var label = document.getElementById('priceLabel');
  var amount = document.getElementById('priceAmount');
  var period = document.getElementById('pricePeriod');
  var breakdown = document.getElementById('priceBreakdown');
  var badge = document.getElementById('saveBadge');

  if (cycle === 'annual') {
    monthly.className = 'toggle-btn toggle-btn-inactive';
    annual.className = 'toggle-btn toggle-btn-active';
    label.textContent = 'Annual Plan';
    amount.textContent = '$250';
    period.textContent = '/year';
    breakdown.style.display = 'block';
    badge.style.display = 'block';
  } else {
    monthly.className = 'toggle-btn toggle-btn-active';
    annual.className = 'toggle-btn toggle-btn-inactive';
    label.textContent = 'Monthly Plan';
    amount.textContent = '$25';
    period.textContent = '/mo';
    breakdown.style.display = 'none';
    badge.style.display = 'none';
  }
}

// Mobile nav drawer
function openNavDrawer() {
  document.getElementById('navDrawer').classList.add('nav-drawer-open');
  document.getElementById('navOverlay').classList.add('nav-overlay-visible');
}
function closeNavDrawer() {
  document.getElementById('navDrawer').classList.remove('nav-drawer-open');
  document.getElementById('navOverlay').classList.remove('nav-overlay-visible');
}
document.addEventListener('DOMContentLoaded', function() {
  var hamburger = document.getElementById('navHamburger');
  var overlay = document.getElementById('navOverlay');
  if (hamburger) hamburger.addEventListener('click', openNavDrawer);
  if (overlay) overlay.addEventListener('click', closeNavDrawer);
});

// Hero email pre-fill
document.addEventListener('DOMContentLoaded', function() {
  var emailInput = document.getElementById('heroEmail');
  var heroBtn = document.getElementById('heroBtn');

  if (emailInput && heroBtn) {
    emailInput.addEventListener('input', function() {
      var email = emailInput.value;
      if (email) {
        heroBtn.href = '/signup/?email=' + encodeURIComponent(email);
      } else {
        heroBtn.href = '/signup/';
      }
    });
  }
});

// Scroll reveal
document.addEventListener('DOMContentLoaded', function() {
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  reveals.forEach(function(el) { observer.observe(el); });
});
