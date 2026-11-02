import { useEffect, useState } from 'react'
import { AppProvider, useApp } from './lib/store'
import { Sidebar, TabBar, TopBar } from './components/Shell'
import { Sheet } from './components/ui'
import Assistant from './screens/Assistant'
import Summary from './screens/Summary'
import Comments from './screens/Comments'
import Rules from './screens/Rules'
import Calendar from './screens/Calendar'
import { Accounts, Plans, Settings } from './screens/Other'

function useDesktop() {
  const q = '(min-width: 1024px)'
  const [d, setD] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const m = window.matchMedia(q)
    const on = () => setD(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return d
}

function Shell() {
  const { route, t, toasts, settings } = useApp()
  const desktop = useDesktop()
  const [menu, setMenu] = useState(false)
  const [logout, setLogout] = useState(false)

  useEffect(() => { setMenu(false); window.scrollTo(0, 0); document.querySelector('.main')?.scrollTo(0, 0) }, [route])
  useEffect(() => { document.title = `${t.nav[route]} — Orin` }, [route, t])

  const doLogout = () => {
    try { localStorage.clear() } catch { /* нет доступа */ }
    window.location.hash = ''
    window.location.reload()
  }

  const screens = {
    assistant: <Assistant desktop={desktop} />, summary: <Summary />, comments: <Comments />, rules: <Rules />,
    calendar: <Calendar />, accounts: <Accounts />, plans: <Plans />, settings: <Settings onLogout={() => setLogout(true)} />,
  }

  return (
    <div className={`app ${desktop ? 'is-desk' : 'is-mob'} ${desktop && settings.collapsed ? 'side-collapsed' : ''}`}>
      <div className="scene" aria-hidden="true"><div className="blob blob-b" /><div className="blob blob-w" /><div className="blob blob-o" /><div className="blob blob-o2" /><div className="scene-grain" /><div className="scene-tint" /></div>
      {desktop ? (
        <Sidebar desktop onLogout={() => setLogout(true)} />
      ) : (
        <>
          <div className={`side-dim ${menu ? 'show' : ''}`} onClick={() => setMenu(false)} />
          <Sidebar open={menu} onClose={() => setMenu(false)} onLogout={() => { setMenu(false); setLogout(true) }} />
          <TopBar onMenu={() => setMenu(true)} />
        </>
      )}
      <main className={`main r-${route}`} key={route}>{screens[route]}</main>
      {!desktop && <TabBar />}
      <div className="toasts" aria-live="polite">
        {toasts.map((x) => <div key={x.id} className={`toast glass ${x.kind}`}>{x.text}</div>)}
      </div>
      <Sheet open={logout} onClose={() => setLogout(false)} title={t.set.logoutTitle} closeLabel={t.close}>
        <p className="sheet-text">{t.set.logoutText}</p>
        <button type="button" className="btn danger wide armed" onClick={doLogout}>{t.set.logoutOk}</button>
        <button type="button" className="btn wide" onClick={() => setLogout(false)}>{t.set.cancel}</button>
      </Sheet>
    </div>
  )
}

export default function App() {
  return <AppProvider><Shell /></AppProvider>
}
