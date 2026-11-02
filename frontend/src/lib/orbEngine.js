/* Шар из частиц — общий для Orin и NS.
   Сфера (покой, слушаю, отвечаю) ↔ кольцо (думаю) ↔ логотип (готово); сборка из облака при запуске,
   два тона по глубине, свечение и кольцо-эквалайзер; уровень звука двигает и шар, и кольцо. */
function createOrb(cv, opts) {
  const o = Object.assign({ size: 300, logo: "O", intro: true, state: () => "idle", amp: () => 0, theme: () => "dark" }, opts || {});
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(2, devicePixelRatio || 1), S = o.size;
  cv.width = cv.height = Math.round(S * dpr); cv.style.width = cv.style.height = S + "px";
  const g = cv.getContext("2d");
  const N = S < 260 ? 1400 : 2000;
  const PAL = {
    dark: {
      idle: [[243, 194, 119], [127, 231, 224]], listen: [[127, 231, 224], [96, 165, 255]], think: [[180, 155, 255], [120, 92, 255]],
      speak: [[155, 240, 122], [64, 214, 164]], done: [[255, 255, 255], [243, 194, 119]], error: [[255, 138, 122], [255, 96, 96]],
    },
    light: {
      idle: [[47, 107, 255], [236, 128, 32]], listen: [[10, 150, 170], [47, 107, 255]], think: [[109, 74, 255], [150, 110, 255]],
      speak: [[16, 150, 100], [10, 150, 170]], done: [[22, 32, 60], [47, 107, 255]], error: [[214, 64, 56], [236, 128, 32]],
    },
  };
  const sphere = [], ring = [], logo = [], P = [], seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996;
    sphere.push([Math.cos(th) * r, y, Math.sin(th) * r]);
    const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI * 2, R = 0.82, rr = 0.16 + Math.random() * 0.06;
    ring.push([(R + rr * Math.cos(b)) * Math.cos(a), rr * Math.sin(b), (R + rr * Math.cos(b)) * Math.sin(a)]);
    P.push(o.intro && !reduce ? [(Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2] : sphere[i].slice());
    seed[i] = Math.random();
  }
  {
    const W = 240, H = 130, oc = document.createElement("canvas"); oc.width = W; oc.height = H;
    const x = oc.getContext("2d"), fs = o.logo.length > 2 ? 64 : 104;
    x.font = `800 ${fs}px Manrope, system-ui, sans-serif`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(o.logo, W / 2, H / 2 + 4);
    const px = x.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += 2) for (let xx = 0; xx < W; xx += 2) if (px[(y * W + xx) * 4 + 3] > 128) pts.push([(xx - W / 2) / 110, (y - H / 2) / 110, (Math.random() - 0.5) * 0.08]);
    for (let i = 0; i < N; i++) logo.push(pts.length ? pts[(i * 7919) % pts.length] : [0, 0, 0]);
  }
  const col = [PAL.dark.idle[0].slice(), PAL.dark.idle[1].slice()];
  const RING = 84, rv = new Float32Array(RING);
  let rot = 0, last = performance.now(), lvl = 0, raf = 0, alive = true, appear = o.intro && !reduce ? 0 : 1;
  function frame(now) {
    if (!alive || !cv.isConnected) return;
    const dt = Math.min(50, now - last) / 1000; last = now;
    const st = o.state(), th = o.theme() === "light" ? "light" : "dark";
    const pal = (PAL[th][st] || PAL[th].idle);
    for (let k = 0; k < 2; k++) for (let j = 0; j < 3; j++) col[k][j] += (pal[k][j] - col[k][j]) * Math.min(1, dt * 4);
    lvl += (Math.max(0, Math.min(1, o.amp())) - lvl) * Math.min(1, dt * 10);
    appear = Math.min(1, appear + dt / 1.6);
    const tgt = st === "think" ? ring : st === "done" ? logo : sphere;
    const flat = st === "done";
    rot += dt * (reduce ? 0.15 : st === "think" ? 1.6 : flat ? 0 : 0.32 + lvl * 0.8);
    const ease = Math.min(1, dt * (flat ? 5 : appear < 1 ? 2.2 : 3));
    const t = now / 1000, amp = (st === "idle" ? 0.045 : 0.08) + lvl * 0.24;
    const breathe = 1 + Math.sin(now / 900) * 0.02;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, S, S);
    const cx = S / 2, cy = S / 2, R = S * 0.3, light = th === "light";
    // свечение
    const [gr, gg, gb] = col[0].map((v) => v | 0);
    const grad = g.createRadialGradient(cx, cy, R * 0.15, cx, cy, R * 1.7);
    grad.addColorStop(0, `rgba(${gr},${gg},${gb},${(light ? 0.16 : 0.32) + lvl * 0.2})`);
    grad.addColorStop(0.55, `rgba(${gr},${gg},${gb},${(light ? 0.06 : 0.11) + lvl * 0.08})`);
    grad.addColorStop(1, `rgba(${gr},${gg},${gb},0)`);
    g.globalAlpha = Math.min(1, appear * 1.4); g.fillStyle = grad; g.fillRect(0, 0, S, S); g.globalAlpha = 1;
    g.globalCompositeOperation = light ? "source-over" : "lighter";
    const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(0.35), stl = Math.sin(0.35);
    for (let i = 0; i < N; i++) {
      const p = P[i], q = tgt[i];
      let d = breathe;
      if (!flat) {
        const n = Math.sin(q[0] * 3.1 + t * 1.3) * Math.sin(q[1] * 2.7 + t * 1.1) * Math.sin(q[2] * 3.3 + t * 0.9);
        d += amp * n + (st === "speak" || st === "listen" ? Math.sin(t * 9 + seed[i] * 6) * lvl * 0.03 : 0);
      }
      p[0] += (q[0] * d - p[0]) * ease; p[1] += (q[1] * d - p[1]) * ease; p[2] += (q[2] * d - p[2]) * ease;
      let x = p[0], y = p[1], z = p[2];
      if (!flat) { const rx = x * cr + z * sr; let rz = -x * sr + z * cr; const ry = y * ct - rz * stl; rz = y * stl + rz * ct; x = rx; y = ry; z = rz; }
      const k = 2.8 / (2.8 - z), depth = Math.max(0, Math.min(1, (z + 1) / 2));
      const c = depth > 0.5 || flat ? col[0] : col[1];
      const a = flat ? 0.95 : (light ? 0.35 : 0.28) + depth * (light ? 0.6 : 0.72);
      const sz = (flat ? 1.7 : 1.1 + depth * 1.9) * (S / 300);
      g.fillStyle = `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(2)})`;
      g.fillRect(cx + x * R * k - sz / 2, cy + y * R * k - sz / 2, sz, sz);
    }
    // кольцо-эквалайзер
    const on = flat ? 0 : st === "listen" || st === "speak" ? 1 : st === "think" ? 0.55 : 0.35;
    g.lineCap = "round"; g.lineWidth = Math.max(1.4, S / 190);
    const [r0, g0, b0] = col[0].map((v) => v | 0);
    for (let i = 0; i < RING; i++) {
      const ang = (i / RING) * Math.PI * 2 + rot * 0.3;
      const wob = Math.sin(t * 5 + i * 0.9) * 0.5 + Math.sin(t * 2.3 + i * 0.37) * 0.5;
      rv[i] += ((0.12 + Math.max(0, wob) * 0.4) * (0.35 + lvl * 1.4) * on - rv[i]) * 0.25;
      const r1 = R * 1.42, r2 = r1 + R * 0.05 + rv[i] * R * 0.34;
      g.strokeStyle = `rgba(${r0},${g0},${b0},${((light ? 0.3 : 0.22) + rv[i] * 0.9) * appear * (on ? 1 : 0)})`;
      g.beginPath(); g.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1); g.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2); g.stroke();
    }
    g.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  document.addEventListener("visibilitychange", vis);
  return { stop() { alive = false; cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", vis); } };
}

export default createOrb
