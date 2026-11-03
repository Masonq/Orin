import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { dict } from './i18n'
import { api } from './api'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const DEFAULTS = { name: 'Максим', lang: 'ru', voice: true, rate: 1, theme: 'auto', collapsed: false, plan: 'start' }
const KEY = 'orin.settings.v1'

function loadSettings() {
  try {
    const s = { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }
    if ('night' in s) { if (s.night) s.theme = 'dark'; delete s.night }
    return s
  } catch { return DEFAULTS }
}

export const ROUTES = ['assistant', 'summary', 'comments', 'rules', 'calendar', 'accounts', 'plans', 'settings']

function readRoute() {
  const h = window.location.hash.replace('#', '')
  return ROUTES.includes(h) ? h : 'assistant'
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)
  const [route, setRoute] = useState(readRoute)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [toasts, setToasts] = useState([])
  const [project, setProject] = useState(null)
  const t = dict[settings.lang] || dict.ru

  const set = useCallback((patch) => {
    setSettings((s) => {
      const n = { ...s, ...patch }
      try { localStorage.setItem(KEY, JSON.stringify(n)) } catch { /* приватный режим */ }
      return n
    })
  }, [])

  const reqId = useRef(0)
  const refresh = useCallback(async () => {
    const id = ++reqId.current
    try {
      const d = await api.state(settings.lang)
      if (id === reqId.current) { setData(d); setError(null) }
    } catch (e) {
      if (id === reqId.current) setError(e)
    }
  }, [settings.lang])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const on = () => setRoute(readRoute())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const [sysDark, setSysDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const on = () => setSysDark(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  const theme = settings.theme === 'auto' ? (sysDark ? 'dark' : 'light') : settings.theme
  useEffect(() => {
    document.documentElement.lang = settings.lang
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#1a0b0e' : '#fff8f2')
  }, [settings.lang, theme])

  const navigate = useCallback((r) => {
    if (r === readRoute()) return
    window.location.hash = r
  }, [])

  const toast = useCallback((text, kind = 'ok') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((l) => [...l.slice(-2), { id, text, kind }])
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), 2600)
  }, [])

  const value = useMemo(() => ({
    settings, set, t, lang: settings.lang, theme, route, navigate, data, error, refresh, toast, toasts, project, setProject,
  }), [settings, set, t, theme, route, navigate, data, error, refresh, toast, toasts, project])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
