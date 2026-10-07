/* v3 — Planetary intelligence. No dependencies. */
(function () {
  'use strict';

  var reduceMQ = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---------------- Bio toggle ---------------- */
  var btns = document.querySelectorAll('.toggle-btn');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var which = btn.getAttribute('data-bio');
      document.getElementById('bio-short').hidden = which !== 'short';
      document.getElementById('bio-long').hidden = which !== 'long';
      btns.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
    });
  });

  /* ---------------- Globe ---------------- */
  // Coarse continent outlines [lon, lat] — hand-simplified, illustrative only.
  var LAND = [
    // North America
    [[-168,66],[-162,70],[-156,71.3],[-140,69.6],[-128,70],[-115,68.5],[-95,68],[-82,69],[-80,63],[-94,59],[-92,57],[-82,55],[-79,51.5],[-77,58],[-73,62],[-64,60],[-61,56],[-56,52],[-60,47],[-66,45],[-70,43],[-70,41.5],[-74,40.5],[-76,37],[-75.5,35],[-81,31.5],[-80,27],[-80.2,25.2],[-81.5,25.5],[-83,29],[-85,30],[-89,30],[-94,29.5],[-97,27.5],[-97.5,22],[-96,19],[-94,18.5],[-91,19],[-90.5,21],[-87,21.5],[-88,18],[-88,16],[-84,15.5],[-83.5,11],[-79.5,9],[-77.5,8.5],[-79.5,7.5],[-81,8],[-85.5,10],[-87.5,13],[-92,14.5],[-96,15.7],[-100,17],[-105.5,20],[-105.5,23],[-109,26],[-112.5,30],[-114.5,31.5],[-112,28],[-110,24],[-110,23],[-112,24.5],[-114,27.5],[-115,30],[-117,32.5],[-120.5,34.5],[-122.5,37.5],[-124,40.5],[-124.5,43],[-124,46.5],[-124.7,48.4],[-123,49],[-127,51],[-130,54.5],[-133,57.5],[-137,58.5],[-141,60],[-147,61],[-152,59],[-155,57.5],[-158,56.5],[-163,55],[-158,58],[-162,59],[-164,61],[-165,63],[-161,64.5],[-166,65.5]],
    // Greenland
    [[-73,78],[-68,80.5],[-58,82],[-40,83.5],[-25,83],[-18,81],[-20,77],[-19,73],[-22,70],[-30,68],[-40,65],[-43,60],[-48,61],[-52,64.5],[-54,68],[-56,72],[-62,76],[-70,77]],
    // Arctic Canada
    [[-62,66.5],[-68,62.5],[-75,64.5],[-79,68],[-90,70.5],[-88,73],[-80,73.8],[-72,72],[-66,70]],
    [[-95,75],[-110,74],[-120,76],[-118,78],[-100,80],[-85,82],[-70,83],[-62,82],[-75,79],[-80,77],[-90,76]],
    [[-117,69],[-101,68.5],[-101,73],[-115,73.5],[-120,71.5]],
    // South America
    [[-77.5,8.5],[-75,11],[-71.5,12.5],[-68,10.6],[-62,10.7],[-60,8.5],[-57,6],[-52,5],[-50,1.5],[-48,-1],[-44,-2.5],[-39,-3.5],[-35,-5.5],[-35,-9],[-37.5,-13],[-39,-17.5],[-40,-21],[-42,-23],[-46,-24],[-48.5,-26.5],[-48.5,-28.5],[-52,-32],[-54,-34.5],[-57,-35],[-57.5,-38],[-62,-39],[-62.5,-41],[-65,-42],[-64,-44.5],[-67.5,-46.5],[-66,-48],[-69,-51],[-68.5,-52.5],[-70,-54],[-73,-54],[-75,-50],[-74,-44],[-73.5,-40],[-73.5,-37],[-71.5,-32],[-71.4,-28],[-70.4,-23],[-70,-18.5],[-71.5,-17],[-76,-14],[-79,-8],[-81.2,-5],[-80,-2],[-80,1],[-78.5,2.5],[-77.5,4],[-77.3,7]],
    // Eurasia
    [[-9,37],[-9.5,39],[-8.8,42],[-9,43.3],[-2,43.4],[-1.4,46],[-4.5,48],[-1.5,48.7],[1.5,50.2],[4,51.5],[5,53],[8.5,53.8],[8.6,55.5],[8.2,57],[10.5,57.7],[10.8,56],[12.5,55.6],[11,54.2],[14,54],[18,54.8],[21,55],[21,57],[24,57.3],[24,58.4],[23,59.3],[28,59.6],[30,60],[23,60],[21.5,61],[21.5,63],[25,65],[22,65.8],[17.5,62.5],[17.5,61],[19,59.8],[16.5,57.5],[16,56.2],[12.8,55.4],[11,58.8],[8,58],[5.5,58.8],[5,61.5],[8,63.5],[12.5,66],[15.5,68.5],[19,70],[24,71],[28.5,71],[31,70],[33,69.3],[40,67.5],[41,66.4],[35,66.2],[37,64],[40,64.5],[44,66.3],[44,68.5],[46,68.3],[54,68.5],[60,69],[66,69.5],[68.5,72],[72,72.8],[73,68],[74,72],[78,72.4],[81,73.5],[87,74.5],[90,75.5],[100,76.5],[105,77.6],[112,76.5],[113.5,73.5],[120,73],[128,73],[130,71],[140,72.5],[150,71.5],[160,70.5],[170,70],[176,69.8],[180,69],[180,65],[178,64.5],[176,62.5],[171,60],[163,59.8],[163,57.5],[161.5,55.5],[156.5,51],[156,57],[158,61.5],[154,59.2],[143,59.3],[137,54],[141.4,52.2],[140,48],[135,43.5],[131,42.6],[129.5,41],[128,39],[129.4,37],[129.2,35.2],[126.5,34.4],[126.2,36.8],[125,39.5],[121.5,38.8],[121,40.7],[118,39.2],[119,37],[122.5,37.2],[120.5,36],[119.5,34.5],[121,32],[122,30],[121.5,28],[119.5,25.5],[117,23.5],[113.5,22.2],[110.5,20.4],[108.5,21.6],[106.5,20],[105.6,18.5],[106.8,16.5],[108.8,15.3],[109.3,12],[107,10.5],[105,8.6],[104.8,10.4],[102.5,12.3],[100.8,13.5],[99.2,10],[100.3,8.4],[101.5,6.8],[103.4,4.8],[104.2,1.4],[103.4,1.3],[101.3,2.8],[100.3,5.4],[98.4,8],[98.5,10.8],[97.7,15.5],[97,16.8],[94.4,16],[94,19],[92.4,20.7],[91.8,22.5],[90.6,22.1],[89,21.8],[87,21.5],[86.9,20.8],[85,19.4],[82.2,16.6],[80.2,15.5],[80.2,13.3],[79.8,10.3],[78.2,8.9],[77.5,8.1],[76.6,8.9],[75.7,11.3],[74.6,14],[73.4,16],[72.8,19.2],[72.6,21.4],[72.6,22.4],[70.4,20.9],[68.9,22.4],[70.2,23],[67.5,23.8],[66.4,25.4],[61.5,25.1],[57.4,25.8],[56.4,27.1],[54.7,26.5],[51.5,27.9],[50,30.2],[48,30],[48.5,28.5],[50,26.5],[50.8,25],[51.6,24.2],[54,24.1],[56,26.3],[56.4,24.9],[58.7,23.6],[59.8,22.5],[57.8,19],[55.3,17.3],[52,15.6],[49,14],[45,12.9],[43.4,12.7],[42.6,15.5],[40.5,19.8],[39,22],[38,24],[35.2,28],[35,29.5],[34.5,31.5],[35.5,33.9],[36,35.5],[36.2,36.6],[34,36.3],[30.5,36.4],[27.3,37],[26.3,39.5],[26,40.8],[23.5,40.2],[22.6,40.5],[23,38],[22.5,36.5],[21.6,37],[21,38.5],[19.5,40.3],[19.4,41.8],[16,43.5],[13.6,45.6],[12.3,45.3],[12.4,44.2],[14,42.5],[16,41.4],[18.5,40.2],[17,39],[16.6,38],[15.7,38],[16,39.5],[15.5,40],[14,40.8],[12,41.8],[10.5,42.9],[10,44],[8.5,44.3],[7,43.6],[4,43.4],[3,42],[3.2,41.8],[0.8,40.7],[0,39],[-0.6,37.6],[-2.1,36.7],[-4.4,36.7],[-5.6,36],[-6.3,36.8],[-7.4,37.2]],
    // Africa
    [[-17,21],[-17,24.5],[-15,27.5],[-13,28],[-9.8,30],[-9.5,32.5],[-6.8,34],[-5.9,35.8],[-2,35.1],[1,36.5],[5,36.8],[9.8,37.3],[11,37],[10,35.5],[11,35],[10,33.6],[11.5,33.1],[15.2,32.3],[19.5,30.4],[20,32],[23,32.6],[25,31.8],[29,30.9],[32.3,31.3],[34.2,31.3],[34.9,29.5],[33.8,27],[35.6,23.9],[37.2,21],[37.4,18.6],[38.6,17.5],[39.7,15.3],[41.7,13.5],[43.3,12.4],[43.1,11.5],[44.5,10.4],[46,10.7],[51.2,11.8],[51,10.4],[49.5,6.5],[47.5,4],[44,1],[41.5,-1.7],[39.6,-4.5],[38.8,-6.5],[39.5,-8.5],[40.5,-10.5],[40.5,-15],[37,-17.5],[35,-19.8],[35.5,-24],[32.8,-25.8],[32.5,-29],[30,-31.3],[27.5,-33.3],[25.5,-34],[22,-34.2],[20,-34.8],[18.4,-34],[18,-32],[17,-29],[15,-27],[14.5,-23],[12,-18.5],[11.8,-16.5],[13.7,-11.5],[13,-8.5],[12.2,-6],[9.5,-2.5],[9.3,0.5],[9.8,3],[8.5,4.5],[6,4.3],[4.5,6.3],[2,6.3],[-1,5],[-4,5.2],[-7.5,4.4],[-9.5,5.4],[-11.5,6.9],[-13.2,8.7],[-15,11],[-16.7,12.5],[-17.5,14.7],[-16.5,16.5],[-16,19]],
    // Madagascar
    [[49.3,-12],[50.5,-15.5],[49.5,-17.5],[47.2,-25],[45,-25.5],[43.5,-22],[44,-17],[46.5,-15.7],[48,-13.5]],
    // Australia, Tasmania, New Zealand
    [[113.5,-22],[114,-26],[115,-34],[118,-35],[123.5,-33.9],[126,-32.3],[131,-31.5],[134,-32.5],[136,-35],[138,-34.5],[138.5,-35.7],[140,-37.5],[143.5,-38.8],[146.3,-39.1],[150,-37.5],[150.5,-35],[153,-31],[153.5,-28],[153,-25],[150.8,-22.5],[149,-20.5],[146.3,-18.9],[145.3,-15],[143.5,-14],[142.5,-10.7],[141.6,-13],[141.5,-17],[140,-17.7],[135.5,-15],[136.8,-12.2],[132.5,-11.4],[130,-13],[129.4,-15],[127,-13.8],[125,-15],[122.2,-17.3],[121,-19.5],[117,-20.6]],
    [[144.6,-40.7],[148.3,-40.9],[148,-43.2],[146,-43.6]],
    [[172.7,-34.5],[174.6,-36.2],[178.5,-37.7],[177,-39.3],[175.3,-41.6],[174.6,-39.8]],
    [[172.7,-40.5],[174.3,-41.8],[173,-43.8],[171.2,-44.5],[169,-46.6],[166.5,-46],[168.3,-44],[171.5,-41.8]],
    // Japan
    [[130,31.3],[131.5,31.4],[132,33.8],[135,33.5],[136.9,34.3],[139.8,35],[140.9,36.9],[141.5,38.3],[142,39.5],[141.4,41.4],[140,40.6],[140,39.4],[139.2,38],[137.3,37],[136,36],[133,35.5],[131,34.4],[129.8,33.2]],
    [[140,41.4],[141.5,42.5],[143.3,42],[145.5,43.3],[145.3,44.3],[141.7,45.4],[141.4,43.3],[140.4,43.3]],
    // British Isles, Iceland
    [[-5.7,50],[1.4,51.2],[1.7,52.7],[0,53.5],[-1.3,54.8],[-2,55.9],[-1.8,57.6],[-3.1,58.6],[-5,58.6],[-6.2,57.5],[-5.6,56.3],[-4.8,54.8],[-3,54],[-3.2,53.3],[-4.6,53.3],[-4.2,52.2],[-5.3,51.7],[-3.2,51.4]],
    [[-6,52],[-6.2,53.9],[-5.9,55.2],[-7.4,55.3],[-8.5,54.5],[-10,53.5],[-10.4,51.8],[-8,51.5]],
    [[-22.5,64],[-24,65.5],[-22,66.4],[-16,66.5],[-13.6,65.2],[-15,64.3],[-18.5,63.4]],
    // South & Southeast Asia islands
    [[79.8,9.8],[81.9,7.5],[81.5,6.2],[80,6],[79.7,8]],
    [[95.3,5.6],[98,4],[100.5,1.5],[104,-1.5],[106,-3.3],[105.8,-5.8],[104.5,-5.8],[101,-2.6],[99,0],[97,3]],
    [[109,1.5],[110,-1],[110.2,-2.9],[114.5,-3.8],[116.5,-3],[117.6,0.5],[119,1],[117.8,4.3],[119.2,5.3],[117,7],[115.4,5],[113,3.2],[111,1.6]],
    [[105.2,-6.8],[108,-6.3],[111,-6.5],[114.5,-7.7],[114.4,-8.7],[110,-8.1],[106.5,-7.4]],
    [[119.4,-5.5],[120.4,-5.6],[120.8,-2.6],[123.3,-4.6],[122,-1.5],[121.5,0.5],[125,1.5],[120.8,1.2],[119.7,-0.5],[119,-3.5]],
    [[131,-1],[134,-0.9],[137.5,-1.5],[141,-2.6],[145.8,-4.8],[147.5,-6.2],[147,-8],[150,-10.5],[146,-8.5],[143.5,-9],[142.5,-9.3],[141,-9.2],[138,-8.4],[137.5,-5],[134,-4],[132,-2.8]],
    [[120.6,18.5],[122.3,18.5],[122,16.5],[121.6,15],[124,13.8],[124,12.5],[120.6,13.8],[120,16]],
    [[122,7],[125.5,9.7],[126.6,7.3],[125.5,5.7],[124,6.3]],
    [[120.1,23],[121,25.2],[122,25],[121,22]],
    [[108.7,19.2],[110.5,20.1],[111,19.5],[109.5,18.2]],
    // Caribbean
    [[-84.9,21.9],[-80.5,23.1],[-77,21.8],[-74.2,20.2],[-77.5,19.9],[-81,21.6]],
    [[-74.4,18.4],[-72.8,19.9],[-70,19.7],[-68.4,18.6],[-71,18],[-74,18]],
    // Arctic islands, Sakhalin
    [[11,78.5],[17,76.6],[22,78],[27,80.2],[18,80.3],[11,79.7]],
    [[52,71.5],[56,70.6],[58,74],[69,76.8],[60,76.5],[54,73.5]],
    [[142,46],[143.5,46.8],[143,49.5],[144.5,52],[142.6,54.3],[142,51.5]],
    // Antarctica
    [[-180,-90],[-180,-75],[-150,-76],[-120,-73],[-90,-72],[-75,-70],[-60,-64],[-58,-70],[-40,-78],[-20,-72],[0,-70],[30,-69],[60,-67],[90,-66],[120,-66.5],[150,-68],[170,-71],[180,-77],[180,-90]]
  ];
  var WATER = [
    [[28,41.3],[29,44.5],[30.5,46.3],[33,46],[36,45.3],[38.5,44.4],[41.5,42],[38,41],[34,42],[31,41.2]], // Black Sea
    [[47,45],[49.5,46.5],[53,46.8],[53,42],[54,39.5],[53.5,37],[50.5,37],[49,38.5],[49.5,40.5],[48,42.5]]  // Caspian
  ];

  function inPoly(x, y, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function isLand(lon, lat) {
    for (var w = 0; w < WATER.length; w++) if (inPoly(lon, lat, WATER[w])) return false;
    for (var k = 0; k < LAND.length; k++) if (inPoly(lon, lat, LAND[k])) return true;
    return false;
  }

  var D2R = Math.PI / 180;
  function angDist(lon1, lat1, lon2, lat2) {
    var a = Math.sin(lat1 * D2R) * Math.sin(lat2 * D2R) + Math.cos(lat1 * D2R) * Math.cos(lat2 * D2R) * Math.cos((lon1 - lon2) * D2R);
    return Math.acos(Math.max(-1, Math.min(1, a))) / D2R;
  }
  // Hyfin focus regions (approximate): South Asia, sub-Saharan Africa
  var FOCUS = [[78, 21, 13], [22, -2, 27]];
  function inFocus(lon, lat) {
    for (var i = 0; i < FOCUS.length; i++) if (angDist(lon, lat, FOCUS[i][0], FOCUS[i][1]) < FOCUS[i][2]) return true;
    return false;
  }

  function vec(lon, lat) { // base unit vector (x toward lon 90, y north, z toward lon 0)
    var cl = Math.cos(lat * D2R);
    return [cl * Math.sin(lon * D2R), Math.sin(lat * D2R), cl * Math.cos(lon * D2R)];
  }

  var land = [], landFocus = [], grat = [];
  (function build() {
    var step = 2.2;
    for (var lat = -80; lat <= 82; lat += step) {
      var n = Math.max(1, Math.round(360 * Math.cos(lat * D2R) / step));
      for (var k = 0; k < n; k++) {
        var lon = -180 + (k + 0.5) * 360 / n;
        if (isLand(lon, lat)) (inFocus(lon, lat) ? landFocus : land).push(vec(lon, lat));
      }
    }
    for (var m = -180; m < 180; m += 30) for (var la = -84; la <= 84; la += 3) grat.push(vec(m, la));
    for (var p = -60; p <= 60; p += 30) {
      var nn = Math.round(360 * Math.cos(p * D2R) / 3);
      for (var q = 0; q < nn; q++) grat.push(vec(-180 + q * 360 / nn, p));
    }
  })();

  var SITES = [
    { lon: -122.17, lat: 37.43, name: 'Stanford · SF' },
    { lon: -122.33, lat: 47.61, name: 'Seattle' },
    { lon: -71.06, lat: 42.36, name: 'Boston' },
    { lon: -93.23, lat: 44.97, name: 'Minneapolis' }
  ];
  SITES.forEach(function (s) { s.v = vec(s.lon, s.lat); });
  var ARCS = [[-122.42, 37.77, 78, 21], [-122.42, 37.77, 22, -2]].map(function (a) {
    var A = vec(a[0], a[1]), B = vec(a[2], a[3]);
    var dot = A[0] * B[0] + A[1] * B[1] + A[2] * B[2], om = Math.acos(dot), so = Math.sin(om), pts = [];
    for (var i = 0; i <= 64; i++) {
      var t = i / 64, s1 = Math.sin((1 - t) * om) / so, s2 = Math.sin(t * om) / so, h = 1 + 0.16 * Math.sin(Math.PI * t);
      pts.push([(A[0] * s1 + B[0] * s2) * h, (A[1] * s1 + B[1] * s2) * h, (A[2] * s1 + B[2] * s2) * h]);
    }
    return pts;
  });

  var canvas = document.getElementById('globe');
  var subsatEl = document.getElementById('subsat');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, R = 0, cx = 0, cy = 0;
    var TILT = 18 * D2R, ct = Math.cos(TILT), st = Math.sin(TILT);
    var spin = 112 * D2R; // start with the Americas in view
    var INC = 98 * D2R, YAW = -28 * D2R, ORB = 1.17;
    var ci = Math.cos(INC), si = Math.sin(INC), cyw = Math.cos(YAW), syw = Math.sin(YAW);
    var theta = 0.4, last = 0, running = false, visible = true, lastHud = 0;

    function resize() {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2; R = Math.min(W, H) * 0.39;
      draw();
    }

    // world -> view (spin about y, then tilt about x)
    var out = [0, 0, 0];
    function view(v, ca, sa) {
      var X = v[0] * ca + v[2] * sa, Z1 = -v[0] * sa + v[2] * ca, Y = v[1];
      out[0] = X; out[1] = Y * ct - Z1 * st; out[2] = Y * st + Z1 * ct;
      return out;
    }
    function orbitPoint(th) {
      var x = Math.cos(th), y = Math.sin(th);
      var y1 = y * ci, z1 = y * si;           // incline about x
      return [(x * cyw + z1 * syw) * ORB, y1 * ORB, (-x * syw + z1 * cyw) * ORB]; // yaw about y
    }
    function occluded(p) { return p[2] < 0 && (p[0] * p[0] + p[1] * p[1]) < 1; }

    function draw() {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      var ca = Math.cos(spin), sa = Math.sin(spin);

      // atmosphere glow
      var g = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35);
      g.addColorStop(0, 'rgba(79,214,242,0.20)'); g.addColorStop(0.3, 'rgba(79,214,242,0.07)'); g.addColorStop(1, 'rgba(79,214,242,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, 7); ctx.fill();
      // disc
      var d = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      d.addColorStop(0, '#0f2440'); d.addColorStop(1, '#060e1c');
      ctx.fillStyle = d; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(138,230,250,0.35)'; ctx.lineWidth = 1; ctx.stroke();

      // orbit — back half
      drawOrbit(false);

      // graticule
      ctx.fillStyle = 'rgba(138,200,250,0.22)';
      for (var i = 0; i < grat.length; i++) {
        var p = view(grat[i], ca, sa);
        if (p[2] > 0) ctx.fillRect(cx + p[0] * R - 0.5, cy - p[1] * R - 0.5, 1, 1);
      }
      // land dots, bucketed by depth for cheap shading
      dots(land, ca, sa, '79,214,242');
      dots(landFocus, ca, sa, '126,227,154');

      // arcs
      ctx.lineWidth = 1.4; ctx.setLineDash([3, 4]);
      for (var a = 0; a < ARCS.length; a++) {
        ctx.strokeStyle = 'rgba(126,227,154,0.75)'; ctx.beginPath();
        var pen = false;
        for (var j = 0; j < ARCS[a].length; j++) {
          var q = view(ARCS[a][j], ca, sa);
          if (occluded(q) || q[2] < -0.2) { pen = false; continue; }
          var X = cx + q[0] * R, Y = cy - q[1] * R;
          if (pen) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pen = true; }
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // sites
      ctx.font = '500 11px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      for (var s = 0; s < SITES.length; s++) {
        var sp = view(SITES[s].v, ca, sa);
        if (sp[2] <= 0.05) continue;
        var sx = cx + sp[0] * R, sy = cy - sp[1] * R, al = Math.min(1, sp[2] * 2);
        ctx.fillStyle = 'rgba(243,196,107,' + al + ')';
        ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, 7); ctx.fill();
        ctx.strokeStyle = 'rgba(243,196,107,' + (al * 0.5) + ')'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 7); ctx.stroke();
        if (s === 0 && sp[2] > 0.3 && W > 300) {
          var tw = ctx.measureText(SITES[s].name).width;
          ctx.fillStyle = 'rgba(5,10,20,' + (0.8 * al) + ')';
          ctx.fillRect(sx + 10, sy - 8, tw + 10, 17);
          ctx.fillStyle = 'rgba(233,240,250,' + al + ')';
          ctx.fillText(SITES[s].name, sx + 15, sy + 4);
        }
      }

      // orbit — front half + satellite
      drawOrbit(true);
    }

    function dots(arr, ca, sa, rgb) {
      var buckets = [[], [], [], []];
      for (var i = 0; i < arr.length; i++) {
        var p = view(arr[i], ca, sa);
        if (p[2] <= 0) continue;
        var b = p[2] > 0.75 ? 3 : p[2] > 0.5 ? 2 : p[2] > 0.25 ? 1 : 0;
        buckets[b].push(cx + p[0] * R, cy - p[1] * R);
      }
      var alpha = [0.35, 0.55, 0.78, 0.95], size = [1.2, 1.6, 1.9, 2.2];
      for (var k = 0; k < 4; k++) {
        ctx.fillStyle = 'rgba(' + rgb + ',' + alpha[k] + ')';
        var s = size[k], h = s / 2, B = buckets[k];
        for (var j = 0; j < B.length; j += 2) ctx.fillRect(B[j] - h, B[j + 1] - h, s, s);
      }
    }

    function drawOrbit(front) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = front ? 'rgba(138,230,250,0.55)' : 'rgba(138,230,250,0.16)';
      ctx.beginPath();
      var pen = false;
      for (var i = 0; i <= 120; i++) {
        var p = orbitPoint(i / 120 * Math.PI * 2);
        var isFront = p[2] >= 0;
        if (isFront !== front || occluded(p)) { pen = false; continue; }
        var X = cx + p[0] * R, Y = cy - p[1] * R;
        if (pen) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); pen = true; }
      }
      ctx.stroke();
      // satellite + trail
      for (var t = 6; t >= 0; t--) {
        var sp = orbitPoint(theta - t * 0.035);
        if ((sp[2] >= 0) !== front || occluded(sp)) continue;
        var sx = cx + sp[0] * R, sy = cy - sp[1] * R;
        ctx.fillStyle = t === 0 ? '#e9fbff' : 'rgba(138,230,250,' + (0.5 - t * 0.07) + ')';
        ctx.beginPath(); ctx.arc(sx, sy, t === 0 ? 3.4 : 2.2, 0, 7); ctx.fill();
        if (t === 0) {
          ctx.strokeStyle = 'rgba(138,230,250,0.5)';
          ctx.beginPath(); ctx.moveTo(sx - 9, sy); ctx.lineTo(sx - 5, sy); ctx.moveTo(sx + 5, sy); ctx.lineTo(sx + 9, sy); ctx.stroke();
        }
      }
    }

    function updateHud() {
      if (!subsatEl) return;
      var p = orbitPoint(theta), n = Math.sqrt(p[0] * p[0] + p[1] * p[1] + p[2] * p[2]);
      var X = p[0] / n, Y2 = p[1] / n, Z2 = p[2] / n;
      var Y1 = Y2 * ct + Z2 * st, Z1 = -Y2 * st + Z2 * ct;
      var ca = Math.cos(spin), sa = Math.sin(spin);
      var x0 = X * ca - Z1 * sa, z0 = X * sa + Z1 * ca;
      var lat = Math.asin(Math.max(-1, Math.min(1, Y1))) / D2R, lon = Math.atan2(x0, z0) / D2R;
      subsatEl.textContent = Math.abs(lat).toFixed(4) + '° ' + (lat >= 0 ? 'N' : 'S') + ', ' + Math.abs(lon).toFixed(4) + '° ' + (lon >= 0 ? 'E' : 'W');
    }

    function frame(t) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (t - last < 33) return; // ~30 fps cap
      var dt = Math.min(100, last ? t - last : 16);
      last = t;
      spin += dt * 0.000055;   // ~1 revolution / 2 min
      theta += dt * 0.00032;   // satellite
      draw();
      if (t - lastHud > 250) { updateHud(); lastHud = t; }
    }
    function start() {
      if (running || reduceMQ.matches || !visible || document.hidden) return;
      running = true; last = 0; requestAnimationFrame(frame);
    }
    function stop() { running = false; }

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);
    resize(); updateHud();

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting; visible ? start() : stop();
      }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    var onMotion = function () { reduceMQ.matches ? (stop(), draw()) : start(); };
    if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onMotion);
    start();
  }

  /* ---------------- Procedural cropland tile ---------------- */
  var mosaic = document.getElementById('mosaic');
  if (mosaic && mosaic.getContext) {
    var mctx = mosaic.getContext('2d', { willReadFrequently: true });
    var lastW = 0;
    function rng(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function paintMosaic() {
      var r = mosaic.getBoundingClientRect();
      var w = Math.round(r.width), h = Math.round(r.height);
      if (!w || !h || w === lastW) return;
      lastW = w;
      var pr = Math.min(window.devicePixelRatio || 1, 2);
      mosaic.width = w * pr; mosaic.height = h * pr;
      var c = mctx; c.setTransform(pr, 0, 0, pr, 0, 0);
      var rand = rng(20260507);
      var CROP = ['#2f6f3e', '#3c8247', '#4f9450', '#6aa456', '#8aa955', '#55803c'];
      var SOIL = ['#7a5f41', '#8d6d48', '#6b553d', '#9a7b52', '#5f4c38'];

      c.save();
      c.translate(w / 2, h / 2); c.rotate(-0.13); c.translate(-w * 0.65, -h * 0.9);
      var parcels = [];
      (function split(x, y, pw, ph, depth) {
        if (depth > 5 || (pw < 70 && ph < 70) || (depth > 2 && rand() < 0.18)) { parcels.push([x, y, pw, ph]); return; }
        if (pw > ph) { var s = pw * (0.3 + rand() * 0.4); split(x, y, s, ph, depth + 1); split(x + s, y, pw - s, ph, depth + 1); }
        else { var t = ph * (0.3 + rand() * 0.4); split(x, y, pw, t, depth + 1); split(x, y + t, pw, ph - t, depth + 1); }
      })(0, 0, w * 1.3, h * 1.8, 0);

      var edges = [];
      parcels.forEach(function (p) {
        var crop = rand() < 0.62;
        var col = crop ? CROP[(rand() * CROP.length) | 0] : SOIL[(rand() * SOIL.length) | 0];
        c.fillStyle = col; c.fillRect(p[0], p[1], p[2], p[3]);
        // row texture
        c.fillStyle = crop ? 'rgba(10,30,15,0.18)' : 'rgba(40,25,10,0.16)';
        var vertical = rand() < 0.5;
        for (var k = 3; k < (vertical ? p[2] : p[3]); k += 5) {
          if (vertical) c.fillRect(p[0] + k, p[1], 1.2, p[3]); else c.fillRect(p[0], p[1] + k, p[2], 1.2);
        }
        c.strokeStyle = 'rgba(20,16,10,0.55)'; c.lineWidth = 1.2; c.strokeRect(p[0], p[1], p[2], p[3]);
        edges.push(p);
      });

      // tree crowns along field edges + scattered (agroforestry)
      var trees = [];
      edges.forEach(function (p) {
        if (rand() < 0.45) {
          var n = 2 + (rand() * 5) | 0, horiz = rand() < 0.5;
          for (var i = 0; i < n; i++) {
            var tx = horiz ? p[0] + rand() * p[2] : p[0], ty = horiz ? p[1] : p[1] + rand() * p[3];
            trees.push([tx, ty, 3 + rand() * 4]);
          }
        }
        if (rand() < 0.3) trees.push([p[0] + rand() * p[2], p[1] + rand() * p[3], 4 + rand() * 4]);
      });
      trees.forEach(function (t) {
        c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.arc(t[0] + 1.6, t[1] + 1.6, t[2], 0, 7); c.fill();
        c.fillStyle = '#1b4d27'; c.beginPath(); c.arc(t[0], t[1], t[2], 0, 7); c.fill();
        c.fillStyle = 'rgba(126,200,110,0.55)'; c.beginPath(); c.arc(t[0] - t[2] * 0.3, t[1] - t[2] * 0.3, t[2] * 0.45, 0, 7); c.fill();
      });
      c.restore();

      // sensor noise
      var img = c.getImageData(0, 0, mosaic.width, mosaic.height), dd = img.data;
      for (var i = 0; i < dd.length; i += 4) { var n = (rand() - 0.5) * 22; dd[i] += n; dd[i + 1] += n; dd[i + 2] += n; }
      c.putImageData(img, 0, 0);
      c.setTransform(pr, 0, 0, pr, 0, 0);

      // detections (screen space)
      c.save();
      c.translate(w / 2, h / 2); c.rotate(-0.13); c.translate(-w * 0.65, -h * 0.9);
      var m = c.getTransform();
      c.restore();
      c.setTransform(pr, 0, 0, pr, 0, 0);
      c.lineWidth = 1.3;
      c.font = '500 9px ' + getComputedStyle(document.body).getPropertyValue('--mono');
      var labelled = 0;
      trees.forEach(function (t) {
        var X = (m.a * t[0] + m.c * t[1] + m.e) / pr, Y = (m.b * t[0] + m.d * t[1] + m.f) / pr;
        if (X < 4 || Y < 4 || X > w - 4 || Y > h - 4 || rand() > 0.55) return;
        var s = t[2] + 3;
        c.strokeStyle = 'rgba(138,230,250,0.95)'; c.strokeRect(X - s, Y - s, s * 2, s * 2);
        if (labelled < 4 && t[2] > 5 && X < w - 50 && Y > 18) {
          c.fillStyle = 'rgba(5,10,20,0.85)'; c.fillRect(X - s, Y - s - 13, 32, 12);
          c.fillStyle = '#bff3ff'; c.fillText('TREE', X - s + 4, Y - s - 4); labelled++;
        }
      });
      // tile grid
      c.strokeStyle = 'rgba(233,240,250,0.10)'; c.lineWidth = 1;
      for (var gx = 64; gx < w; gx += 64) { c.beginPath(); c.moveTo(gx + 0.5, 0); c.lineTo(gx + 0.5, h); c.stroke(); }
      for (var gy = 64; gy < h; gy += 64) { c.beginPath(); c.moveTo(0, gy + 0.5); c.lineTo(w, gy + 0.5); c.stroke(); }
    }
    if ('ResizeObserver' in window) new ResizeObserver(paintMosaic).observe(mosaic);
    else window.addEventListener('resize', paintMosaic);
    paintMosaic();
  }
})();
