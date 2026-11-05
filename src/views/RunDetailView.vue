<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import StatusBadge from '@/components/StatusBadge.vue'
import type { RunDetail } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'
import { useOfficeStore } from '@/stores/office'
import { formatCompact, formatDateTime, formatDuration, formatUsd, titleCase } from '@/utilities/format'
import { RUN_STATUS } from '@/utilities/workerState'

const props = defineProps<{ id: string }>()
const office = useOfficeStore()
const run = ref<RunDetail | null>(null)
const error = ref<string | null>(null)

const worker = computed(() => (run.value ? office.workersById.get(run.value.workerId) : undefined))

async function load() {
  try {
    run.value = await officeApi.run(Number(props.id))
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load run'
  }
}

// Refresh on live events only while the run is still moving.
watch(() => props.id, load, { immediate: true })
watch(
  () => office.revision,
  () => {
    if (!run.value || run.value.status === 'queued' || run.value.status === 'running') load()
  },
)
</script>

<template>
  <div>
    <RouterLink to="/runs" class="text-sm text-muted hover:text-ink">← Runs</RouterLink>
    <p v-if="error" role="alert" class="mt-4 text-sm text-critical">{{ error }}</p>

    <template v-if="run">
      <header class="mt-3 mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="eyebrow">
            <RouterLink v-if="worker" :to="`/workers/${worker.slug}`" class="hover:underline">{{ worker.displayName }}</RouterLink>
            · {{ titleCase(run.trigger) }}
          </p>
          <h1 class="text-3xl font-semibold tracking-tight text-ink">Run #{{ run.id }}</h1>
        </div>
        <StatusBadge :meta="RUN_STATUS[run.status]" />
      </header>

      <dl class="panel mb-6 grid grid-cols-2 gap-4 p-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div><dt class="text-muted">Started</dt><dd class="text-ink">{{ run.startedAt ? formatDateTime(run.startedAt) : '—' }}</dd></div>
        <div><dt class="text-muted">Duration</dt><dd class="num text-ink">{{ formatDuration(run.startedAt, run.finishedAt) }}</dd></div>
        <div><dt class="text-muted">Model</dt><dd class="truncate font-mono text-xs text-ink">{{ run.model ?? '—' }}</dd></div>
        <div><dt class="text-muted">Tokens in / out</dt><dd class="num text-ink">{{ formatCompact(run.inputTokens) }} / {{ formatCompact(run.outputTokens) }}</dd></div>
        <div><dt class="text-muted">Cache read / write</dt><dd class="num text-ink">{{ formatCompact(run.cacheReadTokens) }} / {{ formatCompact(run.cacheWriteTokens) }}</dd></div>
        <div><dt class="text-muted">Cost</dt><dd class="num font-semibold text-ink">{{ formatUsd(run.costUsd) }}</dd></div>
      </dl>

      <p v-if="run.error" role="alert" class="mb-6 rounded-xl bg-critical/10 px-4 py-3 text-sm text-ink ring-1 ring-critical/30">
        <span class="font-semibold">Error:</span> {{ run.error }}
      </p>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="flex min-w-0 flex-col gap-6">
          <section class="panel p-4">
            <h2 class="eyebrow mb-2">Log</h2>
            <pre class="max-h-[32rem] overflow-auto rounded-lg bg-surface-2 p-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-2">{{ run.log || 'No log output.' }}</pre>
          </section>
          <section v-if="run.input" class="panel p-4">
            <h2 class="eyebrow mb-2">Input</h2>
            <pre class="overflow-auto rounded-lg bg-surface-2 p-3 text-xs text-ink-2">{{ JSON.stringify(run.input, null, 2) }}</pre>
          </section>
        </div>

        <aside class="flex flex-col gap-6">
          <section v-if="run.cards.length" class="panel p-4">
            <h2 class="eyebrow mb-3">Cards</h2>
            <ul class="space-y-3">
              <li v-for="c in run.cards" :key="c.id" class="text-sm">
                <p class="font-medium text-ink">{{ c.title }}</p>
                <p class="text-xs text-muted">{{ titleCase(c.kind) }} · {{ c.status }}</p>
                <p v-if="c.resolutionNote" class="mt-0.5 text-xs text-ink-2">{{ c.resolutionNote }}</p>
              </li>
            </ul>
          </section>
          <section class="panel p-4">
            <h2 class="eyebrow mb-3">Events</h2>
            <ol class="space-y-3">
              <li v-for="e in run.events" :key="e.id">
                <p class="text-[11px] text-muted">{{ formatDateTime(e.ts) }}</p>
                <p class="text-sm text-ink">{{ e.message }}</p>
              </li>
            </ol>
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
