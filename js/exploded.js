/* Exploded view: hover hotspots, tooltip and lightbox.
   Data comes from js/exploded-data.js (window.EXPLODED). Buttons in the lightbox are inert in this concept. */
(function () {
  'use strict';

  var data = window.EXPLODED;
  var svg = document.getElementById('exploded-svg');
  if (!data || !svg) return;

  var W = data.width, H = data.height, IMG = data.image;
  var PAD_X = 48, PAD_Y = 32; /* white margin around the drawing */
  var canvas = document.getElementById('canvas');
  var tip = document.getElementById('tip');
  var lb = document.getElementById('lb');
  var byN = {};
  data.parts.forEach(function (p) { byN[p.n] = p; });

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function pts(shape) { return shape.map(function (q) { return q.join(','); }).join(' '); }
  function centroid(shape) {
    return [
      shape.reduce(function (a, p) { return a + p[0]; }, 0) / shape.length,
      shape.reduce(function (a, p) { return a + p[1]; }, 0) / shape.length
    ];
  }
  function bbox(shape) {
    var xs = shape.map(function (p) { return p[0]; }), ys = shape.map(function (p) { return p[1]; });
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
  }

  /* ---- build the exploded view ---- */
  svg.setAttribute('viewBox', [-PAD_X, -PAD_Y, W + PAD_X * 2, H + PAD_Y * 2].join(' '));

  var badge = function (p) {
    var c = centroid(p.shapes[0]);
    return '<g class="badge" pointer-events="none" transform="translate(' + c[0] + ' ' + c[1] + ')"><circle r="11"/>' +
      '<path d="M-4 3 L4 -4 M-1 -4 H4 V1" stroke="#fff" fill="none" stroke-width="2"/></g>';
  };

  var html = '<rect class="frame" x="' + (-PAD_X + 8) + '" y="' + (-PAD_Y + 8) + '" width="' + (W + PAD_X * 2 - 16) + '" height="' + (H + PAD_Y * 2 - 16) + '" rx="4"/>' +
    '<image href="' + IMG + '" x="0" y="0" width="' + W + '" height="' + H + '"/>';
  data.parts.filter(function (p) { return p.shapes.length; }).forEach(function (p) {
    html += '<g class="part" data-n="' + p.n + '" tabindex="0" role="button" aria-label="Part ' + p.n + ', ' + esc(p.name) + ', ' + esc(p.pn) + '. Open details.">' +
      p.shapes.map(function (s) { return '<polygon class="hs" points="' + pts(s) + '"/>'; }).join('') +
      (p.type === 'link' ? badge(p) : '') + '</g>';
  });
  svg.innerHTML = html;

  /* ---- tooltip ---- */
  function showTip(p, x, y) {
    tip.innerHTML = '<b>' + p.n + ' · ' + esc(p.name) + '</b><small>' + esc(p.pn) + (p.type === 'link' ? ' · has product page' : '') + '</small>';
    tip.style.left = x + 'px';
    tip.style.top = y + 'px';
    tip.hidden = false;
  }
  svg.addEventListener('mousemove', function (e) {
    var g = e.target.closest('.part');
    if (!g) { tip.hidden = true; return; }
    var r = canvas.getBoundingClientRect();
    showTip(byN[g.dataset.n], e.clientX - r.left, e.clientY - r.top - 4);
  });
  svg.addEventListener('mouseleave', function () { tip.hidden = true; });
  svg.addEventListener('focusin', function (e) {
    var g = e.target.closest('.part');
    if (!g) return;
    var p = byN[g.dataset.n], c = centroid(p.shapes[0]);
    var rs = svg.getBoundingClientRect(), rc = canvas.getBoundingClientRect(), k = rs.width / (W + PAD_X * 2);
    showTip(p, rs.left - rc.left + (c[0] + PAD_X) * k, rs.top - rc.top + (c[1] + PAD_Y) * k - 14);
  });
  svg.addEventListener('focusout', function () { tip.hidden = true; });

  /* ---- zoomed detail of a part, outlined ---- */
  function cropHTML(p, el) {
    if (!p.shapes.length) return '<div class="lb-nophoto">This item is on the BOM only.<br>No location on the drawing.</div>';
    var b = bbox(p.shapes[0]), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    var ar = (el.clientWidth || 400) / (el.clientHeight || 300), pad = 36;
    var vw = Math.max(bw + pad * 2, (bh + pad * 2) * ar, 170), vh = vw / ar;
    return '<svg viewBox="' + (cx - vw / 2) + ' ' + (cy - vh / 2) + ' ' + vw + ' ' + vh + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<image href="' + IMG + '" x="0" y="0" width="' + W + '" height="' + H + '"/>' +
      p.shapes.map(function (s) {
        return '<polygon points="' + pts(s) + '" fill="rgba(0,117,193,.18)" stroke="#0075C1" stroke-width="' + Math.max(1.5, vw / 180) + '"/>';
      }).join('') + '</svg>';
  }

  /* ---- lightbox ---- */
  var lastFocus = null;
  var closeBtn = document.getElementById('lb-x');

  function renderLB(n) {
    var p = byN[n];
    document.getElementById('lb-crop').innerHTML = cropHTML(p, document.getElementById('lb-crop'));
    document.getElementById('lb-body').innerHTML =
      '<p class="eyebrow eyebrow--mono"><span class="eyebrow__signal"></span>Part ' + p.n + '</p>' +
      '<h3 class="lb-title" id="lb-title">' + esc(p.name) + '</h3>' +
      '<p class="lb-desc">' + esc(p.desc) + '</p>' +
      '<div class="lb-lines"><p><strong>Part number:</strong> ' + esc(p.pn) + '</p>' +
      '<p><strong>Quantity per assembly:</strong> ' + esc(p.qty) + '</p>' +
      '<p><strong>Material:</strong> ' + esc(p.mat) + '</p></div>' +
      '<div class="lb-actions">' +
        (p.type === 'link' ? '<a class="btn btn--primary btn--md" href="#">View product</a>' : '') +
        '<a class="btn btn--outline btn--md" href="#">Download datasheet</a>' +
      '</div>';
  }
  function openLB(n) {
    lastFocus = document.activeElement;
    tip.hidden = true;
    lb.hidden = false;
    document.body.classList.add('lock');
    renderLB(n);
    closeBtn.focus();
  }
  function closeLB() {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove('lock');
    if (lastFocus) lastFocus.focus();
  }

  svg.addEventListener('click', function (e) {
    var g = e.target.closest('.part');
    if (g) openLB(+g.dataset.n);
  });
  svg.addEventListener('keydown', function (e) {
    var g = e.target.closest('.part');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLB(+g.dataset.n); }
  });
  closeBtn.addEventListener('click', closeLB);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') { closeLB(); return; }
    if (e.key !== 'Tab') return;
    var f = Array.prototype.filter.call(lb.querySelectorAll('button, a[href]'), function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* Showcase build: the inquiry form does not send anything */
  var form = document.getElementById('inquiry-form');
  if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });
})();
