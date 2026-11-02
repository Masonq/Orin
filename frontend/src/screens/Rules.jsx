import { useEffect, useState } from 'react'
import { Plus, MessageCircle, Send, Trash2 } from 'lucide-react'
import { useApp } from '../lib/store'
import { api } from '../lib/api'
import { Sheet, Switch, Segmented } from '../components/ui'
import { fmt } from '../lib/i18n'
import { Loading } from './Summary'

const EMPTY = { keyword: '', where: 'both', enabled: true, reply_comment: '', reply_direct: '' }

function Editor({ rule, onClose }) {
  const { t, refresh, toast } = useApp()
  const [f, setF] = useState(EMPTY)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  useEffect(() => {
    if (rule) { setF(rule.id ? { ...EMPTY, ...rule } : EMPTY); setErr(''); setConfirmDel(false) }
  }, [rule])

  const isNew = rule && !rule.id
  const upd = (p) => { setF((x) => ({ ...x, ...p })); setErr('') }
  const showC = f.where !== 'direct', showD = f.where !== 'comment'

  const save = async () => {
    if (!f.keyword.trim()) { setErr(t.r.needKw); return }
    if ((showC ? !f.reply_comment.trim() : true) && (showD ? !f.reply_direct.trim() : true)) { setErr(t.r.needText); return }
    setBusy(true)
    const body = { keyword: f.keyword, where: f.where, enabled: f.enabled, reply_comment: f.reply_comment, reply_direct: f.reply_direct }
    try {
      if (isNew) await api.createRule(body)
      else await api.updateRule(rule.id, body)
      await refresh()
      toast(isNew ? t.r.created : t.r.saved)
      onClose()
    } catch (e) {
      setErr(e.code === 'keyword_exists' ? t.r.exists : t.a.netError)
    } finally { setBusy(false) }
  }

  const del = async () => {
    if (!confirmDel) { setConfirmDel(true); return }
    setBusy(true)
    try { await api.deleteRule(rule.id); await refresh(); toast(t.r.deleted); onClose() } catch { setErr(t.a.netError) } finally { setBusy(false) }
  }

  return (
    <Sheet open={!!rule} onClose={onClose} title={isNew ? t.r.add : t.r.edit} closeLabel={t.close}>
      <label className="field-l" htmlFor="kw">{t.r.keyword}</label>
      <input id="kw" className="field kw-field" value={f.keyword} onChange={(e) => upd({ keyword: e.target.value.toUpperCase() })}
        placeholder="ГАЙД" maxLength={40} autoCapitalize="characters" />
      <p className="field-l">{t.r.where}</p>
      <Segmented small value={f.where} onChange={(v) => upd({ where: v })} options={[
        { value: 'both', label: t.r.both }, { value: 'comment', label: t.r.comment }, { value: 'direct', label: t.r.direct },
      ]} />
      {showC && (
        <>
          <label className="field-l" htmlFor="rc">{t.r.replyComment}</label>
          <textarea id="rc" className="field" rows={2} value={f.reply_comment} onChange={(e) => upd({ reply_comment: e.target.value })} maxLength={2200} />
        </>
      )}
      {showD && (
        <>
          <label className="field-l" htmlFor="rd">{t.r.replyDirect}</label>
          <textarea id="rd" className="field" rows={3} value={f.reply_direct} onChange={(e) => upd({ reply_direct: e.target.value })} maxLength={1000} />
        </>
      )}
      <div className="row-between field-row">
        <span>{f.enabled ? t.r.on : t.r.offState}</span>
        <Switch checked={f.enabled} onChange={(v) => upd({ enabled: v })} label={t.r.on} />
      </div>
      {err && <p className="form-err" role="alert">{err}</p>}
      <button type="button" className="btn primary wide" disabled={busy} onClick={save}>{isNew ? t.r.create : t.r.save}</button>
      {!isNew && (
        <button type="button" className={`btn danger wide ${confirmDel ? 'armed' : ''}`} disabled={busy} onClick={del}>
          <Trash2 size={16} /> {confirmDel ? t.r.delConfirm : t.r.del}
        </button>
      )}
    </Sheet>
  )
}

export default function Rules() {
  const { t, data, lang, refresh, toast } = useApp()
  const [edit, setEdit] = useState(null)
  if (!data) return <Loading />

  const toggle = async (r, v) => {
    try {
      await api.updateRule(r.id, { keyword: r.keyword, where: r.where, enabled: v, reply_comment: r.reply_comment, reply_direct: r.reply_direct })
      await refresh()
    } catch { toast(t.a.netError, 'err') }
  }

  return (
    <div className="page">
      <header className="page-head row-between">
        <div>
          <h1 className="display">{t.nav.rules}</h1>
          <p className="page-sub narrow">{t.r.intro}</p>
        </div>
      </header>
      <button type="button" className="btn primary add-rule" onClick={() => setEdit({})}><Plus size={18} /> {t.r.add}</button>
      {data.rules.length === 0 ? <p className="empty glass">{t.r.empty}</p> : (
        <ul className="rules">
          {data.rules.map((r) => (
            <li key={r.id}>
              <div className={`rule glass ${r.enabled ? '' : 'off'}`} role="button" tabIndex={0}
                onClick={() => setEdit(r)} onKeyDown={(e) => e.key === 'Enter' && setEdit(r)}>
                <div className="rule-top">
                  <span className="cw-badge big">{r.keyword}</span>
                  <Switch checked={r.enabled} onChange={(v) => toggle(r, v)} label={r.keyword} />
                </div>
                <div className="rule-where">
                  {r.where !== 'direct' && <span><MessageCircle size={14} />{t.r.comment}</span>}
                  {r.where !== 'comment' && <span><Send size={14} />{t.r.direct}</span>}
                </div>
                <p className="rule-text">{r.reply_direct || r.reply_comment}</p>
                <p className="rule-fired"><b>{fmt(r.fired, lang)}</b> {t.r.fired}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Editor rule={edit} onClose={() => setEdit(null)} />
    </div>
  )
}
