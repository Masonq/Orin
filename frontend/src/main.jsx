import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/onest'
import '@fontsource/cormorant-garamond/500.css'
import '@fontsource/cormorant-garamond/500-italic.css'
import '@fontsource/cormorant-garamond/600.css'
import './styles.css'
import App from './App'

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)

// Сервис-воркер: новая версия ставится сразу и страница перезагружается сама — чистить кэш руками не нужно
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const hadController = !!navigator.serviceWorker.controller
    navigator.serviceWorker.register(`/sw.js?v=${__APP_VERSION__}`, { updateViaCache: 'none' }).then((reg) => {
      reg.update()
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update() })
    }).catch(() => {})
    let reloaded = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded || !hadController) return
      reloaded = true
      window.location.reload()
    })
  })
}
