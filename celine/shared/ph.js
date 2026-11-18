/*
  Image placeholder helper, shared by every Celine design variant.

  Contract: every image that may not exist yet is written as
    <img src="../photos/utila-whaleshark.jpg" data-slot="utila-whaleshark"
         data-hint="Whale shark at the surface off Utila" alt="...">
  If the file fails to load, the <img> is swapped for
    <span class="ph" data-kind="photo|art" role="img" aria-label="...">
      <span class="ph-slot">utila-whaleshark</span>
      <span class="ph-hint">Whale shark at the surface off Utila</span>
    </span>
  The span copies the img's class and inline style, so it sits in the same box.
  Videos work the same way: <video data-slot=".." data-hint=".." width height>
  with <source> children; if no source loads, it becomes a data-kind="video" placeholder.
  Each variant styles .ph / .ph-slot / .ph-hint itself, to match its look.
  data-kind defaults to "photo" for ../photos/ paths, else "art".
  Drop the real file at the same path and the image appears; nothing else to change.
*/
(function () {
  function swap(img) {
    if (img.dataset.phDone) return;
    img.dataset.phDone = '1';
    var src = img.getAttribute('src') || '';
    var ph = document.createElement('span');
    ph.className = ('ph ' + (img.className || '')).trim();
    if (img.getAttribute('style')) ph.setAttribute('style', img.getAttribute('style'));
    var isVideo = img.tagName === 'VIDEO';
    if (isVideo) { var s0 = img.querySelector('source'); src = (s0 && s0.getAttribute('src')) || src; }
    ph.dataset.kind = img.dataset.kind || (isVideo ? 'video' : (src.indexOf('photos/') !== -1 ? 'photo' : 'art'));
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', img.getAttribute('alt') || img.dataset.hint || 'Image coming soon');
    var w = img.getAttribute('width'), h = img.getAttribute('height');
    if (w && h) ph.style.aspectRatio = w + ' / ' + h;
    var slot = document.createElement('span');
    slot.className = 'ph-slot';
    slot.textContent = img.dataset.slot || src.split('/').pop();
    var hint = document.createElement('span');
    hint.className = 'ph-hint';
    hint.textContent = img.dataset.hint || img.getAttribute('alt') || '';
    ph.appendChild(slot);
    if (hint.textContent) ph.appendChild(hint);
    img.replaceWith(ph);
  }
  function check(img) {
    if (img.complete && img.naturalWidth === 0) swap(img);
    else img.addEventListener('error', function () { swap(img); }, { once: true });
  }
  function checkVideo(v) {
    var sources = v.querySelectorAll('source');
    var last = sources[sources.length - 1];
    (last || v).addEventListener('error', function () { swap(v); }, { once: true });
    // Safety net: nothing could be loaded at all (e.g. the error fired before we listened).
    setTimeout(function () { if (v.isConnected && v.readyState === 0 && v.networkState === 3) swap(v); }, 4000);
  }
  function init() {
    document.querySelectorAll('img[data-slot]').forEach(check);
    document.querySelectorAll('video[data-slot]').forEach(checkVideo);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
  window.celinePh = { refresh: init };
})();
