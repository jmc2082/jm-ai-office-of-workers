<script setup lang="ts">
defineProps<{ title: string; body?: string }>()
</script>

<template>
  <div class="rounded-xl border border-dashed border-hairline px-4 py-8 text-center">
    <p class="text-sm font-medium text-ink">{{ title }}</p>
    <p v-if="body" class="mt-1 text-sm text-muted">{{ body }}</p>
    <slot />
  </div>
</template>
