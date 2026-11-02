import { Film, MessageCircle, Reply, Send, Eye, Bookmark, Sparkles, Play } from 'lucide-react'
import { useApp } from '../lib/store'
import { Counter, Sparkline, Ring, Thumb } from '../components/ui'
import { fmt, compact, greeting } from '../lib/i18n'

function weekdays(lang) {
  const out = []
  const d = new Date()
  for (let i = 6; i >= 0; i--) {
    const x = new Date(d); x.setDate(d.getDate() - i)
    out.push(new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', { weekday: 'short' }).format(x).replace('.', '').replace(/^./, (c) => c.toUpperCase()))
  }
  return out
}

function Kpi({ icon: Icon, label, value, sub, data, color }) {
  const { lang } = useApp()
  return (
    <div className="kpi glass">
      <div className="kpi-top"><span className="kpi-ic" style={{ color }}><Icon size={16} strokeWidth={2} /></span><span className="kpi-l">{label}</span></div>
      <div className="kpi-v"><Counter value={value} format={(n) => fmt(n, lang)} />{sub && <small>{sub}</small>}</div>
      <Sparkline data={data} color={color} />
    </div>
  )
}

function TopReel({ s, compactMode }) {
  const { t, lang } = useApp()
  const top = s.top
  return (
    <section className={`card glass top-reel ${compactMode ? 'cmp' : ''}`}>
      <h2 className="card-h">{t.s.top}</h2>
      <div className="top-body">
        <div className="top-thumb-w"><Thumb hue={top.hue} title="" className="top-thumb" /><span className="play"><Play size={16} fill="currentColor" /></span></div>
        <div className="top-info">
          <p className="top-title">{top.title}</p>
          <div className="top-stats">
            <span><Eye size={14} /><b><Counter value={top.views} format={(n) => compact(n, lang)} /></b></span>
            <span><MessageCircle size={14} /><b><Counter value={top.comments} format={(n) => fmt(n, lang)} /></b></span>
            <span><Bookmark size={14} /><b><Counter value={top.saves} format={(n) => compact(n, lang)} /></b></span>
          </div>
          <div className="top-rate">
            <Ring value={top.rate} size={58} stroke={6}><b>{Math.round(top.rate * 100)}%</b></Ring>
            <p><b>{fmt(top.replied, lang)}</b> {t.s.of} {fmt(top.comments, lang)}<br /><span>{t.s.rate}</span></p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Topics({ s }) {
  const { t } = useApp()
  const max = Math.max(...s.topics.map((x) => x.share))
  return (
    <section className="card glass">
      <h2 className="card-h">{t.s.topics}</h2>
      <ul className="topics">
        {s.topics.map((x, i) => (
          <li key={x.key}>
            <div className="topic-row"><span>{x.label}</span><b>{Math.round(x.share * 100)}%</b></div>
            <div className="bar"><span style={{ '--w': x.share / max, '--d': `${i * 90}ms` }} /></div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Codewords({ s }) {
  const { t, lang, navigate } = useApp()
  return (
    <section className="card glass">
      <h2 className="card-h">{t.s.codewords}</h2>
      <div className="cw-list">
        {s.codewords.map((c) => (
          <button type="button" key={c.word} className={`cw ${c.enabled ? '' : 'off'}`} onClick={() => navigate('rules')}>
            <span className="cw-w">{c.word}</span>
            <span className="cw-n">{c.enabled ? fmt(c.count, lang) : t.s.off}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

function Tip({ s }) {
  const { t } = useApp()
  return (
    <section className="card glass tip">
      <h2 className="card-h"><Sparkles size={15} /> {t.s.tip}</h2>
      <p className="tip-t">{s.tip}</p>
    </section>
  )
}

function Reach({ s }) {
  const { t, lang } = useApp()
  const max = Math.max(...s.reach)
  const days = weekdays(lang)
  return (
    <section className="card glass">
      <div className="card-h-row">
        <h2 className="card-h">{t.s.reach}</h2>
        <span className="card-meta">{compact(s.reach.reduce((a, b) => a + b, 0), lang)}</span>
      </div>
      <div className="bars">
        {s.reach.map((v, i) => (
          <div key={i} className={`bars-col ${v === max ? 'peak' : ''}`}>
            <span className="bars-v">{v === max ? compact(v, lang) : '\u00a0'}</span>
            <div className="bars-track"><span style={{ '--h': v / max, '--d': `${i * 60}ms` }} /></div>
            <span className="bars-d">{days[i]}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ReelsList({ s }) {
  const { t, lang } = useApp()
  return (
    <section className="card glass">
      <h2 className="card-h">{t.s.allReels}</h2>
      <ul className="reels">
        {s.reels.map((r) => (
          <li key={r.id}>
            <Thumb hue={r.hue} title="" className="reel-thumb" />
            <div className="reel-t">
              <p>{r.title}</p>
              <span className="reel-m"><span><Play size={11} fill="currentColor" />{compact(r.views, lang)}</span><span><MessageCircle size={11} />{fmt(r.comments, lang)}</span></span>
            </div>
            <span className="reel-rate">{Math.round((r.replied / r.comments) * 100)}%</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function KpiGrid({ s }) {
  const { t, lang } = useApp()
  const k = s.kpi
  return (
    <div className="kpi-grid">
      <Kpi icon={Film} label={t.s.reels} value={k.reels} data={s.reach} color="var(--honey)" />
      <Kpi icon={MessageCircle} label={t.s.comments} value={k.comments} data={s.spark.comments} color="var(--aqua)" sub={k.unanswered ? `${k.unanswered} ${t.s.unanswered}` : null} />
      <Kpi icon={Reply} label={t.s.replied} value={k.replied} data={s.spark.replied} color="var(--mint)" />
      <Kpi icon={Send} label={t.s.dm} value={k.dm_sent} data={s.spark.dm} color="var(--violet)" sub={`${t.s.of} ${fmt(k.dm_total, lang)}`} />
    </div>
  )
}

export function Loading() {
  const { t, error, refresh } = useApp()
  if (error) {
    return (
      <div className="state-msg glass">
        <p>{t.a.netError}</p>
        <button type="button" className="btn" onClick={refresh}>{t.retry}</button>
      </div>
    )
  }
  return <div className="state-msg"><span className="spinner" aria-label={t.loading} /></div>
}

export default function Summary() {
  const { t, data, settings, lang } = useApp()
  if (!data) return <Loading />
  const s = data.summary
  const date = new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return (
    <div className="page summary">
      <header className="page-head">
        <h1 className="display">{greeting(t)}, {settings.name || 'Orin'}</h1>
        <p className="page-sub">{date.charAt(0).toUpperCase() + date.slice(1)}</p>
      </header>
      <KpiGrid s={s} />
      <div className="sum-grid">
        <TopReel s={s} />
        <Tip s={s} />
        <Reach s={s} />
        <Topics s={s} />
        <Codewords s={s} />
        <ReelsList s={s} />
      </div>
    </div>
  )
}

export function AssistantPanel() {
  const { t, data } = useApp()
  if (!data) return <aside className="as-panel"><Loading /></aside>
  const s = data.summary
  return (
    <aside className="as-panel">
      <header className="as-panel-h">
        <h2>{t.a.panelTitle}</h2>
        <p>{t.a.panelSub}</p>
      </header>
      <KpiGrid s={s} />
      <TopReel s={s} compactMode />
      <Codewords s={s} />
      <Tip s={s} />
    </aside>
  )
}
