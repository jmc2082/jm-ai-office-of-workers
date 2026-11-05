<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import type { StateMeta } from '@/utilities/workerState'

/** Status always ships as dot + icon + label, never color alone. */
defineProps<{ meta: StateMeta }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-xs font-medium text-ink"
  >
    <span class="grid size-4 place-items-center rounded-full text-white" :class="meta.dot">
      <AppIcon :name="meta.icon" :size="10" />
    </span>
    {{ meta.label }}
  </span>
</template>
