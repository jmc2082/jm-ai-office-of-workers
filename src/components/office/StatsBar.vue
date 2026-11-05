<script setup lang="ts">
import { computed } from 'vue'
import type { ConnectionState } from '@/composables/useEventStream'
import type { Stats } from '@/interfaces/office'
import { formatClock, formatUsd } from '@/utilities/format'

const props = defineProps<{ stats: Stats | null; connection: ConnectionState; now: Date }>()

const tiles = computed(() => {
  const s = props.stats
  return [
    { label: 'Workers', value: s ? String(s.workers) : '—' },
    { label: 'Working now', value: s ? String(s.workingNow) : '—', dot: s && s.workingNow > 0 ? 'bg-series' : null },
    { label: 'Need you', value: s ? String(s.needYou) : '—', dot: s && s.needYou > 0 ? 'bg-warning' : null },
    { label: 'Broken', value: s ? String(s.broken) : '—', dot: s && s.broken > 0 ? 'bg-critical' : null },
    { label: 'Hand-offs today', value: s ? String(s.handoffsToday) : '—' },
    { label: 'Cost today', value: s ? formatUsd(s.costToday) : '—' },
  ]
})

const live = computed(
  () =>
    ({
      live: { label: 'Live', dot: 'bg-good' },
      connecting: { label: 'Connecting', dot: 'bg-warning' },
      offline: { label: 'Offline', dot: 'bg-critical' },
    })[props.connection],
)
</script>

<template>
  <header class="flex flex-wrap items-end gap-x-10 gap-y-4">
    <div>
      <p class="eyebrow flex items-center gap-1.5" aria-live="polite">
        <span class="size-2 rounded-full" :class="[live.dot, connection === 'live' ? 'animate-pulse' : '']" />
        {{ live.label }} · {{ formatClock(now) }}
      </p>
      <h1 class="mt-1 text-4xl font-semibold tracking-tight text-ink">The office</h1>
    </div>
    <dl class="flex flex-wrap gap-x-8 gap-y-3">
      <div v-for="t in tiles" :key="t.label" class="min-w-16">
        <dd class="text-3xl leading-none font-medium text-ink">{{ t.value }}</dd>
        <dt class="eyebrow mt-1.5 flex items-center gap-1.5">
          <span v-if="t.dot" class="size-1.5 rounded-full" :class="t.dot" aria-hidden="true" />
          {{ t.label }}
        </dt>
      </div>
    </dl>
  </header>
</template>
