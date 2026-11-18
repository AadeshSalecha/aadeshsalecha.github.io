/* Canopy to Coral: transect position marker, gentle parallax, mobile zone menu.
   Parallax is skipped entirely when the visitor prefers reduced motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var zones = Array.prototype.slice.call(document.querySelectorAll('[data-zone-name]'));
  var nav = document.querySelector('.transect');
  var links = Array.prototype.slice.call(document.querySelectorAll('.transect [data-zone-link]'));
  var marker = document.querySelector('.transect__marker');
  var nowEls = Array.prototype.slice.call(document.querySelectorAll('[data-zone-now]'));
  var toggle = document.querySelector('.transect__toggle');
  var layers = Array.prototype.slice.call(document.querySelectorAll('[data-speed]')).map(function (el) {
    return { el: el, speed: parseFloat(el.getAttribute('data-speed')) || 0, band: el.closest('.band') };
  });
  var current = -1, ticking = false, lastY = window.scrollY;

  function setZone(i) {
    if (i === current || !zones[i]) return;
    current = i;
    links.forEach(function (a, j) {
      if (j === i) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    nowEls.forEach(function (el) { el.textContent = zones[i].getAttribute('data-zone-name'); });
    if (nav) nav.style.setProperty('--zone-c', zones[i].getAttribute('data-zone-color'));
  }

  function update() {
    ticking = false;
    var vh = window.innerHeight;
    var probe = vh * 0.45, idx = 0, prog = 0;
    var rects = zones.map(function (z) { return z.getBoundingClientRect(); });
    for (var i = 0; i < rects.length; i++) {
      if (rects[i].top <= probe) {
        idx = i;
        prog = Math.min(1, Math.max(0, (probe - rects[i].top) / rects[i].height));
      }
    }
    // at the very bottom, the last zone is fully reached
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) { idx = zones.length - 1; prog = 1; }
    setZone(idx);
    if (nav && !nav.classList.contains('is-open')) {
      // mobile pill: hidden over the hero, tucked away while scrolling down, back when scrolling up
      var y = window.scrollY;
      nav.classList.toggle('at-top', y < vh * 0.55);
      if (Math.abs(y - lastY) > 6) { nav.classList.toggle('is-tucked', y > lastY && y > vh); lastY = y; }
    }
    if (marker) {
      var p = idx === zones.length - 1 ? 1 : (idx + prog) / (zones.length - 1);
      marker.style.setProperty('--p', Math.min(1, p).toFixed(4));
    }
    if (reduce.matches) return;
    for (var k = 0; k < layers.length; k++) {
      var l = layers[k];
      if (!l.band) continue;
      var r = l.band.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) continue;
      var off = (vh / 2 - (r.top + r.height / 2)) * l.speed;
      l.el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  var onPref = function () {
    if (reduce.matches) layers.forEach(function (l) { l.el.style.transform = ''; });
    onScroll();
  };
  if (reduce.addEventListener) reduce.addEventListener('change', onPref);
  else if (reduce.addListener) reduce.addListener(onPref);
  update();

  // mobile: the zone pill opens a list of zones
  function setOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    links.forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target)) setOpen(false);
    });
  }
})();
