<script setup lang="ts">
import { ref, watch } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import RunsTable from '@/components/RunsTable.vue'
import type { RunListItem, RunStatus } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'
import { useOfficeStore } from '@/stores/office'
import { RUN_STATUS } from '@/utilities/workerState'

const PAGE = 50
const office = useOfficeStore()
const runs = ref<RunListItem[]>([])
const status = ref<RunStatus | ''>('')
const workerId = ref<number | ''>('')
const loading = ref(false)
const hasMore = ref(false)

async function load(append = false) {
  loading.value = true
  try {
    const before = append ? runs.value.at(-1)?.id : undefined
    const page = await officeApi.runs({
      status: status.value || undefined,
      workerId: workerId.value || undefined,
      limit: PAGE,
      before,
    })
    runs.value = append ? [...runs.value, ...page] : page
    hasMore.value = page.length === PAGE
  } finally {
    loading.value = false
  }
}

// Filters reload from the top; live events refresh only the first page.
watch([status, workerId], () => load(), { immediate: true })
watch(
  () => office.revision,
  () => {
    if (runs.value.length <= PAGE) load()
  },
)
</script>

<template>
  <div>
    <PageHeader title="Runs" subtitle="Every worker run, newest first.">
      <label class="sr-only" for="f-worker">Worker</label>
      <select id="f-worker" v-model="workerId" class="field">
        <option value="">All workers</option>
        <option v-for="w in office.workers" :key="w.id" :value="w.id">{{ w.displayName }}</option>
      </select>
      <label class="sr-only" for="f-status">Status</label>
      <select id="f-status" v-model="status" class="field">
        <option value="">Any status</option>
        <option v-for="(meta, key) in RUN_STATUS" :key="key" :value="key">{{ meta.label }}</option>
      </select>
    </PageHeader>

    <section class="panel p-4 transition-opacity" :class="loading ? 'opacity-60' : ''">
      <RunsTable v-if="runs.length" :runs="runs" />
      <EmptyState v-else-if="!loading" title="No runs match" />
      <div v-if="hasMore" class="mt-4 text-center">
        <button type="button" class="btn-ghost" :disabled="loading" @click="load(true)">Load more</button>
      </div>
    </section>
  </div>
</template>
