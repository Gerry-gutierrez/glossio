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
