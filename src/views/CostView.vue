<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EmptyState from '@/components/EmptyState.vue'
import PageHeader from '@/components/PageHeader.vue'
import type { CostRow } from '@/interfaces/office'
import { officeApi } from '@/services/officeApi'
import { formatCompact, formatUsd } from '@/utilities/format'

const RANGES = [7, 30, 90] as const
const days = ref<(typeof RANGES)[number]>(30)
const rows = ref<CostRow[]>([])
const loading = ref(false)
const showTable = ref(false)

watch(
  days,
  async (d) => {
    loading.value = true
    try {
      rows.value = await officeApi.cost(d)
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

const total = computed(() => rows.value.reduce((n, r) => n + r.costUsd, 0))
const totalRuns = computed(() => rows.value.reduce((n, r) => n + r.runs, 0))

/** One column per UTC day in range, oldest → newest, including empty days. */
const daily = computed(() => {
  const byDay = new Map<string, number>()
  for (const r of rows.value) byDay.set(r.day, (byDay.get(r.day) ?? 0) + r.costUsd)
  const out: Array<{ day: string; cost: number }> = []
  const today = new Date()
  for (let i = days.value - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    const key = d.toISOString().slice(0, 10)
    out.push({ day: key, cost: byDay.get(key) ?? 0 })
  }
  return out
})
const maxDaily = computed(() => Math.max(...daily.value.map((d) => d.cost), 0))
const niceMax = computed(() => {
  const m = maxDaily.value
  if (m <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(m))
  return Math.ceil(m / p) * p
})
const hovered = ref<number | null>(null)

const byWorker = computed(() => {
  const map = new Map<number, { name: string; slug: string; runs: number; cost: number; inT: number; outT: number }>()
  for (const r of rows.value) {
    const cur = map.get(r.workerId) ?? { name: r.displayName, slug: r.slug, runs: 0, cost: 0, inT: 0, outT: 0 }
    cur.runs += r.runs
    cur.cost += r.costUsd
    cur.inT += r.inputTokens
    cur.outT += r.outputTokens
    map.set(r.workerId, cur)
  }
  return [...map.values()].sort((a, b) => b.cost - a.cost)
})
const maxWorker = computed(() => Math.max(...byWorker.value.map((w) => w.cost), 0) || 1)

const dayLabel = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString([], { month: 'short', day: 'numeric', timeZone: 'UTC' })
</script>

<template>
  <div>
    <PageHeader title="Cost" subtitle="Model spend from logged tokens. Days are UTC. Verify pricing in models.config.ts.">
      <div class="flex rounded-full bg-surface-2 p-1" role="radiogroup" aria-label="Date range">
        <button
          v-for="r in RANGES"
          :key="r"
          type="button"
          role="radio"
          :aria-checked="days === r"
          class="rounded-full px-3 py-1 text-sm font-medium transition"
          :class="days === r ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'"
          @click="days = r"
        >
          {{ r }} days
        </button>
      </div>
    </PageHeader>

    <div class="flex flex-col gap-6 transition-opacity" :class="loading ? 'opacity-60' : ''">
      <section class="panel p-5">
        <p class="eyebrow">Total, last {{ days }} days</p>
        <p class="mt-1 text-5xl font-semibold tracking-tight text-ink">{{ formatUsd(total) }}</p>
        <p class="mt-1 text-sm text-ink-2">{{ formatCompact(totalRuns) }} runs across {{ byWorker.length }} workers</p>

        <!-- Daily cost: single series, so no legend; the heading names it. -->
        <div class="mt-6">
          <div class="flex items-baseline justify-between">
            <h2 class="text-sm font-semibold text-ink">Cost per day</h2>
            <button type="button" class="text-xs font-medium text-muted hover:text-ink" @click="showTable = !showTable">
              {{ showTable ? 'Hide table' : 'Show table' }}
            </button>
          </div>
          <div class="relative mt-3 flex gap-2">
            <div class="num flex h-40 flex-col justify-between text-right text-[11px] text-muted" aria-hidden="true">
              <span>{{ formatUsd(niceMax) }}</span>
              <span>{{ formatUsd(niceMax / 2) }}</span>
              <span>$0</span>
            </div>
            <div class="relative flex-1">
              <div class="absolute inset-x-0 top-0 border-t border-hairline" />
              <div class="absolute inset-x-0 top-1/2 border-t border-hairline" />
              <div
                v-if="hovered !== null && daily[hovered]"
                class="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-xs whitespace-nowrap text-surface shadow-lg"
                :style="{ left: `${((hovered + 0.5) / daily.length) * 100}%` }"
              >
                <span class="font-semibold">{{ formatUsd(daily[hovered]!.cost) }}</span>
                <span class="opacity-75"> · {{ dayLabel(daily[hovered]!.day) }}</span>
              </div>
              <div class="relative flex h-40 items-end gap-[2px] border-b border-hairline" role="list" aria-label="Cost per day">
                <button
                  v-for="(d, i) in daily"
                  :key="d.day"
                  type="button"
                  role="listitem"
                  class="group flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-none"
                  :aria-label="`${dayLabel(d.day)}: ${formatUsd(d.cost)}`"
                  @pointerenter="hovered = i"
                  @pointerleave="hovered = null"
                  @focus="hovered = i"
                  @blur="hovered = null"
                >
                  <span
                    class="w-full max-w-6 rounded-t-[4px] bg-series transition-opacity group-hover:opacity-80 group-focus-visible:ring-2 group-focus-visible:ring-series"
                    :style="{ height: d.cost > 0 ? `${Math.max(2, (d.cost / niceMax) * 100)}%` : '0' }"
                  />
                </button>
              </div>
              <div class="mt-1 flex justify-between text-[11px] text-muted">
                <span>{{ daily[0] ? dayLabel(daily[0].day) : '' }}</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          <table v-if="showTable" class="mt-4 w-full text-sm">
            <thead><tr class="eyebrow border-b border-hairline"><th class="py-1.5 text-left">Day (UTC)</th><th class="py-1.5 text-right">Cost</th></tr></thead>
            <tbody>
              <tr v-for="d in [...daily].reverse()" :key="d.day" class="border-b border-hairline/60">
                <td class="py-1.5 text-ink-2">{{ dayLabel(d.day) }}</td>
                <td class="num py-1.5 text-right text-ink">{{ formatUsd(d.cost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="panel p-5">
        <h2 class="text-sm font-semibold text-ink">By worker</h2>
        <p class="text-xs text-muted">Any worker that costs more than the time it saves gets a cheaper model, batching, or retired.</p>
        <div class="mt-4 overflow-x-auto">
          <table v-if="byWorker.length" class="w-full min-w-[560px] text-sm">
            <thead>
              <tr class="eyebrow border-b border-hairline">
                <th class="py-2 pr-3 text-left">Worker</th>
                <th class="w-2/5 py-2 pr-3 text-left">Share</th>
                <th class="py-2 pr-3 text-right">Runs</th>
                <th class="py-2 pr-3 text-right">Tokens in / out</th>
                <th class="py-2 text-right">Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="w in byWorker" :key="w.slug" class="border-b border-hairline/60">
                <td class="py-2 pr-3">
                  <RouterLink :to="`/workers/${w.slug}`" class="font-medium text-ink hover:underline">{{ w.name }}</RouterLink>
                </td>
                <td class="py-2 pr-3">
                  <span class="block h-2 rounded-full bg-series-soft">
                    <span class="block h-2 rounded-full bg-series" :style="{ width: `${(w.cost / maxWorker) * 100}%` }" />
                  </span>
                </td>
                <td class="num py-2 pr-3 text-right text-ink-2">{{ w.runs }}</td>
                <td class="num py-2 pr-3 text-right text-ink-2">{{ formatCompact(w.inT) }} / {{ formatCompact(w.outT) }}</td>
                <td class="num py-2 text-right font-medium text-ink">{{ formatUsd(w.cost) }}</td>
              </tr>
            </tbody>
          </table>
          <EmptyState v-else title="No spend in this range" />
        </div>
      </section>
    </div>
  </div>
</template>
