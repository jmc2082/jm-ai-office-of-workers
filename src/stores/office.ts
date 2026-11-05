import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useEventStream } from '@/composables/useEventStream'
import type { CardWithWorker, OfficeEvent, Replay, Stats, WorkerStatus, WorkerSummary } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'

const FEED_LIMIT = 100
const REFRESH_DEBOUNCE_MS = 400

/**
 * Live state for the Office dashboard. One SSE connection feeds "Happening now";
 * any event triggers a debounced refetch of the derived numbers.
 */
export const useOfficeStore = defineStore('office', () => {
  const stats = ref<Stats | null>(null)
  const workers = ref<WorkerSummary[]>([])
  const openCards = ref<CardWithWorker[]>([])
  const feed = ref<OfficeEvent[]>([])
  const replay = ref<Replay | null>(null)
  const loaded = ref(false)
  const error = ref<string | null>(null)
  /** Bumped on every live event so other views can refetch their own data. */
  const revision = ref(0)

  const workersById = computed(() => new Map(workers.value.map((w) => [w.id, w])))

  const stream = useEventStream((e) => {
    if (!feed.value.some((f) => f.id === e.id)) {
      feed.value = [e, ...feed.value].slice(0, FEED_LIMIT)
    }
    revision.value++
    scheduleRefresh()
  })
  const connection = stream.state

  async function refresh() {
    try {
      const [s, w, c, r] = await Promise.all([
        officeApi.stats(),
        officeApi.workers(),
        officeApi.cards({ status: 'open', limit: 200 }),
        officeApi.replay(),
      ])
      stats.value = s
      workers.value = w
      openCards.value = c
      replay.value = r
      error.value = null
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Could not reach the API'
    } finally {
      loaded.value = true
    }
  }

  let timer: ReturnType<typeof setTimeout> | undefined
  function scheduleRefresh() {
    clearTimeout(timer)
    timer = setTimeout(refresh, REFRESH_DEBOUNCE_MS)
  }

  async function start() {
    await Promise.all([
      refresh(),
      officeApi
        .events({ limit: 40 })
        .then((rows) => (feed.value = rows))
        .catch(() => {}),
    ])
    await stream.connect()
  }

  function stop() {
    clearTimeout(timer)
    stream.close()
  }

  async function approve(id: number, note?: string) {
    return resolveCard(id, () => officeApi.approveCard(id, note))
  }

  async function reject(id: number, note?: string) {
    return resolveCard(id, () => officeApi.rejectCard(id, note))
  }

  /** Optimistically removes the card; puts it back if the call fails. */
  async function resolveCard(id: number, call: () => Promise<unknown>) {
    const before = openCards.value
    openCards.value = before.filter((c) => c.id !== id)
    if (stats.value) stats.value = { ...stats.value, needYou: Math.max(0, stats.value.needYou - 1) }
    try {
      await call()
    } catch (e) {
      openCards.value = before
      throw e
    } finally {
      scheduleRefresh()
    }
  }

  async function runWorker(slug: string, input?: Record<string, unknown>) {
    const run = await officeApi.runWorker(slug, input)
    scheduleRefresh()
    return run
  }

  async function updateWorker(slug: string, patch: { enabled?: boolean; status?: WorkerStatus }) {
    const updated = await officeApi.updateWorker(slug, patch)
    workers.value = workers.value.map((w) => (w.slug === slug ? { ...w, ...updated } : w))
    scheduleRefresh()
    return updated
  }

  return {
    stats,
    workers,
    workersById,
    openCards,
    feed,
    replay,
    loaded,
    error,
    revision,
    connection,
    start,
    stop,
    refresh,
    approve,
    reject,
    runWorker,
    updateWorker,
  }
})
