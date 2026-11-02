import { useEffect, useRef } from 'react'
import createOrb from '../lib/orbEngine'

// Общий шар Orin × NS: состояние и уровень звука читаются на каждом кадре
export default function Orb({ state = 'idle', levelRef, size = 300, intro = true, onClick, label }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(state)
  stateRef.current = state
  useEffect(() => {
    const orb = createOrb(canvasRef.current, {
      size, logo: 'Orin', intro,
      state: () => stateRef.current,
      amp: () => levelRef?.current ?? 0,
      theme: () => document.documentElement.dataset.theme || 'dark',
    })
    return () => orb.stop()
  }, [size, intro, levelRef])
  return (
    <button type="button" className="orb" style={{ width: size, height: size }} onClick={onClick} aria-label={label}>
      <canvas ref={canvasRef} style={{ width: size, height: size }} />
    </button>
  )
}
