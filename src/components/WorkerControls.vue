<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import type { WorkerStatus, WorkerSummary } from '@/interfaces/office'
import { useOfficeStore } from '@/stores/office'

const props = defineProps<{ worker: WorkerSummary }>()
const emit = defineEmits<{ changed: [] }>()

const office = useOfficeStore()
const busy = ref(false)
const message = ref<string | null>(null)
const STATUSES: WorkerStatus[] = ['trial', 'active', 'paused', 'retired']

async function run<T>(fn: () => Promise<T>, done: (r: T) => string) {
  busy.value = true
  message.value = null
  try {
    message.value = done(await fn())
    emit('changed')
  } catch (e) {
    message.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}

const toggle = () =>
  run(
    () => office.updateWorker(props.worker.slug, { enabled: !props.worker.enabled }),
    (w) => (w.enabled ? 'Enabled' : 'Disabled'),
  )
const setStatus = (status: WorkerStatus) =>
  run(() => office.updateWorker(props.worker.slug, { status }), () => `Status set to ${status}`)
const runNow = () => run(() => office.runWorker(props.worker.slug), (r) => `Queued run #${r.id}`)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center gap-3">
      <label class="inline-flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          class="peer sr-only"
          :checked="worker.enabled"
          :disabled="busy"
          @change="toggle"
        />
        <span
          class="relative h-5 w-9 rounded-full bg-hairline transition peer-checked:bg-good peer-focus-visible:ring-2 peer-focus-visible:ring-series after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4"
          aria-hidden="true"
        />
        <span class="text-sm font-medium text-ink">{{ worker.enabled ? 'Enabled' : 'Disabled' }}</span>
      </label>

      <label class="inline-flex items-center gap-2 text-sm text-ink-2">
        Status
        <select
          class="field py-1"
          :value="worker.status"
          :disabled="busy"
          @change="setStatus(($event.target as HTMLSelectElement).value as WorkerStatus)"
        >
          <option v-for="s in STATUSES" :key="s" :value="s">{{ s }}</option>
        </select>
      </label>

      <button
        type="button"
        class="btn-primary"
        :disabled="busy || !worker.implemented"
        :title="worker.implemented ? 'Run now' : 'Demo workers have no code to run'"
        @click="runNow"
      >
        <AppIcon name="play" :size="14" /> Run now
      </button>
    </div>
    <p v-if="message" class="mt-2 text-xs text-ink-2" role="status">{{ message }}</p>
  </div>
</template>
