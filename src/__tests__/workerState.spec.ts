import { describe, expect, it } from 'vitest'
import type { WorkerSummary } from '@/interfaces/office'
import { sortDepartments, workerState } from '@/utilities/workerState'

const base: WorkerSummary = {
  id: 1,
  slug: 'w',
  displayName: 'W',
  description: '',
  department: 'ops',
  status: 'active',
  avatar: null,
  schedule: null,
  enabled: true,
  modelTaskKey: null,
  implemented: true,
  createdAt: '',
  lastRun: null,
  openCards: 0,
  runsToday: 0,
  costToday: 0,
  nextRunAt: null,
}
const run = (status: NonNullable<WorkerSummary['lastRun']>['status']) => ({
  id: 1,
  status,
  startedAt: null,
  finishedAt: null,
})

describe('workerState', () => {
  it('prefers working over everything else', () => {
    expect(workerState({ ...base, lastRun: run('running'), openCards: 3 })).toBe('working')
  })
  it('flags open cards before a failed run', () => {
    expect(workerState({ ...base, lastRun: run('failed'), openCards: 1 })).toBe('needs_you')
  })
  it('marks a failed last run as broken', () => {
    expect(workerState({ ...base, lastRun: run('failed') })).toBe('broken')
  })
  it('treats disabled or paused workers as paused', () => {
    expect(workerState({ ...base, enabled: false })).toBe('paused')
    expect(workerState({ ...base, status: 'paused' })).toBe('paused')
  })
  it('is idle otherwise', () => {
    expect(workerState({ ...base, lastRun: run('ok') })).toBe('idle')
  })
})

describe('sortDepartments', () => {
  it('uses the known order, then alphabetical', () => {
    expect(sortDepartments(['zeta', 'inbox', 'ops', 'alpha'])).toEqual(['ops', 'inbox', 'alpha', 'zeta'])
  })
})
