import { ref } from 'vue'
import type { OfficeEvent } from '@/interfaces/office'
import { API_BASE_URL } from '@/plugins/axios'
import { authService } from '@/services/authService'

export type ConnectionState = 'connecting' | 'live' | 'offline'

const RETRY_MIN_MS = 2_000
const RETRY_MAX_MS = 60_000

/**
 * Subscribes to the API's SSE feed. EventSource retries a dropped connection by
 * itself, but gives up for good when the server refuses it (for example a 401 once
 * the access token in the URL has expired). Then we reconnect with a fresh token,
 * backing off up to a minute between tries.
 */
export function useEventStream(onEvent: (e: OfficeEvent) => void) {
  const state = ref<ConnectionState>('connecting')
  let source: EventSource | null = null
  let retryTimer: ReturnType<typeof setTimeout> | undefined
  let retryMs = RETRY_MIN_MS
  let stopped = false

  async function connect() {
    stopped = false
    teardown()
    state.value = 'connecting'
    const token = await authService.getAccessToken()
    if (stopped) return

    const url = new URL(`${API_BASE_URL}/events/stream`)
    if (token) url.searchParams.set('access_token', token)

    const es = new EventSource(url)
    source = es
    es.onopen = () => {
      state.value = 'live'
      retryMs = RETRY_MIN_MS
    }
    es.onerror = () => {
      if (es.readyState !== EventSource.CLOSED) {
        state.value = 'connecting'
        return
      }
      state.value = 'offline'
      scheduleReconnect()
    }
    es.addEventListener('event', (msg) => {
      try {
        onEvent(JSON.parse((msg as MessageEvent<string>).data) as OfficeEvent)
      } catch {
        // ignore malformed messages
      }
    })
  }

  function scheduleReconnect() {
    if (stopped) return
    clearTimeout(retryTimer)
    retryTimer = setTimeout(() => void connect(), retryMs)
    retryMs = Math.min(retryMs * 2, RETRY_MAX_MS)
  }

  function teardown() {
    clearTimeout(retryTimer)
    source?.close()
    source = null
  }

  function close() {
    stopped = true
    teardown()
    retryMs = RETRY_MIN_MS
    state.value = 'offline'
  }

  return { state, connect, close }
}
