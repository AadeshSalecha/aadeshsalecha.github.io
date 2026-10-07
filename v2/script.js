/* Aadesh Salecha — v2 "Editorial". No dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Bio toggle (Short default) ---------- */
  var buttons = document.querySelectorAll('.bio-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var which = btn.getAttribute('data-bio');
      ['short', 'long'].forEach(function (k) {
        var el = document.getElementById('bio-' + k);
        var show = k === which;
        if (show && el.hidden) {
          el.hidden = false;
          el.classList.remove('is-entering');
          void el.offsetWidth; // restart animation
          el.classList.add('is-entering');
        } else if (!show) {
          el.hidden = true;
        }
      });
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    });
  });

  /* ---------- Scroll reveal ---------- */
  var chartEl = document.getElementById('citation-chart');
  if (root.classList.contains('has-reveal')) {
    requestAnimationFrame(function () { root.classList.add('is-loaded'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        if (e.target.classList.contains('chart-fig') && chartEl) chartEl.classList.add('is-drawn');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
    // Never leave content hidden for print.
    window.addEventListener('beforeprint', function () {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
      if (chartEl) chartEl.classList.add('is-drawn');
    });
  }

  /* ---------- Citation chart (inline SVG, drawn at true pixel width) ---------- */
  var DATA = [
    { y: '2020', v: 2 }, { y: '2021', v: 5 }, { y: '2022', v: 14 }, { y: '2023', v: 16 },
    { y: '2024', v: 21 }, { y: '2025', v: 113 }, { y: '2026', v: 145, ytd: true }
  ];
  var NS = 'http://www.w3.org/2000/svg';
  var tip = document.getElementById('chart-tip');
  var fig = chartEl ? chartEl.closest('.chart-fig') : null;

  function el(name, attrs, parent, text) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (text != null) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }

  function barPath(x0, x1, top, base) {
    var h = base - top;
    var r = Math.max(0, Math.min(4, h, (x1 - x0) / 2));
    return 'M' + x0 + ',' + base + 'V' + (top + r) + 'Q' + x0 + ',' + top + ' ' + (x0 + r) + ',' + top +
      'H' + (x1 - r) + 'Q' + x1 + ',' + top + ' ' + x1 + ',' + (top + r) + 'V' + base + 'Z';
  }

  function annotate(g, x, y, lines, cls) {
    // lines: [[strongText, restText], [plainText]]
    var t = el('text', { x: x, y: y, 'class': 'ann' + (cls ? ' ' + cls : '') }, g);
    lines.forEach(function (ln, i) {
      var first = el('tspan', { x: x, dy: i === 0 ? 0 : 18 }, t);
      if (ln.length === 2) {
        el('tspan', { 'class': 'ann-strong' }, first, ln[0]);
        first.appendChild(document.createTextNode(ln[1]));
      } else {
        first.textContent = ln[0];
      }
    });
    return t;
  }

  function draw() {
    if (!chartEl) return;
    var W = Math.round(chartEl.clientWidth);
    if (!W) return;
    var narrow = W < 540;
    var H = narrow ? 300 : 340;
    var m = { top: 30, right: 6, bottom: 46, left: 34 };
    var iw = W - m.left - m.right, ih = H - m.top - m.bottom;
    var yMax = 160;
    var base = m.top + ih;
    var y = function (v) { return m.top + ih * (1 - v / yMax); };
    var band = iw / DATA.length;
    var bw = Math.min(narrow ? 26 : 48, band * 0.58);

    chartEl.textContent = '';
    var svg = el('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-hidden': 'true', focusable: 'false' }, chartEl);

    var defs = el('defs', {}, svg);
    var pat = el('pattern', { id: 'hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 6, height: 6, fill: 'transparent' }, pat);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 6, stroke: getComputedStyle(root).getPropertyValue('--forest').trim() || '#1D4B38', 'stroke-width': 2.4 }, pat);

    // grid
    var grid = el('g', { 'class': 'grid' }, svg);
    [50, 100, 150].forEach(function (v) {
      el('line', { x1: m.left, x2: W - m.right, y1: y(v) + .5, y2: y(v) + .5 }, grid);
      el('text', { x: m.left - 8, y: y(v) + 4, 'text-anchor': 'end', 'class': 'tick' }, grid, v);
    });
    el('text', { x: m.left - 8, y: base + 4, 'text-anchor': 'end', 'class': 'tick' }, grid, '0');

    // bands
    var bands = el('g', { 'class': 'bands' }, svg);
    var geo = [];
    DATA.forEach(function (d, i) {
      var cx = m.left + band * (i + 0.5);
      var x0 = Math.round(cx - bw / 2), x1 = Math.round(cx + bw / 2);
      var top = y(d.v);
      geo.push({ cx: cx, x0: x0, x1: x1, top: top });
      var g = el('g', { 'class': 'band', 'data-i': i }, bands);
      el('rect', { x: m.left + band * i + 1, y: m.top - 10, width: band - 2, height: ih + 10, 'class': 'hover-bg', rx: 3 }, g);
      el('path', { d: barPath(x0, x1, top, base), 'class': 'bar' + (d.ytd ? ' bar-ytd' : '') }, g);
      el('text', { x: cx, y: base + 20, 'text-anchor': 'middle', 'class': 'xlab' }, g, narrow ? "'" + d.y.slice(2) : d.y);
      if (d.ytd) el('text', { x: cx, y: base + 35, 'text-anchor': 'middle', 'class': 'xlab-sub' }, g, 'YTD');
      if (d.v >= 100) el('text', { x: cx, y: top - 8, 'text-anchor': 'middle', 'class': 'val' }, g, d.v);
    });
    el('line', { x1: m.left, x2: W - m.right, y1: base + .5, y2: base + .5, 'class': 'base' }, grid);

    // annotations (live in the empty space above the small early bars)
    var ag = el('g', { 'class': 'annotations fade-in-late' }, svg);
    var tx = m.left + (narrow ? 4 : band * 0.2);
    var a26 = narrow
      ? [['145', ' so far in 2026'], ['already above all of 2025']]
      : [['145 so far in 2026', ' —'], ['already more than all of 2025']];
    var a25 = narrow
      ? [['113', ' in 2025'], ['over 5× the year before']]
      : [['113 in 2025', ' —'], ['more than 5× the 21 cited in 2024']];
    [[a26, 6, 145], [a25, 5, 113]].forEach(function (spec) {
      var ly = y(spec[2]);
      var t = annotate(ag, tx, ly + 4, spec[0]);
      var firstLine = t.firstChild;
      var endX = tx + (firstLine.getComputedTextLength ? firstLine.getComputedTextLength() : 120) + 8;
      var g = geo[spec[1]];
      var stopX = g.x0 - 6;
      if (stopX - endX > 12) {
        el('path', { d: 'M' + endX + ',' + ly + 'H' + stopX, 'class': 'leader' }, ag);
        el('circle', { cx: stopX, cy: ly, r: 2.5, 'class': 'leader-dot' }, ag);
      }
    });

    // hover layer
    bands.querySelectorAll('.band').forEach(function (g) {
      var i = +g.getAttribute('data-i');
      g.addEventListener('pointerenter', function () {
        g.classList.add('is-hover');
        if (!tip || !fig) return;
        var d = DATA[i], gg = geo[i];
        var fr = fig.getBoundingClientRect(), cr = chartEl.getBoundingClientRect();
        tip.innerHTML = d.y + (d.ytd ? ' <span>(year to date)</span>' : '') + ' · ' + d.v + ' <span>citations</span>';
        tip.style.left = (cr.left - fr.left + gg.cx) + 'px';
        tip.style.top = (cr.top - fr.top + Math.min(gg.top, base - 8) - 10) + 'px';
        tip.classList.add('is-on');
      });
      g.addEventListener('pointerleave', function () {
        g.classList.remove('is-hover');
        if (tip) tip.classList.remove('is-on');
      });
    });
  }

  draw();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
  var lastW = chartEl ? chartEl.clientWidth : 0;
  if ('ResizeObserver' in window && chartEl) {
    new ResizeObserver(function () {
      var w = chartEl.clientWidth;
      if (Math.abs(w - lastW) > 1) { lastW = w; draw(); }
    }).observe(chartEl);
  } else {
    window.addEventListener('resize', draw);
  }
})();
