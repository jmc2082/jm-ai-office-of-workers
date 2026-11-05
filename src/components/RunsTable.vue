<script setup lang="ts">
import { useRouter } from 'vue-router'
import StatusBadge from '@/components/StatusBadge.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import type { RunListItem } from '@/interfaces/office'
import { formatCompact, formatDateTime, formatDuration, formatUsd, titleCase } from '@/utilities/format'
import { RUN_STATUS } from '@/utilities/workerState'

defineProps<{ runs: RunListItem[]; hideWorker?: boolean }>()
const router = useRouter()
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full min-w-[640px] text-left text-sm">
      <thead>
        <tr class="eyebrow border-b border-hairline">
          <th v-if="!hideWorker" class="py-2 pr-3 font-semibold">Worker</th>
          <th class="py-2 pr-3 font-semibold">Run</th>
          <th class="py-2 pr-3 font-semibold">Status</th>
          <th class="py-2 pr-3 font-semibold">Started</th>
          <th class="py-2 pr-3 font-semibold">Duration</th>
          <th class="py-2 pr-3 text-right font-semibold">Tokens in / out</th>
          <th class="py-2 text-right font-semibold">Cost</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="r in runs"
          :key="r.id"
          class="cursor-pointer border-b border-hairline/60 transition hover:bg-surface-2"
          @click="router.push(`/runs/${r.id}`)"
        >
          <td v-if="!hideWorker" class="py-2 pr-3">
            <span class="flex items-center gap-2">
              <WorkerAvatar :name="r.worker.displayName" :seed="r.worker.slug" size="sm" />
              <span class="font-medium text-ink">{{ r.worker.displayName }}</span>
            </span>
          </td>
          <td class="py-2 pr-3">
            <RouterLink :to="`/runs/${r.id}`" class="font-medium text-ink hover:underline" @click.stop>#{{ r.id }}</RouterLink>
            <span class="ml-1.5 text-xs text-muted">{{ titleCase(r.trigger) }}</span>
          </td>
          <td class="py-2 pr-3"><StatusBadge :meta="RUN_STATUS[r.status]" /></td>
          <td class="py-2 pr-3 text-ink-2">{{ formatDateTime(r.startedAt ?? r.queuedAt) }}</td>
          <td class="num py-2 pr-3 text-ink-2">{{ formatDuration(r.startedAt, r.finishedAt) }}</td>
          <td class="num py-2 pr-3 text-right text-ink-2">
            {{ formatCompact(r.inputTokens) }} / {{ formatCompact(r.outputTokens) }}
          </td>
          <td class="num py-2 text-right font-medium text-ink">{{ formatUsd(r.costUsd) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
