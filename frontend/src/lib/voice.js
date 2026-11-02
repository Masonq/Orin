const SR = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null

export const canListen = !!SR
export const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window

let unlocked = false
// iOS разрешает озвучку только после жеста пользователя — «будим» синтез пустой фразой
export function unlockSpeech() {
  if (!canSpeak || unlocked) return
  try {
    const u = new SpeechSynthesisUtterance(' ')
    u.volume = 0
    window.speechSynthesis.speak(u)
    unlocked = true
  } catch { /* нет синтеза */ }
}

function pickVoice(lang) {
  const voices = window.speechSynthesis.getVoices()
  const code = lang === 'en' ? 'en' : 'ru'
  const list = voices.filter((v) => v.lang?.toLowerCase().startsWith(code))
  const prefer = code === 'ru' ? ['Milena', 'Yuri', 'Google'] : ['Samantha', 'Daniel', 'Google US', 'Google']
  for (const p of prefer) {
    const v = list.find((x) => x.name.includes(p))
    if (v) return v
  }
  return list[0] || null
}

export function speak(text, { lang = 'ru', rate = 1, onStart, onBoundary, onEnd } = {}) {
  if (!canSpeak) { onEnd?.(); return () => {} }
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang === 'en' ? 'en-US' : 'ru-RU'
  u.rate = rate
  const v = pickVoice(lang)
  if (v) u.voice = v
  let done = false
  const finish = () => { if (!done) { done = true; onEnd?.() } }
  u.onstart = () => onStart?.()
  u.onboundary = () => onBoundary?.()
  u.onend = finish
  u.onerror = finish
  synth.speak(u)
  // страховка: некоторые браузеры не присылают onend
  const guard = setTimeout(finish, Math.min(60000, 1500 + text.length * 95 / rate))
  return () => { clearTimeout(guard); synth.cancel(); finish() }
}

export function stopSpeaking() {
  if (canSpeak) window.speechSynthesis.cancel()
}

export function listen({ lang = 'ru', onInterim, onFinal, onLevel, onEnd, onError }) {
  if (!SR) { onError?.('unsupported'); return () => {} }
  const rec = new SR()
  rec.lang = lang === 'en' ? 'en-US' : 'ru-RU'
  rec.interimResults = true
  rec.continuous = false
  rec.maxAlternatives = 1
  let finalText = ''
  let gotAny = false
  let stopped = false
  let errored = false
  rec.onaudiostart = () => onLevel?.(0.25)
  rec.onspeechstart = () => onLevel?.(0.6)
  rec.onresult = (e) => {
    gotAny = true
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i]
      if (r.isFinal) finalText += r[0].transcript
      else interim += r[0].transcript
    }
    onLevel?.(0.55 + Math.random() * 0.45)
    onInterim?.((finalText + ' ' + interim).trim())
  }
  rec.onerror = (e) => {
    errored = true
    if (e.error === 'aborted') return
    const map = { 'not-allowed': 'denied', 'service-not-allowed': 'denied', 'no-speech': 'nospeech', 'aborted': 'aborted' }
    onError?.(map[e.error] || 'error')
  }
  rec.onend = () => {
    const t = finalText.trim()
    if (t) onFinal?.(t)
    else if (!gotAny && !stopped && !errored) onError?.('nospeech')
    onEnd?.()
  }
  try { rec.start() } catch { onError?.('error') }
  return () => { stopped = true; try { rec.stop() } catch { /* уже остановлен */ } }
}
