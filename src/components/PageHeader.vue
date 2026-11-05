<script setup lang="ts">
defineProps<{ title: string; eyebrow?: string; subtitle?: string }>()
</script>

<template>
  <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <p v-if="eyebrow" class="eyebrow mb-1">{{ eyebrow }}</p>
      <h1 class="text-3xl font-semibold tracking-tight text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-ink-2">{{ subtitle }}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2"><slot /></div>
  </header>
</template>
