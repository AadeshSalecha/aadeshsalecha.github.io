/* Dive Log: depth gauge, dive profile, ambient water.
   Depth is read from data-depth="from to" on zones and shot lines:
   the top edge of each element sits at `from`, the bottom at `to`,
   and the reading line interpolates between those key points. */
(function () {
  'use strict';

  var root = document.documentElement;
  var gauge = document.querySelector('.gauge');
  if (!gauge) return;

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var MAX_DEPTH = 42;

  var numEl = gauge.querySelector('.g-num');
  var siteEl = gauge.querySelector('.g-site');
  var statusEl = gauge.querySelector('.g-status');
  var timeEl = gauge.querySelector('.g-time');
  var toggle = gauge.querySelector('.gauge-toggle');
  var svg = gauge.querySelector('.profile-svg');
  var profileBox = gauge.querySelector('.gauge-profile');
  var stopItems = Array.prototype.slice.call(gauge.querySelectorAll('.gauge-stops li'));

  var depthEls = Array.prototype.slice.call(document.querySelectorAll('[data-depth]'));
  var stopEls = stopItems.map(function (li) { return document.getElementById(li.dataset.for); });

  var keys = [];       // [{y, d}]
  var zones = [];      // [{top, bottom, site, mode}]
  var stopTops = [];   // document y of each stop section
  var docH = 1;

  function docTop(el) { return el.getBoundingClientRect().top + window.scrollY; }

  function measure() {
    keys = []; zones = [];
    depthEls.forEach(function (el) {
      var top = docTop(el), h = el.offsetHeight;
      var p = el.dataset.depth.trim().split(/\s+/).map(parseFloat);
      keys.push({ y: top, d: p[0] }, { y: top + h, d: p.length > 1 ? p[1] : p[0] });
      if (el.dataset.site) zones.push({ top: top, bottom: top + h, site: el.dataset.site, mode: el.dataset.mode || 'sea' });
    });
    keys.sort(function (a, b) { return a.y - b.y; });
    stopTops = stopEls.map(function (el) { return el ? docTop(el) : 0; });
    docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    drawProfile();
  }

  // The reading line sits 38% down the viewport, and slides to the bottom
  // edge over the last screen of scrolling so the seabed reads full depth.
  function readLine() {
    var vh = window.innerHeight, sy = window.scrollY;
    var tail = Math.max(0, Math.min(1, (sy - (docH - vh)) / vh));
    return sy + vh * (0.38 + 0.62 * tail);
  }

  function depthAt(y) {
    if (!keys.length) return 0;
    if (y <= keys[0].y) return keys[0].d;
    for (var i = 1; i < keys.length; i++) {
      if (y <= keys[i].y) {
        var a = keys[i - 1], b = keys[i];
        var t = b.y === a.y ? 1 : (y - a.y) / (b.y - a.y);
        return a.d + (b.d - a.d) * t;
      }
    }
    return keys[keys.length - 1].d;
  }

  // the zone under the line, or the last one passed (e.g. over the footer)
  function zoneAt(y) {
    var hit = null;
    for (var i = 0; i < zones.length; i++) if (y >= zones[i].top) hit = zones[i];
    return hit;
  }

  /* ---- dive profile in the gauge (x = depth, y = stop order) ---- */
  var NS = 'http://www.w3.org/2000/svg';
  var stopY = [], stopD = [], W = 36, PADX = 6;
  var doneLine, nowDot, clipRect;

  function xFor(d) { return PADX + (Math.max(0, Math.min(MAX_DEPTH, d)) / MAX_DEPTH) * (W - PADX * 2); }

  function drawProfile() {
    if (!svg || !profileBox) return;
    var boxTop = profileBox.getBoundingClientRect().top;
    var H = profileBox.offsetHeight;
    if (!H) return;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    stopY = stopItems.map(function (li) { var r = li.getBoundingClientRect(); return r.top - boxTop + r.height / 2; });
    stopD = stopItems.map(function (li, i) { return stopEls[i] ? parseFloat(stopEls[i].dataset.stop) || 0 : 0; });
    var pts = stopY.map(function (y, i) { return xFor(stopD[i]).toFixed(1) + ',' + y.toFixed(1); }).join(' ');
    var html = '';
    html += '<line class="p-axis" x1="' + xFor(0) + '" y1="' + stopY[0] + '" x2="' + xFor(0) + '" y2="' + stopY[stopY.length - 1] + '"/>';
    html += '<defs><clipPath id="p-clip"><rect x="-10" y="0" width="' + (W + 20) + '" height="0"/></clipPath></defs>';
    html += '<polyline class="p-base" points="' + pts + '"/>';
    html += '<polyline class="p-done" clip-path="url(#p-clip)" points="' + pts + '"/>';
    stopY.forEach(function (y, i) {
      var si = stopItems[i].classList.contains('is-si');
      html += '<circle class="p-stop' + (si ? ' si' : '') + '" cx="' + xFor(stopD[i]).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3"/>';
    });
    html += '<circle class="p-now" r="4.2" cx="' + xFor(0) + '" cy="' + stopY[0] + '"/>';
    svg.innerHTML = html;
    clipRect = svg.querySelector('#p-clip rect');
    nowDot = svg.querySelector('.p-now');
  }

  /* ---- readout ---- */
  var lastDepth = 0, lastT = performance.now(), rate = 0, dir = 'down';
  var currentStop = -1;

  function update() {
    var y = readLine();
    var d = window.scrollY < 4 ? 0 : depthAt(y);
    var z = zoneAt(y);
    var mode = z ? z.mode : 'sea';

    // ascent rate (m/s), smoothed
    var now = performance.now(), dt = Math.max(16, now - lastT) / 1000;
    var inst = (d - lastDepth) / dt;
    rate = rate * 0.8 + inst * 0.2;
    if (Math.abs(d - lastDepth) > 0.02) dir = d < lastDepth ? 'up' : 'down';
    lastDepth = d; lastT = now;

    numEl.textContent = d.toFixed(1);
    if (z) siteEl.textContent = z.site;

    var state, label;
    if (mode === 'fresh') { state = 'si'; label = 'Surface interval'; }
    else if (d < 0.6) { state = 'surface'; label = 'At surface'; }
    else if (d >= MAX_DEPTH - 0.6) { state = 'bottom'; label = 'Seabed'; }
    else if (dir === 'up' && rate < -14) { state = 'ascent-fast'; label = 'Slow ascent'; }
    else if (dir === 'up') { state = 'up'; label = 'Ascending'; }
    else { state = 'down'; label = 'Descending'; }
    if (statusEl.textContent !== label) statusEl.textContent = label;
    gauge.dataset.state = state;
    gauge.dataset.dir = dir;

    // which stop are we in?
    var idx = 0;
    for (var i = 0; i < stopTops.length; i++) if (y >= stopTops[i] - 2) idx = i;
    if (idx !== currentStop) {
      if (currentStop >= 0) { stopItems[currentStop].classList.remove('is-current'); stopItems[currentStop].querySelector('a').removeAttribute('aria-current'); }
      stopItems[idx].classList.add('is-current');
      stopItems[idx].querySelector('a').setAttribute('aria-current', 'location');
      currentStop = idx;
    }

    // profile marker: between stop idx and idx+1
    if (nowDot && stopY.length) {
      var py = stopY[idx];
      if (idx < stopTops.length - 1) {
        var f = (y - stopTops[idx]) / Math.max(1, stopTops[idx + 1] - stopTops[idx]);
        f = Math.max(0, Math.min(1, f));
        py = stopY[idx] + (stopY[idx + 1] - stopY[idx]) * f;
      }
      if (window.scrollY < 4) py = stopY[0];
      nowDot.setAttribute('cy', py.toFixed(1));
      nowDot.setAttribute('cx', xFor(d).toFixed(1));
      clipRect.setAttribute('height', Math.max(0, py).toFixed(1));
    }

    // ambient: rays near the surface (gold over the rainforest), darkening with depth
    var rayO = mode === 'fresh' ? 0.75 : Math.max(0, 1 - d / 11);
    root.style.setProperty('--ray-o', rayO.toFixed(3));
    root.style.setProperty('--ray-rgb', mode === 'fresh' ? '255,226,150' : '255,255,255');
    root.style.setProperty('--vig', mode === 'fresh' ? '0.15' : Math.min(0.75, d / MAX_DEPTH * 0.8).toFixed(3));
    root.style.setProperty('--p', (window.scrollY / docH).toFixed(4));

    fx.depth = d; fx.mode = mode;
  }

  /* ---- dive time ---- */
  var t0 = Date.now();
  function tick() {
    var s = Math.floor((Date.now() - t0) / 1000);
    var m = Math.floor(s / 60);
    timeEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
  }
  setInterval(tick, 1000);

  /* ---- mobile top bar menu ---- */
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = !gauge.classList.contains('open');
      gauge.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) requestAnimationFrame(function () { drawProfile(); update(); });
    });
    gauge.querySelectorAll('.gauge-stops a').forEach(function (a) {
      a.addEventListener('click', function () {
        gauge.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && gauge.classList.contains('open')) {
        gauge.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (gauge.classList.contains('open') && !gauge.contains(e.target)) {
        gauge.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---- particles: bubbles near the surface, marine snow at depth, pollen over the forest ---- */
  var fx = { depth: 0, mode: 'sea' };
  var canvas = document.querySelector('.particles');
  var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var parts = [], CW = 0, CH = 0, running = false, lastScroll = window.scrollY, rafId = 0;

  function sizeCanvas() {
    if (!ctx) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    CW = window.innerWidth; CH = window.innerHeight;
    canvas.width = Math.round(CW * dpr); canvas.height = Math.round(CH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = CW < 700 ? 30 : 60;
    while (parts.length < n) parts.push(spawn({}, true));
    parts.length = n;
  }

  function spawn(p, anywhere, fromBelow) {
    var d = fx.depth, fresh = fx.mode === 'fresh';
    var bubbleShare = fresh ? 0 : Math.max(0.06, Math.min(1, 1 - d / 20));
    p.kind = fresh ? 'mote' : (Math.random() < bubbleShare ? 'bubble' : 'snow');
    p.x = Math.random() * CW;
    if (anywhere) p.y = Math.random() * CH;
    else if (fromBelow === true) p.y = CH + 10;
    else if (fromBelow === false) p.y = -10;
    else p.y = p.kind === 'bubble' ? CH + 10 : -10;
    p.par = 0.12 + Math.random() * 0.35;             // parallax vs scroll
    p.ph = Math.random() * Math.PI * 2;
    if (p.kind === 'bubble') { p.r = 1.2 + Math.random() * 3.4; p.vy = -(0.25 + Math.random() * 0.6) * (p.r / 3); p.a = 0.35 + Math.random() * 0.4; }
    else if (p.kind === 'snow') { p.r = 0.6 + Math.random() * 1.3; p.vy = 0.04 + Math.random() * 0.16; p.a = 0.25 + Math.random() * 0.45; p.glow = d > 33 && Math.random() < 0.18; }
    else { p.r = 0.8 + Math.random() * 1.6; p.vy = (Math.random() - 0.5) * 0.12; p.a = 0.3 + Math.random() * 0.5; }
    return p;
  }

  function frame(t) {
    rafId = 0;
    if (!running) return;
    var sy = window.scrollY, dy = sy - lastScroll; lastScroll = sy;
    if (Math.abs(dy) > CH) dy = 0;
    ctx.clearRect(0, 0, CW, CH);
    // let the mix follow the depth: recycle one mismatched particle per frame
    var q = parts[(Math.random() * parts.length) | 0], fresh = fx.mode === 'fresh';
    if (q && ((fresh && q.kind !== 'mote') || (!fresh && q.kind === 'mote') ||
        (q.kind === 'bubble' && Math.random() < fx.depth / 30))) spawn(q, false);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.ph += 0.012;
      p.x += Math.sin(p.ph) * (p.kind === 'bubble' ? 0.35 : 0.18);
      p.y += p.vy - dy * p.par;
      if (p.y < -20) spawn(p, false, true);
      else if (p.y > CH + 20) spawn(p, false, false);
      if (p.x < -10) p.x = CW + 5; else if (p.x > CW + 10) p.x = -5;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      if (p.kind === 'bubble') {
        ctx.strokeStyle = 'rgba(255,255,255,' + p.a + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
        if (p.r > 2.2) { ctx.beginPath(); ctx.arc(p.x - p.r * 0.35, p.y - p.r * 0.35, p.r * 0.28, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,' + (p.a * 0.9) + ')'; ctx.fill(); }
      } else if (p.kind === 'snow') {
        ctx.fillStyle = p.glow ? 'rgba(140,255,232,' + (p.a + 0.25) + ')' : 'rgba(215,236,255,' + p.a + ')';
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,224,150,' + (p.a * (0.6 + 0.4 * Math.sin(p.ph * 2))) + ')';
        ctx.fill();
      }
    }
    rafId = requestAnimationFrame(frame);
  }

  function startFx() {
    if (!ctx || reduceMQ.matches || document.hidden) return;
    if (!running) { running = true; lastScroll = window.scrollY; rafId = requestAnimationFrame(frame); }
  }
  function stopFx() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    if (ctx) ctx.clearRect(0, 0, CW, CH);
  }
  document.addEventListener('visibilitychange', function () { document.hidden ? stopFx() : startFx(); });
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', function () { reduceMQ.matches ? stopFx() : startFx(); });

  /* ---- torch on the seabed follows the pointer (desktop, motion allowed) ---- */
  var seabed = document.querySelector('.z-seabed');
  if (seabed && window.matchMedia('(hover: hover)').matches) {
    seabed.addEventListener('pointermove', function (e) {
      if (reduceMQ.matches) return;
      var r = seabed.getBoundingClientRect();
      seabed.style.setProperty('--tx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      seabed.style.setProperty('--ty', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
  }

  /* ---- wire up ---- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }
  var resizeT;
  function onResize() {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () { measure(); sizeCanvas(); update(); }, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('load', function () { measure(); update(); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); update(); });
  // placeholders swap in after DOMContentLoaded and can change heights
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(document.body);

  measure();
  sizeCanvas();
  update();
  tick();
  startFx();
})();
