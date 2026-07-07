import * as THREE from 'three';
import { HYFIN_RANGE, mapRange, smoothstep, clamp01 } from './sections.js';

const isMobile = window.matchMedia('(max-width: 768px)').matches ||
  (navigator.maxTouchPoints > 1 && window.innerWidth < 900);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const TERRAIN_SIZE = 220;
const TERRAIN_SEGMENTS = isMobile ? 64 : 110;

// Organic rolling-hill height field built from layered sine waves — cheap, deterministic,
// no external noise dependency needed for a stylized low-poly landscape.
function heightAt(x, z) {
  let h = 0;
  h += Math.sin(x * 0.035 + 1.3) * Math.cos(z * 0.04) * 6.5;
  h += Math.sin(x * 0.09 - 0.7) * Math.sin(z * 0.11 + 2.1) * 2.4;
  h += Math.sin((x + z) * 0.018) * 4.2;
  h += Math.cos(x * 0.14) * Math.cos(z * 0.12) * 1.1;
  return h;
}

// A gentle S-curve "road" running through the valley, used by the EV path and village siting.
function roadPoint(t) {
  const z = 46 - t * 92;
  const x = Math.sin(t * Math.PI * 1.6) * 16 + Math.sin(t * Math.PI * 0.4) * 8;
  return new THREE.Vector3(x, heightAt(x, z) + 0.35, z);
}

// Bright, sun-drenched throughout (matching the EV Highway hero video's daytime look) — no
// night/dawn phase, since the hero video already covers progress 0 and any handoff seam should
// never read as "the world went dark." Only drifts warmer toward a golden-hour close.
const SKY_STOPS = [
  { p: 0.00, top: 0x3f86d6, bottom: 0xcfe8f5, horizon: 0xeaf3ea, fog: 0xd6e6ea, sun: 0xfff6df, ambient: 0xdfe8ea, ambientI: 0.95, sunI: 1.25 },
  { p: 0.72, top: 0x3f86d6, bottom: 0xbfe0f0, horizon: 0xeef2df, fog: 0xcfe3ea, sun: 0xffffff, ambient: 0xe6ecec, ambientI: 1.05, sunI: 1.35 },
  { p: 0.88, top: 0x4a90d9, bottom: 0xf0e2b8, horizon: 0xf7dfa0, fog: 0xe6d8b0, sun: 0xffe9b0, ambient: 0xf0e6cc, ambientI: 1.05, sunI: 1.3 },
  { p: 1.00, top: 0x5f86bc, bottom: 0xf4a35c, horizon: 0xffce8a, fog: 0xe7b988, sun: 0xffcf8a, ambient: 0xffe0b8, ambientI: 0.95, sunI: 1.15 },
];

function lerpSkyStops(p) {
  let a = SKY_STOPS[0], b = SKY_STOPS[SKY_STOPS.length - 1], t = 0;
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    if (p >= SKY_STOPS[i].p && p <= SKY_STOPS[i + 1].p) {
      a = SKY_STOPS[i]; b = SKY_STOPS[i + 1];
      t = mapRange(p, a.p, b.p);
      break;
    }
  }
  return { a, b, t: smoothstep(t) };
}

const skyVertex = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const skyFragment = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform vec3 horizonColor;
  varying vec3 vWorldPosition;
  void main() {
    float h = normalize(vWorldPosition).y;
    float horizonMix = pow(1.0 - abs(h), 4.0);
    vec3 base = mix(bottomColor, topColor, clamp(h * 0.7 + 0.5, 0.0, 1.0));
    gl_FragColor = vec4(mix(base, horizonColor, horizonMix), 1.0);
  }
`;

export class Experience {
  constructor(canvas) {
    this.canvas = canvas;
    this.progress = 0;
    this.mouse = { x: 0, y: 0 };
    this.time = 0;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 400);

    this._buildSky();
    this._buildLights();
    this._buildTerrain();
    this._buildSolarPanels();
    this._buildTurbines();
    this._buildVillage();
    this._buildCar();
    this._buildParticles();
    this._buildCameraPath();

    if (!isMobile) {
      window.addEventListener('pointermove', (e) => {
        this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
      });
    }
  }

  _buildSky() {
    const geo = new THREE.SphereGeometry(300, 24, 16);
    this.skyUniforms = {
      topColor: { value: new THREE.Color(0x05060f) },
      bottomColor: { value: new THREE.Color(0x1a1440) },
      horizonColor: { value: new THREE.Color(0x241a3a) },
    };
    const mat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      vertexShader: skyVertex,
      fragmentShader: skyFragment,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.scene.add(this.sky);
  }

  _buildLights() {
    this.ambient = new THREE.AmbientLight(0xdfe8ea, 0.95);
    this.scene.add(this.ambient);

    this.sunLight = new THREE.DirectionalLight(0xfff6df, 1.25);
    this.sunLight.position.set(-30, 60, 20);
    this.scene.add(this.sunLight);

    this.sunMesh = new THREE.Mesh(
      new THREE.SphereGeometry(4, 16, 16),
      new THREE.MeshBasicMaterial({ color: 0xfff6df })
    );
    this.scene.add(this.sunMesh);
  }

  _buildTerrain() {
    const geo = new THREE.PlaneGeometry(TERRAIN_SIZE, TERRAIN_SIZE, TERRAIN_SEGMENTS, TERRAIN_SEGMENTS);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const low = new THREE.Color(0x9c8a56);
    const high = new THREE.Color(0x6d8a52);
    const tmp = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = heightAt(x, z);
      pos.setY(i, y);
      const t = clamp01((y + 6) / 14);
      tmp.copy(low).lerp(high, t);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.computeVertexNormals();
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.95,
      metalness: 0.02,
      fog: true,
    });
    this.terrain = new THREE.Mesh(geo, this.terrainMat);
    this.scene.add(this.terrain);

    // Road ribbon following the same S-curve the EV drives.
    const roadPts = [];
    for (let i = 0; i <= 40; i++) roadPts.push(roadPoint(i / 40));
    const roadCurve = new THREE.CatmullRomCurve3(roadPts);
    const roadGeo = new THREE.TubeGeometry(roadCurve, 80, 0.55, 6, false);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x4a4a4e, roughness: 1 });
    this.road = new THREE.Mesh(roadGeo, roadMat);
    this.scene.add(this.road);
    this.roadCurve = roadCurve;
  }

  _buildSolarPanels() {
    const count = isMobile ? 24 : 42;
    const geo = new THREE.BoxGeometry(1.6, 0.08, 1.0);
    // Basic (unlit) material so the "off" state is reliably near-black regardless of scene
    // lighting — we drive the on/off glow directly via color lerp in render(), not via lights.
    this.solarOffColor = new THREE.Color(0x070c10);
    this.solarOnColor = new THREE.Color(0x3fe8cf);
    this.solarMat = new THREE.MeshBasicMaterial({ color: this.solarOffColor.clone() });
    this.solarMesh = new THREE.InstancedMesh(geo, this.solarMat, count);
    const dummy = new THREE.Object3D();
    let i = 0;
    let attempts = 0;
    while (i < count && attempts < count * 6) {
      attempts++;
      const x = 20 + Math.random() * 30;
      const z = -10 + Math.random() * 50 - 30;
      const y = heightAt(x, z);
      if (y < -2) continue; // keep panels on the hillside, not the valley floor
      dummy.position.set(x, y + 0.3, z);
      dummy.rotation.set(-0.35 + Math.random() * 0.1, Math.random() * Math.PI, 0);
      dummy.updateMatrix();
      this.solarMesh.setMatrixAt(i, dummy.matrix);
      i++;
    }
    this.solarMesh.count = i;
    this.scene.add(this.solarMesh);
  }

  _buildTurbines() {
    const positions = [];
    const n = isMobile ? 4 : 7;
    for (let i = 0; i < n; i++) {
      const x = -34 - Math.random() * 20;
      const z = -20 + i * 14 + Math.random() * 6;
      positions.push(new THREE.Vector3(x, heightAt(x, z), z));
    }
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd8dbe0, roughness: 0.6 });
    const bladeMat = new THREE.MeshStandardMaterial({
      color: 0xe8eaf0, emissive: 0xffe9b0, emissiveIntensity: 0, roughness: 0.5,
    });

    this.turbines = positions.map((p) => {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 7, 6), poleMat);
      pole.position.y = 3.5;
      group.add(pole);

      const hub = new THREE.Group();
      hub.position.y = 7;
      for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.12, 3.2, 0.35), bladeMat);
        blade.position.y = 1.6;
        const holder = new THREE.Group();
        holder.rotation.z = (b / 3) * Math.PI * 2;
        holder.add(blade);
        hub.add(holder);
      }
      group.add(hub);
      group.position.copy(p);
      group.userData.hub = hub;
      group.userData.speed = 0.4 + Math.random() * 0.3;
      this.scene.add(group);
      return group;
    });
    this.bladeMat = bladeMat;
  }

  _buildVillage() {
    const count = isMobile ? 18 : 34;
    const geo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.villageOffColor = new THREE.Color(0x141019);
    this.villageOnColor = new THREE.Color(0xffb673);
    this.villageMat = new THREE.MeshBasicMaterial({ color: this.villageOffColor.clone() });
    this.villageMesh = new THREE.InstancedMesh(geo, this.villageMat, count);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const t = Math.random();
      const base = roadPoint(t);
      const x = base.x + (Math.random() - 0.5) * 10;
      const z = base.z + (Math.random() - 0.5) * 10;
      dummy.position.set(x, heightAt(x, z) + 0.25, z);
      dummy.rotation.y = Math.random() * Math.PI;
      dummy.updateMatrix();
      this.villageMesh.setMatrixAt(i, dummy.matrix);
    }
    this.scene.add(this.villageMesh);
  }

  _buildCar() {
    const group = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xe8eaf0, roughness: 0.35, metalness: 0.3 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x1a2230, roughness: 0.2 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xfff2c8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 2.2), bodyMat);
    body.position.y = 0.35;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 1.1), glassMat);
    cabin.position.set(0, 0.7, -0.1);
    group.add(body, cabin);

    [[-0.5, -0.7], [0.5, -0.7], [-0.5, 0.7], [0.5, 0.7]].forEach(([x, z]) => {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 10), bodyMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.18, z);
      group.add(wheel);
    });

    [[-0.35], [0.35]].forEach(([x]) => {
      const light = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), lightMat);
      light.position.set(x, 0.35, -1.15);
      group.add(light);
    });

    group.scale.setScalar(1.4);
    this.car = group;
    this.scene.add(group);
  }

  _buildParticles() {
    const count = isMobile ? 50 : 140;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = Math.random() * 10 + 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffd9a0, size: 0.18, transparent: true, opacity: 0.75,
      blending: THREE.AdditiveBlending, depthWrite: false,
    });
    this.particles = new THREE.Points(geo, mat);
    this.particleBase = positions.slice();
    this.scene.add(this.particles);
  }

  _buildCameraPath() {
    this.cameraKeys = [
      { p: 0.00, pos: new THREE.Vector3(0, 9, 33), look: new THREE.Vector3(0, 5, 0) },
      { p: 0.16, pos: new THREE.Vector3(-11, 7.5, 21), look: new THREE.Vector3(-3, 5, 6) },
      { p: 0.28, pos: new THREE.Vector3(9, 6.5, 12), look: new THREE.Vector3(20, 3, 0) },
      { p: 0.41, pos: new THREE.Vector3(-6, 5.5, 2), look: new THREE.Vector3(-34, 5, -10) },
      { p: 0.53, pos: new THREE.Vector3(4, 4.5, -8), look: new THREE.Vector3(0, 2, -20) },
      { p: 0.66, pos: new THREE.Vector3(0, 9, 8), look: new THREE.Vector3(0, 4, -10) },
      { p: 0.80, pos: new THREE.Vector3(-8, 7, 16), look: new THREE.Vector3(-2, 4, 2) },
      { p: 1.00, pos: new THREE.Vector3(0, 12, 27), look: new THREE.Vector3(0, 6, 0) },
    ];
  }

  _sampleCameraPath(p) {
    const keys = this.cameraKeys;
    let a = keys[0], b = keys[keys.length - 1];
    for (let i = 0; i < keys.length - 1; i++) {
      if (p >= keys[i].p && p <= keys[i + 1].p) { a = keys[i]; b = keys[i + 1]; break; }
    }
    const t = smoothstep(mapRange(p, a.p, b.p));
    const pos = a.pos.clone().lerp(b.pos, t);
    const look = a.look.clone().lerp(b.look, t);
    return { pos, look };
  }

  setProgress(p) {
    this.progress = clamp01(p);
  }

  resize() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  render(delta) {
    this.time += delta;
    const p = this.progress;

    // --- Sky / lighting grade ---
    const { a, b, t } = lerpSkyStops(p);
    this.skyUniforms.topColor.value.copy(new THREE.Color(a.top)).lerp(new THREE.Color(b.top), t);
    this.skyUniforms.bottomColor.value.copy(new THREE.Color(a.bottom)).lerp(new THREE.Color(b.bottom), t);
    this.skyUniforms.horizonColor.value.copy(new THREE.Color(a.horizon)).lerp(new THREE.Color(b.horizon), t);

    const fogColor = new THREE.Color(a.fog).lerp(new THREE.Color(b.fog), t);
    if (!this.fog) {
      this.fog = new THREE.Fog(fogColor.getHex(), 30, 170);
      this.scene.fog = this.fog;
    } else {
      this.fog.color.copy(fogColor);
    }

    this.ambient.color.copy(new THREE.Color(a.ambient).lerp(new THREE.Color(b.ambient), t));
    this.ambient.intensity = a.ambientI + (b.ambientI - a.ambientI) * t;
    this.sunLight.color.copy(new THREE.Color(a.sun).lerp(new THREE.Color(b.sun), t));
    this.sunLight.intensity = a.sunI + (b.sunI - a.sunI) * t;
    this.sunMesh.material.color.copy(this.sunLight.color);

    // Sun stays high and bright throughout, drifting lower/warmer toward a golden-hour close —
    // it never dips toward the horizon, so there's no "the world went dark" moment mid-scroll.
    const sunAngle = 1.0 - p * 0.55;
    const sunDist = 120;
    const sunPos = new THREE.Vector3(
      Math.cos(sunAngle * 1.3) * sunDist * 0.6,
      Math.sin(sunAngle) * sunDist * 0.7,
      -Math.sin(sunAngle * 0.7) * sunDist * 0.5
    );
    this.sunLight.position.copy(sunPos);
    this.sunMesh.position.copy(sunPos);

    // --- World "coming alive" during the Hyfin/GAIA arc ---
    const hyfinT = smoothstep(mapRange(p, HYFIN_RANGE.start, HYFIN_RANGE.end));
    this.solarMat.color.copy(this.solarOffColor).lerp(this.solarOnColor, hyfinT);
    this.villageMat.color.copy(this.villageOffColor).lerp(this.villageOnColor, hyfinT);
    this.bladeMat.emissiveIntensity = hyfinT * 0.9;

    this.turbines.forEach((group) => {
      const speed = group.userData.speed * (0.3 + hyfinT * 2.2);
      group.userData.hub.rotation.x += speed * delta;
    });

    // EV drives the road during the Hyfin arc, arriving and departing smoothly.
    const carT = mapRange(p, HYFIN_RANGE.start, HYFIN_RANGE.end);
    const carVisible = carT > 0.01 && carT < 0.99;
    this.car.visible = carVisible;
    if (carVisible) {
      const eased = smoothstep(carT);
      const point = this.roadCurve.getPointAt(clamp01(eased));
      const tangent = this.roadCurve.getTangentAt(clamp01(eased));
      this.car.position.copy(point);
      this.car.position.y += 0.15;
      this.car.lookAt(point.clone().add(tangent));
      const edgeFade = Math.min(smoothstep(carT / 0.06), smoothstep((1 - carT) / 0.06));
      this.car.scale.setScalar(1.4 * Math.max(0.001, edgeFade));
    }

    // Ambient firefly drift.
    if (!reducedMotion) {
      const posAttr = this.particles.geometry.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const baseY = this.particleBase[i * 3 + 1];
        posAttr.setY(i, baseY + Math.sin(this.time * 0.6 + i) * 0.6);
      }
      posAttr.needsUpdate = true;
    }
    this.particles.material.opacity = 0.16 + hyfinT * 0.3;

    // --- Camera ---
    const { pos, look } = this._sampleCameraPath(p);
    if (!reducedMotion) {
      pos.y += Math.sin(this.time * 0.25) * 0.12;
      pos.x += this.mouse.x * 0.8;
      look.y += this.mouse.y * 0.4;
    }
    pos.y = Math.max(pos.y, heightAt(pos.x, pos.z) + 2.2);
    this.camera.position.copy(pos);
    this.camera.lookAt(look);

    this.renderer.render(this.scene, this.camera);
  }
}

export { isMobile, reducedMotion };
