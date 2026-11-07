<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { useTheme } from '@/composables/useTheme'

useTheme()
const route = useRoute()
</script>

<template>
  <!-- Public pages (sign-in) render on their own; the dashboard shell only mounts when signed in. -->
  <RouterView v-if="route.meta.public" />
  <AppLayout v-else-if="route.matched.length" />
</template>
