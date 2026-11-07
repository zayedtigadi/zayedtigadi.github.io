/* Turbofan hero scene - Three.js r160, vendored, MIT */
import * as THREE from './three.module.min.js';

(function () {
  var hero = document.querySelector('.hero');
  var canvas = document.getElementById('hero-3d');
  if (!hero || !canvas) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    canvas.remove();
    return; // fallback: photo hero stays fully visible
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  var CAM_BASE = { x: 0.3, y: 0.15, z: 6.4 };
  camera.position.set(CAM_BASE.x, CAM_BASE.y, CAM_BASE.z);

  // ---------- lights ----------
  scene.add(new THREE.AmbientLight(0x33404d, 1.15));
  var key = new THREE.PointLight(0x6fd3bc, 60, 24, 2);
  key.position.set(3.5, 2.2, 4.5);
  scene.add(key);
  var rim = new THREE.PointLight(0xe8b04b, 42, 22, 2);
  rim.position.set(-4.2, -1.6, 2.6);
  scene.add(rim);
  var fill = new THREE.DirectionalLight(0xdfe9f2, 0.75);
  fill.position.set(0.5, 1, 6);
  scene.add(fill);

  // ---------- engine ----------
  var engine = new THREE.Group();
  scene.add(engine);

  var metalDark = new THREE.MeshStandardMaterial({ color: 0x1c242e, metalness: 0.9, roughness: 0.32, side: THREE.DoubleSide });
  var metalBlade = new THREE.MeshStandardMaterial({ color: 0x33414d, metalness: 0.92, roughness: 0.26 });
  var metalHub = new THREE.MeshStandardMaterial({ color: 0x44525e, metalness: 0.95, roughness: 0.22 });

  // nacelle lip + cowl
  var lip = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.3, 32, 96), metalDark);
  engine.add(lip);
  var cowl = new THREE.Mesh(new THREE.CylinderGeometry(2.42, 2.28, 1.5, 64, 1, true), metalDark);
  cowl.rotation.x = Math.PI / 2;
  cowl.position.z = -0.75;
  engine.add(cowl);
  var barrel = new THREE.Mesh(new THREE.CylinderGeometry(1.85, 1.68, 1.7, 64, 1, true),
    new THREE.MeshStandardMaterial({ color: 0x141c24, metalness: 0.7, roughness: 0.55, side: THREE.BackSide }));
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = -0.85;
  engine.add(barrel);
  var back = new THREE.Mesh(new THREE.CircleGeometry(1.85, 64),
    new THREE.MeshBasicMaterial({ color: 0x070b10 }));
  back.position.z = -1.7;
  engine.add(back);
  var glow = new THREE.Mesh(new THREE.RingGeometry(1.86, 2.02, 64),
    new THREE.MeshBasicMaterial({ color: 0x6fd3bc, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
  glow.position.z = -1.66;
  engine.add(glow);

  // fan: hub + twisted blades
  var fan = new THREE.Group();
  engine.add(fan);

  function makeBladeGeometry() {
    var g = new THREE.BoxGeometry(0.055, 1.45, 0.42, 1, 16, 1);
    var pos = g.attributes.position;
    var v = new THREE.Vector3();
    for (var i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      var t = (v.y + 0.725) / 1.45; // 0 root -> 1 tip
      var twist = t * 1.05;
      var x = v.x * Math.cos(twist) - v.z * Math.sin(twist);
      var z = v.x * Math.sin(twist) + v.z * Math.cos(twist);
      pos.setXYZ(i, x, v.y, z + t * t * 0.28);
    }
    g.computeVertexNormals();
    return g;
  }

  var bladeGeo = makeBladeGeometry();
  var BLADES = 24;
  for (var i = 0; i < BLADES; i++) {
    var pivot = new THREE.Group();
    pivot.rotation.z = (i / BLADES) * Math.PI * 2;
    var blade = new THREE.Mesh(bladeGeo, metalBlade);
    blade.position.y = 1.08;
    blade.rotation.y = 0.55;
    pivot.add(blade);
    fan.add(pivot);
  }

  var spinner = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.85, 48), metalHub);
  spinner.rotation.x = -Math.PI / 2;
  spinner.position.z = 0.28;
  fan.add(spinner);
  var hubDisc = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.52, 0.3, 48), metalHub);
  hubDisc.rotation.x = Math.PI / 2;
  hubDisc.position.z = -0.05;
  fan.add(hubDisc);

  engine.rotation.set(0.06, -0.38, 0);

  // ---------- particles ----------
  var P = 220;
  var pGeo = new THREE.BufferGeometry();
  var pPos = new Float32Array(P * 3);
  for (var j = 0; j < P; j++) {
    pPos[j * 3] = (Math.random() - 0.5) * 13;
    pPos[j * 3 + 1] = (Math.random() - 0.5) * 8;
    pPos[j * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x8fb6c9, size: 0.028, transparent: true, opacity: 0.5, sizeAttenuation: true
  }));
  scene.add(points);

  // ---------- layout ----------
  function layout() {
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    if (w / h > 1.05) {
      engine.position.set(1.75, 0.15, 0);
      engine.scale.setScalar(1);
    } else {
      engine.position.set(0, 1.05, -1.2);
      engine.scale.setScalar(0.72);
    }
  }
  layout();
  window.addEventListener('resize', function () { layout(); if (reduce) renderer.render(scene, camera); });

  // ---------- motion ----------
  var px = 0, py = 0, tx = 0, ty = 0;
  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  });

  var running = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting;
    }, { threshold: 0.02 }).observe(canvas);
  }

  var clock = new THREE.Clock();
  function frame() {
    requestAnimationFrame(frame);
    if (!running || reduce) return;
    var dt = Math.min(clock.getDelta(), 0.05);
    var t = clock.elapsedTime;
    fan.rotation.z -= dt * 1.5;
    engine.rotation.y = -0.38 + Math.sin(t * 0.5) * 0.1;
    engine.rotation.x = 0.06 + Math.sin(t * 0.34) * 0.03;
    px += (tx - px) * 0.04;
    py += (ty - py) * 0.04;
    var scroll = Math.min(window.scrollY || 0, 900);
    camera.position.x = CAM_BASE.x + px * 0.38;
    camera.position.y = CAM_BASE.y - py * 0.26;
    camera.position.z = CAM_BASE.z + scroll * 0.0012;
    camera.lookAt(engine.position.x * 0.55, engine.position.y * 0.55, 0);
    var arr = pGeo.attributes.position.array;
    for (var k = 0; k < P; k++) {
      arr[k * 3 + 1] += dt * 0.1;
      if (arr[k * 3 + 1] > 4) arr[k * 3 + 1] = -4;
    }
    pGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
  }

  hero.classList.add('has-3d');
  if (reduce) {
    fan.rotation.z = 0.6;
    camera.lookAt(engine.position.x * 0.55, engine.position.y * 0.55, 0);
    renderer.render(scene, camera);
  } else {
    frame();
  }
})();
