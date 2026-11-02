import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { dict } from './i18n'
import { api } from './api'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

const DEFAULTS = { name: 'Максим', lang: 'ru', voice: true, rate: 1, night: false, collapsed: false, plan: 'start' }
const KEY = 'orin.settings.v1'

function loadSettings() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') } } catch { return DEFAULTS }
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

  useEffect(() => {
    document.documentElement.lang = settings.lang
    document.documentElement.dataset.night = settings.night ? '1' : '0'
  }, [settings.lang, settings.night])

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
    settings, set, t, lang: settings.lang, route, navigate, data, error, refresh, toast, toasts, project, setProject,
  }), [settings, set, t, route, navigate, data, error, refresh, toast, toasts, project])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
