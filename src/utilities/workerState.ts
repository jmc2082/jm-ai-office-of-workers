import type { RunStatus, WorkerSummary } from '@/interfaces/office'

/** What a worker is doing right now, derived from its latest run and open cards. */
export type WorkerState = 'working' | 'needs_you' | 'broken' | 'paused' | 'idle'

export interface StateMeta {
  label: string
  /** Tailwind bg class for the status dot. */
  dot: string
  icon: IconName
}

export type IconName =
  | 'office'
  | 'inbox'
  | 'users'
  | 'list'
  | 'chart'
  | 'sun'
  | 'moon'
  | 'monitor'
  | 'check'
  | 'x'
  | 'alert'
  | 'pause'
  | 'play'
  | 'clock'
  | 'bolt'
  | 'arrow-right'
  | 'circle'

export function workerState(w: WorkerSummary): WorkerState {
  if (w.lastRun && (w.lastRun.status === 'running' || w.lastRun.status === 'queued')) return 'working'
  if (w.openCards > 0) return 'needs_you'
  if (w.lastRun?.status === 'failed') return 'broken'
  if (!w.enabled || w.status === 'paused' || w.status === 'retired') return 'paused'
  return 'idle'
}

export const WORKER_STATE: Record<WorkerState, StateMeta> = {
  working: { label: 'Working', dot: 'bg-series', icon: 'bolt' },
  needs_you: { label: 'Needs you', dot: 'bg-warning', icon: 'alert' },
  broken: { label: 'Broken', dot: 'bg-critical', icon: 'x' },
  paused: { label: 'Paused', dot: 'bg-idle', icon: 'pause' },
  idle: { label: 'Idle', dot: 'bg-good', icon: 'check' },
}

export const RUN_STATUS: Record<RunStatus, StateMeta> = {
  queued: { label: 'Queued', dot: 'bg-idle', icon: 'clock' },
  running: { label: 'Running', dot: 'bg-series', icon: 'bolt' },
  ok: { label: 'OK', dot: 'bg-good', icon: 'check' },
  needs_you: { label: 'Needs you', dot: 'bg-warning', icon: 'alert' },
  failed: { label: 'Failed', dot: 'bg-critical', icon: 'x' },
}

export const DEPARTMENT_ORDER = ['ops', 'quality', 'release', 'inbox', 'support', 'analytics', 'marketing', 'social']

export function sortDepartments(depts: string[]): string[] {
  const rank = (d: string) => {
    const i = DEPARTMENT_ORDER.indexOf(d)
    return i === -1 ? DEPARTMENT_ORDER.length : i
  }
  return [...depts].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
}
