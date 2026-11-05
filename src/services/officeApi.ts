import { useApi } from '@/composables/useApi'
import type {
  CardStatus,
  CardWithWorker,
  CostRow,
  Card,
  OfficeEvent,
  Replay,
  RunDetail,
  RunListItem,
  RunStatus,
  Stats,
  Worker,
  WorkerStatus,
  WorkerSummary,
} from '@/interfaces/office'
import { todayStartIso } from '@/utilities/format'

const api = useApi()

export const officeApi = {
  stats: () => api.get<Stats>({ url: '/stats', params: { since: todayStartIso() } }),
  replay: () => api.get<Replay>({ url: '/stats/replay', params: { since: todayStartIso() } }),
  cost: (days: number) => api.get<CostRow[]>({ url: '/stats/cost', params: { days } }),

  workers: () => api.get<WorkerSummary[]>({ url: '/workers', params: { since: todayStartIso() } }),
  worker: (idOrSlug: string) =>
    api.get<WorkerSummary>({ url: `/workers/${encodeURIComponent(idOrSlug)}`, params: { since: todayStartIso() } }),
  updateWorker: (idOrSlug: string, patch: { enabled?: boolean; status?: WorkerStatus }) =>
    api.patch<Worker>({ url: `/workers/${encodeURIComponent(idOrSlug)}`, data: patch }),
  runWorker: (idOrSlug: string, input?: Record<string, unknown>) =>
    api.post<RunListItem>({ url: `/workers/${encodeURIComponent(idOrSlug)}/run`, data: input ? { input } : {} }),

  runs: (params: { workerId?: number; status?: RunStatus; limit?: number; before?: number } = {}) =>
    api.get<RunListItem[]>({ url: '/runs', params }),
  run: (id: number) => api.get<RunDetail>({ url: `/runs/${id}` }),

  cards: (params: { status?: CardStatus; limit?: number; before?: number } = {}) =>
    api.get<CardWithWorker[]>({ url: '/cards', params }),
  approveCard: (id: number, note?: string) => api.post<Card>({ url: `/cards/${id}/approve`, data: note ? { note } : {} }),
  rejectCard: (id: number, note?: string) => api.post<Card>({ url: `/cards/${id}/reject`, data: note ? { note } : {} }),

  events: (params: { limit?: number; before?: number; workerId?: number } = {}) =>
    api.get<OfficeEvent[]>({ url: '/events', params }),
}
