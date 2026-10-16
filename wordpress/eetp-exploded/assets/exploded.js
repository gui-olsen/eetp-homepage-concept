/* EETP exploded view
   Reads the "data" textarea inside each .eetp-ev block (one line per part) and draws
   invisible hover areas over the image. Hover = highlight + name, click/tap/Enter = details box.

   Line format (fields separated by |):
   number | name | part number | qty | description | link | areas
   areas: x,y x,y x,y ...   (use ; between several areas for the same part)
   Coordinates are in pixels of the original image. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var lb = null;          /* the shared details box, created on first use */
  var lastFocus = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function safeLink(url) { return /^(https?:\/\/|\/)/.test(url) ? url : ''; }

  function parse(text) {
    var order = [], byN = {};
    text.split(/\r?\n/).forEach(function (line) {
      line = line.trim();
      if (!line || line.charAt(0) === '#') return;
      var f = line.split('|').map(function (s) { return s.trim(); });
      if (!f[0] || !f[1]) return;
      var p = byN[f[0]];
      if (!p) {
        p = byN[f[0]] = { n: f[0], name: f[1], pn: f[2] || '', qty: f[3] || '', desc: f[4] || '', link: safeLink(f[5] || ''), areas: [] };
        order.push(p);
      }
      (f[6] || '').split(';').forEach(function (a) {
        var pts = a.trim().split(/\s+/).map(function (pt) {
          var xy = pt.split(',');
          return [parseFloat(xy[0]), parseFloat(xy[1])];
        }).filter(function (xy) { return !isNaN(xy[0]) && !isNaN(xy[1]); });
        if (pts.length >= 3) p.areas.push(pts);
      });
    });
    return order;
  }

  function pts(poly) { return poly.map(function (q) { return q[0] + ',' + q[1]; }).join(' '); }
  function centroid(poly) {
    var x = 0, y = 0;
    poly.forEach(function (q) { x += q[0]; y += q[1]; });
    return [x / poly.length, y / poly.length];
  }
  function bbox(poly) {
    var xs = poly.map(function (q) { return q[0]; }), ys = poly.map(function (q) { return q[1]; });
    return { x0: Math.min.apply(null, xs), x1: Math.max.apply(null, xs), y0: Math.min.apply(null, ys), y1: Math.max.apply(null, ys) };
  }

  /* ---------- details box ---------- */
  function ensureLightbox() {
    if (lb) return lb;
    lb = el('div', 'eetp-lb');
    lb.hidden = true;
    var card = el('div', 'eetp-lb__card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'eetp-lb-title');
    var x = el('button', 'eetp-lb__x', '×');
    x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    card.appendChild(x);
    card.appendChild(el('div', 'eetp-lb__media'));
    card.appendChild(el('div', 'eetp-lb__body'));
    lb.appendChild(card);
    document.body.appendChild(lb);

    x.addEventListener('click', closeLB);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLB(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') { closeLB(); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(lb.querySelectorAll('button, a[href]'), function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    return lb;
  }

  function cropSvg(inst, p, box) {
    var poly = p.areas[0];
    if (!poly) return null;
    var b = bbox(poly), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, bw = b.x1 - b.x0, bh = b.y1 - b.y0;
    var ar = (box.clientWidth || 400) / (box.clientHeight || 300), pad = 40;
    var vw = Math.max(bw + pad * 2, (bh + pad * 2) * ar, 220), vh = vw / ar;
    var s = svgEl('svg', { viewBox: (cx - vw / 2) + ' ' + (cy - vh / 2) + ' ' + vw + ' ' + vh, preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
    s.appendChild(svgEl('image', { href: inst.src, x: 0, y: 0, width: inst.W, height: inst.H }));
    p.areas.forEach(function (a) {
      s.appendChild(svgEl('polygon', { points: pts(a), fill: 'rgba(0,117,193,.18)', stroke: '#0075C1', 'stroke-width': Math.max(1.5, vw / 180) }));
    });
    return s;
  }

  function openLB(inst, p) {
    ensureLightbox();
    lastFocus = document.activeElement;
    var media = lb.querySelector('.eetp-lb__media'), body = lb.querySelector('.eetp-lb__body');
    media.textContent = '';
    body.textContent = '';
    var crop = el('div', 'eetp-lb__crop');
    media.appendChild(crop);

    body.appendChild(el('p', 'eetp-lb__eyebrow', 'Part ' + p.n));
    var h = el('h3', 'eetp-lb__title', p.name);
    h.id = 'eetp-lb-title';
    body.appendChild(h);
    if (p.desc) body.appendChild(el('p', 'eetp-lb__desc', p.desc));
    var lines = el('div', 'eetp-lb__lines');
    function line(label, value) {
      if (!value) return;
      var r = el('p');
      r.appendChild(el('strong', null, label + ': '));
      r.appendChild(document.createTextNode(value));
      lines.appendChild(r);
    }
    line('Part number', p.pn);
    line('Quantity per assembly', p.qty);
    body.appendChild(lines);
    if (p.link) {
      var a = el('a', 'eetp-btn', 'View product');
      a.href = p.link;
      var actions = el('div', 'eetp-lb__actions');
      actions.appendChild(a);
      body.appendChild(actions);
    }

    lb.hidden = false;
    document.body.classList.add('eetp-lock');
    var svg = cropSvg(inst, p, crop);
    if (svg) crop.appendChild(svg);
    lb.querySelector('.eetp-lb__x').focus();
  }

  function closeLB() {
    if (!lb || lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove('eetp-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------- one exploded view ---------- */
  function init(root) {
    var img = root.querySelector('.eetp-ev__img');
    var dataEl = root.querySelector('.eetp-ev__data');
    var canvas = root.querySelector('.eetp-ev__canvas');
    if (!img || !dataEl || !canvas) return;
    var parts = parse(dataEl.value || dataEl.textContent || '');
    var tip = el('div', 'eetp-ev__tip');
    tip.hidden = true;
    canvas.appendChild(tip);

    function build() {
      var W = img.naturalWidth || parseInt(img.getAttribute('width'), 10);
      var H = img.naturalHeight || parseInt(img.getAttribute('height'), 10);
      if (!W || !H) return;
      var inst = { src: img.currentSrc || img.src, W: W, H: H };
      var svg = svgEl('svg', { class: 'eetp-ev__svg', viewBox: '0 0 ' + W + ' ' + H, preserveAspectRatio: 'none', role: 'group', 'aria-label': 'Exploded view. Each part opens its details.' });
      var byN = {};
      parts.forEach(function (p) {
        if (!p.areas.length) return;
        byN[p.n] = p;
        var g = svgEl('g', { class: 'eetp-ev__part', tabindex: '0', role: 'button', 'data-n': p.n, 'aria-label': 'Part ' + p.n + ', ' + p.name + '. Open details.' });
        p.areas.forEach(function (a) { g.appendChild(svgEl('polygon', { class: 'eetp-ev__hs', points: pts(a) })); });
        if (p.link) {
          var c = centroid(p.areas[0]);
          var b = svgEl('g', { class: 'eetp-ev__badge', 'pointer-events': 'none', transform: 'translate(' + c[0] + ' ' + c[1] + ')' });
          b.appendChild(svgEl('circle', { r: 12 }));
          b.appendChild(svgEl('path', { d: 'M-4 3 L4 -4 M-1 -4 H4 V1', stroke: '#fff', fill: 'none', 'stroke-width': 2 }));
          g.appendChild(b);
        }
        svg.appendChild(g);
      });
      var old = canvas.querySelector('.eetp-ev__svg');
      if (old) old.remove();
      canvas.appendChild(svg);

      function showTip(p, x, y) {
        tip.textContent = '';
        tip.appendChild(el('b', null, p.n + ' · ' + p.name));
        if (p.pn) tip.appendChild(el('small', null, p.pn + (p.link ? ' · has product page' : '')));
        tip.style.left = x + 'px';
        tip.style.top = y + 'px';
        tip.hidden = false;
      }
      svg.addEventListener('mousemove', function (e) {
        var g = e.target.closest('.eetp-ev__part');
        if (!g) { tip.hidden = true; return; }
        var r = canvas.getBoundingClientRect();
        showTip(byN[g.getAttribute('data-n')], e.clientX - r.left, e.clientY - r.top - 4);
      });
      svg.addEventListener('mouseleave', function () { tip.hidden = true; });
      svg.addEventListener('focusin', function (e) {
        var g = e.target.closest('.eetp-ev__part');
        if (!g) return;
        var p = byN[g.getAttribute('data-n')], c = centroid(p.areas[0]);
        var rs = svg.getBoundingClientRect(), rc = canvas.getBoundingClientRect();
        showTip(p, rs.left - rc.left + c[0] * rs.width / W, rs.top - rc.top + c[1] * rs.height / H - 14);
      });
      svg.addEventListener('focusout', function () { tip.hidden = true; });
      svg.addEventListener('click', function (e) {
        var g = e.target.closest('.eetp-ev__part');
        if (g) openLB(inst, byN[g.getAttribute('data-n')]);
      });
      svg.addEventListener('keydown', function (e) {
        var g = e.target.closest('.eetp-ev__part');
        if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openLB(inst, byN[g.getAttribute('data-n')]); }
      });
    }

    if (img.complete && img.naturalWidth) build();
    else img.addEventListener('load', build);
  }

  function boot() { Array.prototype.forEach.call(document.querySelectorAll('.eetp-ev'), init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
