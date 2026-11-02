async function req(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* пустой ответ */ }
  if (!res.ok) {
    const err = new Error(data?.detail || `http_${res.status}`)
    err.code = typeof data?.detail === 'string' ? data.detail : `http_${res.status}`
    throw err
  }
  return data
}

export const api = {
  state: (lang) => req(`/api/state?lang=${lang}`),
  ask: (q, lang) => req('/api/ask', { method: 'POST', body: { q, lang } }),
  reply: (id, text) => req(`/api/comments/${id}/reply`, { method: 'POST', body: { text } }),
  createRule: (r) => req('/api/rules', { method: 'POST', body: r }),
  updateRule: (id, r) => req(`/api/rules/${id}`, { method: 'PUT', body: r }),
  deleteRule: (id) => req(`/api/rules/${id}`, { method: 'DELETE' }),
  retry: (id) => req(`/api/queue/${id}/retry`, { method: 'POST' }),
  reset: () => req('/api/demo/reset', { method: 'POST' }),
}
