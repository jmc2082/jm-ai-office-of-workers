<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Replay } from '@/interfaces/office'
import { formatClock } from '@/utilities/format'

const props = defineProps<{ replay: Replay | null; now: Date }>()

interface Slot {
  start: Date
  events: number
  handoffs: number
  current: boolean
}

const BUCKET = 10 * 60 * 1000
const MAX_BARS = 48

/** One slot per 10 minutes from the start of the day to now; empty slots are zero. */
const slots = computed<Slot[]>(() => {
  if (!props.replay) return []
  const bucketMs = props.replay.bucketMs || BUCKET
  const start = Math.floor(new Date(props.replay.since).getTime() / bucketMs) * bucketMs
  const nowBucket = Math.floor(props.now.getTime() / bucketMs) * bucketMs
  const byStart = new Map(props.replay.buckets.map((b) => [new Date(b.bucket).getTime(), b]))
  const out: Slot[] = []
  for (let t = start; t <= nowBucket; t += bucketMs) {
    const b = byStart.get(t)
    out.push({ start: new Date(t), events: b?.events ?? 0, handoffs: b?.handoffs ?? 0, current: t === nowBucket })
  }
  // Merge neighbours so bars stay readable (at most MAX_BARS).
  const factor = Math.max(1, Math.ceil(out.length / MAX_BARS))
  if (factor === 1) return out
  const merged: Slot[] = []
  for (let i = 0; i < out.length; i += factor) {
    const group = out.slice(i, i + factor)
    merged.push({
      start: group[0]!.start,
      events: group.reduce((n, g) => n + g.events, 0),
      handoffs: group.reduce((n, g) => n + g.handoffs, 0),
      current: group.some((g) => g.current),
    })
  }
  return merged
})

const slotMinutes = computed(() => {
  const s = slots.value
  return s.length > 1 ? Math.round((s[1]!.start.getTime() - s[0]!.start.getTime()) / 60_000) : 10
})

const max = computed(() => Math.max(1, ...slots.value.map((s) => s.events)))
const totalHandoffs = computed(() => slots.value.reduce((n, s) => n + s.handoffs, 0))
const hovered = ref<number | null>(null)
const active = computed(() => (hovered.value == null ? null : slots.value[hovered.value]))

const label = (s: Slot) =>
  `${formatClock(s.start)}–${formatClock(new Date(s.start.getTime() + slotMinutes.value * 60_000))}: ${s.events} events, ${s.handoffs} hand-offs`
</script>

<template>
  <section class="panel flex flex-col p-4" aria-labelledby="replay-title">
    <div class="flex items-baseline justify-between gap-2">
      <h2 id="replay-title" class="text-sm font-semibold text-ink">Replay today</h2>
      <p class="text-xs text-muted">Events per {{ slotMinutes }} min · {{ totalHandoffs }} hand-offs</p>
    </div>

    <div class="relative mt-3">
      <!-- Tooltip: value leads, label follows -->
      <div
        v-if="active"
        class="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-surface shadow-lg"
        :style="{ left: `${((hovered! + 0.5) / slots.length) * 100}%` }"
      >
        <span class="font-semibold">{{ active.events }} events</span>
        <span class="opacity-75"> · {{ active.handoffs }} hand-offs</span>
        <span class="block opacity-75">{{ formatClock(active.start) }}</span>
      </div>

      <div class="flex h-12 items-end gap-[2px] border-b border-hairline" role="list" :aria-label="`Events per ${slotMinutes} minutes today`">
        <button
          v-for="(s, i) in slots"
          :key="s.start.getTime()"
          type="button"
          role="listitem"
          class="group flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-none"
          :aria-label="label(s)"
          @pointerenter="hovered = i"
          @pointerleave="hovered = null"
          @focus="hovered = i"
          @blur="hovered = null"
        >
          <span
            class="w-full max-w-6 rounded-t-[4px] transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-series"
            :class="s.current ? 'bg-accent' : 'bg-series'"
            :style="{ height: s.events ? `${Math.max(8, (s.events / max) * 100)}%` : '0' }"
          />
        </button>
      </div>
      <div class="mt-1 flex justify-between text-[11px] text-muted">
        <span>{{ slots[0] ? formatClock(slots[0].start) : '' }}</span>
        <span class="font-medium text-ink-2">Now</span>
      </div>
    </div>

    <table class="sr-only">
      <caption>Events per {{ slotMinutes }} minutes today</caption>
      <thead><tr><th>Time</th><th>Events</th><th>Hand-offs</th></tr></thead>
      <tbody>
        <tr v-for="s in slots.filter((x) => x.events > 0)" :key="s.start.getTime()">
          <td>{{ formatClock(s.start) }}</td><td>{{ s.events }}</td><td>{{ s.handoffs }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>
