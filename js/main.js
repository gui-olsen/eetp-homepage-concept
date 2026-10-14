(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero title: wrap each word so it can slide up on load */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(/\s+/).map(function (word, i) {
      return '<span class="w" aria-hidden="true"><span class="w__i" style="--i:' + i + '">' + word + '</span></span>';
    }).join(' ');
  });

  /* Sticky header: solid blue background and white button once the page scrolls */
  var bar = document.querySelector('.nav, .topbar');
  if (bar) {
    var stuck = function () { bar.classList.toggle('is-stuck', window.scrollY > 24); };
    stuck();
    window.addEventListener('scroll', stuck, { passive: true });
  }

  /* Showcase build: pages do not exist yet, so inert links and buttons do nothing */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href="#"]');
    if (a) e.preventDefault();
  });

  /* Hero background video: muted loop, always plays */
  var heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    var playing = heroVideo.play();
    if (playing && playing.catch) playing.catch(function () {});
  }

  /* Scroll reveal */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  items.forEach(function (el) {
    el.addEventListener('transitionend', function (e) {
      if (e.target === el && e.propertyName === 'opacity') el.classList.add('is-done');
    });
  });

  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var start = null, dur = 1500;
    function tick(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible', 'is-done'); });
  } else {
    counters.forEach(function (el) { el.textContent = '0'; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-visible');
        el.querySelectorAll && el.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item__q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var open = item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();
