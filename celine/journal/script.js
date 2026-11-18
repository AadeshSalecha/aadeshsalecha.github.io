/* Field Journal: ink lines draw in as each plate scrolls into view,
   and the thumb-index tab of the current section is marked.
   Nothing here is required to read the page. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var plates = document.querySelectorAll('.ink-in');

  // Strokes are only hidden (by CSS) once this class is present, so a failed
  // script never leaves drawings blank.
  root.classList.add('ink-ready');

  function inkAll() { plates.forEach(function (el) { el.classList.add('inked'); }); }

  if (reduce || !('IntersectionObserver' in window)) {
    inkAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('inked'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    plates.forEach(function (el) { io.observe(el); });
    // Printing should show every drawing.
    window.addEventListener('beforeprint', inkAll);
  }

  // Thumb-index: mark the tab for the section in view.
  var tabs = document.querySelectorAll('.tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    var byId = {};
    tabs.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        tabs.forEach(function (a) { a.removeAttribute('aria-current'); });
        var t = byId[e.target.id];
        if (t) t.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) spy.observe(s);
    });
  }
})();
