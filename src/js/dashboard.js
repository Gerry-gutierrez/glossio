// Dashboard sidebar toggle
document.addEventListener('DOMContentLoaded', function() {
  var hamburger = document.getElementById('hamburgerBtn');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');

  if (hamburger) {
    hamburger.addEventListener('click', function() {
      sidebar.classList.toggle('sidebar-open');
      overlay.classList.toggle('overlay-visible');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('sidebar-open');
      overlay.classList.remove('overlay-visible');
    });
  }

  // Copy booking link
  var copyBtn = document.getElementById('copyLinkBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      var link = window.location.origin + '/your-business';
      navigator.clipboard.writeText(link).then(function() {
        copyBtn.textContent = '✓ Link Copied!';
        copyBtn.style.background = 'rgba(0, 229, 160, 0.08)';
        copyBtn.style.borderColor = 'rgba(0, 229, 160, 0.25)';
        copyBtn.style.color = '#00E5A0';
        setTimeout(function() {
          copyBtn.textContent = 'Copy Booking Link';
          copyBtn.style.background = '';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2000);
      });
    });
  }

  // Close sidebar on nav click (mobile)
  var navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('overlay-visible');
      }
    });
  });
});
