import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'

const signIn = vi.fn()
const confirm = vi.fn()

vi.mock('@/services/authService', () => ({
  authEnabled: true,
  authService: {
    enabled: true,
    getAccessToken: vi.fn(async () => 'token'),
    currentUser: vi.fn(async () => 'me@example.com'),
    signIn: (...args: unknown[]) => signIn(...args),
    confirm: (...args: unknown[]) => confirm(...args),
    signOut: vi.fn(),
  },
  authErrorMessage: (e: unknown) => (e as Error).message,
}))

import LoginView from '@/views/LoginView.vue'

async function mountLogin(path = '/login') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: LoginView },
      { path: '/', component: { template: '<p>office</p>' } },
      { path: '/runs', component: { template: '<p>runs</p>' } },
    ],
  })
  await router.push(path)
  await router.isReady()
  const wrapper = mount(LoginView, { global: { plugins: [router] } })
  return { wrapper, router }
}

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    signIn.mockReset()
    confirm.mockReset()
  })

  it('signs in and returns to the page that was asked for', async () => {
    signIn.mockResolvedValue('done')
    const { wrapper, router } = await mountLogin('/login?redirect=/runs')

    await wrapper.get('input[name="email"]').setValue('me@example.com')
    await wrapper.get('input[name="password"]').setValue('secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(signIn).toHaveBeenCalledWith('me@example.com', 'secret')
    expect(router.currentRoute.value.path).toBe('/runs')
  })

  it('asks for a new password when Cognito requires one', async () => {
    signIn.mockResolvedValue('new-password')
    confirm.mockResolvedValue('done')
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[name="email"]').setValue('me@example.com')
    await wrapper.get('input[name="password"]').setValue('temporary')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('Choose a new password')

    await wrapper.get('input[name="new-password"]').setValue('A-long-new-password-1')
    await wrapper.get('input[name="new-password-again"]').setValue('A-long-new-password-2')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(wrapper.text()).toContain('do not match')
    expect(confirm).not.toHaveBeenCalled()

    await wrapper.get('input[name="new-password-again"]').setValue('A-long-new-password-1')
    await wrapper.get('form').trigger('submit')
    await flushPromises()
    expect(confirm).toHaveBeenCalledWith('A-long-new-password-1')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('shows the error and stays put when sign-in fails', async () => {
    signIn.mockRejectedValue(new Error('Wrong email or password.'))
    const { wrapper, router } = await mountLogin()

    await wrapper.get('input[name="email"]').setValue('me@example.com')
    await wrapper.get('input[name="password"]').setValue('nope')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain('Wrong email or password.')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('ignores redirects to other sites', async () => {
    signIn.mockResolvedValue('done')
    const { wrapper, router } = await mountLogin('/login?redirect=//evil.example')

    await wrapper.get('input[name="email"]').setValue('me@example.com')
    await wrapper.get('input[name="password"]').setValue('secret')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(router.currentRoute.value.path).toBe('/')
  })
})
