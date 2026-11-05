import { describe, expect, it } from 'vitest'
import { formatCompact, formatDuration, formatUsd, timeAgo, timeUntil, todayStartIso } from '@/utilities/format'

describe('format', () => {
  const now = new Date('2026-11-04T12:00:00')

  it('uses local midnight for "today"', () => {
    const d = new Date(todayStartIso(now))
    expect([d.getHours(), d.getMinutes(), d.getDate()]).toEqual([0, 0, now.getDate()])
  })

  it('shows sub-cent costs with 4 decimals', () => {
    expect(formatUsd(0)).toBe('$0.00')
    expect(formatUsd(0.000037)).toBe('<$0.0001')
    expect(formatUsd(0.0042)).toBe('$0.0042')
    expect(formatUsd(12.5)).toBe('$12.50')
  })

  it('compacts large numbers only', () => {
    expect(formatCompact(1284)).toBe('1,284')
    expect(formatCompact(12_900)).toBe('12.9K')
  })

  it('formats relative times', () => {
    expect(timeAgo(new Date(now.getTime() - 10_000), now)).toBe('just now')
    expect(timeAgo(new Date(now.getTime() - 5 * 60_000), now)).toBe('5m ago')
    expect(timeUntil(new Date(now.getTime() + 2 * 3_600_000), now)).toBe('in 2h')
  })

  it('formats durations', () => {
    expect(formatDuration('2026-11-04T12:00:00Z', '2026-11-04T12:00:00.250Z')).toBe('250ms')
    expect(formatDuration('2026-11-04T12:00:00Z', '2026-11-04T12:01:05Z')).toBe('1m 5s')
    expect(formatDuration(null, null)).toBe('—')
  })
})
