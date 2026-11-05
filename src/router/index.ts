import { createRouter, createWebHistory } from 'vue-router'
import OfficeView from '@/views/OfficeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'office', component: OfficeView, meta: { title: 'The office' } },
    { path: '/needs-you', name: 'needs-you', component: () => import('@/views/NeedsYouView.vue'), meta: { title: 'Needs you' } },
    { path: '/workers', name: 'workers', component: () => import('@/views/WorkersView.vue'), meta: { title: 'Workers' } },
    { path: '/workers/:slug', name: 'worker', component: () => import('@/views/WorkerDetailView.vue'), props: true, meta: { title: 'Worker' } },
    { path: '/runs', name: 'runs', component: () => import('@/views/RunsView.vue'), meta: { title: 'Runs' } },
    { path: '/runs/:id', name: 'run', component: () => import('@/views/RunDetailView.vue'), props: true, meta: { title: 'Run' } },
    { path: '/cost', name: 'cost', component: () => import('@/views/CostView.vue'), meta: { title: 'Cost' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} · JM Office` : 'JM Office'
})

export default router
