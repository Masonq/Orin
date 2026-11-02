import { useState } from 'react'
import { Check, Smartphone, Info } from 'lucide-react'
import { useApp } from '../lib/store'
import { api } from '../lib/api'
import { Avatar, Segmented, Switch, Sheet } from '../components/ui'
import { fmt } from '../lib/i18n'
import { canSpeak, speak } from '../lib/voice'
import { Loading } from './Summary'

function CameraGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5.5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function Accounts() {
  const { t, data, lang } = useApp()
  const [info, setInfo] = useState(false)
  if (!data) return <Loading />
  const a = data.account
  return (
    <div className="page">
      <header className="page-head"><h1 className="display">{t.acc.title}</h1></header>
      <section className="card glass acc">
        <Avatar name={a.name} size={56} />
        <div className="acc-b">
          <b>@{a.handle}</b>
          <span>{a.name}</span>
          <span className="acc-f">{fmt(a.followers, lang)} {t.acc.followers}</span>
        </div>
        <span className="pill st-draft">{t.acc.demo}</span>
      </section>
      <p className="note"><Info size={16} />{t.acc.now}</p>
      <button type="button" className="btn primary wide ig" onClick={() => setInfo(true)}><CameraGlyph /> {t.acc.connect}</button>
      <Sheet open={info} onClose={() => setInfo(false)} title={t.acc.needTitle} closeLabel={t.close}>
        <ol className="need">{t.acc.need.map((n, i) => <li key={i}><span>{i + 1}</span>{n}</li>)}</ol>
        <p className="note">{t.acc.soon}</p>
        <button type="button" className="btn wide" onClick={() => setInfo(false)}>{t.close}</button>
      </Sheet>
    </div>
  )
}

export function Plans() {
  const { t, settings, set, toast } = useApp()
  return (
    <div className="page">
      <header className="page-head"><h1 className="display">{t.p.title}</h1></header>
      <div className="plans">
        {t.p.plans.map((p) => {
          const cur = settings.plan === p.id
          return (
            <section key={p.id} className={`plan glass ${cur ? 'cur' : ''} ${p.id === 'creator' ? 'feat' : ''}`}>
              <div className="plan-h">
                <h2>{p.name}</h2>
                {cur && <span className="pill st-sent">{t.p.current}</span>}
              </div>
              <p className="plan-price"><b>{p.price}</b>{p.id !== 'start' && <span>{t.p.month}</span>}</p>
              <ul>{p.items.map((x) => <li key={x}><Check size={15} strokeWidth={2.6} />{x}</li>)}</ul>
              {!cur && (
                <button type="button" className={`btn wide ${p.id === 'creator' ? 'primary' : ''}`}
                  onClick={() => (p.id === 'start' ? set({ plan: 'start' }) : toast(t.p.soon, 'info'))}>{t.p.choose}</button>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}

export function Settings({ onLogout }) {
  const { t, settings, set, refresh, toast, lang } = useApp()
  const [name, setName] = useState(settings.name)
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone
  const reset = async () => {
    try { await api.reset(); await refresh(); toast(t.set.resetDone) } catch { toast(t.a.netError, 'err') }
  }
  return (
    <div className="page">
      <header className="page-head"><h1 className="display">{t.set.title}</h1></header>
      <section className="card glass set-list">
        <label className="set-row col" htmlFor="nm">
          <span>{t.set.name}</span>
          <input id="nm" className="field" value={name} maxLength={30}
            onChange={(e) => setName(e.target.value)} onBlur={() => set({ name: name.trim() || settings.name })} />
        </label>
        <div className="set-row col">
          <span>{t.set.lang}</span>
          <Segmented small value={settings.lang} onChange={(v) => set({ lang: v })} options={[{ value: 'ru', label: 'Русский' }, { value: 'en', label: 'English' }]} />
        </div>
        {canSpeak && (
          <div className="set-row">
            <span>{t.set.voice}</span>
            <Switch checked={settings.voice} onChange={(v) => set({ voice: v })} label={t.set.voice} />
          </div>
        )}
        {canSpeak && settings.voice && (
          <div className="set-row col">
            <span>{t.set.rate}</span>
            <Segmented small value={String(settings.rate)} onChange={(v) => { set({ rate: Number(v) }); speak(lang === 'en' ? 'Hello, I am Orin.' : 'Здравствуйте, я Orin.', { lang, rate: Number(v) }) }}
              options={[{ value: '0.85', label: '0.85×' }, { value: '1', label: '1×' }, { value: '1.15', label: '1.15×' }, { value: '1.3', label: '1.3×' }]} />
          </div>
        )}
        <div className="set-row col">
          <span>{t.set.theme}</span>
          <Segmented small value={settings.theme} onChange={(v) => set({ theme: v })} options={[
            { value: 'auto', label: t.set.themeAuto }, { value: 'light', label: t.set.themeLight }, { value: 'dark', label: t.set.themeDark },
          ]} />
        </div>
      </section>
      {isIOS && !standalone && (
        <p className="note"><Smartphone size={16} /><span><b>{t.set.install}.</b> {t.set.installText}</span></p>
      )}
      <section className="card glass set-list">
        <button type="button" className="set-row btn-row" onClick={reset}>{t.set.reset}</button>
        <button type="button" className="set-row btn-row danger-t" onClick={onLogout}>{t.side.logout}</button>
      </section>
      <p className="credits">
        {t.set.version} {__APP_VERSION__}
      </p>
    </div>
  )
}
