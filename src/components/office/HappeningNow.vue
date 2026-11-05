<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
import type { EventType, OfficeEvent } from '@/interfaces/office'
import { formatClock } from '@/utilities/format'

withDefaults(defineProps<{ events: OfficeEvent[]; limit?: number }>(), { limit: 30 })

const DOT: Record<EventType, string> = {
  run_queued: 'bg-idle',
  run_started: 'bg-idle',
  run_finished: 'bg-good',
  run_failed: 'bg-critical',
  card_created: 'bg-warning',
  card_resolved: 'bg-good',
  handoff: 'bg-series',
  info: 'bg-idle',
}
</script>

<template>
  <section class="panel flex min-h-0 flex-col" aria-labelledby="happening-title">
    <h2 id="happening-title" class="eyebrow px-4 pt-4 pb-2">Happening now</h2>
    <ol class="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 pb-4" aria-live="polite" aria-relevant="additions">
      <li v-for="e in events.slice(0, limit)" :key="e.id">
        <p class="num text-[11px] text-muted">{{ formatClock(e.ts) }}</p>
        <p class="flex items-start gap-2 text-sm text-ink">
          <span class="mt-1.5 size-2 shrink-0 rounded-full" :class="DOT[e.type]" aria-hidden="true" />
          <RouterLink v-if="e.runId" :to="`/runs/${e.runId}`" class="hover:underline">{{ e.message }}</RouterLink>
          <span v-else>{{ e.message }}</span>
        </p>
      </li>
    </ol>
    <EmptyState v-if="events.length === 0" class="mx-4 mb-4" title="Quiet so far" />
  </section>
</template>
