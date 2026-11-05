<script setup lang="ts">
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import type { WorkerSummary } from '@/interfaces/office'
import { workerState } from '@/utilities/workerState'

defineProps<{ workers: WorkerSummary[]; selected: string | null }>()
const emit = defineEmits<{ select: [slug: string] }>()
</script>

<template>
  <section class="panel p-4" aria-labelledby="roster-title">
    <div class="flex items-baseline gap-2">
      <h2 id="roster-title" class="eyebrow text-ink">Everyone</h2>
      <p class="text-xs text-muted">Live from the worker registry, runs and cards</p>
    </div>
    <ul class="mt-3 flex gap-1 overflow-x-auto pb-1">
      <li v-for="w in workers" :key="w.id">
        <button
          type="button"
          class="flex w-16 flex-col items-center gap-1 rounded-xl py-1.5 transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-series"
          :class="selected === w.slug ? 'bg-accent-soft' : ''"
          :aria-pressed="selected === w.slug"
          @click="emit('select', w.slug)"
        >
          <WorkerAvatar :name="w.displayName" :seed="w.slug" :state="workerState(w)" size="sm" />
          <span class="max-w-full truncate text-[11px] text-ink-2">{{ w.displayName }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>
