<script setup lang="ts">
import { computed } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import WorkerControls from '@/components/WorkerControls.vue'
import { useNow } from '@/composables/useNow'
import { useOfficeStore } from '@/stores/office'
import { formatUsd, timeAgo, timeUntil, titleCase } from '@/utilities/format'
import { sortDepartments, WORKER_STATE, workerState } from '@/utilities/workerState'

const office = useOfficeStore()
const now = useNow()

const groups = computed(() => {
  const depts = sortDepartments([...new Set(office.workers.map((w) => w.department))])
  return depts.map((d) => ({ dept: d, workers: office.workers.filter((w) => w.department === d) }))
})
</script>

<template>
  <div>
    <PageHeader
      title="Workers"
      :subtitle="`${office.workers.length} workers. One job each, a schedule, and a model.`"
    />

    <section v-for="g in groups" :key="g.dept" class="mb-8">
      <h2 class="eyebrow mb-3">{{ titleCase(g.dept) }}</h2>
      <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
        <article v-for="w in g.workers" :key="w.id" class="panel flex flex-col p-4">
          <div class="flex items-start gap-3">
            <WorkerAvatar :name="w.displayName" :seed="w.slug" :state="workerState(w)" />
            <div class="min-w-0 flex-1">
              <RouterLink :to="`/workers/${w.slug}`" class="text-base font-semibold text-ink hover:underline">
                {{ w.displayName }}
              </RouterLink>
              <p class="truncate text-xs text-muted">
                {{ w.slug }}<span v-if="!w.implemented"> · demo, no code</span>
              </p>
            </div>
            <StatusBadge :meta="WORKER_STATE[workerState(w)]" />
          </div>
          <p class="mt-3 flex-1 text-sm text-ink-2">{{ w.description }}</p>
          <dl class="mt-3 grid grid-cols-3 gap-2 text-xs">
            <div>
              <dt class="text-muted">Schedule</dt>
              <dd class="truncate font-mono text-ink" :title="w.schedule ?? undefined">{{ w.schedule ?? 'hand-off' }}</dd>
            </div>
            <div>
              <dt class="text-muted">Last / next</dt>
              <dd class="text-ink">
                {{ w.lastRun?.finishedAt ? timeAgo(w.lastRun.finishedAt, now) : '—' }} /
                {{ w.nextRunAt ? timeUntil(w.nextRunAt, now) : '—' }}
              </dd>
            </div>
            <div>
              <dt class="text-muted">Today</dt>
              <dd class="num text-ink">{{ w.runsToday }} runs · {{ formatUsd(w.costToday) }}</dd>
            </div>
          </dl>
          <WorkerControls :worker="w" class="mt-4 border-t border-hairline pt-3" />
        </article>
      </div>
    </section>
  </div>
</template>
