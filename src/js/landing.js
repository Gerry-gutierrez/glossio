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
