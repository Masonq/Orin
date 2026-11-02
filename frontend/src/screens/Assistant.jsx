import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, Square, ArrowUp, Check, ChevronRight } from 'lucide-react'
import Orb from '../components/Orb'
import { useApp } from '../lib/store'
import { api } from '../lib/api'
import { canListen, listen, speak, stopSpeaking, unlockSpeech } from '../lib/voice'
import { greeting } from '../lib/i18n'
import { AssistantPanel } from './Summary'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function useOrbSize() {
  const calc = () => {
    const w = window.innerWidth, h = window.innerHeight
    if (w >= 1024) return Math.min(380, Math.round(h * 0.42))
    return Math.max(220, Math.min(320, Math.round(Math.min(w - 64, h * 0.38))))
  }
  const [s, setS] = useState(calc)
  useEffect(() => {
    const on = () => setS(calc())
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return s
}

export default function Assistant({ desktop }) {
  const { t, lang, settings, navigate, toast, refresh } = useApp()
  const [mode, setMode] = useState('idle')
  const [question, setQuestion] = useState('')
  const [interim, setInterim] = useState('')
  const [steps, setSteps] = useState([])
  const [answer, setAnswer] = useState(null)
  const [text, setText] = useState('')
  const levelRef = useRef(0)
  const targetRef = useRef(0)
  const stopListenRef = useRef(null)
  const stopSpeakRef = useRef(null)
  const runRef = useRef(0)
  const inputRef = useRef(null)
  const size = useOrbSize()
  const modeRef = useRef(mode)
  modeRef.current = mode

  // «живой» уровень для шара: плавно тянется к цели, во время речи — всплески
  useEffect(() => {
    let raf
    const tick = () => {
      const m = modeRef.current
      if (m === 'speak') targetRef.current = Math.max(targetRef.current * 0.93, 0.25 + Math.random() * 0.12)
      else if (m === 'think') targetRef.current = 0.18 + Math.sin(performance.now() / 260) * 0.08
      else if (m === 'listen') targetRef.current = Math.max(0.15, targetRef.current * 0.96)
      else targetRef.current *= 0.9
      levelRef.current += (targetRef.current - levelRef.current) * 0.2
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => () => { stopListenRef.current?.(); stopSpeaking() }, [])

  // после ответа шар на секунду складывается в логотип, потом снова в покой
  const finish = useCallback((run) => {
    setMode('done')
    setTimeout(() => { if (run === runRef.current) setMode((m) => (m === 'done' ? 'idle' : m)) }, 1400)
  }, [])

  const ask = useCallback(async (q) => {
    const query = q.trim()
    if (!query) return
    unlockSpeech()
    stopSpeakRef.current?.()
    const run = ++runRef.current
    setQuestion(query); setInterim(''); setAnswer(null); setSteps([]); setMode('think')
    let res
    try {
      ;[res] = await Promise.all([api.ask(query, lang), sleep(500)])
    } catch {
      if (run !== runRef.current) return
      setMode('idle'); toast(t.a.netError, 'err'); return
    }
    if (run !== runRef.current) return
    for (let i = 0; i < res.steps.length; i++) {
      setSteps(res.steps.slice(0, i + 1).map((s, j) => ({ text: s, done: j < i })))
      await sleep(480)
      if (run !== runRef.current) return
    }
    setSteps(res.steps.map((s) => ({ text: s, done: true })))
    await sleep(res.steps.length ? 260 : 0)
    if (run !== runRef.current) return
    setAnswer(res)
    if (res.intent !== 'fallback') refresh()
    if (settings.voice) {
      setMode('speak')
      stopSpeakRef.current = speak(res.answer, {
        lang, rate: settings.rate,
        onBoundary: () => { targetRef.current = 0.65 + Math.random() * 0.35 },
        onEnd: () => { if (run === runRef.current) finish(run) },
      })
    } else finish(run)
  }, [lang, settings.voice, settings.rate, t, toast, refresh, finish])

  const startListen = useCallback(() => {
    unlockSpeech()
    if (!canListen) { toast(t.a.noVoice, 'info'); inputRef.current?.focus(); return }
    runRef.current++
    stopSpeakRef.current?.()
    setMode('listen'); setInterim(''); targetRef.current = 0.3
    stopListenRef.current = listen({
      lang,
      onLevel: (v) => { targetRef.current = v },
      onInterim: (s) => setInterim(s),
      onFinal: (s) => { stopListenRef.current = null; ask(s) },
      onError: (e) => {
        if (e === 'denied') toast(t.a.micDenied, 'err')
        else if (e === 'nospeech') toast(t.a.noSpeech, 'info')
        else if (e === 'unsupported') toast(t.a.noVoice, 'info')
      },
      onEnd: () => { setMode((m) => (m === 'listen' ? 'idle' : m)) },
    })
  }, [lang, ask, t, toast])

  const onOrb = () => {
    if (mode === 'listen') { stopListenRef.current?.(); return }
    if (mode === 'speak') { stopSpeakRef.current?.(); runRef.current++; setMode('idle'); startListen(); return }
    if (mode === 'think') return
    startListen()
  }

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim()) return
    ask(text)
    setText('')
    inputRef.current?.blur()
  }

  const hint = mode === 'done' ? t.a.hintTap : mode === 'listen' ? t.a.hintListen : mode === 'speak' ? t.a.hintInterrupt : t.a.hintTap
  const hasDialog = question || answer
  const compact = !desktop && !!hasDialog
  const answerRef = useRef(null)
  useEffect(() => {
    if (answer && !desktop) answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [answer, desktop])

  return (
    <div className={`assistant ${desktop ? 'desk' : ''}`}>
      <div className="as-main">
        <div className="as-head">
          <p className="as-greet">{greeting(t)}, {settings.name || 'Orin'}</p>
          <span className={`as-status st-${mode}`}><i />{t.a[mode]}</span>
        </div>

        <div className={`as-orb ${compact ? 'small' : ''}`} style={{ '--os': `${size}px` }}>
          <Orb state={mode} levelRef={levelRef} size={size} onClick={onOrb} label={mode === 'listen' ? t.a.stop : t.a.mic} />
        </div>
        <p className={`as-hint ${compact ? 'small' : ''}`}>{hint}</p>

        {hasDialog && (
          <div className="as-dialog" aria-live="polite">
            {(question || interim) && (
              <p className="as-q"><span>{t.a.you}</span>{mode === 'listen' ? interim : question}</p>
            )}
            {steps.length > 0 && (
              <ul className="as-steps">
                {steps.map((s, i) => (
                  <li key={i} className={s.done ? 'done' : 'run'}>
                    <span className="as-step-ic">{s.done ? <Check size={13} strokeWidth={3} /> : <i />}</span>{s.text}
                  </li>
                ))}
              </ul>
            )}
            {answer && (
              <div className="as-answer glass" ref={answerRef}>
                <p>{answer.answer}</p>
                {answer.go && (
                  <button type="button" className="link-btn" onClick={() => navigate(answer.go)}>
                    {t.a.open}: {t.nav[answer.go]} <ChevronRight size={15} />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {!hasDialog && mode === 'listen' && interim && <p className="as-q solo"><span>{t.a.you}</span>{interim}</p>}

        <div className="as-chips" role="list">
          {t.a.chips.map((c) => (
            <button type="button" role="listitem" key={c} className="chip" onClick={() => ask(c)} disabled={mode === 'think'}>{c}</button>
          ))}
        </div>

        <form className="composer glass" onSubmit={submit}>
          <input ref={inputRef} value={text} onChange={(e) => setText(e.target.value)} placeholder={t.a.placeholder}
            enterKeyHint="send" aria-label={t.a.placeholder} />
          {text.trim() ? (
            <button type="submit" className="comp-btn send" aria-label={t.a.send}><ArrowUp size={19} strokeWidth={2.2} /></button>
          ) : (
            <button type="button" className={`comp-btn mic ${mode === 'listen' ? 'rec' : ''}`} onClick={onOrb}
              aria-label={mode === 'listen' ? t.a.stop : t.a.mic}>
              {mode === 'listen' ? <Square size={15} fill="currentColor" /> : <Mic size={19} />}
            </button>
          )}
        </form>
      </div>
      {desktop && <AssistantPanel />}
    </div>
  )
}
