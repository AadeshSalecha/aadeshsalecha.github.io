/* TRANSECT · small enhancements: reveals, running header, progress, map crop */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* 1. Scroll reveals (CSS only hides [data-reveal] when motion is allowed) */
  var revealables = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce.matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* 2. Running header appears once the cover is gone */
  var bar = document.getElementById('topbar');
  var cover = document.querySelector('.cover');
  if (bar && cover && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { rootMargin: '-60px 0px 0px 0px' }).observe(cover);
  } else if (bar) {
    bar.classList.add('is-visible');
  }

  /* 3. Reading progress along the header rule */
  var prog = document.getElementById('progress');
  var ticking = false;
  function updateProgress() {
    ticking = false;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
    if (prog) prog.style.setProperty('--p', p.toFixed(4));
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  /* 4. Highlight the current section in the header */
  var links = Array.prototype.slice.call(document.querySelectorAll('.topbar-links a'));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-current'); l.removeAttribute('aria-current'); });
          a.classList.add('is-current');
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) secIO.observe(s);
    });
  }

  /* 5. On narrow screens, crop the world map to the Atlantic so labels stay legible */
  var map = document.getElementById('map');
  if (map) {
    var full = map.getAttribute('viewBox');
    var crop = map.getAttribute('data-crop');
    var mq = window.matchMedia('(max-width: 640px)');
    var setBox = function () { map.setAttribute('viewBox', mq.matches && crop ? crop : full); };
    setBox();
    if (mq.addEventListener) mq.addEventListener('change', setBox);
    else if (mq.addListener) mq.addListener(setBox);
  }
})();
