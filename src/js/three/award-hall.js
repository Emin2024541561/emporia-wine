/**
 * award-hall.js — Chapter 10.
 * Gold motes suspended in a dark hall, drifting slowly behind the medals.
 * Deliberately the quietest scene in the site: atmosphere, not spectacle.
 */
import { THREE, register, disposeScene } from './renderer.js';
import { env } from '../core/env.js';
import { lerp } from '../core/util.js';

export function initAwardHall(el) {
  if (!env.gl || !el) return null;

  const COUNT = env.tier === 'high' ? 300 : 130;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  camera.position.z = 12;

  const pos = new Float32Array(COUNT * 3);
  const seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 26;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = -Math.random() * 14;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPix: { value: env.dpr },
    uMouse: { value: new THREE.Vector2() },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aSeed;
      uniform float uTime; uniform float uPix; uniform vec2 uMouse;
      varying float vA;
      void main() {
        vec3 p = position;
        float t = uTime * (0.05 + aSeed * 0.09);
        p.y += sin(t + aSeed * 6.28) * 1.4;
        p.x += cos(t * 0.7 + aSeed * 3.1) * 1.1;
        p.xy += uMouse * (0.5 + aSeed);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (0.7 + aSeed * 2.6) * uPix * (10.0 / -mv.z);
        vA = 0.25 + aSeed * 0.55;
      }`,
    fragmentShader: /* glsl */`
      precision mediump float;
      varying float vA;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vec3(0.85, 0.68, 0.36), a * a * vA);
      }`,
  });

  scene.add(new THREE.Points(geo, mat));

  let mx = 0, my = 0, cx = 0, cy = 0;
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
      uniforms.uTime.value = t;
      cx = lerp(cx, mx, 0.04); cy = lerp(cy, my, 0.04);
      uniforms.uMouse.value.set(cx, cy);
    },
    dispose() { removeEventListener('mousemove', onMove); disposeScene(scene); },
  };
  register(api);
  return api;
}
