/** Local midnight as ISO, so "today" means the viewer's day, not the server's. */
export function todayStartIso(now = new Date()): string {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

const toDate = (v: string | Date) => (typeof v === 'string' ? new Date(v) : v)

export function formatClock(v: string | Date): string {
  return toDate(v).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function formatDateTime(v: string | Date): string {
  return toDate(v).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function timeAgo(v: string | Date, now = new Date()): string {
  const s = Math.round((now.getTime() - toDate(v).getTime()) / 1000)
  if (s < 0) return timeUntil(v, now)
  if (s < 45) return 'just now'
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.round(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.round(h / 24)}d ago`
}

export function timeUntil(v: string | Date, now = new Date()): string {
  const s = Math.round((toDate(v).getTime() - now.getTime()) / 1000)
  if (s <= 30) return 'now'
  const m = Math.round(s / 60)
  if (m < 60) return `in ${m}m`
  const h = Math.round(m / 60)
  if (h < 24) return `in ${h}h`
  return `in ${Math.round(h / 24)}d`
}

export function formatDuration(start: string | null, end: string | null): string {
  if (!start || !end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  const s = ms / 1000
  if (s < 60) return `${s.toFixed(1)}s`
  return `${Math.floor(s / 60)}m ${Math.round(s % 60)}s`
}

/** Dollars with enough precision for sub-cent model costs. */
export function formatUsd(n: number): string {
  if (n === 0) return '$0.00'
  if (Math.abs(n) < 0.0001) return '<$0.0001'
  if (Math.abs(n) < 0.01) return `$${n.toFixed(4)}`
  return n.toLocaleString([], { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/** 1,284 / 12.9K / 4.2M */
export function formatCompact(n: number): string {
  if (Math.abs(n) < 10_000) return n.toLocaleString()
  return new Intl.NumberFormat([], { notation: 'compact', maximumFractionDigits: 1 }).format(n)
}

export function titleCase(s: string): string {
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
