<script setup lang="ts">
import ApprovalCard from '@/components/ApprovalCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import type { CardWithWorker } from '@/interfaces/office'

defineProps<{ cards: CardWithWorker[]; now: Date }>()
</script>

<template>
  <section class="panel flex min-h-0 flex-col ring-2 ring-accent/70" aria-labelledby="needs-you-title">
    <div class="flex items-center justify-between px-4 pt-4 pb-2">
      <h2 id="needs-you-title" class="eyebrow text-ink">Needs you · {{ cards.length }}</h2>
      <RouterLink to="/needs-you" class="text-xs font-medium text-muted hover:text-ink">See all</RouterLink>
    </div>
    <div class="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
      <TransitionGroup name="card" tag="div">
        <ApprovalCard v-for="card in cards" :key="card.id" :card="card" :now="now" compact />
      </TransitionGroup>
      <EmptyState v-if="cards.length === 0" class="mx-3 mb-2" title="Nothing needs you" body="Workers will put approvals here." />
    </div>
  </section>
</template>

<style scoped>
.card-leave-active {
  transition: all 0.25s ease;
}
.card-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
