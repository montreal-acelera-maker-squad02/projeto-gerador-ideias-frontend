const HISTORY_REFRESH_EVENT = 'history:refresh'

type HistoryRefreshEventHandler = () => void

export function emitHistoryRefreshRequest() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(HISTORY_REFRESH_EVENT))
}

export function subscribeHistoryRefresh(handler: HistoryRefreshEventHandler) {
  if (typeof window === 'undefined') {
    return () => {}
  }
  window.addEventListener(HISTORY_REFRESH_EVENT, handler)
  return () => window.removeEventListener(HISTORY_REFRESH_EVENT, handler)
}
