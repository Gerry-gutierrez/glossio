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
    amount.textContent = '$189.76';
    period.textContent = '/year';
    breakdown.style.display = 'block';
    badge.style.display = 'block';
  } else {
    monthly.className = 'toggle-btn toggle-btn-active';
    annual.className = 'toggle-btn toggle-btn-inactive';
    label.textContent = 'Monthly Plan';
    amount.textContent = '$19.98';
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

// Product Showcase slideshow
document.addEventListener('DOMContentLoaded', function() {
  var stage = document.getElementById('showcaseStage');
  if (!stage) return;

  var slides = stage.querySelectorAll('.showcase-slide');
  var tabs = document.querySelectorAll('.showcase-tab');
  var dots = document.querySelectorAll('.showcase-dot');
  var prev = document.getElementById('showcasePrev');
  var next = document.getElementById('showcaseNext');

  var current = 0;
  var total = slides.length;
  var autoTimer = null;
  var AUTO_MS = 7000;

  function setActive(index) {
    current = (index + total) % total;
    slides.forEach(function(s, i) {
      s.classList.toggle('showcase-slide-active', i === current);
    });
    tabs.forEach(function(t, i) {
      t.classList.toggle('showcase-tab-active', i === current);
    });
    dots.forEach(function(d, i) {
      d.classList.toggle('showcase-dot-active', i === current);
    });
  }

  function nextSlide() { setActive(current + 1); }
  function prevSlide() { setActive(current - 1); }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(nextSlide, AUTO_MS);
  }
  function stopAuto() {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
  }

  function resetAuto() { if (autoTimer) startAuto(); }

  if (next) next.addEventListener('click', function() { nextSlide(); resetAuto(); });
  if (prev) prev.addEventListener('click', function() { prevSlide(); resetAuto(); });

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      setActive(parseInt(tab.getAttribute('data-slide'), 10));
      resetAuto();
    });
  });
  dots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      setActive(parseInt(dot.getAttribute('data-slide'), 10));
      resetAuto();
    });
  });

  // Pause on hover / touch interaction
  stage.addEventListener('mouseenter', stopAuto);
  stage.addEventListener('mouseleave', startAuto);

  // Touch swipe
  var touchStartX = 0;
  stage.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  stage.addEventListener('touchend', function(e) {
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) nextSlide(); else prevSlide();
      resetAuto();
    }
  });

  // Only auto-advance when section is in view
  var sectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) startAuto();
      else stopAuto();
    });
  }, { threshold: 0.25 });
  sectionObserver.observe(stage);
});
