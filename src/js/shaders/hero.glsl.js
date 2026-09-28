/**
 * hero.glsl.js — the opening scene's shader pair.
 *
 * The 1886 photograph is treated as a shallow relief: a procedural depth field
 * (foreground low in frame + local luminance) drives a parallax offset that
 * responds to scroll and to the cursor, so the camera appears to move between
 * the vine rows rather than over a flat picture. Grain, vignette and a slow
 * warm light sweep are done in the same pass, so there is no post-processing
 * chain to pay for.
 */

export const heroVert = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const heroFrag = /* glsl */`
  precision highp float;

  uniform sampler2D uTex;
  uniform vec2  uRes;        // canvas size
  uniform vec2  uImg;        // texture size, for cover-fit
  uniform vec2  uMouse;      // -1 … 1
  uniform float uTime;
  uniform float uScroll;     // 0 … 1 through the hero
  uniform float uIntro;      // 0 … 1 entrance
  uniform vec3  uTint;

  varying vec2 vUv;

  // -- cheap value noise, used for grain and for the light sweep -------------
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }

  // -- cover-fit the texture into the viewport, no distortion ---------------
  vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
    float rs = res.x / res.y;
    float ri = img.x / img.y;
    vec2 s = rs < ri ? vec2(ri / rs, 1.0) : vec2(1.0, rs / ri);
    return (uv - 0.5) * s + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uRes, uImg);

    // Depth: the ground plane runs toward the viewer at the bottom of frame,
    // and darker pixels (the vine stakes, the figures) sit a little forward.
    float base = smoothstep(0.05, 1.0, 1.0 - vUv.y);
    float lum  = dot(texture2D(uTex, uv).rgb, vec3(0.299, 0.587, 0.114));
    float depth = clamp(base * 0.82 + (1.0 - lum) * 0.34, 0.0, 1.0);

    // Camera: pushes in with scroll, drifts with the cursor, breathes slowly.
    float push = uScroll * 0.16 + uIntro * 0.10;
    vec2  drift = uMouse * 0.022 * depth;
    float breathe = sin(uTime * 0.16) * 0.0035;

    vec2 p = uv - 0.5;
    p *= 1.0 - push * depth - breathe;
    p += drift;
    p += vec2(0.0, uScroll * 0.045 * (1.0 - depth));   // horizon lifts slightly
    vec2 suv = p + 0.5;

    vec3 col = texture2D(uTex, suv).rgb;

    // A faint chromatic split at the frame edges — glass, not gimmick.
    float edge = smoothstep(0.30, 0.98, length(vUv - 0.5) * 1.35);
    vec2 ca = normalize(vUv - 0.5 + 1e-5) * 0.0016 * edge;
    col.r = texture2D(uTex, suv + ca).r;
    col.b = texture2D(uTex, suv - ca).b;

    // The photograph is a monochrome archive print: keep it so, and warm it.
    float g = dot(col, vec3(0.299, 0.587, 0.114));
    col = mix(vec3(g), col, 0.10);
    col = mix(col, col * uTint, 0.42);
    col = (col - 0.5) * 1.10 + 0.5;                    // contrast

    // Slow raking light across the vineyard.
    float sweep = noise(vec2(vUv.x * 2.2 - uTime * 0.045, vUv.y * 1.6));
    col += uTint * sweep * 0.055 * (1.0 - base);

    // Vignette, then grain.
    float vig = smoothstep(1.18, 0.34, length((vUv - 0.5) * vec2(1.05, 1.0)) * 1.42);
    col *= mix(0.30, 1.0, vig);
    float grain = noise(vUv * uRes * 0.55 + uTime * 40.0);
    col += (grain - 0.5) * 0.045;

    // Entrance: the frame irises open from black.
    col *= smoothstep(0.0, 0.55, uIntro);

    gl_FragColor = vec4(col, 1.0);
  }
`;

/* ── Gold dust motes that hang in the light ────────────────────────────────── */
export const dustVert = /* glsl */`
  attribute float aSeed;
  attribute float aSize;
  uniform float uTime;
  uniform float uScroll;
  uniform vec2  uMouse;
  uniform float uPix;
  varying float vAlpha;

  void main() {
    vec3 p = position;
    float t = uTime * (0.06 + aSeed * 0.10);
    p.x += sin(t + aSeed * 6.2831) * 0.42;
    p.y += cos(t * 0.8 + aSeed * 3.14) * 0.30 + uScroll * 1.4;
    p.z += sin(t * 0.5 + aSeed * 1.7) * 0.30;
    p.xy += uMouse * (0.20 + aSeed * 0.30);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPix * (7.0 / -mv.z);
    vAlpha = smoothstep(0.0, 0.25, aSeed) * 0.65;
  }
`;

export const dustFrag = /* glsl */`
  precision mediump float;
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha);
  }
`;
