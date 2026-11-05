<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/AppSidebar.vue'
import { useOfficeStore } from '@/stores/office'

const office = useOfficeStore()

onMounted(() => office.start())
onUnmounted(() => office.stop())
</script>

<template>
  <div class="min-h-dvh bg-page">
    <div class="mx-auto flex max-w-[1680px] flex-col gap-4 p-4 md:flex-row md:gap-6 md:p-6">
      <aside class="sticky top-4 z-20 flex justify-center md:top-6 md:h-[calc(100dvh-3rem)] md:items-center">
        <AppSidebar />
      </aside>
      <main class="min-w-0 flex-1">
        <div
          v-if="office.error"
          role="alert"
          class="mb-4 flex items-center gap-2 rounded-xl bg-critical/10 px-4 py-2.5 text-sm text-ink ring-1 ring-critical/30"
        >
          <span class="font-semibold">Can't reach the API.</span>
          <span class="text-ink-2">{{ office.error }}. Is jm-ai-office-api running?</span>
        </div>
        <RouterView />
      </main>
    </div>
  </div>
</template>
