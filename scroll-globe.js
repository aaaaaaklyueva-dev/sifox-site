// <scroll-globe step="0" duration="0.7"> — sticky globe driven from outside by `step`.
// Drag rotates the globe at any time; the user offset is added on top of the per-step orientation.
(() => {
  const THREE_URL = 'https://esm.sh/three@0.184.0';
  const TOPO_URL = 'https://esm.sh/topojson-client@3.1.0';
  const ATLAS = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json';
  const R = 2;
  const LAND = 0xE8EFFF, LINE = 0xC6CADD, BLUE = 0x373BF9;

  // Per-step config: orientation (lon/lat facing viewer), scale, offset (in R units), fills, dots, labels.
  const STEPS = [
    { // Страны
      lon: 50, lat: 28, scale: 0.86, y: 0, py: 100, dyaw: -0.1502, dpitch: -0.0826,
      fill: { russia: 0xA5BDFF, armenia: 0xA5BDFF, uzbekistan: 0xA5BDFF, tajikistan: 0xA5BDFF, kenya: 0xA5BDFF, 'dem. rep. congo': 0xA5BDFF },
      labels: [['russia', 'Россия'], ['armenia', 'Армения'], ['uzbekistan', 'Узбекистан'], ['tajikistan', 'Таджикистан'], ['dem. rep. congo', 'ДР Конго'], ['kenya', 'Кения']],
      dots: [],
    },
    { // Офисы
      lon: -25, lat: 50, scale: 0.96, y: 0, py: 53.4, dyaw: 0.0855, dpitch: 0.7143,
      fill: { 'united states of america': 0xA5BDFF },
      labels: [],
      dots: [['Ташкент', 69.24, 41.30, [0, -26]], ['Москва', 37.62, 55.76, [0, -26]], ['Кипр', 33.4, 35.1, [-40, 6]], ['Калифорния', -119.4, 36.8, [0, -26], -0.25], ['Ереван', 44.51, 40.18, [40, 14]]],
    },
    { // Языки
      lon: 52, lat: 14, scale: 1.0, y: 0, py: 40, dpx: -20, dyaw: 0.3673, dpitch: 0.6237,
      fill: Object.assign(
        { russia: 'pink', uzbekistan: 'pink', tajikistan: 'pink', armenia: 'pink', oman: 'pink' },
        Object.fromEntries(['united states of america','united kingdom','canada','australia','new zealand','jamaica','bahamas','belize','guyana','trinidad and tobago','nigeria','ghana','liberia','sierra leone','gambia','uganda','zambia','zimbabwe','botswana','malawi','south africa','namibia','s. sudan','papua new guinea','solomon is.','fiji'].map(n => [n, 'en']))
      ),
      labels: [['russia', 'Русский'], ['uzbekistan', 'Узбекский'], ['tajikistan', 'Таджикский'], ['armenia', 'Армянский'], ['oman', 'Оманский арабский'], ['united kingdom', 'Английский']],
      dots: [],
    },
    { // Партнёры
      lon: 88, lat: 48, scale: 1.7, y: -0.95, py: 25, dpx: 10, dyaw: -0.1013, dpitch: -0.3385,
      fill: { russia: 0xA5BDFF, uzbekistan: 0xA5BDFF, tajikistan: 0xA5BDFF },
      labels: [],
      dots: [],
      // [logo id, lon, lat, bg rgb, shift, fixed logo size]
      brands: [
        ['gazprom', 72.0, 68.0, '75,75,240', [0, -20], [165, 32]],
        ['sber', 117.0, 50.0, '232,130,60', [0, 0]],
        ['yota', 125.0, 61.0, '0,174,239', [20, -6]],
        ['motiv-h-white', 74.0, 60.0, '240,110,0', [20, 0]],
        ['beeline', 48.0, 59.0, '255,200,0', [-30, 0]],
        ['megafon', 60.0, 54.0, '0,185,86', [30, 14]],
        ['t2', 95.0, 54.0, '0,0,0', [0, 0]],
        ['megafon-tj', 71.0, 38.6, '0,185,86', [80, 34], [118, 26]],
        ['uzum', 64.5, 41.0, '112,0,255', [0, 0]],
        ['team-armenia-white', 44.5, 40.2, '1,67,96', [-20, 10]],
      ],
    },
  ];
  const DESK = STEPS.slice();
  DESK[3] = Object.assign({}, STEPS[3], { scale: 1.72, x: -1.25, px: 30, y: -0.91, py: 0, dpx: 0, dyaw: 0.8768, dpitch: -0.2569 });
  const ANCHOR = { russia: [60, 60] };
  const SHIFT = [
    { russia: [-30, 0], armenia: [-70, 10], uzbekistan: [0, -24], tajikistan: [44, 16], 'dem. rep. congo': [-50, 10], kenya: [40, -6] },
    {},
    { russia: [30, 0], armenia: [-70, 10], uzbekistan: [-30, -30], tajikistan: [60, 0], oman: [40, 20], 'united kingdom': [-40, -20] },
    { qatar: [-60, 0], oman: [10, 40], tajikistan: [40, 10] },
  ];

  const css = `
    :host { display:block; position:relative; width:100%; height:100%; overflow:hidden; touch-action:pan-y; cursor:grab; }
    :host(.drag) { cursor:grabbing; }
    canvas { display:block; width:100%; height:100%; }
    .pill { position:absolute; left:0; top:0; padding:9px 16px; background:rgba(255,255,255,0.45);
      -webkit-backdrop-filter:blur(10px) saturate(1.4); backdrop-filter:blur(10px) saturate(1.4);
      border:1px solid rgba(255,255,255,0.8); box-shadow:0 4px 14px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9);
      color:#323030; font:600 20px/1 "Nunito", sans-serif; border-radius:8px;
      white-space:nowrap; pointer-events:none; opacity:0; will-change:transform,opacity; }
    .brand { position:absolute; left:0; top:0; height:40px; box-sizing:border-box; padding:0 18px; display:flex; align-items:center; justify-content:center;
      -webkit-backdrop-filter:blur(10px) saturate(1.3); backdrop-filter:blur(10px) saturate(1.3); box-shadow:0 6px 18px rgba(22,27,50,0.12);
      border-radius:999px; white-space:nowrap; pointer-events:auto; cursor:pointer; opacity:0; will-change:transform,opacity; transform-origin:50% 50%; }
    .brand img { display:block; }
  `;

  const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  class ScrollGlobe extends HTMLElement {
    static get observedAttributes() { return ['step', 'duration', 'progress', 'lift', 'pxscale', 'fixedscale', 'fixedy', 'fixedpy', 'rotoffset']; }
    constructor() {
      super();
      this._step = 0; this._dur = 0.7; this._prog = null; this._pv = 0; this._lift = 0; this._pxs = 1; this._fix = null; this._fixy = null;
      this._w = STEPS.map((_, i) => i === 0 ? 1 : 0); this._from = this._w.slice(); this._p = 1;
      this._yaw = 0; this._pitch = 0; this._vy = 0; this._vp = 0;
      const root = this.attachShadow({ mode: 'open' });
      const st = document.createElement('style'); st.textContent = css; root.appendChild(st);
      this._layer = document.createElement('div'); root.appendChild(this._layer);
    }
    set step(v) { this._setStep(v); }
    get step() { return this._step; }
    set duration(v) { const n = parseFloat(v); if (n > 0) this._dur = n; }
    attributeChangedCallback(n, _, v) { if (n === 'fixedscale') this._fix = String(v || '').split(',').map(x => parseFloat(x) || 0); else if (n === 'rotoffset') this._rot = String(v || '').split(';').map(p => p.split(',').map(x => parseFloat(x) || 0)); else if (n === 'fixedpy') this._fixpy = String(v || '').split(',').map(x => parseFloat(x) || 0); else if (n === 'fixedy') this._fixy = String(v || '').split(',').map(x => parseFloat(x) || 0); else if (n === 'pxscale') this._pxs = parseFloat(v) || 1; else if (n === 'lift') this._lift = parseFloat(v) || 0; else if (n === 'step') this._setStep(v); else if (n === 'progress') this._prog = v == null || v === '' ? null : Math.max(0, Math.min(STEPS.length - 1, parseFloat(v) || 0)); else this.duration = v; }
    _setStep(v) {
      const s = Math.max(0, Math.min(STEPS.length - 1, parseInt(v, 10) || 0));
      if (s === this._step) return;
      this._step = s; this._from = this._w.slice(); this._p = 0; this._oy0 = this._yaw; this._op0 = this._pitch; this._vy = this._vp = 0;
    }
    connectedCallback() { if (!this._booted) { this._booted = true; this._boot(); } }
    disconnectedCallback() { if (this._raf) cancelAnimationFrame(this._raf); this._raf = 0; this._ro && this._ro.disconnect(); }

    async _boot() {
      const [THREE, topojson, topo] = await Promise.all([import(THREE_URL), import(TOPO_URL), fetch(ATLAS).then(r => r.json())]);
      this.T = THREE; const S = this.S = this.getAttribute('variant') === 'desk' ? DESK : STEPS;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      this.shadowRoot.insertBefore(renderer.domElement, this._layer);
      const scene = new THREE.Scene();
      const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
      scene.add(new THREE.AmbientLight(0xffffff, 1.15));
      const key = new THREE.DirectionalLight(0xffffff, 2.2);
      key.position.set(-2.2, 3.0, 2.5); scene.add(key);
      Object.assign(this, { renderer, scene, cam });

      const g = new THREE.Group(); g.rotation.order = 'XYZ'; scene.add(g); this.g = g;
      const ll = (lon, lat, r) => {
        const phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
        return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
      };
      this.ll = ll;
      g.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 })));

      const white = new THREE.Color(0xffffff), land = new THREE.Color(LAND);
      const resolve = c => c === 'en' ? new THREE.Color(0xB9D1FF)
        : c === 'pink' ? new THREE.Color(0xFF87CE) : new THREE.Color(c);
      const fc = topojson.feature(topo, topo.objects.countries);
      const R_TOP = R * 1.008, R_BASE = R * 1.001, R_BORDER = R * 1.0088;
      const border = [], polys = g => g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      const unwrap = ring => { let a = Infinity, b = -Infinity; for (const [l] of ring) { a = Math.min(a, l); b = Math.max(b, l); } return b - a <= 180 ? ring : ring.map(([l, t]) => [l < 0 ? l + 360 : l, t]); };
      const sub = (a, b, c, out) => {
        const sp = (p, q) => Math.max(Math.abs(p.x - q.x), Math.abs(p.y - q.y));
        if (Math.max(sp(a, b), sp(b, c), sp(c, a)) <= 4) { out.push(a, b, c); return; }
        const m = (p, q) => new THREE.Vector2((p.x + q.x) / 2, (p.y + q.y) / 2);
        const ab = m(a, b), bc = m(b, c), ca = m(c, a);
        sub(a, ab, ca, out); sub(ab, b, bc, out); sub(ca, bc, c, out); sub(ab, bc, ca, out);
      };
      this.countries = []; const centroids = {};
      for (const f of fc.features) {
        const name = ((f.properties && f.properties.name) || '').toLowerCase();
        const tris = [];
        for (const poly of polys(f.geometry)) {
          for (const ring of poly) {
            const p = ring.map(([lo, la]) => ll(lo, la, R_BORDER));
            for (let i = 0; i < p.length - 1; i++) border.push(p[i].x, p[i].y, p[i].z, p[i + 1].x, p[i + 1].y, p[i + 1].z);
          }
          const contour = unwrap(poly[0]).slice(0, -1).map(([lo, la]) => new THREE.Vector2(lo, la));
          if (contour.length < 3) continue;
          const out = [];
          for (const [i0, i1, i2] of THREE.ShapeUtils.triangulateShape(contour, [])) sub(contour[i0], contour[i1], contour[i2], out);
          for (const v of out) { const p = ll(v.x, v.y, R_TOP); tris.push(p.x, p.y, p.z); }
          for (const ring of poly) for (let i = 0; i < ring.length - 1; i++) {
            const tA = ll(...ring[i], R_TOP), tB = ll(...ring[i + 1], R_TOP), bA = ll(...ring[i], R_BASE), bB = ll(...ring[i + 1], R_BASE);
            tris.push(bA.x, bA.y, bA.z, bB.x, bB.y, bB.z, tB.x, tB.y, tB.z, bA.x, bA.y, bA.z, tB.x, tB.y, tB.z, tA.x, tA.y, tA.z);
          }
        }
        if (!tris.length) continue;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(tris, 3)); geo.computeVertexNormals();
        const targets = S.map(s => s.fill[name] != null ? resolve(s.fill[name]) : null);
        let mat;
        if (targets.some(Boolean)) mat = new THREE.MeshStandardMaterial({ color: land.clone(), emissive: 0x000000, roughness: 0.75, side: THREE.DoubleSide });
        else mat = this._landMat || (this._landMat = new THREE.MeshStandardMaterial({ color: LAND, roughness: 0.9, side: THREE.DoubleSide }));
        g.add(new THREE.Mesh(geo, mat));
        if (targets.some(Boolean)) this.countries.push({ mat, targets });
        const c = new THREE.Vector3(); for (let i = 0; i < tris.length; i += 3) c.add(new THREE.Vector3(tris[i], tris[i + 1], tris[i + 2]));
        centroids[name] = c.normalize().multiplyScalar(R * 1.01);
      }
      const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(border, 3));
      g.add(new THREE.LineSegments(bg, new THREE.LineBasicMaterial({ color: LINE })));
      const grid = new THREE.LineBasicMaterial({ color: LINE }), rg = R * 1.002; this._grid = grid; this._gA = new THREE.Color(LINE); this._gB = new THREE.Color(0x323030);
      const mer = new THREE.LineBasicMaterial({ color: 0x323030 }); this._mer = mer;
      const loop = (fn, m = grid) => { const p = []; for (let i = 0; i <= 128; i++) p.push(fn(i / 128 * Math.PI * 2)); g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(p), m)); };
      for (const lat of [-60, -30, 0, 30, 60]) { const y = rg * Math.sin(lat * Math.PI / 180), rr = rg * Math.cos(lat * Math.PI / 180); loop(a => new THREE.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr)); }
      for (let k = 0; k < 6; k++) { const lon = k / 6 * Math.PI; loop(a => new THREE.Vector3(rg * Math.cos(a) * Math.cos(lon), rg * Math.sin(a), rg * Math.cos(a) * Math.sin(lon)), mer); }

      // Labels + dots per step
      this.labels = [];
      const pill = text => { const el = document.createElement('div'); el.className = 'pill'; el.textContent = text; this._layer.appendChild(el); return el; };
      const dotGeo = new THREE.CircleGeometry(0.04, 32);
      this.dots = [];
      S.forEach((s, si) => {
        for (const [key, text] of s.labels) {
          const a = ANCHOR[key] ? ll(ANCHOR[key][0], ANCHOR[key][1], R * 1.01) : centroids[key];
          if (!a) continue;
          const sh = SHIFT[si][key] || [0, 0];
          this.labels.push({ si, anchor: a, el: pill(text), dx: sh[0], dy: sh[1] });
        }
        for (const [text, lon, lat, sh, th] of s.dots) {
          const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }));
          m.position.copy(ll(lon, lat, R * 1.011)); m.lookAt(m.position.clone().multiplyScalar(2)); g.add(m);
          this.dots.push({ si, m });
          this.labels.push({ si, anchor: m.position.clone(), el: pill(text), dx: sh[0], dy: sh[1], th: th == null ? 0.15 : th });
        }
        for (const [id, lon, lat, rgb, sh, size] of (this.hasAttribute('nobrands') ? [] : (s.brands || []))) {
          const el = document.createElement('div'); el.className = 'brand'; el.dataset.id = id; el.style.background = `rgb(${rgb})`;
          const img = new Image();
          img.onload = () => {
            if (size) { img.style.width = size[0] + 'px'; img.style.height = size[1] + 'px'; return; }
            const ar = (img.naturalWidth || 1) / (img.naturalHeight || 1), h = Math.min(22, Math.max(14, Math.sqrt(2400 / ar)));
            img.style.height = h + 'px'; img.style.width = h * ar + 'px';
          };
          img.src = `logos/${id}.svg`; el.appendChild(img); this._layer.appendChild(el);
          this.labels.push({ si, anchor: ll(lon, lat, R * 1.01), el, dx: sh[0], dy: sh[1], brand: true });
        }
      });
      // base orientation per step: rotate so (lon,lat) faces +z, north up
      S.forEach(s => { const v = ll(s.lon, 0, 1); s._yaw = -Math.atan2(v.x, v.z) + (s.dyaw || 0); s._pitch = s.lat * Math.PI / 180 + (s.dpitch || 0); });

      this._bindDrag();
      const fit = () => {
        const w = this.clientWidth || 1, h = this.clientHeight || 1;
        renderer.setSize(w, h, false); cam.aspect = w / h;
        const fov = cam.fov * Math.PI / 180;
        cam.position.set(0, 0, (R * 1.25) / Math.sin(Math.atan(Math.tan(fov / 2) * Math.min(1, cam.aspect))));
        cam.updateProjectionMatrix();
      };
      fit(); this._ro = new ResizeObserver(fit); this._ro.observe(this);
      this._last = performance.now();
      const tick = now => { this._raf = requestAnimationFrame(tick); this._frame(now); };
      this._raf = requestAnimationFrame(tick);
    }

    _bindDrag() {
      let down = null;
      this.addEventListener('pointerdown', e => { const b = e.composedPath().find(n => n.classList && n.classList.contains('brand')); down = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, id: e.pointerId, brand: b }; this.setPointerCapture(e.pointerId); this.classList.add('drag'); this._vy = this._vp = 0; });
      this.addEventListener('pointermove', e => {
        if (!down || e.pointerId !== down.id) return;
        const k = 0.006 / (this._curScale || 1);
        const dy = (e.clientX - down.x) * k, dp = (e.clientY - down.y) * k;
        this._yaw += dy; this._pitch = Math.max(-1.2, Math.min(1.2, this._pitch + dp));
        this._vy = dy; this._vp = dp; down.x = e.clientX; down.y = e.clientY;
      });
      const up = e => {
        if (down && down.brand && e && Math.hypot(e.clientX - down.x0, e.clientY - down.y0) < 6 && parseFloat(down.brand.style.opacity || 0) > 0.5)
          this.dispatchEvent(new CustomEvent('brandclick', { detail: down.brand.dataset.id, bubbles: true, composed: true }));
        down = null; this.classList.remove('drag');
      };
      this.addEventListener('pointerup', up); this.addEventListener('pointercancel', up);
    }

    _frame(now) {
      const S = this.S || STEPS;
      const T = this.T, dt = Math.min(0.05, (now - this._last) / 1000); this._last = now;
      if (this._p < 1) {
        this._p = Math.min(1, this._p + dt / this._dur);
        const e = ease(this._p);
        this._w = this._from.map((f, i) => f + ((i === this._step ? 1 : 0) - f) * e);
        if (!this.classList.contains('drag') && this._oy0 != null) { this._yaw = this._oy0 * (1 - e); this._pitch = this._op0 * (1 - e); }
      }
      if (!this.classList.contains('drag')) { this._yaw += this._vy; this._pitch = Math.max(-1.2, Math.min(1.2, this._pitch + this._vp)); this._vy *= 0.92; this._vp *= 0.92; }
      const w = this._w, mix = k => S.reduce((a, s, i) => a + s[k] * w[i], 0);
      const target = this._prog == null ? this._step : this._prog;
      this._pv += (target - this._pv) * Math.min(1, dt * 6);
      const i0 = Math.min(S.length - 1, Math.floor(this._pv)), i1 = Math.min(S.length - 1, i0 + 1), f = this._pv - i0;
      const at = k => (S[i0][k] || 0) + ((S[i1][k] || 0) - (S[i0][k] || 0)) * f;
      const ppw = 2 * this.cam.position.z * Math.tan(this.cam.fov * Math.PI / 360) / (this.clientHeight || 1) * this._pxs;
      const fa = (a, i) => a ? (a[Math.min(i, a.length - 1)] || 0) : 0, fl = a => fa(a, i0) + (fa(a, i1) - fa(a, i0)) * f;
      const isFix = !!(this._fix && this._fix[0]);
      const sc = isFix ? fl(this._fix) : (at('scale') + at('dpx') * ppw / (2 * R)); this._curScale = sc;
      this.g.scale.setScalar(sc);
      this.g.position.set(isFix ? 0 : at('x') * R + at('px') * ppw, isFix ? fl(this._fixy) * R - fl(this._fixpy) * ppw / this._pxs : at('y') * R + (this._lift - at('py')) * ppw, 0);
      if (this._grid && this._w) this._grid.color.copy(this._gA).lerp(this._gB, Math.min(1, (this._w[0] || 0) + (this._w[1] || 0) + (this._w[2] || 0) + (S === DESK ? (this._w[3] || 0) : 0)));
      const ro = j => this._rot ? this._w.reduce((a, w, i) => a + w * ((this._rot[i] || [])[j] || 0), 0) : 0;
      this.g.rotation.x = mix('_pitch') + this._pitch + ro(1);
      this.g.rotation.y = mix('_yaw') + this._yaw + ro(0);

      for (const c of this.countries) {
        c.mat.color.setHex(LAND);
        c.targets.forEach((t, i) => { if (t && w[i] > 0) c.mat.color.lerp(t, w[i]); });
      }
      for (const d of this.dots) d.m.material.opacity = w[d.si];
      this.renderer.render(this.scene, this.cam);

      this.g.updateMatrixWorld();
      const W = this.clientWidth, H = this.clientHeight;
      const gr = R * sc / (this.cam.position.z * Math.tan(this.cam.fov * Math.PI / 360)) * H / 2;
      const bs = Math.max(0.75, Math.min(1.2, gr / 600));
      const v = this._v || (this._v = new T.Vector3()), n = this._n || (this._n = new T.Vector3()), c = this._c || (this._c = new T.Vector3());
      for (const L of this.labels) {
        const a = w[L.si];
        if (a < 0.01) { L.el.style.opacity = '0'; continue; }
        v.copy(L.anchor).applyMatrix4(this.g.matrixWorld);
        n.copy(v).sub(this.g.position).normalize();
        c.copy(this.cam.position).sub(v).normalize();
        const facing = n.dot(c);
        v.project(this.cam);
        const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
        L.el.style.transform = L.brand
          ? `translate(${x + L.dx * bs - L.el.offsetWidth / 2}px, ${y + L.dy * bs - L.el.offsetHeight / 2}px) scale(${bs})`
          : `translate(${x + L.dx - L.el.offsetWidth / 2}px, ${y + L.dy - L.el.offsetHeight / 2}px)`;
        L.el.style.opacity = String(a * Math.max(0, Math.min(1, (facing - (L.th == null ? 0.15 : L.th)) / 0.15)));
      }
    }
  }
  customElements.define('scroll-globe', ScrollGlobe);
})();
