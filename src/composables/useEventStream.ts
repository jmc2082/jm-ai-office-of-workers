import { ref } from 'vue'
import type { OfficeEvent } from '@/interfaces/office'
import { API_BASE_URL } from '@/plugins/axios'
import { authService } from '@/services/authService'

export type ConnectionState = 'connecting' | 'live' | 'offline'

/**
 * Subscribes to the API's SSE feed. EventSource reconnects on its own after a
 * dropped connection; `state` reflects what the browser reports.
 */
export function useEventStream(onEvent: (e: OfficeEvent) => void) {
  const state = ref<ConnectionState>('connecting')
  let source: EventSource | null = null

  async function connect() {
    close()
    state.value = 'connecting'
    const token = await authService.getAccessToken()
    const url = new URL(`${API_BASE_URL}/events/stream`)
    if (token) url.searchParams.set('access_token', token)

    source = new EventSource(url)
    source.onopen = () => (state.value = 'live')
    source.onerror = () => {
      state.value = source?.readyState === EventSource.CLOSED ? 'offline' : 'connecting'
    }
    source.addEventListener('event', (msg) => {
      try {
        onEvent(JSON.parse((msg as MessageEvent<string>).data) as OfficeEvent)
      } catch {
        // ignore malformed messages
      }
    })
  }

  function close() {
    source?.close()
    source = null
    state.value = 'offline'
  }

  return { state, connect, close }
}
