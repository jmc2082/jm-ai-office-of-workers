<script setup lang="ts">
import { computed } from 'vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import type { WorkerSummary } from '@/interfaces/office'
import { titleCase } from '@/utilities/format'
import { sortDepartments, workerState } from '@/utilities/workerState'

const props = defineProps<{ workers: WorkerSummary[]; selected: string | null }>()
const emit = defineEmits<{ select: [slug: string] }>()

/** One room per department, in a stable order. Retired workers have left the building. */
const rooms = computed(() => {
  const byDept = new Map<string, WorkerSummary[]>()
  for (const w of props.workers) {
    if (w.status === 'retired') continue
    byDept.set(w.department, [...(byDept.get(w.department) ?? []), w])
  }
  return sortDepartments([...byDept.keys()]).map((dept) => ({ dept, workers: byDept.get(dept)! }))
})
</script>

<template>
  <section aria-label="Office floor" class="floor panel relative overflow-hidden p-4 sm:p-6">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="room in rooms"
        :key="room.dept"
        class="rounded-2xl bg-surface/80 p-4 ring-1 ring-hairline backdrop-blur-[1px]"
      >
        <h3 class="eyebrow mb-3 flex items-center justify-between">
          <span>{{ titleCase(room.dept) }}</span>
          <span class="num font-medium">{{ room.workers.length }}</span>
        </h3>
        <ul class="flex flex-wrap gap-2">
          <li v-for="w in room.workers" :key="w.id">
            <button
              type="button"
              class="flex w-20 flex-col items-center gap-1.5 rounded-xl px-1 py-2 transition hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-series"
              :class="selected === w.slug ? 'bg-accent-soft ring-1 ring-accent' : ''"
              :aria-pressed="selected === w.slug"
              @click="emit('select', w.slug)"
            >
              <WorkerAvatar :name="w.displayName" :seed="w.slug" :state="workerState(w)" />
              <span class="max-w-full truncate text-xs font-medium text-ink">{{ w.displayName }}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
    <p v-if="rooms.length === 0" class="py-16 text-center text-sm text-muted">The office is empty. Add a worker to get started.</p>
  </section>
</template>

<style scoped>
/* Faint floor-tile grid behind the rooms. */
.floor {
  background-image:
    linear-gradient(var(--office-hairline) 1px, transparent 1px),
    linear-gradient(90deg, var(--office-hairline) 1px, transparent 1px);
  background-size: 32px 32px;
  background-position: -1px -1px;
}
</style>
