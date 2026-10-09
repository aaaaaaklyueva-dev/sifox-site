const svgPts = [
  [66.5115,0],[76.2923,27.3176],[97.648,7.67445],[93.6133,36.4084],
  [121.651,28.9397],[104.726,52.5073],[133.023,58.924],[107.084,71.9263],
  [129.158,90.7585],[100.147,90.2168],[110.941,117.15],[85.5047,103.189],
  [82.5457,132.053],[66.5115,107.87],[50.4774,132.053],[47.5183,103.189],
  [22.0823,117.15],[32.8762,90.2168],[3.86542,90.7585],[25.9395,71.9263],
  [0,58.924],[28.2974,52.5073],[11.3716,28.9397],[39.4097,36.4084],
  [35.3751,7.67445],[56.7307,27.3176]
];
const cx = 66.5115, cy = 66.0265, S = 1 / 460;

function build(THREE) {
  const shape = new THREE.Shape();
  svgPts.forEach(([x, y], i) => {
    const px = (x - cx) * S, py = -(y - cy) * S;
    i === 0 ? shape.moveTo(px, py) : shape.lineTo(px, py);
  });
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.0022,
    bevelSize: 0.0022,
    bevelSegments: 3,
    curveSegments: 1
  });
  geo.center();
  geo.computeVertexNormals();

  const steel = new THREE.MeshStandardMaterial({
    name: 'brushed_steel',
    color: 0x8a93a6,
    metalness: 1.0,
    roughness: 0.14,
    envMapIntensity: 1.1
  });

  const star = new THREE.Mesh(geo, steel);
  star.name = 'star_plate';
  const model = new THREE.Group();
  model.name = 'metal_star';
  model.add(star);
  return model;
}

async function attach(el) {
  if (el.__starDone) return;
  el.__starDone = true;
  try {
    const { THREE } = await el.ready;
    if (!el.isConnected) { el.__starDone = false; return; }
    el.setObject(build(THREE));
    if (el.__starRaf) cancelAnimationFrame(el.__starRaf);
    const model = el._object;
    const t0 = performance.now();
    const tick = (t) => {
      const s = (t - t0) / 1000;
      model.rotation.y = Math.sin(s * 0.7) * 0.26;
      model.rotation.x = Math.sin(s * 0.5 + 1.1) * 0.10;
      model.rotation.z = Math.sin(s * 0.33) * 0.05;
      el.__starRaf = requestAnimationFrame(tick);
    };
    el.__starRaf = requestAnimationFrame(tick);
  } catch (e) {
    el.__starDone = false;
  }
}

function scan() {
  document.querySelectorAll('three-d-stage[data-star]').forEach(attach);
}

scan();
let tries = 0;
const iv = setInterval(() => {
  scan();
  if (++tries > 30) clearInterval(iv);
}, 500);
