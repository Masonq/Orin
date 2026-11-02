import { useRef, useState } from 'react'
import { Reply, Check } from 'lucide-react'
import { useApp } from '../lib/store'
import { api } from '../lib/api'
import { Avatar, Sheet, Segmented } from '../components/ui'
import { ago } from '../lib/i18n'
import { Loading } from './Summary'

function Row({ c, onReply }) {
  const { t } = useApp()
  const [dx, setDx] = useState(0)
  const start = useRef(null)
  const W = 96
  const onStart = (e) => { const p = e.touches[0]; start.current = { x: p.clientX, y: p.clientY, dx, lock: null } }
  const onMove = (e) => {
    const s = start.current
    if (!s) return
    const p = e.touches[0]
    const mx = p.clientX - s.x, my = p.clientY - s.y
    if (s.lock === null && (Math.abs(mx) > 6 || Math.abs(my) > 6)) s.lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y'
    if (s.lock === 'x') setDx(Math.max(-W - 20, Math.min(0, s.dx + mx)))
  }
  const onEnd = () => { if (!start.current) return; setDx((d) => (d < -W / 2 ? -W : 0)); start.current = null }

  return (
    <li className="cm-row">
      {!c.answered && (
        <button type="button" className="cm-swipe" style={{ opacity: Math.min(1, -dx / 48) }} onClick={() => { setDx(0); onReply(c) }} tabIndex={dx ? 0 : -1} aria-hidden={!dx}>
          <Reply size={18} /><span>{t.c.reply}</span>
        </button>
      )}
      <div className="cm glass" style={{ transform: `translateX(${dx}px)`, transition: start.current ? 'none' : undefined }}
        onTouchStart={c.answered ? undefined : onStart} onTouchMove={c.answered ? undefined : onMove} onTouchEnd={onEnd}>
        <Avatar name={c.author} size={38} />
        <div className="cm-b">
          <div className="cm-top">
            <b>{c.author}</b>
            <span className="cm-time">{ago(t, c.minutes_ago)}</span>
          </div>
          <p className="cm-text">{c.text}</p>
          <p className="cm-reel">{t.c.under} «{c.reel_title}»</p>
          {c.answered && <p className="cm-reply"><Check size={13} strokeWidth={3} /><span>{c.reply}</span></p>}
        </div>
        <div className="cm-side">
          {c.codeword && <span className="cw-badge">{c.codeword}</span>}
          {!c.answered && (
            <button type="button" className="icon-btn cm-reply-btn" onClick={() => onReply(c)} aria-label={t.c.reply}><Reply size={16} /></button>
          )}
        </div>
      </div>
    </li>
  )
}

export default function Comments() {
  const { t, data, refresh, toast } = useApp()
  const [filter, setFilter] = useState('all')
  const [target, setTarget] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  if (!data) return <Loading />

  const list = data.comments.filter((c) => filter === 'all' || (filter === 'unanswered' ? !c.answered : !!c.codeword))
  const unCount = data.comments.filter((c) => !c.answered).length

  const open = (c) => { setTarget(c); setText('') }
  const send = async () => {
    if (!text.trim() || busy) return
    setBusy(true)
    try {
      await api.reply(target.id, text.trim())
      await refresh()
      toast(t.c.sent)
      setTarget(null)
    } catch {
      toast(t.a.netError, 'err')
    } finally { setBusy(false) }
  }

  return (
    <div className="page">
      <header className="page-head">
        <h1 className="display">{t.nav.comments}</h1>
        <p className="page-sub">{unCount} {t.s.unanswered}</p>
      </header>
      <Segmented value={filter} onChange={setFilter} options={[
        { value: 'all', label: t.c.all }, { value: 'unanswered', label: t.c.unanswered }, { value: 'codeword', label: t.c.codeword },
      ]} />
      {list.length === 0 ? (
        <p className="empty glass">{filter === 'unanswered' ? t.c.emptyUn : t.c.emptyCw}</p>
      ) : (
        <ul className="cm-list">{list.map((c) => <Row key={c.id} c={c} onReply={open} />)}</ul>
      )}

      <Sheet open={!!target} onClose={() => setTarget(null)} title={target ? `${t.c.replyTo} ${target.author}` : ''} closeLabel={t.close}>
        {target && (
          <>
            <blockquote className="quote">{target.text}</blockquote>
            <p className="field-l">{t.c.quick}</p>
            <div className="quick">
              {t.c.quickReplies.map((q) => <button type="button" key={q} className="chip" onClick={() => setText(q)}>{q}</button>)}
            </div>
            <textarea className="field" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.c.placeholder} maxLength={2200} />
            <button type="button" className="btn primary wide" disabled={!text.trim() || busy} onClick={send}>{t.c.send}</button>
          </>
        )}
      </Sheet>
    </div>
  )
}
