(function () {
  'use strict';

  /* ---- Bio length toggle ---- */
  var buttons = document.querySelectorAll('.seg[data-bio]');
  var panels = { short: document.getElementById('bio-short'), long: document.getElementById('bio-long') };
  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('click', function () {
      var which = btn.getAttribute('data-bio');
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== which; });
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    });
  });

  /* ---- Theme toggle ---- */
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function current() {
    var t = root.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return mq && mq.matches ? 'dark' : 'light';
  }
  function label() {
    if (!toggle) return;
    var next = current() === 'dark' ? 'light' : 'dark';
    toggle.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
  }
  if (mq) {
    var onChange = function () { label(); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
  label();
})();
