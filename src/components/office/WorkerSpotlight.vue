<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import type { WorkerSummary } from '@/interfaces/office'
import { useOfficeStore } from '@/stores/office'
import { formatUsd, timeAgo, timeUntil, titleCase } from '@/utilities/format'
import { WORKER_STATE, workerState } from '@/utilities/workerState'

const props = defineProps<{ worker: WorkerSummary; now: Date }>()

const office = useOfficeStore()
const state = computed(() => workerState(props.worker))
const message = ref<string | null>(null)
const busy = ref(false)

watch(
  () => props.worker.slug,
  () => (message.value = null),
)

const lastRunText = computed(() => {
  const r = props.worker.lastRun
  if (!r) return 'No runs yet'
  if (r.status === 'running' || r.status === 'queued') return 'Working on a run'
  return r.finishedAt ? `Last run ${timeAgo(r.finishedAt, props.now)}` : 'Last run unfinished'
})

async function runNow() {
  busy.value = true
  try {
    const run = await office.runWorker(props.worker.slug)
    message.value = `Queued run #${run.id}`
  } catch (e) {
    message.value = e instanceof Error ? e.message : 'Could not start a run'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="panel p-4" aria-label="Selected worker">
    <div class="flex items-start gap-3">
      <WorkerAvatar :name="worker.displayName" :seed="worker.slug" size="lg" :state="state" />
      <div class="min-w-0 flex-1">
        <p class="eyebrow">{{ titleCase(worker.department) }}</p>
        <p class="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
          {{ worker.displayName }}
          <span
            v-if="worker.status === 'trial'"
            class="rounded-md bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-ink uppercase"
          >Trial</span>
          <span
            v-if="!worker.implemented"
            class="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted uppercase"
          >Demo</span>
        </p>
        <StatusBadge class="mt-1" :meta="WORKER_STATE[state]" />
      </div>
    </div>

    <p class="mt-3 text-sm text-ink-2">{{ worker.description }}</p>

    <dl class="mt-3 grid grid-cols-2 gap-2 text-xs">
      <div>
        <dt class="text-muted">Activity</dt>
        <dd class="font-medium text-ink">{{ lastRunText }}</dd>
      </div>
      <div>
        <dt class="text-muted">Next run</dt>
        <dd class="font-medium text-ink">
          {{ worker.nextRunAt ? timeUntil(worker.nextRunAt, now) : worker.schedule ? 'Paused' : 'On hand-off' }}
        </dd>
      </div>
      <div>
        <dt class="text-muted">Runs today</dt>
        <dd class="num font-medium text-ink">{{ worker.runsToday }}</dd>
      </div>
      <div>
        <dt class="text-muted">Cost today</dt>
        <dd class="num font-medium text-ink">{{ formatUsd(worker.costToday) }}</dd>
      </div>
    </dl>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <RouterLink :to="`/workers/${worker.slug}`" class="btn-primary">Open profile</RouterLink>
      <button
        type="button"
        class="btn-ghost"
        :disabled="busy || !worker.implemented"
        :title="worker.implemented ? 'Run now' : 'Demo workers have no code to run'"
        @click="runNow"
      >
        <AppIcon name="play" :size="14" />
        Run now
      </button>
    </div>
    <p v-if="message" class="mt-2 text-xs text-ink-2" role="status">{{ message }}</p>
  </section>
</template>
