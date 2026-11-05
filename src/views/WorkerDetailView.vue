<script setup lang="ts">
import { ref, watch } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import RunsTable from '@/components/RunsTable.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import WorkerControls from '@/components/WorkerControls.vue'
import { useNow } from '@/composables/useNow'
import type { OfficeEvent, RunListItem, WorkerSummary } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'
import { useOfficeStore } from '@/stores/office'
import { formatDateTime, formatUsd, timeUntil, titleCase } from '@/utilities/format'
import { WORKER_STATE, workerState } from '@/utilities/workerState'

const props = defineProps<{ slug: string }>()
const office = useOfficeStore()
const now = useNow()

const worker = ref<WorkerSummary | null>(null)
const runs = ref<RunListItem[]>([])
const events = ref<OfficeEvent[]>([])
const error = ref<string | null>(null)

async function load() {
  try {
    const w = await officeApi.worker(props.slug)
    const [r, e] = await Promise.all([
      officeApi.runs({ workerId: w.id, limit: 25 }),
      officeApi.events({ workerId: w.id, limit: 30 }),
    ])
    worker.value = w
    runs.value = r
    events.value = e
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Could not load worker'
  }
}

watch([() => props.slug, () => office.revision], load, { immediate: true })
</script>

<template>
  <div>
    <RouterLink to="/workers" class="text-sm text-muted hover:text-ink">← Workers</RouterLink>
    <p v-if="error" role="alert" class="mt-4 text-sm text-critical">{{ error }}</p>

    <template v-if="worker">
      <header class="mt-3 mb-6 flex flex-wrap items-start gap-4">
        <WorkerAvatar :name="worker.displayName" :seed="worker.slug" size="lg" :state="workerState(worker)" />
        <div class="min-w-0 flex-1">
          <p class="eyebrow">{{ titleCase(worker.department) }} · {{ worker.slug }}</p>
          <h1 class="text-3xl font-semibold tracking-tight text-ink">{{ worker.displayName }}</h1>
          <p class="mt-1 max-w-2xl text-sm text-ink-2">{{ worker.description }}</p>
        </div>
        <StatusBadge :meta="WORKER_STATE[workerState(worker)]" />
      </header>

      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div class="flex min-w-0 flex-col gap-6">
          <section class="panel p-4">
            <WorkerControls :worker="worker" @changed="load" />
            <p v-if="!worker.implemented" class="mt-3 text-xs text-muted">
              Demo worker from the seed script. It has no code, so it can't run.
            </p>
          </section>

          <section class="panel p-4">
            <h2 class="eyebrow mb-2">Recent runs</h2>
            <RunsTable v-if="runs.length" :runs="runs" hide-worker />
            <EmptyState v-else title="No runs yet" />
          </section>
        </div>

        <aside class="flex flex-col gap-6">
          <section class="panel p-4">
            <h2 class="eyebrow mb-3">Profile</h2>
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between gap-4"><dt class="text-muted">Status</dt><dd class="text-ink">{{ worker.status }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Schedule</dt><dd class="font-mono text-ink">{{ worker.schedule ?? 'hand-off only' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Next run</dt><dd class="text-ink">{{ worker.nextRunAt ? timeUntil(worker.nextRunAt, now) : '—' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Model task</dt><dd class="font-mono text-ink">{{ worker.modelTaskKey ?? '—' }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Runs today</dt><dd class="num text-ink">{{ worker.runsToday }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Cost today</dt><dd class="num text-ink">{{ formatUsd(worker.costToday) }}</dd></div>
              <div class="flex justify-between gap-4"><dt class="text-muted">Open cards</dt><dd class="num text-ink">{{ worker.openCards }}</dd></div>
            </dl>
          </section>

          <section class="panel p-4">
            <h2 class="eyebrow mb-3">Activity</h2>
            <ol class="space-y-3">
              <li v-for="e in events" :key="e.id">
                <p class="text-[11px] text-muted">{{ formatDateTime(e.ts) }}</p>
                <p class="text-sm text-ink">{{ e.message }}</p>
              </li>
            </ol>
            <EmptyState v-if="events.length === 0" title="No activity yet" />
          </section>
        </aside>
      </div>
    </template>
  </div>
</template>
