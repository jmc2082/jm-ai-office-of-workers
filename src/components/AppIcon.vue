<script setup lang="ts">
import type { IconName } from '@/utilities/workerState'

defineProps<{ name: IconName; size?: number }>()

// 24x24 outline paths, stroke-based.
const PATHS: Record<IconName, string[]> = {
  office: ['M3 21h18', 'M5 21V7l7-4 7 4v14', 'M9 21v-5h6v5', 'M9 10h.01M15 10h.01'],
  inbox: ['M4 13h4l1.5 3h5L16 13h4', 'M4 13l2.5-8h11L20 13v6H4z'],
  users: ['M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1', 'M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M22 19v-1a4 4 0 0 0-3-3.87', 'M16 4.13a3 3 0 0 1 0 5.74'],
  list: ['M8 6h13M8 12h13M8 18h13', 'M3.5 6h.01M3.5 12h.01M3.5 18h.01'],
  chart: ['M4 20V10', 'M10 20V4', 'M16 20v-7', 'M22 20H2'],
  sun: ['M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4'],
  moon: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'],
  monitor: ['M3 4h18v12H3z', 'M8 20h8M12 16v4'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  x: ['M6 6l12 12M18 6L6 18'],
  alert: ['M12 8v5', 'M12 16.5h.01', 'M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z'],
  pause: ['M9 5v14M15 5v14'],
  play: ['M7 4.5v15l12-7.5z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  bolt: ['M13 2L4 14h7l-1 8 9-12h-7z'],
  'arrow-right': ['M5 12h14M13 6l6 6-6 6'],
  circle: ['M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'],
  logout: ['M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4', 'M10 16l-4-4 4-4', 'M6 12h10'],
}
</script>

<template>
  <svg
    :width="size ?? 18"
    :height="size ?? 18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, i) in PATHS[name]" :key="i" :d="d" />
  </svg>
</template>
