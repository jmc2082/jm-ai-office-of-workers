<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'
import { useOfficeStore } from '@/stores/office'
import type { IconName } from '@/utilities/workerState'

const office = useOfficeStore()
const { choice, cycle } = useTheme()

const links: Array<{ to: string; label: string; icon: IconName; exact?: boolean }> = [
  { to: '/', label: 'Office', icon: 'office', exact: true },
  { to: '/needs-you', label: 'Needs you', icon: 'inbox' },
  { to: '/workers', label: 'Workers', icon: 'users' },
  { to: '/runs', label: 'Runs', icon: 'list' },
  { to: '/cost', label: 'Cost', icon: 'chart' },
]

const themeIcon = computed<IconName>(() =>
  choice.value === 'light' ? 'sun' : choice.value === 'dark' ? 'moon' : 'monitor',
)
const needYou = computed(() => office.stats?.needYou ?? 0)
</script>

<template>
  <nav
    aria-label="Main"
    class="flex items-center gap-1 rounded-full bg-rail p-1.5 shadow-lg md:flex-col md:gap-2 md:py-4"
  >
    <RouterLink
      v-for="link in links"
      :key="link.to"
      :to="link.to"
      custom
      v-slot="{ href, navigate, isActive, isExactActive }"
    >
      <a
        :href="href"
        :aria-label="link.label"
        :title="link.label"
        :aria-current="(link.exact ? isExactActive : isActive) ? 'page' : undefined"
        class="relative grid size-11 place-items-center rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:size-12"
        :class="
          (link.exact ? isExactActive : isActive)
            ? 'bg-accent text-accent-ink'
            : 'text-rail-ink hover:bg-white/10 hover:text-white'
        "
        @click="navigate"
      >
        <AppIcon :name="link.icon" :size="20" />
        <span
          v-if="link.to === '/needs-you' && needYou > 0"
          class="absolute -top-0.5 -right-0.5 min-w-5 rounded-full bg-accent px-1 text-center text-[10px] leading-5 font-bold text-accent-ink ring-2 ring-rail"
        >
          {{ needYou > 99 ? '99+' : needYou }}
        </span>
      </a>
    </RouterLink>

    <span class="mx-1 h-6 w-px bg-white/10 md:mx-0 md:my-1 md:h-px md:w-6" aria-hidden="true" />

    <button
      type="button"
      class="grid size-11 place-items-center rounded-full text-rail-ink transition hover:bg-white/10 hover:text-white md:size-12"
      :aria-label="`Theme: ${choice}. Click to change.`"
      :title="`Theme: ${choice}`"
      @click="cycle"
    >
      <AppIcon :name="themeIcon" :size="20" />
    </button>
  </nav>
</template>
