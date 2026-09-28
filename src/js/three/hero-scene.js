/**
 * hero-scene.js — Chapter 01.
 *
 * The 1886 photograph as a shallow 3-D relief, with gold dust hanging in the
 * light above it. Two passes share one canvas and one context: the photograph
 * is drawn flat through an orthographic camera, then the motes are drawn in
 * perspective on top without clearing.
 */
import { THREE, register, disposeScene } from './renderer.js';
import { heroVert, heroFrag, dustVert, dustFrag } from '../shaders/hero.glsl.js';
import { env } from '../core/env.js';
import { clamp, lerp } from '../core/util.js';

export function initHeroScene(el, { src }) {
  if (!env.gl || !el) return null;

  /* ── Pass 1 · the photograph ───────────────────────────────────────────── */
  const scene = new THREE.Scene();
  const ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  const uniforms = {
    uTex:    { value: null },
    uRes:    { value: new THREE.Vector2(1, 1) },
    uImg:    { value: new THREE.Vector2(1408, 996) },
    uMouse:  { value: new THREE.Vector2(0, 0) },
    uTime:   { value: 0 },
    uScroll: { value: 0 },
    uIntro:  { value: 0 },
    uTint:   { value: new THREE.Color('#C6A268') },
  };

  const quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      vertexShader: heroVert,
      fragmentShader: heroFrag,
      uniforms,
      depthWrite: false,
      depthTest: false,
    })
  );
  quad.frustumCulled = false;
  scene.add(quad);

  let ready = false;
  new THREE.TextureLoader().load(src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    uniforms.uTex.value = tex;
    uniforms.uImg.value.set(tex.image.width, tex.image.height);
    ready = true;
  });

  /* ── Pass 2 · gold dust ────────────────────────────────────────────────── */
  const dustScene = new THREE.Scene();
  const dustCam = new THREE.PerspectiveCamera(48, 1, 0.1, 40);
  dustCam.position.z = 6;

  const COUNT = env.tier === 'high' ? 420 : 190;
  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  const size = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
    pos[i * 3 + 2] = -Math.random() * 6;
    seed[i] = Math.random();
    size[i] = 0.5 + Math.random() * 2.4;
  }
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  dg.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  dg.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

  const du = {
    uTime:   { value: 0 },
    uScroll: { value: 0 },
    uMouse:  { value: new THREE.Vector2() },
    uPix:    { value: env.dpr },
    uColor:  { value: new THREE.Color('#D9B978') },
  };
  dustScene.add(new THREE.Points(dg, new THREE.ShaderMaterial({
    vertexShader: dustVert,
    fragmentShader: dustFrag,
    uniforms: du,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: THREE.AdditiveBlending,
  })));

  /* ── Input ─────────────────────────────────────────────────────────────── */
  let mx = 0, my = 0, cx = 0, cy = 0;
  const onMove = (e) => {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (env.fine) addEventListener('mousemove', onMove, { passive: true });

  // The frame opens once the loader's flood has peeled away. This scene is
  // imported during idle time, so it can mount either before or after that
  // moment — hence both a flag check and a listener. The timeout is a
  // guarantee rather than a guess: the hero must never be left black (§81).
  let intro = window.emporia?.revealed ? 1 : 0;
  addEventListener('emporia:revealed', () => { intro = 1; }, { once: true });
  setTimeout(() => { intro = 1; }, 2500);

  const api = {
    el,
    scene,
    camera: ortho,

    update(dt, t, rect) {
      uniforms.uTime.value = t;
      cx = lerp(cx, mx, 0.05);
      cy = lerp(cy, my, 0.05);
      uniforms.uMouse.value.set(cx, cy);
      uniforms.uIntro.value = lerp(uniforms.uIntro.value, intro, 0.045);
      uniforms.uRes.value.set(rect.width * env.dpr, rect.height * env.dpr);

      const p = clamp(-rect.top / Math.max(rect.height, 1), 0, 1);
      uniforms.uScroll.value = p;

      du.uTime.value = t;
      du.uScroll.value = p;
      du.uMouse.value.set(cx, cy);

      dustCam.aspect = rect.width / Math.max(rect.height, 1);
      dustCam.updateProjectionMatrix();
    },

    /** Both passes, one canvas: clear for the photograph, then draw over it. */
    _composite() {
      const r = api.renderer;
      if (!ready) return;
      r.autoClear = true;
      r.render(scene, ortho);
      r.autoClear = false;
      r.render(dustScene, dustCam);
      r.autoClear = true;
    },

    dispose() {
      removeEventListener('mousemove', onMove);
      disposeScene(scene);
      disposeScene(dustScene);
    },
  };

  register(api);
  return api;
}
