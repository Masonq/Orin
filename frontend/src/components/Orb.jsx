import { useEffect, useRef } from 'react'

// Цвета состояний: [передний план, задний план, свечение]
const PALETTE = {
  idle: [[243, 194, 119], [127, 231, 224], [243, 178, 92]],
  listen: [[127, 231, 224], [90, 170, 255], [80, 210, 220]],
  think: [[180, 155, 255], [120, 90, 255], [150, 110, 255]],
  speak: [[155, 240, 122], [60, 210, 160], [110, 230, 140]],
}

const lerp = (a, b, t) => a + (b - a) * t

export default function Orb({ state = 'idle', levelRef, size = 300, intro = true, onClick, label }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    const cvs = canvasRef.current
    const ctx = cvs.getContext('2d')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const S = size
    cvs.width = S * dpr
    cvs.height = S * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const N = S < 260 ? 1500 : 2200
    const golden = Math.PI * (3 - Math.sqrt(5))
    const px = new Float32Array(N), py = new Float32Array(N), pz = new Float32Array(N)
    const sx = new Float32Array(N), sy = new Float32Array(N), sz = new Float32Array(N)
    const seed = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      px[i] = Math.cos(th) * r; py[i] = y; pz[i] = Math.sin(th) * r
      // старт интро: частицы разбросаны облаком
      sx[i] = (Math.random() - 0.5) * 4.2; sy[i] = (Math.random() - 0.5) * 4.2; sz[i] = (Math.random() - 0.5) * 2
      seed[i] = Math.random()
    }

    const col = PALETTE.idle.map((c) => c.slice())
    const ring = 84
    const ringVals = new Float32Array(ring)
    let level = 0
    let t0 = performance.now()
    let raf = 0
    let rot = 0
    const introDur = intro && !reduce ? 1700 : 0

    const frame = (now) => {
      const t = (now - t0) / 1000
      const st = stateRef.current
      const target = PALETTE[st] || PALETTE.idle
      for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) col[k][j] = lerp(col[k][j], target[k][j], 0.06)

      const ext = levelRef?.current ?? 0
      const base = st === 'idle' ? 0.05 : st === 'think' ? 0.12 : 0.08
      level = lerp(level, ext, 0.18)
      const amp = base + level * 0.26
      const speed = st === 'think' ? 0.9 : st === 'idle' ? 0.18 : 0.45
      rot += (reduce ? 0.2 : 1) * speed * 0.016

      const pi = introDur ? Math.min(1, (now - t0) / introDur) : 1
      const ease = 1 - Math.pow(1 - pi, 3)

      ctx.clearRect(0, 0, S, S)
      const cx = S / 2, cy = S / 2
      const R = S * 0.3

      // мягкое свечение
      const g = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.65)
      const [gr, gg, gb] = col[2]
      g.addColorStop(0, `rgba(${gr|0},${gg|0},${gb|0},${0.34 + level * 0.25})`)
      g.addColorStop(0.55, `rgba(${gr|0},${gg|0},${gb|0},${0.12 + level * 0.1})`)
      g.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.globalAlpha = ease
      ctx.fillStyle = g
      ctx.fillRect(0, 0, S, S)

      ctx.globalCompositeOperation = 'lighter'
      const cr = Math.cos(rot), sr = Math.sin(rot)
      const tilt = 0.35, ct = Math.cos(tilt), stl = Math.sin(tilt)
      const f = 2.8
      for (let i = 0; i < N; i++) {
        let x = px[i], y = py[i], z = pz[i]
        const n = Math.sin(x * 3.1 + t * 1.3) * Math.sin(y * 2.7 + t * 1.1) * Math.sin(z * 3.3 + t * 0.9)
        const d = 1 + amp * n + (st === 'speak' ? Math.sin(t * 9 + seed[i] * 6) * level * 0.03 : 0)
        x *= d; y *= d; z *= d
        // вращение вокруг Y, затем наклон
        let rx = x * cr + z * sr
        let rz = -x * sr + z * cr
        let ry = y * ct - rz * stl
        rz = y * stl + rz * ct
        if (pi < 1) {
          rx = lerp(sx[i], rx, ease); ry = lerp(sy[i], ry, ease); rz = lerp(sz[i], rz, ease)
        }
        const k = f / (f - rz)
        const X = cx + rx * R * k
        const Y = cy + ry * R * k
        const depth = (rz + 1) / 2 // 0 сзади, 1 спереди
        const c = depth > 0.5 ? col[0] : col[1]
        const a = 0.28 + depth * 0.72
        const sz2 = (1.1 + depth * 1.9) * (S / 300)
        ctx.fillStyle = `rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`
        ctx.fillRect(X - sz2 / 2, Y - sz2 / 2, sz2, sz2)
      }

      // кольцо-эквалайзер
      const ringOn = st === 'listen' || st === 'speak' ? 1 : st === 'think' ? 0.55 : 0.35
      const [r0, g0, b0] = col[0]
      ctx.lineCap = 'round'
      ctx.lineWidth = Math.max(1.4, S / 190)
      for (let i = 0; i < ring; i++) {
        const ang = (i / ring) * Math.PI * 2 + rot * 0.3
        const wob = Math.sin(t * 5 + i * 0.9) * 0.5 + Math.sin(t * 2.3 + i * 0.37) * 0.5
        const tgt = (0.12 + Math.max(0, wob) * 0.4) * (0.35 + level * 1.4) * ringOn
        ringVals[i] = lerp(ringVals[i], tgt, 0.25)
        const r1 = R * 1.42
        const r2 = r1 + R * 0.05 + ringVals[i] * R * 0.34
        ctx.strokeStyle = `rgba(${r0|0},${g0|0},${b0|0},${(0.22 + ringVals[i] * 0.9) * ease})`
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1)
        ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2)
        ctx.stroke()
      }
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const onVis = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame) }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis) }
  }, [size, intro, levelRef])

  return (
    <button type="button" className="orb" style={{ width: size, height: size }} onClick={onClick} aria-label={label}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </button>
  )
}
