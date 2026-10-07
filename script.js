/* Aadesh Salecha — site interactions (no dependencies) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     Illustration slots.
     Drop generated images into assets/ using the filenames named in
     each element's data-illustration attribute, then set this to true.
     Each slot keeps its inline SVG doodles if its image is missing.
     ------------------------------------------------------------------ */
  var ENABLE_ILLUSTRATIONS = false;

  if (ENABLE_ILLUSTRATIONS) {
    document.querySelectorAll('[data-illustration]').forEach(function (slot) {
      var img = new Image();
      img.alt = '';
      img.decoding = 'async';
      img.onload = function () {
        slot.textContent = '';
        slot.appendChild(img);
        slot.classList.add('has-illustration');
      };
      img.src = slot.getAttribute('data-illustration');
    });
  }

  /* ---------------- Bio Short / Long toggle ---------------- */
  var buttons = document.querySelectorAll('.toggle-btn[data-bio]');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var which = btn.getAttribute('data-bio');
      document.getElementById('bio-short').hidden = which !== 'short';
      document.getElementById('bio-long').hidden = which !== 'long';
      buttons.forEach(function (b) {
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
      });
    });
  });

  /* ---------------- Citation chart tooltip ---------------- */
  var box = document.querySelector('.chart-box');
  var tip = box && box.querySelector('.chart-tip');
  if (box && tip) {
    var show = function (bar) {
      var shape = bar.querySelector('.shape');
      var b = shape.getBoundingClientRect();
      var c = box.getBoundingClientRect();
      var v = bar.getAttribute('data-value');
      tip.textContent = bar.getAttribute('data-year') + ': ' + v + ' citation' + (v === '1' ? '' : 's');
      tip.hidden = false;
      var x = b.left - c.left + b.width / 2;
      var half = tip.offsetWidth / 2;
      x = Math.max(half, Math.min(c.width - half, x));
      tip.style.left = x + 'px';
      tip.style.top = Math.max(tip.offsetHeight, b.top - c.top - 30) + 'px';
    };
    var hide = function () { tip.hidden = true; };
    box.querySelectorAll('.bar').forEach(function (bar) {
      bar.addEventListener('pointerenter', function () { show(bar); });
      bar.addEventListener('pointerleave', hide);
      bar.addEventListener('focus', function () { show(bar); });
      bar.addEventListener('blur', hide);
    });
  }
})();
