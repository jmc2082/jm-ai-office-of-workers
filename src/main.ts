import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { authService } from '@/services/authService'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// The API rejected our token (expired session, revoked, or a different user pool).
authService.setUnauthorizedHandler(async () => {
  const route = router.currentRoute.value
  if (route.meta.public) return
  await useAuthStore().signOut()
  await router.replace({ name: 'login', query: { redirect: route.fullPath } })
})

app.mount('#app')
