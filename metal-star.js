const THREE = await import('https://unpkg.com/three@0.184.0/build/three.module.js');

const pts = [[66.5115,0],[76.2923,27.3176],[97.648,7.67445],[93.6133,36.4084],[121.651,28.9397],[104.726,52.5073],[133.023,58.924],[107.084,71.9263],[129.158,90.7585],[100.147,90.2168],[110.941,117.15],[85.5047,103.189],[82.5457,132.053],[66.5115,107.87],[50.4774,132.053],[47.5183,103.189],[22.0823,117.15],[32.8762,90.2168],[3.86542,90.7585],[25.9395,71.9263],[0,58.924],[28.2974,52.5073],[11.3716,28.9397],[39.4097,36.4084],[35.3751,7.67445],[56.7307,27.3176]];
const cx = 66.5115, cy = 66.0265, S = 1 / 460, T = 0.012;

function mount(host) {
  if (host.dataset.ready) return; host.dataset.ready = 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 10);
  camera.position.set(0, 0, 0.62);

  const shape = new THREE.Shape();
  pts.forEach(([x, y], i) => { const px = (x - cx) * S, py = -(y - cy) * S; i ? shape.lineTo(px, py) : shape.moveTo(px, py); });
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: true, bevelThickness: 0.0022, bevelSize: 0.0022, bevelSegments: 3, curveSegments: 1 });
  geo.center(); geo.computeVertexNormals();

  const env = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 6), new THREE.MeshBasicMaterial({ color: 0x2a2f55, side: THREE.BackSide }));
  env.add(room);
  const panel = (c, s, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(...s), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); env.add(m); };
  panel(0xffffff, [3, 0.5], 0, 2.2, 1.5, 0, Math.PI / 2.5);
  panel(0xffffff, [0.4, 4], 2.6, 0, 1, -Math.PI / 2);
  panel(0xb9d1ff, [0.6, 4], -2.6, 0, 0.5, Math.PI / 2);
  panel(0x697dff, [4, 1], 0, -2.6, 0, 0, -Math.PI / 2);
  panel(0xe8efff, [1.4, 1.4], 0.8, 0.8, 2.9);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(env, 0.02).texture;

  const star = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ name: 'brushed_steel', color: 0xe6e9f0, metalness: 0.85, roughness: 0.55, envMapIntensity: 1.4 }));
  scene.add(star);

  const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(0.4, 0.6, 1); scene.add(key);

  const resize = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  new ResizeObserver(resize).observe(host); resize();

  const t0 = performance.now();
  renderer.setAnimationLoop(() => {
    const t = (performance.now() - t0) / 1000;
    star.rotation.y = Math.sin(t * 0.7) * 0.26;
    star.rotation.x = Math.sin(t * 0.5 + 1.1) * 0.10;
    star.rotation.z = Math.sin(t * 0.33) * 0.05;
    renderer.render(scene, camera);
  });
}

const scan = () => document.querySelectorAll('[data-r="star3d"]').forEach(mount);
scan();
new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
