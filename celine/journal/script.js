/* Field Journal: ink lines draw in as each plate scrolls into view, the
   timeline tree grows branch by branch, and the current section's tab is marked.
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

  // Plate I: the tree grows (oldest branch first) once it is well in view.
  // "grow it again" resets it to bare ground and replays.
  var tree = document.querySelector('.grow-in');
  if (tree) {
    var grow = function () { tree.classList.add('grown'); };
    if (reduce || !('IntersectionObserver' in window)) {
      grow();
    } else {
      var tio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          if (e.intersectionRatio >= 0.35 || e.intersectionRect.height >= window.innerHeight * 0.6) {
            grow(); tio.disconnect();
          }
        });
      }, { threshold: [0, 0.2, 0.35, 0.5, 0.6, 0.8] });
      tio.observe(tree);
      window.addEventListener('beforeprint', grow);
      var again = tree.querySelector('.regrow');
      if (again) {
        again.hidden = false;
        again.addEventListener('click', function () {
          tree.classList.remove('grown');
          void tree.getBoundingClientRect(); // commit the bare state before growing again
          requestAnimationFrame(function () { requestAnimationFrame(grow); });
        });
      }
    }
  }

  // Film clips: muted, play while on screen (unless reduced motion), with a pause button.
  // Without JS they keep native controls. Missing files are swapped for placeholders by ph.js.
  document.querySelectorAll('video.snap-video').forEach(function (v) {
    v.removeAttribute('controls');
    v.muted = true;
    var userPaused = reduce; // reduced motion: start paused, the button plays it
    var btn = null;
    function label() {
      if (!btn) return;
      var playing = !v.paused;
      btn.textContent = playing ? '\u275A\u275A' : '\u25B6';
      btn.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
    }
    function addButton() {
      if (btn || !v.isConnected) return;
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vid-toggle';
      btn.addEventListener('click', function () {
        if (v.paused) { userPaused = false; v.play().catch(function () {}); }
        else { userPaused = true; v.pause(); }
      });
      v.parentNode.appendChild(btn);
      label();
    }
    v.addEventListener('loadeddata', addButton);
    if (v.readyState >= 2) addButton();
    v.addEventListener('play', label);
    v.addEventListener('pause', label);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !userPaused) v.play().catch(function () {});
          else if (!e.isIntersecting) v.pause();
        });
      }, { threshold: 0.35 }).observe(v);
    }
  });

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
