import { useEffect, useRef, useState, useId } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

export function Counter({ value, format = (n) => n, duration = 900 }) {
  const [v, setV] = useState(0)
  const from = useRef(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setV(value); from.current = value; return }
    const start = performance.now(), a = from.current
    let raf
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      setV(Math.round(a + (value - a) * e))
      if (p < 1) raf = requestAnimationFrame(step)
      else from.current = value
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, duration])
  return <span className="num">{format(v)}</span>
}

export function Sparkline({ data, color = 'var(--honey)', height = 28 }) {
  const id = useId().replace(/:/g, '')
  const w = 100
  const max = Math.max(...data), min = Math.min(...data)
  const pts = data.map((d, i) => [(i / (data.length - 1)) * w, height - 3 - ((d - min) / (max - min || 1)) * (height - 6)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`g${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${w},${height} L0,${height} Z`} fill={`url(#g${id})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
    </svg>
  )
}

export function Ring({ value, size = 76, stroke = 7, color = 'var(--mint)', children }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const [p, setP] = useState(0)
  useEffect(() => { const id = requestAnimationFrame(() => setP(value)); return () => cancelAnimationFrame(id) }, [value])
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1.1s cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="ring-c">{children}</div>
    </div>
  )
}

export function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      className={`switch ${checked ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); onChange(!checked) }}>
      <span />
    </button>
  )
}

export function Segmented({ options, value, onChange, small }) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value))
  return (
    <div className={`seg ${small ? 'seg-s' : ''}`} style={{ '--n': options.length, '--i': idx }} role="tablist">
      <span className="seg-thumb" />
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={o.value === value}
          className={o.value === value ? 'act' : ''} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  )
}

export function Sheet({ open, onClose, title, children, closeLabel = 'Закрыть' }) {
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const tm = setTimeout(() => setMounted(false), 320)
    return () => clearTimeout(tm)
  }, [open])
  useEffect(() => {
    if (!open) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!mounted) return null
  return createPortal(
    <div className={`sheet-wrap ${shown ? 'shown' : ''}`}>
      <div className="sheet-dim" onClick={onClose} />
      <div className="sheet glass" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-grip" />
        <div className="sheet-head">
          <h3>{title}</h3>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={closeLabel}><X size={18} /></button>
        </div>
        <div className="sheet-body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export function Avatar({ name, size = 36 }) {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360
  const initials = name.replace(/[^a-zA-Zа-яА-Я]/g, ' ').trim().split(/\s+/).slice(0, 2).map((s) => s[0]).join('').toUpperCase() || '?'
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, '--h': h }}>{initials}</span>
  )
}

export function Thumb({ hue, title, className = '' }) {
  return (
    <div className={`thumb ${className}`} style={{ '--h': hue }} aria-hidden="true">
      <span className="thumb-t">{title}</span>
    </div>
  )
}
