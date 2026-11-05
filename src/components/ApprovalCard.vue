<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import WorkerAvatar from '@/components/WorkerAvatar.vue'
import type { CardWithWorker } from '@/interfaces/office'
import { useOfficeStore } from '@/stores/office'
import { timeAgo, titleCase } from '@/utilities/format'

const props = defineProps<{ card: CardWithWorker; compact?: boolean; now?: Date }>()

const office = useOfficeStore()
const busy = ref<'approve' | 'reject' | null>(null)
const showNote = ref(false)
const note = ref('')
const error = ref<string | null>(null)

async function act(kind: 'approve' | 'reject') {
  busy.value = kind
  error.value = null
  try {
    const n = note.value.trim() || undefined
    await (kind === 'approve' ? office.approve(props.card.id, n) : office.reject(props.card.id, n))
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Something went wrong'
  } finally {
    busy.value = null
  }
}
</script>

<template>
  <article class="rounded-xl p-3 transition hover:bg-surface-2" :aria-label="card.title">
    <div class="flex gap-3">
      <WorkerAvatar :name="card.worker.displayName" :seed="card.worker.slug" size="sm" />
      <div class="min-w-0 flex-1">
        <p class="text-sm leading-snug text-ink">
          <RouterLink :to="`/workers/${card.worker.slug}`" class="font-semibold hover:underline">
            {{ card.worker.displayName }}
          </RouterLink>
          <span class="text-ink-2"> · {{ card.title }}</span>
        </p>
        <p v-if="card.summary" class="mt-0.5 text-sm text-ink-2" :class="compact ? 'line-clamp-2' : ''">
          {{ card.summary }}
        </p>
        <p class="mt-1 text-xs text-muted">
          {{ titleCase(card.kind) }} · {{ timeAgo(card.createdAt, now) }}
          <RouterLink v-if="card.runId" :to="`/runs/${card.runId}`" class="hover:underline">· run #{{ card.runId }}</RouterLink>
        </p>

        <details v-if="!compact && card.payload" class="mt-2">
          <summary class="cursor-pointer text-xs font-medium text-ink-2">Proposed action</summary>
          <pre class="mt-1 max-h-64 overflow-auto rounded-lg bg-surface-2 p-2 text-xs text-ink-2">{{ JSON.stringify(card.payload, null, 2) }}</pre>
        </details>

        <div v-if="showNote" class="mt-2">
          <label class="sr-only" :for="`note-${card.id}`">Note</label>
          <input
            :id="`note-${card.id}`"
            v-model="note"
            class="field w-full"
            placeholder="Optional note"
            maxlength="2000"
            @keydown.enter="act('approve')"
          />
        </div>

        <p v-if="error" role="alert" class="mt-2 text-xs font-medium text-critical">{{ error }}</p>

        <div class="mt-2 flex flex-wrap items-center gap-2">
          <button type="button" class="btn-primary" :disabled="!!busy" @click="act('approve')">
            <AppIcon name="check" :size="14" />
            {{ busy === 'approve' ? 'Approving…' : 'Approve' }}
          </button>
          <button type="button" class="btn-ghost" :disabled="!!busy" @click="act('reject')">
            {{ busy === 'reject' ? 'Rejecting…' : 'Reject' }}
          </button>
          <button
            v-if="!showNote"
            type="button"
            class="text-xs font-medium text-muted hover:text-ink"
            @click="showNote = true"
          >
            Add note
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
