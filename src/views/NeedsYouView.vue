<script setup lang="ts">
import { ref, watch } from 'vue'
import ApprovalCard from '@/components/ApprovalCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import { useNow } from '@/composables/useNow'
import type { CardStatus, CardWithWorker } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'
import { useOfficeStore } from '@/stores/office'
import { formatDateTime, titleCase } from '@/utilities/format'

const office = useOfficeStore()
const now = useNow()
const tab = ref<'open' | 'resolved'>('open')
const resolved = ref<CardWithWorker[]>([])
const loading = ref(false)

const RESOLVED_LABEL: Record<Exclude<CardStatus, 'open'>, { label: string; dot: string }> = {
  approved: { label: 'Approved', dot: 'bg-good' },
  executed: { label: 'Approved · done', dot: 'bg-good' },
  rejected: { label: 'Rejected', dot: 'bg-idle' },
  failed: { label: 'Approved · failed', dot: 'bg-critical' },
}

async function loadResolved() {
  loading.value = true
  try {
    resolved.value = (await officeApi.cards({ limit: 200 })).filter((c) => c.status !== 'open')
  } finally {
    loading.value = false
  }
}

watch(
  [tab, () => office.revision],
  () => {
    if (tab.value === 'resolved') loadResolved()
  },
)
</script>

<template>
  <div class="mx-auto max-w-3xl">
    <PageHeader title="Needs you" subtitle="Anything that sends, publishes, deploys or spends waits here for you.">
      <div class="flex rounded-full bg-surface-2 p-1" role="tablist">
        <button
          v-for="t in ['open', 'resolved'] as const"
          :key="t"
          type="button"
          role="tab"
          :aria-selected="tab === t"
          class="rounded-full px-3 py-1 text-sm font-medium transition"
          :class="tab === t ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'"
          @click="tab = t"
        >
          {{ t === 'open' ? `Open · ${office.openCards.length}` : 'Resolved' }}
        </button>
      </div>
    </PageHeader>

    <section v-if="tab === 'open'" class="panel p-2">
      <ApprovalCard v-for="card in office.openCards" :key="card.id" :card="card" :now="now" />
      <EmptyState v-if="office.openCards.length === 0" title="All clear" body="Nothing is waiting for approval." />
    </section>

    <section v-else class="panel divide-y divide-hairline" :class="loading ? 'opacity-60' : ''">
      <article v-for="c in resolved" :key="c.id" class="flex gap-3 p-4">
        <WorkerAvatar :name="c.worker.displayName" :seed="c.worker.slug" size="sm" />
        <div class="min-w-0 flex-1">
          <p class="text-sm text-ink">
            <span class="font-semibold">{{ c.worker.displayName }}</span>
            <span class="text-ink-2"> · {{ c.title }}</span>
          </p>
          <p class="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted">
            <span class="inline-flex items-center gap-1.5 font-medium text-ink-2">
              <span class="size-2 rounded-full" :class="RESOLVED_LABEL[c.status as Exclude<CardStatus, 'open'>].dot" />
              {{ RESOLVED_LABEL[c.status as Exclude<CardStatus, 'open'>].label }}
            </span>
            <span>{{ titleCase(c.kind) }}</span>
            <span v-if="c.resolvedAt">{{ formatDateTime(c.resolvedAt) }}</span>
          </p>
          <p v-if="c.resolutionNote" class="mt-1 text-sm text-ink-2">{{ c.resolutionNote }}</p>
        </div>
      </article>
      <EmptyState v-if="!loading && resolved.length === 0" class="m-4" title="Nothing resolved yet" />
    </section>
  </div>
</template>
