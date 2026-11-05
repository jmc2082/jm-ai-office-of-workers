// Shapes returned by jm-ai-office-api. Dates arrive as ISO strings.

export type WorkerStatus = 'trial' | 'active' | 'paused' | 'retired'
export type RunTrigger = 'schedule' | 'manual' | 'handoff'
export type RunStatus = 'queued' | 'running' | 'ok' | 'failed' | 'needs_you'
export type CardStatus = 'open' | 'approved' | 'rejected' | 'executed' | 'failed'
export type EventType =
  | 'run_queued'
  | 'run_started'
  | 'run_finished'
  | 'run_failed'
  | 'card_created'
  | 'card_resolved'
  | 'handoff'
  | 'info'

export interface WorkerRef {
  slug: string
  displayName: string
  avatar: string | null
}

export interface Worker {
  id: number
  slug: string
  displayName: string
  description: string
  department: string
  status: WorkerStatus
  avatar: string | null
  schedule: string | null
  enabled: boolean
  modelTaskKey: string | null
  implemented: boolean
  createdAt: string
}

export interface WorkerSummary extends Worker {
  lastRun: { id: number; status: RunStatus; startedAt: string | null; finishedAt: string | null } | null
  openCards: number
  runsToday: number
  costToday: number
  nextRunAt: string | null
}

export interface RunListItem {
  id: number
  workerId: number
  trigger: RunTrigger
  status: RunStatus
  queuedAt: string
  startedAt: string | null
  finishedAt: string | null
  inputTokens: number
  outputTokens: number
  costUsd: number
  model: string | null
  error: string | null
  worker: WorkerRef
}

export interface Card {
  id: number
  runId: number | null
  workerId: number
  kind: string
  title: string
  summary: string
  payload: Record<string, unknown> | null
  status: CardStatus
  createdAt: string
  resolvedAt: string | null
  resolutionNote: string | null
}

export interface CardWithWorker extends Card {
  worker: WorkerRef
}

export interface OfficeEvent {
  id: number
  ts: string
  workerId: number | null
  runId: number | null
  targetWorkerId: number | null
  type: EventType
  message: string
}

export interface RunDetail extends Omit<RunListItem, 'worker'> {
  input: Record<string, unknown> | null
  cacheReadTokens: number
  cacheWriteTokens: number
  log: string
  cards: Card[]
  events: OfficeEvent[]
}

export interface Stats {
  workers: number
  workingNow: number
  needYou: number
  broken: number
  handoffsToday: number
  runsToday: number
  costToday: number
  queue: { active: number; pending: number }
  since: string
}

export interface Replay {
  bucketMs: number
  since: string
  buckets: Array<{ bucket: string; events: number; handoffs: number }>
}

export interface CostRow {
  day: string
  workerId: number
  slug: string
  displayName: string
  runs: number
  costUsd: number
  inputTokens: number
  outputTokens: number
}
