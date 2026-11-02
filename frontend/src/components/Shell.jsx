import { useMemo, useState } from 'react'
import {
  AudioLines, LayoutGrid, MessageCircle, Zap, CalendarDays, Users, Gem, Settings2, LogOut, Moon,
  Search, PanelLeftClose, PanelLeftOpen, Menu, ChevronDown, X, Layers,
} from 'lucide-react'
import { useApp } from '../lib/store'
import { Switch, Avatar } from './ui'

export const MAIN = [
  { id: 'assistant', icon: AudioLines },
  { id: 'summary', icon: LayoutGrid },
  { id: 'comments', icon: MessageCircle },
  { id: 'rules', icon: Zap },
  { id: 'calendar', icon: CalendarDays },
]
const WORK = [
  { id: 'accounts', icon: Users },
  { id: 'plans', icon: Gem },
  { id: 'settings', icon: Settings2 },
]

export function Mark({ size = 28 }) {
  return <span className="mark" style={{ width: size, height: size }} aria-hidden="true" />
}

function useBadges() {
  const { data } = useApp()
  return {
    comments: data ? data.comments.filter((c) => !c.answered).length : 0,
    rules: data ? data.rules.filter((r) => r.enabled).length : 0,
  }
}

export function Sidebar({ open, onClose, onLogout, desktop }) {
  const { t, route, navigate, settings, set, data, setProject, project, theme } = useApp()
  const badges = useBadges()
  const [q, setQ] = useState('')
  const [projOpen, setProjOpen] = useState(true)
  const collapsed = desktop && settings.collapsed

  const query = q.trim().toLowerCase()
  const match = (id) => !query || t.nav[id].toLowerCase().includes(query)
  const main = MAIN.filter((x) => match(x.id))
  const work = WORK.filter((x) => match(x.id))
  const projects = useMemo(() => (data?.projects || []).filter((p) => !query || p.label.toLowerCase().includes(query)), [data, query])
  const nothing = !main.length && !work.length && !projects.length

  const go = (id) => { navigate(id); if (!desktop) onClose?.() }
  const goProject = (pid) => { setProject(pid); navigate('calendar'); if (!desktop) onClose?.() }

  const Item = ({ id, icon: Icon }) => {
    const badge = badges[id]
    return (
      <button type="button" className={`side-item ${route === id ? 'act' : ''}`} onClick={() => go(id)}
        data-tip={collapsed ? t.nav[id] : undefined} aria-current={route === id ? 'page' : undefined}>
        <span className="side-ic"><Icon size={18} strokeWidth={1.8} />{collapsed && badge ? <i className="dot-badge" /> : null}</span>
        {!collapsed && <span className="side-label">{t.nav[id]}</span>}
        {!collapsed && badge ? <span className={`side-badge ${id === 'comments' ? 'hot' : ''}`}>{badge}</span> : null}
      </button>
    )
  }

  return (
    <aside className={`side glass ${collapsed ? 'collapsed' : ''} ${desktop ? 'desk' : ''} ${open ? 'open' : ''}`} aria-label="Menu">
      <div className="side-head">
        <Mark size={collapsed ? 30 : 32} />
        {!collapsed && (
          <div className="side-brand">
            <b>Orin</b>
            <span>@{data?.account.handle || '…'}</span>
          </div>
        )}
        {desktop ? (
          <button type="button" className="icon-btn side-toggle" onClick={() => set({ collapsed: !settings.collapsed })}
            aria-label={collapsed ? t.side.expand : t.side.collapse} data-tip={collapsed ? t.side.expand : undefined}>
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        ) : (
          <button type="button" className="icon-btn side-toggle" onClick={onClose} aria-label={t.close}><X size={18} /></button>
        )}
      </div>

      {collapsed ? (
        <button type="button" className="side-item" onClick={() => set({ collapsed: false })} data-tip={t.side.search} aria-label={t.side.search}>
          <span className="side-ic"><Search size={18} strokeWidth={1.8} /></span>
        </button>
      ) : (
        <label className="side-search">
          <Search size={16} strokeWidth={1.8} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.side.search} />
          {q && <button type="button" className="clear" onClick={() => setQ('')} aria-label={t.close}><X size={14} /></button>}
        </label>
      )}

      <div className="side-scroll">
        {main.length > 0 && <div className="side-group">{!collapsed && <p className="side-cap">{t.side.main}</p>}{main.map((x) => <Item key={x.id} {...x} />)}</div>}
        {(projects.length > 0 || work.length > 0) && (
          <div className="side-group">
            {!collapsed && <p className="side-cap">{t.side.workspace}</p>}
            {projects.length > 0 && !collapsed && (
              <>
                <button type="button" className="side-item" onClick={() => setProjOpen((v) => !v)} aria-expanded={projOpen}>
                  <span className="side-ic"><Layers size={18} strokeWidth={1.8} /></span>
                  <span className="side-label">{t.side.projects}</span>
                  <ChevronDown size={16} className={`chev ${projOpen ? 'up' : ''}`} />
                </button>
                <div className={`side-sub ${projOpen ? 'open' : ''}`}>
                  <div>
                    {projects.map((p) => (
                      <button type="button" key={p.id} className={`side-subitem ${route === 'calendar' && project === p.id ? 'act' : ''}`} onClick={() => goProject(p.id)}>
                        <i style={{ background: p.color }} />{p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            {work.map((x) => <Item key={x.id} {...x} />)}
          </div>
        )}
        {nothing && !collapsed && <p className="side-empty">{t.side.nothing}</p>}
      </div>

      <div className="side-foot">
        <div className={`side-item static ${collapsed ? '' : 'night'}`} data-tip={collapsed ? t.side.night : undefined}
          onClick={collapsed ? () => set({ theme: theme === 'dark' ? 'light' : 'dark' }) : undefined}>
          <span className="side-ic"><Moon size={18} strokeWidth={1.8} /></span>
          {!collapsed && <span className="side-label">{t.side.night}</span>}
          {!collapsed && <Switch checked={theme === 'dark'} onChange={(v) => set({ theme: v ? 'dark' : 'light' })} label={t.side.night} />}
        </div>
        <div className="side-user">
          <Avatar name={settings.name || 'Orin'} size={34} />
          {!collapsed && (
            <div className="side-user-t">
              <b>{settings.name || 'Orin'}</b>
              <span>{t.side.demo}</span>
            </div>
          )}
          {!collapsed && (
            <button type="button" className="icon-btn" onClick={onLogout} aria-label={t.side.logout}><LogOut size={16} /></button>
          )}
        </div>
      </div>
    </aside>
  )
}

export function TabBar() {
  const { t, route, navigate } = useApp()
  const badges = useBadges()
  return (
    <nav className="tabbar glass" aria-label="Tabs">
      {MAIN.map(({ id, icon: Icon }) => {
        const act = route === id
        return (
          <button key={id} type="button" className={`tab ${act ? 'act' : ''}`} onClick={() => navigate(id)}
            aria-label={t.nav[id]} aria-current={act ? 'page' : undefined}>
            <span className="tab-ic">
              <Icon size={20} strokeWidth={act ? 2 : 1.8} />
              {id === 'comments' && badges.comments > 0 && !act ? <i className="dot-badge" /> : null}
            </span>
            <span className="tab-label">{t.nav[id]}</span>
          </button>
        )
      })}
    </nav>
  )
}

export function TopBar({ onMenu }) {
  const { t, navigate, settings } = useApp()
  return (
    <header className="topbar">
      <button type="button" className="icon-btn glass-btn" onClick={onMenu} aria-label="Menu"><Menu size={19} /></button>
      <div className="topbar-brand"><Mark size={20} /><b>Orin</b></div>
      <button type="button" className="topbar-av" onClick={() => navigate('accounts')} aria-label={t.nav.accounts}>
        <Avatar name={settings.name || 'Orin'} size={36} />
      </button>
    </header>
  )
}
