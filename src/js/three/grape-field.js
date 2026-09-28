/**
 * grape-field.js — Chapter 06, the terroir.
 *
 * Instanced grapes drift through the vineyard air and gather toward the
 * cursor, then settle. Instance count and geometry detail scale with the
 * device tier; on a low tier the scene is never created at all.
 */
import { THREE, register, disposeScene } from './renderer.js';
import { env } from '../core/env.js';
import { clamp, lerp } from '../core/util.js';

export function initGrapeField(el) {
  if (!env.gl || !el) return null;

  // Deliberately sparse. An earlier pass at 130 grapes read as confetti and
  // buried the typography; the point of this scene is atmosphere behind the
  // chapter, not a particle demo in front of it (§35, §85).
  const COUNT = env.tier === 'high' ? 44 : 22;
  const DETAIL = env.tier === 'high' ? 2 : 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
  camera.position.set(0, 0, 15);

  const geo = new THREE.IcosahedronGeometry(0.42, DETAIL);
  const mat = new THREE.MeshStandardMaterial({
    roughness: 0.34, metalness: 0.04, transparent: true, opacity: 0.5,
    depthWrite: false,
  });
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  // Grape colours taken from the brochure's own fruit photography.
  const PALETTE = ['#3B2A4A', '#5A2740', '#8E9E4B', '#2E1F33', '#6B8438', '#7C4A5C'];
  const colors = new Float32Array(COUNT * 3);
  const c = new THREE.Color();

  const state = [];
  for (let i = 0; i < COUNT; i++) {
    state.push({
      // Spread wide and pushed well back, so they sit behind the reading
      // column rather than across it.
      home: new THREE.Vector3((Math.random() - 0.5) * 34, (Math.random() - 0.5) * 20, -6 - Math.random() * 12),
      pos:  new THREE.Vector3(),
      phase: Math.random() * Math.PI * 2,
      speed: 0.18 + Math.random() * 0.35,
      spin:  (Math.random() - 0.5) * 0.5,
      scale: 0.42 + Math.random() * 0.7,
      rot: new THREE.Euler(Math.random() * 6, Math.random() * 6, Math.random() * 6),
    });
    state[i].pos.copy(state[i].home);
    c.set(PALETTE[i % PALETTE.length]);
    c.toArray(colors, i * 3);
  }
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  scene.add(mesh);

  // Warm key light from the upper left, cool fill from behind — vineyard dusk.
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffe0b0, 1.6); key.position.set(-4, 6, 8); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9BCB42, 0.7); rim.position.set(6, -3, -6); scene.add(rim);

  const dummy = new THREE.Object3D();
  const target = new THREE.Vector3();
  let mx = 0, my = 0, gx = 0, gy = 0, scrollP = 0;

  const onMove = (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  if (env.fine) addEventListener('mousemove', onMove, { passive: true });

  const api = {
    el, scene, camera,
    update(dt, t, rect) {
      camera.aspect = rect.width / Math.max(rect.height, 1);
      camera.updateProjectionMatrix();

      scrollP = clamp(-rect.top / Math.max(rect.height - window.innerHeight, 1), 0, 1);
      gx = lerp(gx, mx, 0.045); gy = lerp(gy, my, 0.045);
      target.set(gx * 9, gy * 6, 2);

      for (let i = 0; i < COUNT; i++) {
        const s = state[i];
        // Drift: a slow float, plus a gentle fall as the chapter is scrolled.
        s.pos.x = s.home.x + Math.sin(t * s.speed + s.phase) * 1.5;
        s.pos.y = s.home.y + Math.cos(t * s.speed * 0.75 + s.phase) * 1.1 - scrollP * 6.0;
        s.pos.z = s.home.z + Math.sin(t * s.speed * 0.5 + s.phase) * 0.9;

        // Attraction toward the cursor, falling off with distance.
        // A gentle gathering toward the cursor — noticeable if you look for
        // it, invisible if you are reading.
        const d = s.pos.distanceTo(target);
        if (d < 8) s.pos.lerp(target, (1 - d / 8) * 0.06);

        dummy.position.copy(s.pos);
        dummy.rotation.set(s.rot.x + t * s.spin * 0.4, s.rot.y + t * s.spin * 0.3, s.rot.z);
        const pop = 1 + Math.sin(t * 0.8 + s.phase) * 0.06;
        dummy.scale.setScalar(s.scale * pop);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose() { removeEventListener('mousemove', onMove); disposeScene(scene); },
  };

  register(api);
  return api;
}
