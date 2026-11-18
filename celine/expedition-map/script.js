/* Expedition Map: pins, field card (sidebar / bottom sheet), zoom-to-stop and the
   coordinates readout. Everything here is progressive enhancement: without JS the
   pins and itinerary are plain links to the stop cards further down the page. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');

  var viewport = document.querySelector('[data-atlas]');
  if (!viewport) return;

  var stage = viewport.querySelector('.atlas-stage');
  var svg = stage.querySelector('.map-svg');
  var vb = svg.viewBox.baseVal;
  var K = +svg.getAttribute('data-k'), TX = +svg.getAttribute('data-tx'), TY = +svg.getAttribute('data-ty');
  var route = svg.querySelector('.route');
  var legs = Array.prototype.slice.call(svg.querySelectorAll('.leg'));
  var countries = Array.prototype.slice.call(svg.querySelectorAll('.country'));
  var pins = Array.prototype.slice.call(stage.querySelectorAll('.pin'));
  var itins = Array.prototype.slice.call(document.querySelectorAll('.itin'));
  var order = pins.map(function (p) { return p.getAttribute('data-stop'); });
  var card = document.getElementById('fieldcard');
  var cardBody = card.querySelector('[data-fieldcard-body]');
  var btnPrev = card.querySelector('[data-card-prev]');
  var btnNext = card.querySelector('[data-card-next]');
  var btnClose = card.querySelector('[data-card-close]');
  var roLabel = viewport.querySelector('[data-readout-label]');
  var roLat = viewport.querySelector('[data-readout-lat]');
  var roLon = viewport.querySelector('[data-readout-lon]');

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phoneMQ = window.matchMedia('(max-width: 759px)');

  var current = null;
  var returnFocus = null;
  var view = { z: 1, x: 0, y: 0 };

  function pinFor(id) { for (var i = 0; i < pins.length; i++) if (pins[i].getAttribute('data-stop') === id) return pins[i]; return null; }
  function titleOf(id) {
    var el = document.querySelector('#stop-' + id + ' .stop-title');
    return el ? el.textContent.replace(/^Stop \d+:\s*/, '').trim() : id;
  }

  /* ---------- view / zoom ---------- */
  function stageSize() { return { w: stage.offsetWidth, h: stage.offsetHeight }; }
  function pinPoint(pin) {
    var s = stageSize();
    return {
      x: parseFloat(pin.style.getPropertyValue('--x')) / 100 * s.w,
      y: parseFloat(pin.style.getPropertyValue('--y')) / 100 * s.h
    };
  }
  function clampView(v) {
    var s = stageSize(), vw = viewport.clientWidth, vh = viewport.clientHeight;
    var w = s.w * v.z, h = s.h * v.z;
    v.x = w <= vw ? (vw - w) / 2 : Math.min(0, Math.max(vw - w, v.x));
    v.y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, v.y));
    return v;
  }
  function defaultView() {
    var s = stageSize(), vw = viewport.clientWidth, vh = viewport.clientHeight;
    var z = Math.max(1, vh / s.h);
    // centre on the middle of the route (roughly the South Atlantic)
    var cx = 0.565 * s.w, cy = 0.46 * s.h;
    return clampView({ z: z, x: vw / 2 - z * cx, y: vh / 2 - z * cy });
  }
  function stopView(id) {
    var pin = pinFor(id), s = stageSize(), vw = viewport.clientWidth, vh = viewport.clientHeight;
    var base = defaultView().z;
    var zoom = parseFloat(pin.getAttribute('data-zoom')) || 2;
    var z = Math.max(base, phoneMQ.matches ? zoom * 0.82 : zoom);
    var visibleW = vw;
    if (!phoneMQ.matches) visibleW = vw - card.offsetWidth - 28;
    var p = pinPoint(pin);
    var v = { z: z, x: visibleW / 2 - z * p.x, y: vh / 2 - z * p.y };
    // keep the map from sliding off vertically
    var h = s.h * z;
    v.y = h <= vh ? (vh - h) / 2 : Math.min(0, Math.max(vh - h, v.y));
    return v;
  }
  function apply(v, animate) {
    view = v;
    var anim = animate && !reduceMQ.matches;
    stage.classList.toggle('is-animating', !!anim);
    stage.style.setProperty('--z', v.z.toFixed(4));
    stage.style.setProperty('--tx', v.x.toFixed(2) + 'px');
    stage.style.setProperty('--ty', v.y.toFixed(2) + 'px');
  }

  /* ---------- readout ---------- */
  var A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796, MM = Math.sqrt(3) / 2;
  function invert(X, Y) {
    var x = (X - TX) / K, y = (TY - Y) / K, l = y, l2, l6, i, fy, fpy, d;
    for (i = 0; i < 12; i++) {
      l2 = l * l; l6 = l2 * l2 * l2;
      fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
      fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
      d = fy / fpy; l -= d;
      if (Math.abs(d) < 1e-9) break;
    }
    l2 = l * l; l6 = l2 * l2 * l2;
    var s = Math.sin(l) / MM;
    if (Math.abs(s) > 1) return null;
    var lon = MM * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / Math.cos(l) * 180 / Math.PI;
    var lat = Math.asin(s) * 180 / Math.PI;
    if (Math.abs(lon) > 180 || lat < -58) return null;
    return [lon, lat];
  }
  function fmt(v, pos, neg) { return Math.abs(v).toFixed(2) + '° ' + (v >= 0 ? pos : neg); }
  function readoutStop(id) {
    var pin = pinFor(id || 'goettingen');
    roLabel.textContent = id ? ('Stop ' + pin.querySelector('.pin-badge').textContent + ' · ' + pin.querySelector('.pin-label').firstChild.textContent.trim())
                             : 'Now · Göttingen';
    roLat.textContent = pin.getAttribute('data-lat');
    roLon.textContent = pin.getAttribute('data-lon');
  }
  viewport.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch' || card.contains(e.target)) return;
    var r = viewport.getBoundingClientRect(), s = stageSize();
    var sx = (e.clientX - r.left - view.x) / view.z, sy = (e.clientY - r.top - view.y) / view.z;
    var ll = invert(vb.x + sx / s.w * vb.width, vb.y + sy / s.h * vb.height);
    if (!ll) { readoutStop(current); return; }
    roLabel.textContent = 'Cursor';
    roLat.textContent = fmt(ll[1], 'N', 'S');
    roLon.textContent = fmt(ll[0], 'E', 'W');
  });
  viewport.addEventListener('pointerleave', function () { readoutStop(current); });

  /* ---------- field card ---------- */
  function renderCard(id) {
    var src = document.getElementById('stop-' + id);
    if (!src) return;
    var clone = src.cloneNode(true);
    clone.removeAttribute('id');
    Array.prototype.forEach.call(clone.querySelectorAll('[id]'), function (el) { el.id = el.id + '-card'; });
    clone.setAttribute('aria-labelledby', clone.getAttribute('aria-labelledby') + '-card');
    Array.prototype.forEach.call(clone.querySelectorAll('.show-on-map'), function (el) { el.remove(); });
    var title = clone.querySelector('.stop-title');
    if (title) title.setAttribute('tabindex', '-1');
    cardBody.innerHTML = '';
    cardBody.appendChild(clone);
    cardBody.scrollTop = 0;
    if (window.celinePh) window.celinePh.refresh();

    var i = order.indexOf(id);
    var prev = order[(i - 1 + order.length) % order.length], next = order[(i + 1) % order.length];
    btnPrev.setAttribute('data-goto', prev);
    btnNext.setAttribute('data-goto', next);
    btnPrev.setAttribute('aria-label', 'Previous stop: ' + titleOf(prev));
    btnNext.setAttribute('aria-label', 'Next stop: ' + titleOf(next));
  }

  function highlight(id) {
    pins.concat(itins).forEach(function (el) {
      if (el.getAttribute('data-stop') === id) el.setAttribute('aria-current', 'true');
      else el.removeAttribute('aria-current');
    });
    var pin = id && pinFor(id);
    var country = pin ? pin.getAttribute('data-country') : null;
    countries.forEach(function (c) { c.classList.toggle('is-active', !!country && c.id === 'country-' + country); });
    // highlight the leg that arrives at this stop (or leaves it, for the first stop)
    route.classList.toggle('has-active', !!id);
    legs.forEach(function (l) {
      var on = !!id && (l.getAttribute('data-to') === id || (id === order[0] && l.getAttribute('data-from') === id));
      l.classList.toggle('is-active', on);
    });
  }

  function open(id, opts) {
    opts = opts || {};
    if (!pinFor(id)) return;
    if (!card.classList.contains('is-open')) returnFocus = opts.trigger || document.activeElement;
    current = id;
    renderCard(id);
    highlight(id);
    readoutStop(id);
    card.classList.add('is-open');
    if (phoneMQ.matches) {
      var r = viewport.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight * 0.38) {
        window.scrollTo({ top: window.pageYOffset + r.top - 8, behavior: reduceMQ.matches ? 'auto' : 'smooth' });
      }
    }
    // let the sidebar width settle before computing the view
    requestAnimationFrame(function () { apply(stopView(id), true); });
    if (opts.focus !== false) {
      var t = cardBody.querySelector('.stop-title');
      setTimeout(function () { (t || card).focus({ preventScroll: true }); }, 30);
    }
  }

  function close(opts) {
    opts = opts || {};
    if (!current) return;
    current = null;
    card.classList.remove('is-open');
    highlight(null);
    readoutStop(null);
    apply(defaultView(), true);
    if (opts.restoreFocus !== false && returnFocus && document.contains(returnFocus)) {
      returnFocus.focus({ preventScroll: true });
    }
    returnFocus = null;
  }

  function onSelect(e) {
    var id = this.getAttribute('data-stop');
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
    e.preventDefault();
    if (current === id && card.classList.contains('is-open')) { close(); return; }
    open(id, { trigger: this });
  }
  pins.forEach(function (p) { p.setAttribute('aria-controls', 'fieldcard'); p.addEventListener('click', onSelect); });
  itins.forEach(function (a) { a.setAttribute('aria-controls', 'fieldcard'); a.addEventListener('click', onSelect); });

  card.addEventListener('click', function (e) {
    var go = e.target.closest('[data-goto]');
    if (go && card.contains(go)) {
      e.preventDefault();
      open(go.getAttribute('data-goto'), { trigger: returnFocus });
    }
  });
  btnClose.addEventListener('click', function () { close(); });
  document.addEventListener('keydown', function (e) {
    if (!current) return;
    if (e.key === 'Escape') { close(); }
    else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && card.contains(document.activeElement) && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) {
      var i = order.indexOf(current);
      open(order[(i + (e.key === 'ArrowRight' ? 1 : -1) + order.length) % order.length], { trigger: returnFocus });
    }
  });

  // "Show on map" buttons on the in-page stop cards
  Array.prototype.forEach.call(document.querySelectorAll('.show-on-map'), function (b) {
    b.hidden = false;
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-show');
      var atlas = document.getElementById('map');
      atlas.scrollIntoView({ behavior: reduceMQ.matches ? 'auto' : 'smooth', block: 'start' });
      setTimeout(function () { open(id, { trigger: b }); }, reduceMQ.matches ? 0 : 450);
    });
  });

  /* ---------- layout ---------- */
  function relayout() {
    apply(current ? stopView(current) : defaultView(), false);
  }
  if ('ResizeObserver' in window) new ResizeObserver(relayout).observe(viewport);
  else window.addEventListener('resize', relayout);
  if (phoneMQ.addEventListener) phoneMQ.addEventListener('change', relayout);
  relayout();
  readoutStop(null);

  // pause the marching-ants animation while the map is off screen
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { route.style.animationPlayState = ''; legs.forEach(function (l) { l.style.animationPlayState = en.isIntersecting ? 'running' : 'paused'; }); });
    }).observe(viewport);
  }
})();
