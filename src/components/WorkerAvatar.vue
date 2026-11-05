<script setup lang="ts">
import { computed } from 'vue'
import { avatarTint, initials } from '@/utilities/avatar'
import { WORKER_STATE, type WorkerState } from '@/utilities/workerState'

const props = defineProps<{
  name: string
  seed: string
  size?: 'sm' | 'md' | 'lg'
  state?: WorkerState
}>()

const sizeClass = computed(
  () => ({ sm: 'size-8 text-[11px]', md: 'size-11 text-sm', lg: 'size-16 text-lg' })[props.size ?? 'md'],
)
const dotClass = computed(() => ({ sm: 'size-2.5', md: 'size-3', lg: 'size-4' })[props.size ?? 'md'])
const meta = computed(() => (props.state ? WORKER_STATE[props.state] : null))
</script>

<template>
  <span class="relative inline-grid shrink-0">
    <span
      class="grid place-items-center rounded-full font-semibold text-[#0b0b0b] ring-2 ring-surface"
      :class="sizeClass"
      :style="{ background: avatarTint(seed) }"
      aria-hidden="true"
    >
      {{ initials(name) }}
    </span>
    <span
      v-if="meta"
      class="absolute right-0 bottom-0 rounded-full ring-2 ring-surface"
      :class="[dotClass, meta.dot, state === 'working' ? 'animate-pulse' : '']"
      :title="meta.label"
    />
    <span v-if="meta" class="sr-only">{{ meta.label }}</span>
  </span>
</template>
