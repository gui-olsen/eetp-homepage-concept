/* Accordion for homepage variants 01 and 03 (smooth open and close, first item open) */
(function () {
  'use strict';
  document.querySelectorAll('.acc__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.acc');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
