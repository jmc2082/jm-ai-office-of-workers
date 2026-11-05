<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import HappeningNow from '@/components/office/HappeningNow.vue'
import NeedsYouPanel from '@/components/office/NeedsYouPanel.vue'
import OfficeFloor from '@/components/office/OfficeFloor.vue'
import ReplayStrip from '@/components/office/ReplayStrip.vue'
import StatsBar from '@/components/office/StatsBar.vue'
import WorkerRoster from '@/components/office/WorkerRoster.vue'
import WorkerSpotlight from '@/components/office/WorkerSpotlight.vue'
import { useNow } from '@/composables/useNow'
import { useOfficeStore } from '@/stores/office'
import { workerState } from '@/utilities/workerState'

const office = useOfficeStore()
const now = useNow(15_000)
const selected = ref<string | null>(null)

// Default the spotlight to whoever most needs attention.
watch(
  () => office.workers,
  (workers) => {
    if (selected.value && workers.some((w) => w.slug === selected.value)) return
    const rank = { broken: 0, needs_you: 1, working: 2, idle: 3, paused: 4 }
    const first = [...workers].sort((a, b) => rank[workerState(a)] - rank[workerState(b)])[0]
    selected.value = first?.slug ?? null
  },
  { immediate: true },
)

const spotlight = computed(() => office.workers.find((w) => w.slug === selected.value) ?? null)
</script>

<template>
  <div class="flex flex-col gap-6">
    <StatsBar :stats="office.stats" :connection="office.connection" :now="now" />

    <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div class="flex min-w-0 flex-col gap-6">
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <OfficeFloor :workers="office.workers" :selected="selected" @select="selected = $event" />
          <WorkerSpotlight v-if="spotlight" :worker="spotlight" :now="now" class="self-start" />
        </div>
        <WorkerRoster :workers="office.workers" :selected="selected" @select="selected = $event" />
      </div>

      <div class="order-first flex flex-col gap-6 xl:order-none xl:sticky xl:top-6 xl:h-[calc(100dvh-3rem)]">
        <NeedsYouPanel :cards="office.openCards" :now="now" class="max-h-[28rem] xl:max-h-none xl:flex-[3]" />
        <HappeningNow :events="office.feed" class="max-h-72 xl:max-h-none xl:flex-[2]" />
        <ReplayStrip :replay="office.replay" :now="now" />
      </div>
    </div>
  </div>
</template>
