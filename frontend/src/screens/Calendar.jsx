import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageCircle, Send, RotateCw, Clock } from 'lucide-react'
import { useApp } from '../lib/store'
import { api } from '../lib/api'
import { Segmented } from '../components/ui'
import { Loading } from './Summary'

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function Month({ posts, projects, sel, setSel, cur, setCur }) {
  const { t } = useApp()
  const today = iso(new Date())
  const first = new Date(cur.y, cur.m, 1)
  const offset = (first.getDay() + 6) % 7
  const days = new Date(cur.y, cur.m + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(iso(new Date(cur.y, cur.m, d)))
  while (cells.length % 7) cells.push(null)
  const byDay = useMemo(() => {
    const m = {}
    for (const p of posts) (m[p.date] ||= []).push(p)
    return m
  }, [posts])
  const color = (pid) => projects.find((p) => p.id === pid)?.color || 'var(--honey)'
  const shift = (n) => {
    const d = new Date(cur.y, cur.m + n, 1)
    setCur({ y: d.getFullYear(), m: d.getMonth() })
  }
  return (
    <section className="card glass month">
      <div className="month-h">
        <button type="button" className="icon-btn" onClick={() => shift(-1)} aria-label="‹"><ChevronLeft size={18} /></button>
        <h2>{t.k.months[cur.m]} {cur.y}</h2>
        <button type="button" className="icon-btn" onClick={() => shift(1)} aria-label="›"><ChevronRight size={18} /></button>
      </div>
      <div className="month-grid">
        {t.k.days.map((d) => <span key={d} className="month-dow">{d}</span>)}
        {cells.map((c, i) => c ? (
          <button type="button" key={c} className={`day ${c === today ? 'today' : ''} ${c === sel ? 'sel' : ''}`} onClick={() => setSel(c)}
            aria-pressed={c === sel} aria-label={c}>
            <span className="day-n">{Number(c.slice(8))}</span>
            <span className="day-dots">{(byDay[c] || []).slice(0, 3).map((p) => <i key={p.id} style={{ background: color(p.project) }} />)}</span>
          </button>
        ) : <span key={`e${i}`} />)}
      </div>
    </section>
  )
}

function Queue() {
  const { t, data, refresh, toast, lang } = useApp()
  const [busy, setBusy] = useState(null)
  const retry = async (id) => {
    setBusy(id)
    try { await api.retry(id); await refresh(); toast(t.k.retried) } catch { toast(t.a.netError, 'err') } finally { setBusy(null) }
  }
  const time = (ts) => new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts * 1000))
  if (!data.queue.length) return <p className="empty glass">{t.k.emptyQueue}</p>
  return (
    <ul className="queue">
      {data.queue.map((q) => (
        <li key={q.id} className="q-item glass">
          <span className={`q-ic ${q.kind}`}>{q.kind === 'direct' ? <Send size={16} /> : <MessageCircle size={16} />}</span>
          <div className="q-b">
            <p><b>{q.to}</b>{q.rule && <span className="cw-badge">{q.rule}</span>}</p>
            <span className="q-sub">{q.kind === 'direct' ? t.k.toDirect : t.k.toComment}, {time(q.ts)}</span>
            {q.status === 'error' && <span className="q-err">{t.k[q.error] || t.k.error}</span>}
          </div>
          {q.status === 'error' ? (
            <button type="button" className="btn small" onClick={() => retry(q.id)} disabled={busy === q.id}><RotateCw size={14} /> {t.k.retry}</button>
          ) : (
            <span className={`pill st-${q.status}`}>{q.status === 'waiting' && <Clock size={12} />}{t.k[q.status]}</span>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function Calendar() {
  const { t, data, project, setProject, lang } = useApp()
  const now = new Date()
  const [tab, setTab] = useState('calendar')
  const [sel, setSel] = useState(iso(now))
  const [cur, setCur] = useState({ y: now.getFullYear(), m: now.getMonth() })
  if (!data) return <Loading />

  const posts = data.calendar.filter((p) => !project || p.project === project)
  const dayPosts = posts.filter((p) => p.date === sel).sort((a, b) => a.time.localeCompare(b.time))
  const proj = (id) => data.projects.find((p) => p.id === id)
  const selDate = new Date(sel + 'T12:00:00')
  const loc = lang === 'en' ? 'en-US' : 'ru-RU'
  const isToday = sel === iso(now)
  const dm = new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'long' }).format(selDate)
  const full = new Intl.DateTimeFormat(loc, { weekday: 'long', day: 'numeric', month: 'long' }).format(selDate)
  const selLabel = isToday ? `${t.k.today}, ${dm}` : full.charAt(0).toUpperCase() + full.slice(1)

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="display">{tab === 'calendar' ? t.k.calendar : t.k.queue}</h1>
      </header>
      <Segmented value={tab} onChange={setTab} options={[{ value: 'calendar', label: t.k.calendar }, { value: 'queue', label: t.k.queue }]} />
      {tab === 'calendar' ? (
        <>
          <div className="proj-chips" role="list">
            <button type="button" className={`chip ${!project ? 'act' : ''}`} onClick={() => setProject(null)}>{t.k.allProjects}</button>
            {data.projects.map((p) => (
              <button type="button" key={p.id} className={`chip ${project === p.id ? 'act' : ''}`} onClick={() => setProject(project === p.id ? null : p.id)}>
                <i className="chip-dot" style={{ background: p.color }} />{p.label}
              </button>
            ))}
          </div>
          <div className="cal-layout">
            <Month posts={posts} projects={data.projects} sel={sel} setSel={setSel} cur={cur} setCur={setCur} />
            <section className="day-list">
              <h2 className="day-title">{selLabel}</h2>
              {dayPosts.length === 0 ? <p className="empty glass">{t.k.none}</p> : (
                <ul className="posts">
                  {dayPosts.map((p) => (
                    <li key={p.id} className="post glass" style={{ '--c': proj(p.project)?.color }}>
                      <span className="post-time">{p.time}</span>
                      <div className="post-b">
                        <p>{p.title}</p>
                        <span><i style={{ background: proj(p.project)?.color }} />{proj(p.project)?.label}</span>
                      </div>
                      <span className={`pill st-${p.status}`}>{t.k[p.status]}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : <Queue />}
    </div>
  )
}
